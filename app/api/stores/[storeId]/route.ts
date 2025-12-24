import { NextResponse } from "next/server";
import { ai } from "@/lib/gemini";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const storeName = `fileSearchStores/${storeId}`;
    
    const store = await ai.fileSearchStores.get({ name: storeName });
    
    return NextResponse.json({ store });
  } catch (error) {
    console.error("Error getting store:", error);
    return NextResponse.json(
      { error: "Failed to get store" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;
    const storeName = `fileSearchStores/${storeId}`;
    
    await ai.fileSearchStores.delete({
      name: storeName,
      config: { force: true },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting store:", error);
    return NextResponse.json(
      { error: "Failed to delete store" },
      { status: 500 }
    );
  }
}



