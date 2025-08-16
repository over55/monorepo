// File: web/workery-frontend/src/components/Form/TagsMultiSelect.jsx

import React, { useState, useEffect } from "react";
import { MultiSelect, Loading } from "../UI";
import { useTagManager } from "../../services/Services";

/**
 * Reusable Tags Multi-Select Component
 *
 * @param {Array} value - Array of selected tag IDs
 * @param {function} onChange - Callback when value changes (receives array of IDs)
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether field is disabled
 * @param {string} className - Additional CSS classes
 * @param {string} label - Custom label (defaults to "Tags")
 * @param {string} placeholder - Custom placeholder
 * @param {string} helperText - Helper text to display
 * @param {function} onUnauthorized - Callback for unauthorized errors
 */
function TagsMultiSelect({
  value = [],
  onChange,
  error,
  required = false,
  disabled = false,
  className = "",
  label = "Tags",
  placeholder = "Select tags...",
  helperText = "Select one or more tags",
  onUnauthorized = null,
}) {
  const tagManager = useTagManager();
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        // Fetch tag options from the API/cache
        const tagOptions = await tagManager.getTagSelectOptions(onUnauthorized);

        if (mounted) {
          // Format options - tagOptions should already be in {value, label} format
          setOptions(tagOptions || []);
        }
      } catch (error) {
        console.error("Error fetching tag options:", error);
        if (mounted) {
          setFetchError("Failed to load tags. Please try again.");
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

  if (isLoading) {
    return (
      <div className={`mb-5 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div
          style={{
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            backgroundColor: "#f9f9f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "42px",
          }}
        >
          <Loading size="sm" text="Loading tags..." />
        </div>
      </div>
    );
  }

  return (
    <MultiSelect
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      error={error || fetchError}
      disabled={disabled}
      required={required}
      helperText={helperText}
      className={className}
    />
  );
}

export default TagsMultiSelect;
