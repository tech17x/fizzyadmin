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
    error = null,
    helpText = null,
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
            
            if (isSelected) {
                onChange(currentValues.filter(item => item.value !== option.value));
            } else {
                onChange([...currentValues, option]);
            }
        } else {
            onChange(option);
            setIsOpen(false);
        }
    };

    const removeOption = (optionToRemove, e) => {
        e.stopPropagation();
        if (multiple) {
            const currentValues = selectedOption || [];
            onChange(currentValues.filter(item => item.value !== optionToRemove.value));
        }
    };

    const getDisplayValue = () => {
        if (multiple) {
            const values = selectedOption || [];
            return values.length > 0 ? `${values.length} selected` : placeholder;
        }
        return selectedOption?.label || placeholder;
    };

    const isSelected = (option) => {
        if (multiple) {
            const values = selectedOption || [];
            return values.some(item => item.value === option.value);
        }
        return selectedOption?.value === option.value;
    };

    return (
        <div className={`space-y-1 ${className}`} ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}

            <div className="relative">
                <button
                    type="button"
                    className={`
                        w-full px-3 py-2 text-left border rounded-lg transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
                        ${error ? 'border-red-300' : 'border-gray-300'}
                        ${disable ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}
                    `}
                    onClick={handleToggleDropdown}
                    disabled={disable}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            {multiple && selectedOption && selectedOption.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                    {selectedOption.map((option) => (
                                        <span
                                            key={option.value}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800"
                                        >
                                            {option.label}
                                            <button
                                                onClick={(e) => removeOption(option, e)}
                                                className="ml-1 hover:text-orange-900"
                                            >
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                                    {getDisplayValue()}
                                </span>
                            )}
                        </div>
                        <ChevronDown 
                            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                                isOpen ? 'transform rotate-180' : ''
                            }`} 
                        />
                    </div>
                </button>

                {isOpen && !disable && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {options.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
                        ) : (
                            options.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    className={`
                                        w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center justify-between
                                        ${isSelected(option) ? 'bg-orange-50 text-orange-900' : 'text-gray-900'}
                                    `}
                                    onClick={() => handleSelectOption(option)}
                                >
                                    <span>{option.label}</span>
                                    {isSelected(option) && (
                                        <Check className="h-4 w-4 text-orange-600" />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                )}
            </div>

            {error && (
                <p className="text-sm text-red-600">{error}</p>
            )}

            {helpText && !error && (
                <p className="text-xs text-gray-500">{helpText}</p>
            )}
        </div>
    );
};

export default SelectInput;