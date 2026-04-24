"use client";

import { useEffect, useState } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "reactflow";
import "reactflow/dist/style.css";

type ApiNode = {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
};

type ApiEdge = {
  id: string;
  source: string;
  target: string;
  style?: { stroke?: string };
};

function toFlowNodes(raw: ApiNode[]): Node[] {
  return raw.map((n) => ({
    id: n.id,
    position: n.position,
    data: { label: n.data.label },
    style: n.id.startsWith("file:")
      ? { background: "#14532d", color: "#ecfdf5", border: "1px solid #22c55e" }
      : { background: "#1e1b4b", color: "#e0e7ff", border: "1px solid #6366f1" },
  }));
}

function toFlowEdges(raw: ApiEdge[]): Edge[] {
  return raw.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    style: e.style,
    animated:
      e.style?.stroke === "#2563eb" ||
      e.style?.stroke === "#ea580c",
  }));
}

function GraphFlow({ apiNodes, apiEdges }: { apiNodes: ApiNode[]; apiEdges: ApiEdge[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(toFlowNodes(apiNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(toFlowEdges(apiEdges));
  const { fitView } = useReactFlow();

  useEffect(() => {
    setNodes(toFlowNodes(apiNodes));
    setEdges(toFlowEdges(apiEdges));
  }, [apiNodes, apiEdges, setNodes, setEdges]);

  useEffect(() => {
    if (nodes.length === 0) return;
    const t = requestAnimationFrame(() => fitView({ padding: 0.2, duration: 200 }));
    return () => cancelAnimationFrame(t);
  }, [nodes, edges, fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      minZoom={0.05}
      maxZoom={1.4}
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#334155" gap={18} />
      <Controls />
      <MiniMap
        nodeStrokeWidth={2}
        maskColor="rgb(15, 23, 42, 0.85)"
        className="!bg-slate-900"
      />
    </ReactFlow>
  );
}

export default function Graph() {
  const [apiNodes, setApiNodes] = useState<ApiNode[]>([]);
  const [apiEdges, setApiEdges] = useState<ApiEdge[]>([]);
  const [meta, setMeta] = useState<{
    symbolCount?: number;
    edgeCount?: number;
    callSiteCount?: number;
  }>({});
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/graph");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setApiNodes(data.nodes ?? []);
        setApiEdges(data.edges ?? []);
        setMeta({
          symbolCount: data.symbolCount,
          edgeCount: data.edgeCount,
          callSiteCount: data.callSiteCount,
        });
      } finally {
        if (!cancelled) setFetched(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-2 p-4">
      {fetched && (
        <div className="text-xs text-slate-500">
          {meta.symbolCount ?? apiNodes.length} symbols · {meta.edgeCount ?? apiEdges.length}{" "}
          edges
          {meta.callSiteCount != null ? ` · ${meta.callSiteCount} call sites` : null}
        </div>
      )}
      <div className="relative h-[calc(100vh-6rem)] w-full min-h-[480px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950">
        {!fetched ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Loading graph data…
          </div>
        ) : apiNodes.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            No symbols found for the current scan path.
          </div>
        ) : (
          <ReactFlowProvider>
            <GraphFlow apiNodes={apiNodes} apiEdges={apiEdges} />
          </ReactFlowProvider>
        )}
      </div>
    </div>
  );
}
