import { env } from "@/env";
import { redis } from "@/libs/redis";
import { createOpenAI } from "@ai-sdk/openai";
import { streamObject } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export const runtime = "edge";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  compatibility: "strict", // strict mode, enable when using the OpenAI API
});

export async function POST(req: Request) {
  const BASE_PROMPT = `<system>You are a helpful customer support assistant. Your goal is to solve the customer's problem effectively with as few words as possible.</system>`;

  const INITIAL_WORKFLOW = `<task>Follow the rules below in the given order. The order represents a prioritization where higher priority rules should be followed first. Some rules may have an AND logic, which must be prioritized before moving to the next OR rule. Ensure to carefully understand and follow these rules to solve the customer's problem effectively.</task>`;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = (await req.json()) as string;

  const data = JSON.parse(json) as {
    id: string;
    prompt: string;
    email: {
      recipient: string;
      content: string;
    };
    rules: string[];
  };

  const { email, rules, id } = data;

  const PROMPT =
    BASE_PROMPT +
    INITIAL_WORKFLOW +
    ("\n" + "<rules>" + "\n") +
    rules.map((p, i) => `Rule ${i + 1}: ${p}`).join("\n") +
    ("\n" + "</rules>" + "\n");

  console.log(PROMPT);

  const result = await streamObject({
    model: openai("gpt-4-turbo"),
    schema: z.object({
      response: z.object({
        content: z.string().nullish(),
        isClose: z.boolean().default(false),
        markAs: z.string().nullish(),
      }),
    }),
    system: PROMPT,
    prompt: `Here's the email content: ${email.content}, sent from ${email.recipient} email address`,
    onFinish: async ({ object }) => {
      try {
        if (object?.response.markAs) {
          await redis.set(id, object?.response.markAs);
        } else if (object?.response.isClose) {
          await redis.set(id, "true");
        }
      } catch (e) {
        console.error(e);
      }
    },
  });

  return result.toTextStreamResponse();
}

export async function GET(req: Request) {
  return NextResponse.json({ hello: "world" });
}
