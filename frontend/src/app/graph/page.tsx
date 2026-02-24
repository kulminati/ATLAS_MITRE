"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { getTacticColor, TACTIC_COLORS } from "@/lib/colors";
import type { TechniqueGraph } from "@/lib/types";

// Tactic label map for legend
const TACTIC_LABELS: Record<string, string> = {
  "AML.TA0002": "Reconnaissance",
  "AML.TA0003": "Resource Development",
  "AML.TA0004": "Initial Access",
  "AML.TA0000": "ML Model Access",
  "AML.TA0005": "Execution",
  "AML.TA0006": "Persistence",
  "AML.TA0012": "Privilege Escalation",
  "AML.TA0007": "Defense Evasion",
  "AML.TA0013": "Credential Access",
  "AML.TA0008": "Discovery",
  "AML.TA0015": "Lateral Movement",
  "AML.TA0009": "Collection",
  "AML.TA0001": "ML Attack Staging",
  "AML.TA0014": "Command and Control",
  "AML.TA0010": "Exfiltration",
  "AML.TA0011": "Impact",
};

// D3 simulation node extends GraphNode with x, y, etc.
interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  tactic_ids: string[];
  maturity: string | null;
  case_study_count: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  weight: number;
}

export default function GraphPage() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [graph, setGraph] = useState<TechniqueGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data
  useEffect(() => {
    api
      .getTechniqueGraph()
      .then((data) => {
        setGraph(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // D3 rendering
  const renderGraph = useCallback(() => {
    if (!graph || !svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    // Create a root group for zoom/pan
    const rootG = svg.append("g");

    // Zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        rootG.attr("transform", event.transform.toString());
      });
    svg.call(zoom);

    // Prepare simulation data
    const nodes: SimNode[] = graph.nodes.map((n) => ({ ...n }));
    const nodeMap = new Map<string, SimNode>();
    nodes.forEach((n) => nodeMap.set(n.id, n));

    const links: SimLink[] = graph.edges
      .filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target))
      .map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
      }));

    // Compute max values for scaling
    const maxCaseStudy = Math.max(...nodes.map((n) => n.case_study_count), 1);
    const maxWeight = Math.max(...links.map((l) => l.weight), 1);

    // Scales
    const radiusScale = d3.scaleSqrt().domain([0, maxCaseStudy]).range([5, 24]);
    const linkWidthScale = d3
      .scaleLinear()
      .domain([1, maxWeight])
      .range([1, 6]);

    // Force simulation
    const simulation = d3
      .forceSimulation<SimNode>(nodes)
      .force(
        "link",
        d3
          .forceLink<SimNode, SimLink>(links)
          .id((d) => d.id)
          .distance(120)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force(
        "collision",
        d3.forceCollide<SimNode>().radius((d) => radiusScale(d.case_study_count) + 4)
      );

    // Draw edges
    const linkGroup = rootG.append("g").attr("class", "links");
    const linkElements = linkGroup
      .selectAll<SVGLineElement, SimLink>("line")
      .data(links)
      .join("line")
      .attr("stroke", "#374151")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => linkWidthScale(d.weight));

    // Draw nodes
    const nodeGroup = rootG.append("g").attr("class", "nodes");
    const nodeElements = nodeGroup
      .selectAll<SVGCircleElement, SimNode>("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => radiusScale(d.case_study_count))
      .attr("fill", (d) => getTacticColor(d.tactic_ids[0] || ""))
      .attr("stroke", "#111827")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer");

    // Tooltip div
    const tooltip = d3
      .select(container)
      .selectAll<HTMLDivElement, unknown>("div.graph-tooltip")
      .data([null])
      .join("div")
      .attr("class", "graph-tooltip")
      .style("position", "absolute")
      .style("pointer-events", "none")
      .style("background", "#1f2937")
      .style("border", "1px solid #374151")
      .style("border-radius", "8px")
      .style("padding", "10px 14px")
      .style("font-size", "13px")
      .style("color", "#f3f4f6")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.5)")
      .style("opacity", 0)
      .style("z-index", "100")
      .style("max-width", "260px");

    // Adjacency map for hover highlighting
    const adjacencyMap = new Map<string, Set<string>>();
    links.forEach((l) => {
      const sourceId = typeof l.source === "string" ? l.source : l.source.id;
      const targetId = typeof l.target === "string" ? l.target : l.target.id;
      if (!adjacencyMap.has(sourceId)) adjacencyMap.set(sourceId, new Set());
      if (!adjacencyMap.has(targetId)) adjacencyMap.set(targetId, new Set());
      adjacencyMap.get(sourceId)!.add(targetId);
      adjacencyMap.get(targetId)!.add(sourceId);
    });

    // Node interactions
    nodeElements
      .on("mouseenter", function (_event: MouseEvent, d: SimNode) {
        const neighbors = adjacencyMap.get(d.id) || new Set<string>();

        // Highlight connected edges, dim others
        linkElements
          .attr("stroke-opacity", (l) => {
            const sid = typeof l.source === "string" ? l.source : l.source.id;
            const tid = typeof l.target === "string" ? l.target : l.target.id;
            return sid === d.id || tid === d.id ? 0.9 : 0.08;
          })
          .attr("stroke", (l) => {
            const sid = typeof l.source === "string" ? l.source : l.source.id;
            const tid = typeof l.target === "string" ? l.target : l.target.id;
            return sid === d.id || tid === d.id
              ? getTacticColor(d.tactic_ids[0] || "")
              : "#374151";
          });

        // Dim unconnected nodes
        nodeElements.attr("opacity", (n) =>
          n.id === d.id || neighbors.has(n.id) ? 1 : 0.15
        );

        // Show tooltip
        tooltip
          .html(
            `<div style="font-weight:700;margin-bottom:4px;color:${getTacticColor(d.tactic_ids[0] || "")}">${d.name}</div>` +
              `<div style="font-family:monospace;font-size:11px;color:#9ca3af;margin-bottom:6px">${d.id}</div>` +
              `<div style="display:flex;gap:12px;font-size:12px;color:#d1d5db">` +
              `<span>Maturity: <b>${d.maturity || "N/A"}</b></span>` +
              `<span>Cases: <b>${d.case_study_count}</b></span>` +
              `</div>`
          )
          .style("opacity", 1);
      })
      .on("mousemove", function (event: MouseEvent) {
        const rect = container.getBoundingClientRect();
        tooltip
          .style("left", `${event.clientX - rect.left + 16}px`)
          .style("top", `${event.clientY - rect.top - 10}px`);
      })
      .on("mouseleave", function () {
        linkElements.attr("stroke-opacity", 0.6).attr("stroke", "#374151");
        nodeElements.attr("opacity", 1);
        tooltip.style("opacity", 0);
      })
      .on("click", function (_event: MouseEvent, d: SimNode) {
        router.push(`/technique/${d.id}`);
      });

    // Drag behavior
    const drag = d3
      .drag<SVGCircleElement, SimNode>()
      .on("start", (event: d3.D3DragEvent<SVGCircleElement, SimNode, SimNode>, d: SimNode) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event: d3.D3DragEvent<SVGCircleElement, SimNode, SimNode>, d: SimNode) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event: d3.D3DragEvent<SVGCircleElement, SimNode, SimNode>, d: SimNode) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeElements.call(drag);

    // Tick function
    simulation.on("tick", () => {
      linkElements
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeElements
        .attr("cx", (d) => d.x ?? 0)
        .attr("cy", (d) => d.y ?? 0);
    });

    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [graph, router]);

  useEffect(() => {
    const cleanup = renderGraph();
    return () => {
      if (cleanup) cleanup();
    };
  }, [renderGraph]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      renderGraph();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [renderGraph]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] min-h-[600px]">
        <div className="text-gray-400 text-lg">Loading technique graph...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)] min-h-[600px]">
        <div className="text-red-400 text-lg">Error: {error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">
            Technique Relationship Graph
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Techniques connected by co-occurrence in case studies. Node size =
            case study count. Edge thickness = co-occurrence weight.
          </p>
        </div>
        {graph && (
          <div className="text-sm text-gray-500">
            {graph.nodes.length} techniques &middot; {graph.edges.length} connections
          </div>
        )}
      </div>

      <div
        ref={containerRef}
        className="relative bg-gray-950 rounded-xl border border-gray-800 h-[calc(100vh-200px)] min-h-[600px] overflow-hidden"
      >
        <svg ref={svgRef} className="w-full h-full select-none" />

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-lg p-3 max-h-[300px] overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">
            Tactic Colors
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {Object.entries(TACTIC_COLORS).map(([tacticId, color]) => (
              <div key={tacticId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-xs text-gray-300 truncate">
                  {TACTIC_LABELS[tacticId] || tacticId}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
