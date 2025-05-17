import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import "./InputField.css";

const SelectInput = ({ label, options, selectedOption, onChange, disable = false }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(selectedOption?.value || "");
    const [selectedLabel, setSelectedLabel] = useState(selectedOption?.label || "");

    const handleToggleDropdown = () => {
        if (!disable) setIsOpen(!isOpen);
    };

    const handleSelectOption = (option) => {
        setSelectedValue(option.value);
        setSelectedLabel(option.label);
        onChange(option);
        setIsOpen(false);
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
                    className={`select-input__custom-select ${disable ? "select-input__custom-select--disabled" : ""}`}
                    onClick={handleToggleDropdown}
                    style={{ cursor: disable ? "not-allowed" : "pointer" }}
                    role="button"
                    aria-expanded={isOpen}
                >
                    <span className="select-input__selected-option">
                        {selectedLabel || "Select an option"}
                    </span>
                    <ChevronDown
                        className={`select-input__icon ${isOpen ? "select-input__icon--open" : ""}`}
                        size={12}
                        strokeWidth={2.2}
                    />
                </div>

                {isOpen && !disable && (
                    <ul className="select-input__options-list">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className={`select-input__option ${option.value === selectedValue ? "select-input__option--selected" : ""}`}
                                onClick={() => handleSelectOption(option)}
                            >
                                {option.label}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SelectInput;
