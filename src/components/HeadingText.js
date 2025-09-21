import React from 'react';

const HeadingText = ({ title }) => {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-3">{title}</h2>
      <div className="w-full h-0.5 bg-gradient-to-r from-orange-300 to-orange-600 rounded-full"></div>
    </div>
  );
};

export default HeadingText;
