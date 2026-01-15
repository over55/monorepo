// File: monorepo/web/frontend/src/components/business/selects/InsuranceRequirementsMultiSelect.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useInsuranceRequirementManager } from "../../../services/Services";
import { useUIXTheme } from "../../UIX";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

/**
 * Custom debounce hook
 * @param {Function} callback - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced function
 */
function useDebounce(callback, delay) {
  const timeoutRef = useRef(null);

  const debouncedCallback = useCallback(
    (...args) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * InsuranceRequirementsMultiSelect Component
 * A multi-select dropdown for selecting insurance requirements with search functionality
 * that fetches filtered results from the backend
 *
 * @param {string} label - Field label
 * @param {Array} value - Array of selected insurance requirement IDs
 * @param {Function} onChange - Handler for value changes
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {boolean} disabled - Whether the field is disabled
 * @param {boolean} required - Whether the field is required
 * @param {string} helperText - Helper text to display
 * @param {string} className - Additional CSS classes
 * @param {Function} onUnauthorized - Callback for unauthorized errors
 */
function InsuranceRequirementsMultiSelect({
  label = "Insurance Requirements",
  value = [],
  onChange,
  placeholder = "Select insurance requirements...",
  error,
  disabled = false,
  required = false,
  helperText = "Select one or more insurance requirements",
  className = "",
  onUnauthorized = null,
}) {
  const insuranceRequirementManager = useInsuranceRequirementManager();
  const { getThemeClasses } = useUIXTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const isMounted = useRef(true);

  // Track if we're using search results or default options
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Track mounted state
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Clean the value to ensure no empty strings and extract IDs from objects
  const cleanValue = (val) => {
    if (!val || !Array.isArray(val)) return [];
    return val
      .map((v) => {
        // If value is an object, extract the ID
        if (v && typeof v === "object") {
          return v.id || v.value;
        }
        return v;
      })
      .filter(
        (v) => v !== null && v !== undefined && v !== "" && v !== "0" && v !== 0,
      );
  };

  // Load default options (without search)
  const loadDefaultOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      if (import.meta.env.DEV) {
        console.log("Loading default insurance requirement options");
      }

      // For default options, use the select options endpoint
      const insuranceRequirementOptions =
        await insuranceRequirementManager.getInsuranceRequirementSelectOptions(
          onUnauthorized,
          false, // Don't force refresh for default options
        );

      if (insuranceRequirementOptions) {
        // Handle both array and object response formats
        let optionsList = [];

        if (Array.isArray(insuranceRequirementOptions)) {
          optionsList = insuranceRequirementOptions;
        } else if (insuranceRequirementOptions.results) {
          optionsList = insuranceRequirementOptions.results;
        }

        // Transform to consistent format
        const transformedOptions = optionsList.map((item) => ({
          value: item.value || item.id,
          label: item.label || item.text || item.name,
        }));

        if (import.meta.env.DEV) {
          console.log("Default options loaded:", transformedOptions);
        }
        setOptions(transformedOptions);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(
          "Error loading default insurance requirement options:",
          error,
        );
      }
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [insuranceRequirementManager, onUnauthorized]);

  // Search function to be debounced
  const performSearch = useCallback(
    async (searchQuery) => {
      if (!searchQuery || searchQuery.trim().length === 0) {
        // If search is cleared, go back to default options
        setIsSearchMode(false);
        await loadDefaultOptions();
        return;
      }

      setSearchLoading(true);
      setIsSearchMode(true);

      try {
        if (import.meta.env.DEV) {
          console.log(
            "Searching insurance requirements with query:",
            searchQuery,
          );
        }

        // Use getInsuranceRequirements with search parameter to get filtered results from backend
        const searchParams = {
          search: searchQuery.trim(),
          page: 1,
          limit: 100,
          status: 1, // Active status
        };

        const searchResults =
          await insuranceRequirementManager.getInsuranceRequirements(
            searchParams,
            onUnauthorized,
            true, // Force refresh to get latest data
          );

        if (searchResults && searchResults.results) {
          // Transform results to select option format
          const transformedOptions = searchResults.results.map((item) => ({
            value: item.id,
            label: item.name || item.text,
          }));

          if (import.meta.env.DEV) {
            console.log("Search results:", transformedOptions);
          }
          setOptions(transformedOptions);
        } else {
          setOptions([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error searching insurance requirements:", error);
        }
        setOptions([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [insuranceRequirementManager, onUnauthorized, loadDefaultOptions],
  );

  // Debounced search function
  const debouncedSearch = useDebounce(performSearch, 300);

  // Load initial options when component mounts
  useEffect(() => {
    loadDefaultOptions();
  }, [loadDefaultOptions]);

  // Handle search term changes
  useEffect(() => {
    if (isOpen) {
      debouncedSearch(searchTerm);
    }
  }, [searchTerm, isOpen, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (isMounted.current) {
          setIsOpen(false);
          // Reset search when closing
          setSearchTerm("");
          setIsSearchMode(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Get selected option labels
  const getSelectedLabels = () => {
    // Clean value first to extract IDs from any objects
    const cleanedValues = cleanValue(value);
    // For selected items, we need to check both current options and cached data
    return cleanedValues
      .map((selectedValue) => {
        const option = options.find((opt) => opt.value === selectedValue);
        if (option) {
          return { value: selectedValue, label: option.label };
        }
        // If not in current options, return with ID as label (will be resolved when options load)
        return {
          value: selectedValue,
          label: `Insurance Requirement ${selectedValue}`,
        };
      })
      .filter(Boolean);
  };

  const selectedLabels = getSelectedLabels();

  // Toggle option selection
  const toggleOption = (optionValue) => {
    const cleanedValue = cleanValue(value);
    if (cleanedValue.includes(optionValue)) {
      onChange(cleanedValue.filter((v) => v !== optionValue));
    } else {
      onChange([...cleanedValue, optionValue]);
    }
  };

  // Remove a selected option
  const removeOption = (optionValue, e) => {
    e.stopPropagation();
    const cleanedValue = cleanValue(value);
    onChange(cleanedValue.filter((v) => v !== optionValue));
  };

  // Clear all selections
  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  // Open dropdown handler
  const handleDropdownClick = useCallback(() => {
    if (!disabled) {
      const newOpenState = !isOpen;
      setIsOpen(newOpenState);
      if (newOpenState) {
        // Reset search and load default options when opening
        setSearchTerm("");
        setIsSearchMode(false);
        if (options.length === 0) {
          loadDefaultOptions();
        }
      }
    }
  }, [disabled, isOpen, options.length, loadDefaultOptions]);

  // Use cleaned value for display
  const currentValue = cleanValue(value);

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className={`block text-base sm:text-lg font-semibold mb-3 flex items-center ${getThemeClasses("text-primary")}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Main Input/Display Area */}
        <div
          onClick={handleDropdownClick}
          className={`
            w-full px-5 py-4 text-base sm:text-lg
            border-2 rounded-xl shadow-sm
            transition-all duration-200
            cursor-pointer
            flex items-center justify-between
            placeholder-gray-400
            min-h-[58px]
            ${disabled ? `${getThemeClasses("bg-disabled")} cursor-not-allowed opacity-60` : getThemeClasses("bg-primary")}
            ${error ? "border-red-500" : getThemeClasses("border-secondary")}
            ${isOpen ? "ring-4 ring-blue-500/20 border-blue-500" : ""}
          `}
        >
          <div className="flex-1 flex flex-wrap gap-1">
            {selectedLabels.length > 0 ? (
              selectedLabels.map((item) => (
                <span
                  key={item.value}
                  className="inline-flex items-center px-2 py-1 rounded-md text-sm bg-blue-100 text-blue-800"
                >
                  {item.label}
                  {!disabled && (
                    <button
                      onClick={(e) => removeOption(item.value, e)}
                      className="ml-1 hover:text-blue-900"
                      type="button"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  )}
                </span>
              ))
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
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className={`absolute z-50 w-full mt-1 rounded-lg shadow-lg border ${getThemeClasses("bg-primary")} ${getThemeClasses("border-secondary")}`}>
            {/* Search Input */}
            <div className={`p-2 border-b ${getThemeClasses("border-secondary")}`}>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search insurance requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-sm border-2 rounded-lg shadow-sm focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${getThemeClasses("border-secondary")} ${getThemeClasses("bg-primary")} ${getThemeClasses("text-primary")}`}
                  onClick={(e) => e.stopPropagation()}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {isSearchMode && (
                <div className={`mt-2 text-xs flex items-center ${getThemeClasses("text-secondary")}`}>
                  <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400 mr-1"></div>
                  Searching: "{searchTerm}"
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-4 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className={`mt-2 text-sm ${getThemeClasses("text-secondary")}`}>
                    Loading insurance requirements...
                  </p>
                </div>
              ) : options.length > 0 ? (
                options.map((option) => {
                  const isSelected = currentValue.includes(option.value);
                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleOption(option.value)}
                      className={`
                        px-3 py-2 cursor-pointer flex items-center justify-between
                        ${getThemeClasses("hover:bg-hover")}
                        ${isSelected ? "bg-blue-50" : ""}
                      `}
                    >
                      <span
                        className={`text-sm ${
                          isSelected
                            ? "text-blue-700 font-medium"
                            : getThemeClasses("text-primary")
                        }`}
                      >
                        {option.label}
                      </span>
                      {isSelected && (
                        <CheckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className={`px-3 py-4 text-center text-sm ${getThemeClasses("text-secondary")}`}>
                  {searchLoading
                    ? "Searching..."
                    : searchTerm
                      ? `No insurance requirements found for "${searchTerm}"`
                      : "No insurance requirements available"}
                </div>
              )}
            </div>

            {/* Results info */}
            {!isLoading && !searchLoading && options.length > 0 && (
              <div className={`px-3 py-2 border-t text-xs ${getThemeClasses("border-secondary")} ${getThemeClasses("text-secondary")}`}>
                {isSearchMode
                  ? `Found ${options.length} result${options.length !== 1 ? "s" : ""}`
                  : `${options.length} insurance requirement${options.length !== 1 ? "s" : ""} available`}
              </div>
            )}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className={`mt-2 text-sm ${getThemeClasses("text-secondary")}`}>{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center animate-fade-in">{error}</p>
      )}
    </div>
  );
}

export default InsuranceRequirementsMultiSelect;
