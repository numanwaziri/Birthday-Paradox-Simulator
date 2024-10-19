import React, { useState } from "react";

const NumberInput = ({ value, setValue }) => {
  const [showValidation, setShowValidation] = useState(false);

  // Increment handler
  const handleIncrement = () => {
    if (value < 50) {
      setValue((prevValue) => prevValue + 1);
    } else {
      showTemporaryValidation();
    }
  };

  // Decrement handler
  const handleDecrement = () => {
    if (value > 23) {
      setValue((prevValue) => prevValue - 1);
    } else {
      showTemporaryValidation();
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    if (isNaN(newValue)) {
      setValue(23); // Reset to minimum valid value if input is not a number
      return;
    }
    if (newValue >= 23 && newValue <= 50) {
      setValue(newValue);
    } else {
      showTemporaryValidation();
    }
  };

  // Show validation message briefly
  const showTemporaryValidation = () => {
    setShowValidation(true);
    setTimeout(() => setShowValidation(false), 2000); // Hide after 2 seconds
  };

  return (
    <div className="bgre relative flex h-12 w-28 flex-row rounded-lg border border-gray-400">
      <button
        onClick={handleDecrement}
        className={`group relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-900 bg-[#a02b3f] px-5 py-3 font-medium leading-tight text-white transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]`}
      >
        <span className="m-auto">-</span>
      </button>
      {/* Input field for direct input without spinners */}
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="no-spinner w-24 border-gray-400 bg-white text-center text-xs focus:outline-none md:text-base"
        min="23"
        max="50"
        style={{ appearance: "textfield" }} // Removes spinners in some browsers
      />
      <button
        onClick={handleIncrement}
        className={`group relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border-2 border-gray-900 bg-[#3c8c44] px-5 py-3 font-medium leading-tight text-white transition-all duration-100 [box-shadow:5px_5px_rgb(82_82_82)] active:translate-x-[3px] active:translate-y-[3px] active:[box-shadow:0px_0px_rgb(82_82_82)]`}
      >
        <span className="m-auto">+</span>
      </button>
      {showValidation && (
        <div className="absolute mt-6 flex w-32 flex-col items-start justify-center p-2 md:mt-8 md:w-full">
          <svg width="10" height="10" className="ml-5 fill-current md:mx-auto">
            <polygon points="0 10, 10 10, 5 0" />
          </svg>
          <span className="block flex h-auto w-48 flex-wrap justify-center rounded-lg bg-black p-3 text-xs text-white">
            Please enter a number between 23 and 50
          </span>
        </div>
      )}
    </div>
  );
};

export default NumberInput;
