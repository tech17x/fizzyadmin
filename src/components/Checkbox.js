import React from "react";
import { Check } from "lucide-react";

const Checkbox = ({ labelId, label, checked, onChange, disable = false }) => {
    return (
        <div className="flex items-center gap-2">
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
                className={`flex items-center gap-2 cursor-pointer ${disable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <div className={`w-4 h-4 border-2 rounded flex items-center justify-center transition-colors ${
                    checked 
                        ? 'bg-orange-500 border-orange-500' 
                        : 'border-gray-300 hover:border-gray-400'
                }`}>
                    {checked && <Check size={12} className="text-white" />}
                </div>
                <span className="text-sm text-gray-700">{label}</span>
            </label>
        </div>
    );
};

export default Checkbox;
