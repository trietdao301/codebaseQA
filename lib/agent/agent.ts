import { InMemoryStore, StateGraph } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { llmCall } from "./llm_node";
import { toolNode } from "./tools_node";
import { shouldContinue } from "./condition";
import { START, END } from "@langchain/langgraph";
import { model } from "../client/openai";
import { toolsByName } from "./tools";
import { classifyNode } from "./classify_node";

export const agent = new StateGraph(MessagesState)
  .addNode("classifyNode", classifyNode) // ← runs once
  .addNode("llmCall", llmCall)
  .addNode("toolNode", toolNode)
  .addEdge(START, "classifyNode") // ← entry point
  .addEdge("classifyNode", "llmCall") // ← then llm
  .addConditionalEdges("llmCall", shouldContinue, ["toolNode", END])
  .addEdge("toolNode", "llmCall") // ← loops back, skips classifyNode
  .compile();

const tools = Object.values(toolsByName);
export const modelWithTools = model.bindTools(tools);

// // Invoke
// import { HumanMessage } from "@langchain/core/messages";
// const result = await agent.invoke({
//   messages: [new HumanMessage("Add 3 and 4.")],
// });

// for (const message of result.messages) {
//   console.log(`[${message.type}]: ${message.text}`);
// }
