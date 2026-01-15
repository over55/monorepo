// File: monorepo/web/frontend/src/components/business/displays/HowHearAboutUsDisplay.jsx

import React, { useState, useEffect } from "react";
import { useHowHearAboutUsItemManager } from "../../../services/Services";
import { Badge, Loading, useUIXTheme } from "../../UIX";

/**
 * Display component for "How did you hear about us?" value
 * Fetches the option label from API based on the stored ID
 *
 * @param {number|string} value - The ID of the selected "How hear about us" option
 * @param {string} label - Custom label (defaults to "How did you hear about us?")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {boolean} useDetailStructure - Whether to use dt/dd structure (default true, set false when inside existing dl)
 */
function HowHearAboutUsDisplay({
  value,
  label = "How did you hear about us?",
  className = "",
  onUnauthorized = null,
  useDetailStructure = true,
}) {
  const { getThemeClasses } = useUIXTheme();
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
        if (import.meta.env.DEV) {
          console.error("Error fetching how hear option:", error);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- howHearManager is a stable singleton from DI container
  }, [value, onUnauthorized]);

  if (isLoading) {
    if (useDetailStructure) {
      return (
        <div className={className}>
          <dt className={`text-sm sm:text-base font-semibold ${getThemeClasses("text-secondary")} mb-2`}>{label}</dt>
          <dd className={`text-base sm:text-lg font-medium ${getThemeClasses("text-primary")} break-words leading-relaxed`}>
            <div className="flex items-center">
              <Loading size="sm" text="Loading..." />
            </div>
          </dd>
        </div>
      );
    } else {
      return (
        <div className={className}>
          <div className="flex items-center">
            <Loading size="sm" text="Loading..." />
          </div>
        </div>
      );
    }
  }

  if (useDetailStructure) {
    return (
      <div className={className}>
        <dt className={`text-sm sm:text-base font-semibold ${getThemeClasses("text-secondary")} mb-2`}>{label}</dt>
        <dd className={`text-base sm:text-lg font-medium ${getThemeClasses("text-primary")} break-words leading-relaxed`}>
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : (
            displayValue || <span className={`${getThemeClasses("text-muted")} italic`}>Not specified</span>
          )}
        </dd>
      </div>
    );
  } else {
    return (
      <div className={className}>
        {error ? (
          <span className="text-red-600">{error}</span>
        ) : (
          displayValue || <span className={`${getThemeClasses("text-muted")} italic`}>Not specified</span>
        )}
      </div>
    );
  }
}

export default HowHearAboutUsDisplay;
