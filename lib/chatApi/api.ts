// import { Client } from "@langchain/langgraph-sdk";
// import { LangGraphThread } from "../types/LangGraphThread";

// export async function createThread(repoUrl: string, client: Client) {
//   const { thread_id } = await client.threads.create({
//     graphId: process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID || "agent",
//     metadata: { githubRepoUrl: repoUrl }, // ← store in metadata for filtering
//   });
//   await client.threads.updateState(thread_id, {
//     values: { githubRepoUrl: repoUrl },
//   });
//   return { externalId: thread_id, thread_id };
// }

// export async function getThreadState(
//   externalId: string,
// ): Promise<LangGraphThread> {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_LANGGRAPH_API_URL}/threads/${externalId}`,
//     {
//       method: "GET",
//     },
//   );
//   return response.json() as Promise<LangGraphThread>;
// }

// export async function deleteThread(externalId: string) {
//   await fetch(
//     `${process.env.NEXT_PUBLIC_LANGGRAPH_API_URL}/threads/${externalId}`,
//     {
//       method: "DELETE",
//     },
//   );
// }

// export async function getAllThreads(githubRepoUrl: string) {
//   const response = await fetch(
//     `${process.env.NEXT_PUBLIC_LANGGRAPH_API_URL}/threads`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         metadata: {
//           githubRepoUrl: githubRepoUrl,
//         },
//       }),
//     },
//   );
//   return response.json() as Promise<LangGraphThread[]>;
// }
import { Client } from "@langchain/langgraph-sdk";
import { LangGraphThread } from "../types/LangGraphThread";

export async function createThread(repoUrl: string, client: Client) {
  const { thread_id } = await client.threads.create({
    graphId: process.env.NEXT_PUBLIC_LANGGRAPH_ASSISTANT_ID || "agent",
    metadata: { githubRepoUrl: repoUrl },
  });
  await client.threads.updateState(thread_id, {
    values: { githubRepoUrl: repoUrl },
  });
  return { externalId: thread_id, thread_id };
}

export async function getThreadState(
  externalId: string,
  client: Client,
): Promise<LangGraphThread> {
  const thread = await client.threads.get(externalId);
  console.log("externalId called in getThreadState:", externalId);
  return thread as unknown as LangGraphThread;
}

export async function deleteThread(externalId: string, client: Client) {
  console.log("Deleting thread:", externalId);
  await client.threads.delete(externalId);
}

export async function getAllThreads(githubRepoUrl: string, client: Client) {
  const threads = await client.threads.search({
    metadata: { githubRepoUrl },
    limit: 100,
  });
  return threads as unknown as LangGraphThread[];
}
