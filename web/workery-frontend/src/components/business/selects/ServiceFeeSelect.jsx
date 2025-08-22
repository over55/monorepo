// File: monorepo/web/workery-frontend/src/components/business/selects/ServiceFeeSelect.jsx

import React, { useState, useEffect } from "react";
import { Select, FormGroup, Loading } from "../../UI";
import { useServiceFeeManager } from "../../../services/Services";

/**
 * Reusable Service Fee Select Component
 *
 * @param {string|number} value - Current selected service fee ID
 * @param {function} onChange - Callback when value changes (receives the value)
 * @param {function} onOtherDetected - Callback when "Other" option is selected (receives boolean)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Service Fee")
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} placeholder - Custom placeholder (defaults to "Please select")
 */
function ServiceFeeSelect({
  value,
  onChange,
  onOtherDetected,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Service Fee",
  helperText = "",
  onUnauthorized = null,
  placeholder = "Please select",
}) {
  const serviceFeeManager = useServiceFeeManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Fetch options from the API/cache
        const apiOptions =
          await serviceFeeManager.getServiceFeeSelectOptions(onUnauthorized);

        if (mounted) {
          // Format options - The API should return them in {value, label} format
          // but we'll ensure they're formatted correctly
          const formattedOptions = Array.isArray(apiOptions)
            ? apiOptions
            : apiOptions?.results || apiOptions?.data || [];

          // Ensure each option has value and label properties
          const validOptions = formattedOptions
            .filter(
              (opt) => opt && (opt.value !== undefined || opt.id !== undefined),
            )
            .map((opt) => ({
              value: opt.value !== undefined ? opt.value : opt.id,
              label:
                opt.label || opt.title || opt.name || `Service Fee ${opt.id}`,
            }));

          setOptions(validOptions);

          // Check if current value is "Other" option after options are loaded
          if (value && onOtherDetected) {
            const selectedOption = validOptions.find(
              (opt) => String(opt.value) === String(value),
            );
            if (
              selectedOption &&
              selectedOption.label &&
              selectedOption.label.toLowerCase() === "other"
            ) {
              onOtherDetected(true);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching service fee options:", error);
        if (mounted) {
          setFetchError(
            "Failed to load service fee options. Please try again.",
          );
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

  const handleChange = (e) => {
    const selectedValue = e.target.value;

    // Check if "Other" was selected
    if (options.length > 0 && onOtherDetected) {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(selectedValue),
      );

      // Check if the label is "Other" (case-insensitive)
      const isOther =
        selectedOption &&
        selectedOption.label &&
        selectedOption.label.toLowerCase() === "other";

      onOtherDetected(isOther);
    }

    // Call the original onChange with just the value
    onChange(selectedValue);
  };

  if (isLoading) {
    return (
      <FormGroup label={label} required={required} className={className}>
        <div
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "42px",
          }}
        >
          <Loading size="sm" text="Loading service fees..." />
        </div>
      </FormGroup>
    );
  }

  return (
    <Select
      label={label}
      value={value}
      onChange={handleChange}
      options={options}
      error={error || fetchError}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      helperText={helperText}
      className={className}
    />
  );
}

export default ServiceFeeSelect;
