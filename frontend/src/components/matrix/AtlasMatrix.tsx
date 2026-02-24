"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { useRouter } from "next/navigation";
import { getTacticColor, MATURITY_COLORS } from "@/lib/colors";
import type { MatrixResponse, TacticSummary, TechniqueSummary } from "@/lib/types";
import MatrixLegend from "./MatrixLegend";
import TechniqueTooltip from "./TechniqueTooltip";

interface Props {
  matrix: MatrixResponse;
}

// Layout constants
const COL_WIDTH = 170;
const COL_GAP = 8;
const HEADER_HEIGHT = 72;
const CELL_HEIGHT = 52;
const CELL_GAP = 4;
const CELL_PADDING_X = 10;
const CELL_PADDING_Y = 8;
const MATRIX_PADDING = 16;

interface HoverState {
  technique: TechniqueSummary;
  tacticColor: string;
  x: number;
  y: number;
  subtechniqueCount: number;
}

export default function AtlasMatrix({ matrix }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [activeMaturity, setActiveMaturity] = useState<string | null>(null);
  const [hoveredTechnique, setHoveredTechnique] = useState<HoverState | null>(null);
  const [hoveredTacticId, setHoveredTacticId] = useState<string | null>(null);

  // Sort tactics by matrix_order
  const tactics = useMemo(
    () => [...matrix.tactics].sort((a, b) => a.matrix_order - b.matrix_order),
    [matrix.tactics]
  );

  // Build technique data per tactic column, filtering by maturity
  const columns = useMemo(() => {
    return tactics.map((tactic) => {
      const allTechniques = matrix.tactic_techniques[tactic.id] || [];
      const parentTechniques = allTechniques.filter((t) => !t.is_subtechnique);
      const filtered = activeMaturity
        ? parentTechniques.filter((t) => t.maturity === activeMaturity)
        : parentTechniques;

      // Count subtechniques per parent for tooltip
      const subtechCounts: Record<string, number> = {};
      for (const t of allTechniques) {
        if (t.is_subtechnique) {
          // The parent ID is the part before the last dot segment
          const parentId = t.id.replace(/\.\d+$/, "");
          subtechCounts[parentId] = (subtechCounts[parentId] || 0) + 1;
        }
      }

      return { tactic, techniques: filtered, subtechCounts };
    });
  }, [tactics, matrix.tactic_techniques, activeMaturity]);

  // Total technique count (for legend)
  const totalTechniques = useMemo(() => {
    const seen = new Set<string>();
    for (const col of columns) {
      for (const t of col.techniques) {
        seen.add(t.id);
      }
    }
    return seen.size;
  }, [columns]);

  // Compute SVG dimensions
  const maxRows = Math.max(...columns.map((c) => c.techniques.length), 1);
  const svgWidth = columns.length * (COL_WIDTH + COL_GAP) - COL_GAP + MATRIX_PADDING * 2;
  const svgHeight =
    HEADER_HEIGHT + maxRows * (CELL_HEIGHT + CELL_GAP) + MATRIX_PADDING * 2;

  // D3 rendering
  const renderMatrix = useCallback(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${MATRIX_PADDING}, ${MATRIX_PADDING})`);

    columns.forEach((col, colIndex) => {
      const x = colIndex * (COL_WIDTH + COL_GAP);
      const color = getTacticColor(col.tactic.id);

      const colGroup = g.append("g").attr("transform", `translate(${x}, 0)`);

      // Tactic header background
      colGroup
        .append("rect")
        .attr("width", COL_WIDTH)
        .attr("height", HEADER_HEIGHT)
        .attr("rx", 8)
        .attr("fill", `${color}15`)
        .attr("stroke", hoveredTacticId === col.tactic.id ? color : "transparent")
        .attr("stroke-width", 1.5)
        .style("cursor", "default")
        .on("mouseenter", () => setHoveredTacticId(col.tactic.id))
        .on("mouseleave", () => setHoveredTacticId(null));

      // Top border accent
      colGroup
        .append("rect")
        .attr("width", COL_WIDTH)
        .attr("height", 3)
        .attr("rx", 1.5)
        .attr("fill", color);

      // Tactic ID
      colGroup
        .append("text")
        .attr("x", COL_WIDTH / 2)
        .attr("y", 22)
        .attr("text-anchor", "middle")
        .attr("fill", color)
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .attr("opacity", 0.8)
        .text(col.tactic.id);

      // Tactic name (wrap if needed)
      const name = col.tactic.name;
      if (name.length > 18) {
        const mid = name.lastIndexOf(" ", 18);
        const line1 = name.substring(0, mid > 0 ? mid : 18);
        const line2 = name.substring(mid > 0 ? mid + 1 : 18);
        colGroup
          .append("text")
          .attr("x", COL_WIDTH / 2)
          .attr("y", 38)
          .attr("text-anchor", "middle")
          .attr("fill", "#f3f4f6")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .text(line1);
        colGroup
          .append("text")
          .attr("x", COL_WIDTH / 2)
          .attr("y", 51)
          .attr("text-anchor", "middle")
          .attr("fill", "#f3f4f6")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .text(line2);
      } else {
        colGroup
          .append("text")
          .attr("x", COL_WIDTH / 2)
          .attr("y", 42)
          .attr("text-anchor", "middle")
          .attr("fill", "#f3f4f6")
          .attr("font-size", "11px")
          .attr("font-weight", "600")
          .text(name);
      }

      // Technique count
      colGroup
        .append("text")
        .attr("x", COL_WIDTH / 2)
        .attr("y", HEADER_HEIGHT - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "#6b7280")
        .attr("font-size", "9px")
        .text(
          `${col.techniques.length} technique${col.techniques.length !== 1 ? "s" : ""}`
        );

      // Technique cells
      col.techniques.forEach((tech, rowIndex) => {
        const cy = HEADER_HEIGHT + CELL_GAP + rowIndex * (CELL_HEIGHT + CELL_GAP);
        const maturityColor = tech.maturity
          ? MATURITY_COLORS[tech.maturity] || "#6b7280"
          : null;

        const cellGroup = colGroup
          .append("g")
          .attr("transform", `translate(0, ${cy})`)
          .style("cursor", "pointer")
          .on("click", () => {
            router.push(`/technique/${tech.id}`);
          })
          .on("mouseenter", function (event: MouseEvent) {
            d3.select(this).select("rect.cell-bg")
              .transition()
              .duration(150)
              .attr("fill", "#1f2937")
              .attr("stroke", `${color}80`);

            setHoveredTechnique({
              technique: tech,
              tacticColor: color,
              x: event.clientX,
              y: event.clientY,
              subtechniqueCount: col.subtechCounts[tech.id] || 0,
            });
          })
          .on("mousemove", function (event: MouseEvent) {
            setHoveredTechnique((prev) =>
              prev
                ? { ...prev, x: event.clientX, y: event.clientY }
                : null
            );
          })
          .on("mouseleave", function () {
            d3.select(this).select("rect.cell-bg")
              .transition()
              .duration(150)
              .attr("fill", "#111827")
              .attr("stroke", "#1f2937");

            setHoveredTechnique(null);
          });

        // Cell background
        cellGroup
          .append("rect")
          .attr("class", "cell-bg")
          .attr("width", COL_WIDTH)
          .attr("height", CELL_HEIGHT)
          .attr("rx", 6)
          .attr("fill", "#111827")
          .attr("stroke", "#1f2937")
          .attr("stroke-width", 1);

        // Technique ID
        cellGroup
          .append("text")
          .attr("x", CELL_PADDING_X)
          .attr("y", CELL_PADDING_Y + 10)
          .attr("fill", "#6b7280")
          .attr("font-size", "9px")
          .attr("font-family", "monospace")
          .text(tech.id);

        // Maturity dot
        if (maturityColor) {
          cellGroup
            .append("circle")
            .attr("cx", COL_WIDTH - CELL_PADDING_X - 4)
            .attr("cy", CELL_PADDING_Y + 6)
            .attr("r", 3.5)
            .attr("fill", maturityColor)
            .attr("opacity", 0.9);
        }

        // Technique name (truncate if needed)
        const displayName =
          tech.name.length > 22
            ? tech.name.substring(0, 21) + "..."
            : tech.name;
        cellGroup
          .append("text")
          .attr("x", CELL_PADDING_X)
          .attr("y", CELL_PADDING_Y + 28)
          .attr("fill", "#d1d5db")
          .attr("font-size", "11px")
          .attr("font-weight", "500")
          .text(displayName);

        // Subtechnique count indicator
        const subCount = col.subtechCounts[tech.id] || 0;
        if (subCount > 0) {
          cellGroup
            .append("text")
            .attr("x", COL_WIDTH - CELL_PADDING_X)
            .attr("y", CELL_PADDING_Y + 28)
            .attr("text-anchor", "end")
            .attr("fill", "#4b5563")
            .attr("font-size", "9px")
            .text(`+${subCount}`);
        }

        // Left color accent bar
        cellGroup
          .append("rect")
          .attr("x", 0)
          .attr("y", 6)
          .attr("width", 3)
          .attr("height", CELL_HEIGHT - 12)
          .attr("rx", 1.5)
          .attr("fill", color)
          .attr("opacity", 0.5);
      });
    });
  }, [columns, hoveredTacticId, router]);

  useEffect(() => {
    renderMatrix();
  }, [renderMatrix]);

  return (
    <div>
      <MatrixLegend
        version={matrix.version}
        tacticCount={tactics.length}
        techniqueCount={totalTechniques}
        activeMaturity={activeMaturity}
        onMaturityFilter={setActiveMaturity}
      />

      <div
        ref={containerRef}
        className="matrix-scroll overflow-x-auto pb-4 relative"
      >
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          className="select-none"
        />
      </div>

      {hoveredTechnique && (
        <TechniqueTooltip
          technique={hoveredTechnique.technique}
          tacticColor={hoveredTechnique.tacticColor}
          x={hoveredTechnique.x}
          y={hoveredTechnique.y}
          subtechniqueCount={hoveredTechnique.subtechniqueCount}
        />
      )}
    </div>
  );
}
