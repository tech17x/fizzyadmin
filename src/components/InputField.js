import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
    <div className="flex flex-col gap-1">
      {label && (
        <label className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors ${
            disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : ''
          }`}
          value={value !== undefined && value !== null ? value : ""}
          name={name}
          onChange={handleInputChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
        {type === "password" && (
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? (
              <EyeOff size={16} />
            ) : (
              <Eye size={16} />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;
