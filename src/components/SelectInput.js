import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./InputField.css";

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
        <div className="select-input">
            {label && (
                <label
                    className="select-input__label"
                    style={{ color: disable ? "#9ca3af" : "#374151" }}
                >
                    {label}
                </label>
            )}

            <div className="select-input__container">
                <div
                    className={`select-input__custom-select ${disable ? "select-input__custom-select--disabled" : ""
                        }`}
                    onClick={handleToggleDropdown}
                    style={{ cursor: disable ? "not-allowed" : "pointer" }}
                    role="button"
                    aria-expanded={isOpen}
                >
                    <span className="select-input__selected-option">
                        {multiple
                            ? selectedLabels.length > 0
                                ? selectedLabels.join(", ")
                                : "Select options"
                            : selectedLabels || "Select an option"}
                    </span>
                    <ChevronDown
                        className={`select-input__icon ${isOpen ? "select-input__icon--open" : ""
                            }`}
                        size={12}
                        strokeWidth={2.2}
                    />
                </div>

                {isOpen && !disable && (
                    <ul className="select-input__options-list">
                        {options.map((option) => {
                            const isSelected = multiple
                                ? selectedValues?.includes(option.value)
                                : option.value === selectedValues;

                            return (
                                <li
                                    key={option.value}
                                    className={`select-input__option ${isSelected ? "select-input__option--selected" : ""
                                        }`}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {multiple && (
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            readOnly
                                            style={{ marginRight: "6px" }}
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
