import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, X } from "lucide-react";

const SelectInput = ({
    label,
    options = [],
    selectedOption,
    onChange,
    disable = false,
    multiple = false,
    placeholder = "Select an option",
    required = false,
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggleDropdown = () => {
        if (!disable) setIsOpen(!isOpen);
    };

    const handleSelectOption = (option) => {
        if (multiple) {
            const currentValues = selectedOption || [];
            const isSelected = currentValues.some(item => item.value === option.value);
            
            let newSelection;
            if (isSelected) {
                newSelection = currentValues.filter(item => item.value !== option.value);
            } else {
                newSelection = [...currentValues, option];
            }
            
            onChange(newSelection);
        } else {
            onChange(option);
            setIsOpen(false);
        }
    };

    const removeOption = (optionToRemove, e) => {
        e.stopPropagation();
        if (multiple) {
            const newSelection = selectedOption.filter(item => item.value !== optionToRemove.value);
            onChange(newSelection);
        }
    };

    const getDisplayValue = () => {
        if (multiple) {
            return selectedOption && selectedOption.length > 0 
                ? `${selectedOption.length} selected`
                : placeholder;
        }
        return selectedOption?.label || placeholder;
    };

    const isSelected = (option) => {
        if (multiple) {
            return selectedOption?.some(item => item.value === option.value) || false;
        }
        return selectedOption?.value === option.value;
    };

    return (
        <div className={`space-y-2 ${className}`} ref={dropdownRef}>
            {label && (
                <label className={`block text-sm font-medium ${disable ? 'text-gray-400' : 'text-gray-700'}`}>
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    className={`select-field flex items-center justify-between ${
                        disable ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'
                    }`}
                    onClick={handleToggleDropdown}
                    disabled={disable}
                >
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                        {multiple && selectedOption && selectedOption.length > 0 ? (
                            <div className="flex flex-wrap gap-1 max-w-full">
                                {selectedOption.slice(0, 2).map((option) => (
                                    <span
                                        key={option.value}
                                        className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-md"
                                    >
                                        {option.label}
                                        <button
                                            onClick={(e) => removeOption(option, e)}
                                            className="hover:bg-orange-200 rounded-full p-0.5"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))}
                                {selectedOption.length > 2 && (
                                    <span className="text-xs text-gray-500">
                                        +{selectedOption.length - 2} more
                                    </span>
                                )}
                            </div>
                        ) : (
                            <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
                                {getDisplayValue()}
                            </span>
                        )}
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && !disable && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {options.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                                No options available
                            </div>
                        ) : (
                            options.map((option) => {
                                const selected = isSelected(option);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                                            selected ? 'bg-orange-50 text-orange-600' : 'text-gray-700'
                                        }`}
                                        onClick={() => handleSelectOption(option)}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {selected && <Check className="w-4 h-4 flex-shrink-0" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SelectInput;