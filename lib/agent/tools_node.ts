import { AIMessage, ToolMessage } from "@langchain/core/messages";
import { GraphNode } from "@langchain/langgraph";
import { toolsByName } from "./tools";
import { MessagesState } from "./state";

function formatToolArgs(args: unknown): string {
  try {
    const serialized = JSON.stringify(args);
    if (!serialized) return "{}";
    return serialized.length > 180
      ? `${serialized.slice(0, 180)}...`
      : serialized;
  } catch {
    return "{}";
  }
}

export const toolNode: GraphNode<typeof MessagesState> = async (
  state,
  config,
) => {
  const lastMessage = state.messages.at(-1);

  if (lastMessage == null || !AIMessage.isInstance(lastMessage)) {
    return { messages: [] };
  }

  const githubRepoUrl = state.githubRepoUrl;
  const toolConfig = {
    ...config,
    configurable: {
      ...config?.configurable,
      githubRepoUrl, // ← inject here
    },
  };

  const result: ToolMessage[] = [];
  const toolCalls = lastMessage.tool_calls ?? [];
  const executionLines = toolCalls.map(
    (toolCall, index) =>
      `${index + 1}. ${toolCall.name}(${formatToolArgs(toolCall.args)})`,
  );

  for (const toolCall of toolCalls) {
    const tool = toolsByName[toolCall.name as keyof typeof toolsByName];
    if (!tool) continue;

    const observation = await tool.invoke(toolCall, toolConfig); // ← pass config
    result.push(observation);
  }

  return {
    messages: result,
    streamResponse:
      executionLines.length > 0
        ? `[status] ${executionLines.join("\n")}`
        : "[status] Executing tools...",
    progressEvents: [
      executionLines.length > 0
        ? `[status] ${executionLines.join("\n")}`
        : "[status] Executing tools...",
    ],
  };
};
