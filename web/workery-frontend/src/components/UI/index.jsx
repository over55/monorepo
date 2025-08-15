// File Path: src/components/UI/index.jsx
// Complete UI Components Library using Tailwind v4 and Heroicons

import React from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

// Card Component
export const Card = ({ children, className = "", padding = "p-8" }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg ${padding} ${className}`}>
      {children}
    </div>
  );
};

// Input Component
export const Input = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  icon: Icon,
  helperText,
  className = "",
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            w-full px-4 py-3
            ${Icon ? "pl-10" : "pl-4"}
            border rounded-lg
            transition-all duration-200
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-offset-1
            ${
              error
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
            }
            ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
          `}
        />
      </div>
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea Component
export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  rows = 4,
  helperText,
  className = "",
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        rows={rows}
        className={`
          w-full px-4 py-3
          border rounded-lg
          transition-all duration-200
          placeholder:text-gray-400
          focus:outline-none focus:ring-2 focus:ring-offset-1
          resize-y
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          }
          ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
        `}
      />
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Select Component
export const Select = ({
  label,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
  required = false,
  placeholder = "Select an option",
  className = "",
}) => {
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={`
          w-full px-4 py-3
          border rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-1
          appearance-none
          bg-white
          ${
            error
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
          }
          ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : ""}
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Button Component
export const Button = ({
  type = "button",
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled = false,
  children,
  onClick,
  loading = false,
  icon: Icon,
  className = "",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const baseClasses = `
    font-medium rounded-lg
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    flex items-center justify-center gap-2
    ${sizeClasses[size]}
    ${fullWidth ? "w-full" : ""}
    ${disabled || loading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
    ${className}
  `;

  const variantClasses = {
    primary: `
      bg-blue-500 text-white
      hover:bg-blue-600 active:bg-blue-700
      focus:ring-blue-500
      ${disabled || loading ? "" : "hover:shadow-lg"}
    `,
    secondary: `
      bg-gray-200 text-gray-800
      hover:bg-gray-300 active:bg-gray-400
      focus:ring-gray-500
    `,
    outline: `
      border-2 border-gray-300 text-gray-700
      hover:border-gray-400 hover:bg-gray-50
      focus:ring-gray-500
    `,
    danger: `
      bg-red-500 text-white
      hover:bg-red-600 active:bg-red-700
      focus:ring-red-500
      ${disabled || loading ? "" : "hover:shadow-lg"}
    `,
    success: `
      bg-green-500 text-white
      hover:bg-green-600 active:bg-green-700
      focus:ring-green-500
      ${disabled || loading ? "" : "hover:shadow-lg"}
    `,
    ghost: `
      text-gray-600
      hover:bg-gray-100 hover:text-gray-900
      focus:ring-gray-500
    `,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
    >
      {loading && (
        <div className="spinner border-2 border-current border-t-transparent rounded-full w-5 h-5 animate-spin" />
      )}
      {Icon && !loading && <Icon className="h-5 w-5" />}
      {children}
    </button>
  );
};

// Alert Component
export const Alert = ({
  type = "info",
  children,
  dismissible = false,
  onDismiss,
  className = "",
}) => {
  const alertStyles = {
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    error: "bg-red-50 text-red-800 border-red-200",
    success: "bg-green-50 text-green-800 border-green-200",
    info: "bg-blue-50 text-blue-800 border-blue-200",
  };

  const icons = {
    warning: <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0" />,
    error: <XCircleIcon className="h-5 w-5 flex-shrink-0" />,
    success: <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />,
    info: <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />,
  };

  return (
    <div
      className={`p-4 rounded-lg flex gap-3 mb-5 border animate-fade-in ${alertStyles[type]} ${className}`}
    >
      {icons[type]}
      <div className="flex-1 text-sm">{children}</div>
      {dismissible && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 ml-auto hover:opacity-70 transition-opacity"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

// Badge Component
export const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
    lg: "px-3 py-1.5 text-base",
  };

  const variantClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-amber-100 text-amber-800",
    error: "bg-red-100 text-red-800",
    info: "bg-cyan-100 text-cyan-800",
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

// Modal Component
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  className = "",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal Content */}
        <div
          className={`
          relative bg-white rounded-xl shadow-xl
          w-full ${sizeClasses[size]}
          transform transition-all animate-slide-up
          ${className}
        `}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          )}

          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Spinner Component
export const Spinner = ({ size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className={`
        border-4 border-gray-200 border-t-blue-500
        rounded-full animate-spin
        ${sizeClasses[size]}
      `}
      />
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
};

// Radio Component
export const Radio = ({
  label,
  name,
  value,
  checked,
  onChange,
  disabled = false,
  className = "",
}) => {
  return (
    <label
      className={`flex items-center cursor-pointer ${disabled ? "opacity-60 cursor-not-allowed" : ""} ${className}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-500 border-gray-300 focus:ring-blue-500 focus:ring-2"
      />
      {label && <span className="ml-2 text-sm text-gray-700">{label}</span>}
    </label>
  );
};

// ==================== ADDITIONAL COMPONENTS ====================

export const Breadcrumb = ({ items = [], className = "" }) => {
  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {items.map((item, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="w-3 h-3 text-gray-400 mx-1" />
            )}
            {item.href ? (
              <a
                href={item.href}
                className={`inline-flex items-center text-sm font-medium ${
                  index === items.length - 1
                    ? "text-gray-500 cursor-default"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                onClick={item.onClick}
              >
                {/* Handle icon as component or string */}
                {item.icon &&
                  typeof item.icon === "function" &&
                  React.createElement(item.icon, {
                    className: "w-4 h-4 mr-2",
                  })}
                {item.icon && typeof item.icon === "string" && (
                  <span className="mr-2">{item.icon}</span>
                )}
                {item.label}
              </a>
            ) : (
              <span
                className={`inline-flex items-center text-sm font-medium ${
                  index === items.length - 1 ? "text-gray-500" : "text-gray-700"
                }`}
              >
                {/* Handle icon as component or string */}
                {item.icon &&
                  typeof item.icon === "function" &&
                  React.createElement(item.icon, {
                    className: "w-4 h-4 mr-2",
                  })}
                {item.icon && typeof item.icon === "string" && (
                  <span className="mr-2">{item.icon}</span>
                )}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Fixed Table Component - Replace the existing Table component in UI/index.jsx
// This version handles multiple column configuration formats

export const Table = ({ columns = [], data = [], className = "" }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                      ? "text-right"
                      : "text-left"
                }`}
              >
                {column.header || column.label || column.name || ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {(() => {
                      // If column has a custom render function, use it
                      if (typeof column.render === "function") {
                        return column.render(
                          row[column.key || column.accessor],
                          row,
                        );
                      }

                      // Get the value using various possible keys
                      let value = null;
                      if (column.accessor) {
                        value = row[column.accessor];
                      } else if (column.key) {
                        value = row[column.key];
                      } else if (column.field) {
                        value = row[column.field];
                      } else if (column.dataIndex) {
                        value = row[column.dataIndex];
                      }

                      // Return the value or a placeholder
                      return value !== null && value !== undefined
                        ? value
                        : "-";
                    })()}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Tabs Component
export const Tabs = ({ tabs = [], activeTab, onTabChange, className = "" }) => {
  return (
    <div className={className}>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({
  value = 0,
  max = 100,
  className = "",
  color = "blue",
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    yellow: "bg-yellow-500",
    purple: "bg-purple-500",
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
      <div
        className={`${colorClasses[color]} h-2.5 rounded-full transition-all duration-300`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Divider Component
export const Divider = ({ className = "", text = "" }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-300" />
      </div>
      {text && (
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">{text}</span>
        </div>
      )}
    </div>
  );
};

// Tooltip Component (simple version)
export const Tooltip = ({ children, text, className = "" }) => {
  return (
    <div className={`relative inline-block group ${className}`}>
      {children}
      <div className="absolute z-10 invisible group-hover:visible bg-gray-900 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-2 whitespace-nowrap">
        {text}
        <svg
          className="absolute text-gray-900 h-2 w-full left-0 top-full"
          x="0px"
          y="0px"
          viewBox="0 0 255 255"
        >
          <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
        </svg>
      </div>
    </div>
  );
};

// Pagination Component
export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav className={`flex items-center justify-between ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      <div className="flex gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-2 text-sm font-medium rounded-lg ${
              currentPage === page
                ? "bg-blue-500 text-white"
                : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100"
            }`}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </nav>
  );
};

// Loading Overlay Component
export const LoadingOverlay = ({ isLoading, message = "Loading..." }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({
  title = "No data found",
  description = "",
  icon: Icon,
  action,
  className = "",
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
// Loading Component (simple spinner with optional text)
export const Loading = ({
  size = "md",
  text = "",
  fullScreen = false,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white bg-opacity-90">
        <div
          className={`
          border-4 border-gray-200 border-t-blue-500
          rounded-full animate-spin
          ${sizeClasses[size]}
        `}
        />
        {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`
        border-4 border-gray-200 border-t-blue-500
        rounded-full animate-spin
        ${sizeClasses[size]}
      `}
      />
      {text && <p className="mt-4 text-gray-600 text-center">{text}</p>}
    </div>
  );
};
// ==================== EXPORT ALIASES ====================
// Common naming variations used across the codebase

// Form component aliases
export const TextArea = Textarea;
export const CheckBox = Checkbox;
export const RadioButton = Radio;

// Loading/Spinner aliases
export const LoadingSpinner = Spinner;
export const Loader = Loading;
export const LoadingIndicator = Loading;

// Alert/Notification aliases
export const Notification = Alert;
export const Message = Alert;

// Card aliases
export const Panel = Card;
export const Box = Card;
// FormGroup Component - for grouping form elements
export const FormGroup = ({
  children,
  label,
  error,
  required = false,
  helperText,
  className = "",
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

// Alternative simpler FormGroup if the above doesn't match your needs
export const FormRow = ({ children, className = "" }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 ${className}`}>
      {children}
    </div>
  );
};

// Form Section Component (often used with FormGroup)
export const FormSection = ({
  title,
  description,
  children,
  className = "",
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
};
