// File: web/workery-frontend/src/components/Display/TagsDisplay.jsx

import React, { useState, useEffect } from "react";
import { useTagManager } from "../../services/Services";
import { Badge, Loading } from "../UI";

/**
 * Display component for multiple selected tags
 * Fetches tag labels from API based on the stored IDs
 *
 * @param {Array} values - Array of tag IDs
 * @param {string} label - Custom label (defaults to "Tags")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} variant - Badge variant for display
 */
function TagsDisplay({
  values = [],
  label = "Tags",
  className = "",
  onUnauthorized = null,
  variant = "success",
}) {
  const tagManager = useTagManager();
  const [displayTags, setDisplayTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchDisplayValues = async () => {
      // Debug logging
      console.log("TagsDisplay - values received:", values);
      console.log("TagsDisplay - values type:", typeof values);
      console.log("TagsDisplay - is array?:", Array.isArray(values));

      // Handle null, undefined, or empty cases
      if (
        !values ||
        (Array.isArray(values) && values.length === 0) ||
        values === "" ||
        values === null ||
        values === undefined
      ) {
        console.log("TagsDisplay - No values to display");
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

      console.log("TagsDisplay - filtered values:", filteredValues);

      if (filteredValues.length === 0) {
        setDisplayTags([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch tag options from the API/cache
        const options = await tagManager.getTagSelectOptions(onUnauthorized);

        console.log("TagsDisplay - fetched options:", options);

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

              console.log(
                `TagsDisplay - Mapping tag ID ${tagId}:`,
                matchingOption,
              );

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
                  console.warn(
                    `TagsDisplay - No match found for tag ID: ${tagId}`,
                  );
                  return { id: tagId, label: `Unknown (ID: ${tagId})` };
                }
                return null;
              }
            })
            .filter(Boolean); // Remove any null values

          console.log("TagsDisplay - mapped tags:", mappedTags);
          setDisplayTags(mappedTags);
        }
      } catch (error) {
        console.error("Error fetching tag options:", error);
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
  }, [JSON.stringify(values), onUnauthorized]); // Use stringified values to detect array changes

  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
        <div className="flex items-center">
          <Loading size="sm" text="Loading tags..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {error ? (
          <span className="text-red-600 text-sm">{error}</span>
        ) : displayTags.length > 0 ? (
          displayTags.map((tag) => (
            <Badge key={tag.id} variant={variant} size="md">
              {tag.label}
            </Badge>
          ))
        ) : (
          <span className="text-gray-400 text-sm">No tags selected</span>
        )}
      </div>
    </div>
  );
}

export default TagsDisplay;
