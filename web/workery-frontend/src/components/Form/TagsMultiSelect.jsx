// File: web/workery-frontend/src/components/Form/TagsMultiSelect.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MultiSelect, Loading } from "../UI";
import { useTagManager } from "../../services/Services";

/**
 * Reusable Tags Multi-Select Component with server-side search
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
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Use ref to track if component is mounted
  const isMounted = useRef(true);

  // Debounce timer ref
  const searchDebounceTimer = useRef(null);

  // Clean the value to ensure no empty strings
  const cleanValue = (val) => {
    if (!val || !Array.isArray(val)) return [];
    return val.filter(
      (v) => v !== null && v !== undefined && v !== "" && v !== "0" && v !== 0,
    );
  };

  // Fetch options based on search term
  const fetchOptions = useCallback(
    async (search = "") => {
      try {
        if (!isMounted.current) return;

        setFetchError(null);

        // Build parameters for the API call
        const params = {};
        if (search && search.trim()) {
          params.search = search.trim();
        }

        console.log("TagsMultiSelect: Fetching options with search:", search);

        // Use getTags method for searching, which supports server-side search
        if (search) {
          // When searching, use the full tags API with search parameter
          const tagsResponse = await tagManager.getTags(
            params,
            onUnauthorized,
            true, // Force refresh to get latest data
          );

          if (!isMounted.current) return;

          // Transform the results into select options format
          let validOptions = [];

          if (tagsResponse && tagsResponse.results) {
            validOptions = tagsResponse.results
              .filter((item) => item && (item.id || item.value))
              .map((item) => ({
                value: item.id || item.value,
                label: item.text || item.label || item.name || `Tag ${item.id}`,
              }));
          }

          console.log(
            `TagsMultiSelect: Loaded ${validOptions.length} options from search`,
          );
          setOptions(validOptions);
        } else {
          // When not searching, get all select options
          const tagOptions = await tagManager.getTagSelectOptions(
            onUnauthorized,
            true, // Force refresh for initial load
          );

          if (!isMounted.current) return;

          // Format options - should already be in {value, label} format
          const validOptions = (tagOptions || []).filter(
            (opt) => opt && opt.value && opt.label,
          );

          console.log(
            `TagsMultiSelect: Loaded ${validOptions.length} default options`,
          );
          setOptions(validOptions);
        }

        // Also ensure any selected values are included
        if (value && value.length > 0 && !search) {
          await ensureSelectedOptionsAreLoaded();
        }
      } catch (error) {
        console.error("Error fetching tag options:", error);
        if (isMounted.current) {
          setFetchError("Failed to load tags. Please try again.");
          setOptions([]);
        }
      }
    },
    [tagManager, onUnauthorized, value],
  );

  // Ensure selected options are included even if not in search results
  const ensureSelectedOptionsAreLoaded = useCallback(async () => {
    if (!value || value.length === 0) return;

    const cleanedValue = cleanValue(value);
    if (cleanedValue.length === 0) return;

    try {
      // Check if all selected values are already in options
      const missingIds = cleanedValue.filter(
        (id) => !options.find((opt) => String(opt.value) === String(id)),
      );

      if (missingIds.length > 0) {
        console.log(
          "TagsMultiSelect: Loading missing selected options:",
          missingIds,
        );

        // Fetch the full list to get the missing options
        const fullResponse = await tagManager.getTagSelectOptions(
          onUnauthorized,
          true,
        );

        if (fullResponse && isMounted.current) {
          const missingOptions = (
            Array.isArray(fullResponse) ? fullResponse : []
          )
            .filter((opt) => missingIds.includes(String(opt.value)))
            .map((opt) => ({
              value: opt.value,
              label: opt.label || opt.text || opt.name,
            }));

          if (missingOptions.length > 0) {
            setOptions((prevOptions) => {
              // Merge missing options with existing ones, avoiding duplicates
              const merged = [...prevOptions];
              missingOptions.forEach((newOpt) => {
                if (
                  !merged.find(
                    (opt) => String(opt.value) === String(newOpt.value),
                  )
                ) {
                  merged.push(newOpt);
                }
              });
              return merged;
            });
          }
        }
      }
    } catch (error) {
      console.error("Error loading selected options:", error);
    }
  }, [value, options, tagManager, onUnauthorized]);

  // Initial load
  useEffect(() => {
    isMounted.current = true;
    setIsLoading(true);

    fetchOptions("").finally(() => {
      if (isMounted.current) {
        setIsLoading(false);
      }
    });

    return () => {
      isMounted.current = false;
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }
    };
  }, []); // Empty deps for initial load only

  // Handle search with debouncing
  const handleSearch = useCallback(
    (searchValue) => {
      setSearchTerm(searchValue);

      // Clear existing timer
      if (searchDebounceTimer.current) {
        clearTimeout(searchDebounceTimer.current);
      }

      // Don't search if component is unmounted
      if (!isMounted.current) return;

      // Set searching state
      setIsSearching(true);

      // Debounce the search
      searchDebounceTimer.current = setTimeout(() => {
        if (isMounted.current) {
          fetchOptions(searchValue).finally(() => {
            if (isMounted.current) {
              setIsSearching(false);
            }
          });
        }
      }, 300); // 300ms debounce
    },
    [fetchOptions],
  );

  const handleChange = (newValue) => {
    // Clean the new value before passing it to onChange
    const cleanedValue = cleanValue(newValue);
    onChange(cleanedValue);
  };

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

  // Use cleaned value for the MultiSelect
  const currentValue = cleanValue(value);

  // Create an enhanced MultiSelect wrapper that handles search
  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <EnhancedMultiSelect
        options={options}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        error={error || fetchError}
        disabled={disabled}
        required={required}
        helperText={helperText}
        onSearch={handleSearch}
        searchTerm={searchTerm}
        isSearching={isSearching}
      />
    </div>
  );
}

// Enhanced MultiSelect with server-side search support
function EnhancedMultiSelect({
  options,
  value,
  onChange,
  placeholder,
  error,
  disabled,
  required,
  helperText,
  onSearch,
  searchTerm,
  isSearching,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get selected options labels
  const getSelectedLabels = () => {
    return options
      .filter((option) => value.includes(option.value))
      .map((option) => option.label);
  };

  const selectedLabels = getSelectedLabels();

  // Toggle option selection
  const toggleOption = (optionValue) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  // Remove a selected option
  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  // Clear all selections
  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Main Input/Display Area */}
        <div
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            min-h-[42px] px-3 py-2
            border rounded-lg
            transition-all duration-200
            cursor-pointer
            flex items-center justify-between
            ${disabled ? "bg-gray-50 cursor-not-allowed opacity-60" : "bg-white"}
            ${error ? "border-red-500" : "border-gray-300"}
            ${isOpen ? "ring-2 ring-blue-500 border-blue-500" : ""}
          `}
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((label, index) => {
                const option = options.find((o) => o.label === label);
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                  >
                    {label}
                    {!disabled && (
                      <button
                        onClick={(e) => removeOption(option.value, e)}
                        className="ml-1 hover:text-blue-900"
                        type="button"
                      >
                        <svg
                          className="h-3 w-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400">{placeholder}</span>
            )}
          </div>

          <div className="flex items-center ml-2">
            {selectedLabels.length > 0 && !disabled && (
              <button
                onClick={clearAll}
                className="mr-2 text-gray-400 hover:text-gray-600"
                type="button"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            <svg
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search tags..."
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
              {isSearching && (
                <div className="mt-1 text-xs text-gray-500">Searching...</div>
              )}
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
              {options.length > 0 ? (
                options.map((option) => {
                  const isSelected = value.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={`
                        px-3 py-2 cursor-pointer flex items-center justify-between
                        hover:bg-gray-50
                        ${isSelected ? "bg-blue-50" : ""}
                      `}
                    >
                      <span
                        className={`text-sm ${isSelected ? "text-blue-700 font-medium" : "text-gray-700"}`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <svg
                          className="h-4 w-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  {isSearching ? "Searching..." : "No tags found"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">{error}</p>
      )}
    </>
  );
}

export default TagsMultiSelect;
