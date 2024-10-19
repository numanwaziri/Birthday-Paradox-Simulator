import NodeChartSimulationController from "../NodeChartSimulationController.jsx";
import { PieChart } from "./PieChart.jsx";

export const Pie = ({ speed, colors, reff, numNodes }) => {
  return (
    <div className="circle-container bg-rred-400 ddrop-shadow-xl relative mt-3.5 flex aspect-square w-full flex-initial scale-105 items-end justify-center rounded-full">
      <div className="absolute aspect-square w-full">
        <NodeChartSimulationController
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
          speed={speed}
          colors={colors}
          ref={reff}
          numNodes={numNodes}
        />
      </div>
      <div className="absolute aspect-square w-full">
        <PieChart speed={speed} colors={colors} numNodes={numNodes} />
      </div>
    </div>
  );
};
