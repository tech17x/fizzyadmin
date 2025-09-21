import React from 'react';

const Button = ({ disable = false, clickAction, className = "", children, type = "button" }) => {
    return (
        <button 
            type={type}
            disabled={disable} 
            onClick={clickAction} 
            className={`btn-secondary ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;