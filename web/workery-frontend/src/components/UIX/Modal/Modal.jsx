// File: src/components/UIX/Modal/Modal.jsx
// UIX Mobile Optimizations Applied

import React, { useEffect, useCallback, useRef, useMemo, memo } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Track active modals globally to handle body overflow correctly
let activeModalsCount = 0;
let originalBodyOverflow = null;

/**
 * Modal Component - Performance Optimized
 * Accessible modal dialog with backdrop and keyboard support
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Memoized theme classes
 * - Memoized event handlers
 * - Theme-aware colors (no hardcoded values)
 */
const Modal = memo(function Modal({ isOpen, onClose, title, children, footer }) {
  const { getThemeClasses } = useUIXTheme();
  const modalIdRef = useRef(null);
  const previousIsOpenRef = useRef(false);

  // Memoize all theme classes
  const themeClasses = useMemo(
    () => ({
      backdrop: getThemeClasses("modal-backdrop") || "bg-black/50",
      cardBg: getThemeClasses("bg-card") || "bg-white",
      borderDefault: getThemeClasses("border-default") || "border-gray-200",
      headerBg: getThemeClasses("bg-secondary") || "bg-gray-50",
      textPrimary: getThemeClasses("text-primary") || "text-gray-900",
      textSecondary: getThemeClasses("text-secondary") || "text-gray-700",
      textMuted: getThemeClasses("text-muted") || "text-gray-400",
      textMutedHover: getThemeClasses("text-muted-hover") || "hover:text-gray-500",
      focusRing: getThemeClasses("focus-ring") || "focus:ring-2 focus:ring-indigo-500",
    }),
    [getThemeClasses],
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e) => {
      // Only close if clicking directly on backdrop, not its children
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose],
  );

  // Handle ESC key press
  const handleEscKey = useCallback(
    (e) => {
      // Check for ESC key (27 or 'Escape')
      if (e.key === "Escape" || e.keyCode === 27) {
        e.stopPropagation(); // Prevent event bubbling to other modals
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    // Track previous state to detect transitions
    const wasOpen = previousIsOpenRef.current;
    previousIsOpenRef.current = isOpen;

    if (isOpen && !wasOpen) {
      // Modal is opening
      modalIdRef.current = Date.now() + Math.random(); // Unique ID for this modal instance

      // Handle body overflow
      if (activeModalsCount === 0) {
        // First modal being opened - store original overflow
        originalBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
      }
      activeModalsCount++;

      // Add ESC key listener with capture phase to ensure it fires first
      document.addEventListener("keydown", handleEscKey, true);
    } else if (!isOpen && wasOpen) {
      // Modal is closing
      activeModalsCount = Math.max(0, activeModalsCount - 1);

      // Restore body overflow only when last modal closes
      if (activeModalsCount === 0 && originalBodyOverflow !== null) {
        document.body.style.overflow = originalBodyOverflow;
        originalBodyOverflow = null;
      }

      // Remove ESC key listener
      document.removeEventListener("keydown", handleEscKey, true);
    }

    // Cleanup function
    return () => {
      // Only cleanup if this modal is currently open
      if (isOpen) {
        activeModalsCount = Math.max(0, activeModalsCount - 1);

        // Restore body overflow if this was the last modal
        if (activeModalsCount === 0 && originalBodyOverflow !== null) {
          document.body.style.overflow = originalBodyOverflow;
          originalBodyOverflow = null;
        }

        // Remove event listener
        document.removeEventListener("keydown", handleEscKey, true);
      }
    };
  }, [isOpen, handleEscKey]);

  // Portal cleanup on unmount
  useEffect(() => {
    return () => {
      // Emergency cleanup if component unmounts while open
      if (previousIsOpenRef.current) {
        activeModalsCount = Math.max(0, activeModalsCount - 1);
        if (activeModalsCount === 0 && originalBodyOverflow !== null) {
          document.body.style.overflow = originalBodyOverflow;
          originalBodyOverflow = null;
        }
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
    >
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 ${themeClasses.backdrop} transition-opacity touch-manipulation`}
          onClick={handleBackdropClick}
          aria-hidden="true"
          style={{
            WebkitTapHighlightColor: 'transparent',
            touchAction: 'none',
          }}
        />

        {/* Modal Panel */}
        <div
          className={`relative transform overflow-hidden rounded-lg ${themeClasses.cardBg} shadow-xl transition-all w-full max-w-lg border ${themeClasses.borderDefault}`}
          role="document"
          style={{
            maxHeight: 'calc(100dvh - 2rem)',
            marginTop: 'env(safe-area-inset-top)',
            marginBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          {/* Header */}
          {title && (
            <div
              className={`px-6 py-4 border-b ${themeClasses.borderDefault} ${themeClasses.headerBg}`}
            >
              <div className="flex items-center justify-between">
                <h3
                  id="modal-title"
                  className={`text-lg font-semibold ${themeClasses.textPrimary}`}
                >
                  {title}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  className={`rounded-md ${themeClasses.cardBg} ${themeClasses.textMuted} ${themeClasses.textMutedHover} focus:outline-none ${themeClasses.focusRing} p-2 min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation`}
                  aria-label="Close modal"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          )}

          {/* Body */}
          <div
            className={`${themeClasses.cardBg} ${themeClasses.textSecondary} px-6 py-4 overflow-y-auto`}
            style={{
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              maxHeight: 'calc(70dvh - 120px)',
            }}
          >
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div
              className={`${themeClasses.headerBg} px-6 py-3 border-t ${themeClasses.borderDefault}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Set display name for React DevTools
Modal.displayName = "Modal";

// Reset function for development/debugging
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  window.__resetModalState = () => {
    activeModalsCount = 0;
    if (originalBodyOverflow !== null) {
      document.body.style.overflow = originalBodyOverflow;
      originalBodyOverflow = null;
    }
  };
}

export default Modal;
