import { env } from "@/env";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { NextResponse } from "next/server";

export const runtime = "edge";

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

export async function POST(req: Request) {
  const BASE_PROMPT = `<system>You are a helpful customer support assistant. Your goal is to solve the customer's problem effectively with as few words as possible.</system>`;

  const INITIAL_WORKFLOW = `<task>Follow the rules below in the given order. The order represents a prioritization where higher priority rules should be followed first. Some rules may have an AND logic, which must be prioritized before moving to the next OR rule. Ensure to carefully understand and follow these rules to solve the customer's problem effectively.</task>`;

  const { prompt, email, rules } = (await req.json()) as {
    prompt: string;
    email: string;
    rules: string[];
  };

  const PROMPT =
    BASE_PROMPT +
    INITIAL_WORKFLOW +
    ("\n" + "<rules>" + "\n") +
    rules.map((p, i) => `Rule ${i + 1}: ${p}`).join("\n") +
    ("\n" + "</rules>" + "\n");

  console.log(PROMPT);

  const result = await streamText({
    model: openai("gpt-4-turbo"),
    system: PROMPT,
    prompt: `Here's the email content: ${prompt}, sent from ${email} email address`,
  });

  return result.toTextStreamResponse();
}

export async function GET(req: Request) {
  return NextResponse.json({ hello: "world" });
}
