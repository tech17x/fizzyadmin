import React from 'react';

const GradientButton = ({ disable = false, clickAction, className = "", children, type = "button" }) => {
    return (
        <button 
            type={type}
            disabled={disable} 
            className={`btn-primary ${className}`}
            onClick={clickAction}
        >
            {children}
        </button>
    );
};

export default GradientButton;