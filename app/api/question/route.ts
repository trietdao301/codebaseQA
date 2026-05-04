import { NextResponse } from "next/server";
import { HumanMessage } from "@langchain/core/messages";
import { agent } from "@/lib/agent/agent";



export async function POST(req: Request) {

  const { question } =  await req.json();

 
  const result = await agent.invoke({
    messages: [new HumanMessage(question)],
  });

  const assistantMessages = result.messages.filter((message: any) => message?.type === "ai");
  const latestAssistant = assistantMessages[assistantMessages.length - 1];

  let answer = "";
  if (typeof latestAssistant?.content === "string") {
    answer = latestAssistant.content;
  } else if (Array.isArray(latestAssistant?.content)) {
    answer = latestAssistant.content
      .map((part: any) => (typeof part === "string" ? part : part?.text ?? ""))
      .join("");
  }

  return NextResponse.json({
    answer,
    messages: result.messages,
  });
}


    // const response = await fetch("http://localhost:3000/api/question", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ question: "How does this project index the codebase ?" })
  // });
  
  // const data = await response.json();
  