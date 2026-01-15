// File: src/components/UIX/DeleteConfirmationCard/DeleteConfirmationCard.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, useCallback, memo } from "react";
import { Link } from "react-router";
import {
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Helper functions outside component
const formatDate = (dateString) => {
  return dateString ? new Date(dateString).toLocaleDateString() : "N/A";
};

const formatDateTime = (dateString) => {
  return dateString ? new Date(dateString).toLocaleString() : "Not available";
};

const getItemDisplayName = (item) => {
  return item?.name || item?.text || "item name";
};

const getItemStatus = (status) => {
  return status === 1 ? "Active" : "Inactive";
};

/**
 * DeleteConfirmationCard Component - Theme Aware
 * Confirmation card for permanent deletion actions
 *
 * Performance & Theme Optimizations:
 * - Component memoization with React.memo
 * - All colors from theme system (no hardcoded values)
 * - Memoized callbacks and values
 */
const DeleteConfirmationCard = memo(
  ({
    item,
    itemType,
    isDeleting,
    error,
    confirmText,
    onConfirmTextChange,
    onDelete,
    onCancel,
    onErrorClear,
    detailRoute,
    editRoute,
    impactWarnings = [],
    alternativeText,
    customFields = [],
    systemInfo = true,
    className = "",
    confirmationWord, // Optional: custom word to type for confirmation (defaults to item name)
    renderItemDetails, // Optional: custom render function for item details
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize theme classes
    const themeClasses = useMemo(
      () => ({
        // Background colors
        bgCard: getThemeClasses("bg-card") || "bg-white",
        bgPage: getThemeClasses("bg-page") || "bg-gray-50",
        bgDanger: getThemeClasses("bg-danger-light") || "bg-red-50",
        bgWarning: getThemeClasses("bg-warning-light") || "bg-amber-50",
        bgInfo: getThemeClasses("bg-info-light") || "bg-blue-50",
        bgSuccess: getThemeClasses("bg-success-light") || "bg-green-50",

        // Text colors
        textPrimary: getThemeClasses("text-primary") || "text-gray-900",
        textSecondary: getThemeClasses("text-secondary") || "text-gray-700",
        textMuted: getThemeClasses("text-muted") || "text-gray-500",
        textDanger: getThemeClasses("text-danger") || "text-red-800",
        textDangerDark: getThemeClasses("text-danger-dark") || "text-red-700",
        textWarning: getThemeClasses("text-warning") || "text-amber-800",
        textWarningDark: getThemeClasses("text-warning-dark") || "text-amber-700",
        textInfo: getThemeClasses("text-info") || "text-blue-900",
        textInfoLight: getThemeClasses("text-info-light") || "text-blue-600",
        textSuccess: getThemeClasses("text-success") || "text-green-800",

        // Border colors
        borderDefault: getThemeClasses("border-default") || "border-gray-200",
        borderLight: getThemeClasses("border-light") || "border-gray-100",
        borderDanger: getThemeClasses("border-danger") || "border-red-300",
        borderDangerLight: getThemeClasses("border-danger-light") || "border-red-200",
        borderWarning: getThemeClasses("border-warning") || "border-amber-200",
        borderInfo: getThemeClasses("border-info") || "border-blue-200",
        borderSuccess: getThemeClasses("border-success") || "border-green-400",

        // Focus/ring colors
        focusDanger: getThemeClasses("focus-danger") || "focus:ring-red-200",
        focusSuccess: getThemeClasses("focus-success") || "focus:ring-green-200",
        focusDefault: getThemeClasses("focus-default") || "focus:ring-gray-200",

        // Hover states
        hoverBgLight: getThemeClasses("hover-bg-light") || "hover:bg-gray-50",
        hoverBorderMedium: getThemeClasses("hover-border-medium") || "hover:border-gray-400",
        hoverGradientDangerMedium: getThemeClasses("hover-gradient-danger-medium") || "hover:from-red-600 hover:to-red-700",

        // Gradient
        gradientDanger: getThemeClasses("gradient-danger") || "bg-gradient-to-r from-red-700 to-red-800",
        gradientDangerHover: getThemeClasses("gradient-danger-hover") || "hover:from-red-800 hover:to-red-900",
        gradientDangerLight: getThemeClasses("gradient-danger-light") || "bg-gradient-to-r from-red-500 to-red-600",
        gradientHeader: getThemeClasses("gradient-danger-header") || "bg-gradient-to-r from-red-800 to-red-600",

        // Link colors
        linkDanger: getThemeClasses("link-danger") || "text-red-600 hover:text-red-800",
      }),
      [getThemeClasses],
    );

    // Memoized values
    const itemDisplayName = useMemo(
      () => (item ? getItemDisplayName(item) : ""),
      [item],
    );
    const itemStatus = useMemo(
      () => (item ? getItemStatus(item.status) : ""),
      [item],
    );
    const createdDate = useMemo(
      () => (item ? formatDate(item.createdAt) : ""),
      [item],
    );
    const createdDateTime = useMemo(
      () => (item ? formatDateTime(item.createdAt) : ""),
      [item],
    );
    const modifiedDateTime = useMemo(
      () => (item ? formatDateTime(item.modifiedAt) : ""),
      [item],
    );

    // Use confirmationWord if provided, otherwise fall back to itemDisplayName
    const expectedConfirmText = useMemo(
      () => confirmationWord || itemDisplayName,
      [confirmationWord, itemDisplayName],
    );

    const isConfirmValid = useMemo(
      () => confirmText === expectedConfirmText,
      [confirmText, expectedConfirmText],
    );

    const itemTypeLower = useMemo(() => itemType.toLowerCase(), [itemType]);

    // Memoized callbacks
    const handleConfirmTextChange = useCallback(
      (e) => {
        onConfirmTextChange(e.target.value);
      },
      [onConfirmTextChange],
    );

    const handleDelete = useCallback(() => {
      if (isConfirmValid && !isDeleting) {
        onDelete();
      }
    }, [isConfirmValid, isDeleting, onDelete]);

    // Memoized class strings
    const inputClasses = useMemo(() => {
      const baseClasses =
        "w-full px-4 py-3 min-h-[44px] border-2 rounded-xl focus:ring-4 focus:outline-none transition-all duration-200 text-base font-medium";
      if (isConfirmValid) {
        return `${baseClasses} ${themeClasses.borderSuccess} ${themeClasses.bgSuccess} ${themeClasses.focusSuccess} ${themeClasses.textSuccess}`;
      }
      return `${baseClasses} ${themeClasses.borderDanger} ${themeClasses.bgDanger} ${themeClasses.focusDanger} ${themeClasses.textDanger}`;
    }, [isConfirmValid, themeClasses]);

    const deleteButtonClasses = useMemo(
      () =>
        `inline-flex items-center justify-center px-6 py-3 min-h-[44px] text-base font-bold text-white ${themeClasses.gradientDanger} rounded-xl ${themeClasses.gradientDangerHover} hover:shadow-xl focus:outline-none focus:ring-4 ${themeClasses.focusDanger} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg touch-manipulation select-none`,
      [themeClasses],
    );

    const cancelButtonClasses = useMemo(
      () =>
        `inline-flex items-center justify-center px-6 py-3 min-h-[44px] text-base font-semibold ${themeClasses.textSecondary} ${themeClasses.bgCard} border-2 ${themeClasses.borderDefault} rounded-xl ${themeClasses.hoverBgLight} ${themeClasses.hoverBorderMedium} hover:shadow-md focus:outline-none focus:ring-4 ${themeClasses.focusDefault} disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 touch-manipulation select-none`,
      [themeClasses],
    );

    const editLinkClasses = useMemo(
      () =>
        `inline-flex items-center justify-center px-6 py-3 min-h-[44px] text-base font-semibold text-white ${themeClasses.gradientDangerLight} rounded-xl ${themeClasses.hoverGradientDangerMedium} hover:shadow-lg focus:outline-none focus:ring-4 ${themeClasses.focusDanger} transition-all duration-200 touch-manipulation select-none ${isDeleting ? "opacity-50 pointer-events-none" : ""}`,
      [isDeleting, themeClasses],
    );

    // Memoized components
    const errorSection = useMemo(() => {
      if (!error) return null;
      return (
        <div className={`mb-6 ${themeClasses.bgDanger} border ${themeClasses.borderDangerLight} ${themeClasses.textDanger} px-4 py-3 rounded-lg flex items-center justify-between`}>
          <span className="flex items-center">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            {error}
          </span>
          <button
            onClick={onErrorClear}
            className={themeClasses.linkDanger}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      );
    }, [error, onErrorClear, themeClasses]);

    const impactWarningSection = useMemo(() => {
      if (impactWarnings.length === 0) return null;
      return (
        <div className={`p-4 ${themeClasses.bgWarning} border ${themeClasses.borderWarning} rounded-lg mb-6`}>
          <h4 className={`text-base font-medium ${themeClasses.textWarning} mb-3 flex items-center`}>
            <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            This deletion will affect:
          </h4>
          <ul className={`text-sm ${themeClasses.textWarningDark} space-y-1 ml-7`}>
            {impactWarnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                {warning.icon && (
                  <warning.icon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <span>{warning.text}</span>
              </li>
            ))}
          </ul>
          {alternativeText && (
            <div className={`mt-3 pt-3 border-t ${themeClasses.borderWarning}`}>
              <p className={`text-sm font-medium ${themeClasses.textWarning}`}>
                <strong>Alternative:</strong> {alternativeText}
              </p>
            </div>
          )}
        </div>
      );
    }, [impactWarnings, alternativeText, themeClasses]);

    const customFieldsSection = useMemo(() => {
      return customFields.map((field, index) => (
        <div key={index}>
          <div className={`block text-base font-medium ${themeClasses.textPrimary} mb-2`}>
            {field.label}
          </div>
          <div className={`p-4 ${themeClasses.bgCard} rounded-xl border ${themeClasses.borderDefault} flex items-center`}>
            {field.icon && <field.icon className={`w-5 h-5 mr-2 ${themeClasses.textPrimary}`} />}
            <span className={field.className || `font-medium ${themeClasses.textPrimary}`}>
              {field.value}
            </span>
          </div>
        </div>
      ));
    }, [customFields, themeClasses]);

    const systemInfoSection = useMemo(() => {
      if (!systemInfo || !item) return null;
      return (
        <div className={`mt-8 ${themeClasses.bgCard} shadow-xl rounded-2xl overflow-hidden border ${themeClasses.borderLight} hover:shadow-2xl transition-shadow duration-300`}>
          <div className={`px-6 py-4 ${themeClasses.bgInfo} border-b ${themeClasses.borderInfo}`}>
            <h2 className={`text-lg font-bold ${themeClasses.textInfo} flex items-center`}>
              <InformationCircleIcon className={`w-6 h-6 mr-3 ${themeClasses.textInfoLight}`} />
              System Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <p className={`font-medium ${themeClasses.textPrimary} mb-1 flex items-center`}>
                  <ClockIcon className={`w-4 h-4 mr-1 ${themeClasses.textPrimary}`} />
                  Created At:
                </p>
                <p className={`${themeClasses.textPrimary} ml-5`}>{createdDateTime}</p>
              </div>
              <div>
                <p className={`font-medium ${themeClasses.textPrimary} mb-1 flex items-center`}>
                  <UserIcon className={`w-4 h-4 mr-1 ${themeClasses.textPrimary}`} />
                  Created By:
                </p>
                <p className={`${themeClasses.textPrimary} ml-5`}>
                  {item.createdByUserName || "Not available"}
                </p>
              </div>
              <div>
                <p className={`font-medium ${themeClasses.textPrimary} mb-1 flex items-center`}>
                  <ClockIcon className={`w-4 h-4 mr-1 ${themeClasses.textPrimary}`} />
                  Last Modified:
                </p>
                <p className={`${themeClasses.textPrimary} ml-5`}>{modifiedDateTime}</p>
              </div>
              {item.modifiedByUserName && (
                <div>
                  <p className={`font-medium ${themeClasses.textPrimary} mb-1 flex items-center`}>
                    <UserIcon className={`w-4 h-4 mr-1 ${themeClasses.textPrimary}`} />
                    Modified By:
                  </p>
                  <p className={`${themeClasses.textPrimary} ml-5`}>
                    {item.modifiedByUserName}
                  </p>
                </div>
              )}
              {item.createdFromIpAddress && (
                <div>
                  <p className={`font-medium ${themeClasses.textPrimary} mb-1 flex items-center`}>
                    <GlobeAltIcon className={`w-4 h-4 mr-1 ${themeClasses.textPrimary}`} />
                    Created From IP:
                  </p>
                  <p className={`${themeClasses.textPrimary} ml-5`}>
                    {item.createdFromIpAddress}
                  </p>
                </div>
              )}
              {item.modifiedFromIpAddress && (
                <div>
                  <p className={`font-medium ${themeClasses.textPrimary} mb-1 flex items-center`}>
                    <GlobeAltIcon className={`w-4 h-4 mr-1 ${themeClasses.textPrimary}`} />
                    Modified From IP:
                  </p>
                  <p className={`${themeClasses.textPrimary} ml-5`}>
                    {item.modifiedFromIpAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }, [systemInfo, item, createdDateTime, modifiedDateTime, themeClasses]);

    // Early return AFTER all hooks have been called
    if (!item) return null;

    return (
      <div className={`max-w-4xl mx-auto ${className}`}>
        {/* Permanent Deletion Warning Alert */}
        <div className={`mb-6 ${themeClasses.bgDanger} border-2 ${themeClasses.borderDanger} ${themeClasses.textDanger} px-4 py-4 rounded-lg flex items-start`}>
          <ShieldExclamationIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-lg">Permanent Deletion Warning</p>
            <p className="text-sm mt-1">
              You are about to permanently delete this {itemTypeLower}. This
              action cannot be undone.
            </p>
          </div>
        </div>

        <div className={`${themeClasses.bgCard} shadow-xl rounded-2xl overflow-hidden border ${themeClasses.borderLight} hover:shadow-2xl transition-shadow duration-300`}>
          <div className={`px-6 py-4 ${themeClasses.gradientHeader}`}>
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center">
              <ShieldExclamationIcon className="w-5 h-5 mr-2" />
              Deletion Confirmation
            </h2>
          </div>

          <div className="p-6">
            {/* Error Messages */}
            {errorSection}

            {/* Item Details Section */}
            <div className="mb-6">
              <div className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3 flex items-center`}>
                {itemType} to be deleted
              </div>

              <div className={`p-5 ${themeClasses.bgDanger} rounded-xl border ${themeClasses.borderDangerLight}`}>
                {/* Use custom renderItemDetails if provided, otherwise use default rendering */}
                {renderItemDetails ? (
                  renderItemDetails(item)
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className={`block text-base sm:text-lg font-semibold ${themeClasses.textPrimary} mb-3`}>
                        Name
                      </div>
                      <div className={`p-5 ${themeClasses.bgCard} rounded-xl border ${themeClasses.borderDefault} font-semibold text-lg ${themeClasses.textPrimary}`}>
                        {itemDisplayName}
                      </div>
                    </div>

                    {item.description && (
                      <div>
                        <div className={`block text-base font-medium ${themeClasses.textPrimary} mb-2`}>
                          Description
                        </div>
                        <div className={`p-4 ${themeClasses.bgCard} rounded-xl border ${themeClasses.borderDefault} ${themeClasses.textPrimary}`}>
                          {item.description}
                        </div>
                      </div>
                    )}

                    {/* Custom Fields */}
                    {customFieldsSection}

                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2 border-t ${themeClasses.borderDangerLight}`}>
                      <div>
                        <span className={`font-medium ${themeClasses.textPrimary}`}>Status:</span>{" "}
                        <span className={themeClasses.textPrimary}>{itemStatus}</span>
                      </div>
                      <div>
                        <span className={`font-medium ${themeClasses.textPrimary}`}>
                          Created:
                        </span>{" "}
                        <span className={themeClasses.textPrimary}>{createdDate}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Impact Warning */}
            {impactWarningSection}

            {/* Confirmation Section */}
            <div className={`p-6 bg-gradient-to-br ${themeClasses.bgDanger} ${themeClasses.bgCard} border-2 ${themeClasses.borderDangerLight} rounded-xl mb-6 shadow-lg`}>
              <h4 className={`text-lg font-bold ${themeClasses.textDanger} mb-4 flex items-center`}>
                <LockClosedIcon className={`w-6 h-6 mr-3 ${themeClasses.textDangerDark}`} />
                Confirmation Required
              </h4>

              <div className={`${themeClasses.bgCard} bg-opacity-60 backdrop-blur-sm rounded-lg p-4 mb-4 border ${themeClasses.borderDangerLight}`}>
                <p className={`text-sm ${themeClasses.textPrimary} mb-3 leading-relaxed`}>
                  This action will permanently remove the {itemTypeLower} from
                  the system. All data will be lost and cannot be recovered.
                </p>

                <label
                  htmlFor="delete-confirmation-input"
                  className={`text-sm font-semibold ${themeClasses.textPrimary} mb-4 block`}
                >
                  To confirm deletion, please type{" "}
                  <code className={`px-3 py-1 ${themeClasses.bgDanger} border ${themeClasses.borderDanger} rounded-md ${themeClasses.textDangerDark} font-mono text-sm`}>
                    {expectedConfirmText}
                  </code>{" "}
                  in the box below:
                </label>

                <div className="relative">
                  <input
                    type="text"
                    id="delete-confirmation-input"
                    name="delete-confirmation"
                    value={confirmText}
                    onChange={handleConfirmTextChange}
                    placeholder={`Type "${expectedConfirmText}" to confirm`}
                    className={inputClasses}
                    disabled={isDeleting}
                    autoComplete="off"
                    autoFocus
                  />
                  {isConfirmValid && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg
                        className={`w-5 h-5 ${themeClasses.textSuccess}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`pt-8 border-t-2 ${themeClasses.borderDangerLight} flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0`}>
              <Link
                to={detailRoute}
                className={`inline-flex items-center min-h-[44px] text-base font-medium ${themeClasses.linkDanger} transition-colors duration-200 touch-manipulation select-none`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Detail
              </Link>

              <div className="flex flex-col space-y-3 lg:flex-row lg:items-center lg:space-y-0 lg:space-x-4">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={isDeleting}
                  className={cancelButtonClasses}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </button>

                {editRoute && (
                  <Link to={editRoute} className={editLinkClasses} style={{ WebkitTapHighlightColor: 'transparent' }}>
                    <PencilSquareIcon className="w-4 h-4 mr-2" />
                    Edit Instead
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isDeleting || !isConfirmValid}
                  className={deleteButtonClasses}
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {isDeleting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Information Card */}
        {systemInfoSection}
      </div>
    );
  },
);

// Add display name for better debugging
DeleteConfirmationCard.displayName = "DeleteConfirmationCard";

export default DeleteConfirmationCard;
