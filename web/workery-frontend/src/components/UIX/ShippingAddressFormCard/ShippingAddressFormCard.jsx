// File Path: web/frontend/src/components/UIX/ShippingAddressFormCard/ShippingAddressFormCard.jsx
// UIX Mobile Optimizations Applied
// Reusable ShippingAddressFormCard component for shipping/alternative address forms

import React, { memo, useMemo } from "react";
import {
  TruckIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import {
  FormCard,
  FormSection,
  FormRow,
  Input,
  Select,
} from "../";

// Move static default values outside component to prevent recreation
const DEFAULT_TITLE = "Shipping Address";
const DEFAULT_SUBTITLE = "Alternative address for deliveries and shipments";
const DEFAULT_MAX_WIDTH = "7xl";

// Default country options
const DEFAULT_COUNTRY_OPTIONS = [
  { value: "Canada", label: "Canada" },
  { value: "United States", label: "United States" },
  { value: "Mexico", label: "Mexico" },
];

// Default region options (Canadian provinces/territories)
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
 * Reusable ShippingAddressFormCard Component - Performance Optimized
 * A standardized shipping/alternative address form card
 * Perfect for any entity that needs alternative address collection (Staff, Customer, Organization, etc.)
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values and options moved outside component
 * - Memoized final options computation
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Complete shipping address form with contact info and address details
 * - Configurable country and region options
 * - Contact name and phone fields
 * - Proper form validation support
 * - Consistent styling with FormCard wrapper
 * - Memoized handlers for optimal performance
 *
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Shipping Address", "Alternative Address")
 * @param {string} props.subtitle - Card subtitle
 * @param {React.Component} props.icon - Icon for the card header
 * @param {string} props.contactName - Contact name value
 * @param {function} props.onContactNameChange - Contact name change handler (receives value)
 * @param {string} props.phone - Phone value
 * @param {function} props.onPhoneChange - Phone change handler (receives value)
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
 * @param {Array} props.countryOptions - Array of {value, label} country options
 * @param {Array} props.regionOptions - Array of {value, label} region options
 * @param {Object} props.errors - Error object with field names as keys
 * @param {string} props.maxWidth - Max width for the card
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * // Basic usage for staff shipping address
 * <ShippingAddressFormCard
 *   title="Shipping Address"
 *   subtitle="Alternative address for deliveries and shipments"
 *   contactName={shippingName}
 *   onContactNameChange={handleShippingNameChange}
 *   phone={shippingPhone}
 *   onPhoneChange={handleShippingPhoneChange}
 *   country={shippingCountry}
 *   onCountryChange={handleShippingCountryChange}
 *   region={shippingRegion}
 *   onRegionChange={handleShippingRegionChange}
 *   city={shippingCity}
 *   onCityChange={handleShippingCityChange}
 *   postalCode={shippingPostalCode}
 *   onPostalCodeChange={handleShippingPostalCodeChange}
 *   addressLine1={shippingAddressLine1}
 *   onAddressLine1Change={handleShippingAddressLine1Change}
 *   addressLine2={shippingAddressLine2}
 *   onAddressLine2Change={handleShippingAddressLine2Change}
 *   countryOptions={countryOptions}
 *   regionOptions={regionOptions}
 *   errors={errors}
 * />
 */
const ShippingAddressFormCard = memo(function ShippingAddressFormCard({
  // Content props
  title = DEFAULT_TITLE,
  subtitle = DEFAULT_SUBTITLE,
  icon: Icon = TruckIcon,

  // Contact values
  contactName = "",
  phone = "",

  // Address values
  country = "",
  region = "",
  city = "",
  postalCode = "",
  addressLine1 = "",
  addressLine2 = "",

  // Change handlers
  onContactNameChange = () => {},
  onPhoneChange = () => {},
  onCountryChange = () => {},
  onRegionChange = () => {},
  onCityChange = () => {},
  onPostalCodeChange = () => {},
  onAddressLine1Change = () => {},
  onAddressLine2Change = () => {},

  // Options
  countryOptions = [],
  regionOptions = [],

  // State props
  errors = {},

  // Style props
  maxWidth = DEFAULT_MAX_WIDTH,
  className = "",
}) {
  // Memoize final options - use provided options if available, otherwise use defaults
  const finalCountryOptions = useMemo(() => {
    return countryOptions.length > 0 ? countryOptions : DEFAULT_COUNTRY_OPTIONS;
  }, [countryOptions]);

  const finalRegionOptions = useMemo(() => {
    return regionOptions.length > 0 ? regionOptions : DEFAULT_REGION_OPTIONS;
  }, [regionOptions]);

  return (
    <FormCard
      title={title}
      subtitle={subtitle}
      icon={Icon}
      maxWidth={maxWidth}
      className={className}
    >
      <FormSection title="Contact Information">
        <FormRow columns={2}>
          <Input
            label="Contact Name"
            type="text"
            value={contactName}
            onChange={onContactNameChange}
            placeholder="Contact name for shipping"
            error={errors.contactName || errors.shippingName}
            required
          />
          <Input
            label="Phone Number"
            type="tel"
            value={phone}
            onChange={onPhoneChange}
            placeholder="Contact phone for shipping"
            icon={PhoneIcon}
            error={errors.phone || errors.shippingPhone}
            required
          />
        </FormRow>
      </FormSection>

      <FormSection title="Shipping Location">
        <FormRow columns={2}>
          <Select
            label="Country"
            value={country}
            onChange={onCountryChange}
            options={finalCountryOptions}
            error={errors.country || errors.shippingCountry}
            required
          />
          <Select
            label="Province/Territory"
            value={region}
            onChange={onRegionChange}
            options={finalRegionOptions}
            error={errors.region || errors.shippingRegion}
            required
          />
        </FormRow>

        <FormRow columns={2}>
          <Input
            label="City"
            type="text"
            value={city}
            onChange={onCityChange}
            placeholder="Enter city"
            error={errors.city || errors.shippingCity}
            required
          />
          <Input
            label="Postal Code"
            type="text"
            value={postalCode}
            onChange={onPostalCodeChange}
            placeholder="Enter postal code"
            error={errors.postalCode || errors.shippingPostalCode}
            required
          />
        </FormRow>

        <FormRow columns={2}>
          <Input
            label="Address Line 1"
            type="text"
            value={addressLine1}
            onChange={onAddressLine1Change}
            placeholder="Enter street address"
            error={errors.addressLine1 || errors.shippingAddressLine1}
            required
          />
          <Input
            label="Address Line 2"
            type="text"
            value={addressLine2}
            onChange={onAddressLine2Change}
            placeholder="Apartment, suite, etc. (optional)"
            error={errors.addressLine2 || errors.shippingAddressLine2}
          />
        </FormRow>
      </FormSection>
    </FormCard>
  );
});

// Set display name for React DevTools
ShippingAddressFormCard.displayName = 'ShippingAddressFormCard';

export default ShippingAddressFormCard;