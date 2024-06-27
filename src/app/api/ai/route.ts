import { env } from "@/env";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

export async function POST(_: Request) {
  const result = await streamText({
    model: openai("gpt-4-turbo"),
    prompt: "Write a vegetarian lasagna recipe for 4 people.",
  });

  return result.toAIStreamResponse();
}
