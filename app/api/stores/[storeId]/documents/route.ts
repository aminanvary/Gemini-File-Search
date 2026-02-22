import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";
import { MIME_TYPE_MAP } from "@/lib/mime-types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const storeName = `fileSearchStores/${storeId}`;
    
    const documents: Array<{
      name: string;
      displayName?: string;
      createTime?: string;
      updateTime?: string;
    }> = [];
    
    const pager = await ai.fileSearchStores.documents.list({
      parent: storeName,
    });
    
    for await (const doc of pager) {
      documents.push({
        name: doc.name || "",
        displayName: doc.displayName,
        createTime: doc.createTime,
        updateTime: doc.updateTime,
      });
    }
    
    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error listing documents:", error);
    return NextResponse.json(
      { error: "Failed to list documents" },
      { status: 500 }
    );
  }
}

// Helper function to import a single file
async function importSingleFile(
  storeName: string,
  fileName: string
): Promise<{ success: boolean; error?: string; operation?: any }> {
  let fileNameForImport = fileName;

  // Check file state before import
  let fileInfo = null;
  try {
    fileInfo = await ai.files.get({ name: fileNameForImport });
  } catch (fileError) {
    // File might not exist
    return { success: false, error: `File not found: ${fileNameForImport}` };
  }

  // Verify store exists first
  try {
    await ai.fileSearchStores.get({ name: storeName });
  } catch (storeError) {
    return { success: false, error: `Store not found: ${storeName}` };
  }

  // Check if file has unsupported MIME type - try to fix it automatically
  if (fileInfo?.mimeType === "application/octet-stream" || !fileInfo?.mimeType) {
    // Try to infer correct MIME type from file name and download/re-upload the file
    const displayName = fileInfo?.displayName || fileNameForImport;
    const extension = displayName.split('.').pop()?.toLowerCase();
    
    if (extension && MIME_TYPE_MAP[extension] && fileInfo?.uri) {
      try {
        // Download the file from Gemini
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return {
            success: false,
            error: "GEMINI_API_KEY environment variable is not set. Cannot download file from Gemini.",
          };
        }
        const downloadResponse = await fetch(fileInfo.uri, {
          headers: {
            "x-goog-api-key": apiKey,
          },
        });
        
        if (downloadResponse.ok) {
          const fileBuffer = await downloadResponse.arrayBuffer();
          const blob = new Blob([fileBuffer], { type: MIME_TYPE_MAP[extension] });
          
          // Re-upload with correct MIME type
          const newFile = await ai.files.upload({
            file: blob,
            config: {
              displayName: displayName,
              mimeType: MIME_TYPE_MAP[extension],
            },
          });
          
          // Save old file name before updating
          const oldFileName = fileNameForImport;
          
          // Use the new file for import
          fileNameForImport = newFile.name || fileNameForImport;
          
          // Re-fetch file info to ensure we have the latest state
          try {
            fileInfo = await ai.files.get({ name: fileNameForImport });
          } catch (refetchError) {
            // Use newFile data if refetch fails
            fileInfo = {
              ...fileInfo,
              name: newFile.name,
              mimeType: MIME_TYPE_MAP[extension],
              uri: newFile.uri,
              state: newFile.state,
            };
          }
          
          // Delete old file now that we're using the new one
          try {
            await ai.files.delete({ name: oldFileName });
          } catch (deleteError) {
            // Continue even if delete fails - old file will remain but new one is used
          }
        } else {
          return { success: false, error: `Failed to download file: ${downloadResponse.status}` };
        }
      } catch (fixError) {
        return {
          success: false,
          error: `File has unsupported MIME type (${fileInfo?.mimeType || 'missing'}). Automatic fix failed.`,
        };
      }
    } else {
      return {
        success: false,
        error: `File has unsupported MIME type (${fileInfo?.mimeType || 'missing'}). Could not determine correct MIME type from file extension.`,
      };
    }
  }
  
  // Import the file into the store using the SDK
  let operation = await ai.fileSearchStores.importFile({
    fileSearchStoreName: storeName,
    fileName: fileNameForImport,
  });
  
  // Poll until done (max 60 seconds)
  const startTime = Date.now();
  const timeout = 60000;
  
  while (!operation.done && Date.now() - startTime < timeout) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    operation = await ai.operations.get({ operation });
  }
  
  if (!operation.done) {
    return { success: false, error: "Import operation timed out", operation };
  }
  
  return { success: true, operation };
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const storeName = `fileSearchStores/${storeId}`;
    const body = await request.json();
    const { fileName, fileNames } = body;
    
    // Support both single file (backward compatible) and bulk imports
    if (fileNames && Array.isArray(fileNames)) {
      // Bulk import
      if (fileNames.length === 0) {
        return NextResponse.json(
          { error: "fileNames array cannot be empty" },
          { status: 400 }
        );
      }

      // Import all files in parallel
      const results = await Promise.allSettled(
        fileNames.map((fn: string) => importSingleFile(storeName, fn))
      );

      const importResults = results.map((result, index) => {
        if (result.status === "fulfilled") {
          return {
            fileName: fileNames[index],
            success: result.value.success,
            error: result.value.error,
          };
        } else {
          return {
            fileName: fileNames[index],
            success: false,
            error: result.reason?.message || "Unknown error",
          };
        }
      });

      const successCount = importResults.filter((r) => r.success).length;
      const failCount = importResults.filter((r) => !r.success).length;

      return NextResponse.json({
        success: failCount === 0,
        results: importResults,
        summary: {
          total: fileNames.length,
          succeeded: successCount,
          failed: failCount,
        },
      });
    } else if (fileName) {
      // Single file import (backward compatible)
      const result = await importSingleFile(storeName, fileName);
      
      if (!result.success) {
        return NextResponse.json(
          { error: result.error || "Failed to import file" },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, operation: result.operation });
    } else {
      return NextResponse.json(
        { error: "Either fileName or fileNames array is required" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error importing file(s):", error);
    return NextResponse.json(
      { error: "Failed to import file(s)" },
      { status: 500 }
    );
  }
}



