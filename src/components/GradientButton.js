import React from 'react';

const GradientButton = ({ disable = false, clickAction, className = "", children, type = "button" }) => {
    return (
        <button 
            type={type}
            disabled={disable} 
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-gradient text-white font-semibold text-sm rounded-xl hover:shadow-lg focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md ${className}`}
            onClick={clickAction}
        >
            {children}
        </button>
    );
};

export default GradientButton;