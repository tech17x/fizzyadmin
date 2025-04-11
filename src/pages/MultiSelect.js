import React, { useState, useEffect, useRef } from "react";

const MultiSelect = ({ label, options, selectedOptions, onChange, disable = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => setIsOpen((prev) => !prev);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOptionClick = (option) => {
        if (selectedOptions.some((item) => item.value === option.value)) {
            onChange(selectedOptions.filter((item) => item.value !== option.value));
        } else {
            onChange([...selectedOptions, option]);
        }
    };

    return (
        <div className="input-field" style={{ position: "relative", maxWidth: "50%", boxSizing: "border-box" }} ref={dropdownRef}>
            <label
                style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: disable ? "#aaa" : "#000",
                }}
            >
                {label}
            </label>

            <div
                style={{
                    width: "100%",
                    padding: "9px 35px 9px 10px",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    fontSize: "15px",
                    outline: "none",
                    backgroundColor: disable ? "#f5f5f5" : "#fff",
                    color: disable ? "#aaa" : "#000",
                    opacity: disable ? 0.6 : 1,
                    background: `url("data:image/svg+xml;utf8,<svg fill='%23333' viewBox='0 0 24 24' width='16' height='16' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'></path></svg>") no-repeat right 10px center`,
                    backgroundSize: "14px",
                    cursor: disable ? "not-allowed" : "pointer",
                    overflow: "hidden",
                }}
                onClick={!disable ? toggleDropdown : undefined}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "8px",
                        overflowX: "scroll",
                        scrollbarWidth: "none",
                        whiteSpace: "nowrap",
                        alignItems: "center",
                    }}
                >
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map((option, index) => (
                            <div
                                key={index}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    background: "linear-gradient( #EFA280 0%, #DF6229 100%)",
                                    color: "#fff",
                                    borderRadius: "16px",
                                    padding: "1px 10px",
                                    fontSize: "11px",
                                    flexShrink: 0,
                                }}
                            >
                                {option.label}
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleOptionClick(option);
                                    }}
                                    style={{
                                        marginLeft: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold",
                                    }}
                                >
                                    ×
                                </span>
                            </div>
                        ))
                    ) : (
                        <span style={{ color: "#999" }}>Select options</span>
                    )}
                </div>
            </div>

            {isOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        backgroundColor: "#fff",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
                        zIndex: 1000,
                        marginTop: "5px",
                        maxHeight: "200px",
                        overflowY: "auto",
                    }}
                >
                    {options.map((option, index) => {
                        const isSelected = selectedOptions.some((item) => item.value === option.value);
                        return (
                            <div
                                key={index}
                                onClick={() => handleOptionClick(option)}
                                style={{
                                    padding: "10px",
                                    cursor: "pointer",
                                    backgroundColor: isSelected ? "whitesmoke" : "#fff",
                                    color: "#333",
                                    fontWeight: isSelected ? "bold" : "normal",
                                    transition: "background-color 0.2s ease",
                                }}
                            >
                                {option.label}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
