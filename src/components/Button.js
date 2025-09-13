import React from 'react';

const Button = ({ 
  disable = false, 
  clickAction, 
  className = "", 
  children,
  size = "md",
  variant = "secondary"
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
    secondary: `
      text-gray-700 bg-white border border-gray-300 hover:bg-gray-50
      shadow-sm hover:shadow-md
    `,
    outline: `
      text-orange-600 bg-transparent border-2 border-orange-200 
      hover:bg-orange-50 hover:border-orange-300
    `,
    ghost: `
      text-gray-600 bg-transparent hover:bg-gray-100
    `
  };

  return (
    <button 
      disabled={disable} 
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={clickAction}
    >
      {children}
    </button>
  );
};

export default Button;