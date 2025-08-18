// SectionHeading.jsx
import React from "react";
import "./SectionHeading.css"; // optional if using CSS

const SectionHeading = ({ title }) => {
  return (
    <div className="section-heading">
      <h3 className="section-heading-title">{title}</h3>
      <div className="section-divider" />
    </div>
  );
};

export default SectionHeading;
