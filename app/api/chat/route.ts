import { NextRequest } from "next/server";
import { getAI } from "@/lib/gemini";

export const runtime = "nodejs";

const SUPPORTED_MODELS = [
  "gemini-2.5-flash",
  "gemini-3-flash-preview",
] as const;
type SupportedModel = (typeof SUPPORTED_MODELS)[number];

interface ChatRequestBody {
  message: string;
  model: SupportedModel;
  storeId: string;
  history?: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, model, storeId, history = [] } = body;

    if (!message || !model || !storeId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: message, model, storeId",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!SUPPORTED_MODELS.includes(model)) {
      return new Response(
        JSON.stringify({
          error: `Invalid model. Supported models: ${SUPPORTED_MODELS.join(
            ", "
          )}`,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const ai = getAI();
    const storeName = storeId.startsWith("fileSearchStores/")
      ? storeId
      : `fileSearchStores/${storeId}`;

    // Create a chat session with file search tool
    const chat = ai.chats.create({
      model,
      config: {
        tools: [
          {
            fileSearch: {
              fileSearchStoreNames: [storeName],
            },
          },
        ],
      },
      history,
    });

    // Stream the response
    const stream = await chat.sendMessageStream({ message });

    // Create a readable stream for the response
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let groundingMetadata = null;

          for await (const chunk of stream) {
            const text = chunk.text || "";

            // Check for grounding metadata in the chunk
            if (chunk.candidates?.[0]?.groundingMetadata) {
              groundingMetadata = chunk.candidates[0].groundingMetadata;
            }

            // Send the text chunk
            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "text", content: text })}\n\n`
                )
              );
            }
          }

          // Send grounding metadata at the end if available
          if (groundingMetadata) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: "grounding",
                  content: groundingMetadata,
                })}\n\n`
              )
            );
          }

          // Send done signal
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Stream error";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: "error",
                content: errorMessage,
              })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
