// src/components/HeadingText.js

import React from 'react';

const HeadingText = ({ title }) => {
  return (
    <div>
      <h1 style={{ fontSize: "16px", fontWeight: "500", marginBottom:"15px" }}>{title}</h1>
      <div style={{ width: "100%", height: "2px", backgroundColor: "#CCC", borderRadius: "20px" }}></div>
    </div>
  )
};

export default HeadingText;
