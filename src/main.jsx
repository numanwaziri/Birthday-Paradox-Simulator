import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { DevSupport } from "@react-buddy/ide-toolbox";
import { ComponentPreviews, useInitial } from "./dev/index.js";
import { SimulationProvider } from "./CustomHooks/SimulationContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  //   <DevSupport
  //     ComponentPreviews={ComponentPreviews}
  //     useInitialHook={useInitial}
  //   >
  <SimulationProvider>
    <App />
  </SimulationProvider>,
  // </DevSupport>
  // {/*</React.StrictMode>,*/}
);
