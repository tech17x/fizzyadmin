// src/components/ui/IconButton.jsx
import React from "react";

const IconButton = ({ children, label, className = "", ...rest }) => (
  <button aria-label={label} className={`icon-btn ${className}`} {...rest}>
    {children}
  </button>
);

export default IconButton;
