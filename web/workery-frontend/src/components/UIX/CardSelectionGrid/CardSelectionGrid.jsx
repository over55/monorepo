// File: src/components/UIX/CardSelectionGrid/CardSelectionGrid.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, memo } from "react";
import { SelectionCard } from "../";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Reusable CardSelectionGrid Component - Performance Optimized Version
 *
 * Performance optimizations:
 * - Component memoization to prevent unnecessary re-renders
 * - useMemo for expensive computations
 * - useCallback for stable function references
 * - Proper key generation for list items
 * - Optimized re-render conditions
 */
const CardSelectionGrid = memo(
  ({
    options = [],
    layout = "4-card",
    selectedValue = null,
    onFormatSelectedLabel = (value) => value,
    isLoading = false,
    variant = "primary",
    showSelectionStatus = true,
    className = "",
  }) => {
    const { getThemeClasses } = useUIXTheme();

    // Memoize grid classes to prevent recalculation on every render
    const gridClasses = useMemo(() => {
      switch (layout) {
        case "2-card":
          return "grid grid-cols-1 md:grid-cols-2 gap-4";
        case "4-card":
        default:
          return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4";
      }
    }, [layout]);

    // Memoize formatted selected label to prevent recalculation
    const formattedSelectedLabel = useMemo(() => {
      if (!selectedValue) return "";
      return onFormatSelectedLabel(selectedValue);
    }, [selectedValue, onFormatSelectedLabel]);

    // Memoize theme classes for selection status
    const selectionStatusClasses = useMemo(
      () => ({
        container: `mb-6 p-4 rounded-lg flex items-center ${getThemeClasses("success-bg")} ${getThemeClasses("success-border")} border`,
        text: `text-sm ${getThemeClasses("success-text")}`,
      }),
      [getThemeClasses],
    );

    // Memoize processed options to prevent recalculation on every render
    const processedOptions = useMemo(() => {
      return options.map((option, index) => ({
        ...option,
        variant: option.variant || variant,
        // Generate stable unique key
        uniqueKey: option.key || option.title || `option-${option.id || index}`,
        // Generate stable ID
        uniqueId:
          option.title?.toLowerCase().replace(/\s+/g, "-") ||
          `option-${option.id || index}`,
      }));
    }, [options, variant]);

    // Memoize the selection status component
    const SelectionStatus = useMemo(() => {
      if (!showSelectionStatus || !selectedValue) return null;

      return (
        <div className={selectionStatusClasses.container}>
          <span className={selectionStatusClasses.text}>
            Selected: <strong>{formattedSelectedLabel}</strong>
            {isLoading && " - Saving..."}
          </span>
        </div>
      );
    }, [
      showSelectionStatus,
      selectedValue,
      formattedSelectedLabel,
      isLoading,
      selectionStatusClasses,
    ]);

    return (
      <div className={className}>
        {/* Selection Status */}
        {SelectionStatus}

        {/* Selection Cards Grid */}
        <div className={gridClasses}>
          {processedOptions.map((option) => (
            <MemoizedSelectionCard
              key={option.uniqueKey}
              id={`selection-card-${option.uniqueId}`}
              title={option.title}
              description={option.description || ""}
              icon={option.icon}
              buttonLabel={option.buttonLabel}
              onClick={option.onClick}
              variant={option.variant}
              disabled={isLoading || option.disabled}
            />
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    // Only re-render if these specific props change
    return (
      prevProps.selectedValue === nextProps.selectedValue &&
      prevProps.isLoading === nextProps.isLoading &&
      prevProps.layout === nextProps.layout &&
      prevProps.variant === nextProps.variant &&
      prevProps.showSelectionStatus === nextProps.showSelectionStatus &&
      prevProps.className === nextProps.className &&
      prevProps.options?.length === nextProps.options?.length &&
      // Reference comparison for options (contains icon components)
      prevProps.options === nextProps.options
    );
  },
);

// Memoize SelectionCard to prevent unnecessary re-renders
const MemoizedSelectionCard = memo(SelectionCard, (prevProps, nextProps) => {
  return (
    prevProps.id === nextProps.id &&
    prevProps.title === nextProps.title &&
    prevProps.description === nextProps.description &&
    prevProps.icon === nextProps.icon &&
    prevProps.buttonLabel === nextProps.buttonLabel &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.variant === nextProps.variant &&
    prevProps.disabled === nextProps.disabled
  );
});

// Display name for debugging
CardSelectionGrid.displayName = "CardSelectionGrid";
MemoizedSelectionCard.displayName = "MemoizedSelectionCard";

export default CardSelectionGrid;
