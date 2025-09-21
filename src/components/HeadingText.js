import React from 'react';

const HeadingText = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      {subtitle && <p className="text-slate-600">{subtitle}</p>}
      <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mt-4"></div>
    </div>
  );
};

export default HeadingText;