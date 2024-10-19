import React, { useRef, useEffect, useContext } from "react";
import useResizableD3Container from "../../CustomHooks/useResizableD3Container.js";
import { SimulationContext } from "../../CustomHooks/SimulationContext.jsx";
// import d3 modules
import { select, selectAll } from "d3-selection";
import { arc, pie } from "d3-shape";
import { scaleOrdinal } from "d3-scale";
import { interpolate } from "d3-interpolate"; // For arcTween

export const PieChart = React.memo(
  ({
    speed,
    colors,
    numNodes,
    margin = {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
  }) => {
    const { simulationData, setSimulationData } = useContext(SimulationContext);
    const pieRef = useRef(null);

    const { containerRef, dimensions } = useResizableD3Container(margin);

    const isMobile = dimensions.width < 440 || window.innerWidth < 580;
    // console.log(isMobile);

    const radius = Math.min(dimensions.width, dimensions.height) / 2;
    const arcGenerator = arc()
      .innerRadius(radius * 0.89)
      .outerRadius(radius * 0.99)
      .cornerRadius(0);

    //pie chart outline
    select(pieRef.current)
      .selectAll("#outline")
      .data([0])
      .join("path")
      .attr("id", "outline")
      .attr(
        "d",
        arcGenerator({
          startAngle: 0,
          endAngle: 2 * Math.PI,
        }),
      )
      .lower()
      .transition()

      .attr(
        "transform",
        simulationData.numSimulations > 0
          ? "translate(6,10)"
          : "translate(0,5)",
      )
      .attr("fill", colors.node)
      .attr("opacity", 0.9);

    useEffect(() => {
      // Define the glow filter
      const svg = select(pieRef.current.parentNode);

      const defs = svg.append("defs");

      const filter = defs
        .append("filter")
        .attr("id", "glow")
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      const filter2 = defs
        .append("filter")
        .attr("id", "drop-shadow") // Unique ID for the filter
        .attr("x", "-50%")
        .attr("y", "-50%")
        .attr("width", "200%")
        .attr("height", "200%");

      // Define the shadow properties
      filter2
        .append("feDropShadow")
        .attr("dx", -4) // Shadow offset on the x-axis
        .attr("dy", -1) // Shadow offset on the y-axis
        .attr("stdDeviation", 3) // Blur radius
        .attr("flood-color", "black") // Shadow color
        .attr("flood-opacity", 0.3); // Shadow opacity

      filter
        .append("feGaussianBlur")
        .attr("stdDeviation", "3.5")
        .attr("result", "coloredBlur");

      const feMerge = filter.append("feMerge");

      feMerge.append("feMergeNode").attr("in", "coloredBlur");
      feMerge.append("feMergeNode").attr("in", "SourceGraphic");

      // Determine if the success count has increased or decreased

      // Pie chart data
      const pieData = [
        { type: "MATCH", value: simulationData.successes },
        { type: "MISS", value: simulationData.failures },
      ];

      const total = pieData.reduce((acc, d) => acc + d.value, 0); // Calculate total value

      const colorScale = scaleOrdinal()
        .domain(pieData.map((d) => d.type))
        .range([colors.success, colors.failure]); // Green for successes, Red for failures

      const pieChart = pie()
        .value((d) => d.value)
        .sortValues((d) => d.type)
        .padAngle(0.0);
      // .sort((a) => (a.type === "Successes" ? -1 : 1));

      function arcTween(a) {
        var i = interpolate(this._current, a);
        this._current = i(0);
        return function (t) {
          return arcGenerator(i(t));
        };
      }

      // Select all arcs
      const arcs = select(pieRef.current)
        .selectAll(".arc")
        .data(pieChart(pieData), (d) => d.data.type);

      // Handle entering and updating arcs
      arcs
        .enter()
        .append("g")
        .attr("class", "arc")
        .append("path")
        .attr("d", arcGenerator)
        .attr("fill", (d) => colorScale(d.data.type))
        // .attr("filter", "url(#drop-shadow)") // Apply the drop shadow filter
        // .style("filter", "drop-shadow(0 0 5px rgba(0, 0, 0, 0.5))")
        .attr("transform", `translate(0,5)`)
        .attr("stroke-width", 0.8)
        .attr("stroke", "#111827")
        .attr("stroke-opacity", 1)
        // .attr("filter", "url(#glow)") // Apply the glow filter
        .each(function (d) {
          this._current = d;
        });

      // Transition existing arcs
      arcs.select("path").transition().duration(speed).attrTween("d", arcTween);

      // Remove exiting arcs
      arcs.exit().remove();

      selectAll(".central-text-total").remove();

      const textContainer = select(pieRef.current)
        .append("g")
        .attr("class", "central-text-total")

        .style(
          "transform",
          isMobile
            ? "scale(0.9) translateY(58px)"
            : "scale(1) translateY(60px)",
        );

      selectAll(".central-text-total")
        .append("rect")
        .attr("fill", colors.background)
        .attr("fill-opacity", 0.75)
        .attr("width", 190)
        .attr("height", 80)
        .attr("rx", 15)
        .style("transform", "translate(-100px,-100px)");

      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("text")
        .attr("text-anchor", "middle")
        .text(`RANDOM BIRTHDAY GROUPS`)
        .style("font-size", "0.85rem")
        .attr("fill", colors.textSecondary)
        .style("transform", "translateY(-30px)")
        .style("font-weight", "bold");
      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("text")
        .attr("text-anchor", "middle")
        .text(`GENERATED`)
        .style("opacity", 0.9)
        .style("font-size", "0.8rem")
        .attr("fill", colors.textSecondary)
        .style("transform", "translateY(-15px)")
        .style("font-weight", "bold");

      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("text")
        .attr("text-anchor", "middle")
        .text("MATCH")
        .style("font-size", "0.7rem")
        .attr(
          "fill",
          simulationData.numSimulations < 1
            ? colors.textSecondary
            : simulationData.isLatestSuccess
              ? colors.success
              : colors.textSecondary,
        )
        .style("transform", "translate(60px,-77px)")
        .style("font-weight", "bold");

      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("text")
        .attr("text-anchor", "middle")
        .text("MISS")
        .style("font-size", "0.7rem")
        .attr(
          "fill",
          simulationData.numSimulations < 1
            ? colors.textSecondary
            : !simulationData.isLatestSuccess
              ? colors.failure
              : colors.textSecondary,
        )
        .style("transform", "translate(-60px,-77px)")
        .style("font-weight", "bold");

      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("text")
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .text(simulationData.failures + simulationData.successes)
        .attr("fill", colors.text)
        .style("font-size", "1.8rem")
        .style("font-weight", "bold")
        .style("transform", "translateY(-56px)");
      // textContainer
      //   .selectAll(".central-text-total")
      //   .data([0])
      //   .join("text")
      //   .attr("text-anchor", "middle")
      //   .text(simulationData.isLatestSuccess ? "Match" : "No Match")
      //   .style("font-size", "1.8rem")
      //   .style("font-weight", "bold")
      //   .style("transform", "translateY(-80px)");
      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("circle")
        .attr("r", "10")
        .attr("cy", "-60")
        .attr("cx", "60")
        .attr(
          "fill",
          simulationData.isLatestSuccess
            ? colors.success
            : colors.textSecondary,
        )
        .attr("filter", simulationData.isLatestSuccess ? "url(#glow)" : ""); // Apply the glow filter;

      textContainer
        .selectAll(".central-text-total")
        .data([0])
        .join("circle")
        .attr("r", "10")
        .attr("cy", "-60")
        .attr("cx", "-60")
        .attr(
          "fill",
          simulationData.numSimulations < 1
            ? colors.textSecondary
            : !simulationData.isLatestSuccess
              ? colors.failure
              : colors.textSecondary,
        )
        .attr(
          "filter",
          !simulationData.isLatestSuccess && simulationData.numSimulations > 0
            ? "url(#glow)"
            : "",
        ); // Apply the glow filter;

      // Select all arcs
      const textPaths = select(pieRef.current)
        .selectAll(".text-path")
        .data(pieChart(pieData), (d) => d.data.type);

      // Handle entering and updating arcs
      textPaths
        .enter()
        .append("g")
        .attr("class", "text-path")
        .append("path")
        .attr("id", (d, i) => `textPath_${i}`)
        .attr("d", arcGenerator)
        .style("fill", "none")
        .style("stroke", "none")
        .each(function (d) {
          this._current = d;
        });

      // Transition existing arcs
      textPaths
        .select("path")
        .transition()
        .duration(speed)
        .attrTween("d", arcTween);

      // Remove exiting arcs
      textPaths.exit().remove();

      select(pieRef.current).selectAll(".pie-label").remove();

      // Append text labels that follow the path of the arc
      select(pieRef.current)
        .selectAll(".pie-label")
        .data(pieChart(pieData), (d) => d)
        .join("text")
        .attr("class", "pie-label")
        .attr("dy", "-15px") // Adjust the distance of the text from the arc
        .attr("dx", (d) => (d.data.type === "MATCH" ? "80" : "-170px"))
        .style("fill", (d) =>
          d.data.type === "MATCH" ? colors.success : colors.failure,
        )
        .style("font-size", isMobile ? "13px" : "15px")
        .style("font-weight", "bold")
        // .style("text-shadow", "1px 1px 2px rgba(0, 0, 0, 0.5)")
        .append("textPath")
        .attr("xlink:href", (d, i) => `#textPath_${i}`)
        .attr("startOffset", (d) => (d.data.type === "MATCH" ? "0%" : `48%`)) // 23 Centers the text on the path
        .attr("text-anchor", (d) => "start")
        .attr("dominant-baseline", "hanging")
        .text((d) => {
          const percentage = ((d.data.value / total) * 100).toFixed(1);
          // if (d.data.type === "Misses") {
          //   return "";
          // }
          if (percentage < 15) {
            return ""; // Hide text if percentage is less than 2%
          }
          return percentage < 18
            ? `${percentage}%` // Show only percentage if it's between 2% and 6%
            : `${d.data.type}: ${d.data.value} (${percentage}%)`; // Show type and percentage otherwise
        });
    }, [
      simulationData.numSimulations,
      dimensions.width,
      isMobile,
      speed,
      numNodes,
    ]);

    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
      >
        <svg
          style={{ border: "1px solid ccyan" }}
          width={dimensions.width + 10}
          height={dimensions.height + 10}
        >
          <g
            transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}
            ref={pieRef}
          ></g>
        </svg>
      </div>
    );
  },
);
