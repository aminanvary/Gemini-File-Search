import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string; documentId: string }> }
) {
  try {
    const { storeId, documentId } = await params;
    const documentName = `fileSearchStores/${storeId}/documents/${documentId}`;
    
    await ai.fileSearchStores.documents.delete({
      name: documentName,
      config: { force: true },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}



