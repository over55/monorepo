// File Path: monorepo/web/frontend/src/components/business/displays/TagsDisplay.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useTagManager } from "../../../services/Services";
import { Badge, Loading, useUIXTheme } from "../../UIX";

/**
 * Display component for multiple selected tags
 * Fetches tag labels from API based on the stored IDs
 *
 * @param {Array} values - Array of tag IDs
 * @param {string} label - Custom label (defaults to "Tags")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} variant - Badge variant for display
 * @param {string} size - Size variant: "sm", "md", "lg" (defaults to "md")
 */
function TagsDisplay({
  values = [],
  label = "Tags",
  className = "",
  onUnauthorized = null,
  variant = "success",
  size = "md",
}) {
  const { getThemeClasses } = useUIXTheme();
  const tagManager = useTagManager();
  const [displayTags, setDisplayTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Size classes configuration
  const sizeClasses = {
    sm: { label: "text-sm", badge: "sm", empty: "text-sm", gap: "gap-1.5" },
    md: { label: "text-sm sm:text-base", badge: "md", empty: "text-sm sm:text-base", gap: "gap-2" },
    lg: { label: "text-base sm:text-lg", badge: "lg", empty: "text-base sm:text-lg", gap: "gap-2.5" },
  };
  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Memoize stringified values to use as a stable dependency for detecting array changes
  const valuesKey = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    let mounted = true;

    const fetchDisplayValues = async () => {
      // Debug logging
      if (import.meta.env.DEV) {
        console.log("TagsDisplay - values received:", values);
        console.log("TagsDisplay - values type:", typeof values);
        console.log("TagsDisplay - is array?:", Array.isArray(values));
      }

      // Handle null, undefined, or empty cases
      if (
        !values ||
        (Array.isArray(values) && values.length === 0) ||
        values === "" ||
        values === null ||
        values === undefined
      ) {
        if (import.meta.env.DEV) {
          console.log("TagsDisplay - No values to display");
        }
        setDisplayTags([]);
        return;
      }

      // Ensure values is an array
      const valueArray = Array.isArray(values) ? values : [values];

      // Filter out any empty, null, undefined, or zero values
      const filteredValues = valueArray.filter(
        (v) =>
          v !== null && v !== undefined && v !== "" && v !== 0 && v !== "0",
      );

      if (import.meta.env.DEV) {
        console.log("TagsDisplay - filtered values:", filteredValues);
      }

      if (filteredValues.length === 0) {
        setDisplayTags([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch tag options from the API/cache
        const options = await tagManager.getTagSelectOptions(onUnauthorized);

        if (import.meta.env.DEV) {
          console.log("TagsDisplay - fetched options:", options);
        }

        if (mounted && options) {
          // Map the IDs to their labels
          const mappedTags = filteredValues
            .map((tagId) => {
              // Ensure we're comparing as strings for consistency
              const tagIdStr = String(tagId);

              const matchingOption = options.find((opt) => {
                // Handle both 'value' and 'id' properties
                const optionId = String(opt.value || opt.id);
                return optionId === tagIdStr;
              });

              if (import.meta.env.DEV) {
                console.log(
                  `TagsDisplay - Mapping tag ID ${tagId}:`,
                  matchingOption,
                );
              }

              if (matchingOption) {
                return {
                  id: tagId,
                  label:
                    matchingOption.label ||
                    matchingOption.text ||
                    matchingOption.name,
                };
              } else {
                // Only show unknown if we have a valid ID
                if (tagIdStr && tagIdStr !== "undefined") {
                  if (import.meta.env.DEV) {
                    console.warn(
                      `TagsDisplay - No match found for tag ID: ${tagId}`,
                    );
                  }
                  return { id: tagId, label: `Unknown (ID: ${tagId})` };
                }
                return null;
              }
            })
            .filter(Boolean); // Remove any null values

          if (import.meta.env.DEV) {
            console.log("TagsDisplay - mapped tags:", mappedTags);
          }
          setDisplayTags(mappedTags);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching tag options:", error);
        }
        if (mounted) {
          setError("Failed to load tags");
          // Fallback to showing IDs only if we have valid values
          const fallbackTags = filteredValues.map((id) => ({
            id,
            label: `ID: ${id}`,
          }));
          setDisplayTags(fallbackTags);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDisplayValues();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- valuesKey is a memoized serialization of values to detect array content changes without triggering on reference changes
  }, [valuesKey, onUnauthorized, tagManager]);

  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <p className={`${currentSize.label} font-medium ${getThemeClasses("text-secondary")} mb-2`}>{label}</p>
        <div className="flex items-center">
          <Loading size={size === "lg" ? "md" : "sm"} text="Loading tags..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className={`${currentSize.label} font-medium ${getThemeClasses("text-secondary")} mb-2.5`}>{label}</p>
      <div className={`flex flex-wrap ${currentSize.gap}`}>
        {error ? (
          <span className={`text-red-600 ${currentSize.empty}`}>{error}</span>
        ) : displayTags.length > 0 ? (
          displayTags.map((tag) => (
            <Badge key={tag.id} variant={variant} size={currentSize.badge}>
              {tag.label}
            </Badge>
          ))
        ) : (
          <span className={`${getThemeClasses("text-muted")} ${currentSize.empty}`}>No tags selected</span>
        )}
      </div>
    </div>
  );
}

export default TagsDisplay;
