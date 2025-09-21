import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const SelectInput = ({
    label,
    options,
    selectedOption,
    onChange,
    disable = false,
    multiple = false, // ✅ optional multiple select
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // ✅ Handle initial state differently for multiple/single
    const [selectedValues, setSelectedValues] = useState(
        multiple
            ? selectedOption?.map((opt) => opt?.value) || []
            : selectedOption?.value || ""
    );

    const [selectedLabels, setSelectedLabels] = useState(
        multiple
            ? selectedOption?.map((opt) => opt?.label) || []
            : selectedOption?.label || ""
    );

    const handleToggleDropdown = () => {
        if (!disable) setIsOpen(!isOpen);
    };

    const handleSelectOption = (option) => {
        if (multiple) {
            let newValues = [...selectedValues];
            let newLabels = [...selectedLabels];

            if (newValues.includes(option.value)) {
                // remove if already selected
                newValues = newValues?.filter((val) => val !== option.value);
                newLabels = newLabels?.filter((lbl) => lbl !== option.label);
            } else {
                // add if not selected
                newValues.push(option.value);
                newLabels.push(option.label);
            }

            setSelectedValues(newValues);
            setSelectedLabels(newLabels);
            onChange(options.filter((opt) => newValues.includes(opt.value)));
        } else {
            // single select
            setSelectedValues(option.value);
            setSelectedLabels(option.label);
            onChange(option);
            setIsOpen(false);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label className={`text-sm font-medium ${disable ? 'text-gray-400' : 'text-gray-700'}`}>
                    {label}
                </label>
            )}

            <div className="relative">
                <div
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors flex items-center justify-between cursor-pointer ${
                        disable ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:border-gray-400'
                    }`}
                    onClick={handleToggleDropdown}
                    role="button"
                    aria-expanded={isOpen}
                >
                    <span className="flex-1 truncate">
                        {multiple
                            ? selectedLabels.length > 0
                                ? selectedLabels.join(", ")
                                : "Select options"
                            : selectedLabels || "Select an option"}
                    </span>
                    <ChevronDown
                        className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        strokeWidth={2.2}
                    />
                </div>

                {isOpen && !disable && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {options.map((option) => {
                            const isSelected = multiple
                                ? selectedValues?.includes(option.value)
                                : option.value === selectedValues;

                            return (
                                <li
                                    key={option.value}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors flex items-center ${
                                        isSelected ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                                    }`}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {multiple && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            className="mr-2"
                                        />
                                    )}
                                    {option.label}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SelectInput;
