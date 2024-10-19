import { useRef, useState, useEffect, useCallback } from "react";

// Custom debounce function
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Custom hook for handling resizing logic
const useResizableD3Container = (margin) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
  });

  // Debounced version of updateDimensions
  const updateDimensions = useCallback(
    debounce(() => {
      if (containerRef.current) {
        const { clientWidth: width, clientHeight: height } =
          containerRef.current;
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        setDimensions({ width, height, innerWidth, innerHeight });
      }
    }, 200),
    [margin],
  ); // Adjust debounce delay as needed

  useEffect(() => {
    updateDimensions(); // Initialize dimensions

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect(); // Cleanup observer
      if (updateDimensions.cancel) {
        updateDimensions.cancel(); // Cancel any pending debounced calls
      }
    };
  }, []); //updateDimensions

  return { containerRef, dimensions };
};

export default useResizableD3Container;

// import { useRef, useState, useEffect } from "react";
//
// // Custom hook for handling resizing logic
// const useResizableD3Container = (margin) => {
//   const containerRef = useRef(null);
//   const [dimensions, setDimensions] = useState({
//     width: 0,
//     height: 0,
//     innerWidth: 0,
//     innerHeight: 0,
//   });
//
//   useEffect(() => {
//     const updateDimensions = () => {
//       if (containerRef.current) {
//         const { clientWidth: width, clientHeight: height } =
//           containerRef.current;
//         const innerWidth = width - margin.left - margin.right;
//         const innerHeight = height - margin.top - margin.bottom;
//         setDimensions({ width, height, innerWidth, innerHeight });
//       }
//     };
//
//     updateDimensions(); // Initialize dimensions
//
//     const resizeObserver = new ResizeObserver(updateDimensions);
//     resizeObserver.observe(containerRef.current);
//
//     return () => resizeObserver.disconnect(); // Cleanup observer
//   }, [margin]);
//
//   return { containerRef, dimensions };
// };
//
// export default useResizableD3Container;
