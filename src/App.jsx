import { useContext, useEffect, useRef, useState } from "react";
import "./App.css";
import { SimulationContext } from "./CustomHooks/SimulationContext.jsx";
import { LineChart } from "./ChartComponents/LineChart.jsx";
import { Pie } from "./ChartComponents/PieNodesChart/Pie.jsx";
import CounterComponent from "./UI/CounterComponent.jsx";
import Tabs from "./UI/Tabs.jsx";
import ArcDiagramModal from "./ChartComponents/ArcDiagram/ArcDiagramModal.jsx";
import { Cake } from "./UI/Cake/Cake.jsx";

// Helper function to calculate the exact birthday problem probability
function calculateExactBirthdayProbability(n) {
  if (n <= 1) return 0;

  let probability = 1;
  for (let i = 0; i < n; i++) {
    probability *= (365 - i) / 365;
  }
  return 1 - probability;
}

function App() {
  const { simulationData, setSimulationData } = useContext(SimulationContext);
  const [speed, setSpeed] = useState(0);
  const [selectedTab, setSelectedTab] = useState("Normal");
  const [isSimulating, setIsSimulating] = useState(false);
  const [numNodes, setNumNodes] = useState(23);
  const resizableContainerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const metricsRef = useRef(null); // Create a reference for the metrics div
  const [hasScrolled, setHasScrolled] = useState(false); // New state to track if scrolling has occurred

  // Scroll to down when simulation starts
  useEffect(() => {
    if (
      isSimulating &&
      !hasScrolled &&
      metricsRef.current &&
      ((simulationData.numSimulations > 1 && selectedTab !== "Fast") ||
        (simulationData.numSimulations > 6 && selectedTab === "Fast")) // give ref more time to expand before scrolling when fast
    ) {
      metricsRef.current.scrollIntoView({ behavior: "smooth" }); // Scroll to metrics when isSimulating is true
      setHasScrolled(true); // Set flag to true after scrolling
    } else if (!isSimulating) {
      setHasScrolled(false); // Reset flag when simulation stops
    }
  }, [simulationData.numSimulations]);

  const colors = {
    background: "#d9d6c3", //#d2d1b9
    success: "#3c8c44",
    failure: "#a02b3f",
    line: "#386888",
    text: "#3c3940",
    textSecondary: "#5a5a5a",
    node: "#3c3940",
  };
  document.body.style = `background: ${colors.background};`;

  useEffect(() => {
    // Set speed based on the selected tab
    const speedMap = {
      Slow: 600,
      Normal: 200,
      Fast: 50,
    };

    setSpeed(speedMap[selectedTab]);
  }, [selectedTab]);

  const handleCheckIsSimulating = () => {
    if (resizableContainerRef.current) {
      return resizableContainerRef.current.isSimulating;
    }
    return false;
  };

  const toggleSimulation = () => {
    if (resizableContainerRef.current) {
      resizableContainerRef.current.toggleSimulation();
      setIsSimulating(!handleCheckIsSimulating());
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-screen-2xl flex-col items-center justify-center max-md:p-2 md:pb-16">
      <div className="flex w-full flex-col items-center justify-center">
        <div className="pointer-events-none flex w-full select-none items-center justify-center bg-opacity-30 transition-all max-sm:-mt-5 max-sm:mb-8 md:-mb-1 md:pt-4">
          <h1 className="bg-gradient-to-r from-stone-600 to-stone-700 bg-clip-text text-[2.4rem] font-bold text-transparent transition-all max-sm:text-3xl">
            BIRTHDAY
          </h1>
          <div className="mx-3 flex h-24 scale-[50%] bg-red-900 transition-all max-sm:translate-y-11 sm:mx-20 sm:scale-[60%]">
            <Cake />
          </div>
          <h1 className="bg-gradient-to-r from-stone-600 to-stone-700 bg-clip-text text-[2.4rem] font-bold text-transparent transition-all max-sm:text-3xl">
            PARADOX
          </h1>
        </div>
        <div className="mx-1 mr-1.5 flex items-stretch md:py-1">
          <p className="flex flex-grow items-center justify-center rounded-l-xl bg-black bg-opacity-50 px-4 py-2 text-center font-medium text-slate-100 transition-all [box-shadow:5px_5px_rgb(82_82_82)] max-sm:text-sm md:mb-2">
            In a group of {numNodes} people, the chance of a shared birthday
            {numNodes === 23
              ? " exceeds 50"
              : ` is nearly ${(calculateExactBirthdayProbability(numNodes) * 100).toFixed(0)}`}
            %!
          </p>
          <p
            onClick={() => {
              isSimulating && toggleSimulation();
              setIsModalOpen(true);
            }}
            className="ml-2 flex flex-grow cursor-pointer select-none items-center justify-center rounded-r-xl bg-black bg-opacity-50 px-4 py-2 text-center font-medium text-slate-100 [box-shadow:5px_5px_rgb(82_82_82)] hover:bg-opacity-35 active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)] max-sm:text-sm md:mb-2"
          >
            How?
          </p>
        </div>
        <div className="flex w-full flex-col items-center justify-center max-md:my-4 md:mb-4 md:flex-row md:space-x-6">
          <div className="flex w-full flex-col items-center justify-center max-md:mb-2 md:w-fit">
            <p
              className={`pointer-events-none z-0 -mb-2.5 select-none bg-[#d9d6c3] px-1.5 font-medium max-sm:text-sm`}
            >
              Simulation Speed
            </p>
            <div className="w-full md:w-fit">
              <Tabs
                value={selectedTab}
                setValue={setSelectedTab}
                options={["Slow", "Normal", "Fast"]}
                isSimulating={isSimulating}
              />
            </div>
          </div>
          <div
            className={`flex flex-row items-end justify-center space-x-7 transition-all max-md:mt-1 md:space-x-6 ${!(simulationData.numSimulations > 0) ? "max-md:border-bb-2 max-md:border-gray-800 max-md:pb-4" : ""} max-md:w-full`}
          >
            <div className="flex flex-col items-center justify-center">
              <p
                className={`pointer-events-none z-20 -mb-2.5 select-none bg-[#d9d6c3] px-1.5 font-medium max-sm:text-sm`}
              >
                Group Size
              </p>
              <CounterComponent
                value={numNodes}
                setValue={setNumNodes}
                isSimulating={isSimulating}
              />
            </div>
            <button
              onClick={() => toggleSimulation()}
              className={`group relative inline-flex h-[3.3rem] w-44 select-none items-center justify-center overflow-hidden rounded-lg border-2 border-gray-900 md:h-[3.7rem] md:text-lg ${!isSimulating ? `bg-[#3c8c44] hover:bg-[#4ba054]` : "bg-[#a02b3f] hover:bg-[#bd344a]"} px-4 py-5 font-medium leading-tight text-white transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)] max-sm:px-2 max-sm:py-1 max-sm:text-sm sm:text-nowrap`}
            >
              {isSimulating ? "Stop Simulation" : "Start Simulation"}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={metricsRef}
        className={`mx-auto my-2 flex w-full flex-row items-center justify-center space-x-8 overflow-hidden border-y-2 border-gray-800 px-2 py-2 text-center transition-all max-md:rounded-lg max-md:border-2 sm:space-x-16 md:mb-6 md:px-4 ${simulationData.numSimulations > 0 ? "h-[4.2rem] opacity-100 sm:h-[4.5rem] md:h-20" : "h-0 opacity-0"}`}
      >
        <div className="max-sm:text-sm">
          <span className="font-medium">Observed Chance</span> <br />
          <span className="mx-auto mt-1 flex w-fit items-center justify-center rounded-lg bg-black bg-opacity-55 px-1.5 py-0.5 font-bold text-slate-100">
            {(
              (simulationData.successes * 100) /
              (simulationData.successes + simulationData.failures)
            ).toFixed(1)}
            %
          </span>
        </div>
        <div className="max-sm:text-sm">
          <span className="font-medium">Theoretical Chance</span> <br />
          <span className="mx-auto mt-1 flex w-fit items-center justify-center rounded-lg bg-yellow-600 px-1.5 py-0.5 font-bold text-slate-100">
            {`${(calculateExactBirthdayProbability(numNodes) * 100).toFixed(1)}%`}
          </span>
        </div>
      </div>
      <div
        className={`mx-auto flex w-full flex-col items-center justify-center transition-all md:flex-row md:pl-5 md:pr-2 lg:pl-0 lg:pr-0 ${simulationData.numSimulations > 0 ? "" : "-mt-12 md:-mt-6"}`}
      >
        <div
          className={`aspect-square w-full max-w-[480px] rounded-full max-md:px-3 md:mr-2 md:w-1/2`}
        >
          <Pie
            speed={speed}
            colors={colors}
            reff={resizableContainerRef}
            numNodes={numNodes}
          />
        </div>

        <div className="flex w-full flex-col items-start justify-center md:w-1/2">
          <div className="h-[280px] w-[100%] max-md:mt-4 sm:h-[350px] md:h-[460px] md:pl-4">
            <LineChart
              margin={{ top: 33, right: 50, bottom: 30, left: 33 }}
              speed={speed}
              colors={colors}
            />
          </div>
        </div>

        <ArcDiagramModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          colors={colors}
          numNodes={numNodes}
        ></ArcDiagramModal>
      </div>
    </div>
  );
}

export default App;
