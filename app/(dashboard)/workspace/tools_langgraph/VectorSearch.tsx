import { Button } from "@/components/ui/button";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const VectorSearch = makeAssistantToolUI({
  toolName: "vector_search",
  render: ({ args, status }) => {
    return (
      <p>
        Vector search for {args.question?.toString() ?? "unknown"}
        ... {status.type}
      </p>
    );
  },
});
