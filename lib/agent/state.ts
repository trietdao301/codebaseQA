import { StateSchema, MessagesValue, ReducedValue } from "@langchain/langgraph";
import { z } from "zod/v4";

export const MessagesState = new StateSchema({
  messages: MessagesValue,

  llmCalls: new ReducedValue(z.number().default(0), {
    reducer: (x, y) => x + y,
  }),
  streamResponse: new ReducedValue(
    z.string().default(""),
    { reducer: (_, y) => y }, // last-write-wins
  ),
  progressEvents: new ReducedValue(z.array(z.string()).default([]), {
    reducer: (x, y) => [...x, ...y],
  }),
  githubRepoUrl: new ReducedValue(z.string().default(""), {
    reducer: (_, y) => y,
  }),
  category: new ReducedValue(z.string().default(""), {
    reducer: (_, y) => y, // last-write-wins
  }),
});
