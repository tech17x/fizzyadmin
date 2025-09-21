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
      formatted += formatChar;
      if (inputChar === formatChar) valueIndex++;
      formatIndex++;
    }
  }

  return formatted;
};

const InputField = ({
  type = "text",
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  format = null,
  className = ""
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
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type={type === "password" ? (showPassword ? "text" : "password") : type}
          className={`w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:bg-slate-50 disabled:text-slate-500 hover:border-slate-300 ${className}`}
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default InputField;