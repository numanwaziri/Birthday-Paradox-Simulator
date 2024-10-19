import React from "react";

const Tabs = ({ value, setValue, options, isSimulating }) => {
  return (
    <main className="flex w-full items-center justify-center border-t-2 border-gray-800 pt-3 max-md:pt-3">
      <div
        className={`flex flex-row items-center justify-center space-x-4 rounded-2xl`}
      >
        {options.map((option) => (
          <div key={option}>
            <input
              type="radio"
              name="option"
              id={option}
              value={option}
              className="peer hidden w-full"
              checked={value === option}
              onChange={() => !isSimulating && setValue(option)} // Prevent change when simulating
              disabled={isSimulating} // Disable input when simulating
            />
            <label
              htmlFor={option}
              className={`block w-20 select-none rounded-xl p-1.5 text-center max-sm:text-sm ${
                isSimulating
                  ? value === option
                    ? "cursor-not-allowed border-2 border-gray-900 bg-gray-600 font-bold text-slate-100 [box-shadow:5px_5px_rgb(82_82_82)]" // Selected is gray
                    : "bg-transparent text-gray-800" // Others are transparent
                  : "cursor-pointer peer-checked:border-2 peer-checked:border-gray-900 peer-checked:bg-green-950 peer-checked:bg-opacity-65 peer-checked:font-bold peer-checked:text-slate-100 peer-checked:transition-shadow peer-checked:[box-shadow:5px_5px_rgb(82_82_82)]"
              }`}
            >
              {option}
            </label>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Tabs;
