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


export async function GET(req: Request) {
  const url = new URL(req.url);
  const rootDir = resolveSafeDir(url.searchParams.get("dir"));
  const result = await indexCodeBase(rootDir);
 

  return NextResponse.json({
    
  });
}
