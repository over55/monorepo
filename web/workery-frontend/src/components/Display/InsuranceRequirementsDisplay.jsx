// File: web/workery-frontend/src/components/Display/InsuranceRequirementsDisplay.jsx

import React, { useState, useEffect } from "react";
import { useInsuranceRequirementManager } from "../../services/Services";
import { Badge, Loading } from "../UI";

/**
 * Display component for multiple selected insurance requirements
 * Fetches insurance requirement labels from API based on the stored IDs
 *
 * @param {Array} values - Array of insurance requirement IDs
 * @param {string} label - Custom label (defaults to "Insurance Requirements")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} variant - Badge variant for display
 */
function InsuranceRequirementsDisplay({
  values = [],
  label = "Insurance Requirements",
  className = "",
  onUnauthorized = null,
  variant = "info",
}) {
  const insuranceRequirementManager = useInsuranceRequirementManager();
  const [displayRequirements, setDisplayRequirements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchDisplayValues = async () => {
      // Debug logging
      console.log("InsuranceRequirementsDisplay - values received:", values);
      console.log("InsuranceRequirementsDisplay - values type:", typeof values);
      console.log(
        "InsuranceRequirementsDisplay - is array?:",
        Array.isArray(values),
      );

      // Handle null, undefined, or empty cases
      if (
        !values ||
        (Array.isArray(values) && values.length === 0) ||
        values === "" ||
        values === null ||
        values === undefined
      ) {
        console.log("InsuranceRequirementsDisplay - No values to display");
        setDisplayRequirements([]);
        return;
      }

      // Ensure values is an array
      const valueArray = Array.isArray(values) ? values : [values];

      // Filter out any empty, null, undefined, or zero values
      const filteredValues = valueArray.filter(
        (v) =>
          v !== null && v !== undefined && v !== "" && v !== 0 && v !== "0",
      );

      console.log(
        "InsuranceRequirementsDisplay - filtered values:",
        filteredValues,
      );

      if (filteredValues.length === 0) {
        setDisplayRequirements([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch insurance requirement options from the API/cache
        const options =
          await insuranceRequirementManager.getInsuranceRequirementSelectOptions(
            onUnauthorized,
          );

        console.log("InsuranceRequirementsDisplay - fetched options:", options);

        if (mounted && options) {
          // Map the IDs to their labels
          const mappedRequirements = filteredValues
            .map((requirementId) => {
              // Ensure we're comparing as strings for consistency
              const requirementIdStr = String(requirementId);

              const matchingOption = options.find((opt) => {
                // Handle both 'value' and 'id' properties
                const optionId = String(opt.value || opt.id);
                return optionId === requirementIdStr;
              });

              console.log(
                `InsuranceRequirementsDisplay - Mapping requirement ID ${requirementId}:`,
                matchingOption,
              );

              if (matchingOption) {
                return {
                  id: requirementId,
                  label:
                    matchingOption.label ||
                    matchingOption.text ||
                    matchingOption.name,
                };
              } else {
                // Only show unknown if we have a valid ID
                if (requirementIdStr && requirementIdStr !== "undefined") {
                  console.warn(
                    `InsuranceRequirementsDisplay - No match found for requirement ID: ${requirementId}`,
                  );
                  return {
                    id: requirementId,
                    label: `Unknown (ID: ${requirementId})`,
                  };
                }
                return null;
              }
            })
            .filter(Boolean); // Remove any null values

          console.log(
            "InsuranceRequirementsDisplay - mapped requirements:",
            mappedRequirements,
          );
          setDisplayRequirements(mappedRequirements);
        }
      } catch (error) {
        console.error("Error fetching insurance requirement options:", error);
        if (mounted) {
          setError("Failed to load insurance requirements");
          // Fallback to showing IDs only if we have valid values
          const fallbackRequirements = filteredValues.map((id) => ({
            id,
            label: `ID: ${id}`,
          }));
          setDisplayRequirements(fallbackRequirements);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchDisplayValues();

    return () => {
      mounted = false;
    };
  }, [JSON.stringify(values), onUnauthorized]); // Use stringified values to detect array changes

  if (isLoading) {
    return (
      <div className={`mb-4 ${className}`}>
        <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
        <div className="flex items-center">
          <Loading size="sm" text="Loading insurance requirements..." />
        </div>
      </div>
    );
  }

  return (
    <div className={`mb-4 ${className}`}>
      <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {error ? (
          <span className="text-red-600 text-sm">{error}</span>
        ) : displayRequirements.length > 0 ? (
          displayRequirements.map((requirement) => (
            <Badge key={requirement.id} variant={variant} size="md">
              {requirement.label}
            </Badge>
          ))
        ) : (
          <span className="text-gray-400 text-sm">
            No insurance requirements selected
          </span>
        )}
      </div>
    </div>
  );
}

export default InsuranceRequirementsDisplay;
