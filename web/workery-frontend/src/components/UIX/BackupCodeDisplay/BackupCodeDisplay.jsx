// File: src/components/UIX/BackupCodeDisplay/BackupCodeDisplay.jsx
// UIX Mobile Optimizations Applied
// Backup Code Display Component for 2FA
// Shows backup code with copy functionality and security warnings

import React, { useState, useRef, useEffect } from "react";
import {
  DocumentDuplicateIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import useMobileOptimizations from "../hooks/useMobileOptimizations.jsx";

/**
 * BackupCodeDisplay Component
 *
 * Specialized component for displaying 2FA backup codes with copy functionality
 * and security warnings. Optimized for mobile devices.
 *
 * Features:
 * - Large, readable backup code display
 * - One-click copy to clipboard
 * - Visual feedback on copy success
 * - Security warnings and best practices
 * - Mobile-optimized layout
 * - Theme-aware styling
 *
 * @param {string} code - The backup code to display (required)
 * @param {string} label - Label text (default: "Backup Code:")
 * @param {boolean} showWarnings - Whether to show security warnings (default: true)
 * @param {function} onCopy - Optional callback when code is copied
 * @param {string} className - Additional CSS classes
 *
 * @example
 * <BackupCodeDisplay
 *   code="ABC123XYZ789"
 *   label="Your 2FA Backup Code"
 *   showWarnings={true}
 *   onCopy={() => console.log('Code copied')}
 * />
 */
function BackupCodeDisplay({
  code,
  label = "Backup Code:",
  showWarnings = true,
  onCopy,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();
  const { isMobile } = useMobileOptimizations();
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  // Theme classes for consistent styling
  const themeClasses = {
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    bgMuted: getThemeClasses("bg-muted") || "bg-gray-100",
    textMuted: getThemeClasses("text-muted") || "text-gray-700",
    borderMuted: getThemeClasses("border-muted") || "border-gray-300",
    hoverBgMuted: getThemeClasses("hover-bg-muted") || "hover:bg-gray-200",
    // Success colors
    successBg: getThemeClasses("success-bg") || "bg-green-100",
    successText: getThemeClasses("success-text") || "text-green-700",
    successBorder: getThemeClasses("success-border") || "border-green-300",
    successBgLight: getThemeClasses("success-bg-light") || "bg-green-50",
    successBorderLight: getThemeClasses("success-border-light") || "border-green-200",
    successFocusRing: getThemeClasses("success-focus-ring") || "focus:ring-green-500 focus:border-green-500",
    // Warning colors
    warningBg: getThemeClasses("warning-bg") || "bg-amber-50",
    warningBorder: getThemeClasses("warning-border") || "border-amber-200",
    warningIcon: getThemeClasses("warning-icon") || "text-amber-600",
    warningTitle: getThemeClasses("warning-title") || "text-amber-900",
    warningText: getThemeClasses("warning-text") || "text-amber-800",
    warningBullet: getThemeClasses("warning-bullet") || "bg-amber-600",
  };

  // Handle copy to clipboard
  const handleCopyCode = async () => {
    if (!code) return;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      // Call optional callback
      if (onCopy) {
        onCopy();
      }

      // Clear any existing timeout
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      // Reset copied state after 3 seconds
      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 3000);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to copy backup code to clipboard", error);
      }
    }
  };

  if (!code) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Copy Button */}
      <div className="flex items-center justify-between">
        <label
          className={`text-lg font-semibold ${themeClasses.textPrimary}`}
        >
          {label}
        </label>
        <button
          onClick={handleCopyCode}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
            copied
              ? `${themeClasses.successBg} ${themeClasses.successText} border ${themeClasses.successBorder}`
              : `${themeClasses.bgMuted} ${themeClasses.textMuted} border ${themeClasses.borderMuted} ${themeClasses.hoverBgMuted}`
          } ${isMobile ? "min-h-[44px]" : ""}`}
          type="button"
        >
          {copied ? (
            <>
              <CheckCircleIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Copied!</span>
            </>
          ) : (
            <>
              <DocumentDuplicateIcon className="h-4 w-4" />
              <span className="text-sm font-medium">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Backup Code Display */}
      <div className="relative">
        <textarea
          readOnly
          value={code}
          className={`
            w-full h-24 sm:h-32 p-4 sm:p-6
            border-2 ${themeClasses.successBorder} rounded-xl
            ${themeClasses.successBgLight} font-mono text-base sm:text-lg font-bold
            text-center resize-none
            focus:outline-none focus:ring-2 ${themeClasses.successFocusRing}
            ${isMobile ? "text-xl" : ""}
          `}
          style={{
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isMobile ? "16px" : undefined, // Prevent iOS zoom
            WebkitAppearance: "none",
          }}
        />
        <div className={`text-xs sm:text-sm ${themeClasses.textSecondary} mt-3 text-center`}>
          Save this code in a secure location. You'll need it if you lose access
          to your 2FA device.
        </div>
      </div>

      {/* Security Warnings */}
      {showWarnings && (
        <div className={`${themeClasses.warningBg} border ${themeClasses.warningBorder} rounded-xl p-4 sm:p-6`}>
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className={`h-6 w-6 ${themeClasses.warningIcon} mt-0.5 flex-shrink-0`} />
            <div>
              <h3 className={`font-semibold ${themeClasses.warningTitle} mb-3`}>
                Important Security Notes
              </h3>
              <ul className={`space-y-2 text-sm ${themeClasses.warningText}`}>
                <li className="flex items-start space-x-2">
                  <span className={`w-1.5 h-1.5 ${themeClasses.warningBullet} rounded-full mt-2 flex-shrink-0`}></span>
                  <span>This backup code can only be used once</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`w-1.5 h-1.5 ${themeClasses.warningBullet} rounded-full mt-2 flex-shrink-0`}></span>
                  <span>
                    Store it in a secure password manager or safe location
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`w-1.5 h-1.5 ${themeClasses.warningBullet} rounded-full mt-2 flex-shrink-0`}></span>
                  <span>
                    Never share this code with anyone, including support staff
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className={`w-1.5 h-1.5 ${themeClasses.warningBullet} rounded-full mt-2 flex-shrink-0`}></span>
                  <span>
                    After using it, you'll need to set up 2FA again to get a new
                    backup code
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {copied && (
        <div className={`${themeClasses.successBgLight} border ${themeClasses.successBorderLight} rounded-lg p-3`}>
          <div className={`flex items-center space-x-2 ${themeClasses.successText}`}>
            <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">
              Backup code copied to clipboard! Make sure to save it securely.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackupCodeDisplay;
