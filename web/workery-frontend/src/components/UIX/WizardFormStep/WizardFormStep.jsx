// File Path: web/frontend/src/components/UIX/WizardFormStep/WizardFormStep.jsx
// UIX Mobile Optimizations Applied
// Reusable WizardFormStep component for multi-step wizard forms (Staff, Customer, Associate, Order)

import React, { memo, useMemo, useCallback } from "react";
import {
  StepWizard,
  FormCard,
  DetailPageIcon,
  UIXThemeProvider,
} from "../";
import Button from "../Button/Button";
import {
  ArrowLeftIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values outside component to prevent recreation
const DEFAULT_WIZARD_TITLE = "Add New Item";
const DEFAULT_STEP_TITLE = "Step Title";
const DEFAULT_BACK_LABEL = "Back";
const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_ACTION_LAYOUT = "center";
const DEFAULT_CONTENT_MAX_WIDTH = "4xl";
const LOADING_TEXT = "Loading...";

/**
 * Reusable WizardFormStep Component - Performance Optimized
 * A complete wizard form step that combines StepWizard navigation with flexible content areas
 * Perfect for wizard steps that need forms, selections, or other interactive content (Staff, Customer, Associate, Order)
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized default actions computation
 * - Memoized action layout classes computation
 * - Memoized ContentWrapper component
 * - Memoized sections (error display, loading state, actions)
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Complete wizard navigation with step progress (no breadcrumbs)
 * - Flexible content area that can contain forms, selection cards, or any content
 * - Optional FormCard integration for consistent styling
 * - Action buttons with customizable layout
 * - Red gradient theme integration matching other wizard components
 * - Responsive design with mobile optimization
 * - Error handling and loading states
 * - Back navigation support
 *
 * @param {Object} props
 * @param {Array} props.wizardSteps - Array of wizard step configurations
 * @param {number} props.currentStep - Current active step
 * @param {string} props.wizardTitle - Main wizard title
 * @param {React.Component} props.wizardIcon - Icon component for wizard header
 * @param {string} props.stepTitle - Title for the current step content
 * @param {string} props.stepSubtitle - Subtitle for the current step content
 * @param {React.Component} props.stepIcon - Icon for the step content header
 * @param {React.Node} props.children - Main content for the step
 * @param {Object} props.errors - Error state object
 * @param {boolean} props.isLoading - Loading state
 * @param {Array} props.actions - Array of action button configurations
 * @param {function} props.onBack - Back navigation handler
 * @param {function} props.onCancel - Cancel handler
 * @param {string} props.backLabel - Label for back button
 * @param {string} props.cancelLabel - Label for cancel button
 * @param {boolean} props.showFormCard - Whether to wrap content in FormCard
 * @param {boolean} props.showActions - Whether to show action buttons
 * @param {string} props.actionLayout - Layout for actions ("center", "between", "end")
 * @param {string} props.contentMaxWidth - Max width for content area
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * // Selection step (like entity type selection)
 * <WizardFormStep
 *   wizardSteps={wizardSteps}
 *   currentStep={2}
 *   wizardTitle="Add New Item"
 *   wizardIcon={UserPlusIcon}
 *   stepTitle="Select Type"
 *   stepSubtitle="Choose the type"
 *   stepIcon={UserIcon}
 *   showFormCard={true}
 *   actionLayout="center"
 *   onCancel={handleCancel}
 *   onBack={handleBack}
 * >
 *   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 *     {typeOptions.map(option => (
 *       <SelectionCard key={option.value} {...option} />
 *     ))}
 *   </div>
 * </WizardFormStep>
 */
const WizardFormStep = memo(function WizardFormStep({
  // Wizard props
  wizardSteps = [],
  currentStep = 1,
  wizardTitle = DEFAULT_WIZARD_TITLE,
  wizardIcon,

  // Step content props
  stepTitle = DEFAULT_STEP_TITLE,
  stepSubtitle = "",
  stepIcon,
  children,

  // State props
  errors = {},
  isLoading = false,

  // Action props
  actions = [],
  onBack = () => {},
  onCancel = () => {},
  backLabel = DEFAULT_BACK_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,

  // Layout props
  showFormCard = true,
  showActions = true,
  actionLayout = DEFAULT_ACTION_LAYOUT,
  contentMaxWidth = DEFAULT_CONTENT_MAX_WIDTH,

  // Style props
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      borderPrimary: getThemeClasses('border-primary'),
      bgCard: getThemeClasses('bg-card'),
      cardBorder: getThemeClasses('card-border'),
      shadowCard: getThemeClasses('shadow-card'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
      borderLight: getThemeClasses('border-light') || 'border-gray-200',
      borderMedium: getThemeClasses('border-medium') || 'border-gray-300',
      alertErrorBg: getThemeClasses('alert-error-bg') || 'bg-red-50',
      alertErrorBorder: getThemeClasses('alert-error-border') || 'border-red-200',
      alertErrorText: getThemeClasses('alert-error-text') || 'text-red-700',
      textDanger: getThemeClasses('text-danger') || 'text-red-600',
    }),
    [getThemeClasses],
  );

  // Memoize default actions - prevent re-renders
  const defaultActions = useMemo(() => showActions ? [
    {
      label: cancelLabel,
      variant: "outline",
      icon: XMarkIcon,
      onClick: onCancel,
    }
  ] : [], [showActions, cancelLabel, onCancel]);

  // Memoize final actions list
  const allActions = useMemo(() => {
    return actions.length > 0 ? actions : defaultActions;
  }, [actions, defaultActions]);

  // Action layout classes - memoized to prevent re-renders
  const getActionLayoutClasses = useCallback(() => {
    switch (actionLayout) {
      case "between":
        return "flex justify-between items-center";
      case "end":
        // When back button is included, we want space between back and action buttons
        return onBack ? "flex justify-between items-center" : "flex justify-end items-center space-x-3";
      case "center":
      default:
        return "flex justify-center items-center space-x-3";
    }
  }, [actionLayout, onBack]);

  // Content wrapper - memoized to prevent re-renders
  const ContentWrapper = useCallback(({ children: contentChildren }) => {
    if (showFormCard) {
      return (
        <FormCard
          title={stepTitle}
          subtitle={stepSubtitle}
          icon={stepIcon}
          maxWidth="7xl"
        >
          <div className={`max-w-${contentMaxWidth} mx-auto`}>
            {contentChildren}
          </div>
        </FormCard>
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        <div className={`${themeClasses.bgCard} ${themeClasses.shadowCard} rounded-2xl overflow-hidden border ${themeClasses.cardBorder} hover:shadow-2xl transition-shadow duration-300`}>
          {/* Header Section */}
          <div className={`px-6 sm:px-8 py-6 border-b ${themeClasses.cardBorder}`}>
            <div className="flex items-start">
              {stepIcon && (
                <DetailPageIcon icon={stepIcon} size="lg" />
              )}
              <div>
                <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} leading-tight`}>
                  {stepTitle}
                </h2>
                {stepSubtitle && (
                  <p className={`mt-2 text-base sm:text-lg ${themeClasses.textSecondary} font-medium`}>
                    {stepSubtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-6 sm:p-8">
            <div className={`max-w-${contentMaxWidth} mx-auto`}>
              {contentChildren}
            </div>
          </div>
        </div>
      </div>
    );
  }, [showFormCard, stepTitle, stepSubtitle, stepIcon, contentMaxWidth, themeClasses]);

  return (
    <UIXThemeProvider>
      <div className={className}>
        <StepWizard
        steps={wizardSteps}
        currentStep={currentStep}
        title={wizardTitle}
        icon={wizardIcon}
      >
        {/* Error Display */}
        {errors.message && (
          <div className="mb-6 max-w-7xl mx-auto">
            <div className={`${themeClasses.alertErrorBg} border ${themeClasses.alertErrorBorder} ${themeClasses.alertErrorText} px-4 py-3 rounded-lg`}>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                  {errors.message}
                </span>
                <button
                  id="error-message-close"
                  onClick={() => {}}
                  className={`${themeClasses.textDanger} hover:opacity-80 ml-2 flex-shrink-0`}
                  aria-label="Close error message"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <ContentWrapper>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${themeClasses.borderPrimary}`}></div>
              <span className={`ml-3 ${themeClasses.textSecondary}`}>{LOADING_TEXT}</span>
            </div>
          ) : (
            <>
              {children}

              {/* Action Buttons */}
              {showActions && allActions.length > 0 && (
                <div className={`mt-8 pt-6 border-t ${themeClasses.borderLight} ${getActionLayoutClasses()}`}>
                  {/* Back Button (when actionLayout is "end" or "between") */}
                  {onBack && (actionLayout === "end" || actionLayout === "between") && (
                    <Button
                      id="wizard-back-button"
                      variant="outline"
                      size="md"
                      onClick={onBack}
                      icon={ArrowLeftIcon}
                    >
                      {backLabel}
                    </Button>
                  )}

                  {/* Action Buttons Group */}
                  <div className="flex items-center space-x-3">
                    {allActions.map((action, index) => (
                      <Button
                        key={index}
                        id={`wizard-action-button-${index}`}
                        variant={action.variant || "primary"}
                        size={action.size || "md"}
                        onClick={action.onClick}
                        icon={action.icon}
                        disabled={action.disabled || isLoading}
                        loading={action.loading}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Back Navigation (when actionLayout is "center" or back button not in action row) */}
              {onBack && actionLayout === "center" && (
                <div className={`mt-6 pt-4 border-t ${themeClasses.borderLight}`}>
                  <Button
                    id="wizard-center-back-button"
                    variant="outline"
                    size="md"
                    onClick={onBack}
                    icon={ArrowLeftIcon}
                  >
                    {backLabel}
                  </Button>
                </div>
              )}
            </>
          )}
        </ContentWrapper>
        </StepWizard>
      </div>
    </UIXThemeProvider>
  );
});

// Set display name for React DevTools
WizardFormStep.displayName = 'WizardFormStep';

// Export as both WizardFormStep and StaffWizardFormStep for backward compatibility
export default WizardFormStep;
export { WizardFormStep as StaffWizardFormStep };