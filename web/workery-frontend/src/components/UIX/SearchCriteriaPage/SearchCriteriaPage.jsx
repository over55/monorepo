// File: src/components/UIX/SearchCriteriaPage/SearchCriteriaPage.jsx
// UIX Mobile Optimizations Applied

import React, { useState, memo, useMemo, useCallback } from "react";
import {
  ChevronDownIcon,
  RocketLaunchIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Button from "../Button/Button";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static values outside component to prevent recreation
const DEFAULT_ADVANCED_SEARCH_TITLE = "Advanced Search Criteria";
const DEFAULT_SUBMIT_BUTTON_TEXT = "Search";
const DEFAULT_CLEAR_BUTTON_TEXT = "Clear";
const DEFAULT_ADVANCED_TOGGLE_TEXT = "Advanced Search Options";
const SUBMITTING_TEXT = "Searching...";

// Move style content outside component - it never changes
const SLIDE_IN_STYLES = `
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
  .animate-slideIn {
    animation: slideIn 0.3s ease-out;
  }
`;

/**
 * SearchCriteriaPage Component - Performance Optimized
 * Reusable search criteria container with basic and advanced search options
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values and styles moved outside component
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handlers with useCallback
 * - Memoized sections (basic fields, advanced toggle, advanced fields, actions)
 * - Prevented unnecessary re-renders
 *
 * @param {React.ReactNode} basicSearchFields - Basic search form fields
 * @param {React.ReactNode} advancedSearchFields - Advanced search form fields (optional)
 * @param {string} advancedSearchTitle - Title for advanced search section
 * @param {function} onSubmit - Handler for form submission
 * @param {function} onClear - Handler for clearing the form
 * @param {boolean} isSubmitting - Whether form is currently submitting
 * @param {string} submitButtonText - Text for submit button
 * @param {string} clearButtonText - Text for clear button
 * @param {string} advancedToggleText - Text for advanced search toggle
 * @param {React.Component} submitIcon - Icon for submit button
 * @param {React.Component} clearIcon - Icon for clear button
 * @param {string} className - Additional CSS classes
 */
const SearchCriteriaPage = memo(function SearchCriteriaPage({
  basicSearchFields,
  advancedSearchFields,
  advancedSearchTitle = DEFAULT_ADVANCED_SEARCH_TITLE,
  onSubmit,
  onClear,
  isSubmitting = false,
  submitButtonText = DEFAULT_SUBMIT_BUTTON_TEXT,
  clearButtonText = DEFAULT_CLEAR_BUTTON_TEXT,
  advancedToggleText = DEFAULT_ADVANCED_TOGGLE_TEXT,
  submitIcon,
  clearIcon,
  className = ""
}) {
  const { getThemeClasses } = useUIXTheme();
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  // Memoize theme classes for consistent styling
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses('text-primary') || 'text-gray-800',
    textAccent: getThemeClasses('text-accent') || 'text-red-600',
    // Advanced search toggle button
    advancedToggleBorder: getThemeClasses('advanced-toggle-border') || 'border-red-200',
    advancedToggleBg: getThemeClasses('advanced-toggle-bg') || 'bg-red-50',
    advancedToggleHoverBg: getThemeClasses('advanced-toggle-hover-bg') || 'hover:bg-red-100',
    advancedToggleHoverBorder: getThemeClasses('advanced-toggle-hover-border') || 'hover:border-red-300',
    advancedToggleText: getThemeClasses('advanced-toggle-text') || 'text-red-700',
    // Advanced fields container
    advancedFieldsBg: getThemeClasses('advanced-fields-bg') || 'bg-gradient-to-br from-red-50 to-red-50',
    advancedFieldsBorder: getThemeClasses('advanced-fields-border') || 'border-red-200',
  }), [getThemeClasses]);

  // Memoize event handlers to prevent unnecessary re-renders
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(e);
      }
    },
    [onSubmit],
  );

  const handleClear = useCallback(() => {
    if (onClear) {
      onClear();
    }
  }, [onClear]);

  const toggleAdvanced = useCallback(() => {
    setIsAdvancedExpanded((prev) => !prev);
  }, []);

  // Memoize container className
  const containerClassName = useMemo(() => {
    return className ? `space-y-6 ${className}` : 'space-y-6';
  }, [className]);

  // Memoize chevron icon className
  const chevronClassName = useMemo(() => {
    return `ml-2 transition-transform duration-200 ${isAdvancedExpanded ? "rotate-180" : ""}`;
  }, [isAdvancedExpanded]);

  // Memoize submit button text
  const submitText = useMemo(() => {
    return isSubmitting ? SUBMITTING_TEXT : submitButtonText;
  }, [isSubmitting, submitButtonText]);

  // Memoize basic search fields section
  const basicFieldsSection = useMemo(() => {
    return (
      <div className="space-y-6">
        {basicSearchFields}
      </div>
    );
  }, [basicSearchFields]);

  // Memoize advanced toggle section
  const advancedToggleSection = useMemo(() => {
    if (!advancedSearchFields) return null;

    return (
      <div className="mb-6 sm:mb-8">
        <Button
          type="button"
          variant="secondary"
          onClick={toggleAdvanced}
          icon={RocketLaunchIcon}
          className={`border-2 ${themeClasses.advancedToggleBorder} ${themeClasses.advancedToggleBg} ${themeClasses.advancedToggleHoverBg} ${themeClasses.advancedToggleHoverBorder} ${themeClasses.advancedToggleText}`}
        >
          {advancedToggleText}
          <div className={chevronClassName}>
            <ChevronDownIcon className="h-5 w-5" />
          </div>
        </Button>
      </div>
    );
  }, [advancedSearchFields, advancedToggleText, chevronClassName, toggleAdvanced, themeClasses]);

  // Memoize advanced fields section
  const advancedFieldsSection = useMemo(() => {
    if (!isAdvancedExpanded || !advancedSearchFields) return null;

    return (
      <div className={`p-5 sm:p-6 ${themeClasses.advancedFieldsBg} rounded-xl border-2 ${themeClasses.advancedFieldsBorder} animate-slideIn`}>
        <h3 className={`text-base sm:text-lg font-bold ${themeClasses.textPrimary} mb-4 sm:mb-5 flex items-center`}>
          <div className="p-2 bg-white rounded-lg mr-2 shadow-sm">
            <SparklesIcon className={`h-5 w-5 ${themeClasses.textAccent}`} />
          </div>
          {advancedSearchTitle}
        </h3>
        <div className="space-y-5">
          {advancedSearchFields}
        </div>
      </div>
    );
  }, [isAdvancedExpanded, advancedSearchFields, advancedSearchTitle, themeClasses]);

  // Memoize actions section
  const actionsSection = useMemo(() => {
    return (
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={handleClear}
          icon={clearIcon}
        >
          {clearButtonText}
        </Button>
        <Button
          type="button"
          variant="primary"
          gradient={true}
          size="lg"
          loading={isSubmitting}
          icon={submitIcon}
          onClick={handleSubmit}
        >
          {submitText}
        </Button>
      </div>
    );
  }, [handleClear, clearIcon, clearButtonText, isSubmitting, submitIcon, handleSubmit, submitText]);

  return (
    <div className={containerClassName}>
      {basicFieldsSection}
      {advancedToggleSection}
      {advancedFieldsSection}
      {actionsSection}
      <style jsx>{SLIDE_IN_STYLES}</style>
    </div>
  );
});

// Set display name for React DevTools
SearchCriteriaPage.displayName = 'SearchCriteriaPage';

export default SearchCriteriaPage;