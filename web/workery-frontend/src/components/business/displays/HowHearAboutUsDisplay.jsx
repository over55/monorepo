// File: monorepo/web/workery-frontend/src/components/business/displays/HowHearAboutUsDisplay.jsx

import React, { useState, useEffect } from "react";
import { useHowHearAboutUsItemManager } from "../../../services/Services";
import { Badge, Loading } from "../../UI";

/**
 * Display component for "How did you hear about us?" value
 * Fetches the option label from API based on the stored ID
 *
 * @param {number|string} value - The ID of the selected "How hear about us" option
 * @param {string} label - Custom label (defaults to "How did you hear about us?")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 */
function HowHearAboutUsDisplay({
  value,
  label = "How did you hear about us?",
  className = "",
  onUnauthorized = null,
}) {
  const howHearManager = useHowHearAboutUsItemManager();
  const [displayValue, setDisplayValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
        const options = await howHearManager.getSelectOptions(onUnauthorized);

        if (mounted && options) {
          // Find the matching option
          const matchingOption = options.find(
            (opt) => String(opt.value) === String(value),
          );

          if (matchingOption) {
            setDisplayValue(matchingOption.label);
          } else {
            setDisplayValue(`Unknown (ID: ${value})`);
          }
        }
      } catch (error) {
        console.error("Error fetching how hear option:", error);
        if (mounted) {
          setError("Failed to load option");
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
  }, [value, onUnauthorized]);

  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
        <div className="flex items-center">
          <Loading size="sm" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
      <p className="text-sm text-gray-900">
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          displayValue || <span className="text-gray-400">Not specified</span>
        )}
      </p>
    </div>
  );
}

export default HowHearAboutUsDisplay;
