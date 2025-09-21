import React from 'react';

const GradientButton = ({ disable = false, clickAction, className = "", children }) => {
    return (
        <button 
            disabled={disable} 
            className={`px-6 py-2 bg-gradient-to-r from-orange-300 to-orange-600 text-white font-medium rounded-full text-sm transition-all duration-200 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${className}`}
            onClick={clickAction}
        >
            {children}
        </button>
    );
};

export default GradientButton;
