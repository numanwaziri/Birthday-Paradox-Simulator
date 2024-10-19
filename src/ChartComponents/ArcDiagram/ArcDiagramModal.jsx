import { AnimatePresence, motion } from "framer-motion";
import { FaBullseye } from "react-icons/fa6";
import { useState } from "react";
import CountUp from "react-countup";
import { ArcDiagram } from "./ArcDiagram.jsx";
import { FiX } from "react-icons/fi";

//Helper funcs
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

function numCombinations(n, k) {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;

  // Using the formula n! / (k! * (n - k)!)
  return Math.floor(factorial(n) / (factorial(k) * factorial(n - k)));
}

const ArcDiagramModal = ({ isOpen, setIsOpen, colors, numNodes }) => {
  const [showText, setShowText] = useState(false);
  // if (window.matchMedia("(pointer: coarse)").matches) {
  //   setMessage("Tap the nodes to interact");
  //   // touchscreen
  // } else {
  //   setMessage("Hover over the nodes to interact");
  // }
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            setIsOpen(false);
            setShowText(false);
          }}
          className="fixed inset-0 z-50 grid cursor-pointer place-items-center bg-slate-900/20 backdrop-blur"
        >
          <motion.div
            initial={{ scale: 0, rotate: "10.5deg" }}
            animate={{ scale: 1, rotate: "0deg" }}
            exit={{ scale: 0, rotate: "0deg" }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[95svh] w-[95vw] max-w-screen-lg cursor-default overflow-hidden rounded-lg bg-[#d9d6c3] px-2 py-4 shadow-xl max-sm:h-[100svh] md:p-7"
          >
            <button
              onClick={() => {
                setIsOpen(false);
                setShowText(false);
              }}
              className="absolute right-2 z-20 rounded-md bg-black bg-opacity-55 p-1 shadow transition-colors hover:bg-opacity-50 max-md:bottom-2 md:top-2"
            >
              <FiX className="h-3.5 w-3.5 font-bold text-slate-100" />
            </button>
            <div className="relative z-10">
              <div className="pointer-events-none flex select-none items-center justify-center pt-1 md:pt-2">
                <span
                  className={`overflow-hidden text-4xl font-bold text-emerald-700/90 transition-all md:text-[2.6rem] ${!showText ? "h-16 opacity-100" : "h-0 opacity-0"}`}
                >
                  {" "}
                  <CountUp
                    end={numCombinations(numNodes, 2)}
                    onEnd={() => setShowText(true)}
                    duration={7}
                    easingFn={(t, b, c, d) => {
                      const adjustedT = t / d;
                      return (
                        -c *
                          (Math.sqrt(Math.max(0, 1 - adjustedT * adjustedT)) -
                            1) +
                        b
                      );
                    }}
                  />
                </span>
              </div>{" "}
              <p
                className={`pointer-events-none select-none overflow-hidden text-center transition-all md:text-lg ${showText ? "h-16 opacity-100" : "h-0 opacity-0"}`}
              >
                It's{" "}
                <span className="text-xl font-bold text-black/80 md:text-2xl">
                  {numNodes}
                </span>{" "}
                people (
                <span className="mx-0.5 inline-block h-4 w-4 translate-y-0.5 rounded-full bg-cyan-800 max-md:h-3 max-md:w-3"></span>
                ) but{" "}
                <span
                  className={`text-xl font-bold text-emerald-700/90 transition-all md:text-2xl`}
                >
                  {numCombinations(numNodes, 2)}
                </span>{" "}
                possible pairs
                <br />
                More pairs mean more chances of a match!
              </p>
              <div className="w-full max-md:rotate-180 max-sm:h-[77svh] sm:aspect-video md:-my-8">
                <ArcDiagram colors={colors} numNodes={numNodes} />
              </div>
              <p className="pointer-events-none flex select-none items-center justify-center max-sm:text-sm">
                <FaBullseye className="mr-1 inline text-black/50" /> Interact
                with nodes and arcs for details
              </p>
              {/*<div className="flex gap-2">*/}
              {/*  <button*/}
              {/*    onClick={() => setIsOpen(false)}*/}
              {/*    className="w-full rounded bg-transparent py-2 font-semibold text-white transition-colors hover:bg-white/10"*/}
              {/*  >*/}
              {/*    Nah, go back*/}
              {/*  </button>*/}
              {/*  <button*/}
              {/*    onClick={() => setIsOpen(false)}*/}
              {/*    className="w-full rounded bg-white py-2 font-semibold text-indigo-600 transition-opacity hover:opacity-90"*/}
              {/*  >*/}
              {/*    Understood!*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ArcDiagramModal;
