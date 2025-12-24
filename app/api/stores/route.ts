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
    const stores: Array<{
      name: string;
      displayName?: string;
      createTime?: string;
      updateTime?: string;
    }> = [];
    
    const pager = await ai.fileSearchStores.list({ config: { pageSize: 20 } });
    
    for await (const store of pager) {
      stores.push({
        name: store.name || "",
        displayName: store.displayName,
        createTime: store.createTime,
        updateTime: store.updateTime,
      });
    }
    
    return NextResponse.json({ stores });
  } catch (error) {
    return handleError(error, "Failed to list stores");
  }
}

export async function POST(request: Request) {
  try {
    const { displayName } = await request.json();
    
    if (!displayName) {
      return NextResponse.json(
        { error: "displayName is required" },
        { status: 400 }
      );
    }
    
    const store = await ai.fileSearchStores.create({
      config: { displayName },
    });
    
    return NextResponse.json({ store });
  } catch (error) {
    return handleError(error, "Failed to create store");
  }
}
