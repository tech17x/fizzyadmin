import React from 'react';

const Button = ({ disable = false, clickAction, className = "", children }) => {
    return (
        <button 
            disabled={disable} 
            onClick={clickAction} 
            className={`px-6 py-2 border-2 border-orange-500 text-orange-600 font-medium rounded-full text-sm transition-all duration-200 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
