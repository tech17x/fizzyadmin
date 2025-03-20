// src/components/HeadingText.js

import React from 'react';

const HeadingText = ({ children }) => {
  return <p style={{fontSize:'1.2rem', fontWeight:"600"}} >{children}</p>;
};

export default HeadingText;
