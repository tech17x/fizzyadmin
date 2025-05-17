// src/components/Button.js

import React from 'react';
import GradientText from './GradientText';

const Button = ({ disable=false, clickAction, className, children }) => {
    return (
        <button disabled={disable} onClick={clickAction} className={className} style={{
            fontSize: "12px",
            fontWeight: "bold",
            padding: "8px 15px",
            border: "2px solid transparent",
            borderRadius: "20px",
            letterSpacing: "1px",
            color: "white",
            backgroundColor: "transparent",
            cursor: disable ? "not-allowed" : "pointer",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.3s ease",
        }}>
            <span style={{
                position: "absolute",
                inset: 0,
                borderRadius: "20px",
                padding: "2px",
                background: "linear-gradient(90deg, #EFA280 0%, #DF6229 100%)",
                WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                WebkitMaskComposite: "destination-out",
                maskComposite: "exclude"
            }}></span>
            <GradientText>{children}</GradientText>
        </button>
    );
};

export default Button;
