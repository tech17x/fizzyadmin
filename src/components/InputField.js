import React, { useState } from "react";
import "./InputField.css";

const applyFormat = (value, format) => {
  if (!format) return value;

  let formatted = "";
  let formatIndex = 0;
  let valueIndex = 0;

  while (formatIndex < format.length && valueIndex < value.length) {
    const formatChar = format[formatIndex];
    const inputChar = value[valueIndex];

    const isDigit = /\d/.test(inputChar);
    const isAlpha = /[a-zA-Z]/.test(inputChar);
    const isAlphanumeric = /[a-zA-Z0-9]/.test(inputChar);

    if (formatChar === "#") {
      if (isDigit) {
        formatted += inputChar;
        formatIndex++;
      }
      valueIndex++;
    } else if (formatChar === "A") {
      if (isAlpha) {
        formatted += inputChar;
        formatIndex++;
      }
      valueIndex++;
    } else if (formatChar === "*") {
      if (isAlphanumeric) {
        formatted += inputChar;
        formatIndex++;
      }
      valueIndex++;
    } else {
      // Static characters in the format (like dashes or spaces)
      formatted += formatChar;
      if (inputChar === formatChar) valueIndex++;
      formatIndex++;
    }
  }

  return formatted;
};

const InputField = ({
  type,
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  format = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const rawName = e.target.name;
    const rawValue = e.target.value;
    const formattedValue = format ? applyFormat(rawValue, format) : rawValue;
    onChange({ ...e, target: { ...e.target, value: formattedValue, name: rawName } });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="input-field">
      {label && (
        <label
          className="input-field__label"
          style={{ color: disabled ? "#9ca3af" : "#374151" }}
        >
          {label}
        </label>
      )}

      <div className="input-field__container">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          className="input-field__input"
          value={value || ""}
          name={name}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {type === "password" && (
          <span className="input-field__toggle-password" onClick={togglePasswordVisibility}>
            {showPassword ? (
              <svg width="18" height="16" viewBox="0 0 24 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 8C1 8 5 1 12 1C19 1 23 8 23 8C23 8 19 15 12 15C5 15 1 8 1 8Z" stroke="#4B5563" strokeWidth="2" />
                <circle cx="12" cy="8" r="3" stroke="#4B5563" strokeWidth="2" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3L21 21M1 8C1 8 5 1 12 1C14.7 1 17 2.1 19 3.8M23 8C23 8 19 15 12 15C9.3 15 7 13.9 5 12.2M12 12C11.2044 12 10.4413 11.6839 9.87868 11.1213C9.31607 10.5587 9 9.79565 9 9C9 8.20435 9.31607 7.44129 9.87868 6.87868C10.4413 6.31607 11.2044 6 12 6C12.7956 6 13.5587 6.31607 14.1213 6.87868C14.6839 7.44129 15 8.20435 15 9" stroke="#4B5563" strokeWidth="2" />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;
