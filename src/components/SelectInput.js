import React, { useState } from "react";
import "./SelectInput.css";

const SelectInput = ({ options, placeholder, value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="select-container">
            <label>{label}</label>
            <div className="select-box" onClick={() => setIsOpen(!isOpen)}>
                <span className={`select-text ${!value ? "placeholder" : ""}`}>
                    {value || placeholder}
                </span>
                <span className="dropdown-icon">
                    <svg width="18" height="10" viewBox="0 0 18 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.3229 1.53062L9.36297 9.03061C9.28905 9.10035 9.20126 9.15567 9.10462 9.19341C9.00799 9.23115 8.90441 9.25058 8.79981 9.25058C8.6952 9.25058 8.59162 9.23115 8.49499 9.19341C8.39836 9.15567 8.31057 9.10035 8.23664 9.03061L0.276727 1.53062C0.127367 1.38988 0.043457 1.19901 0.043457 0.99999C0.043457 0.800967 0.127367 0.610095 0.276727 0.469364C0.426088 0.328634 0.628664 0.249573 0.839891 0.249573C1.05112 0.249573 1.25369 0.328634 1.40306 0.469364L8.79981 7.43968L16.1966 0.469364C16.2705 0.399682 16.3583 0.344406 16.4549 0.306695C16.5516 0.268983 16.6551 0.249573 16.7597 0.249573C16.8643 0.249573 16.9679 0.268983 17.0645 0.306695C17.1611 0.344406 17.2489 0.399682 17.3229 0.469364C17.3968 0.539047 17.4555 0.621773 17.4955 0.712817C17.5356 0.803862 17.5562 0.901444 17.5562 0.99999C17.5562 1.09854 17.5356 1.19612 17.4955 1.28716C17.4555 1.37821 17.3968 1.46093 17.3229 1.53062Z" fill="black" />
                    </svg>
                </span>
            </div>

            {isOpen && (
                <ul className="dropdown-menu">
                    {options.map((option, index) => (
                        <li key={index} onClick={() => handleSelect(option)}>
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SelectInput;
