import React from "react";
import { Check } from "lucide-react";

const Checkbox = ({ labelId, label, checked, onChange, disable = false, className = "" }) => {
    return (
        <div className={`flex items-center gap-3 ${className}`}>
            <input
                type="checkbox"
                id={labelId || label}
                checked={checked}
                onChange={onChange}
                disabled={disable}
                className="sr-only"
            />
            <label 
                htmlFor={labelId || label}
                className={`flex items-center gap-3 cursor-pointer select-none ${disable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition-all duration-200 ${
                    checked 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}>
                    {checked && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-gray-700">{label}</span>
            </label>
        </div>
    );
};

export default Checkbox;