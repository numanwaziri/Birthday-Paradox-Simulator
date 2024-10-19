import useResizableD3Container from "../../CustomHooks/useResizableD3Container.js";
import React, { useEffect, useRef, useState } from "react";

// import d3 modules
import { select, selectAll } from "d3-selection";
import { range, group } from "d3-array";
import { scalePoint } from "d3-scale";
import { transition } from "d3-transition";
import { path } from "d3-path";

export const ArcDiagram = ({
  numNodes,
  colors,
  margin = { top: 10, right: 10, bottom: 10, left: 10 },
}) => {
  const { containerRef, dimensions } = useResizableD3Container(margin);
  const arcRef = useRef(null);

  useEffect(() => {
    if (!arcRef.current) return; // Ensure the ref is defined

    const g = select(arcRef.current);

    // Clear previous SVG content
    g.selectAll("*").remove();

    // Number of nodes (people)

    const nodes = range(numNodes).map((d) => ({ id: d }));

    // Generate pairs for the nodes
    const links = [];
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        links.push({ source: i, target: j });
      }
    }

    const isMobile = dimensions.width < 560;

    // Create a scale for positioning nodes in a line (horizontal for larger screens, vertical for mobile)
    const xScale = scalePoint()
      .domain(nodes.map((d) => d.id))
      .range([0, isMobile ? dimensions.innerHeight : dimensions.innerWidth])
      .padding(0.5);

    // Draw arcs (connections)
    const linkGroup = g.append("g").attr("class", "links");

    const arcGenerator = (d) => {
      if (isMobile) {
        // For vertical alignment on mobile

        const sourceY = xScale(d.source); // Vertical positioning using yScale
        const targetY = xScale(d.target); // Vertical positioning using yScale

        // Determine the control point's X position for a full-width arc
        const controlPointX = d.source % 2 === 0 ? 0 : dimensions.innerWidth;

        const arcPath = path();
        arcPath.moveTo(dimensions.innerWidth / 2, sourceY); // Start at the source point vertically

        // Calculate control point and create an arc that reaches the left or right
        arcPath.arcTo(
          controlPointX,
          (sourceY + targetY) / 2,
          dimensions.innerWidth / 2,
          targetY,
          (targetY - sourceY) / 2,
        );

        arcPath.lineTo(dimensions.innerWidth / 2, targetY); // Line to the target point vertically
        return arcPath.toString();
      } else {
        // For horizontal alignment on larger screens

        const sourceX = xScale(d.source);
        const targetX = xScale(d.target);

        // Determine the control point's Y position for a full-height arc
        const controlPointY = d.source % 2 === 0 ? 0 : dimensions.innerHeight;

        const arcPath = path();
        arcPath.moveTo(sourceX, dimensions.innerHeight / 2);

        // Calculate control point and create an arc that reaches the top or bottom
        arcPath.arcTo(
          (sourceX + targetX) / 2,
          controlPointY,
          targetX,
          dimensions.innerHeight / 2,
          (targetX - sourceX) / 2,
        );

        arcPath.lineTo(targetX, dimensions.innerHeight / 2);
        return arcPath.toString();
      }
    };

    const arcTransition = transition("arcTransition").duration(1000); // Named transition for arcs
    // Group links by their source
    const groupedLinks = group(links, (d) => d.source);
    // Reverse the order of grouped links to animate from end to start
    const reversedGroupedLinks = Array.from(groupedLinks.entries()).reverse();

    const totalDuration = 7000; // Fixed total duration for all animations
    const delayPerGroup = totalDuration / reversedGroupedLinks.length; // Delay between each group

    // Draw and animate arcs one group at a time
    reversedGroupedLinks.forEach(([source, arcs], i) => {
      linkGroup
        .selectAll(`path.source-${source}`)
        .data(arcs)
        .join("path")
        .attr("class", (d) => `link source-${d.source} target-${d.target}`)
        .attr("d", arcGenerator)
        .attr("fill", "none")
        .attr("stroke", "gray")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 0.8)
        .attr("stroke-dasharray", function () {
          const length = this.getTotalLength();
          return `${length} ${length}`;
        })
        .attr("stroke-dashoffset", function () {
          return this.getTotalLength();
        })
        .transition(arcTransition)
        .delay(i * delayPerGroup)
        .attr("stroke-dashoffset", 0);
    });

    // Draw nodes after arcs to appear on top
    const nodeGroup = g
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("id", (d) => `node-${d.id}`)
      .attr("cy", isMobile ? (d) => xScale(d.id) : dimensions.innerHeight / 2)
      .attr("fill", colors.line)
      .attr("cx", isMobile ? dimensions.innerWidth / 2 : (d) => xScale(d.id))
      .attr("r", 0); // Start with 0 opacity for animation
    nodeGroup.transition().duration(500).attr("r", 6); // Fade in
    // Add hover interactions for nodes
    nodeGroup
      .on("mouseover", function (event, d) {
        selectAll(".link").attr("stroke-opacity", 0.1);
        selectAll(`.link.source-${d.id}, .link.target-${d.id}`)
          .attr("stroke", colors.line)
          .attr("stroke-width", 2)
          .attr("stroke-opacity", 0.8);
        select(this)
          .transition()
          .duration(200)
          .attr("r", 8)
          .attr("fill", colors.failure);
      })
      .on("mouseout", function (event, d) {
        selectAll(".link")
          .attr("stroke", "gray")
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.8);
        select(this)
          .transition()
          .duration(200)
          .attr("r", 6)
          .attr("fill", colors.line);
      });

    // Add hover interactions for arcs after nodes are created
    reversedGroupedLinks.forEach(([source, arcs]) => {
      linkGroup
        .selectAll(`path.source-${source}`)
        .on("mouseover", function (event, d) {
          selectAll(".link").attr("stroke-opacity", 0.1);
          select(this)
            .attr("stroke", colors.line)
            .attr("stroke-width", 3)
            .attr("stroke-opacity", 1);

          selectAll(`#node-${d.source}, #node-${d.target}`)
            .transition()
            .duration(200)
            .attr("r", 8)
            .attr("fill", colors.line);
        })
        .on("mouseout", function (event, d) {
          selectAll(".link")
            .attr("stroke", "gray")
            .attr("stroke-width", 1)
            .attr("stroke-opacity", 0.8);

          selectAll(`#node-${d.source}, #node-${d.target}`)
            .transition()
            .duration(200)
            .attr("r", 6)
            .attr("fill", colors.line);
        });
    });
  }, [dimensions.width]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
    >
      <svg
        style={{ border: "1px solid cyyan" }}
        width={dimensions.width}
        height={dimensions.height}
      >
        <g
          transform={`translate(${margin.left},${margin.top})`}
          ref={arcRef}
        ></g>
      </svg>
    </div>
  );
};
