import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const SelectInput = ({
  label,
  options,
  selectedOption,
  onChange,
  disable = false,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedValues, setSelectedValues] = useState(
    multiple ? selectedOption?.map((o) => o.value) || [] : selectedOption?.value || ""
  );

  const [selectedLabels, setSelectedLabels] = useState(
    multiple ? selectedOption?.map((o) => o.label) || [] : selectedOption?.label || ""
  );

  const handleSelectOption = (option) => {
    if (multiple) {
      let newValues = [...selectedValues];
      let newLabels = [...selectedLabels];
      if (newValues.includes(option.value)) {
        newValues = newValues.filter((val) => val !== option.value);
        newLabels = newLabels.filter((lbl) => lbl !== option.label);
      } else {
        newValues.push(option.value);
        newLabels.push(option.label);
      }
      setSelectedValues(newValues);
      setSelectedLabels(newLabels);
      onChange(options.filter((opt) => newValues.includes(opt.value)));
    } else {
      setSelectedValues(option.value);
      setSelectedLabels(option.label);
      onChange(option);
      setIsOpen(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-1 relative">
      {label && (
        <label className={`text-sm font-medium ${disable ? "text-gray-400" : "text-gray-700"}`}>
          {label}
        </label>
      )}
      <div
        className={`w-full px-4 py-2.5 text-sm rounded-full border shadow-sm flex items-center justify-between cursor-pointer transition
          ${disable ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-800 border-gray-300 hover:border-gray-400"}`}
        onClick={() => !disable && setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {multiple
            ? selectedLabels.length > 0
              ? selectedLabels.join(", ")
              : "Select options"
            : selectedLabels || "Select an option"}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && !disable && (
        <ul className="absolute mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-10 max-h-60 overflow-y-auto text-sm">
          {options.map((option) => {
            const isSelected = multiple
              ? selectedValues.includes(option.value)
              : option.value === selectedValues;
            return (
              <li
                key={option.value}
                onClick={() => handleSelectOption(option)}
                className={`px-4 py-2 cursor-pointer hover:bg-gray-100 transition
                  ${isSelected ? "bg-[rgba(255,232,225,0.85)] font-medium" : ""}`}
              >
                {multiple && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="mr-2 accent-black"
                  />
                )}
                {option.label}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default SelectInput;
