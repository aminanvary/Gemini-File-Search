import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const fileName = `files/${fileId}`;
    
    const file = await ai.files.get({ name: fileName });
    
    return NextResponse.json({ file });
  } catch (error) {
    console.error("Error getting file:", error);
    return NextResponse.json(
      { error: "Failed to get file" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const fileName = `files/${fileId}`;
    
    await ai.files.delete({ name: fileName });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting file:", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}



