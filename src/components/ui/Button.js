// src/components/ui/Button.jsx
import React from "react";

const Button = ({ children, variant = "primary", className = "", ...rest }) => {
  const base = "btn";
  const variantClass =
    variant === "primary" ? "btn-primary" :
    variant === "ghost" ? "btn-ghost" :
    variant === "danger" ? "btn-danger" : "btn-primary";

  return (
    <button className={`${base} ${variantClass} ${className}`} {...rest}>
      {children}
    </button>
  );
};

export default Button;
