import React from 'react';

const GradientButton = ({ children }) => {
    return (
        <button style={styles.button}>{children}</button>
    );
};

const styles = {
    button: {
        background: "linear-gradient( #EFA280 0%, #DF6229 100%)",
        color: "white",
        fontWeight: "bold",
        padding: "12px 24px",
        border: "none",
        borderRadius: "20px",
        cursor: "pointer",
        fontSize: "16px",
        transition: "opacity 0.3s",
    }
};

export default GradientButton;
