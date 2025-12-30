import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

function handleError(error: unknown, defaultMessage: string) {
  console.error(defaultMessage, error);
  
  const message = error instanceof Error ? error.message : defaultMessage;
  const isApiKeyError = message.includes("GEMINI_API_KEY");
  
  return NextResponse.json(
    { error: message },
    { status: isApiKeyError ? 401 : 500 }
  );
}

export async function GET() {
  try {
    const files: Array<{
      name: string;
      displayName?: string;
      mimeType?: string;
      sizeBytes?: string;
      createTime?: string;
      updateTime?: string;
      uri?: string;
      state?: string;
    }> = [];
    
    const pager = await ai.files.list({ config: { pageSize: 20 } });
    
    for await (const file of pager) {
      files.push({
        name: file.name || "",
        displayName: file.displayName,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        createTime: file.createTime,
        updateTime: file.updateTime,
        uri: file.uri,
        state: file.state,
      });
    }
    
    return NextResponse.json({ files });
  } catch (error) {
    return handleError(error, "Failed to list files");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }
    
    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Use file.name which may contain folder structure (e.g., "folder/subfolder/file.txt")
    // The frontend preserves the folder structure in the file name
    const displayName = file.name;
    
    // Detect MIME type from file extension if browser didn't provide one or provided generic type
    let mimeType = file.type;
    if (!mimeType || mimeType === "application/octet-stream") {
      // Extract extension from the actual filename (last part after /)
      const actualFileName = displayName.split('/').pop() || displayName;
      const extension = actualFileName.split('.').pop()?.toLowerCase();
      const mimeTypeMap: Record<string, string> = {
        'md': 'text/markdown',
        'txt': 'text/plain',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'csv': 'text/csv',
        'json': 'application/json',
        'html': 'text/html',
        'htm': 'text/html',
        'rtf': 'application/rtf',
      };
      if (extension && mimeTypeMap[extension]) {
        mimeType = mimeTypeMap[extension];
      }
    }
    
    // Create a Blob from the buffer for the SDK
    const blob = new Blob([buffer], { type: mimeType });
    
    const uploadedFile = await ai.files.upload({
      file: blob,
      config: {
        displayName: displayName,
        mimeType: mimeType,
      },
    });
    
    return NextResponse.json({ file: uploadedFile });
  } catch (error) {
    return handleError(error, "Failed to upload file");
  }
}
