import { env } from "@/env";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  // custom settings, e.g.
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

export async function POST(req: Request) {
  const BASE_PROMPT = `You are a helpful customer support assistant. Your goal is to solve the customer's problem effectively with as few words as possible.`;

  const INITIAL_WORKFLOW = `You have certain rules to follow where order matters as a prioritization. You must follow these rules in order to solve the customer's problem effectively.`;

  const WORKFLOW_PROMPTS = [
    `IF the email eligible described like this: "asking about my gf" THEN respond with "I'm sorry, I can't help with that."`,
    `IF the email eligible described like this: "asking about my bf" THEN respond with "You're digusting"`,
  ];

  const { prompt } = (await req.json()) as { prompt: string };

  const PROMPT =
    BASE_PROMPT +
    INITIAL_WORKFLOW +
    ("\n" + WORKFLOW_PROMPTS.map((p, i) => `Rule ${i + 1}: ${p}`).join("\n"));

  console.log("alex", PROMPT);

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: PROMPT,
    prompt: `Here's the email: ${prompt}`,
  });

  return result.toAIStreamResponse();
}

export async function GET(req: Request) {
  return NextResponse.json({ hello: "world" });
}
