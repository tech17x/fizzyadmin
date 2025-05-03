import React from 'react';

const GradientButton = ({ disable = false, clickAction, className="", children }) => {
    return (
        <button 
            disabled={disable} 
            className={className}
            onClick={clickAction} 
            style={{
                ...styles.button, 
                opacity: disable ? 0.5 : 1, 
                cursor: disable ? "not-allowed" : "pointer"
            }}
        >
            {children}
        </button>
    );
};

const styles = {
    button: {
        background: "linear-gradient(#EFA280 0%, #DF6229 100%)",
        color: "white",
        fontWeight: "bold",
        padding: "12px 24px",
        border: "none",
        borderRadius: "20px",
        fontSize: "16px",
        transition: "opacity 0.3s",
    }
};

export default GradientButton;
