import React from 'react';

const HeadingText = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      {subtitle && <p className="text-gray-600">{subtitle}</p>}
      <div className="w-16 h-1 bg-primary-gradient rounded-full mt-4"></div>
    </div>
  );
};

export default HeadingText;