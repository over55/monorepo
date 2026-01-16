// File: monorepo/web/frontend/src/components/business/selects/SkillSetsMultiSelect.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SkillSetTagPicker, Loading } from "../../UIX";
import { useSkillSetManager } from "../../../services/Services";

/**
 * Reusable Skill Sets Multi-Select Component with server-side search
 *
 * @param {Array} value - Array of selected skill set IDs
 * @param {function} onChange - Callback when value changes (receives array of IDs)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Skill Sets")
 * @param {string} placeholder - Custom placeholder
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 */
function SkillSetsMultiSelect({
  id,
  value = [],
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Skill Sets",
  placeholder = "Select skill sets...",
  helperText = "Select one or more skill sets",
  onUnauthorized = null,
}) {
  const skillSetManager = useSkillSetManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Clean the value to ensure no empty strings
  const cleanValue = (val) => {
    if (!val || !Array.isArray(val)) return [];
    return val.filter(
      (v) => v !== null && v !== undefined && v !== "" && v !== "0" && v !== 0,
    );
  };

  // Fetch all options on initial load
  const fetchOptions = useCallback(async () => {
    try {
      if (!isMounted.current) return;

      setFetchError(null);

      if (import.meta.env.DEV) {
        console.log("SkillSetsMultiSelect: Fetching all skill set options");
      }

      // Fetch all skill set select options
      const skillSetOptions = await skillSetManager.getSkillSetSelectOptions(
        onUnauthorized,
        true, // Force refresh to get latest data
      );

      if (!isMounted.current) return;

      // Format options - should already be in {value, label} format
      const validOptions = (skillSetOptions || []).filter(
        (opt) => opt && opt.value && opt.label,
      );

      if (import.meta.env.DEV) {
        console.log(
          `SkillSetsMultiSelect: Loaded ${validOptions.length} options`,
        );
      }
      setOptions(validOptions);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching skill set options:", error);
      }
      if (isMounted.current) {
        setFetchError("Failed to load skill sets. Please try again.");
        setOptions([]);
      }
    }
  }, [skillSetManager, onUnauthorized]);


  // Initial load
  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);

    fetchOptions().finally(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
    };
  }, [fetchOptions]); // Include fetchOptions to prevent stale closures

  const handleChange = (newValue) => {
    // Clean the new value before passing it to onChange
    const cleanedValue = cleanValue(newValue);
    onChange(cleanedValue);
  };

  if (isLoading) {
    return (
      <div className={className}>
        <Loading size="sm" text="Loading skill sets..." />
      </div>
    );
  }

  // Use cleaned value for the MultiSelect
  const currentValue = cleanValue(value);

  return (
    <SkillSetTagPicker
      id={id}
      label={label}
      options={options}
      value={currentValue}
      onChange={handleChange}
      placeholder={placeholder}
      error={error || fetchError}
      disabled={disabled}
      required={required}
      helperText={helperText}
      className={className}
    />
  );
}


export default SkillSetsMultiSelect;
