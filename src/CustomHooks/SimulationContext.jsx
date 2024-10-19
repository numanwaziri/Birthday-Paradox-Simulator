import React, { createContext, useState } from "react";

// Create the context
export const SimulationContext = createContext();

// Create the provider component
export const SimulationProvider = ({ children }) => {
  const [simulationData, setSimulationData] = useState({
    isLatestSuccess: null,
    successes: 0,
    failures: 0,
    totalMatches: 0,
    numSimulations: 0,
    averageMatches: 0,
    numOfNodes: 23,
  });

  return (
    <SimulationContext.Provider value={{ simulationData, setSimulationData }}>
      {children}
    </SimulationContext.Provider>
  );
};
