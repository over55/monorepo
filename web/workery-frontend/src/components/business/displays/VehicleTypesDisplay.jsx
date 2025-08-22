// File File: monorepo/web/workery-frontend/src/components/business/displays/VehicleTypesDisplay.jsx

import React, { useState, useEffect } from "react";
import { useVehicleTypeManager } from "../../../services/Services";
import { Badge, Loading } from "../../UI";

/**
 * Display component for multiple selected vehicle types
 * Fetches vehicle type labels from API based on the stored IDs
 *
 * @param {Array} values - Array of vehicle type IDs
 * @param {string} label - Custom label (defaults to "Vehicle Types")
 * @param {string} className - Additional CSS classes
 * @param {function} onUnauthorized - Callback for unauthorized errors
 * @param {string} variant - Badge variant for display
 */
function VehicleTypesDisplay({
  values = [],
  label = "Vehicle Types",
  className = "",
  onUnauthorized = null,
  variant = "warning",
}) {
  const vehicleTypeManager = useVehicleTypeManager();
  const [displayVehicleTypes, setDisplayVehicleTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchDisplayValues = async () => {
      // Debug logging
      console.log("VehicleTypesDisplay - values received:", values);
      console.log("VehicleTypesDisplay - values type:", typeof values);
      console.log("VehicleTypesDisplay - is array?:", Array.isArray(values));

      // Handle null, undefined, or empty cases
      if (
        !values ||
        (Array.isArray(values) && values.length === 0) ||
        values === "" ||
        values === null ||
        values === undefined
      ) {
        console.log("VehicleTypesDisplay - No values to display");
        setDisplayVehicleTypes([]);
        return;
      }

      // Ensure values is an array
      const valueArray = Array.isArray(values) ? values : [values];

      // Filter out any empty, null, undefined, or zero values
      const filteredValues = valueArray.filter(
        (v) =>
          v !== null && v !== undefined && v !== "" && v !== 0 && v !== "0",
      );

      console.log("VehicleTypesDisplay - filtered values:", filteredValues);

      if (filteredValues.length === 0) {
        setDisplayVehicleTypes([]);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch vehicle type options from the API/cache
        const options =
          await vehicleTypeManager.getVehicleTypeSelectOptions(onUnauthorized);

        console.log("VehicleTypesDisplay - fetched options:", options);

        if (mounted && options) {
          // Map the IDs to their labels
          const mappedVehicleTypes = filteredValues
            .map((vehicleTypeId) => {
              // Ensure we're comparing as strings for consistency
              const vehicleTypeIdStr = String(vehicleTypeId);

              const matchingOption = options.find((opt) => {
                // Handle both 'value' and 'id' properties
                const optionId = String(opt.value || opt.id);
                return optionId === vehicleTypeIdStr;
              });

              console.log(
                `VehicleTypesDisplay - Mapping vehicle type ID ${vehicleTypeId}:`,
                matchingOption,
              );

              if (matchingOption) {
                return {
                  id: vehicleTypeId,
                  label:
                    matchingOption.label ||
                    matchingOption.text ||
                    matchingOption.name,
                };
              } else {
                // Only show unknown if we have a valid ID
                if (vehicleTypeIdStr && vehicleTypeIdStr !== "undefined") {
                  console.warn(
                    `VehicleTypesDisplay - No match found for vehicle type ID: ${vehicleTypeId}`,
                  );
                  return {
                    id: vehicleTypeId,
                    label: `Unknown (ID: ${vehicleTypeId})`,
                  };
                }
                return null;
              }
            })
            .filter(Boolean); // Remove any null values

          console.log(
            "VehicleTypesDisplay - mapped vehicle types:",
            mappedVehicleTypes,
          );
          setDisplayVehicleTypes(mappedVehicleTypes);
        }
      } catch (error) {
        console.error("Error fetching vehicle type options:", error);
        if (mounted) {
          setError("Failed to load vehicle types");
          // Fallback to showing IDs only if we have valid values
          const fallbackVehicleTypes = filteredValues.map((id) => ({
            id,
            label: `ID: ${id}`,
          }));
          setDisplayVehicleTypes(fallbackVehicleTypes);
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
          <Loading size="sm" text="Loading vehicle types..." />
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
        ) : displayVehicleTypes.length > 0 ? (
          displayVehicleTypes.map((vehicleType) => (
            <Badge key={vehicleType.id} variant={variant} size="md">
              {vehicleType.label}
            </Badge>
          ))
        ) : (
          <span className="text-gray-400 text-sm">
            No vehicle types selected
          </span>
        )}
      </div>
    </div>
  );
}

export default VehicleTypesDisplay;
