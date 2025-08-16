// File: web/workery-frontend/src/components/Form/VehicleTypesMultiSelect.jsx

import React, { useState, useEffect } from "react";
import { MultiSelect, Loading } from "../UI";
import { useVehicleTypeManager } from "../../services/Services";

/**
 * Reusable Vehicle Types Multi-Select Component
 *
 * @param {Array} value - Array of selected vehicle type IDs
 * @param {function} onChange - Callback when value changes (receives array of IDs)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Vehicle Types")
 * @param {string} placeholder - Custom placeholder
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 */
function VehicleTypesMultiSelect({
  value = [],
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Vehicle Types",
  placeholder = "Select vehicle types...",
  helperText = "Select one or more vehicle types",
  onUnauthorized = null,
}) {
  const vehicleTypeManager = useVehicleTypeManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  // Clean the value to ensure no empty strings
  const cleanValue = (val) => {
    if (!val || !Array.isArray(val)) return [];
    return val.filter(
      (v) => v !== null && v !== undefined && v !== "" && v !== "0" && v !== 0,
    );
  };

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Fetch vehicle type options from the API/cache
        const vehicleTypeOptions =
          await vehicleTypeManager.getVehicleTypeSelectOptions(onUnauthorized);

        if (mounted) {
          // Format options - should already be in {value, label} format
          // Filter out any invalid options
          const validOptions = (vehicleTypeOptions || []).filter(
            (opt) => opt && opt.value && opt.label,
          );
          setOptions(validOptions);
        }
      } catch (error) {
        console.error("Error fetching vehicle type options:", error);
        if (mounted) {
          setFetchError("Failed to load vehicle types. Please try again.");
          // Set empty options on error
          setOptions([]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, [onUnauthorized]);

  const handleChange = (newValue) => {
    // Clean the new value before passing it to onChange
    const cleanedValue = cleanValue(newValue);
    onChange(cleanedValue);
  };

  if (isLoading) {
    return (
      <div className={`mb-5 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "42px",
          }}
        >
          <Loading size="sm" text="Loading vehicle types..." />
        </div>
      </div>
    );
  }

  // Use cleaned value for the MultiSelect
  const currentValue = cleanValue(value);

  return (
    <MultiSelect
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

export default VehicleTypesMultiSelect;
