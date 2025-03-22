import React, { useState, useEffect, useRef } from "react";

const MultiSelect = ({ label, options, selectedOptions, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Toggle dropdown
    const toggleDropdown = () => setIsOpen((prev) => !prev);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handle selection
    const handleOptionClick = (option) => {
        console.log(selectedOptions);
        console.log(option);

        if (selectedOptions.some((item) => item._id === option._id)) {
            onChange(selectedOptions.filter((item) => item._id !== option._id)); // Remove selection
        } else {
            onChange([...selectedOptions, option]); // Add selection
        }
    };


    return (
        <div style={{ position: "relative", width: "100%" }} ref={dropdownRef}>
            <label style={{ fontSize: "16px", fontWeight: 500, display: "block", marginBottom: "5px" }}>{label}</label>

            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "6px",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #ccc",
                    cursor: "pointer",
                    backgroundColor: "#fff",
                    fontSize: "16px",
                    minHeight: "40px",
                }}
                onClick={toggleDropdown}
            >
                {/* Selected Options as Pills */}
                {selectedOptions.length > 0 ? (
                    selectedOptions.map((option, index) => (
                        <div
                            key={index}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                background: "linear-gradient( #EFA280 0%, #DF6229 100%)",
                                color: "#fff",
                                borderRadius: "16px",
                                padding: "5px 10px",
                                fontSize: "14px",
                            }}
                        >
                            {option.short_name}
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

                <span style={{ marginLeft: "auto" }}>
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.3229 1.53062L9.36297 9.03061C9.28905 9.10035 9.20126 9.15567 9.10462 9.19341C9.00799 9.23115 8.90441 9.25058 8.79981 9.25058C8.6952 9.25058 8.59162 9.23115 8.49499 9.19341C8.39836 9.15567 8.31057 9.10035 8.23664 9.03061L0.276727 1.53062C0.127367 1.38988 0.043457 1.19901 0.043457 0.99999C0.043457 0.800967 0.127367 0.610095 0.276727 0.469364C0.426088 0.328634 0.628664 0.249573 0.839891 0.249573C1.05112 0.249573 1.25369 0.328634 1.40306 0.469364L8.79981 7.43968L16.1966 0.469364C16.2705 0.399682 16.3583 0.344406 16.4549 0.306695C16.5516 0.268983 16.6551 0.249573 16.7597 0.249573C16.8643 0.249573 16.9679 0.268983 17.0645 0.306695C17.1611 0.344406 17.2489 0.399682 17.3229 0.469364C17.3968 0.539047 17.4555 0.621773 17.4955 0.712817C17.5356 0.803862 17.5562 0.901444 17.5562 0.99999C17.5562 1.09854 17.5356 1.19612 17.4955 1.28716C17.4555 1.37821 17.3968 1.46093 17.3229 1.53062Z" fill="black" />
                    </svg>
                </span>
            </div>

            {/* Dropdown Options */}
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
                    {options.map((option, index) => (
                        <div
                            key={index}
                            onClick={() => handleOptionClick(option)}
                            style={{
                                padding: "10px",
                                cursor: "pointer",
                                backgroundColor: selectedOptions.some((item) => item._id === option._id) ? "whitesmoke" : "#fff",
                                color: "#333",
                                fontWeight: selectedOptions.some((item) => item._id === option._id) ? "bold" : "normal",
                                transition: "background-color 0.2s ease",
                            }}
                        >
                            {option.short_name}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default MultiSelect;