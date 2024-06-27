"use client";

import { useCompletion } from "ai/react";
import React from "react";

const RULES = [
  `IF the email can be described as from "someone from everyone that asking about my girlfriend" THEN respond with "no sorry`,
  `IF the email can be described as from "someone from paypal that asking about my boyfriend" THEN respond with "hmmmm."`,
  `IF the email can be described as from "someone from everyone that asking about my boyfriend" THEN respond with "digusting"`,
];

const createRule = (trigger: string, response: string) =>
  `IF the email can be described as from "${trigger}" THEN respond with "${response}"`;

const createFallback = (fallback: string) =>
  `IF none of the above conditions are met THEN respond with "${fallback}"`;

export default function VercelStreamingText() {
  const { complete, completion } = useCompletion({
    api: "/api/ai",
  });

  const [trigger, setTrigger] = React.useState<string>("");
  const [response, setResponse] = React.useState<string>("");
  const [test, setTest] = React.useState<string>("");
  const [fallback, setFallback] = React.useState<string>("");
  const [recipient, setRecipient] = React.useState<string>("");

  const onRunClick = () => {
    void complete(test, {
      body: {
        email: recipient,
        rules: [createRule(trigger, response), createFallback(fallback)],
      },
    });
  };

  return (
    <div className="flex flex-col justify-start text-left">
      <p>if</p>
      <textarea
        placeholder="trigger"
        className="border-black-100 border-[4px]"
        value={trigger}
        onChange={(e) => setTrigger(e.target.value)}
      />
      <p>then</p>
      <textarea
        placeholder="response"
        className="border-black-100 border-[4px]"
        value={response}
        onChange={(e) => setResponse(e.target.value)}
      />
      <textarea
        placeholder="fallback≈"
        className="border-black-100 border-[4px]"
        value={fallback}
        onChange={(e) => setFallback(e.target.value)}
      />
      <p>test</p>
      <input
        placeholder="recipient"
        className="border-black-100 border-[4px]"
        value={recipient}
        onChange={(e) => setRecipient(e.target.value)}
      />
      <textarea
        placeholder="test email"
        className="border-black-100 border-[4px]"
        value={test}
        onChange={(e) => setTest(e.target.value)}
      />
      <button onClick={onRunClick}>Run</button>
      <div>{completion}</div>
    </div>
  );
}
