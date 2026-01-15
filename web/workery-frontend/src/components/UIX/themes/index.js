// File Path: src/components/UIX/themes/index.js
// OPTIMIZED UIX Theme System - Performance optimized version with caching

export const UIX_THEMES = {
  BLUE: "blue",
  RED: "red",
  PURPLE: "purple",
  GREEN: "green",
  CHARCOAL: "charcoal",
  DARK: "dark",
};

// Cache for theme configurations to prevent recreation
let _themeConfigCache = null;

// Initialize theme configs with caching
const getThemeConfigs = () => {
  if (_themeConfigCache) {
    return _themeConfigCache;
  }

  _themeConfigCache = {
    [UIX_THEMES.BLUE]: {
      name: "Blue Theme",
      classes: {
        // Primary button styles
        "button-primary":
          "bg-blue-900 text-white hover:bg-blue-800 focus:ring-4 focus:ring-blue-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-secondary":
          "border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm",
        "button-outline":
          "border-2 border-blue-300 bg-white text-blue-700 hover:bg-blue-50 hover:border-blue-400 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "button-create":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-success":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-danger":
          "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-gradient":
          "border-transparent text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/20 transform hover:scale-105 font-bold",
        "button-ghost":
          "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 border border-transparent",
        "button-disabled":
          "bg-gray-600 text-white hover:bg-gray-700 focus:ring-4 focus:ring-gray-500/20 border border-transparent",

        // Input and form styles
        "input-border":
          "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        "input-border-error":
          "border-red-500 focus:border-red-500 focus:ring-red-500",
        "input-focus-ring": "focus:ring-4 focus:ring-blue-500/20",

        // Table styles
        "table-header-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "table-header-text": "text-white border-b border-blue-900",
        "table-row-hover": "hover:bg-blue-50",

        // Alert and notification styles
        "alert-info-bg": "bg-blue-50",
        "alert-info-text": "text-blue-800",
        "alert-info-border": "border-blue-200",
        "alert-info-icon": "text-blue-600",
        "alert-warning-bg": "bg-amber-50",
        "alert-warning-text": "text-amber-800",
        "alert-warning-title": "text-amber-900",
        "alert-warning-border": "border-amber-200",
        "alert-error-bg": "bg-red-50",
        "alert-error-text": "text-red-800",
        "alert-error-border": "border-red-200",
        "alert-success-bg": "bg-green-50",
        "alert-success-text": "text-green-800",
        "alert-success-border": "border-green-200",
        "alert-info-hover": "hover:bg-blue-100",
        "alert-warning-hover": "hover:bg-amber-100",
        "alert-error-hover": "hover:bg-red-100",
        "alert-success-hover": "hover:bg-green-100",

        // Navigation and breadcrumb
        "breadcrumb-active": "text-blue-600",
        "breadcrumb-inactive": "text-gray-500 hover:text-blue-600",

        // Tabs
        "tab-active": "border-blue-500 text-blue-600",
        "tab-inactive":
          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",

        // Pagination
        "pagination-active": "bg-blue-500 text-white",
        "pagination-inactive":
          "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100",

        // Checkbox and Radio
        "checkbox-focus": "text-blue-500 focus:ring-blue-500",
        "radio-focus": "text-blue-500 focus:ring-blue-500",

        // MultiSelect
        "multiselect-focus": "ring-2 ring-blue-500 border-blue-500",
        "multiselect-search-focus": "focus:ring-1 focus:ring-blue-500",
        "multiselect-selected-bg": "bg-blue-100",
        "multiselect-selected-text": "text-blue-800",
        "multiselect-selected-chip": "bg-blue-100 text-blue-800",
        "multiselect-selected-chip-hover": "hover:text-blue-900",
        "multiselect-option-selected": "bg-blue-50 text-blue-700",
        "multiselect-option-check": "text-blue-600",

        // Card and container styles
        "card-border": "border-blue-200",
        "card-header-bg": "bg-blue-50",
        "card-header-text": "text-blue-900",

        // Report card header styles
        "bg-gradient-header": "bg-gradient-to-r from-blue-900 to-blue-950",
        "text-header": "text-white",
        "text-header-secondary": "text-white/80",
        "text-header-icon": "text-white",
        "border-color": "border-blue-200",

        // Interactive elements
        "link": "text-blue-600 hover:text-blue-800",
        "link-primary": "text-blue-600 hover:text-blue-800",
        "link-secondary": "text-blue-500 hover:text-blue-700",

        // Background gradients
        "bg-gradient-primary": "bg-gray-100",
        "bg-gradient-secondary": "bg-gradient-to-r from-blue-900 to-blue-950",

        // Hero section (colored for light mode)
        "hero-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "hero-text": "text-white",
        "hero-text-secondary": "text-white/80",
        "hero-icon": "text-white",
        "hero-icon-bg": "bg-white/20",
        "hero-button-primary": "bg-white text-blue-600 hover:bg-gray-100",
        "hero-button-secondary": "bg-white/20 text-white border-2 border-white hover:bg-white/30",
        "hero-status-success": "bg-green-100 text-green-800",
        "hero-status-warning": "bg-amber-100 text-amber-800",
        "hero-status-error": "bg-red-100 text-red-800",

        // Page header icon (colored bg with white icon for light mode)
        "page-header-icon-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "page-header-icon": "text-white",

        // InfoCard header (colored bg with white text/icon for light mode)
        "info-card-header-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "info-card-header-text": "text-white",
        "info-card-header-icon": "text-white/80",
        "info-card-content-bg": "bg-white",
        "info-card-content-text": "text-gray-900",
        "info-card-content-text-secondary": "text-gray-600",
        "info-card-content-icon": "text-gray-600",

        // Widget header (for dashboard widgets like Office News)
        "widget-header-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "widget-header-text": "text-white",
        "widget-header-icon-bg": "bg-white/20",
        "widget-header-icon": "text-white",
        "widget-header-subtitle": "text-white/80",
        "widget-header-button-ghost": "text-white hover:bg-white/20 border border-white hover:border-white/80",
        "widget-header-button-action": "bg-white text-gray-900 hover:bg-slate-50 shadow-lg",

        // Stat cards (dashboard counters)
        "stat-card-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "stat-card-icon-bg": "bg-white/20",
        "stat-card-icon": "text-white",
        "stat-card-text": "text-white",
        "stat-card-text-secondary": "text-white/90",
        "stat-card-button": "bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40",

        // Detail page header (colored bg with white text/icon for light mode)
        "detail-header-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "detail-header-text": "text-white",
        "detail-header-icon": "text-white/80",
        "detail-button-back": "border-2 border-white bg-transparent text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50",
        "detail-button-edit": "bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/50",

        // DetailCard header (colored bg with white text/icon for light mode)
        "detail-card-header-bg": "bg-gradient-to-r from-blue-900 to-blue-950",
        "detail-card-header-text": "text-white",
        "detail-card-header-icon": "text-white",

        // Badge and status
        "badge-default": "bg-gray-100 text-gray-800",
        "badge-primary": "bg-blue-100 text-blue-800",
        "badge-secondary": "bg-blue-50 text-blue-600",
        "badge-success": "bg-green-100 text-green-800",
        "badge-warning": "bg-amber-100 text-amber-800",
        "badge-error": "bg-red-100 text-red-800",
        "badge-info": "bg-cyan-100 text-cyan-800",

        // Loading and progress
        "loading-spinner": "border-blue-600",
        "progress-bar": "bg-blue-600",
        "border-primary": "border-blue-600",

        // Focus and interaction states
        "focus-ring": "focus:ring-blue-500",
        "focus-border": "focus:border-blue-500",

        // ViewButton specific
        "view-button":
          "text-gray-800 bg-blue-50 hover:bg-blue-200 border-2 border-gray-800",

        // SelectButton specific - dark blue theme colors
        "select-button":
          "bg-blue-900 text-white hover:bg-blue-800 border border-blue-900 hover:border-blue-800 focus:ring-4 focus:ring-blue-500/20 shadow-sm hover:shadow-md",

        // SearchFilter specific
        "search-clear-button":
          "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100",
        "search-refresh-button":
          "text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100",

        // ActionCard specific - dark slate color that complements theme
        "action-card": "bg-slate-700 text-white hover:bg-slate-600",
        "action-card-delete": "bg-red-600 text-white hover:bg-red-700",

        // Text and background theme classes
        "text-primary": "text-gray-900",
        "text-secondary": "text-gray-600",
        "text-muted": "text-gray-400",
        "text-danger": "text-red-600",
        "bg-card": "bg-white",
        "bg-primary": "bg-white",
        "bg-secondary": "bg-gray-100",
        "bg-disabled": "bg-gray-50",
        "border": "border-gray-200",

        // Decorative background elements
        "decorative-primary": "bg-blue-200",
        "decorative-secondary": "bg-purple-200",
        "decorative-accent": "bg-indigo-200",
        "decorative-blob-1": "bg-purple-200",
        "decorative-blob-2": "bg-yellow-200",
        "decorative-blob-3": "bg-pink-200",

        // Progress bars and steps
        "progress-bar-bg": "bg-gray-300",
        "progress-bar-fill": "bg-blue-500",
        "step-inactive": "bg-gray-300",
        "step-inactive-text": "text-gray-600",

        // Search filter
        "search-bg": "bg-gray-50",
        "border-secondary": "border-gray-200",

        // Success states
        "success-bg": "bg-green-50",
        "success-border": "border-green-200",
        "success-text": "text-green-800",

        // New keys for dark mode support
        "bg-page": "bg-gray-50",
        "bg-card-secondary": "bg-gray-100",
        "bg-hover": "bg-gray-100",
        "border-light": "border-gray-200",
        "border-medium": "border-gray-300",
        "shadow-card": "shadow-lg",
        "input-bg": "bg-white",
        "nav-bg": "bg-gray-900",
        "nav-text": "text-white",
        "sidebar-bg": "bg-gray-900",
        "sidebar-text": "text-gray-200",
        "sidebar-hover": "hover:bg-gray-700",
        "sidebar-text-muted": "text-gray-400",
      },
    },

    [UIX_THEMES.RED]: {
      name: "Red Theme",
      classes: {
        // Primary button styles
        "button-primary":
          "bg-red-900 text-white hover:bg-red-800 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-secondary":
          "border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-sm",
        "button-outline":
          "border-2 border-red-300 bg-white text-red-700 hover:bg-red-50 hover:border-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-red-500",
        "button-create":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-success":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-danger":
          "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-gradient":
          "border-transparent text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-red-500/20 transform hover:scale-105 font-bold",

        // Input and form styles
        "input-border":
          "border-gray-300 focus:border-red-500 focus:ring-red-500",
        "input-border-error":
          "border-red-500 focus:border-red-500 focus:ring-red-500",
        "input-focus-ring": "focus:ring-4 focus:ring-red-500/20",

        // Table styles
        "table-header-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "table-header-text": "text-white border-b border-red-900",
        "table-row-hover": "hover:bg-red-50",

        // Alert and notification styles
        "alert-info-bg": "bg-red-50",
        "alert-info-text": "text-red-800",
        "alert-info-border": "border-red-200",
        "alert-info-icon": "text-red-600",
        "alert-warning-bg": "bg-amber-50",
        "alert-warning-text": "text-amber-800",
        "alert-warning-title": "text-amber-900",
        "alert-warning-border": "border-amber-200",
        "alert-error-bg": "bg-red-50",
        "alert-error-text": "text-red-800",
        "alert-error-border": "border-red-200",
        "alert-success-bg": "bg-green-50",
        "alert-success-text": "text-green-800",
        "alert-success-border": "border-green-200",
        "alert-info-hover": "hover:bg-red-100",
        "alert-warning-hover": "hover:bg-amber-100",
        "alert-error-hover": "hover:bg-red-100",
        "alert-success-hover": "hover:bg-green-100",

        // Navigation and breadcrumb
        "breadcrumb-active": "text-red-600",
        "breadcrumb-inactive": "text-gray-500 hover:text-red-600",

        // Tabs
        "tab-active": "border-red-500 text-red-600",
        "tab-inactive":
          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",

        // Pagination
        "pagination-active": "bg-red-500 text-white",
        "pagination-inactive":
          "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100",

        // Checkbox and Radio
        "checkbox-focus": "text-red-500 focus:ring-red-500",
        "radio-focus": "text-red-500 focus:ring-red-500",

        // MultiSelect
        "multiselect-focus": "ring-2 ring-red-500 border-red-500",
        "multiselect-search-focus": "focus:ring-1 focus:ring-red-500",
        "multiselect-selected-bg": "bg-red-100",
        "multiselect-selected-text": "text-red-800",
        "multiselect-selected-chip": "bg-red-100 text-red-800",
        "multiselect-selected-chip-hover": "hover:text-red-900",
        "multiselect-option-selected": "bg-red-50 text-red-700",
        "multiselect-option-check": "text-red-600",

        // Card and container styles
        "card-border": "border-red-200",
        "card-header-bg": "bg-red-50",
        "card-header-text": "text-red-900",

        // Report card header styles
        "bg-gradient-header": "bg-gradient-to-r from-red-900 to-red-950",
        "text-header": "text-white",
        "text-header-secondary": "text-white/80",
        "text-header-icon": "text-white",
        "border-color": "border-red-200",

        // Interactive elements
        "link": "text-blue-600 hover:text-blue-800",
        "link-primary": "text-red-600 hover:text-red-800",
        "link-secondary": "text-red-500 hover:text-red-700",

        // Background gradients
        "bg-gradient-primary": "bg-gray-100",
        "bg-gradient-secondary": "bg-gradient-to-r from-red-900 to-red-950",

        // Hero section (colored for light mode)
        "hero-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "hero-text": "text-white",
        "hero-text-secondary": "text-white/80",
        "hero-icon": "text-white",
        "hero-icon-bg": "bg-white/20",
        "hero-button-primary": "bg-white text-red-600 hover:bg-gray-100",
        "hero-button-secondary": "bg-white/20 text-white border-2 border-white hover:bg-white/30",
        "hero-status-success": "bg-green-100 text-green-800",
        "hero-status-warning": "bg-amber-100 text-amber-800",
        "hero-status-error": "bg-red-100 text-red-800",

        // Page header icon (colored bg with white icon for light mode)
        "page-header-icon-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "page-header-icon": "text-white",

        // InfoCard header (colored bg with white text/icon for light mode)
        "info-card-header-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "info-card-header-text": "text-white",
        "info-card-header-icon": "text-white/80",
        "info-card-content-bg": "bg-white",
        "info-card-content-text": "text-gray-900",
        "info-card-content-text-secondary": "text-gray-600",
        "info-card-content-icon": "text-gray-600",

        // Widget header (for dashboard widgets like Office News)
        "widget-header-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "widget-header-text": "text-white",
        "widget-header-icon-bg": "bg-white/20",
        "widget-header-icon": "text-white",
        "widget-header-subtitle": "text-white/80",
        "widget-header-button-ghost": "text-white hover:bg-white/20 border border-white hover:border-white/80",
        "widget-header-button-action": "bg-white text-gray-900 hover:bg-slate-50 shadow-lg",

        // Stat cards (dashboard counters)
        "stat-card-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "stat-card-icon-bg": "bg-white/20",
        "stat-card-icon": "text-white",
        "stat-card-text": "text-white",
        "stat-card-text-secondary": "text-white/90",
        "stat-card-button": "bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40",

        // Detail page header (colored bg with white text/icon for light mode)
        "detail-header-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "detail-header-text": "text-white",
        "detail-header-icon": "text-white/80",
        "detail-button-back": "border-2 border-white bg-transparent text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50",
        "detail-button-edit": "bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/50",

        // DetailCard header (colored bg with white text/icon for light mode)
        "detail-card-header-bg": "bg-gradient-to-r from-red-900 to-red-950",
        "detail-card-header-text": "text-white",
        "detail-card-header-icon": "text-white",

        // Badge and status
        "badge-default": "bg-gray-100 text-gray-800",
        "badge-primary": "bg-red-100 text-red-800",
        "badge-secondary": "bg-red-50 text-red-600",
        "badge-success": "bg-green-100 text-green-800",
        "badge-warning": "bg-amber-100 text-amber-800",
        "badge-error": "bg-red-100 text-red-800",
        "badge-info": "bg-cyan-100 text-cyan-800",

        // Loading and progress
        "loading-spinner": "border-red-600",
        "progress-bar": "bg-red-600",
        "border-primary": "border-red-600",

        // Focus and interaction states
        "focus-ring": "focus:ring-red-500",
        "focus-border": "focus:border-red-500",

        // ViewButton specific
        "view-button":
          "text-gray-800 bg-red-50 hover:bg-red-200 border-2 border-gray-800",

        // SelectButton specific - dark red theme colors
        "select-button":
          "bg-red-900 text-white hover:bg-red-800 border border-red-900 hover:border-red-800 focus:ring-4 focus:ring-red-500/20 shadow-sm hover:shadow-md",

        // SearchFilter specific
        "search-clear-button":
          "text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100",
        "search-refresh-button":
          "text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100",

        // ActionCard specific - dark slate color that complements theme
        "action-card": "bg-slate-700 text-white hover:bg-slate-600",
        "action-card-delete": "bg-red-600 text-white hover:bg-red-700",

        // Text and background theme classes
        "text-primary": "text-gray-900",
        "text-secondary": "text-gray-600",
        "text-muted": "text-gray-400",
        "text-danger": "text-red-600",
        "bg-card": "bg-white",
        "bg-primary": "bg-white",
        "bg-secondary": "bg-gray-100",
        "bg-disabled": "bg-gray-50",
        "border": "border-gray-200",

        // Decorative background elements
        "decorative-primary": "bg-red-200",
        "decorative-secondary": "bg-orange-200",
        "decorative-accent": "bg-pink-200",
        "decorative-blob-1": "bg-orange-200",
        "decorative-blob-2": "bg-yellow-200",
        "decorative-blob-3": "bg-pink-200",

        // Progress bars and steps
        "progress-bar-bg": "bg-gray-300",
        "progress-bar-fill": "bg-red-500",
        "step-inactive": "bg-gray-300",
        "step-inactive-text": "text-gray-600",

        // Search filter
        "search-bg": "bg-gray-50",
        "border-secondary": "border-gray-200",

        // Success states
        "success-bg": "bg-green-50",
        "success-border": "border-green-200",
        "success-text": "text-green-800",

        // New keys for dark mode support
        "bg-page": "bg-gray-50",
        "bg-card-secondary": "bg-gray-100",
        "bg-hover": "bg-gray-100",
        "border-light": "border-gray-200",
        "border-medium": "border-gray-300",
        "shadow-card": "shadow-lg",
        "input-bg": "bg-white",
        "nav-bg": "bg-gray-900",
        "nav-text": "text-white",
        "sidebar-bg": "bg-gray-900",
        "sidebar-text": "text-gray-200",
        "sidebar-hover": "hover:bg-gray-700",
        "sidebar-text-muted": "text-gray-400",
      },
    },

    [UIX_THEMES.PURPLE]: {
      name: "Purple Theme",
      classes: {
        // Primary button styles
        "button-primary":
          "bg-purple-900 text-white hover:bg-purple-800 focus:ring-4 focus:ring-purple-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-secondary":
          "border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-sm",
        "button-outline":
          "border-2 border-purple-300 bg-white text-purple-700 hover:bg-purple-50 hover:border-purple-400 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500",
        "button-create":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-success":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-danger":
          "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-gradient":
          "border-transparent text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-purple-500/20 transform hover:scale-105 font-bold",

        // Input and form styles
        "input-border":
          "border-gray-300 focus:border-purple-500 focus:ring-purple-500",
        "input-border-error":
          "border-red-500 focus:border-red-500 focus:ring-red-500",
        "input-focus-ring": "focus:ring-4 focus:ring-purple-500/20",

        // Table styles
        "table-header-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "table-header-text": "text-white border-b border-purple-900",
        "table-row-hover": "hover:bg-purple-50",

        // Alert and notification styles
        "alert-info-bg": "bg-purple-50",
        "alert-info-text": "text-purple-800",
        "alert-info-border": "border-purple-200",
        "alert-info-icon": "text-purple-600",
        "alert-warning-bg": "bg-amber-50",
        "alert-warning-text": "text-amber-800",
        "alert-warning-title": "text-amber-900",
        "alert-warning-border": "border-amber-200",
        "alert-error-bg": "bg-red-50",
        "alert-error-text": "text-red-800",
        "alert-error-border": "border-red-200",
        "alert-success-bg": "bg-green-50",
        "alert-success-text": "text-green-800",
        "alert-success-border": "border-green-200",
        "alert-info-hover": "hover:bg-purple-100",
        "alert-warning-hover": "hover:bg-amber-100",
        "alert-error-hover": "hover:bg-red-100",
        "alert-success-hover": "hover:bg-green-100",

        // Navigation and breadcrumb
        "breadcrumb-active": "text-purple-600",
        "breadcrumb-inactive": "text-gray-500 hover:text-purple-600",

        // Tabs
        "tab-active": "border-purple-500 text-purple-600",
        "tab-inactive":
          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",

        // Pagination
        "pagination-active": "bg-purple-500 text-white",
        "pagination-inactive":
          "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100",

        // Checkbox and Radio
        "checkbox-focus": "text-purple-500 focus:ring-purple-500",
        "radio-focus": "text-purple-500 focus:ring-purple-500",

        // MultiSelect
        "multiselect-focus": "ring-2 ring-purple-500 border-purple-500",
        "multiselect-search-focus": "focus:ring-1 focus:ring-purple-500",
        "multiselect-selected-bg": "bg-purple-100",
        "multiselect-selected-text": "text-purple-800",
        "multiselect-selected-chip": "bg-purple-100 text-purple-800",
        "multiselect-selected-chip-hover": "hover:text-purple-900",
        "multiselect-option-selected": "bg-purple-50 text-purple-700",
        "multiselect-option-check": "text-purple-600",

        // Card and container styles
        "card-border": "border-purple-200",
        "card-header-bg": "bg-purple-50",
        "card-header-text": "text-purple-900",

        // Report card header styles
        "bg-gradient-header": "bg-gradient-to-r from-purple-900 to-purple-950",
        "text-header": "text-white",
        "text-header-secondary": "text-white/80",
        "text-header-icon": "text-white",
        "border-color": "border-purple-200",

        // Interactive elements
        "link": "text-blue-600 hover:text-blue-800",
        "link-primary": "text-purple-600 hover:text-purple-800",
        "link-secondary": "text-purple-500 hover:text-purple-700",

        // Background gradients
        "bg-gradient-primary": "bg-gray-100",
        "bg-gradient-secondary":
          "bg-gradient-to-r from-purple-900 to-purple-950",

        // Hero section (colored for light mode)
        "hero-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "hero-text": "text-white",
        "hero-text-secondary": "text-white/80",
        "hero-icon": "text-white",
        "hero-icon-bg": "bg-white/20",
        "hero-button-primary": "bg-white text-purple-600 hover:bg-gray-100",
        "hero-button-secondary": "bg-white/20 text-white border-2 border-white hover:bg-white/30",
        "hero-status-success": "bg-green-100 text-green-800",
        "hero-status-warning": "bg-amber-100 text-amber-800",
        "hero-status-error": "bg-red-100 text-red-800",

        // Page header icon (colored bg with white icon for light mode)
        "page-header-icon-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "page-header-icon": "text-white",

        // InfoCard header (colored bg with white text/icon for light mode)
        "info-card-header-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "info-card-header-text": "text-white",
        "info-card-header-icon": "text-white/80",
        "info-card-content-bg": "bg-white",
        "info-card-content-text": "text-gray-900",
        "info-card-content-text-secondary": "text-gray-600",
        "info-card-content-icon": "text-gray-600",

        // Widget header (for dashboard widgets like Office News)
        "widget-header-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "widget-header-text": "text-white",
        "widget-header-icon-bg": "bg-white/20",
        "widget-header-icon": "text-white",
        "widget-header-subtitle": "text-white/80",
        "widget-header-button-ghost": "text-white hover:bg-white/20 border border-white hover:border-white/80",
        "widget-header-button-action": "bg-white text-gray-900 hover:bg-slate-50 shadow-lg",

        // Stat cards (dashboard counters)
        "stat-card-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "stat-card-icon-bg": "bg-white/20",
        "stat-card-icon": "text-white",
        "stat-card-text": "text-white",
        "stat-card-text-secondary": "text-white/90",
        "stat-card-button": "bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40",

        // Detail page header (colored bg with white text/icon for light mode)
        "detail-header-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "detail-header-text": "text-white",
        "detail-header-icon": "text-white/80",
        "detail-button-back": "border-2 border-white bg-transparent text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50",
        "detail-button-edit": "bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/50",

        // DetailCard header (colored bg with white text/icon for light mode)
        "detail-card-header-bg": "bg-gradient-to-r from-purple-900 to-purple-950",
        "detail-card-header-text": "text-white",
        "detail-card-header-icon": "text-white",

        // Badge and status
        "badge-default": "bg-gray-100 text-gray-800",
        "badge-primary": "bg-purple-100 text-purple-800",
        "badge-secondary": "bg-purple-50 text-purple-600",
        "badge-success": "bg-green-100 text-green-800",
        "badge-warning": "bg-amber-100 text-amber-800",
        "badge-error": "bg-red-100 text-red-800",
        "badge-info": "bg-cyan-100 text-cyan-800",

        // Loading and progress
        "loading-spinner": "border-purple-600",
        "progress-bar": "bg-purple-600",
        "border-primary": "border-purple-600",

        // Focus and interaction states
        "focus-ring": "focus:ring-purple-500",
        "focus-border": "focus:border-purple-500",

        // ViewButton specific
        "view-button":
          "text-gray-800 bg-purple-50 hover:bg-purple-200 border-2 border-gray-800",

        // SelectButton specific - dark purple theme colors
        "select-button":
          "bg-purple-900 text-white hover:bg-purple-800 border border-purple-900 hover:border-purple-800 focus:ring-4 focus:ring-purple-500/20 shadow-sm hover:shadow-md",

        // SearchFilter specific
        "search-clear-button":
          "text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100",
        "search-refresh-button":
          "text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100",

        // ActionCard specific - dark slate color that complements theme
        "action-card": "bg-slate-700 text-white hover:bg-slate-600",
        "action-card-delete": "bg-red-600 text-white hover:bg-red-700",

        // Text and background theme classes
        "text-primary": "text-gray-900",
        "text-secondary": "text-gray-600",
        "text-muted": "text-gray-400",
        "text-danger": "text-red-600",
        "bg-card": "bg-white",
        "bg-primary": "bg-white",
        "bg-secondary": "bg-gray-100",
        "bg-disabled": "bg-gray-50",
        "border": "border-gray-200",

        // Decorative background elements
        "decorative-primary": "bg-purple-200",
        "decorative-secondary": "bg-pink-200",
        "decorative-accent": "bg-indigo-200",
        "decorative-blob-1": "bg-purple-200",
        "decorative-blob-2": "bg-pink-200",
        "decorative-blob-3": "bg-indigo-200",

        // Progress bars and steps
        "progress-bar-bg": "bg-gray-300",
        "progress-bar-fill": "bg-purple-500",
        "step-inactive": "bg-gray-300",
        "step-inactive-text": "text-gray-600",

        // Search filter
        "search-bg": "bg-gray-50",
        "border-secondary": "border-gray-200",

        // Success states
        "success-bg": "bg-green-50",
        "success-border": "border-green-200",
        "success-text": "text-green-800",

        // New keys for dark mode support
        "bg-page": "bg-gray-50",
        "bg-card-secondary": "bg-gray-100",
        "bg-hover": "bg-gray-100",
        "border-light": "border-gray-200",
        "border-medium": "border-gray-300",
        "shadow-card": "shadow-lg",
        "input-bg": "bg-white",
        "nav-bg": "bg-gray-900",
        "nav-text": "text-white",
        "sidebar-bg": "bg-gray-900",
        "sidebar-text": "text-gray-200",
        "sidebar-hover": "hover:bg-gray-700",
        "sidebar-text-muted": "text-gray-400",
      },
    },

    [UIX_THEMES.GREEN]: {
      name: "Green Theme",
      classes: {
        // Primary button styles - using forest green that's distinguishable from black
        "button-primary":
          "bg-green-900 text-white hover:bg-green-800 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-secondary":
          "border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-green-500 shadow-sm",
        "button-outline":
          "border-2 border-green-300 bg-white text-green-700 hover:bg-green-50 hover:border-green-400 focus:ring-2 focus:ring-offset-2 focus:ring-green-500",
        "button-create":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-success":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-danger":
          "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-gradient":
          "border-transparent text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-green-500/20 transform hover:scale-105 font-bold",

        // Input and form styles
        "input-border":
          "border-gray-300 focus:border-green-500 focus:ring-green-500",
        "input-border-error":
          "border-red-500 focus:border-red-500 focus:ring-red-500",
        "input-focus-ring": "focus:ring-4 focus:ring-green-500/20",

        // Table styles - dark forest green gradient
        "table-header-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "table-header-text": "text-white border-b border-green-900",
        "table-row-hover": "hover:bg-green-50",

        // Alert and notification styles
        "alert-info-bg": "bg-green-50",
        "alert-info-text": "text-green-800",
        "alert-info-border": "border-green-200",
        "alert-info-icon": "text-green-600",
        "alert-warning-bg": "bg-amber-50",
        "alert-warning-text": "text-amber-800",
        "alert-warning-title": "text-amber-900",
        "alert-warning-border": "border-amber-200",
        "alert-error-bg": "bg-red-50",
        "alert-error-text": "text-red-800",
        "alert-error-border": "border-red-200",
        "alert-success-bg": "bg-green-50",
        "alert-success-text": "text-green-800",
        "alert-success-border": "border-green-200",
        "alert-info-hover": "hover:bg-green-100",
        "alert-warning-hover": "hover:bg-amber-100",
        "alert-error-hover": "hover:bg-red-100",
        "alert-success-hover": "hover:bg-green-100",

        // Navigation and breadcrumb
        "breadcrumb-active": "text-green-600",
        "breadcrumb-inactive": "text-gray-500 hover:text-green-600",

        // Tabs
        "tab-active": "border-green-500 text-green-600",
        "tab-inactive":
          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",

        // Pagination
        "pagination-active": "bg-green-500 text-white",
        "pagination-inactive":
          "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100",

        // Checkbox and Radio
        "checkbox-focus": "text-green-500 focus:ring-green-500",
        "radio-focus": "text-green-500 focus:ring-green-500",

        // MultiSelect
        "multiselect-focus": "ring-2 ring-green-500 border-green-500",
        "multiselect-search-focus": "focus:ring-1 focus:ring-green-500",
        "multiselect-selected-bg": "bg-green-100",
        "multiselect-selected-text": "text-green-800",
        "multiselect-selected-chip": "bg-green-100 text-green-800",
        "multiselect-selected-chip-hover": "hover:text-green-900",
        "multiselect-option-selected": "bg-green-50 text-green-700",
        "multiselect-option-check": "text-green-600",

        // Card and container styles
        "card-border": "border-green-200",
        "card-header-bg": "bg-green-50",
        "card-header-text": "text-green-900",

        // Report card header styles
        "bg-gradient-header": "bg-gradient-to-r from-green-900 to-green-950",
        "text-header": "text-white",
        "text-header-secondary": "text-white/80",
        "text-header-icon": "text-white",
        "border-color": "border-green-200",

        // Interactive elements
        "link": "text-blue-600 hover:text-blue-800",
        "link-primary": "text-green-600 hover:text-green-800",
        "link-secondary": "text-green-500 hover:text-green-700",

        // Background gradients
        "bg-gradient-primary": "bg-gray-100",
        "bg-gradient-secondary": "bg-gradient-to-r from-green-900 to-green-950",

        // Hero section (colored for light mode)
        "hero-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "hero-text": "text-white",
        "hero-text-secondary": "text-white/80",
        "hero-icon": "text-white",
        "hero-icon-bg": "bg-white/20",
        "hero-button-primary": "bg-white text-green-600 hover:bg-gray-100",
        "hero-button-secondary": "bg-white/20 text-white border-2 border-white hover:bg-white/30",
        "hero-status-success": "bg-green-100 text-green-800",
        "hero-status-warning": "bg-amber-100 text-amber-800",
        "hero-status-error": "bg-red-100 text-red-800",

        // Page header icon (colored bg with white icon for light mode)
        "page-header-icon-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "page-header-icon": "text-white",

        // InfoCard header (colored bg with white text/icon for light mode)
        "info-card-header-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "info-card-header-text": "text-white",
        "info-card-header-icon": "text-white/80",
        "info-card-content-bg": "bg-white",
        "info-card-content-text": "text-gray-900",
        "info-card-content-text-secondary": "text-gray-600",
        "info-card-content-icon": "text-gray-600",

        // Widget header (for dashboard widgets like Office News)
        "widget-header-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "widget-header-text": "text-white",
        "widget-header-icon-bg": "bg-white/20",
        "widget-header-icon": "text-white",
        "widget-header-subtitle": "text-white/80",
        "widget-header-button-ghost": "text-white hover:bg-white/20 border border-white hover:border-white/80",
        "widget-header-button-action": "bg-white text-gray-900 hover:bg-slate-50 shadow-lg",

        // Stat cards (dashboard counters)
        "stat-card-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "stat-card-icon-bg": "bg-white/20",
        "stat-card-icon": "text-white",
        "stat-card-text": "text-white",
        "stat-card-text-secondary": "text-white/90",
        "stat-card-button": "bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40",

        // Detail page header (colored bg with white text/icon for light mode)
        "detail-header-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "detail-header-text": "text-white",
        "detail-header-icon": "text-white/80",
        "detail-button-back": "border-2 border-white bg-transparent text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50",
        "detail-button-edit": "bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/50",

        // DetailCard header (colored bg with white text/icon for light mode)
        "detail-card-header-bg": "bg-gradient-to-r from-green-900 to-green-950",
        "detail-card-header-text": "text-white",
        "detail-card-header-icon": "text-white",

        // Badge and status
        "badge-default": "bg-gray-100 text-gray-800",
        "badge-primary": "bg-green-100 text-green-800",
        "badge-secondary": "bg-green-50 text-green-600",
        "badge-success": "bg-green-100 text-green-800",
        "badge-warning": "bg-amber-100 text-amber-800",
        "badge-error": "bg-red-100 text-red-800",
        "badge-info": "bg-cyan-100 text-cyan-800",

        // Loading and progress
        "loading-spinner": "border-green-600",
        "progress-bar": "bg-green-600",
        "border-primary": "border-green-600",

        // Focus and interaction states
        "focus-ring": "focus:ring-green-500",
        "focus-border": "focus:border-green-500",

        // ViewButton specific
        "view-button":
          "text-gray-800 bg-green-50 hover:bg-green-200 border-2 border-gray-800",

        // SelectButton specific - dark forest green theme colors
        "select-button":
          "bg-green-900 text-white hover:bg-green-800 border border-green-900 hover:border-green-800 focus:ring-4 focus:ring-green-500/20 shadow-sm hover:shadow-md",

        // SearchFilter specific
        "search-clear-button":
          "text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100",
        "search-refresh-button":
          "text-green-600 hover:text-green-800 bg-green-50 hover:bg-green-100",

        // ActionCard specific - dark slate color that complements theme
        "action-card": "bg-slate-700 text-white hover:bg-slate-600",
        "action-card-delete": "bg-red-600 text-white hover:bg-red-700",

        // Text and background theme classes
        "text-primary": "text-gray-900",
        "text-secondary": "text-gray-600",
        "text-muted": "text-gray-400",
        "text-danger": "text-red-600",
        "bg-card": "bg-white",
        "bg-primary": "bg-white",
        "bg-secondary": "bg-gray-100",
        "bg-disabled": "bg-gray-50",
        "border": "border-gray-200",

        // Decorative background elements
        "decorative-primary": "bg-green-200",
        "decorative-secondary": "bg-emerald-200",
        "decorative-accent": "bg-teal-200",
        "decorative-blob-1": "bg-emerald-200",
        "decorative-blob-2": "bg-teal-200",
        "decorative-blob-3": "bg-lime-200",

        // Progress bars and steps
        "progress-bar-bg": "bg-gray-300",
        "progress-bar-fill": "bg-green-500",
        "step-inactive": "bg-gray-300",
        "step-inactive-text": "text-gray-600",

        // Search filter
        "search-bg": "bg-gray-50",
        "border-secondary": "border-gray-200",

        // Success states
        "success-bg": "bg-green-50",
        "success-border": "border-green-200",
        "success-text": "text-green-800",

        // New keys for dark mode support
        "bg-page": "bg-gray-50",
        "bg-card-secondary": "bg-gray-100",
        "bg-hover": "bg-gray-100",
        "border-light": "border-gray-200",
        "border-medium": "border-gray-300",
        "shadow-card": "shadow-lg",
        "input-bg": "bg-white",
        "nav-bg": "bg-gray-900",
        "nav-text": "text-white",
        "sidebar-bg": "bg-gray-900",
        "sidebar-text": "text-gray-200",
        "sidebar-hover": "hover:bg-gray-700",
        "sidebar-text-muted": "text-gray-400",
      },
    },

    [UIX_THEMES.CHARCOAL]: {
      name: "Charcoal Theme",
      classes: {
        // Primary button styles - using sophisticated charcoal tones
        "button-primary":
          "bg-slate-900 text-white hover:bg-slate-800 focus:ring-4 focus:ring-slate-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-secondary":
          "border border-gray-400 bg-white text-gray-700 hover:bg-gray-50 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm",
        "button-outline":
          "border-2 border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500",
        "button-create":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-success":
          "bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-danger":
          "bg-red-600 text-white hover:bg-red-700 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-gradient":
          "border-transparent text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-slate-500/20 transform hover:scale-105 font-bold",

        // Input and form styles
        "input-border":
          "border-gray-300 focus:border-slate-500 focus:ring-slate-500",
        "input-border-error":
          "border-red-500 focus:border-red-500 focus:ring-red-500",
        "input-focus-ring": "focus:ring-4 focus:ring-slate-500/20",

        // Table styles
        "table-header-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "table-header-text": "text-white border-b border-slate-900",
        "table-row-hover": "hover:bg-slate-50",

        // Alert and notification styles
        "alert-info-bg": "bg-slate-50",
        "alert-info-text": "text-slate-800",
        "alert-info-border": "border-slate-200",
        "alert-info-icon": "text-slate-600",
        "alert-warning-bg": "bg-amber-50",
        "alert-warning-text": "text-amber-800",
        "alert-warning-title": "text-amber-900",
        "alert-warning-border": "border-amber-200",
        "alert-error-bg": "bg-red-50",
        "alert-error-text": "text-red-800",
        "alert-error-border": "border-red-200",
        "alert-success-bg": "bg-green-50",
        "alert-success-text": "text-green-800",
        "alert-success-border": "border-green-200",
        "alert-info-hover": "hover:bg-slate-100",
        "alert-warning-hover": "hover:bg-amber-100",
        "alert-error-hover": "hover:bg-red-100",
        "alert-success-hover": "hover:bg-green-100",

        // Navigation and breadcrumb
        "breadcrumb-active": "text-slate-600",
        "breadcrumb-inactive": "text-gray-500 hover:text-slate-600",

        // Tabs
        "tab-active": "border-slate-500 text-slate-600",
        "tab-inactive":
          "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",

        // Pagination
        "pagination-active": "bg-slate-500 text-white",
        "pagination-inactive":
          "text-gray-500 bg-white border border-gray-300 hover:bg-gray-100",

        // Checkbox and Radio
        "checkbox-focus": "text-slate-500 focus:ring-slate-500",
        "radio-focus": "text-slate-500 focus:ring-slate-500",

        // MultiSelect
        "multiselect-focus": "ring-2 ring-slate-500 border-slate-500",
        "multiselect-search-focus": "focus:ring-1 focus:ring-slate-500",
        "multiselect-selected-bg": "bg-slate-100",
        "multiselect-selected-text": "text-slate-800",
        "multiselect-selected-chip": "bg-slate-100 text-slate-800",
        "multiselect-selected-chip-hover": "hover:text-slate-900",
        "multiselect-option-selected": "bg-slate-50 text-slate-700",
        "multiselect-option-check": "text-slate-600",

        // Card and container styles
        "card-border": "border-slate-200",
        "card-header-bg": "bg-slate-50",
        "card-header-text": "text-slate-900",

        // Report card header styles
        "bg-gradient-header": "bg-gradient-to-r from-slate-900 to-slate-950",
        "text-header": "text-white",
        "text-header-secondary": "text-white/80",
        "text-header-icon": "text-white",
        "border-color": "border-slate-200",

        // Interactive elements
        "link": "text-blue-600 hover:text-blue-800",
        "link-primary": "text-slate-600 hover:text-slate-800",
        "link-secondary": "text-slate-500 hover:text-slate-700",

        // Background gradients
        "bg-gradient-primary": "bg-gray-100",
        "bg-gradient-secondary": "bg-gradient-to-r from-slate-900 to-slate-950",

        // Hero section (colored for light mode)
        "hero-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "hero-text": "text-white",
        "hero-text-secondary": "text-white/80",
        "hero-icon": "text-white",
        "hero-icon-bg": "bg-white/20",
        "hero-button-primary": "bg-white text-slate-600 hover:bg-gray-100",
        "hero-button-secondary": "bg-white/20 text-white border-2 border-white hover:bg-white/30",
        "hero-status-success": "bg-green-100 text-green-800",
        "hero-status-warning": "bg-amber-100 text-amber-800",
        "hero-status-error": "bg-red-100 text-red-800",

        // Page header icon (colored bg with white icon for light mode)
        "page-header-icon-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "page-header-icon": "text-white",

        // InfoCard header (colored bg with white text/icon for light mode)
        "info-card-header-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "info-card-header-text": "text-white",
        "info-card-header-icon": "text-white/80",
        "info-card-content-bg": "bg-white",
        "info-card-content-text": "text-gray-900",
        "info-card-content-text-secondary": "text-gray-600",
        "info-card-content-icon": "text-gray-600",

        // Widget header (for dashboard widgets like Office News)
        "widget-header-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "widget-header-text": "text-white",
        "widget-header-icon-bg": "bg-white/20",
        "widget-header-icon": "text-white",
        "widget-header-subtitle": "text-white/80",
        "widget-header-button-ghost": "text-white hover:bg-white/20 border border-white hover:border-white/80",
        "widget-header-button-action": "bg-white text-gray-900 hover:bg-slate-50 shadow-lg",

        // Stat cards (dashboard counters)
        "stat-card-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "stat-card-icon-bg": "bg-white/20",
        "stat-card-icon": "text-white",
        "stat-card-text": "text-white",
        "stat-card-text-secondary": "text-white/90",
        "stat-card-button": "bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/40",

        // Detail page header (colored bg with white text/icon for light mode)
        "detail-header-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "detail-header-text": "text-white",
        "detail-header-icon": "text-white/80",
        "detail-button-back": "border-2 border-white bg-transparent text-white hover:bg-white/10 focus:ring-2 focus:ring-white/50",
        "detail-button-edit": "bg-white/20 text-white hover:bg-white/30 border border-white/30 hover:border-white/50",

        // DetailCard header (colored bg with white text/icon for light mode)
        "detail-card-header-bg": "bg-gradient-to-r from-slate-900 to-slate-950",
        "detail-card-header-text": "text-white",
        "detail-card-header-icon": "text-white",

        // Badge and status
        "badge-default": "bg-gray-100 text-gray-800",
        "badge-primary": "bg-slate-100 text-slate-800",
        "badge-secondary": "bg-slate-50 text-slate-600",
        "badge-success": "bg-green-100 text-green-800",
        "badge-warning": "bg-amber-100 text-amber-800",
        "badge-error": "bg-red-100 text-red-800",
        "badge-info": "bg-cyan-100 text-cyan-800",

        // Loading and progress
        "loading-spinner": "border-slate-600",
        "progress-bar": "bg-slate-600",
        "border-primary": "border-slate-600",

        // Focus and interaction states
        "focus-ring": "focus:ring-slate-500",
        "focus-border": "focus:border-slate-500",

        // ViewButton specific
        "view-button":
          "text-gray-800 bg-slate-50 hover:bg-slate-200 border-2 border-gray-800",

        // SelectButton specific - charcoal theme colors
        "select-button":
          "bg-slate-900 text-white hover:bg-slate-800 border border-slate-900 hover:border-slate-800 focus:ring-4 focus:ring-slate-500/20 shadow-sm hover:shadow-md",

        // SearchFilter specific
        "search-clear-button":
          "text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100",
        "search-refresh-button":
          "text-slate-600 hover:text-slate-800 bg-slate-50 hover:bg-slate-100",

        // ActionCard specific - charcoal color that complements theme
        "action-card": "bg-slate-700 text-white hover:bg-slate-600",
        "action-card-delete": "bg-red-600 text-white hover:bg-red-700",

        // Text and background theme classes
        "text-primary": "text-gray-900",
        "text-secondary": "text-gray-600",
        "text-muted": "text-gray-400",
        "text-danger": "text-red-600",
        "bg-card": "bg-white",
        "bg-primary": "bg-white",
        "bg-secondary": "bg-gray-100",
        "bg-disabled": "bg-gray-50",
        "border": "border-gray-200",

        // Decorative background elements
        "decorative-primary": "bg-slate-200",
        "decorative-secondary": "bg-gray-200",
        "decorative-accent": "bg-zinc-200",
        "decorative-blob-1": "bg-slate-200",
        "decorative-blob-2": "bg-gray-200",
        "decorative-blob-3": "bg-zinc-200",

        // Progress bars and steps
        "progress-bar-bg": "bg-gray-300",
        "progress-bar-fill": "bg-slate-500",
        "step-inactive": "bg-gray-300",
        "step-inactive-text": "text-gray-600",

        // Search filter
        "search-bg": "bg-gray-50",
        "border-secondary": "border-gray-200",

        // Success states
        "success-bg": "bg-green-50",
        "success-border": "border-green-200",
        "success-text": "text-green-800",

        // New keys for dark mode support
        "bg-page": "bg-gray-50",
        "bg-card-secondary": "bg-gray-100",
        "bg-hover": "bg-gray-100",
        "border-light": "border-gray-200",
        "border-medium": "border-gray-300",
        "shadow-card": "shadow-lg",
        "input-bg": "bg-white",
        "nav-bg": "bg-gray-900",
        "nav-text": "text-white",
        "sidebar-bg": "bg-gray-900",
        "sidebar-text": "text-gray-200",
        "sidebar-hover": "hover:bg-gray-700",
        "sidebar-text-muted": "text-gray-400",
      },
    },

    [UIX_THEMES.DARK]: {
      name: "Dark Theme",
      classes: {
        // Primary button styles - use blue accent for visibility on dark
        "button-primary":
          "bg-blue-600 text-white hover:bg-blue-500 focus:ring-4 focus:ring-blue-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-secondary":
          "border border-white bg-gray-800 text-gray-200 hover:bg-gray-700 hover:shadow-md focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm",
        "button-outline":
          "border-2 border-white bg-transparent text-gray-200 hover:bg-gray-800 hover:border-gray-300 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        "button-create":
          "bg-green-600 text-white hover:bg-green-500 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-success":
          "bg-green-600 text-white hover:bg-green-500 focus:ring-4 focus:ring-green-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-danger":
          "bg-red-600 text-white hover:bg-red-500 focus:ring-4 focus:ring-red-500/20 border border-transparent shadow-sm hover:shadow-md",
        "button-gradient":
          "border-transparent text-white shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-500/20 transform hover:scale-105 font-bold",
        "button-ghost":
          "bg-transparent text-gray-300 hover:bg-gray-800 focus:ring-2 focus:ring-blue-500 border border-transparent",
        "button-disabled":
          "bg-gray-700 text-gray-400 cursor-not-allowed focus:ring-4 focus:ring-gray-500/20 border border-transparent",

        // Input and form styles
        "input-border":
          "border-white focus:border-blue-500 focus:ring-blue-500 bg-gray-800 text-gray-100",
        "input-border-error":
          "border-red-500 focus:border-red-500 focus:ring-red-500",
        "input-focus-ring": "focus:ring-4 focus:ring-blue-500/20",

        // Table styles - lighter header for contrast against dark page background
        // Using slate-600/700 maintains WCAG AAA (7:1+) contrast with white text
        "table-header-bg": "bg-gradient-to-r from-slate-600 to-slate-700",
        "table-header-text": "text-white border-b border-slate-500",
        "table-row-hover": "hover:bg-gray-800",

        // Alert and notification styles - use translucent backgrounds
        "alert-info-bg": "bg-blue-900/40",
        "alert-info-text": "text-blue-200",
        "alert-info-border": "border-blue-700",
        "alert-info-icon": "text-blue-300",
        "alert-warning-bg": "bg-amber-900/40",
        "alert-warning-text": "text-amber-200",
        "alert-warning-title": "text-white",
        "alert-warning-border": "border-amber-700",
        "alert-error-bg": "bg-red-900/40",
        "alert-error-text": "text-red-200",
        "alert-error-border": "border-red-700",
        "alert-success-bg": "bg-green-900/40",
        "alert-success-text": "text-green-200",
        "alert-success-border": "border-green-700",
        "alert-info-hover": "hover:bg-blue-900/60",
        "alert-warning-hover": "hover:bg-amber-900/60",
        "alert-error-hover": "hover:bg-red-900/60",
        "alert-success-hover": "hover:bg-green-900/60",

        // Navigation and breadcrumb
        "breadcrumb-active": "text-blue-300",
        "breadcrumb-inactive": "text-white hover:text-blue-300",

        // Tabs
        "tab-active": "border-blue-500 text-blue-300",
        "tab-inactive":
          "border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600",

        // Pagination
        "pagination-active": "bg-blue-600 text-white",
        "pagination-inactive":
          "text-gray-400 bg-gray-800 border border-gray-700 hover:bg-gray-700",

        // Checkbox and Radio
        "checkbox-focus": "text-blue-500 focus:ring-blue-500",
        "radio-focus": "text-blue-500 focus:ring-blue-500",

        // MultiSelect
        "multiselect-focus": "ring-2 ring-blue-500 border-blue-500",
        "multiselect-search-focus": "focus:ring-1 focus:ring-blue-500",
        "multiselect-selected-bg": "bg-gray-700",
        "multiselect-selected-text": "text-gray-200",
        "multiselect-selected-chip": "bg-gray-700 text-gray-200",
        "multiselect-selected-chip-hover": "hover:text-gray-100",
        "multiselect-option-selected": "bg-gray-700 text-gray-200",
        "multiselect-option-check": "text-blue-300",

        // Card and container styles
        "card-border": "!border-gray-500",
        "card-header-bg": "!bg-gray-800",
        "card-header-text": "!text-gray-100",

        // Report card header styles (white bg with dark text/icons for dark mode)
        "bg-gradient-header": "!bg-white",
        "text-header": "!text-gray-900",
        "text-header-secondary": "!text-gray-600",
        "text-header-icon": "!text-gray-800",
        "border-color": "border-gray-600",

        // Interactive elements
        "link": "text-blue-300 hover:text-blue-200",
        "link-primary": "text-blue-300 hover:text-blue-200",
        "link-secondary": "text-gray-400 hover:text-gray-300",

        // Background gradients
        "bg-gradient-primary": "bg-gray-900",
        "bg-gradient-secondary": "bg-gradient-to-r from-blue-900 to-blue-950",

        // Hero section (dark bg with light text for dark mode)
        "hero-bg": "!bg-gray-800",
        "hero-text": "!text-white",
        "hero-text-secondary": "!text-gray-300",
        "hero-icon": "!text-white",
        "hero-icon-bg": "!bg-gray-600/50",
        "hero-button-primary": "!bg-white !text-gray-800 hover:!bg-gray-100",
        "hero-button-secondary": "!bg-gray-600/30 !text-white !border-2 !border-gray-500 hover:!bg-gray-600/50",
        "hero-status-success": "!bg-green-900/50 !text-green-300",
        "hero-status-warning": "!bg-amber-900/50 !text-amber-300",
        "hero-status-error": "!bg-red-900/50 !text-red-300",

        // Page header icon (light bg with dark icon for dark mode)
        "page-header-icon-bg": "!bg-gray-300",
        "page-header-icon": "!text-gray-800",

        // InfoCard header (white bg with dark text/icon for dark mode)
        "info-card-header-bg": "!bg-white",
        "info-card-header-text": "!text-gray-900",
        "info-card-header-icon": "!text-gray-800",
        "info-card-content-bg": "!bg-gray-800",
        "info-card-content-text": "!text-gray-100",
        "info-card-content-text-secondary": "!text-gray-300",
        "info-card-content-icon": "!text-gray-300",

        // Widget header (white bg with dark text/icon for dark mode)
        "widget-header-bg": "!bg-white",
        "widget-header-text": "!text-gray-900",
        "widget-header-icon-bg": "!bg-gray-200",
        "widget-header-icon": "!text-gray-900",
        "widget-header-subtitle": "!text-gray-600",
        "widget-header-button-ghost": "!text-gray-700 hover:!bg-gray-100 !border !border-gray-300 hover:!border-gray-400",
        "widget-header-button-action": "!bg-gray-800 !text-white hover:!bg-gray-700 !shadow-lg",

        // Stat cards (white bg with dark text/icon for dark mode)
        "stat-card-bg": "!bg-white",
        "stat-card-icon-bg": "!bg-gray-200",
        "stat-card-icon": "!text-gray-900",
        "stat-card-text": "!text-gray-900",
        "stat-card-text-secondary": "!text-gray-700",
        "stat-card-button": "!bg-gray-200 hover:!bg-gray-300 !text-gray-900 !border !border-gray-900 hover:!border-gray-900",

        // Detail page header (white bg with dark text/icon for dark mode)
        "detail-header-bg": "!bg-white",
        "detail-header-text": "!text-gray-900",
        "detail-header-icon": "!text-gray-800",
        "detail-button-back": "!border-2 !border-gray-900 !bg-transparent !text-gray-900 hover:!bg-gray-100 focus:!ring-2 focus:!ring-gray-500/50",
        "detail-button-edit": "!bg-gray-200 !text-gray-900 hover:!bg-gray-300 !border !border-gray-300 hover:!border-gray-400",

        // DetailCard header (white bg with dark text/icon for dark mode)
        "detail-card-header-bg": "!bg-white",
        "detail-card-header-text": "!text-gray-900",
        "detail-card-header-icon": "!text-gray-800",

        // Form card header (dark bg with white text/icon for dark mode)
        "form-card-header-bg": "bg-gray-700",
        "form-card-header-text": "text-white",
        "form-card-header-icon": "text-white",
        "form-card-header-subtitle": "text-gray-300",

        // Badge and status
        "badge-default": "bg-gray-700 text-gray-200",
        "badge-primary": "bg-blue-900/50 text-blue-200",
        "badge-secondary": "bg-gray-700 text-gray-300",
        "badge-success": "bg-green-900/50 text-green-200",
        "badge-warning": "bg-amber-900/50 text-amber-200",
        "badge-error": "bg-red-900/50 text-red-200",
        "badge-info": "bg-cyan-900/50 text-cyan-200",

        // Loading and progress
        "loading-spinner": "border-blue-500",
        "progress-bar": "bg-blue-600",
        "border-primary": "border-blue-600",

        // Focus and interaction states
        "focus-ring": "focus:ring-blue-500",
        "focus-border": "focus:border-blue-500",

        // ViewButton specific
        "view-button":
          "text-gray-200 bg-gray-800 hover:bg-gray-700 border-2 border-white",

        // SelectButton specific
        "select-button":
          "bg-blue-600 text-white hover:bg-blue-500 border border-blue-600 hover:border-blue-500 focus:ring-4 focus:ring-blue-500/20 shadow-sm hover:shadow-md",

        // SearchFilter specific
        "search-clear-button":
          "text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700",
        "search-refresh-button":
          "text-gray-400 hover:text-gray-200 bg-gray-800 hover:bg-gray-700",

        // ActionCard specific
        "action-card": "bg-gray-700 text-white hover:bg-gray-600",
        "action-card-delete": "bg-red-700 text-white hover:bg-red-600",

        // Text and background theme classes
        "text-primary": "!text-gray-100",
        "text-secondary": "!text-gray-300",
        "text-muted": "!text-gray-500",
        "text-danger": "!text-red-400",
        "bg-card": "!bg-gray-800",
        "bg-primary": "!bg-gray-800",
        "bg-secondary": "!bg-gray-700",
        "bg-disabled": "!bg-gray-700",
        "border": "!border-gray-700",

        // Decorative background elements
        "decorative-primary": "bg-gray-700",
        "decorative-secondary": "bg-gray-600",
        "decorative-accent": "bg-gray-700",
        "decorative-blob-1": "bg-gray-700",
        "decorative-blob-2": "bg-gray-600",
        "decorative-blob-3": "bg-gray-700",

        // Progress bars and steps
        "progress-bar-bg": "bg-gray-700",
        "progress-bar-fill": "bg-blue-500",
        "step-inactive": "bg-gray-700",
        "step-inactive-text": "text-gray-400",

        // Search filter
        "search-bg": "!bg-gray-800",
        "border-secondary": "!border-gray-700",

        // Success states
        "success-bg": "bg-green-900/40",
        "success-border": "border-green-700",
        "success-text": "text-green-200",

        // New keys for dark mode support
        "bg-page": "bg-gray-950",
        "bg-card-secondary": "bg-gray-900",
        "bg-hover": "bg-gray-700",
        "border-light": "border-gray-700",
        "border-medium": "border-gray-600",
        "shadow-card": "shadow-xl shadow-white/25",
        "input-bg": "bg-gray-800",
        "nav-bg": "bg-gray-950",
        "nav-text": "text-gray-100",
        "sidebar-bg": "bg-gray-950",
        "sidebar-text": "text-gray-200",
        "sidebar-hover": "hover:bg-gray-800",
        "sidebar-text-muted": "text-gray-500",

        // Error states for dark mode
        "error-bg": "bg-red-900/40",
        "error-border": "border-red-700",
        "text-error": "text-red-400",
        "text-success": "text-green-400",

        // Muted and overlay backgrounds
        "bg-muted": "bg-gray-800",
        "bg-overlay": "bg-gray-900",

        // Icon backgrounds for danger actions
        "icon-bg-danger": "bg-red-900/50",
        "icon-text-danger": "text-red-400",

        // Button danger variants
        "btn-danger-bg": "bg-red-600",
        "btn-danger-hover": "hover:bg-red-500",
        "btn-danger-border": "border-red-500",

        // Warning variants - Red (for delete/destructive actions)
        "warning-red-bg": "bg-red-900/40",
        "warning-red-border": "border-red-700",
        "warning-red-icon": "text-red-400",
        "warning-red-title": "text-red-200",
        "warning-red-desc": "text-red-300",
        "warning-red-list": "text-red-300",
        "warning-red-bullet": "bg-red-400",
        "warning-red-confirm": "text-red-200",

        // Warning variants - Yellow
        "warning-yellow-bg": "bg-yellow-900/40",
        "warning-yellow-border": "border-yellow-700",
        "warning-yellow-icon": "text-yellow-400",
        "warning-yellow-title": "text-yellow-200",
        "warning-yellow-desc": "text-yellow-300",
        "warning-yellow-list": "text-yellow-300",
        "warning-yellow-bullet": "bg-yellow-400",
        "warning-yellow-confirm": "text-yellow-200",

        // Warning variants - Amber
        "warning-amber-bg": "bg-amber-900/40",
        "warning-amber-border": "border-amber-700",
        "warning-amber-icon": "text-amber-400",
        "warning-amber-title": "text-amber-200",
        "warning-amber-desc": "text-amber-300",
        "warning-amber-list": "text-amber-300",
        "warning-amber-bullet": "bg-amber-400",
        "warning-amber-confirm": "text-amber-200",

        // Delete/Confirmation card specific - light backgrounds for dark mode
        "bg-danger-light": "bg-red-900/30",
        "bg-warning-light": "bg-amber-900/30",
        "bg-info-light": "bg-gray-700",
        "bg-success-light": "bg-green-900/30",

        // Delete/Confirmation card text colors
        "text-danger-dark": "text-red-300",
        "text-warning": "text-amber-300",
        "text-warning-dark": "text-amber-400",
        "text-info": "text-gray-100",
        "text-info-light": "text-gray-300",

        // Delete/Confirmation card borders
        "border-default": "!border-gray-600",
        "border-danger": "!border-red-600",
        "border-danger-light": "!border-red-700",
        "border-warning": "!border-amber-600",
        "border-info": "!border-gray-600",
        "border-success": "!border-green-600",

        // Delete/Confirmation card focus rings
        "focus-danger": "focus:ring-red-500/40",
        "focus-success": "focus:ring-green-500/40",
        "focus-default": "focus:ring-gray-500/40",

        // Delete/Confirmation card hover states
        "hover-bg-light": "hover:bg-gray-700",
        "hover-border-medium": "hover:border-gray-500",
        "hover-gradient-danger-medium": "hover:from-red-500 hover:to-red-600",

        // Delete/Confirmation card gradients
        "gradient-danger": "bg-gradient-to-r from-red-700 to-red-800",
        "gradient-danger-hover": "hover:from-red-600 hover:to-red-700",
        "gradient-danger-light": "bg-gradient-to-r from-red-600 to-red-700",
        "gradient-danger-header": "bg-gradient-to-r from-red-800 to-red-700",

        // Delete/Confirmation card link
        "link-danger": "text-red-400 hover:text-red-300",
      },
    },
  };

  return _themeConfigCache;
};

// Use a getter to access theme configs
export const UIX_THEME_CONFIGS = new Proxy(
  {},
  {
    get: function (target, prop) {
      const configs = getThemeConfigs();
      return configs[prop];
    },
    ownKeys: function () {
      return Object.values(UIX_THEMES);
    },
    has: function (target, prop) {
      return Object.values(UIX_THEMES).includes(prop);
    },
    getOwnPropertyDescriptor: function (target, prop) {
      if (Object.values(UIX_THEMES).includes(prop)) {
        return {
          enumerable: true,
          configurable: true,
          value: getThemeConfigs()[prop],
        };
      }
    },
  },
);

// Default theme
export const DEFAULT_UIX_THEME = UIX_THEMES.BLUE;

// Cache for getUIXThemeClasses
const themeClassesCache = new Map();
const CACHE_SIZE_LIMIT = 1000;

// Helper function to get theme classes with caching
export const getUIXThemeClasses = (themeName, classKey) => {
  // Normalize classKey: convert dots to hyphens for consistent lookup
  // This allows both "text.primary" and "text-primary" to work
  const normalizedKey = classKey.replace(/\./g, "-");
  const cacheKey = `${themeName}-${normalizedKey}`;

  // Return from cache if available
  if (themeClassesCache.has(cacheKey)) {
    return themeClassesCache.get(cacheKey);
  }

  const theme =
    UIX_THEME_CONFIGS[themeName] || UIX_THEME_CONFIGS[DEFAULT_UIX_THEME];
  const value = theme.classes[normalizedKey] || "";

  // Cache the result
  themeClassesCache.set(cacheKey, value);

  // Implement LRU cache eviction
  if (themeClassesCache.size > CACHE_SIZE_LIMIT) {
    const firstKey = themeClassesCache.keys().next().value;
    themeClassesCache.delete(firstKey);
  }

  return value;
};

// Helper function to check if theme exists
export const isValidUIXTheme = (themeName) => {
  return Object.values(UIX_THEMES).includes(themeName);
};

// Clear cache function for testing or memory management
export const clearThemeCache = () => {
  themeClassesCache.clear();
  _themeConfigCache = null;
};
