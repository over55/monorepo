// File Path: web/frontend/src/components/UIX/SelectionCard/SelectionCard.jsx
// UIX Mobile Optimizations Applied
// Reusable SelectionCard component for option selection

import React, { memo, useMemo, useCallback } from "react";
import {
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default values outside component to prevent recreation
const DEFAULT_TITLE = "Option Title";
const DEFAULT_DESCRIPTION = "Option description";
const DEFAULT_BUTTON_LABEL = "Select Option";
const DEFAULT_VARIANT = "primary";

/**
 * Reusable SelectionCard Component - Performance Optimized
 * A card component for presenting selectable options with consistent styling
 * Perfect for wizard steps that need option selection (like staff type, organization type, etc.)
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings to prevent re-concatenation
 * - Optimized event handler with useCallback
 * - Memoized sections (header icon, title icon, description, button)
 * - Memoized variant styles computation
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Theme-aware gradient header with icon
 * - Hover effects and animations
 * - Automatic theme color adaptation (blue/red themes)
 * - Click handling with selection feedback
 * - Responsive design
 * - Variant-based styling system
 *
 * @param {Object} props
 * @param {string} props.title - Card title
 * @param {string} props.description - Card description
 * @param {React.Component} props.icon - Icon component for the card
 * @param {string} props.buttonLabel - Label for the selection button
 * @param {function} props.onClick - Click handler for selection
 * @param {string} props.variant - Theme variant to use ("primary" or "secondary")
 * @param {boolean} props.disabled - Whether the card is disabled
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.id - Unique identifier for the button element
 */
const SelectionCard = memo(function SelectionCard({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  icon: Icon,
  buttonLabel = DEFAULT_BUTTON_LABEL,
  onClick = () => {},
  variant = DEFAULT_VARIANT,
  disabled = false,
  className = "",
  id,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      buttonPrimary: getThemeClasses('button-primary'),
      buttonSecondary: getThemeClasses('button-secondary'),
      bgGradientSecondary: getThemeClasses('bg-gradient-secondary'),
      linkPrimary: getThemeClasses('link-primary'),
      linkSecondary: getThemeClasses('link-secondary'),
      borderPrimary: getThemeClasses('border-primary'),
      bgCard: getThemeClasses('bg-card'),
      borderLight: getThemeClasses('border-light'),
      textPrimary: getThemeClasses('text-primary'),
      textSecondary: getThemeClasses('text-secondary'),
      bgDisabled: getThemeClasses('bg-disabled'),
      textDisabled: getThemeClasses('text-disabled'),
      borderMedium: getThemeClasses('border-medium'),
    }),
    [getThemeClasses],
  );

  // Memoize variant styles based on variant and theme classes
  const variantStyles = useMemo(() => {
    if (variant === "secondary") {
      return {
        buttonClasses: themeClasses.buttonSecondary,
        gradientClasses: themeClasses.bgGradientSecondary,
        iconColor: themeClasses.linkSecondary,
        hoverBorderColor: themeClasses.borderMedium,
      };
    }

    // primary variant (default)
    return {
      buttonClasses: themeClasses.buttonPrimary,
      gradientClasses: themeClasses.bgGradientSecondary,
      iconColor: themeClasses.linkPrimary,
      hoverBorderColor: themeClasses.borderMedium,
    };
  }, [variant, themeClasses]);

  // Memoize event handler to prevent unnecessary re-renders
  const handleClick = useCallback(() => {
    if (!disabled) {
      onClick();
    }
  }, [disabled, onClick]);

  // Memoize className strings with mobile optimizations
  const containerClassName = useMemo(() => {
    const baseClasses = 'relative group cursor-pointer transform transition-all duration-200 touch-manipulation select-none';
    const stateClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-[0.98]';
    return `${baseClasses} ${stateClasses} ${className}`;
  }, [disabled, className]);

  const cardClassName = useMemo(() => {
    const baseClasses = `${themeClasses.bgCard} border-2 ${themeClasses.borderLight} rounded-xl overflow-hidden shadow-lg transition-all duration-200`;
    const hoverClasses = disabled ? '' : 'hover:shadow-xl';
    const borderClasses = disabled ? '' : `hover:${variantStyles.hoverBorderColor}`;
    return `${baseClasses} ${hoverClasses} ${borderClasses}`;
  }, [disabled, variantStyles.hoverBorderColor, themeClasses]);

  const headerClassName = useMemo(() => {
    return `p-6 sm:p-8 text-center ${variantStyles.gradientClasses}`;
  }, [variantStyles.gradientClasses]);

  const titleIconClassName = useMemo(() => {
    return `w-5 h-5 mr-2 ${variantStyles.iconColor}`;
  }, [variantStyles.iconColor]);

  const buttonClassName = useMemo(() => {
    const baseClasses = 'w-full inline-flex items-center justify-center px-4 py-3 min-h-[44px] text-sm font-bold rounded-xl transition-all duration-200 transform hover:scale-105 touch-manipulation select-none active:scale-[0.98]';
    const stateClasses = disabled
      ? `${themeClasses.bgDisabled} ${themeClasses.textDisabled} cursor-not-allowed`
      : variantStyles.buttonClasses;
    return `${baseClasses} ${stateClasses}`;
  }, [disabled, variantStyles.buttonClasses, themeClasses]);

  // Memoize header icon section
  const headerIconSection = useMemo(() => {
    if (!Icon) return null;

    return (
      <div className="bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto flex items-center justify-center shadow-lg">
        <Icon className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
      </div>
    );
  }, [Icon]);

  // Memoize title icon section
  const titleIconSection = useMemo(() => {
    if (!Icon) return null;

    return <Icon className={titleIconClassName} />;
  }, [Icon, titleIconClassName]);

  // Memoize description section
  const descriptionSection = useMemo(() => {
    if (!description) return null;

    return (
      <p className={`text-sm sm:text-base ${themeClasses.textSecondary} text-center mb-4 leading-relaxed`}>
        {description}
      </p>
    );
  }, [description, themeClasses.textSecondary]);

  return (
    <div className={containerClassName} onClick={handleClick} style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div className={cardClassName}>
        {/* Gradient Header */}
        <div className={headerClassName}>
          {headerIconSection}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          <h3 className={`text-sm sm:text-lg font-bold ${themeClasses.textPrimary} mb-3 flex items-center justify-center`}>
            {titleIconSection}
            {title}
          </h3>
          {descriptionSection}
          <button
            id={id}
            className={buttonClassName}
            disabled={disabled}
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            {buttonLabel}
            <ArrowRightIcon className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
});

// Set display name for React DevTools
SelectionCard.displayName = 'SelectionCard';

export default SelectionCard;