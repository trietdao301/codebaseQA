import { GraphNode } from "@langchain/langgraph";
import { MessagesState } from "./state";
import { model } from "../client/openai";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

// classify_node.ts
export const classifyNode: GraphNode<typeof MessagesState> = async (state) => {
  const lastMessage = state.messages.at(-1);
  const question =
    typeof lastMessage?.content === "string" ? lastMessage.content : "";

  const category = await classifyQuestion(question);
  return { category };
};

async function classifyQuestion(question: string): Promise<string> {
  const response = await model.invoke([
    new SystemMessage(`You are a helpful assistant that classifies codebase questions.
        Return ONLY the category name, nothing else.
  
        Categories:
        - architecture: Overall structure, what the project does, how it is organized
        - location: Where is specific logic, feature, or functionality located in the codebase
        - explanation: Explain a specific piece of code, function, class, or module
        - simple: Greetings, clarifications, or questions answerable without calling any tools
      `),
    new HumanMessage(question),
  ]);

  return response.content as string;
}
