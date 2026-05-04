import { Button } from "@/components/ui/button";
import { makeAssistantToolUI } from "@assistant-ui/react";

export const ListDirectory = makeAssistantToolUI({
  toolName: "list_files_and_directories_in_codebase",
  render: ({ args, status }) => {
    return (
      <p>
        List files and directories in {args.tree?.toString() ?? "unknown"}
        ... {status.type}
      </p>
    );
  },
});
