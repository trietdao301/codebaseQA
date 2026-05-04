import { Button } from "@/components/ui/button";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const GrepSearch = makeAssistantToolUI({
  toolName: "grep_search",
  render: ({ args, status }) => {
    return (
      <p>
        Grep search for {args.keyword?.toString() ?? "unknown"}... {status.type}
      </p>
    );
  },
});
