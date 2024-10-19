import React, { useState } from "react";

const CounterComponent = ({ value, setValue, isSimulating }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(""), 500); // Hide error message after 2 seconds
  };

  const handleCounterChange = (type) => {
    if (type === "increment" && value < 45) {
      setValue(value + 1);
      setErrorMessage("");
    } else if (type === "decrement" && value > 18) {
      setValue(value - 1);
      setErrorMessage("");
    } else {
      showError(
        `Value cannot ${type === "increment" ? "exceed 50." : "be less than 23."}`,
      );
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center border-t-2 border-gray-900 pt-2.5 md:pt-3">
      <div className="flex items-center justify-center">
        <button
          onClick={() => handleCounterChange("decrement")}
          disabled={isSimulating} // Disable button when simulating
          className={`group relative inline-flex h-[2.4rem] w-[2.4rem] items-center justify-center overflow-hidden rounded-full border-2 border-gray-900 font-medium text-white transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] max-sm:h-[2.2rem] max-sm:w-[2.2rem] ${isSimulating ? "cursor-not-allowed bg-gray-600" : "bg-[#a02b3f] hover:bg-[#bd344a] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"} `}
          aria-label="Decrease value"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M20 12H4"
            ></path>
          </svg>
        </button>

        <span className="pointer-events-none w-16 select-none text-center text-2xl font-medium max-sm:text-xl">
          {errorMessage ? (
            <span className="flex scale-110 items-center justify-center font-bold text-red-800">
              {value}
            </span>
          ) : (
            value
          )}
        </span>

        <button
          onClick={() => handleCounterChange("increment")}
          disabled={isSimulating} // Disable button when simulating
          className={`group relative inline-flex h-[2.4rem] w-[2.4rem] items-center justify-center overflow-hidden rounded-full border-2 border-gray-900 font-medium text-white transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] max-sm:h-[2.2rem] max-sm:w-[2.2rem] ${isSimulating ? "cursor-not-allowed bg-gray-600" : "bg-[#3c8c44] hover:bg-[#4ba054] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]"} `}
          aria-label="Increase value"
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v12M6 12h12"
            ></path>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CounterComponent;
