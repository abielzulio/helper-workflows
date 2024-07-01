"use client";

import { api } from "@/trpc/react";
import { experimental_useObject } from "ai/react";
import { nanoid } from "nanoid";
import React from "react";
import { z } from "zod";

export default function VercelStreamingText() {
  const createRespondRule = (trigger: string, response: string) =>
    `IF the email can be described as from "${trigger}" THEN respond with "${response}"`;

  const createMarkRule = (trigger: string, response: string) =>
    `IF the email can be described as from "${trigger}" THEN mark the email ask "${response}", ELSE don't mark the email to anything else and continue to the next rule if exists`;

  const createCloseRule = (trigger: string) =>
    `IF the email can be described as from "${trigger}" THEN close the email, ELSE then don't close the email and continue to the next rule if exiest`;

  const createFallback = (fallback: string) =>
    `IF none of the above conditions are met THEN respond with "${fallback}"`;

  type ResponseType = "reply" | "mark" | "close";

  const { object, submit, isLoading } = experimental_useObject({
    api: "/api/ai",
    schema: z.object({
      response: z.object({
        content: z.string().nullish(),
        isClose: z.boolean().default(false),
        markAs: z.string().nullish(),
      }),
    }),
  });

  const { mutateAsync } = api.email.get.useMutation();

  const [trigger, setTrigger] = React.useState<string>("");
  const [response, setResponse] = React.useState<string>("");
  const [fallback, setFallback] = React.useState<string>("");

  const [recipient, setRecipient] = React.useState<string>("");
  const [content, setContent] = React.useState<string>("");

  const [email, setEmail] = React.useState<{
    id: string;
    recipient: string;
    content: string;
  }>({ id: "", recipient: "", content: "" });

  const [type, setType] = React.useState<ResponseType>("reply");
  const [mark, setMark] = React.useState<string>("");
  const [test, setTest] = React.useState<string>("");

  const loadData = async (id: string) => {
    const { data } = await mutateAsync({ id });
    /*     if (!data) return; */
    console.log("alex", data);
    setTest(data);
  };

  React.useEffect(() => {
    /*     if (!isLoading) return; */
    if (email.id === "") return;

    void loadData(email.id);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email.id]);

  const onRunClick = async () => {
    const id = nanoid();

    setEmail({
      id,
      recipient,
      content,
    });

    const obj = {
      id,
      email: {
        recipient,
        content,
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
    submit(JSON.stringify(obj));
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
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button onClick={onRunClick}>Run</button>
      <div className="flex w-full flex-col gap-2">
        <div className="ml-auto flex flex-col">
          <p className="opacity-50">{email.recipient}</p>
          <p>{email.content}</p>
        </div>
        <div className="mr-auto flex flex-col">
          {object?.response ? (
            <>
              {test === mark ? <p>Marked as {mark}</p> : null}
              {type === "close" && test === "true" ? <p>Closed</p> : null}
              <p className="opacity-50">abielzm@gmail.com</p>
              <p>{object?.response?.content}</p>
            </>
          ) : null}
        </div>
      </div>
      <div className="text-black">
        {JSON.stringify(object?.response, null, 2)}
      </div>
    </div>
  );
}
