// src/components/ui/Dropdown.jsx
import React from "react";

const Dropdown = ({ children, open, className = "" }) => {
  return (
    <div className={`dropdown ${className}`} style={{ display: open ? "block" : "none" }}>
      {children}
    </div>
  );
};

export default Dropdown;
