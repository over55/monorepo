// File Path: web/workery-frontend/src/constants/Theme.js

export const theme = {
  colors: {
    primary: "#007bff",
    secondary: "#6c757d",
    success: "#28a745",
    danger: "#dc3545",
    warning: "#ffc107",
    info: "#17a2b8",
    dark: "#1a1a1a",
    light: "#f5f5f5",
    white: "#ffffff",
    error: "#dc3545",
    errorBg: "#ffebee",
    successBg: "#d4edda",
    warningBg: "#fff3cd",
    infoBg: "#d1ecf1",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },
  transitions: {
    fast: "0.2s",
    normal: "0.3s",
    slow: "0.5s",
  },
};

export const globalStyles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "20px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  button: {
    padding: "10px 20px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    fontSize: "14px",
  },
  errorMessage: {
    color: theme.colors.error,
    fontSize: "12px",
    marginTop: "4px",
  },
  section: {
    marginBottom: "30px",
  },
};
