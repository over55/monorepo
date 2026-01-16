// File Path: web/workery-frontend/src/components/UIX/WizardAddOrSearchStep/WizardAddOrSearchStep.jsx
// Simplified wizard step that prioritizes "Add New" action over search

import React, { memo, useMemo, useState, useCallback } from "react";
import {
  StepWizard,
  FormCard,
  FormSection,
  FormRow,
  Input,
  Alert,
  Modal,
} from "../";
import Button from "../Button/Button";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import {
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Static default values
const DEFAULT_WIZARD_TITLE = "Add New Item";
const DEFAULT_CURRENT_STEP = 1;
const DEFAULT_ENTITY_NAME = "item";
const DEFAULT_MAX_WIDTH = "7xl";

/**
 * WizardAddOrSearchStep Component
 *
 * A simplified wizard step that prioritizes the "Add New" action.
 * The search functionality is collapsed by default and expands on user request.
 *
 * This addresses user confusion between searching and adding by making the
 * add action the primary, most prominent option.
 *
 * Features:
 * - Large, prominent "Add New" button as primary action
 * - Collapsible search section with h2-sized trigger link
 * - Smooth expand/collapse animation
 * - Same field configuration as WizardSearchStep for compatibility
 */
const WizardAddOrSearchStep = memo(function WizardAddOrSearchStep({
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
  onSkipSearch = () => {}, // This is now the primary action (Add New)

  // Content customization
  addButtonLabel,
  addButtonDescription,
  searchLinkText,
  searchButtonLabel,
  entityName = DEFAULT_ENTITY_NAME,

  // Cancel modal customization
  cancelModalTitle,
  cancelModalMessage,
  cancelConfirmLabel,
  cancelDenyLabel,

  // UI props
  isLoading = false,
  addIcon = PlusIcon,
  className = "",
}) {
  // Alias for JSX usage (must start with uppercase for React component)
  const AddIconComponent = addIcon;
  const { getThemeClasses } = useUIXTheme();
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Memoize capitalized entity name
  const capitalizedEntityName = useMemo(() => {
    return entityName.charAt(0).toUpperCase() + entityName.slice(1);
  }, [entityName]);

  // Memoize default labels
  const labels = useMemo(() => ({
    addButton: addButtonLabel || `Add New ${capitalizedEntityName}`,
    addDescription: addButtonDescription || `Create a new ${entityName} entry`,
    searchLink: searchLinkText || `Search for an existing ${entityName}`,
    searchButton: searchButtonLabel || `Search`,
    cancelModalTitle: cancelModalTitle || `Cancel ${capitalizedEntityName} Creation`,
    cancelModalMessage: cancelModalMessage || `Are you sure you want to cancel? Any information entered will be lost.`,
    cancelConfirm: cancelConfirmLabel || `Yes, Cancel`,
    cancelDeny: cancelDenyLabel || `No, Continue`,
  }), [addButtonLabel, addButtonDescription, searchLinkText, searchButtonLabel, entityName, capitalizedEntityName, cancelModalTitle, cancelModalMessage, cancelConfirmLabel, cancelDenyLabel]);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    borderPrimary: getThemeClasses('border-primary') || 'border-blue-600',
    linkPrimary: getThemeClasses('link-primary') || 'text-blue-600 hover:text-blue-800',
    borderMedium: getThemeClasses('border-medium') || 'border-gray-200',
    textMuted: getThemeClasses('text-muted') || 'text-gray-600',
    textSecondary: getThemeClasses('text-secondary') || 'text-gray-600',
    alertWarningIcon: getThemeClasses('alert-warning-icon') || 'text-amber-500',
  }), [getThemeClasses]);

  // Handle form submission
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSearch(formData);
  }, [onSearch, formData]);

  // Handle input changes
  const handleInputChange = useCallback((fieldName, value) => {
    onFormDataChange({ ...formData, [fieldName]: value });
  }, [onFormDataChange, formData]);

  // Handle key press for form submission
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Handle add new click (primary action)
  const handleAddNewClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof onSkipSearch === 'function') {
      onSkipSearch();
    }
  }, [onSkipSearch]);

  // Toggle search expansion
  const toggleSearch = useCallback(() => {
    setIsSearchExpanded(prev => !prev);
  }, []);

  // Handle cancel button click - show modal instead of canceling directly
  const handleCancelClick = useCallback(() => {
    setShowCancelModal(true);
  }, []);

  // Handle confirm cancel - close modal and call onCancel
  const handleConfirmCancel = useCallback(() => {
    setShowCancelModal(false);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  }, [onCancel]);

  // Group fields by section
  const fieldsBySection = useMemo(() =>
    searchFields.reduce((acc, field) => {
      const section = field.section || 'general';
      if (!acc[section]) acc[section] = [];
      acc[section].push(field);
      return acc;
    }, {}), [searchFields]);

  // Error alert section
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

  // Loading spinner
  const loadingSpinner = useMemo(() => {
    if (!isLoading) return null;
    return (
      <div className="flex items-center justify-center py-8">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${themeClasses.borderPrimary}`}></div>
        <span className={`ml-3 ${themeClasses.textMuted}`}>Searching...</span>
      </div>
    );
  }, [isLoading, themeClasses.borderPrimary, themeClasses.textMuted]);

  return (
    <div className={className}>
      <StepWizard
        steps={wizardSteps}
        currentStep={currentStep}
        title={wizardTitle}
        icon={wizardIcon}
      >
        {errorAlertSection}

        <FormCard
          title={wizardTitle}
          subtitle={`Step ${currentStep}: Get started`}
          icon={wizardIcon}
          maxWidth={DEFAULT_MAX_WIDTH}
        >
          <div className="space-y-8">
            {/* Primary Action: Add New Button */}
            <div className="text-center py-6">
              <Button
                onClick={handleAddNewClick}
                variant="success"
                size="xl"
                className="px-16 py-5 !text-xl sm:!text-2xl font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <span className="inline-flex items-center gap-3">
                  <AddIconComponent className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" aria-hidden="true" />
                  <span>{labels.addButton}</span>
                </span>
              </Button>
              <p className={`mt-3 text-sm ${themeClasses.textMuted}`}>
                {labels.addDescription}
              </p>
            </div>

            {/* OR Divider */}
            <div className="flex items-center gap-4">
              <div className={`flex-1 border-t ${themeClasses.borderMedium}`}></div>
              <span className={`text-xl font-bold ${themeClasses.textSecondary}`}>OR</span>
              <div className={`flex-1 border-t ${themeClasses.borderMedium}`}></div>
            </div>

            {/* Collapsible Search Section */}
            <div>
              {/* Search Toggle Link */}
              <button
                type="button"
                onClick={toggleSearch}
                className={`w-full flex items-center justify-center gap-2 text-xl font-semibold ${themeClasses.linkPrimary} transition-colors cursor-pointer py-2`}
              >
                <MagnifyingGlassIcon className="w-6 h-6" />
                <span>{labels.searchLink}</span>
                {isSearchExpanded ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </button>

              {/* Expandable Search Form */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isSearchExpanded ? 'max-h-[1000px] opacity-100 mt-6' : 'max-h-0 opacity-0'
                }`}
              >
                {loadingSpinner || (
                  <form onSubmit={handleSubmit}>
                    {/* Dynamic Form Sections */}
                    {Object.entries(fieldsBySection).map(([sectionName, sectionFields]) => (
                      <FormSection key={sectionName}>
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

                    {/* Search Actions */}
                    <div className={`flex justify-center gap-4 pt-6 border-t ${themeClasses.borderMedium}`}>
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isLoading}
                        icon={MagnifyingGlassIcon}
                        loading={isLoading}
                        loadingText="Searching..."
                      >
                        {labels.searchButton}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Cancel Button */}
            <div className={`border-t ${themeClasses.borderMedium} pt-6`}>
              <div className="flex justify-start">
                <Button
                  variant="outline"
                  onClick={handleCancelClick}
                  icon={ArrowLeftIcon}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </FormCard>
      </StepWizard>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title={labels.cancelModalTitle}
        size="sm"
      >
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className={`w-6 h-6 ${themeClasses.alertWarningIcon} flex-shrink-0 mt-0.5`} />
            <p className={`text-base ${themeClasses.textMuted}`}>
              {labels.cancelModalMessage}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              {labels.cancelDeny}
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              className="flex-1"
            >
              {labels.cancelConfirm}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
});

WizardAddOrSearchStep.displayName = 'WizardAddOrSearchStep';

export default WizardAddOrSearchStep;
