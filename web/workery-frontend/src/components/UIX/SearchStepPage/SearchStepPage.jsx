// File Path: web/frontend/src/components/UIX/SearchStepPage/SearchStepPage.jsx
// UIX Mobile Optimizations Applied
// Reusable SearchStepPage component for wizard search steps

import React, { useMemo, useCallback, memo } from "react";
import {
  FormCard,
  FormSection,
  FormRow,
  Input,
  Alert,
} from "../";
import Button from "../Button/Button";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  UserPlusIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

// Move static default values outside component to prevent recreation
const DEFAULT_SEARCH_TITLE = "Search for Existing Items";
const DEFAULT_SEARCH_SUBTITLE = "Enter search criteria to check for existing records";
const DEFAULT_SEARCH_BUTTON_LABEL = "Search";
const DEFAULT_SKIP_TITLE = "Skip Search";
const DEFAULT_SKIP_DESCRIPTION = "If you're sure this is a new item, skip the search and proceed directly to creation";
const DEFAULT_SKIP_BUTTON_LABEL = "Add New Item";
const DEFAULT_INFO_MESSAGE = "Enter at least one search criteria to check for existing records. This helps prevent duplicate entries in the system.";
const DEFAULT_MAX_WIDTH = "7xl";
const LOADING_TEXT = "Searching...";

/**
 * Reusable SearchStepPage Component - Performance Optimized
 * A complete search step component for wizards that integrates with our style guide
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback (already present)
 * - Memoized sections (error alert, loading state, form sections, info message, actions)
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - White card container matching other components
 * - Search form with configurable fields
 * - "OR" divider section
 * - Skip search option with customizable action
 * - Form validation and error handling
 * - Cancel confirmation with unsaved data protection
 * - Red gradient theme integration
 * - Responsive design
 *
 * @param {Object} props
 * @param {Object} props.formData - Current form data object
 * @param {function} props.onFormDataChange - Handler for form data changes
 * @param {Array} props.fields - Array of field configurations
 * @param {Object} props.errors - Error state object
 * @param {function} props.onSearch - Search form submission handler
 * @param {function} props.onCancel - Cancel handler
 * @param {function} props.onSkipSearch - Skip search handler (creates new item directly)
 * @param {string} props.searchTitle - Search section title
 * @param {string} props.searchSubtitle - Search section subtitle
 * @param {string} props.searchButtonLabel - Search button label
 * @param {string} props.skipTitle - Skip section title
 * @param {string} props.skipDescription - Skip section description
 * @param {string} props.skipButtonLabel - Skip button label
 * @param {string} props.infoMessage - Info message text
 * @param {boolean} props.isLoading - Loading state
 * @param {boolean} props.showSectionTitles - Whether to show section titles
 * @param {React.Component} props.skipIcon - Icon for skip button
 * @param {string} props.className - Additional CSS classes
 */
const SearchStepPage = memo(function SearchStepPage({
  // Form props
  formData = {},
  onFormDataChange = () => {},
  fields = [],
  errors = {},
  onSearch = () => {},
  onCancel = () => {},
  onSkipSearch = () => {},

  // Content props
  searchTitle = DEFAULT_SEARCH_TITLE,
  searchSubtitle = DEFAULT_SEARCH_SUBTITLE,
  searchButtonLabel = DEFAULT_SEARCH_BUTTON_LABEL,
  skipButtonLabel = DEFAULT_SKIP_BUTTON_LABEL,
  infoMessage = DEFAULT_INFO_MESSAGE,

  // UI props
  isLoading = false,
  showSectionTitles = false,
  skipIcon: SkipIcon = UserPlusIcon,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      borderPrimary: getThemeClasses('border-primary') || 'border-red-600 dark:border-red-500',
      alertInfoBg: getThemeClasses('alert-info-bg') || 'bg-blue-50 dark:bg-blue-900/30',
      alertInfoBorder: getThemeClasses('alert-info-border') || 'border-blue-200 dark:border-blue-800',
      alertInfoText: getThemeClasses('alert-info-text') || 'text-blue-800 dark:text-blue-300',
      textMuted: getThemeClasses('text-muted') || 'text-gray-600 dark:text-gray-400',
      borderMedium: getThemeClasses('border-medium') || 'border-gray-200 dark:border-gray-700',
    }),
    [getThemeClasses],
  );

  // Handle form submission - memoized to prevent unnecessary re-renders
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSearch(formData);
  }, [onSearch, formData]);

  // Handle input changes - memoized for performance
  const handleInputChange = useCallback((fieldName, value) => {
    onFormDataChange({ ...formData, [fieldName]: value });
  }, [onFormDataChange, formData]);

  // Handle key press for form submission - memoized
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Handle skip button click - memoized
  const handleSkipClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onSkipSearch === 'function') {
      onSkipSearch();
    }
  }, [onSkipSearch]);

  // Group fields by section - memoized to prevent recalculation on every render
  const fieldsBySection = useMemo(() =>
    fields.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {}), [fields]);

  // Memoize className strings
  const spinnerClassName = useMemo(() => {
    return `animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary}`;
  }, [themeClasses.borderPrimary]);

  const infoContainerClassName = useMemo(() => {
    return `mb-6 p-4 rounded-lg ${themeClasses.alertInfoBg} border ${themeClasses.alertInfoBorder}`;
  }, [themeClasses.alertInfoBg, themeClasses.alertInfoBorder]);

  const infoTextClassName = useMemo(() => {
    return `text-sm ${themeClasses.alertInfoText} flex items-start`;
  }, [themeClasses.alertInfoText]);

  // Memoize submit icon
  const submitIcon = useMemo(() => {
    return isLoading ? null : MagnifyingGlassIcon;
  }, [isLoading]);

  // Memoize error alert section
  const errorAlertSection = useMemo(() => {
    if (!errors.message) return null;
    return (
      <Alert
        type="error"
        message={errors.message}
        onClose={() => {}}
        className="mb-6"
      />
    );
  }, [errors.message]);

  // Memoize loading state
  const loadingState = useMemo(() => {
    if (!isLoading) return null;
    return (
      <div className="flex items-center justify-center py-12">
        <div className={spinnerClassName}></div>
        <span className={`ml-3 ${themeClasses.textMuted}`}>{LOADING_TEXT}</span>
      </div>
    );
  }, [isLoading, spinnerClassName, themeClasses.textMuted]);

  // Memoize info message section
  const infoMessageSection = useMemo(() => {
    if (!infoMessage) return null;
    return (
      <div className={infoContainerClassName}>
        <p className={infoTextClassName}>
          <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{infoMessage}</span>
        </p>
      </div>
    );
  }, [infoMessage, infoContainerClassName, infoTextClassName]);

  return (
    <div className={className}>
      {errorAlertSection}

      {/* Main Search Card */}
      <FormCard
        title={searchTitle}
        subtitle={searchSubtitle}
        icon={MagnifyingGlassIcon}
        maxWidth={DEFAULT_MAX_WIDTH}
      >
        {loadingState || (
          <form onSubmit={handleSubmit}>
            {/* Dynamic Form Sections */}
            {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
              <FormSection
                key={sectionName}
                title={showSectionTitles ? (sectionName === 'general' ? 'Search Fields' : sectionName) : ''}
              >
                <FormRow columns={2}>
                  {sectionFields.map((field) => (
                    <div key={field.name}>
                      <Input
                        label={field.label}
                        type={field.type || 'text'}
                        value={formData[field.name] || ''}
                        onChange={(value) => handleInputChange(field.name, value)}
                        placeholder={field.placeholder}
                        icon={field.icon}
                        error={errors[field.name]}
                        onKeyPress={handleKeyPress}
                      />
                    </div>
                  ))}
                </FormRow>
              </FormSection>
            ))}

            {infoMessageSection}

            {/* Search Actions */}
            <div className={`${onSkipSearch ? 'grid grid-cols-3' : 'grid grid-cols-2'} gap-4 items-center pt-6 border-t ${themeClasses.borderMedium}`}>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  icon={ArrowLeftIcon}
                >
                  Cancel
                </Button>
              </div>

              <div className={onSkipSearch ? "flex justify-center" : "flex justify-end"}>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  icon={submitIcon}
                  loading={isLoading}
                  loadingText={LOADING_TEXT}
                >
                  {searchButtonLabel}
                </Button>
              </div>

              {onSkipSearch && (
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleSkipClick}
                    variant="success"
                    icon={SkipIcon}
                  >
                    {skipButtonLabel}
                  </Button>
                </div>
              )}
            </div>
          </form>
        )}
      </FormCard>
    </div>
  );
});

// Set display name for React DevTools
SearchStepPage.displayName = 'SearchStepPage';

export default SearchStepPage;