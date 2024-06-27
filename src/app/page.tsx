"use client";

import { useCompletion } from "ai/react";

export default function VercelStreamingText() {
  const { complete, completion } = useCompletion({
    api: "/api/ai",
  });

  const onRunClick = () => {
    void complete("hi, do you have a mom?", {
      body: { email: "alex@google.com" },
    });
  };

  return (
    <div className="space-y-3">
      <button onClick={onRunClick}>Run</button>
      <div>{completion}</div>
    </div>
  );
}
