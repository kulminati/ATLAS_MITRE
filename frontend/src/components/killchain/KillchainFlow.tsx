"use client";

import { useCallback, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MarkerType,
  type NodeProps,
  type Node,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { FlowNode, FlowEdge } from "@/lib/types";
import { stripHtml } from "@/lib/utils";

interface Props {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

type TacticNodeData = FlowNode["data"] & {
  sourcePos?: Position;
  targetPos?: Position;
};

function TacticNode({ data }: NodeProps<Node<TacticNodeData>>) {
  const color = data.color as string;
  const rawDescription = data.description as string;
  const cleanDesc = rawDescription ? stripHtml(rawDescription) : "";
  const truncatedDesc =
    cleanDesc && cleanDesc.length > 120
      ? cleanDesc.substring(0, 117) + "..."
      : cleanDesc;

  const sourcePos = (data.sourcePos as Position) ?? Position.Right;
  const targetPos = (data.targetPos as Position) ?? Position.Left;

  return (
    <div
      className="rounded-lg border border-gray-700 bg-gray-900 shadow-lg overflow-hidden"
      style={{ width: 240 }}
    >
      <Handle type="target" position={targetPos} className="!bg-gray-600" />
      {/* Color header bar */}
      <div className="h-1.5" style={{ backgroundColor: color }} />
      <div className="p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ backgroundColor: color }}
          >
            {data.step_order as number}
          </span>
          <span className="text-xs font-semibold text-gray-200 truncate">
            {data.tactic_name as string}
          </span>
        </div>
        <a
          href={`/technique/${data.technique_id}`}
          className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors block truncate"
          onClick={(e) => e.stopPropagation()}
        >
          {data.technique_name as string}
        </a>
        <p className="text-xs font-mono text-gray-500 mt-0.5">
          {data.technique_id as string}
        </p>
        {truncatedDesc && (
          <p className="text-xs text-gray-400 mt-2 leading-relaxed">
            {truncatedDesc}
          </p>
        )}
      </div>
      <Handle type="source" position={sourcePos} className="!bg-gray-600" />
    </div>
  );
}

const nodeTypes = { tacticStep: TacticNode };

function getRelativePosition(
  from: { x: number; y: number },
  to: { x: number; y: number }
): Position {
  if (to.y !== from.y) {
    return to.y > from.y ? Position.Bottom : Position.Top;
  }
  return to.x > from.x ? Position.Right : Position.Left;
}

export default function KillchainFlow({ nodes, edges }: Props) {
  const reactFlowNodes = useMemo(() => {
    // Sort nodes by step_order so we can determine prev/next
    const sorted = [...nodes].sort(
      (a, b) => (a.data.step_order as number) - (b.data.step_order as number)
    );

    return sorted.map((n, i) => {
      const prev = i > 0 ? sorted[i - 1] : null;
      const next = i < sorted.length - 1 ? sorted[i + 1] : null;

      // Which side of ME faces the previous node? (where the incoming edge arrives)
      const targetPos = prev
        ? getRelativePosition(n.position, prev.position)
        : Position.Left;

      // Which side of ME faces the next node? (where the outgoing edge leaves)
      const sourcePos = next
        ? getRelativePosition(n.position, next.position)
        : Position.Right;

      return {
        ...n,
        type: "tacticStep",
        data: {
          ...n.data,
          sourcePos,
          targetPos,
        },
      };
    });
  }, [nodes]);

  const reactFlowEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        type: "smoothstep",
        style: { stroke: "#4b5563", strokeWidth: 2, ...(e.style || {}) },
        animated: e.animated,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: "#4b5563",
          width: 20,
          height: 20,
        },
      })),
    [edges]
  );

  const onInit = useCallback((instance: { fitView: () => void }) => {
    setTimeout(() => instance.fitView(), 100);
  }, []);

  return (
    <div className="h-[850px] rounded-lg border border-gray-800 bg-gray-950 overflow-hidden">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        nodeTypes={nodeTypes}
        onInit={onInit}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1f2937" gap={20} />
        <Controls
          showInteractive={false}
          className="!bg-gray-900 !border-gray-700 !rounded-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-300 [&>button:hover]:!bg-gray-700"
        />
      </ReactFlow>
    </div>
  );
}
