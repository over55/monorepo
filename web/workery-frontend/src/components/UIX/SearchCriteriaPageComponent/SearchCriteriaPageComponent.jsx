// File: src/components/UIX/SearchCriteriaPageComponent/SearchCriteriaPageComponent.jsx
// UIX Mobile Optimizations Applied
// Reusable SearchCriteriaPageComponent for search criteria forms with consistent layout

import React, { memo, useMemo, useCallback } from "react";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  FormCard,
  FormSection,
  FormRow,
  Input,
  Checkbox,
  Button,
  Alert,
  DetailPageIcon,
} from "../";
import { TagsMultiSelect } from "../../business/selects";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

// Move static default values outside component to prevent recreation
const DEFAULT_PAGE_TITLE = "Search";
const DEFAULT_PAGE_SUBTITLE = "";
const DEFAULT_FORM_TITLE = "Search Criteria";
const DEFAULT_FORM_SUBTITLE = "Enter search criteria to find items";
const DEFAULT_SUBMIT_LABEL = "Search";
const DEFAULT_CLEAR_LABEL = "Clear";
const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_LOADING_TEXT = "Searching...";
const DEFAULT_MAX_WIDTH = "7xl";

/**
 * Reusable SearchCriteriaPageComponent - Performance Optimized
 * A complete search criteria page component with consistent layout and theming
 *
 * Performance optimizations:
 * - Component memoization with React.memo for both inner and outer components
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback
 * - Memoized sections (breadcrumb, header, error alert, form sections, actions)
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Theme-aware styling that adapts to red/blue/purple/green/charcoal themes
 * - Configurable breadcrumb navigation
 * - Structured form layout with sections
 * - Support for various input types and validation
 * - Checkbox options for filters
 * - Standardized action buttons
 * - Responsive design for mobile and desktop
 * - Error handling and loading states
 *
 * @param {Object} props
 * @param {Array} props.breadcrumbItems - Breadcrumb navigation configuration
 * @param {string} props.pageTitle - Main page title
 * @param {string} props.pageSubtitle - Optional page subtitle
 * @param {React.Component} props.pageIcon - Icon for page header
 * @param {string} props.formTitle - Form card title
 * @param {string} props.formSubtitle - Form card subtitle
 * @param {React.Component} props.formIcon - Icon for form card
 * @param {Object} props.formData - Current form data object
 * @param {function} props.onFormDataChange - Handler for form data changes
 * @param {Array} props.formSections - Array of form section configurations
 *   Each field supports: name, label, type, placeholder, icon, fieldType
 *   fieldType can be: 'input' (default), 'tags'
 * @param {Array} props.checkboxOptions - Array of checkbox filter options
 * @param {Object} props.errors - Error state object
 * @param {function} props.onSubmit - Form submission handler
 * @param {function} props.onCancel - Cancel handler
 * @param {function} props.onClear - Clear form handler
 * @param {function} props.onUnauthorized - Unauthorized handler for API calls
 * @param {string} props.submitLabel - Submit button label
 * @param {string} props.clearLabel - Clear button label
 * @param {string} props.cancelLabel - Cancel button label
 * @param {boolean} props.isLoading - Loading state
 * @param {string} props.loadingText - Loading button text
 * @param {string} props.maxWidth - Form card max width
 * @param {boolean} props.showPageSubtitle - Whether to show page subtitle
 * @param {string} props.className - Additional CSS classes
 */

// Inner component that uses the theme hook
const SearchCriteriaPageComponentInner = memo(function SearchCriteriaPageComponentInner({
  breadcrumbItems = [],
  pageTitle = DEFAULT_PAGE_TITLE,
  pageSubtitle = DEFAULT_PAGE_SUBTITLE,
  pageIcon = MagnifyingGlassIcon,
  formTitle = DEFAULT_FORM_TITLE,
  formSubtitle = DEFAULT_FORM_SUBTITLE,
  formIcon = MagnifyingGlassIcon,
  formData = {},
  onFormDataChange = () => {},
  formSections = [],
  checkboxOptions = [],
  errors = {},
  onSubmit = () => {},
  onCancel = () => {},
  onClear = () => {},
  onUnauthorized = null,
  submitLabel = DEFAULT_SUBMIT_LABEL,
  clearLabel = DEFAULT_CLEAR_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  isLoading = false,
  loadingText = DEFAULT_LOADING_TEXT,
  maxWidth = DEFAULT_MAX_WIDTH,
  showPageSubtitle = false,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
      cardBorder: getThemeClasses('card-border'),
    }),
    [getThemeClasses],
  );

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      onSubmit(formData);
    },
    [onSubmit, formData],
  );

  const handleInputChange = useCallback(
    (fieldName, value) => {
      onFormDataChange({ ...formData, [fieldName]: value });
    },
    [onFormDataChange, formData],
  );

  const handleErrorClose = useCallback(() => {
    onFormDataChange({ ...formData, errors: {} });
  }, [onFormDataChange, formData]);

  // Memoize container className
  const containerClassName = useMemo(() => {
    return className
      ? `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${className}`
      : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8';
  }, [className]);

  // Memoize breadcrumb section
  const breadcrumbSection = useMemo(() => {
    if (breadcrumbItems.length === 0) return null;
    return <Breadcrumb items={breadcrumbItems} />;
  }, [breadcrumbItems]);

  // Memoize header section
  const headerSection = useMemo(() => {
    return (
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center">
          <DetailPageIcon icon={pageIcon} className="mr-3" />
          <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.textPrimary}`}>
            {pageTitle}
          </h1>
        </div>
        {showPageSubtitle && pageSubtitle && (
          <p className={`mt-2 text-sm sm:text-base ${themeClasses.textSecondary}`}>
            {pageSubtitle}
          </p>
        )}
      </div>
    );
  }, [pageIcon, pageTitle, showPageSubtitle, pageSubtitle, themeClasses]);

  // Memoize error alert section
  const errorAlertSection = useMemo(() => {
    if (!errors.message) return null;
    return (
      <Alert
        type="error"
        message={errors.message}
        onClose={handleErrorClose}
        className="mb-6"
      />
    );
  }, [errors.message, handleErrorClose]);

  // Memoize actions className
  const actionsClassName = useMemo(() => {
    return `flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6 border-t ${themeClasses.cardBorder}`;
  }, [themeClasses.cardBorder]);

  // Memoize submit icon
  const submitIcon = useMemo(() => {
    return isLoading ? null : MagnifyingGlassIcon;
  }, [isLoading]);

  return (
    <div className={containerClassName}>
      {breadcrumbSection}
      {headerSection}
      {errorAlertSection}

      {/* Search Form */}
      <FormCard
        title={formTitle}
        subtitle={formSubtitle}
        icon={formIcon}
        maxWidth={maxWidth}
      >
        <form onSubmit={handleSubmit}>
          {/* Dynamic Form Sections */}
          {formSections.map((section, sectionIndex) => (
            <FormSection key={sectionIndex} title={section.title}>
              <FormRow columns={section.columns || 2}>
                {section.fields.map((field) => {
                  // Render TagsMultiSelect for fieldType === 'tags'
                  if (field.fieldType === 'tags') {
                    return (
                      <TagsMultiSelect
                        key={field.name}
                        label={field.label}
                        value={formData[field.name] || []}
                        onChange={(value) => handleInputChange(field.name, value)}
                        placeholder={field.placeholder}
                        error={errors[field.name]}
                        onUnauthorized={onUnauthorized}
                        helperText={field.helperText}
                      />
                    );
                  }

                  // Default: Render Input for all other field types
                  return (
                    <Input
                      key={field.name}
                      label={field.label}
                      type={field.type || 'text'}
                      value={formData[field.name] || ''}
                      onChange={(value) => handleInputChange(field.name, value)}
                      placeholder={field.placeholder}
                      icon={field.icon}
                      error={errors[field.name]}
                    />
                  );
                })}
              </FormRow>
            </FormSection>
          ))}

          {/* Checkbox Options Section */}
          {checkboxOptions.length > 0 && (
            <FormSection title="Search Options">
              {checkboxOptions.map((option) => (
                <Checkbox
                  key={option.name}
                  checked={formData[option.name] || false}
                  onChange={(checked) => handleInputChange(option.name, checked)}
                  label={option.label}
                />
              ))}
            </FormSection>
          )}

          {/* Form Actions */}
          <div className={actionsClassName}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {cancelLabel}
            </Button>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClear}
                icon={XMarkIcon}
              >
                {clearLabel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                icon={submitIcon}
                loading={isLoading}
                loadingText={loadingText}
              >
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </FormCard>
    </div>
  );
});

// Set display name for React DevTools
SearchCriteriaPageComponentInner.displayName = 'SearchCriteriaPageComponentInner';

// Main wrapper component that provides theme context
const SearchCriteriaPageComponent = memo(function SearchCriteriaPageComponent({
  // Core data
  breadcrumbItems = [],
  pageTitle = DEFAULT_PAGE_TITLE,
  pageSubtitle = DEFAULT_PAGE_SUBTITLE,
  pageIcon = MagnifyingGlassIcon,
  formTitle = DEFAULT_FORM_TITLE,
  formSubtitle = DEFAULT_FORM_SUBTITLE,
  formIcon = MagnifyingGlassIcon,
  formData = {},
  onFormDataChange = () => {},
  formSections = [],
  checkboxOptions = [],

  // State and handlers
  errors = {},
  onSubmit = () => {},
  onCancel = () => {},
  onClear = () => {},
  onUnauthorized = null,

  // UI customization
  submitLabel = DEFAULT_SUBMIT_LABEL,
  clearLabel = DEFAULT_CLEAR_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  isLoading = false,
  loadingText = DEFAULT_LOADING_TEXT,
  maxWidth = DEFAULT_MAX_WIDTH,
  showPageSubtitle = false,
  className = "",
}) {
  return (
    <UIXThemeProvider>
      <SearchCriteriaPageComponentInner
        breadcrumbItems={breadcrumbItems}
        pageTitle={pageTitle}
        pageSubtitle={pageSubtitle}
        pageIcon={pageIcon}
        formTitle={formTitle}
        formSubtitle={formSubtitle}
        formIcon={formIcon}
        formData={formData}
        onFormDataChange={onFormDataChange}
        formSections={formSections}
        checkboxOptions={checkboxOptions}
        errors={errors}
        onSubmit={onSubmit}
        onCancel={onCancel}
        onClear={onClear}
        onUnauthorized={onUnauthorized}
        submitLabel={submitLabel}
        clearLabel={clearLabel}
        cancelLabel={cancelLabel}
        isLoading={isLoading}
        loadingText={loadingText}
        maxWidth={maxWidth}
        showPageSubtitle={showPageSubtitle}
        className={className}
      />
    </UIXThemeProvider>
  );
});

// Set display name for React DevTools
SearchCriteriaPageComponent.displayName = 'SearchCriteriaPageComponent';

export default SearchCriteriaPageComponent;

// Export helper function for reuse in other components
export { SearchCriteriaPageComponent };