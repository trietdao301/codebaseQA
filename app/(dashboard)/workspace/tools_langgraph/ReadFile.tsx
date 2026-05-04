import { Button } from "@/components/ui/button";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const ReadFile = makeAssistantToolUI({
  toolName: "read_file",
  render: ({ args, status }) => {
    return (
      <p>
        Read file {args.relative_file_path?.toString() ?? "unknown"}
        ... {status.type}
      </p>
    );
  },
});
