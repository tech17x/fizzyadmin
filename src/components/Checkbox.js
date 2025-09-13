import React from "react";
import { Check } from "lucide-react";

const Checkbox = ({ 
  labelId, 
  label, 
  checked, 
  onChange, 
  disable = false,
  helpText = null,
  className = ""
}) => {
    return (
        <div className={`flex items-start space-x-3 ${className}`}>
            <div className="relative flex items-center">
                <input
                    type="checkbox"
                    id={labelId || label}
                    checked={checked}
                    onChange={onChange}
                    disabled={disable}
                    className="sr-only"
                />
                <div 
                    className={`
                        w-5 h-5 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all duration-200
                        ${checked 
                            ? 'bg-orange-600 border-orange-600' 
                            : 'bg-white border-gray-300 hover:border-orange-400'
                        }
                        ${disable ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    onClick={!disable ? onChange : undefined}
                >
                    {checked && (
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                    )}
                </div>
            </div>
            
            <div className="flex-1">
                <label 
                    htmlFor={labelId || label}
                    className={`
                        text-sm font-medium cursor-pointer
                        ${disable ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:text-gray-900'}
                    `}
                    onClick={!disable ? onChange : undefined}
                >
                    {label}
                </label>
                {helpText && (
                    <p className="text-xs text-gray-500 mt-1">{helpText}</p>
                )}
            </div>
        </div>
    );
};

export default Checkbox;