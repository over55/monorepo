// File Path: web/frontend/src/components/UIX/StaffSearchForm/StaffSearchForm.jsx
// UIX Mobile Optimizations Applied
// Reusable StaffSearchForm component for staff criteria-based search pages with PageHeader layout

import React, { useState, memo, useMemo, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowLeftIcon,
  LightBulbIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import {
  Alert,
  Input,
  FormCard,
  FormSection,
  FormRow,
  useUIXTheme,
} from "../";
import Button from "../Button/Button";

// Move static default values outside component to prevent recreation
const DEFAULT_TITLE = "Search";
const DEFAULT_SUBTITLE = "Find items in your database";
const DEFAULT_SUBMIT_LABEL = "Search";
const DEFAULT_BACK_PATH = "/";
const VALIDATION_ERROR_MESSAGE = "Please enter at least one search criterion";
const LOADING_TEXT = "Searching...";
// Uses Tailwind red palette: red-900 (127 29 29) and red-600 (220 38 38)
const GRADIENT_STYLE = { background: 'linear-gradient(135deg, rgb(127 29 29) 0%, rgb(220 38 38) 100%)' };

/**
 * Reusable StaffSearchForm Component - Performance Optimized
 * A complete staff search criteria form with our style guide design
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized event handlers with useCallback
 * - Memoized field grouping computation
 * - Memoized sections (header icon, error alert, filter options, action buttons)
 * - Prevented unnecessary re-renders
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data object
 * @param {function} props.onFormDataChange - Handler for form data changes
 * @param {Array} props.fields - Array of field configurations
 * @param {Array} props.filterOptions - Array of filter options (checkboxes)
 * @param {Object} props.errors - Error state object
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onCancel - Cancel handler
 * @param {function} props.onClear - Clear form handler
 * @param {string} props.title - Page title
 * @param {string} props.subtitle - Page subtitle
 * @param {boolean} props.showSubtitle - Whether to show the subtitle (default: true)
 * @param {boolean} props.showSectionTitles - Whether to show section titles (default: true)
 * @param {boolean} props.inlineFilterOptions - Whether to show filter options inline with action buttons (default: false)
 * @param {string} props.submitLabel - Submit button label
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.icon - Icon component for header
 * @param {string} props.backPath - Back navigation path
 * @param {string} props.className - Additional CSS classes
 */
const StaffSearchForm = memo(function StaffSearchForm({
  formData = {},
  onFormDataChange = () => {},
  fields = [],
  filterOptions = [],
  errors = {},
  onSubmit = () => {},
  onCancel = () => {},
  onClear = () => {},
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  showSubtitle = true,
  showSectionTitles = true,
  inlineFilterOptions = false,
  submitLabel = DEFAULT_SUBMIT_LABEL,
  isLoading = false,
  icon: Icon = MagnifyingGlassIcon,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();
  const [localErrors, setLocalErrors] = useState({});

  // Theme classes for consistent styling
  const themeClasses = useMemo(() => ({
    bgGradient: getThemeClasses("bg-gradient-page") || "bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-900 dark:to-red-950",
    blobPrimary: getThemeClasses("blob-primary") || "bg-purple-200 dark:bg-purple-900",
    blobSecondary: getThemeClasses("blob-secondary") || "bg-yellow-200 dark:bg-yellow-900",
    blobTertiary: getThemeClasses("blob-tertiary") || "bg-pink-200 dark:bg-pink-900",
    textHeading: getThemeClasses("text-heading") || "text-gray-800 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-400",
    textMuted: getThemeClasses("text-muted") || "text-gray-600 dark:text-gray-400",
    textLabel: getThemeClasses("text-label") || "text-gray-700 dark:text-gray-300",
    checkboxColor: getThemeClasses("checkbox-color") || "text-red-600 dark:text-red-400",
    checkboxBorder: getThemeClasses("checkbox-border") || "border-gray-300 dark:border-gray-600",
    checkboxFocus: getThemeClasses("checkbox-focus") || "focus:ring-red-500 dark:focus:ring-red-400",
    borderLight: getThemeClasses("border-light") || "border-gray-200 dark:border-gray-700",
  }), [getThemeClasses]);

  // Memoize combined errors
  const combinedErrors = useMemo(() => {
    return { ...localErrors, ...errors };
  }, [localErrors, errors]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleInputChange = useCallback(
    (fieldName, value) => {
      onFormDataChange({ ...formData, [fieldName]: value });
      // Clear field-specific errors when user starts typing
      if (combinedErrors[fieldName] || combinedErrors.message) {
        setLocalErrors({});
      }
    },
    [onFormDataChange, formData, combinedErrors],
  );

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Validate that at least one field has a value (excluding boolean fields)
      const hasValue = fields.some(field => {
        if (field.type === 'checkbox') return true; // Skip checkbox validation
        return formData[field.name] && formData[field.name].trim();
      });

      if (!hasValue) {
        setLocalErrors({
          message: VALIDATION_ERROR_MESSAGE
        });
        return;
      }

      setLocalErrors({});
      onSubmit(formData);
    },
    [fields, formData, onSubmit],
  );

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
    },
    [handleSubmit],
  );

  const handleErrorClose = useCallback(() => {
    setLocalErrors({});
  }, []);

  // Memoize field grouping by section
  const fieldsBySection = useMemo(() => {
    return fields.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {});
  }, [fields]);

  return (
    <div className={`min-h-screen ${themeClasses.bgGradient} ${className}`}>
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-80 h-80 ${themeClasses.blobPrimary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob`}></div>
        <div className={`absolute -bottom-40 -left-40 w-80 h-80 ${themeClasses.blobSecondary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 ${themeClasses.blobTertiary} rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000`}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header Section - PageHeader Style */}
        <div className="mb-8 sm:mb-10 max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-start">
                {Icon && (
                  <div
                    className="p-3 rounded-2xl shadow-lg mr-4 flex-shrink-0"
                    style={GRADIENT_STYLE}
                  >
                    <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                )}
                <div className="text-center lg:text-left">
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.textHeading} leading-tight`}>
                    {title}
                  </h1>
                  {showSubtitle && (
                    <p className={`mt-2 text-base sm:text-lg lg:text-xl ${themeClasses.textSecondary} font-medium`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={onCancel}
                icon={ArrowLeftIcon}
              >
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {combinedErrors.message && (
          <Alert
            type="error"
            message={combinedErrors.message}
            onClose={handleErrorClose}
            className="mb-6"
          />
        )}

        {/* Main Search Form */}
        <FormCard
          title="Search Criteria"
          subtitle="Enter one or more search criteria to find items"
          icon={MagnifyingGlassIcon}
          maxWidth="7xl"
        >
          <form onSubmit={handleSubmit}>
            {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
              <FormSection
                key={sectionName}
                title={showSectionTitles ? (sectionName === 'general' ? 'Search Fields' : sectionName) : ''}
                icon={showSectionTitles ? (sectionName === 'personal' ? UserIcon : sectionName === 'contact' ? PhoneIcon : MagnifyingGlassIcon) : null}
              >
                <FormRow columns={2}>
                  {sectionFields.map((field) => (
                    <div key={field.name}>
                      {field.type === 'checkbox' ? (
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData[field.name] || false}
                            onChange={(e) => handleInputChange(field.name, e.target.checked)}
                            className={`h-4 w-4 ${themeClasses.checkboxColor} rounded ${themeClasses.checkboxBorder} ${themeClasses.checkboxFocus}`}
                          />
                          <span className={`ml-2 text-sm ${themeClasses.textLabel}`}>
                            {field.label}
                          </span>
                        </label>
                      ) : (
                        <Input
                          label={field.label}
                          type={field.type || 'text'}
                          value={formData[field.name] || ''}
                          onChange={(value) => handleInputChange(field.name, value)}
                          placeholder={field.placeholder}
                          icon={field.icon}
                          error={combinedErrors[field.name]}
                          onKeyPress={handleKeyPress}
                        />
                      )}
                    </div>
                  ))}
                </FormRow>
              </FormSection>
            ))}

            {/* Filter Options - Separate Section (when not inline) */}
            {filterOptions.length > 0 && !inlineFilterOptions && (
              <FormSection title="Filter Options" icon={FunnelIcon}>
                <div className="space-y-3">
                  {filterOptions.map((option) => (
                    <label key={option.name} className="flex items-start cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[option.name] || false}
                        onChange={(e) => handleInputChange(option.name, e.target.checked)}
                        className={`h-4 w-4 ${themeClasses.checkboxColor} rounded ${themeClasses.checkboxBorder} ${themeClasses.checkboxFocus} mt-0.5`}
                      />
                      <div className="ml-3">
                        <span className={`text-sm ${themeClasses.textLabel} font-medium`}>
                          {option.label}
                        </span>
                        {option.description && (
                          <p className={`text-xs ${themeClasses.textMuted} mt-1`}>
                            {option.description}
                          </p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </FormSection>
            )}

            {/* Action Buttons */}
            <div className={`flex justify-between items-center pt-6 border-t ${themeClasses.borderLight}`}>
              <div className="flex items-center space-x-6">
                {/* Inline Filter Options */}
                {filterOptions.length > 0 && inlineFilterOptions && (
                  <div className="flex items-center space-x-4">
                    {filterOptions.map((option) => (
                      <label key={option.name} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData[option.name] || false}
                          onChange={(e) => handleInputChange(option.name, e.target.checked)}
                          className={`h-4 w-4 ${themeClasses.checkboxColor} rounded ${themeClasses.checkboxBorder} ${themeClasses.checkboxFocus}`}
                        />
                        <span className={`ml-2 text-sm ${themeClasses.textLabel} font-medium`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Action Buttons - Left Side */}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={onClear}
                    icon={XMarkIcon}
                  >
                    Clear
                  </Button>
                </div>
              </div>

              {/* Submit Button - Right Side */}
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                icon={isLoading ? null : MagnifyingGlassIcon}
                loading={isLoading}
                loadingText={LOADING_TEXT}
              >
                {submitLabel}
              </Button>
            </div>
          </form>
        </FormCard>

      </div>

    </div>
  );
});

// Set display name for React DevTools
StaffSearchForm.displayName = 'StaffSearchForm';

export default StaffSearchForm;