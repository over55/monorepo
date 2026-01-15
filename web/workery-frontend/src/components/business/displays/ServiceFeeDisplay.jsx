// File Path: monorepo/web/frontend/src/components/business/displays/ServiceFeeDisplay.jsx

import React, { useState, useEffect } from "react";
import { useServiceFeeManager } from "../../../services/Services";
import { Loading, useUIXTheme } from "../../UIX";

/**
 * Display component for Service Fee value
 * Fetches the option label from API based on the stored ID
 *
 * @param {number|string} value - The ID of the selected service fee
 * @param {string} label - Custom label (defaults to "Service Fee")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {boolean} showAmount - Whether to show the fee amount in addition to title
 */
function ServiceFeeDisplay({
  value,
  label = "Service Fee",
  className = "",
  onUnauthorized = null,
  showAmount = false,
}) {
  const serviceFeeManager = useServiceFeeManager();
  const [displayValue, setDisplayValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { getThemeClasses } = useUIXTheme();

  useEffect(() => {
    let mounted = true;

    const fetchDisplayValue = async () => {
      // Skip if no value provided
      if (!value || value === "" || value === "0") {
        setDisplayValue("");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch select options from the API/cache
        const options =
          await serviceFeeManager.getServiceFeeSelectOptions(onUnauthorized);

        if (mounted) {
          // Handle different response formats
          const optionsList = Array.isArray(options)
            ? options
            : options?.results || options?.data || [];

          // Find the matching option
          const matchingOption = optionsList.find(
            (opt) => String(opt.value || opt.id) === String(value),
          );

          if (matchingOption) {
            let display =
              matchingOption.label ||
              matchingOption.title ||
              matchingOption.name;

            // If showAmount is true and amount data is available, append it
            if (showAmount && matchingOption.amount !== undefined) {
              display += ` ($${matchingOption.amount})`;
            } else if (showAmount && matchingOption.percentage !== undefined) {
              display += ` (${matchingOption.percentage}%)`;
            }

            setDisplayValue(display);
          } else {
            setDisplayValue(`Unknown (ID: ${value})`);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error fetching service fee option:", error);
        }
        if (mounted) {
          setError("Failed to load service fee");
          setDisplayValue(`ID: ${value}`);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDisplayValue();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- serviceFeeManager is a stable singleton from DI container
  }, [value, onUnauthorized, showAmount]);

  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <p className={`text-sm font-medium ${getThemeClasses("text-secondary")} mb-1`}>{label}</p>
        <div className="flex items-center">
          <Loading size="sm" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className={`text-sm font-medium ${getThemeClasses("text-secondary")} mb-1`}>{label}</p>
      <p className={`text-sm ${getThemeClasses("text-primary")}`}>
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          displayValue || <span className={getThemeClasses("text-muted")}>Not specified</span>
        )}
      </p>
    </div>
  );
}

export default ServiceFeeDisplay;
