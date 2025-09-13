import React from 'react';

const HeadingText = ({ title, subtitle, icon: Icon }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center space-x-3 mb-2">
        {Icon && (
          <div className="p-2 bg-orange-100 rounded-lg">
            <Icon className="h-5 w-5 text-orange-600" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-600">{subtitle}</p>
      )}
      <div className="w-full h-px bg-gradient-to-r from-orange-200 via-orange-300 to-orange-200 mt-4"></div>
    </div>
  );
};

export default HeadingText;