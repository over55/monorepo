// File: src/components/UI/Form/FormSection.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * FormSection Component - Performance Optimized
 * Section container with title, icon, and description
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Memoized sub-elements to prevent re-renders
 * - Optimized className concatenation
 * - Children processing optimization
 * - Early return for empty sections
 *
 * @param {string} title - Section title
 * @param {string} description - Section description
 * @param {React.Component} icon - Icon component to display next to title
 * @param {React.ReactNode} children - Section content
 * @param {string} className - Additional CSS classes
 */
const FormSection = memo(function FormSection({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}) {
  const { getThemeClasses } = useUIXTheme();
  // Memoize container className - all hooks MUST be before any conditional returns
  const containerClassName = useMemo(() => {
    const baseClass = "mb-8";
    return className ? `${baseClass} ${className}` : baseClass;
  }, [className]);

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      title: getThemeClasses("info-card-content-text"),
      description: getThemeClasses("info-card-content-text-secondary"),
      icon: getThemeClasses("info-card-content-icon"),
    }),
    [getThemeClasses],
  );

  // Memoize title element
  const titleElement = useMemo(() => {
    if (!title) return null;

    return (
      <h3 className={`text-lg font-medium ${themeClasses.title} mb-2 flex items-center`}>
        {Icon && <Icon className={`w-5 h-5 mr-2 ${themeClasses.icon}`} />}
        {title}
      </h3>
    );
  }, [title, Icon, themeClasses]);

  // Memoize description element
  const descriptionElement = useMemo(() => {
    if (!description) return null;

    return <p className={`text-sm ${themeClasses.description} mb-4`}>{description}</p>;
  }, [description, themeClasses]);

  // Memoize children wrapper with space-y-4 styling
  const childrenWrapper = useMemo(() => {
    if (!children) return null;

    // Process children to handle arrays and filter out null values
    let processedChildren = children;

    if (Array.isArray(children)) {
      // Use React.Children.toArray for proper key handling and filtering
      processedChildren = React.Children.toArray(children).filter(Boolean);

      // If no valid children after filtering, return null
      if (processedChildren.length === 0) {
        return null;
      }
    }

    return <div className="space-y-4">{processedChildren}</div>;
  }, [children]);

  // Early return AFTER all hooks if completely empty section
  if (!title && !description && !children) {
    return null;
  }

  return (
    <div className={containerClassName}>
      {titleElement}
      {descriptionElement}
      {childrenWrapper}
    </div>
  );
});

// Set display name for React DevTools
FormSection.displayName = "FormSection";

export default FormSection;
