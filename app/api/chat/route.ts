import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { streamText } from "ai";

const openrouter = createOpenAICompatible({
  name: "openrouter",
  baseURL: "https://openrouter.ai/api/v1",
  headers: {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  },
});

export async function POST(req: Request) {
  const { messages, model, systemPrompt } = await req.json();

  const result = streamText({
    model: openrouter.languageModel(model || "deepseek/deepseek-v3.2"),
    system: systemPrompt || "You are a helpful assistant. Be concise and clear.",
    messages,
  });

  return result.toDataStreamResponse();
}
