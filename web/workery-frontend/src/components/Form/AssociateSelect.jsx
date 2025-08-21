// File: monorepo/web/workery-frontend/src/components/Form/AssociateSelect.jsx

import React, { useState, useEffect } from "react";
import { Select, FormGroup, Loading } from "../UI";
import { useAssociateManager } from "../../services/Services";
import { ASSOCIATE_STATUS_ACTIVE } from "../../constants/Associate";

/**
 * Reusable Associate Select Component
 *
 * @param {string|number} value - Current selected associate ID
 * @param {function} onChange - Callback when value changes (receives the value)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Associate")
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} placeholder - Custom placeholder (defaults to "Please select")
 * @param {boolean} isHidden - Whether to hide the component
 * @param {number} statusFilter - Status filter for associates (defaults to ACTIVE)
 * @param {Object} additionalFilters - Additional filters to apply
 */
function AssociateSelect({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Associate",
  helperText = "",
  onUnauthorized = null,
  placeholder = "Please select",
  isHidden = false,
  statusFilter = ASSOCIATE_STATUS_ACTIVE,
  additionalFilters = {},
}) {
  const associateManager = useAssociateManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Build filters map (matching old implementation)
        const filtersMap = new Map();

        // Add status filter if provided
        if (statusFilter !== null && statusFilter !== undefined) {
          filtersMap.set("status", statusFilter);
        }

        // Add any additional filters
        Object.entries(additionalFilters).forEach(([key, value]) => {
          if (value !== null && value !== undefined && value !== "") {
            filtersMap.set(key, value);
          }
        });

        // Debug log in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            "AssociateSelect: Fetching options with filters:",
            Object.fromEntries(filtersMap),
          );
        }

        // Fetch options from the API/cache using the manager
        const response = await associateManager.getAssociateSelectOptions(
          filtersMap,
          onUnauthorized,
        );

        if (mounted) {
          // Handle different response formats
          let formattedOptions = [];

          if (Array.isArray(response)) {
            // Direct array response
            formattedOptions = response;
          } else if (response?.results && Array.isArray(response.results)) {
            // Response with results property
            formattedOptions = response.results;
          } else if (response?.data && Array.isArray(response.data)) {
            // Response with data property
            formattedOptions = response.data;
          }

          // Ensure each option has value and label properties
          const validOptions = formattedOptions
            .filter(
              (opt) => opt && (opt.value !== undefined || opt.id !== undefined),
            )
            .map((opt) => ({
              value: opt.value !== undefined ? opt.value : opt.id,
              label:
                opt.label ||
                opt.text ||
                opt.name ||
                `${opt.firstName || ""} ${opt.lastName || ""}`.trim() ||
                `Associate ${opt.id}`,
            }));

          // Add empty option at the beginning
          const optionsWithEmpty = [
            { value: "", label: placeholder },
            ...validOptions,
          ];

          setOptions(optionsWithEmpty);

          // Debug log in development
          if (process.env.NODE_ENV === "development") {
            console.log(
              `AssociateSelect: Loaded ${validOptions.length} associates`,
            );
          }
        }
      } catch (error) {
        console.error("Error fetching associate options:", error);
        if (mounted) {
          setFetchError("Failed to load associates. Please try again.");
          // Set empty options with just the placeholder on error
          setOptions([{ value: "", label: placeholder }]);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Only fetch if component is not hidden
    if (!isHidden) {
      fetchOptions();
    } else {
      setIsLoading(false);
      setOptions([{ value: "", label: placeholder }]);
    }

    return () => {
      mounted = false;
    };
  }, [
    onUnauthorized,
    statusFilter,
    JSON.stringify(additionalFilters),
    isHidden,
  ]);

  const handleChange = (e) => {
    const selectedValue = e.target.value;

    // Call the onChange with just the value
    // Convert to number if it's a numeric string (for consistency with backend)
    const finalValue =
      selectedValue === ""
        ? ""
        : !isNaN(selectedValue)
          ? Number(selectedValue)
          : selectedValue;

    onChange(finalValue);

    // Debug log in development
    if (process.env.NODE_ENV === "development") {
      const selectedOption = options.find(
        (opt) => String(opt.value) === String(selectedValue),
      );
      console.log("AssociateSelect: Selected", {
        value: finalValue,
        label: selectedOption?.label,
      });
    }
  };

  // Don't render if hidden
  if (isHidden) {
    return null;
  }

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
          <Loading size="sm" text="Loading associates..." />
        </div>
      </FormGroup>
    );
  }

  return (
    <Select
      label={label}
      value={value || ""}
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

export default AssociateSelect;
