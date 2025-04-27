import React, { useState } from "react";
import "./InputField.css";

const InputField = ({
    label,
    type,
    name,
    value,
    onChange,
    placeholder,
    required = false,
    format,
    disabled = false
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFormattedChange = (e) => {
        let inputValue = e.target.value;
        let numericValue = inputValue.replace(/\D/g, ''); // Remove all non-digits

        // If format is provided like "##/##"
        if (format) {
            let formattedValue = '';
            let numberIndex = 0;

            for (let i = 0; i < format.length && numberIndex < numericValue.length; i++) {
                if (format[i] === '#') {
                    formattedValue += numericValue[numberIndex];
                    numberIndex++;
                } else {
                    formattedValue += format[i];
                }
            }

            e.target.value = formattedValue;
        }

        onChange(e);
    };

    return (
        <div className="input-field">
            <label>{label}</label>
            <div className="input-container">
                <input
                    type={type === "password" ? (showPassword ? "text" : "password") : type}
                    value={value || ""}
                    name={name}
                    onChange={format ? handleFormattedChange : onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    maxLength={format ? format.length : undefined}
                />
                {type === "password" && (
                    <span className="toggle-password" onClick={togglePasswordVisibility}>
                        {showPassword ? (
                            <svg width="18" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Show icon */}
                            </svg>
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                {/* Hide icon */}
                            </svg>
                        )}
                    </span>
                )}
            </div>
        </div>
    );
};

export default InputField;
