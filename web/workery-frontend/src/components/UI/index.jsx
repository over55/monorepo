// File Path: web/workery-frontend/src/components/UI/index.jsx

import React from "react";
import { Link } from "react-router";
import { theme, globalStyles } from "../../constants/Theme";

// Button Component
export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  type = "button",
  fullWidth = false,
  style = {},
}) {
  const sizes = {
    sm: { padding: "6px 12px", fontSize: "12px" },
    md: { padding: "10px 20px", fontSize: "14px" },
    lg: { padding: "12px 24px", fontSize: "16px" },
  };

  const variants = {
    primary: { backgroundColor: theme.colors.primary, color: "white" },
    secondary: { backgroundColor: theme.colors.secondary, color: "white" },
    success: { backgroundColor: theme.colors.success, color: "white" },
    danger: { backgroundColor: theme.colors.danger, color: "white" },
    warning: { backgroundColor: theme.colors.warning, color: "black" },
    info: { backgroundColor: theme.colors.info, color: "white" },
    outline: {
      backgroundColor: "transparent",
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...globalStyles.button,
        ...sizes[size],
        ...variants[variant],
        width: fullWidth ? "100%" : "auto",
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

// Card Component
export function Card({ children, title, actions, style = {} }) {
  return (
    <div style={{ ...globalStyles.card, ...style }}>
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          {title && <h2 style={{ margin: 0, fontSize: "20px" }}>{title}</h2>}
          {actions && (
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// Form Components
export function FormGroup({ children, style = {} }) {
  return <div style={{ marginBottom: "20px", ...style }}>{children}</div>;
}

export function Input({
  label,
  type = "text",
  value,
  onChange,
  error,
  required,
  placeholder,
  disabled,
  name,
  ...props
}) {
  return (
    <FormGroup>
      {label && (
        <label style={globalStyles.label}>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...globalStyles.input,
          borderColor: error ? theme.colors.error : "#ddd",
        }}
        {...props}
      />
      {error && <div style={globalStyles.errorMessage}>{error}</div>}
    </FormGroup>
  );
}

export function Select({
  label,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  name,
}) {
  return (
    <FormGroup>
      {label && (
        <label style={globalStyles.label}>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        style={{
          ...globalStyles.input,
          borderColor: error ? theme.colors.error : "#ddd",
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div style={globalStyles.errorMessage}>{error}</div>}
    </FormGroup>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  required,
  placeholder,
  disabled,
  rows = 4,
  maxLength,
  name,
  ...props
}) {
  return (
    <FormGroup>
      {label && (
        <label style={globalStyles.label}>
          {label} {required && <span style={{ color: "red" }}>*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        style={{
          ...globalStyles.input,
          borderColor: error ? theme.colors.error : "#ddd",
          resize: "vertical",
        }}
        {...props}
      />
      {maxLength && (
        <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
          {value?.length || 0}/{maxLength} characters
        </div>
      )}
      {error && <div style={globalStyles.errorMessage}>{error}</div>}
    </FormGroup>
  );
}

// Alert Component
export function Alert({ type = "info", children, onClose }) {
  const types = {
    error: {
      bg: theme.colors.errorBg,
      color: theme.colors.error,
      border: theme.colors.error,
    },
    success: {
      bg: theme.colors.successBg,
      color: theme.colors.success,
      border: theme.colors.success,
    },
    warning: {
      bg: theme.colors.warningBg,
      color: "#856404",
      border: theme.colors.warning,
    },
    info: {
      bg: theme.colors.infoBg,
      color: "#0c5460",
      border: theme.colors.info,
    },
  };

  const style = types[type];

  return (
    <div
      style={{
        padding: "15px",
        borderRadius: "4px",
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        marginBottom: "20px",
        position: "relative",
      }}
    >
      {children}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            fontSize: "20px",
            cursor: "pointer",
            color: style.color,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

// Loading Component
export function Loading({ message = "Loading..." }) {
  return (
    <div style={{ textAlign: "center", padding: "40px" }}>
      <div style={{ fontSize: "24px", marginBottom: "10px" }}>⏳</div>
      <p>{message}</p>
    </div>
  );
}

// Breadcrumb Component
export function Breadcrumb({ items }) {
  const isMobile = window.innerWidth <= theme.breakpoints.mobile;

  if (isMobile && items.length > 1) {
    return (
      <nav
        style={{
          backgroundColor: theme.colors.light,
          padding: "15px",
          borderRadius: "4px",
          marginBottom: "20px",
        }}
      >
        <Link
          to={items[items.length - 2].path}
          style={{ textDecoration: "none", color: theme.colors.primary }}
        >
          ← Back to {items[items.length - 2].label}
        </Link>
      </nav>
    );
  }

  return (
    <nav
      style={{
        backgroundColor: theme.colors.light,
        padding: "15px",
        borderRadius: "4px",
        marginBottom: "20px",
      }}
    >
      {items.map((item, index) => (
        <span key={index}>
          {item.path ? (
            <Link
              to={item.path}
              style={{ textDecoration: "none", color: theme.colors.primary }}
            >
              {item.icon && `${item.icon} `}
              {item.label}
            </Link>
          ) : (
            <span>
              {item.icon && `${item.icon} `}
              {item.label}
            </span>
          )}
          {index < items.length - 1 && " > "}
        </span>
      ))}
    </nav>
  );
}

// Modal Component
export function Modal({ isOpen, onClose, title, children, footer }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          ...globalStyles.card,
          maxWidth: "500px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
        }}
      >
        {title && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ margin: 0 }}>{title}</h3>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}
        <div>{children}</div>
        {footer && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Table Component for responsive tables
export function Table({ columns, data, onRowClick }) {
  const isMobile = window.innerWidth <= theme.breakpoints.mobile;

  if (isMobile) {
    // Mobile card view
    return (
      <div>
        {data.map((row, index) => (
          <Card
            key={index}
            style={{
              marginBottom: "15px",
              cursor: onRowClick ? "pointer" : "default",
            }}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((col) => (
              <div key={col.key} style={{ marginBottom: "8px" }}>
                <strong>{col.label}:</strong>{" "}
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </div>
            ))}
          </Card>
        ))}
      </div>
    );
  }

  // Desktop table view
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ backgroundColor: "#f8f9fa" }}>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                padding: "12px",
                textAlign: col.align || "left",
                borderBottom: "2px solid #dee2e6",
                fontWeight: "600",
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr
            key={index}
            onClick={() => onRowClick && onRowClick(row)}
            style={{ cursor: onRowClick ? "pointer" : "default" }}
          >
            {columns.map((col) => (
              <td
                key={col.key}
                style={{
                  padding: "12px",
                  borderBottom: "1px solid #dee2e6",
                  textAlign: col.align || "left",
                }}
              >
                {col.render ? col.render(row[col.key], row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
