// src/components/ui/Input.jsx
import React from "react";

const Input = ({ label, className = "", ...rest }) => (
  <div className={`input-group ${className}`}>
    {label && <label className="input-label">{label}</label>}
    <input className="input-field" {...rest} />
  </div>
);

export default Input;
