// File Path: web/frontend/src/components/UIX/StepWizard/StepWizard.jsx
// UIX Mobile Optimizations Applied
// Reusable StepWizard component for multi-step processes

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";
import { DetailPageIcon } from "../";

// Move static default values outside component to prevent recreation
const DEFAULT_TITLE = "Add New Item";
const DEFAULT_CURRENT_STEP = 1;

/**
 * Reusable StepWizard Component - Performance Optimized
 * A complete wizard/step navigation component that integrates with our existing style guide
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized safe current step calculation
 * - Memoized progress percentage calculation
 * - Memoized sections (breadcrumb items, step indicators)
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Red gradient theme matching our design system
 * - Responsive design for mobile and desktop
 * - Progress indicator with step numbers and descriptions
 * - Mobile-optimized compact view
 * - Desktop horizontal step indicator
 * - Integrates with breadcrumb navigation
 * - Animated background elements
 *
 * @param {Object} props
 * @param {Array} props.steps - Array of step configurations
 * @param {number} props.currentStep - Current active step (1-based)
 * @param {string} props.title - Main wizard title
 * @param {string} props.subtitle - Wizard subtitle/description
 * @param {React.Component} props.icon - Icon component for header
 * @param {Array} props.breadcrumbItems - Breadcrumb navigation items
 * @param {React.Node} props.children - Step content to render
 * @param {string} props.className - Additional CSS classes
 */
const StepWizard = memo(function StepWizard({
  steps = [],
  currentStep = DEFAULT_CURRENT_STEP,
  title = DEFAULT_TITLE,
  subtitle = "",
  icon: Icon,
  breadcrumbItems = [],
  children,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      breadcrumbInactive: getThemeClasses('breadcrumb-inactive'),
      breadcrumbActive: getThemeClasses('breadcrumb-active'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
      textMuted: getThemeClasses('text-muted') || 'text-gray-400',
      buttonPrimary: getThemeClasses('button-primary'),
      linkPrimary: getThemeClasses('link-primary'),
      progressBarBg: getThemeClasses('progress-bar-bg'),
      progressBarFill: getThemeClasses('progress-bar-fill'),
      stepInactive: getThemeClasses('step-inactive'),
      stepInactiveText: getThemeClasses('step-inactive-text'),
    }),
    [getThemeClasses],
  );

  // Ensure currentStep is within bounds - memoized for performance
  const safeCurrentStep = useMemo(() =>
    Math.max(1, Math.min(currentStep, steps.length)),
    [currentStep, steps.length]
  );

  // Calculate progress percentage - memoized to prevent expensive recalculation
  const progressPercentage = useMemo(() => {
    const completedSteps = steps.filter(step => step.isCompleted).length;
    return (completedSteps / Math.max(steps.length - 1, 1)) * 100;
  }, [steps]);

  return (
    <div className={`min-h-screen ${className}`}>
      <div className="relative">
        {/* Breadcrumb Navigation */}
        {breadcrumbItems.length > 0 && (
          <nav className="flex mb-6 sm:mb-8 overflow-x-auto" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
              {breadcrumbItems.map((item, index) => (
                <li key={index} className={index === breadcrumbItems.length - 1 ? "inline-flex items-center" : ""}>
                  {index > 0 && <span className={`mx-1 sm:mx-2 ${themeClasses.textMuted}`}>/</span>}
                  {item.to ? (
                    <a
                      href={item.to}
                      className={`inline-flex items-center text-xs sm:text-sm font-medium ${themeClasses.breadcrumbInactive} whitespace-nowrap transition-colors`}
                    >
                      {item.icon && <item.icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />}
                      <span className={item.hideOnMobile ? "hidden sm:inline" : ""}>{item.label}</span>
                      {item.mobileLabel && <span className="sm:hidden">{item.mobileLabel}</span>}
                    </a>
                  ) : (
                    <span className={`text-xs sm:text-sm font-medium inline-flex items-center whitespace-nowrap ${
                      item.isActive ? themeClasses.breadcrumbActive : themeClasses.textMuted
                    }`}>
                      {item.icon && <item.icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />}
                      <span className={item.hideOnMobile ? "hidden sm:inline" : ""}>{item.label}</span>
                      {item.mobileLabel && <span className="sm:hidden">{item.mobileLabel}</span>}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* Page Header - Matching SearchForm Style */}
        <div className="mb-8 sm:mb-10 max-w-7xl mx-auto">
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-start lg:justify-between lg:space-y-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-start">
                {Icon && (
                  <DetailPageIcon icon={Icon} size="lg" />
                )}
                <div className="text-center lg:text-left">
                  <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.textPrimary} leading-tight`}>
                    {title}
                  </h1>
                  {subtitle && (
                    <p className={`mt-2 text-base sm:text-lg lg:text-xl ${themeClasses.textSecondary} font-medium`}>
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Step Progress - Horizontal dots */}
        {steps.length > 0 && (
          <div className="mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-start relative">
              {steps.map((step, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === safeCurrentStep;
                const isCompleted = step.isCompleted;
                const stepLabel = step.title;

                return (
                  <div key={step.id || index} className="flex flex-col items-center relative z-10">
                    {/* Step Circle */}
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base font-medium transition-all duration-200 ${
                        isActive
                          ? `bg-white ${themeClasses.breadcrumbActive} border-2 shadow-md`
                          : isCompleted
                          ? `${themeClasses.buttonPrimary} text-white shadow-md`
                          : `${themeClasses.stepInactive} ${themeClasses.stepInactiveText}`
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        stepNumber
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="mt-2 text-center">
                      <span
                        className={`text-xs sm:text-sm font-medium transition-all duration-200 ${
                          isActive ? themeClasses.breadcrumbActive : isCompleted ? themeClasses.linkPrimary : themeClasses.textMuted
                        }`}
                      >
                        {stepLabel}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Continuous connector line behind circles */}
              <div className={`absolute top-4 sm:top-5 left-0 right-0 h-0.5 ${themeClasses.progressBarBg} z-0`}>
                <div
                  className={`h-full ${themeClasses.progressBarFill} transition-all duration-300 ease-in-out`}
                  style={{
                    width: `${progressPercentage}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}



        {/* Step Content */}
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>

    </div>
  );
});

// Set display name for React DevTools
StepWizard.displayName = 'StepWizard';

export default StepWizard;