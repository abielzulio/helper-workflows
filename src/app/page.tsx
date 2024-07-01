"use client";

import { experimental_useObject, useChat, useCompletion } from "ai/react";
import React from "react";
import { nanoid } from "nanoid";
import { z } from "zod";

/* const RULES = [
  `IF the email can be described as from "someone from everyone that asking about my girlfriend" THEN respond with "no sorry`,
  `IF the email can be described as from "someone from paypal that asking about my boyfriend" THEN respond with "hmmmm."`,
  `IF the email can be described as from "someone from everyone that asking about my boyfriend" THEN respond with "digusting"`,
];


 */
export default function VercelStreamingText() {
  const createRespondRule = (trigger: string, response: string) =>
    `IF the email can be described as from "${trigger}" THEN respond with "${response}"`;

  const createMarkRule = (trigger: string, response: string) =>
    `IF the email can be described as from "${trigger}" THEN mark the email to "${response}", ELSE don't mark the email to anything else and continue to the next rule if exists`;

  const createCloseRule = (trigger: string) =>
    `IF the email can be described as from "${trigger}" THEN close the email, ELSE then don't close the email and continue to the next rule if exiest`;

  const createFallback = (fallback: string) =>
    `IF none of the above conditions are met THEN respond with "${fallback}"`;

  type ResponseType = "reply" | "mark" | "close";
  const { complete, completion, data } = useCompletion({
    api: "/api/ai",
  });

  const { object, submit } = experimental_useObject({
    api: "/api/ai",
    schema: z.object({
      response: z.object({
        content: z.string(),
        isClose: z.boolean().default(false),
        markAs: z.string().optional(),
      }),
    }),
  });

  const { messages, append } = useChat({
    api: "/api/ai",
  });

  const [trigger, setTrigger] = React.useState<string>("");
  const [response, setResponse] = React.useState<string>("");
  const [test, setTest] = React.useState<string>("");
  const [fallback, setFallback] = React.useState<string>("");
  const [recipient, setRecipient] = React.useState<string>("");

  const [type, setType] = React.useState<ResponseType>("reply");
  const [mark, setMark] = React.useState<string>("");

  const onRunClick = () => {
    /*     void append(
      {
        role: "user",
        content: test,
      },
      {
        body: {
          email: recipient,
          rules: [
            type === "reply"
              ? createRespondRule(trigger, response)
              : type === "mark"
                ? createMarkRule(trigger, mark)
                : createCloseRule(trigger),
            createFallback(fallback),
          ],
        },
      },
    ); */

    const obj = {
      id: nanoid(),
      email: {
        recipient,
        content: test,
      },
      rules: [
        type === "reply"
          ? createRespondRule(trigger, response)
          : type === "mark"
            ? createMarkRule(trigger, mark)
            : createCloseRule(trigger),
        createFallback(fallback),
      ],
    };
    void submit(JSON.stringify(obj));
    /*     void complete(test, {body: obj}); */
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

      <p>type</p>
      <select
        value={type}
        onChange={(e) => setType(e.target.value as ResponseType)}
        className="border-black-100 border-[4px]"
      >
        <option value="reply">reply</option>
        <option value="mark">mark</option>
        <option value="close">close</option>
      </select>

      <p>then</p>

      {type === "reply" ? (
        <div className="flex flex-col gap-1">
          <p>reply</p>
          <textarea
            placeholder="response"
            className="border-black-100 border-[4px]"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
          <textarea
            placeholder="fallback"
            className="border-black-100 border-[4px]"
            value={fallback}
            onChange={(e) => setFallback(e.target.value)}
          />
        </div>
      ) : type === "mark" ? (
        <input
          placeholder="mark"
          className="border-black-100 border-[4px]"
          value={mark}
          onChange={(e) => setMark(e.target.value)}
        />
      ) : null}
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
      <div className="text-black">
        {JSON.stringify(
          data?.map((x) => x),
          null,
          2,
        )}
      </div>
      <p>{object?.response?.content}</p>
    </div>
  );
}
