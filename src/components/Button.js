import React from 'react';

const Button = ({ disable = false, clickAction, className = "", children, type = "button" }) => {
    return (
        <button 
            type={type}
            disabled={disable} 
            onClick={clickAction} 
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium text-sm border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;