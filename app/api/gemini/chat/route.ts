import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

type ChatRequest = {
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequest;
    const message = body.message?.trim();

    if (!message) {
      return Response.json(
        {
          message: "Message is required.",
        },
        {
          status: 400,
        },
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        {
          message: "GEMINI_API_KEY is not configured.",
        },
        {
          status: 500,
        },
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const stream = await ai.interactions.create({
      model: "gemini-3.5-flash",
      input: message,
      stream: true,
      system_instruction:
        "You are the TradePro support assistant. Give concise, helpful answers about account registration, platform navigation, trading terminology, security, and general product support. Do not provide personalized financial advice, guaranteed returns, or direct buy and sell instructions.",
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.event_type === "step.delta" &&
              event.delta.type === "text"
            ) {
              controller.enqueue(
                encoder.encode(event.delta.text),
              );
            }
          }

          controller.close();
        } catch (error) {
          console.error("Gemini streaming error:", error);

          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Gemini route error:", error);

    return Response.json(
      {
        message: "Unable to generate a response.",
      },
      {
        status: 500,
      },
    );
  }
}