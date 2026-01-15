// File Path: web/frontend/src/components/UIX/WizardSearchStep/WizardSearchStep.jsx
// UIX Mobile Optimizations Applied
// Reusable WizardSearchStep component combining StepWizard + SearchStepPage

import React, { memo, useMemo } from "react";
import {
  StepWizard,
  SearchStepPage,
} from "../";

// Move static default values outside component to prevent recreation
const DEFAULT_WIZARD_TITLE = "Add New Item";
const DEFAULT_CURRENT_STEP = 1;
const DEFAULT_ENTITY_NAME = "item";

/**
 * Reusable WizardSearchStep Component - Performance Optimized
 * A complete wizard search step that combines StepWizard navigation with SearchStepPage form
 * Perfect for step 1 of any add/create wizard that needs to search for existing items first
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized capitalized entity name computation
 * - Memoized default label computations
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Complete wizard navigation with step progress
 * - Search form with configurable fields
 * - Three-button layout: Cancel, Search, Skip Search
 * - Red gradient theme integration
 * - Responsive design
 * - Form validation and error handling
 * - No breadcrumbs (wizard-focused navigation)
 *
 * @param {Object} props
 * @param {Array} props.wizardSteps - Array of wizard step configurations
 * @param {number} props.currentStep - Current active step (default: 1)
 * @param {string} props.wizardTitle - Main wizard title
 * @param {React.Component} props.wizardIcon - Icon component for wizard header
 * @param {Object} props.formData - Current form data object
 * @param {function} props.onFormDataChange - Handler for form data changes
 * @param {Array} props.searchFields - Array of search field configurations
 * @param {Object} props.errors - Error state object
 * @param {function} props.onSearch - Search form submission handler
 * @param {function} props.onCancel - Cancel handler
 * @param {function} props.onSkipSearch - Skip search handler
 * @param {string} props.searchTitle - Search section title
 * @param {string} props.searchSubtitle - Search section subtitle
 * @param {string} props.searchButtonLabel - Search button label
 * @param {string} props.skipButtonLabel - Skip button label
 * @param {string} props.skipDescription - Skip section description
 * @param {boolean} props.isLoading - Loading state
 * @param {React.Component} props.skipIcon - Icon for skip button
 * @param {string} props.entityName - Name of entity being created (e.g., "staff", "organization")
 * @param {string} props.className - Additional CSS classes
 */
const WizardSearchStep = memo(function WizardSearchStep({
  // Wizard props
  wizardSteps = [],
  currentStep = DEFAULT_CURRENT_STEP,
  wizardTitle = DEFAULT_WIZARD_TITLE,
  wizardIcon,

  // Form props
  formData = {},
  onFormDataChange = () => {},
  searchFields = [],
  errors = {},
  onSearch = () => {},
  onCancel = () => {},
  onSkipSearch = () => {},

  // Content customization
  searchTitle,
  searchSubtitle,
  searchButtonLabel,
  skipButtonLabel,
  skipDescription,
  entityName = DEFAULT_ENTITY_NAME,

  // UI props
  isLoading = false,
  skipIcon,
  className = "",
}) {
  // Memoize capitalized entity name to avoid recalculation
  const capitalizedEntityName = useMemo(() => {
    return entityName.charAt(0).toUpperCase() + entityName.slice(1);
  }, [entityName]);

  // Memoize default labels to prevent unnecessary recalculations
  const defaultLabels = useMemo(() => {
    return {
      searchTitle: searchTitle || `Search for Existing ${capitalizedEntityName}`,
      searchSubtitle: searchSubtitle || `Check for existing ${entityName} in the system`,
      searchButtonLabel: searchButtonLabel || `Search ${capitalizedEntityName}`,
      skipButtonLabel: skipButtonLabel || `Add New ${capitalizedEntityName}`,
      skipDescription: skipDescription || `If you're sure this is a new ${entityName}, skip the search and proceed directly to creation`
    };
  }, [searchTitle, searchSubtitle, searchButtonLabel, skipButtonLabel, skipDescription, entityName, capitalizedEntityName]);

  return (
    <div className={className}>
      <StepWizard
        steps={wizardSteps}
        currentStep={currentStep}
        title={wizardTitle}
        icon={wizardIcon}
      >
        <SearchStepPage
          formData={formData}
          onFormDataChange={onFormDataChange}
          fields={searchFields}
          errors={errors}
          onSearch={onSearch}
          onCancel={onCancel}
          onSkipSearch={onSkipSearch}
          searchTitle={defaultLabels.searchTitle}
          searchSubtitle={defaultLabels.searchSubtitle}
          searchButtonLabel={defaultLabels.searchButtonLabel}
          skipButtonLabel={defaultLabels.skipButtonLabel}
          skipDescription={defaultLabels.skipDescription}
          infoMessage=""
          isLoading={isLoading}
          showSectionTitles={false}
          skipIcon={skipIcon}
        />
      </StepWizard>
    </div>
  );
});

// Set display name for React DevTools
WizardSearchStep.displayName = 'WizardSearchStep';

export default WizardSearchStep;