// File Path: web/frontend/src/components/UIX/AddressFormCard/AddressFormCard.jsx
// UIX Mobile Optimizations Applied
// Reusable AddressFormCard component for standard address forms - Performance Optimized

import React, { useMemo, memo } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import { FormCard, FormSection, FormRow, Input, Select, Checkbox } from "../";

// Default options moved outside component to prevent recreation
const DEFAULT_COUNTRY_OPTIONS = [
  { value: "Canada", label: "Canada" },
  { value: "United States", label: "United States" },
  { value: "Mexico", label: "Mexico" },
];

const DEFAULT_REGION_OPTIONS = [
  { value: "Alberta", label: "Alberta" },
  { value: "British Columbia", label: "British Columbia" },
  { value: "Manitoba", label: "Manitoba" },
  { value: "New Brunswick", label: "New Brunswick" },
  { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
  { value: "Northwest Territories", label: "Northwest Territories" },
  { value: "Nova Scotia", label: "Nova Scotia" },
  { value: "Nunavut", label: "Nunavut" },
  { value: "Ontario", label: "Ontario" },
  { value: "Prince Edward Island", label: "Prince Edward Island" },
  { value: "Quebec", label: "Quebec" },
  { value: "Saskatchewan", label: "Saskatchewan" },
  { value: "Yukon", label: "Yukon" },
];

/**
 * Reusable AddressFormCard Component - Performance Optimized
 * A standardized address form card that handles billing/primary addresses
 * Perfect for any entity that needs address collection (Staff, Customer, Organization, etc.)
 *
 * Features:
 * - Complete address form with country, region, city, postal code, and address lines
 * - Configurable country and region options
 * - Optional shipping address toggle
 * - Proper form validation support
 * - Consistent styling with FormCard wrapper
 * - Optimized for minimal re-renders
 *
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Billing Address", "Address Information")
 * @param {string} props.subtitle - Card subtitle
 * @param {React.Component} props.icon - Icon for the card header
 * @param {string} props.country - Country value
 * @param {function} props.onCountryChange - Country change handler (receives value)
 * @param {string} props.region - Region/Province value
 * @param {function} props.onRegionChange - Region change handler (receives value)
 * @param {string} props.city - City value
 * @param {function} props.onCityChange - City change handler (receives value)
 * @param {string} props.postalCode - Postal code value
 * @param {function} props.onPostalCodeChange - Postal code change handler (receives value)
 * @param {string} props.addressLine1 - Address line 1 value
 * @param {function} props.onAddressLine1Change - Address line 1 change handler (receives value)
 * @param {string} props.addressLine2 - Address line 2 value
 * @param {function} props.onAddressLine2Change - Address line 2 change handler (receives value)
 * @param {boolean} props.hasShippingAddress - Whether shipping address is enabled
 * @param {function} props.onHasShippingAddressChange - Shipping address toggle handler (receives checked)
 * @param {Array} props.countryOptions - Array of {value, label} country options
 * @param {Array} props.regionOptions - Array of {value, label} region options
 * @param {Object} props.errors - Error object with field names as keys
 * @param {boolean} props.showShippingToggle - Whether to show shipping address toggle
 * @param {string} props.maxWidth - Max width for the card
 * @param {string} props.className - Additional CSS classes
 */
const AddressFormCard = memo(
  function AddressFormCard({
    // Content props
    title = "Address Information",
    subtitle = "Enter address details",
    icon: Icon = HomeIcon,

    // Address values
    country = "",
    region = "",
    city = "",
    postalCode = "",
    addressLine1 = "",
    addressLine2 = "",

    // Change handlers
    onCountryChange = () => {},
    onRegionChange = () => {},
    onCityChange = () => {},
    onPostalCodeChange = () => {},
    onAddressLine1Change = () => {},
    onAddressLine2Change = () => {},

    // Shipping address props
    hasShippingAddress = false,
    onHasShippingAddressChange = () => {},
    showShippingToggle = true,

    // Options
    countryOptions = [],
    regionOptions = [],

    // State props
    errors = {},

    // Style props
    maxWidth = "7xl",
    className = "",
  }) {
    // Memoize final options to prevent recalculation
    const finalOptions = useMemo(
      () => ({
        country:
          countryOptions.length > 0 ? countryOptions : DEFAULT_COUNTRY_OPTIONS,
        region:
          regionOptions.length > 0 ? regionOptions : DEFAULT_REGION_OPTIONS,
      }),
      [countryOptions, regionOptions],
    );

    // Memoize all error values at once for better efficiency
    const fieldErrors = useMemo(
      () => ({
        country: errors.country || null,
        region: errors.region || null,
        city: errors.city || null,
        postalCode: errors.postalCode || null,
        addressLine1: errors.addressLine1 || null,
        addressLine2: errors.addressLine2 || null,
      }),
      [
        errors.country,
        errors.region,
        errors.city,
        errors.postalCode,
        errors.addressLine1,
        errors.addressLine2,
      ],
    );

    // Memoize all field values at once
    const fieldValues = useMemo(
      () => ({
        country,
        region,
        city,
        postalCode,
        addressLine1,
        addressLine2,
      }),
      [country, region, city, postalCode, addressLine1, addressLine2],
    );

    // Memoize all handlers at once
    const handlers = useMemo(
      () => ({
        country: onCountryChange,
        region: onRegionChange,
        city: onCityChange,
        postalCode: onPostalCodeChange,
        addressLine1: onAddressLine1Change,
        addressLine2: onAddressLine2Change,
        hasShippingAddress: onHasShippingAddressChange,
      }),
      [
        onCountryChange,
        onRegionChange,
        onCityChange,
        onPostalCodeChange,
        onAddressLine1Change,
        onAddressLine2Change,
        onHasShippingAddressChange,
      ],
    );

    // Memoize the shipping toggle section
    const ShippingToggle = useMemo(() => {
      if (!showShippingToggle) return null;

      return (
        <div className="pt-4 border-t border-gray-200">
          <Checkbox
            label="Has shipping address different from billing address"
            checked={hasShippingAddress}
            onChange={handlers.hasShippingAddress}
          />
        </div>
      );
    }, [showShippingToggle, hasShippingAddress, handlers.hasShippingAddress]);

    // Memoize the entire form content
    const FormContent = useMemo(
      () => (
        <FormSection title="Location Details">
          <FormRow columns={2}>
            <Select
              label="Country"
              value={fieldValues.country}
              onChange={handlers.country}
              options={finalOptions.country}
              error={fieldErrors.country}
              required
            />
            <Select
              label="Province/Territory"
              value={fieldValues.region}
              onChange={handlers.region}
              options={finalOptions.region}
              error={fieldErrors.region}
              required
            />
          </FormRow>

          <FormRow columns={2}>
            <Input
              label="City"
              type="text"
              value={fieldValues.city}
              onChange={handlers.city}
              placeholder="Enter city"
              error={fieldErrors.city}
              required
            />
            <Input
              label="Postal Code"
              type="text"
              value={fieldValues.postalCode}
              onChange={handlers.postalCode}
              placeholder="Enter postal code"
              error={fieldErrors.postalCode}
              required
            />
          </FormRow>

          <FormRow columns={2}>
            <Input
              label="Address Line 1"
              type="text"
              value={fieldValues.addressLine1}
              onChange={handlers.addressLine1}
              placeholder="Enter street address"
              error={fieldErrors.addressLine1}
              required
            />
            <Input
              label="Address Line 2"
              type="text"
              value={fieldValues.addressLine2}
              onChange={handlers.addressLine2}
              placeholder="Apartment, suite, etc. (optional)"
              error={fieldErrors.addressLine2}
            />
          </FormRow>

          {ShippingToggle}
        </FormSection>
      ),
      [fieldValues, handlers, finalOptions, fieldErrors, ShippingToggle],
    );

    return (
      <FormCard
        title={title}
        subtitle={subtitle}
        icon={Icon}
        maxWidth={maxWidth}
        className={className}
      >
        {FormContent}
      </FormCard>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      // Header props
      prevProps.title === nextProps.title &&
      prevProps.subtitle === nextProps.subtitle &&
      prevProps.icon === nextProps.icon &&
      // Field values
      prevProps.country === nextProps.country &&
      prevProps.region === nextProps.region &&
      prevProps.city === nextProps.city &&
      prevProps.postalCode === nextProps.postalCode &&
      prevProps.addressLine1 === nextProps.addressLine1 &&
      prevProps.addressLine2 === nextProps.addressLine2 &&
      // Handlers (check reference equality)
      prevProps.onCountryChange === nextProps.onCountryChange &&
      prevProps.onRegionChange === nextProps.onRegionChange &&
      prevProps.onCityChange === nextProps.onCityChange &&
      prevProps.onPostalCodeChange === nextProps.onPostalCodeChange &&
      prevProps.onAddressLine1Change === nextProps.onAddressLine1Change &&
      prevProps.onAddressLine2Change === nextProps.onAddressLine2Change &&
      prevProps.onHasShippingAddressChange ===
        nextProps.onHasShippingAddressChange &&
      // Shipping toggle
      prevProps.hasShippingAddress === nextProps.hasShippingAddress &&
      prevProps.showShippingToggle === nextProps.showShippingToggle &&
      // Options (deep comparison)
      JSON.stringify(prevProps.countryOptions) ===
        JSON.stringify(nextProps.countryOptions) &&
      JSON.stringify(prevProps.regionOptions) ===
        JSON.stringify(nextProps.regionOptions) &&
      // Errors (deep comparison)
      JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors) &&
      // Style props
      prevProps.maxWidth === nextProps.maxWidth &&
      prevProps.className === nextProps.className
    );
  },
);

// Set display name for debugging
AddressFormCard.displayName = "AddressFormCard";

export default AddressFormCard;

// Export for reuse in other components
export { AddressFormCard };
