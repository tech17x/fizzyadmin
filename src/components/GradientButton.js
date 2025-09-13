import React from 'react';

const GradientButton = ({ 
  disable = false, 
  clickAction, 
  className = "", 
  children,
  size = "md",
  variant = "primary"
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm", 
    lg: "px-6 py-3 text-base"
  };

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-200 focus:outline-none focus:ring-2 
    focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 
    disabled:cursor-not-allowed ${sizeClasses[size]}
  `;

  const variantClasses = {
    primary: `
      text-white shadow-sm hover:shadow-md transform hover:-translate-y-0.5
      disabled:hover:transform-none
    `,
    secondary: `
      text-gray-700 bg-white border border-gray-300 hover:bg-gray-50
    `
  };

  const gradientStyle = variant === 'primary' ? {
    background: 'linear-gradient(135deg, rgb(239, 162, 128) 0%, rgb(223, 98, 41) 100%)'
  } : {};

  return (
    <button 
      disabled={disable} 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={clickAction} 
      style={gradientStyle}
    >
      {children}
    </button>
  );
};

export default GradientButton;