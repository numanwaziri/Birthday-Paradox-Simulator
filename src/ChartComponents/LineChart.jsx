import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import { SimulationContext } from "../CustomHooks/SimulationContext.jsx";
import useResizableD3Container from "../CustomHooks/useResizableD3Container.js";
// import * as d3 from "d3";
//import d3 modules
import { select, selectAll } from "d3-selection";
import { scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { easeLinear } from "d3-ease";
import { format } from "d3-format";
import { line, area } from "d3-shape";

// Helper function to calculate the exact birthday problem probability
function calculateExactBirthdayProbability(n) {
  if (n <= 1) return 0;

  let probability = 1;
  for (let i = 0; i < n; i++) {
    probability *= (365 - i) / 365;
  }
  return 1 - probability;
}

export const LineChart = ({ margin, speed, colors }) => {
  const { simulationData } = useContext(SimulationContext);
  const [data, setData] = useState([]);
  const { containerRef, dimensions } = useResizableD3Container(margin);
  const lineChartRef = useRef(null);
  // State to track the hovered point and moouse position
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isMobile = dimensions.width < 638 && window.innerWidth < 900;

  useEffect(() => {
    if (simulationData.numSimulations === 0) {
      setData([]); // Reset data to an empty array when simulationData is null
    }
  }, [simulationData]);

  useEffect(() => {
    const newEntry = {
      trial: simulationData.successes + simulationData.failures,
      success_rate:
        simulationData.successes /
        (simulationData.successes + simulationData.failures),
    };

    setData((prevData) => {
      // Filter out entries with NaN success rate
      const filteredData = [...prevData, newEntry].filter(
        (d) => !isNaN(d.success_rate),
      );
      return filteredData;
    });
  }, [simulationData]);

  // Theoretical probability for the given number of people using the exact formula
  // Memoize the theoretical probability calculation
  const theoreticalProbability = useMemo(() => {
    return calculateExactBirthdayProbability(simulationData?.numOfNodes);
  }, [simulationData.numOfNodes]);

  useEffect(() => {
    const chartContainer = select(lineChartRef.current);
    const svg = select(lineChartRef.current.parentNode);

    // Define the gradient
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", colors.line)
      .attr("stop-opacity", 0.5);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", colors.line)
      .attr("stop-opacity", 0);

    // Set up scales
    const xScale = scaleLinear()
      .domain([1, max(data, (d) => d.trial)])
      .range([
        0,
        isMobile ? dimensions.innerWidth + 40 : dimensions.innerWidth,
      ]);

    const yScale = scaleLinear()
      .domain([0, 1])
      .range([dimensions.innerHeight, 0]);

    // Set up axes
    // Set up axes with dynamic tick sizes based on `isMobile`
    const xAxis = axisBottom(xScale).ticks(isMobile ? 3 : 5);
    const yAxis = axisLeft(yScale)
      .tickValues([0, 0.25, 0.5, 0.75, 1])
      .tickFormat(format(".0%"))
      .tickSize(
        isMobile ? -(dimensions.innerWidth + 40) : -dimensions.innerWidth,
      );

    // Set up the area generator for the shaded area
    const areaUnderLine = area()
      .x((d) => xScale(d.trial))
      .y0(dimensions.innerHeight) // Start at the bottom of the chart
      .y1((d) => yScale(d.success_rate));

    // Append the gradient area
    chartContainer
      .selectAll(".area")
      .data([data])
      .join("path")
      .attr("class", "area")
      .attr("fill", "url(#line-gradient)") // Use the gradient defined above
      // .attr("d", area)
      .transition()
      .duration(speed)
      .ease(easeLinear)
      .attr("d", areaUnderLine);

    selectAll(".y-axis line")
      .attr("stroke-width", 0.7)
      .attr("stroke", "grey") // Set the color of the grid lines
      .attr("stroke-dasharray", "4 4")
      .attr("stroke-opacity", 0.55);

    selectAll(".domain, .x-axis line").attr("stroke-opacity", 0);

    chartContainer
      .select(".x-axis")
      .attr("transform", `translate(0,${dimensions.innerHeight})`)
      .transition("axis_moving")
      .ease(easeLinear)
      .duration(speed)
      .call(xAxis);

    chartContainer.select(".y-axis").call(yAxis);

    chartContainer
      .selectAll(".x-axis text")
      .style("pointer-events", "none")
      .style("font-size", isMobile ? "10px" : "12px"); // Adjust x-axis tick label size

    chartContainer
      .selectAll(".y-axis text")
      .style("pointer-events", "none")
      .style("font-size", isMobile ? "10px" : "12px"); // Adjust y-axis tick label size

    chartContainer
      .selectAll(".x-axis text")
      .style("font-size", isMobile ? "10px" : "12px"); // Adjust x-axis tick label size

    chartContainer
      .selectAll(".y-axis text")
      .style("font-size", isMobile ? "10px" : "12px"); // Adjust y-axis tick label size

    // Remove any existing y-axis label before adding a new one
    svg.selectAll(".y-axis-label.y-axis-label").remove();
    svg.selectAll(".x-axis-label").remove();
    // Add y-axis label to the SVG
    svg
      .append("text")
      .attr("class", "y-axis-label")
      .attr("transform", `translate(0, ${isMobile ? 9 : 3}) `)
      .attr("text-anchor", "start")
      .attr("dominant-baseline", "hanging")
      .attr("fill", colors.text)
      .text("GROUPS WITH SHARED BIRTHDAY (%)")
      .style("pointer-events", "none")
      .style("font-size", isMobile ? "12px" : "15px")
      .style("font-weight", "bold"); // You can also use "Birthday Match Probability" or another suitable term
    svg
      .append("text")
      .attr("class", "x-axis-label")
      .attr(
        "transform",
        `translate(${isMobile ? dimensions.width - 20 : dimensions.width - 55}, ${dimensions.height - 40})  `,
      )
      .attr("text-anchor", "end")
      .attr("fill", colors.text)
      .text("GROUPS GENERATED")
      .style("pointer-events", "none")
      .style("font-size", isMobile ? "12px" : "15px")
      .style("font-weight", "bold"); // You can also use "Birthday Match Probability" or another suitable term

    // Calculate the shaded area boundaries
    // Set up the line generator
    const mainLine = line()
      .x((d) => xScale(d.trial))
      .y((d) => yScale(d.success_rate));

    // chartContainer.selectAll(".lineChart-line").remove();

    // Bind data and draw the line
    // Update line chart
    const lineChartLine = chartContainer
      .selectAll(".lineChart-line")
      .data([data], (d) => d.trial);

    lineChartLine
      .enter()
      .append("path")
      .attr("class", "lineChart-line")
      .attr("fill", "none")
      .attr("stroke", colors.line)
      .attr("stroke-width", 3)
      .merge(lineChartLine) // Merge with existing selection
      .transition("line_moving")
      .ease(easeLinear)
      .duration(speed)
      // Duration for animation
      .attr("d", mainLine);

    // Add line following the line along the theoretical probability
    const theoreticalLine = line() // Smooth curve with rounded edges
      .x((d) => xScale(d.trial))
      .y(() => yScale(theoreticalProbability)); // Fixed y value at theoretical probability

    chartContainer
      .selectAll(".theoretical-line")
      .data([data])
      .join("path")
      .attr("class", "theoretical-line")
      .attr("fill", "none")
      .attr("stroke", "#d59a30")
      .attr("stroke-width", 2.5)
      .attr("stroke-dasharray", "4 4") // Dashed line style
      .transition()
      .duration(speed)
      .attr("d", theoreticalLine);
    chartContainer.selectAll(".theoretical-annot").remove();

    if (simulationData.failures + simulationData.successes > 0) {
      chartContainer
        .selectAll(".annot")
        .data([0])
        .join("text")
        .attr("class", "annot")
        .attr("opacity", data.length >= 1 ? 1 : 0)

        .attr(
          "x",
          isMobile
            ? xScale(data[data.length - 1]?.trial) - 30 || 0
            : xScale(data[data.length - 1]?.trial) + 8 || 0,
        )
        .attr("text-anchor", "start")
        .attr("dominant-baseline", "middle")
        .text(
          simulationData.numSimulations > 0
            ? `${((data[data.length - 1]?.success_rate || 0) * 100).toFixed(1)}%`
            : "", // 0 if Nan
        )
        .style("font-weight", "bold")
        .style("pointer-events", "none")
        .style("font-size", isMobile ? "12px" : "14px")
        .attr("fill", colors.line)
        .transition("text_moving")
        .duration(speed)
        .ease(easeLinear)
        .attr(
          "y",
          isMobile
            ? yScale(data[data.length - 1]?.success_rate + 0.05)
            : yScale(data[data.length - 1]?.success_rate),
        );
    }
  }, [data, dimensions.width, simulationData.numOfNodes, simulationData]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
    >
      <svg
        style={{ border: "1px solrid green" }}
        width={dimensions.width}
        height={dimensions.height}
      >
        <g
          transform={`translate(${margin.left},${margin.top})`}
          ref={lineChartRef}
        >
          <g className="x-axis" />
          <g className="y-axis" />
        </g>
      </svg>
    </div>
  );
};
