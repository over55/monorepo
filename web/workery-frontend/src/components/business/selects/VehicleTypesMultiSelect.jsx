// File: monorepo/web/workery-frontend/src/components/business/selects/VehicleTypesMultiSelect.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useVehicleTypeManager } from "../../../services/Services";
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
 * VehicleTypesMultiSelect Component
 * A multi-select dropdown for selecting vehicle types with search functionality
 * that fetches filtered results from the backend
 *
 * @param {string} label - Field label
 * @param {Array} value - Array of selected vehicle type IDs
 * @param {Function} onChange - Handler for value changes
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {boolean} disabled - Whether the field is disabled
 * @param {boolean} required - Whether the field is required
 * @param {string} helperText - Helper text to display
 * @param {string} className - Additional CSS classes
 * @param {Function} onUnauthorized - Callback for unauthorized errors
 */
function VehicleTypesMultiSelect({
  label,
  value = [],
  onChange,
  placeholder = "Select vehicle types...",
  error,
  disabled = false,
  required = false,
  helperText,
  className = "",
  onUnauthorized = null,
}) {
  const vehicleTypeManager = useVehicleTypeManager();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Track if we're using search results or default options
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Load default options (without search)
  const loadDefaultOptions = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log("Loading default vehicle type options");

      // For default options, use the select options endpoint
      const vehicleTypeOptions =
        await vehicleTypeManager.getVehicleTypeSelectOptions(
          onUnauthorized,
          false, // Don't force refresh for default options
        );

      if (vehicleTypeOptions) {
        // Handle both array and object response formats
        let optionsList = [];

        if (Array.isArray(vehicleTypeOptions)) {
          optionsList = vehicleTypeOptions;
        } else if (vehicleTypeOptions.results) {
          optionsList = vehicleTypeOptions.results;
        }

        // Transform to consistent format
        const transformedOptions = optionsList.map((item) => ({
          value: item.value || item.id,
          label: item.label || item.text || item.name,
        }));

        console.log("Default options loaded:", transformedOptions);
        setOptions(transformedOptions);
      }
    } catch (error) {
      console.error("Error loading default vehicle type options:", error);
      setOptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [vehicleTypeManager, onUnauthorized]);

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
        console.log("Searching vehicle types with query:", searchQuery);

        // Use getVehicleTypes with search parameter to get filtered results from backend
        const searchParams = {
          search: searchQuery.trim(),
          page: 1,
          limit: 100,
          status: 1, // Active status
        };

        const searchResults = await vehicleTypeManager.getVehicleTypes(
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

          console.log("Search results:", transformedOptions);
          setOptions(transformedOptions);
        } else {
          setOptions([]);
        }
      } catch (error) {
        console.error("Error searching vehicle types:", error);
        setOptions([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [vehicleTypeManager, onUnauthorized, loadDefaultOptions],
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
        setIsOpen(false);
        // Reset search when closing
        setSearchTerm("");
        setIsSearchMode(false);
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
    // For selected items, we need to check both current options and cached data
    return value
      .map((selectedValue) => {
        const option = options.find((opt) => opt.value === selectedValue);
        if (option) {
          return { value: selectedValue, label: option.label };
        }
        // If not in current options, return with ID as label (will be resolved when options load)
        return { value: selectedValue, label: `Vehicle Type ${selectedValue}` };
      })
      .filter(Boolean);
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

  return (
    <div className={`mb-5 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative" ref={dropdownRef}>
        {/* Main Input/Display Area */}
        <div
          onClick={handleDropdownClick}
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
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search vehicle types..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
                {searchLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              {isSearchMode && (
                <div className="mt-1 text-xs text-gray-500">
                  Searching: "{searchTerm}"
                </div>
              )}
            </div>

            {/* Options List */}
            <div className="max-h-[200px] overflow-y-auto">
              {isLoading ? (
                <div className="px-3 py-4 text-center">
                  <div className="inline-block w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-2 text-sm text-gray-500">
                    Loading vehicle types...
                  </p>
                </div>
              ) : options.length > 0 ? (
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
                        className={`text-sm ${
                          isSelected
                            ? "text-blue-700 font-medium"
                            : "text-gray-700"
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
                <div className="px-3 py-4 text-center text-sm text-gray-500">
                  {searchLoading
                    ? "Searching..."
                    : searchTerm
                      ? `No vehicle types found for "${searchTerm}"`
                      : "No vehicle types available"}
                </div>
              )}
            </div>

            {/* Results info */}
            {!isLoading && !searchLoading && options.length > 0 && (
              <div className="px-3 py-2 border-t border-gray-200 text-xs text-gray-500">
                {isSearchMode
                  ? `Found ${options.length} result${options.length !== 1 ? "s" : ""}`
                  : `${options.length} vehicle type${options.length !== 1 ? "s" : ""} available`}
              </div>
            )}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">{error}</p>
      )}
    </div>
  );
}

export default VehicleTypesMultiSelect;
