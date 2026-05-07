type LangChainMessage = {
  id: string;
  type: "human" | "ai" | "tool" | "system";
  content: string;
  additional_kwargs: Record<string, unknown>;
  response_metadata: Record<string, unknown>;
  tool_calls?: unknown[];
  invalid_tool_calls?: unknown[];
  usage_metadata?: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    input_token_details?: Record<string, number>;
    output_token_details?: Record<string, number>;
  };
};

type ThreadValues = {
  messages: LangChainMessage[];
  githubRepoUrl: string;
  llmCalls?: number;
  streamResponse?: string;
  progressEvents?: string[];
  category?: string;
};

type ThreadMetadata = {
  githubRepoUrl: string;
  graph_id: string;
  assistant_id: string;
};

export type LangGraphThread = {
  thread_id: string;
  created_at: string;
  updated_at: string;
  metadata: ThreadMetadata;
  status: "idle" | "busy" | "error" | "interrupted";
  config: Record<string, unknown>;
  values: ThreadValues;
  interrupts: Record<string, unknown>;
};
