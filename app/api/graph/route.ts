import { NextResponse } from "next/server";
import path from "path";
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";
import { indexCodeBase } from "@/lib/indexCodeBase";
import { QdrantClient } from "@qdrant/js-client-rest";
import OpenAI from "openai";


function getRepoRoot() {
  return process.cwd();
}

function resolveSafeDir(dirParam: string | null) {
  const repoRoot = getRepoRoot();
  const requested = dirParam ? path.resolve(dirParam) : repoRoot;
  const rel = path.relative(repoRoot, requested);
  if (rel.startsWith("..") || (path.isAbsolute(rel) === false && rel.includes(":"))) {
    return repoRoot;
  }
  return requested;
}

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!,
});


const openai = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

const embedding = await openai.embeddings.create({
  model: "text-embedding-3-small",
  input: "Your text string goes here",
  encoding_format: "float",
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const rootDir = resolveSafeDir(url.searchParams.get("dir"));
  const result = await indexCodeBase(rootDir, qdrantClient, openai);
  

  return NextResponse.json({
    
  });
}
