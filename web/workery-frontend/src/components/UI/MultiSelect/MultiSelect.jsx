// File: web/workery-frontend/src/components/UI/MultiSelect.jsx

import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";

/**
 * Custom MultiSelect Component
 * A dropdown that allows selecting multiple options
 */
export function MultiSelect({
  label,
  options = [],
  value = [], // Array of selected values
  onChange,
  placeholder = "Select options...",
  error,
  disabled = false,
  required = false,
  helperText,
  className = "",
  maxHeight = "200px",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
                        <XMarkIcon className="h-3 w-3" />
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
                <XMarkIcon className="h-4 w-4" />
              </button>
            )}
            <ChevronDownIcon
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto" style={{ maxHeight }}>
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
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
                        <CheckIcon className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No options found
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
    </div>
  );
}

export default MultiSelect;
