// src/components/GradientText.js

import React from 'react';

const GradientText = ({ children }) => {
  const gradientStyle = {
    backgroundImage: 'linear-gradient(#EFA280, #DF6229)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
    userSelect: 'none',
    fontSize : "12px"
  };

  return <span style={gradientStyle}>{children}</span>;
};

export default GradientText;
