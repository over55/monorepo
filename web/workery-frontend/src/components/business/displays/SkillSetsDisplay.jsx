// File Path: monorepo/web/frontend/src/components/business/displays/SkillSetsDisplay.jsx

import React, { useState, useEffect, useMemo } from "react";
import { useSkillSetManager } from "../../../services/Services";
import { Badge, Loading, useUIXTheme } from "../../UIX";

/**
 * Display component for multiple selected skill sets
 * Fetches skill set labels from API based on the stored IDs
 *
 * @param {Array} values - Array of skill set IDs
 * @param {string} label - Custom label (defaults to "Skill Sets")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} variant - Badge variant for display
 */
function SkillSetsDisplay({
  values = [],
  label = "Skill Sets",
  className = "",
  onUnauthorized = null,
  variant = "primary",
}) {
  const skillSetManager = useSkillSetManager();
  const { getThemeClasses } = useUIXTheme();
  const [displaySkillSets, setDisplaySkillSets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoize stringified values to use as a stable dependency for detecting array changes
  const valuesKey = useMemo(() => JSON.stringify(values), [values]);

  useEffect(() => {
    let mounted = true;

    const fetchDisplayValues = async () => {
      // Debug logging
      if (import.meta.env.DEV) {
        console.log("SkillSetsDisplay - values received:", values);
        console.log("SkillSetsDisplay - values type:", typeof values);
        console.log("SkillSetsDisplay - is array?:", Array.isArray(values));
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
          console.log("SkillSetsDisplay - No values to display");
        }
        setDisplaySkillSets([]);
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
        console.log("SkillSetsDisplay - filtered values:", filteredValues);
      }

      if (filteredValues.length === 0) {
        setDisplaySkillSets([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch skill set options from the API/cache
        const options =
          await skillSetManager.getSkillSetSelectOptions(onUnauthorized);

        if (import.meta.env.DEV) {
          console.log("SkillSetsDisplay - fetched options:", options);
        }

        if (mounted && options) {
          // Map the IDs to their labels
          const mappedSkillSets = filteredValues
            .map((skillSetId) => {
              // Ensure we're comparing as strings for consistency
              const skillSetIdStr = String(skillSetId);

              const matchingOption = options.find((opt) => {
                // Handle both 'value' and 'id' properties
                const optionId = String(opt.value || opt.id);
                return optionId === skillSetIdStr;
              });

              if (import.meta.env.DEV) {
                console.log(
                  `SkillSetsDisplay - Mapping skill set ID ${skillSetId}:`,
                  matchingOption,
                );
              }

              if (matchingOption) {
                return {
                  id: skillSetId,
                  label:
                    matchingOption.label ||
                    matchingOption.text ||
                    matchingOption.name,
                };
              } else {
                // Only show unknown if we have a valid ID
                if (skillSetIdStr && skillSetIdStr !== "undefined") {
                  if (import.meta.env.DEV) {
                    console.warn(
                      `SkillSetsDisplay - No match found for skill set ID: ${skillSetId}`,
                    );
                  }
                  return {
                    id: skillSetId,
                    label: `Unknown (ID: ${skillSetId})`,
                  };
                }
                return null;
              }
            })
            .filter(Boolean); // Remove any null values

          if (import.meta.env.DEV) {
            console.log("SkillSetsDisplay - mapped skill sets:", mappedSkillSets);
          }
          setDisplaySkillSets(mappedSkillSets);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching skill set options:", error);
        }
        if (mounted) {
          setError("Failed to load skill sets");
          // Fallback to showing IDs only if we have valid values
          const fallbackSkillSets = filteredValues.map((id) => ({
            id,
            label: `ID: ${id}`,
          }));
          setDisplaySkillSets(fallbackSkillSets);
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
  }, [valuesKey, onUnauthorized, skillSetManager]);

  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <p className={`text-sm font-medium ${getThemeClasses("text-secondary")} mb-2`}>{label}</p>
        <div className="flex items-center">
          <Loading size="sm" text="Loading skill sets..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className={`text-sm font-medium ${getThemeClasses("text-secondary")} mb-2`}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {error ? (
          <span className="text-red-600 text-sm">{error}</span>
        ) : displaySkillSets.length > 0 ? (
          displaySkillSets.map((skillSet) => (
            <Badge key={skillSet.id} variant={variant} size="md">
              {skillSet.label}
            </Badge>
          ))
        ) : (
          <span className={`${getThemeClasses("text-muted")} text-sm`}>No skill sets selected</span>
        )}
      </div>
    </div>
  );
}

export default SkillSetsDisplay;
