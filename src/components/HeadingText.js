// src/components/HeadingText.js

import React from 'react';

const HeadingText = ({ title }) => {
  return (
    <div>
      <h1 style={{ fontSize: "1.3rem", fontWeight: "bold", marginBottom: "1rem", }}>{title}</h1>
      <div style={{ width: "100%", height: "2px", backgroundColor: "#FFFFFF", borderRadius: "20px" }}></div>
    </div>
  )
};

export default HeadingText;
