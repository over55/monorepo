// File: src/components/UI/Divider/Divider.jsx
// UIX Mobile Optimizations Applied

import React, { useMemo, memo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Divider Component
 * Visual separator between content sections
 *
 * @param {string} className - Additional CSS classes
 * @param {string} text - Optional text to display in divider
 */
const Divider = memo(({ className = "", text = "" }) => {
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(
    () => ({
      inputBorder: getThemeClasses("input-border"),
      bgCard: getThemeClasses("bg-card"),
      textMuted: getThemeClasses("text-muted"),
    }),
    [getThemeClasses],
  );

  // Memoize container classes
  const containerClasses = useMemo(
    () => `relative ${className}`.trim(),
    [className],
  );

  // Memoize divider line classes
  const lineClasses = useMemo(
    () => `w-full border-t ${themeClasses.inputBorder}`,
    [themeClasses.inputBorder],
  );

  // Memoize text span classes
  const textClasses = useMemo(
    () => `px-2 ${themeClasses.bgCard} ${themeClasses.textMuted}`,
    [themeClasses.bgCard, themeClasses.textMuted],
  );

  // Memoize the text container
  const textContainer = useMemo(() => {
    if (!text) return null;

    return (
      <div className="relative flex justify-center text-sm">
        <span className={textClasses}>{text}</span>
      </div>
    );
  }, [text, textClasses]);

  return (
    <div className={containerClasses}>
      <div className="absolute inset-0 flex items-center">
        <div className={lineClasses} />
      </div>
      {textContainer}
    </div>
  );
});

// Add display name for better debugging
Divider.displayName = "Divider";

export default Divider;
