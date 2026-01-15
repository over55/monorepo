// File Path: web/frontend/src/components/UIX/AddressFormStep/AddressFormStep.jsx
// UIX Mobile Optimizations Applied
// Reusable AddressFormStep component for complete address collection workflows - Performance Optimized

import React, { useMemo, memo } from "react";
import { HomeIcon } from "@heroicons/react/24/outline";
import { AddressFormCard, ShippingAddressFormCard } from "../";

/**
 * Reusable AddressFormStep Component - Performance Optimized
 * A complete address collection step that handles both billing and optional shipping addresses
 * Perfect for any entity that needs address collection (Staff, Customer, Organization, etc.)
 *
 * Features:
 * - Complete billing/primary address form
 * - Optional shipping/alternative address form
 * - Configurable country and region options
 * - Built-in form validation support
 * - Proper spacing and layout
 * - Optimized for minimal re-renders
 * - Can be used standalone or within wizard workflows
 */
const AddressFormStep = memo(
  function AddressFormStep({
    // Content props
    billingTitle,
    billingSubtitle = "Primary address information",
    shippingTitle = "Shipping Address",
    shippingSubtitle = "Alternative address for deliveries and shipments",
    billingIcon = HomeIcon,
    shippingIcon,

    // Billing address values
    country = "",
    region = "",
    city = "",
    postalCode = "",
    addressLine1 = "",
    addressLine2 = "",

    // Billing address handlers
    onCountryChange = () => {},
    onRegionChange = () => {},
    onCityChange = () => {},
    onPostalCodeChange = () => {},
    onAddressLine1Change = () => {},
    onAddressLine2Change = () => {},

    // Shipping address toggle
    hasShippingAddress = false,
    onHasShippingAddressChange = () => {},

    // Shipping address values
    shippingContactName = "",
    shippingPhone = "",
    shippingCountry = "",
    shippingRegion = "",
    shippingCity = "",
    shippingPostalCode = "",
    shippingAddressLine1 = "",
    shippingAddressLine2 = "",

    // Shipping address handlers
    onShippingContactNameChange = () => {},
    onShippingPhoneChange = () => {},
    onShippingCountryChange = () => {},
    onShippingRegionChange = () => {},
    onShippingCityChange = () => {},
    onShippingPostalCodeChange = () => {},
    onShippingAddressLine1Change = () => {},
    onShippingAddressLine2Change = () => {},

    // Options
    countryOptions = [],
    regionOptions = [],

    // State props
    errors = {},
    showShippingToggle = true,

    // Style props
    className = "",
  }) {
    // Determine billing title based on whether shipping is enabled
    const finalBillingTitle = useMemo(
      () =>
        billingTitle ||
        (hasShippingAddress ? "Billing Address" : "Address Information"),
      [billingTitle, hasShippingAddress],
    );

    // Memoize container classes
    const containerClasses = useMemo(
      () => `space-y-8 ${className}`.trim(),
      [className],
    );

    // Group billing address data for cleaner memoization
    const billingData = useMemo(
      () => ({
        values: {
          country,
          region,
          city,
          postalCode,
          addressLine1,
          addressLine2,
        },
        handlers: {
          onCountryChange,
          onRegionChange,
          onCityChange,
          onPostalCodeChange,
          onAddressLine1Change,
          onAddressLine2Change,
        },
        meta: {
          title: finalBillingTitle,
          subtitle: billingSubtitle,
          icon: billingIcon,
          hasShippingAddress,
          onHasShippingAddressChange,
          showShippingToggle,
        },
      }),
      [
        country,
        region,
        city,
        postalCode,
        addressLine1,
        addressLine2,
        onCountryChange,
        onRegionChange,
        onCityChange,
        onPostalCodeChange,
        onAddressLine1Change,
        onAddressLine2Change,
        finalBillingTitle,
        billingSubtitle,
        billingIcon,
        hasShippingAddress,
        onHasShippingAddressChange,
        showShippingToggle,
      ],
    );

    // Group shipping address data for cleaner memoization
    const shippingData = useMemo(
      () => ({
        values: {
          contactName: shippingContactName,
          phone: shippingPhone,
          country: shippingCountry,
          region: shippingRegion,
          city: shippingCity,
          postalCode: shippingPostalCode,
          addressLine1: shippingAddressLine1,
          addressLine2: shippingAddressLine2,
        },
        handlers: {
          onContactNameChange: onShippingContactNameChange,
          onPhoneChange: onShippingPhoneChange,
          onCountryChange: onShippingCountryChange,
          onRegionChange: onShippingRegionChange,
          onCityChange: onShippingCityChange,
          onPostalCodeChange: onShippingPostalCodeChange,
          onAddressLine1Change: onShippingAddressLine1Change,
          onAddressLine2Change: onShippingAddressLine2Change,
        },
        meta: {
          title: shippingTitle,
          subtitle: shippingSubtitle,
          icon: shippingIcon,
        },
      }),
      [
        shippingContactName,
        shippingPhone,
        shippingCountry,
        shippingRegion,
        shippingCity,
        shippingPostalCode,
        shippingAddressLine1,
        shippingAddressLine2,
        onShippingContactNameChange,
        onShippingPhoneChange,
        onShippingCountryChange,
        onShippingRegionChange,
        onShippingCityChange,
        onShippingPostalCodeChange,
        onShippingAddressLine1Change,
        onShippingAddressLine2Change,
        shippingTitle,
        shippingSubtitle,
        shippingIcon,
      ],
    );

    // Memoize the billing address card
    const BillingAddressCard = useMemo(
      () => (
        <AddressFormCard
          title={billingData.meta.title}
          subtitle={billingData.meta.subtitle}
          icon={billingData.meta.icon}
          country={billingData.values.country}
          onCountryChange={billingData.handlers.onCountryChange}
          region={billingData.values.region}
          onRegionChange={billingData.handlers.onRegionChange}
          city={billingData.values.city}
          onCityChange={billingData.handlers.onCityChange}
          postalCode={billingData.values.postalCode}
          onPostalCodeChange={billingData.handlers.onPostalCodeChange}
          addressLine1={billingData.values.addressLine1}
          onAddressLine1Change={billingData.handlers.onAddressLine1Change}
          addressLine2={billingData.values.addressLine2}
          onAddressLine2Change={billingData.handlers.onAddressLine2Change}
          hasShippingAddress={billingData.meta.hasShippingAddress}
          onHasShippingAddressChange={
            billingData.meta.onHasShippingAddressChange
          }
          countryOptions={countryOptions}
          regionOptions={regionOptions}
          errors={errors}
          showShippingToggle={billingData.meta.showShippingToggle}
        />
      ),
      [billingData, countryOptions, regionOptions, errors],
    );

    // Memoize the shipping address card
    const ShippingCard = useMemo(() => {
      if (!hasShippingAddress) return null;

      return (
        <ShippingAddressFormCard
          title={shippingData.meta.title}
          subtitle={shippingData.meta.subtitle}
          icon={shippingData.meta.icon}
          contactName={shippingData.values.contactName}
          onContactNameChange={shippingData.handlers.onContactNameChange}
          phone={shippingData.values.phone}
          onPhoneChange={shippingData.handlers.onPhoneChange}
          country={shippingData.values.country}
          onCountryChange={shippingData.handlers.onCountryChange}
          region={shippingData.values.region}
          onRegionChange={shippingData.handlers.onRegionChange}
          city={shippingData.values.city}
          onCityChange={shippingData.handlers.onCityChange}
          postalCode={shippingData.values.postalCode}
          onPostalCodeChange={shippingData.handlers.onPostalCodeChange}
          addressLine1={shippingData.values.addressLine1}
          onAddressLine1Change={shippingData.handlers.onAddressLine1Change}
          addressLine2={shippingData.values.addressLine2}
          onAddressLine2Change={shippingData.handlers.onAddressLine2Change}
          countryOptions={countryOptions}
          regionOptions={regionOptions}
          errors={errors}
        />
      );
    }, [
      hasShippingAddress,
      shippingData,
      countryOptions,
      regionOptions,
      errors,
    ]);

    return (
      <div className={containerClasses}>
        {/* Billing/Primary Address Section */}
        {BillingAddressCard}

        {/* Shipping Address Section */}
        {ShippingCard}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function - only re-render when these props actually change
    return (
      // Content props
      prevProps.billingTitle === nextProps.billingTitle &&
      prevProps.billingSubtitle === nextProps.billingSubtitle &&
      prevProps.shippingTitle === nextProps.shippingTitle &&
      prevProps.shippingSubtitle === nextProps.shippingSubtitle &&
      prevProps.billingIcon === nextProps.billingIcon &&
      prevProps.shippingIcon === nextProps.shippingIcon &&
      // Billing address values
      prevProps.country === nextProps.country &&
      prevProps.region === nextProps.region &&
      prevProps.city === nextProps.city &&
      prevProps.postalCode === nextProps.postalCode &&
      prevProps.addressLine1 === nextProps.addressLine1 &&
      prevProps.addressLine2 === nextProps.addressLine2 &&
      // Billing handlers
      prevProps.onCountryChange === nextProps.onCountryChange &&
      prevProps.onRegionChange === nextProps.onRegionChange &&
      prevProps.onCityChange === nextProps.onCityChange &&
      prevProps.onPostalCodeChange === nextProps.onPostalCodeChange &&
      prevProps.onAddressLine1Change === nextProps.onAddressLine1Change &&
      prevProps.onAddressLine2Change === nextProps.onAddressLine2Change &&
      // Shipping toggle
      prevProps.hasShippingAddress === nextProps.hasShippingAddress &&
      prevProps.onHasShippingAddressChange ===
        nextProps.onHasShippingAddressChange &&
      prevProps.showShippingToggle === nextProps.showShippingToggle &&
      // Shipping address values
      prevProps.shippingContactName === nextProps.shippingContactName &&
      prevProps.shippingPhone === nextProps.shippingPhone &&
      prevProps.shippingCountry === nextProps.shippingCountry &&
      prevProps.shippingRegion === nextProps.shippingRegion &&
      prevProps.shippingCity === nextProps.shippingCity &&
      prevProps.shippingPostalCode === nextProps.shippingPostalCode &&
      prevProps.shippingAddressLine1 === nextProps.shippingAddressLine1 &&
      prevProps.shippingAddressLine2 === nextProps.shippingAddressLine2 &&
      // Shipping handlers
      prevProps.onShippingContactNameChange ===
        nextProps.onShippingContactNameChange &&
      prevProps.onShippingPhoneChange === nextProps.onShippingPhoneChange &&
      prevProps.onShippingCountryChange === nextProps.onShippingCountryChange &&
      prevProps.onShippingRegionChange === nextProps.onShippingRegionChange &&
      prevProps.onShippingCityChange === nextProps.onShippingCityChange &&
      prevProps.onShippingPostalCodeChange ===
        nextProps.onShippingPostalCodeChange &&
      prevProps.onShippingAddressLine1Change ===
        nextProps.onShippingAddressLine1Change &&
      prevProps.onShippingAddressLine2Change ===
        nextProps.onShippingAddressLine2Change &&
      // Options and errors (deep comparison)
      JSON.stringify(prevProps.countryOptions) ===
        JSON.stringify(nextProps.countryOptions) &&
      JSON.stringify(prevProps.regionOptions) ===
        JSON.stringify(nextProps.regionOptions) &&
      JSON.stringify(prevProps.errors) === JSON.stringify(nextProps.errors) &&
      // Style props
      prevProps.className === nextProps.className
    );
  },
);

// Set display name for debugging
AddressFormStep.displayName = "AddressFormStep";

export default AddressFormStep;

// Export for reuse in other components
export { AddressFormStep };
