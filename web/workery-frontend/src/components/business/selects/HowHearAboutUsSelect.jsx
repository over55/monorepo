// File: monorepo/web/workery-frontend/src/components/business/selects/HowHearAboutUsSelect.jsx

import React, { useState, useEffect } from "react";
import { Select, FormGroup, Loading } from "../../UI";
import { useHowHearAboutUsItemManager } from "../../../services/Services";

/**
 * Reusable How Hear About Us Select Component
 *
 * @param {string} value - Current selected value
 * @param {function} onChange - Callback when value changes (receives the value)
 * @param {function} onOtherDetected - Callback when "Other" option is selected (receives boolean)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "How did you hear about us?")
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 */
function HowHearAboutUsSelect({
  value,
  onChange,
  onOtherDetected,
  error,
  required = true,
  disabled = false,
  className = "",
  label = "How did you hear about us?",
  helperText = "",
  onUnauthorized = null,
}) {
  const howHearManager = useHowHearAboutUsItemManager();
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
          await howHearManager.getSelectOptions(onUnauthorized);

        if (mounted) {
          // Format options with empty option at the start
          const formattedOptions = [
            // { value: "", label: "Please select" }, // Not needed
            ...(apiOptions || []),
          ];
          setOptions(formattedOptions);
        }
      } catch (error) {
        console.error("Error fetching how hear options:", error);
        if (mounted) {
          setFetchError("Failed to load options. Please try again.");
          // Set fallback options on error
          setOptions([
            { value: "", label: "Please select" },
            { value: "1", label: "Google" },
            { value: "2", label: "Facebook" },
            { value: "3", label: "Word of mouth" },
            { value: "4", label: "Newspaper" },
            { value: "5", label: "Other" },
          ]);
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
          <Loading size="sm" text="Loading options..." />
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
      placeholder="Please select"
      helperText={helperText}
      className={className}
    />
  );
}

export default HowHearAboutUsSelect;
