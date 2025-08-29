// File Path: web/workery-frontend/src/components/UI/Button.jsx

import React from "react";

function Button({
  children,
  variant = "primary",
  onClick,
  disabled = false,
  type = "button",
  className = "",
  loading = false, // Extract this
  fullWidth = false, // Extract this
  size, // Extract this (if you use it)
  ...props // Now this only contains valid HTML attributes
}) {
  const baseClasses =
    "px-4 py-2 font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 disabled:bg-gray-100",
    success:
      "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 disabled:bg-green-300",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300",
    ghost: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  // Add fullWidth and size handling if needed
  const widthClass = fullWidth ? "w-full" : "";
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  const finalSizeClass = size ? sizeClasses[size] : "";

  const classes = `${finalSizeClass || baseClasses} ${variantClasses[variant]} ${widthClass} ${disabled || loading ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className}`;

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props} // Now safe - only contains valid HTML attributes
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export default Button;
