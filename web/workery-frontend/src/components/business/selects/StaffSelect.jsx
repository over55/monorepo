// File: monorepo/web/frontend/src/components/business/selects/StaffSelect.jsx

import React, { useState, useEffect } from "react";
import { Select, FormGroup, Loading } from "../../UIX";
import { useStaffManager } from "../../../services/Services";
import { STAFF_STATUS_ACTIVE } from "../../../constants/Staff";

/**
 * Reusable Staff Select Component
 *
 * Fetches and displays a list of staff as select options.
 * By default, only shows active staff, but can be configured to include other statuses.
 *
 * @param {string|number} value - Current selected staff ID
 * @param {function} onChange - Callback when value changes (receives the value)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required (default: false)
 * @param {boolean} disabled - Whether field is disabled (default: false)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (default: "Staff")
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} placeholder - Custom placeholder (default: "Please select")
 * @param {boolean} isHidden - Whether to hide the component (default: false)
 * @param {boolean} includeInactive - Whether to include inactive staff (default: false)
 * @param {boolean} forceRefresh - Whether to force refresh the options (default: false)
 */
function StaffSelect({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Staff",
  helperText = "",
  onUnauthorized = null,
  placeholder = "Please select",
  isHidden = false,
  includeInactive = false,
  forceRefresh = false,
}) {
  const staffManager = useStaffManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Debug log in development
        if (import.meta.env.DEV) {
          console.log("StaffSelect: Fetching options", {
            includeInactive,
            forceRefresh,
          });
        }

        // Build parameters for the API call
        const filtersMap = new Map();
        filtersMap.set("page_size", "1000"); // Get a reasonable number of staff for dropdown

        // Filter by status - only active staff by default
        if (!includeInactive) {
          filtersMap.set("status", STAFF_STATUS_ACTIVE);
        }

        // Fetch options from the API using the staff endpoint with filtering
        const response = await staffManager.getStaffWithFiltersMap(
          filtersMap,
          onUnauthorized,
          forceRefresh,
        );

        if (mounted) {
          // Handle different response formats
          let formattedOptions = [];

          if (response?.results && Array.isArray(response.results)) {
            // Response with results property
            formattedOptions = response.results;
          } else if (Array.isArray(response)) {
            // Direct array response
            formattedOptions = response;
          } else if (response?.data && Array.isArray(response.data)) {
            // Response with data property
            formattedOptions = response.data;
          }

          // Additional status filtering if needed (in case backend doesn't filter)
          if (!includeInactive) {
            formattedOptions = formattedOptions.filter(
              (staff) =>
                staff.status === undefined ||
                staff.status === STAFF_STATUS_ACTIVE ||
                staff.status === "active" ||
                staff.status === 1, // Ensure we catch numeric status
            );
          }

          // Ensure each option has value and label properties
          const validOptions = formattedOptions
            .filter(
              (staff) => staff && (staff.id !== undefined || staff.value !== undefined),
            )
            .map((staff) => ({
              value: staff.id !== undefined ? staff.id : staff.value,
              label:
                staff.name ||
                staff.label ||
                staff.text ||
                `${staff.firstName || ""} ${staff.lastName || ""}`.trim() ||
                `Staff ${staff.id || staff.value}`,
            }));

          // Sort options alphabetically by label
          validOptions.sort((a, b) =>
            a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
          );

          // Set options WITHOUT adding an empty option
          // The Select component handles the placeholder automatically
          setOptions(validOptions);

          // Debug log in development
          if (import.meta.env.DEV) {
            console.log(`StaffSelect: Loaded ${validOptions.length} staff`);
          }

          setIsLoading(false);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error fetching staff options:", err);
        }

        if (mounted) {
          setFetchError(err.message || "Failed to load staff options");
          setIsLoading(false);
        }
      }
    };

    fetchOptions();

    return () => {
      mounted = false;
    };
  }, [staffManager, includeInactive, forceRefresh, onUnauthorized]);

  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <FormGroup label={label} required={required} className={className}>
        <Loading message="Loading staff..." />
      </FormGroup>
    );
  }

  // Show error state
  if (fetchError) {
    return (
      <FormGroup
        label={label}
        error={`Failed to load staff: ${fetchError}`}
        required={required}
        className={className}
      >
        <Select
          value={value}
          onChange={onChange}
          options={[]}
          placeholder="Failed to load options"
          disabled={true}
          required={required}
        />
      </FormGroup>
    );
  }

  // Render the select with options
  return (
    <Select
      label={label}
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      helperText={helperText}
      className={className}
    />
  );
}

export default StaffSelect;
