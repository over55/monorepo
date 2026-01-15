// File: monorepo/web/frontend/src/components/business/selects/CustomerSelect.jsx
/* eslint-disable react-refresh/only-export-components */

import React, { useState, useEffect } from "react";
import { Select, FormGroup, Loading } from "../../UIX";
import { useCustomerManager } from "../../../services/Services";
import { CUSTOMER_STATUS } from "../../../constants/Customer";

/**
 * Reusable Customer Select Component
 *
 * Fetches and displays a list of customers as select options.
 * By default, only shows active customers, but can be configured to include other statuses.
 *
 * @param {string|number} value - Current selected customer ID
 * @param {function} onChange - Callback when value changes (receives the value)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required (default: false)
 * @param {boolean} disabled - Whether field is disabled (default: false)
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (default: "Customer")
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} placeholder - Custom placeholder (default: "Please select")
 * @param {boolean} isHidden - Whether to hide the component (default: false)
 * @param {boolean} includeInactive - Whether to include inactive customers (default: false)
 * @param {boolean} forceRefresh - Whether to force refresh the options (default: false)
 * @param {string} organizationType - Filter by organization type (default: null)
 */
function CustomerSelect({
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Customer",
  helperText = "",
  onUnauthorized = null,
  placeholder = "Please select",
  isHidden = false,
  includeInactive = false,
  forceRefresh = false,
  organizationType = null,
}) {
  const customerManager = useCustomerManager();
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
          console.log("CustomerSelect: Fetching options", {
            includeInactive,
            forceRefresh,
            organizationType,
          });
        }

        // Build parameters for the API call
        const params = {
          limit: 1000, // Get a reasonable number of customers for dropdown
        };

        // Filter by organization type if specified
        if (organizationType) {
          params.organizationType = organizationType;
        }

        // Filter by status - only active customers by default
        if (!includeInactive) {
          params.status = CUSTOMER_STATUS.ACTIVE;
        }

        // Fetch options from the API using the customers endpoint with filtering
        const response = await customerManager.getCustomers(
          params,
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
              (customer) =>
                customer.status === undefined ||
                customer.status === CUSTOMER_STATUS.ACTIVE ||
                customer.status === "active" ||
                customer.status === 1, // Ensure we catch numeric status
            );
          }

          // Ensure each option has value and label properties
          const validOptions = formattedOptions
            .filter(
              (customer) => customer && (customer.id !== undefined || customer.value !== undefined),
            )
            .map((customer) => ({
              value: customer.id !== undefined ? customer.id : customer.value,
              label:
                customer.name ||
                customer.label ||
                customer.text ||
                `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
                customer.organizationName ||
                `Customer ${customer.id || customer.value}`,
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
            console.log(
              `CustomerSelect: Loaded ${validOptions.length} customers`,
              organizationType ? `(filtered by organization type: ${organizationType})` : "",
            );
          }

          setIsLoading(false);
        }
      } catch (err) {
        if (import.meta.env.DEV) {
          console.error("Error fetching customer options:", err);
        }
        if (mounted) {
          setFetchError(err.message || "Failed to load customers");
          setOptions([]);
          setIsLoading(false);
        }
      }
    };

    // Only fetch if component is not hidden
    if (!isHidden) {
      fetchOptions();
    } else {
      setIsLoading(false);
      setOptions([]);
    }

    return () => {
      mounted = false;
    };
  }, [
    customerManager,
    onUnauthorized,
    includeInactive,
    forceRefresh,
    isHidden,
    organizationType,
  ]);

  // Don't render if hidden
  if (isHidden) {
    return null;
  }

  // Get organization type label for helper text if type filter is active
  const getOrganizationTypeLabel = () => {
    if (!organizationType) return "";

    switch (organizationType.toLowerCase()) {
      case "educational":
        return "Educational";
      case "corporate":
        return "Corporate";
      case "non_profit":
      case "nonprofit":
        return "Non-Profit";
      case "government":
        return "Government";
      default:
        return organizationType;
    }
  };

  const orgTypeLabel = getOrganizationTypeLabel();
  const enhancedHelperText = orgTypeLabel
    ? `${helperText}${helperText ? " " : ""}(Showing ${orgTypeLabel} customers only)`
    : helperText;

  if (isLoading) {
    return (
      <FormGroup label={label} required={required} className={className}>
        <Loading
          message={`Loading${orgTypeLabel ? ` ${orgTypeLabel.toLowerCase()}` : ""} customers...`}
        />
      </FormGroup>
    );
  }

  if (fetchError) {
    return (
      <FormGroup
        label={label}
        error={`Failed to load customers: ${fetchError}`}
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
      helperText={enhancedHelperText}
      className={className}
    />
  );
}

// Export the component and useful constants for use in other components
export default CustomerSelect;

export {
  CUSTOMER_STATUS,
};
