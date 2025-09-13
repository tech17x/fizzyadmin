// src/components/HeadingText.js

import React from 'react';

const HeadingText = ({ title }) => {
  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <div className="w-full h-1 bg-gradient-to-r from-orange-400 to-orange-500 rounded-full shadow-sm"></div>
    </div>
  )
};

export default HeadingText;
