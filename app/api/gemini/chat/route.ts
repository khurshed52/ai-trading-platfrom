import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatRequest = {
  message?: string;
};

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
    })
  : null;

const SYSTEM_INSTRUCTION = `
You are the TradePro support assistant.

Help users with:
- account registration
- login and password support
- platform navigation
- trading terminology
- account security
- general TradePro product support

Keep every response concise, clear, and helpful.

Do not provide:
- personalized financial advice
- guaranteed returns
- direct buy or sell instructions
- invented market prices
`;

export async function POST(request: Request) {
  try {
    if (!ai) {
      return Response.json(
        {
          message: "GEMINI_API_KEY is not configured.",
        },
        {
          status: 500,
        },
      );
    }

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

    const geminiStream =
      await ai.models.generateContentStream({
        model: "gemini-3.1-flash-lite",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: message,
              },
            ],
          },
        ],
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.4,
          maxOutputTokens: 500,
        },
      });

    const encoder = new TextEncoder();

    const responseStream = new ReadableStream<Uint8Array>({
      async start(controller) {
        let receivedText = false;

        try {
          for await (const chunk of geminiStream) {
            const text = chunk.text;

            if (!text) {
              continue;
            }

            receivedText = true;

            controller.enqueue(
              encoder.encode(text),
            );
          }

          if (!receivedText) {
            controller.enqueue(
              encoder.encode(
                "I could not generate a response. Please try again.",
              ),
            );
          }

          controller.close();
        } catch (error) {
          console.error(
            "Gemini streaming error:",
            error,
          );

          controller.enqueue(
            encoder.encode(
              "\nSorry, something went wrong while generating the response.",
            ),
          );

          controller.close();
        }
      },

      cancel() {
        console.log("Gemini stream was cancelled.");
      },
    });

    return new Response(responseStream, {
      status: 200,
      headers: {
        "Content-Type":
          "text/plain; charset=utf-8",
        "Cache-Control":
          "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Gemini API route error:", error);

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unable to generate a response.";

    return Response.json(
      {
        message: errorMessage,
      },
      {
        status: 500,
      },
    );
  }
}