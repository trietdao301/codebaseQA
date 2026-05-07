import { indexCodeBase } from "@/lib/index/indexCodeBase";
import { inngest, indexCreated } from "./ingest_client";
import { schema } from "./schema";
import { COLLECTION_NAME, qdrantClient } from "@/lib/client/qdrant";
import { openai } from "@/lib/client/openai";
import { getSupabaseServerClient } from "@/lib/client/supabase_server";
import path from "path";
import fs from "node:fs/promises";
import { cloneRepository } from "./cloneRepository";

const PUBLISH_INTERVAL_MS = 1000;

const isDoneStage = (stage: string) => stage.endsWith("_done");

export const indexRepo = inngest.createFunction(
  {
    id: "index-repo",
    triggers: [indexCreated],
    onFailure: async ({ step, event }) => {
      const { runId, projectId, github_repo_url } = event.data.event.data;
      const ch = schema({ runId });
      const cloneRoot = path.join(process.cwd(), "cloned_repos", runId);

      await inngest.realtime.publish(ch.events, {
        tone: "warning",
        status: "failed",
        message: "Clean up on failure",
      });

      await step.run("cleanup-on-failure", async () => {
        const supabase = await getSupabaseServerClient();
        const qdrant = qdrantClient();

        await Promise.all([
          // Remove cloned repo from disk
          fs.rm(cloneRoot, { recursive: true, force: true }),

          // Delete project row
          supabase.from("projects").delete().eq("id", projectId),

          // Delete lexical index
          supabase
            .from("code_lines")
            .delete()
            .eq("github_repo_url", github_repo_url),

          // Delete semantic index from Qdrant
          qdrant.delete(COLLECTION_NAME, {
            filter: {
              must: [
                { key: "github_repo_url", match: { value: github_repo_url } },
              ],
            },
          }),
        ]);
      });
      await inngest.realtime.publish(ch.events, {
        tone: "error",
        status: "done",
        message: "Clean up on failure Completed",
      });
    },
  },
  async ({ event, step }) => {
    console.log("Function started, runId:", event.data.runId);
    const ch = schema({ runId: event.data.runId });

    const cloneRoot = path.join(
      process.cwd(),
      "cloned_repos",
      event.data.runId,
    );

    await step.realtime.publish("status-cloning", ch.events, {
      tone: "info",
      status: "cloning",
      stage: "cloning",
      message: "Cloning repository",
    });

    await step.run("clone", async () => {
      await fs.mkdir(cloneRoot, { recursive: true });
      await cloneRepository(event.data.github_repo_url, cloneRoot);
    });

    await step.realtime.publish("status-indexing", ch.events, {
      tone: "info",
      status: "indexing",
      message: "Indexing repository",
    });

    await step.run("index", async () => {
      const supabase = await getSupabaseServerClient();
      const qdrant = qdrantClient();
      try {
        let lastPublish = 0;

        for await (const progress of indexCodeBase(
          cloneRoot,
          qdrant,
          openai,
          supabase,
          event.data.github_repo_url,
          event.data.projectId,
        )) {
          const now = Date.now();
          const shouldThrottle = !isDoneStage(progress.stage);
          const withinInterval = now - lastPublish < PUBLISH_INTERVAL_MS;

          if (shouldThrottle && withinInterval) {
            continue;
          }

          switch (progress.stage) {
            case "parsing":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "parsing",
                message: `Parsing file ${progress.file} (${progress.count}/${progress.total})`,
                stage: "parsing",
                count: progress.count,
                total: progress.total,
                file: progress.file,
              });
              break;

            case "lexical_indexing":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "indexing",
                message: `Lexical indexing ${progress.file} (${progress.count}/${progress.total})`,
                stage: "lexical_indexing",
                count: progress.count,
                total: progress.total,
                file: progress.file,
              });
              break;

            case "lexical_indexing_done":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "indexing",
                message: `Lexical indexing complete (${progress.count}/${progress.total})`,
                stage: "lexical_indexing_done",
                count: progress.count,
                total: progress.total,
              });
              break;

            case "chunking":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "chunking",
                message: `Chunking ${progress.file} (chunk ${progress.count})`,
                stage: "chunking",
                count: progress.count,
                file: progress.file,
              });
              break;

            case "chunking_done":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "chunking",
                message: `Chunking complete (${progress.count} chunks)`,
                stage: "chunking_done",
                count: progress.count,
              });
              break;

            case "semantic_indexing":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "indexing",
                message: `Semantic indexing (${progress.count}/${progress.total})`,
                stage: "semantic_indexing",
                count: progress.count,
                total: progress.total,
              });
              break;

            case "semantic_indexing_done":
              await inngest.realtime.publish(ch.events, {
                tone: "info",
                status: "indexing",
                message: `Semantic indexing complete (${progress.count}/${progress.total})`,
                stage: "semantic_indexing_done",
                count: progress.count,
                total: progress.total,
              });
              break;
          }

          lastPublish = Date.now();
        }
      } catch (error) {
        await inngest.realtime.publish(ch.events, {
          tone: "warning",
          status: "failed",
          message: "Indexing failed",
        });
        throw error;
      }
    });

    await step.realtime.publish("index-completed", ch.events, {
      tone: "info",
      status: "indexing",
      message: "Indexing complete!",
    });

    await step.run("cleanup", () =>
      fs.rm(cloneRoot, { recursive: true, force: true }),
    );

    await step.realtime.publish("cleanup-completed", ch.events, {
      tone: "success",
      status: "cleanup",
      message: "Cleanup repository",
      stage: "cleanup",
    });
  },
);
