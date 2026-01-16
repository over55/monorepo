// File: monorepo/web/frontend/src/components/business/selects/InsuranceRequirementsMultiSelect.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { SkillSetTagPicker, Loading } from "../../UIX";
import { useInsuranceRequirementManager } from "../../../services/Services";

/**
 * Reusable Insurance Requirements Multi-Select Component with server-side data
 *
 * @param {Array} value - Array of selected insurance requirement IDs
 * @param {function} onChange - Callback when value changes (receives array of IDs)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Insurance Requirements")
 * @param {string} placeholder - Custom placeholder
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 */
function InsuranceRequirementsMultiSelect({
  id,
  value = [],
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Insurance Requirements",
  placeholder = "Select insurance requirements...",
  helperText = "Select one or more insurance requirements",
  onUnauthorized = null,
}) {
  const insuranceRequirementManager = useInsuranceRequirementManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Clean the value to ensure no empty strings and extract IDs from objects
  const cleanValue = (val) => {
    if (!val || !Array.isArray(val)) return [];
    return val
      .map((v) => {
        // If value is an object, extract the ID
        if (v && typeof v === "object") {
          return v.id || v.value;
        }
        return v;
      })
      .filter(
        (v) => v !== null && v !== undefined && v !== "" && v !== "0" && v !== 0,
      );
  };

  // Fetch all options on initial load
  const fetchOptions = useCallback(async () => {
    try {
      if (!isMounted.current) return;

      setFetchError(null);

      if (import.meta.env.DEV) {
        console.log("InsuranceRequirementsMultiSelect: Fetching all insurance requirement options");
      }

      // Fetch all insurance requirement select options
      const insuranceRequirementOptions = await insuranceRequirementManager.getInsuranceRequirementSelectOptions(
        onUnauthorized,
        true, // Force refresh to get latest data
      );

      if (!isMounted.current) return;

      // Handle both array and object response formats
      let optionsList = [];

      if (Array.isArray(insuranceRequirementOptions)) {
        optionsList = insuranceRequirementOptions;
      } else if (insuranceRequirementOptions && insuranceRequirementOptions.results) {
        optionsList = insuranceRequirementOptions.results;
      }

      // Format options - transform to consistent {value, label} format
      const validOptions = optionsList
        .map((item) => ({
          value: item.value || item.id,
          label: item.label || item.text || item.name,
        }))
        .filter((opt) => opt && opt.value && opt.label);

      if (import.meta.env.DEV) {
        console.log(
          `InsuranceRequirementsMultiSelect: Loaded ${validOptions.length} options`,
        );
      }
      setOptions(validOptions);

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error fetching insurance requirement options:", error);
      }
      if (isMounted.current) {
        setFetchError("Failed to load insurance requirements. Please try again.");
        setOptions([]);
      }
    }
  }, [insuranceRequirementManager, onUnauthorized]);


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
        <Loading size="sm" text="Loading insurance requirements..." />
      </div>
    );
  }

  // Use cleaned value for the SkillSetTagPicker
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


export default InsuranceRequirementsMultiSelect;
