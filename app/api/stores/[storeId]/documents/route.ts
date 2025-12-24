import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const storeName = `fileSearchStores/${storeId}`;
    const { fileName } = await request.json();
    
    if (!fileName) {
      return NextResponse.json(
        { error: "fileName is required" },
        { status: 400 }
      );
    }
    
    // Import the file into the store
    let operation = await ai.fileSearchStores.importFile({
      fileSearchStoreName: storeName,
      fileName: fileName,
    });
    
    // Poll until done (max 60 seconds)
    const startTime = Date.now();
    const timeout = 60000;
    
    while (!operation.done && Date.now() - startTime < timeout) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      operation = await ai.operations.get({ operation });
    }
    
    if (!operation.done) {
      return NextResponse.json(
        { error: "Import operation timed out", operationName: operation.name },
        { status: 202 }
      );
    }
    
    return NextResponse.json({ success: true, operation });
  } catch (error) {
    console.error("Error importing file:", error);
    return NextResponse.json(
      { error: "Failed to import file" },
      { status: 500 }
    );
  }
}



