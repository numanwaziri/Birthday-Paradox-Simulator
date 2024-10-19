import React, {
  useRef,
  useState,
  useEffect,
  useContext,
  useImperativeHandle,
  forwardRef,
} from "react";
import useResizableD3Container from "../CustomHooks/useResizableD3Container.js";
import { SimulationContext } from "../CustomHooks/SimulationContext.jsx";
// d3 modules import
import { select } from "d3-selection";
import { line, curveBundle, pointRadial } from "d3-shape";

// Resizable Container Component
const NodeChartSimulationController = forwardRef(
  (
    {
      margin = { top: 0, right: 0, bottom: 0, left: 0 },
      speed,
      colors,
      numNodes,
    },
    ref,
  ) => {
    const { simulationData, setSimulationData } = useContext(SimulationContext);
    const [isSimulating, setIsSimulating] = useState(false);
    const [intervalId, setIntervalId] = useState(null);

    const { containerRef, dimensions } = useResizableD3Container(margin);
    const scatterplotRef = useRef(null);

    const g = select(scatterplotRef.current);

    const defs = g.append("defs");

    const filter = defs
      .append("filter")
      .attr("id", "glowNodes")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");

    filter
      .append("feGaussianBlur")
      .attr("stdDeviation", "2")
      .attr("result", "coloredBlur");

    const feMerge = filter.append("feMerge");

    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    const padding = window.innerWidth < 900 ? 30 : 35; // Padding between nodes

    useEffect(() => {
      // Set simulationData to null whenever numNodes changes
      setSimulationData({
        isLatestSuccess: null,
        successes: 0,
        failures: 0,
        totalMatches: 0,
        numSimulations: 0,
        averageMatches: 0,
        numOfNodes: 23,
      });
    }, [numNodes]);
    // Function to calculate node size based on the number of nodes and radius
    const calculateNodeSize = (numNodes, padding = 30) => {
      // Internal constants
      const minSize = 15; // Minimum size of the node
      const maxSize = 25; // Maximum size of the node
      const minNodesForMaxSize = 23; // Minimum number of nodes for max size
      const maxNodesForMinSize = 50; // Maximum number of nodes for min size

      // Calculate the circumference of the circle
      const circumference =
        Math.PI * Math.min(dimensions.width, dimensions.height);

      // Calculate the effective space available for nodes
      const effectiveCircumference = circumference - numNodes * padding;

      // Determine the size based on node count
      let nodeSize;

      if (numNodes <= minNodesForMaxSize) {
        nodeSize = maxSize; // Use maximum size for fewer nodes
      } else if (numNodes >= maxNodesForMinSize) {
        nodeSize = minSize; // Use minimum size for many nodes
      } else {
        // Interpolate linearly between maxSize and minSize
        const range = maxNodesForMinSize - minNodesForMaxSize;
        const factor = (numNodes - minNodesForMaxSize) / range;
        nodeSize = maxSize - factor * (maxSize - minSize);
      }

      // Ensure node size fits within the effective space and does not fall below minSize
      nodeSize = Math.max(
        minSize,
        Math.min(nodeSize, effectiveCircumference / numNodes),
      );

      return nodeSize;
    };

    // Function to generate a random date
    const getRandomDate = () => {
      const start = new Date(2024, 0, 1); // Start date: January 1
      const end = new Date(2024, 11, 31); // End date: December 31
      const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime()),
      );

      // Format the date as "MMM DD"
      const options = { month: "short", day: "2-digit" };
      return randomDate.toLocaleDateString("en-US", options);
    };

    // Function to generate an array of nodes with random birthdays
    const generateNodes = (numNodes) => {
      return Array.from({ length: numNodes }, (_, i) => ({
        id: `Person ${i + 1}`,
        birthday: getRandomDate(),
      }));
    };

    // Function to run a single simulation
    const runSimulation = () => {
      const nodes = generateNodes(numNodes);

      const links = [];
      const nodesInLinks = new Set();
      nodes.forEach((source, i) => {
        nodes.slice(i + 1).forEach((target) => {
          if (source.birthday === target.birthday) {
            links.push({ source: source.id, target: target.id });
            nodesInLinks.add(source.id);
            nodesInLinks.add(target.id);
          }
        });
      });

      const success = links.length > 0;
      const totalMatches = links.length;

      return {
        success,
        totalMatches,
        nodes,
        links,
        nodesInLinks,
      };
    };

    const updateChart = (nodes, links, nodesInLinks) => {
      const defaultColor = colors.node; // Color for non-matching nodes

      const nodeSize = calculateNodeSize(nodes.length);
      const radius =
        Math.min(dimensions.width, dimensions.height) / 2 - nodeSize - padding;
      const angle = (i) => (i / nodes.length) * 2 * Math.PI;
      const nodePositions = nodes.map((d, i) => {
        const [x, y] = pointRadial(angle(i), radius);
        return { ...d, x, y };
      });

      const chartContainer = select(scatterplotRef.current);
      chartContainer.selectAll("*").remove();

      const linkGenerator = line()
        .curve(curveBundle.beta(0.01))
        .x((d) => d.x)
        .y((d) => d.y);
      //

      const linkElements = chartContainer
        .append("g")
        .selectAll(".link-path")
        .data(links)
        .enter()
        .append("path")
        .attr("class", "link-path")
        .attr("d", (d) => {
          const sourceNode = nodePositions.find((n) => n.id === d.source);
          const targetNode = nodePositions.find((n) => n.id === d.target);
          const distance = Math.hypot(
            targetNode.x - sourceNode.x,
            targetNode.y - sourceNode.y,
          );
          const controlOffset = Math.min(distance / 2, nodeSize);
          return linkGenerator([
            { x: sourceNode.x, y: sourceNode.y },
            {
              x: (sourceNode.x + targetNode.x) / 2,
              y: (sourceNode.y + targetNode.y) / 2 - controlOffset,
            },
            { x: targetNode.x, y: targetNode.y },
          ]);
        })
        .attr("fill", "none")
        .attr("stroke", colors.success)
        .attr("filter", "url(#glowNodes)") // Apply the glow filter
        .attr("stroke-width", 1)
        .style("opacity", 0.3); // dim all paths initially

      chartContainer
        .append("defs")
        .append("symbol")
        .attr("id", "personSymbol")
        .attr("viewBox", "0 0 1024 1024")
        .append("path")
        .attr(
          "d",
          "M648.452 644.995c-12.057-6.029-19.505-18.087-19.505-33.103V596.76c0-10.521 4.49-21.043 13.476-28.612 66.077-51.19 107.925-138.556 107.925-237.983C750.348 173.399 643.842 46.9 511.92 46.9S273.61 174.937 273.61 331.583c0 98.009 41.964 183.838 104.85 235.148 9.103 6.03 13.596 16.552 13.596 28.61v19.508c0 13.595-7.567 27.19-19.506 33.22C230.11 718.886 47.124 821.268 47.124 899.768v76.611h929.477v-76.611c0-78.5-184.407-182.537-328.15-254.772z",
        );

      chartContainer
        .append("g")
        .selectAll("use")
        .data(nodePositions, (d) => d.id)
        .join("use")
        .attr("href", "#personSymbol")
        .attr("x", (d) => d.x - nodeSize / 2)
        .attr("y", (d) => d.y - nodeSize / 2)
        .attr("width", nodeSize)
        .attr("height", nodeSize)
        .style("fill", (d) =>
          nodesInLinks.has(d.id) ? colors.success : defaultColor,
        )
        .attr("filter", (d) =>
          nodesInLinks.has(d.id) ? "url(#glowNodes)" : "",
        ); // Apply the glow filter

      chartContainer
        .selectAll("text")
        .data(nodePositions, (d) => d.id)
        .enter()
        .append("text")

        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y)

        .attr("dy", "2.15em")
        .attr("text-anchor", "middle")
        .text((d) => d.birthday)
        .style("fill", colors.text)
        .style("font-size", `${nodeSize / 2.4}px`)
        .style("font-weight", "bold")
        .attr("stroke", "none")
        .style("pointer-events", "none");
    };

    // Function to handle the start/stop simulation button click
    const handleSimulationToggle = () => {
      if (isSimulating) {
        clearInterval(intervalId);
        setIsSimulating(false);
        setSimulationData((prevData) => ({
          ...prevData,
          numSimulations: prevData.numSimulations + 1,
        }));
      } else {
        const id = setInterval(() => {
          const { success, totalMatches, nodes, links, nodesInLinks } =
            runSimulation();
          updateChart(nodes, links, nodesInLinks);

          setSimulationData((prevData) => ({
            successes: prevData.successes + (success ? 1 : 0),
            failures: prevData.failures + (success ? 0 : 1),
            totalMatches: prevData.totalMatches + totalMatches,
            numSimulations: prevData.numSimulations + 1,
            averageMatches:
              (prevData.totalMatches + totalMatches) /
              (prevData.numSimulations + 1),
            numOfNodes: numNodes,
            isLatestSuccess: success,
          }));
        }, speed); // Run speed ms
        setIntervalId(id);
        setIsSimulating(true);
      }
    };

    useImperativeHandle(ref, () => ({
      toggleSimulation: handleSimulationToggle,
      isSimulating: isSimulating,
    }));

    useEffect(() => {
      updateChart(generateNodes(numNodes), [], new Set());
    }, [numNodes, dimensions.width]);

    return (
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", boxSizing: "border-box" }}
      >
        <svg
          style={{ border: "1px solid blaack" }}
          width={dimensions.width}
          height={dimensions.height}
          className=""
        >
          <g
            transform={`translate(${dimensions.width / 2},${dimensions.height / 2})`}
            ref={scatterplotRef}
          ></g>
        </svg>
      </div>
    );
  },
);

export default NodeChartSimulationController;
