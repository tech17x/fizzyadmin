import React, { useState } from "react";

const applyFormat = (value, format) => {
  if (!format) return value;
  let formatted = "", formatIndex = 0, valueIndex = 0;
  while (formatIndex < format.length && valueIndex < value.length) {
    const formatChar = format[formatIndex];
    const inputChar = value[valueIndex];
    const isDigit = /\d/.test(inputChar);
    const isAlpha = /[a-zA-Z]/.test(inputChar);
    const isAlphanumeric = /[a-zA-Z0-9]/.test(inputChar);

    if (formatChar === "#" && isDigit) {
      formatted += inputChar; formatIndex++;
    } else if (formatChar === "A" && isAlpha) {
      formatted += inputChar; formatIndex++;
    } else if (formatChar === "*" && isAlphanumeric) {
      formatted += inputChar; formatIndex++;
    } else if (!["#", "A", "*"].includes(formatChar)) {
      formatted += formatChar;
      if (inputChar === formatChar) valueIndex++;
      formatIndex++;
    }
    valueIndex++;
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
    const formattedValue = format ? applyFormat(e.target.value, format) : e.target.value;
    onChange({ ...e, target: { ...e.target, value: formattedValue, name: e.target.name } });
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${disabled ? "text-gray-400" : "text-gray-700"}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          name={name}
          value={value ?? ""}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`w-full px-4 py-2.5 text-sm rounded-full border shadow-sm focus:ring-2 focus:ring-[rgba(255,232,225,0.85)] focus:border-[rgba(255,232,225,0.85)] outline-none transition
            ${disabled ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white text-gray-800 border-gray-300"}`}
        />
        {type === "password" && (
          <span
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700"
          >
            {showPassword ? "👁️" : "🙈"}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputField;
