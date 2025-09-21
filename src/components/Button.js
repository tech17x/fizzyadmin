import React from 'react';

const Button = ({ disable = false, clickAction, className = "", children, type = "button" }) => {
    return (
        <button 
            type={type}
            disabled={disable} 
            onClick={clickAction} 
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;