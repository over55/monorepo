// File: src/components/UIX/Alert/Alert.jsx
// Alert Component - Performance Optimized
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Animation styles moved outside and injected once
const ANIMATION_STYLES = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

// Inject styles once when module loads
if (
  typeof document !== "undefined" &&
  !document.querySelector("#alert-styles")
) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "alert-styles";
  styleSheet.textContent = ANIMATION_STYLES;
  document.head.appendChild(styleSheet);
}

// Icon components map moved outside to prevent recreation
const ICON_COMPONENTS = {
  warning: ExclamationTriangleIcon,
  error: XCircleIcon,
  success: CheckCircleIcon,
  info: InformationCircleIcon,
};

/**
 * Alert Component - Performance Optimized
 * Displays contextual feedback messages for user actions
 *
 * @param {string} type - Type of alert: 'info', 'success', 'warning', 'error'
 * @param {React.ReactNode} children - Alert content
 * @param {string} message - Alternative to children, text message to display
 * @param {boolean} dismissible - Whether the alert can be dismissed
 * @param {function} onDismiss - Callback when alert is dismissed
 * @param {function} onClose - Alternative to onDismiss for backward compatibility
 * @param {string} className - Additional CSS classes
 * @param {boolean} enhanced - Use enhanced styling with border-left accent
 * @param {React.Component} icon - Custom icon component (optional)
 */
const Alert = memo(
  function Alert({
    type = "info",
    children,
    message,
    dismissible = false,
    onDismiss,
    onClose,
    className = "",
    enhanced = false,
    icon,
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoize all theme classes at once
    const themeClasses = useMemo(() => {
      const alertTypes = ["warning", "error", "success", "info"];
      const classes = {};

      alertTypes.forEach((alertType) => {
        classes[`${alertType}Bg`] = getThemeClasses(`alert-${alertType}-bg`);
        classes[`${alertType}Border`] = getThemeClasses(
          `alert-${alertType}-border`,
        );
        classes[`${alertType}Text`] = getThemeClasses(
          `alert-${alertType}-text`,
        );
        if (enhanced) {
          classes[`${alertType}Hover`] = getThemeClasses(
            `alert-${alertType}-hover`,
          );
        }
      });

      return classes;
    }, [getThemeClasses, enhanced]);

    // Memoize all styles at once
    const styles = useMemo(() => {
      // Base styles
      const base = enhanced
        ? "p-4 sm:p-5 rounded-xl shadow-sm animate-slideIn border-l-4"
        : "p-4 rounded-lg border animate-fade-in";

      // Alert type styles
      const typeStyles = {
        warning: enhanced
          ? `${themeClasses.warningBg} ${themeClasses.warningBorder} ${themeClasses.warningText}`
          : `${themeClasses.warningBg} ${themeClasses.warningText} ${themeClasses.warningBorder}`,
        error: enhanced
          ? `${themeClasses.errorBg} ${themeClasses.errorBorder} ${themeClasses.errorText}`
          : `${themeClasses.errorBg} ${themeClasses.errorText} ${themeClasses.errorBorder}`,
        success: enhanced
          ? `${themeClasses.successBg} ${themeClasses.successBorder} ${themeClasses.successText}`
          : `${themeClasses.successBg} ${themeClasses.successText} ${themeClasses.successBorder}`,
        info: enhanced
          ? `${themeClasses.infoBg} ${themeClasses.infoBorder} ${themeClasses.infoText} border-l-4`
          : `${themeClasses.infoBg} ${themeClasses.infoText} ${themeClasses.infoBorder}`,
      };

      const alertTypeStyle = typeStyles[type] || typeStyles.info;

      // Icon styles
      const icon = enhanced
        ? "h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0"
        : "h-5 w-5 flex-shrink-0";

      // Button styles with mobile-friendly touch targets (min 44px)
      let button;
      if (!enhanced) {
        button = "flex-shrink-0 ml-auto hover:opacity-70 transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation select-none";
      } else {
        const typeColorMap = {
          info: themeClasses.infoHover || "hover:bg-blue-100",
          warning: themeClasses.warningHover || "hover:bg-amber-100",
          error: themeClasses.errorHover || "hover:bg-red-100",
          success: themeClasses.successHover || "hover:bg-green-100",
        };

        button = `inline-flex transition-colors duration-200 p-2 rounded-lg min-w-[44px] min-h-[44px] items-center justify-center touch-manipulation select-none active:scale-95 ${typeColorMap[type] || typeColorMap.info}`;
      }

      // Container classes
      const marginClass = enhanced ? "mb-6 sm:mb-8" : "mb-5";
      const container =
        `${base} ${alertTypeStyle} ${className} ${marginClass}`.trim();

      // Content classes
      const content = enhanced
        ? "text-sm sm:text-base font-medium text-current"
        : "text-sm font-medium text-current";

      return {
        container,
        icon,
        button,
        content,
      };
    }, [type, enhanced, className, themeClasses]);

    // Determine content to display
    const content = children || message;

    // Determine if alert should be dismissible
    const isDismissible = dismissible || !!onClose || !!onDismiss;

    // Memoize dismiss handler
    const handleDismiss = useCallback(
      (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onClose) {
          onClose();
        } else if (onDismiss) {
          onDismiss();
        }
      },
      [onClose, onDismiss],
    );

    // Get the appropriate icon component
    const IconComponent = icon || ICON_COMPONENTS[type] || ICON_COMPONENTS.info;

    // Memoize dismiss button with mobile optimizations
    const DismissButton = useMemo(() => {
      if (!isDismissible) return null;

      return (
        <div className="ml-auto pl-3">
          <button
            onClick={handleDismiss}
            className={styles.button}
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Dismiss alert"
            type="button"
          >
            <XMarkIcon className={styles.icon} />
          </button>
        </div>
      );
    }, [isDismissible, handleDismiss, styles.button, styles.icon]);

    return (
      <div
        className={styles.container}
        role="alert"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <IconComponent className={styles.icon} />
          </div>
          <div className="ml-3 flex-1">
            <div className={styles.content}>{content}</div>
          </div>
          {DismissButton}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      prevProps.type === nextProps.type &&
      prevProps.children === nextProps.children &&
      prevProps.message === nextProps.message &&
      prevProps.dismissible === nextProps.dismissible &&
      prevProps.onDismiss === nextProps.onDismiss &&
      prevProps.onClose === nextProps.onClose &&
      prevProps.className === nextProps.className &&
      prevProps.enhanced === nextProps.enhanced &&
      prevProps.icon === nextProps.icon
    );
  },
);

// Set display name for debugging
Alert.displayName = "Alert";

// Export aliases for backward compatibility - also memoized
export const Notification = Alert;
export const Message = Alert;

export default Alert;
