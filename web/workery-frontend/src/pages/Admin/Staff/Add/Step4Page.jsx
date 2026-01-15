// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step4Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep4Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  UserPlusIcon,
  HomeIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  AddressFormStep,
  UIXThemeProvider,
} from "../../../../components/UIX";

// Wizard configuration (static, moved outside component)
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
];

// Country options
const COUNTRY_OPTIONS = [
  { value: "Canada", label: "Canada" },
  { value: "United States", label: "United States" },
  { value: "Mexico", label: "Mexico" },
];

// Region options (Canadian provinces/territories)
const REGION_OPTIONS = [
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

// Memoized content component
const Step4Content = memo(function Step4Content() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const wizardState = useMemo(() => {
    const state = wizardStorage.getWizardState();
    return state;
  }, [wizardStorage]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Billing address form data
  const [country, setCountry] = useState(wizardState.country || "Canada");
  const [region, setRegion] = useState(wizardState.region || "Ontario");
  const [city, setCity] = useState(wizardState.city || "");
  const [postalCode, setPostalCode] = useState(wizardState.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(wizardState.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(wizardState.addressLine2 || "");
  const [hasShippingAddress, setHasShippingAddress] = useState(
    wizardState.hasShippingAddress || false
  );

  // Shipping address data
  const [shippingName, setShippingName] = useState(wizardState.shippingName || "");
  const [shippingPhone, setShippingPhone] = useState(wizardState.shippingPhone || "");
  const [shippingCountry, setShippingCountry] = useState(
    wizardState.shippingCountry || "Canada"
  );
  const [shippingRegion, setShippingRegion] = useState(
    wizardState.shippingRegion || "Ontario"
  );
  const [shippingCity, setShippingCity] = useState(wizardState.shippingCity || "");
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    wizardState.shippingAddressLine1 || ""
  );
  const [shippingAddressLine2, setShippingAddressLine2] = useState(
    wizardState.shippingAddressLine2 || ""
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    wizardState.shippingPostalCode || ""
  );

  // Check for existing state on mount
  useEffect(() => {
    window.scrollTo(0, 0);
    // If no wizard state exists, redirect back to step 1
    if (!wizardState || Object.keys(wizardState).length === 0) {
      navigate("/admin/staff/add/step-1-search");
    }
  }, [wizardState, navigate]);

  // Handle form submission
  const handleNext = useCallback(() => {
    setErrors({});
    setIsLoading(true);

    let newErrors = {};
    let hasErrors = false;

    // Billing address validation
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
      hasErrors = true;
    }
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
      hasErrors = true;
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!region.trim()) {
      newErrors.region = "Province/Territory is required";
      hasErrors = true;
    }
    if (!country.trim()) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }

    // Shipping address validation (if enabled)
    if (hasShippingAddress) {
      if (!shippingName.trim()) {
        newErrors.shippingContactName = "Shipping name is required";
        hasErrors = true;
      }
      if (!shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
        hasErrors = true;
      }
      if (!shippingCountry.trim()) {
        newErrors.shippingCountry = "Shipping country is required";
        hasErrors = true;
      }
      if (!shippingRegion.trim()) {
        newErrors.shippingRegion = "Shipping province/territory is required";
        hasErrors = true;
      }
      if (!shippingCity.trim()) {
        newErrors.shippingCity = "Shipping city is required";
        hasErrors = true;
      }
      if (!shippingAddressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
        hasErrors = true;
      }
      if (!shippingPostalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    // Save to wizard storage
    wizardStorage.updateWizardState({
      postalCode,
      addressLine1,
      addressLine2,
      city,
      region,
      country,
      hasShippingAddress,
      shippingName,
      shippingPhone,
      shippingCountry,
      shippingRegion,
      shippingCity,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingPostalCode,
    });

    setIsLoading(false);
    navigate("/admin/staff/add/step-5");
  }, [
    postalCode,
    addressLine1,
    addressLine2,
    city,
    region,
    country,
    hasShippingAddress,
    shippingName,
    shippingPhone,
    shippingCountry,
    shippingRegion,
    shippingCity,
    shippingAddressLine1,
    shippingAddressLine2,
    shippingPostalCode,
    navigate,
    wizardStorage,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-3");
  }, [navigate]);

  // Stable onChange handlers for billing address
  const handleCountryChange = useCallback((value) => {
    setCountry(value);
  }, []);

  const handleRegionChange = useCallback((value) => {
    setRegion(value);
  }, []);

  const handleCityChange = useCallback((value) => {
    setCity(value);
  }, []);

  const handlePostalCodeChange = useCallback((value) => {
    setPostalCode(value);
  }, []);

  const handleAddressLine1Change = useCallback((value) => {
    setAddressLine1(value);
  }, []);

  const handleAddressLine2Change = useCallback((value) => {
    setAddressLine2(value);
  }, []);

  const handleHasShippingAddressChange = useCallback((checked) => {
    setHasShippingAddress(checked);
  }, []);

  // Stable onChange handlers for shipping address
  const handleShippingContactNameChange = useCallback((value) => {
    setShippingName(value);
  }, []);

  const handleShippingPhoneChange = useCallback((value) => {
    setShippingPhone(value);
  }, []);

  const handleShippingCountryChange = useCallback((value) => {
    setShippingCountry(value);
  }, []);

  const handleShippingRegionChange = useCallback((value) => {
    setShippingRegion(value);
  }, []);

  const handleShippingCityChange = useCallback((value) => {
    setShippingCity(value);
  }, []);

  const handleShippingPostalCodeChange = useCallback((value) => {
    setShippingPostalCode(value);
  }, []);

  const handleShippingAddressLine1Change = useCallback((value) => {
    setShippingAddressLine1(value);
  }, []);

  const handleShippingAddressLine2Change = useCallback((value) => {
    setShippingAddressLine2(value);
  }, []);

  // Action buttons (Cancel and Next on the right)
  const actions = useMemo(
    () => [
      {
        label: "Cancel",
        variant: "outline",
        onClick: handleCancel,
      },
      {
        label: isLoading ? "Saving..." : "Next",
        variant: "primary",
        onClick: handleNext,
        disabled: isLoading,
        loading: isLoading,
      },
    ],
    [handleCancel, handleNext, isLoading]
  );

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={4}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Address Information"
      stepSubtitle="Enter billing address and optional shipping address"
      stepIcon={HomeIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isLoading}
      actions={actions}
      onCancel={handleCancel}
      onBack={handleBack}
      actionLayout="end"
    >
      <AddressFormStep
        billingTitle={hasShippingAddress ? "Billing Address" : "Address Information"}
        billingIcon={HomeIcon}
        shippingTitle="Shipping Address"
        shippingIcon={TruckIcon}
        country={country}
        onCountryChange={handleCountryChange}
        region={region}
        onRegionChange={handleRegionChange}
        city={city}
        onCityChange={handleCityChange}
        postalCode={postalCode}
        onPostalCodeChange={handlePostalCodeChange}
        addressLine1={addressLine1}
        onAddressLine1Change={handleAddressLine1Change}
        addressLine2={addressLine2}
        onAddressLine2Change={handleAddressLine2Change}
        hasShippingAddress={hasShippingAddress}
        onHasShippingAddressChange={handleHasShippingAddressChange}
        shippingContactName={shippingName}
        onShippingContactNameChange={handleShippingContactNameChange}
        shippingPhone={shippingPhone}
        onShippingPhoneChange={handleShippingPhoneChange}
        shippingCountry={shippingCountry}
        onShippingCountryChange={handleShippingCountryChange}
        shippingRegion={shippingRegion}
        onShippingRegionChange={handleShippingRegionChange}
        shippingCity={shippingCity}
        onShippingCityChange={handleShippingCityChange}
        shippingPostalCode={shippingPostalCode}
        onShippingPostalCodeChange={handleShippingPostalCodeChange}
        shippingAddressLine1={shippingAddressLine1}
        onShippingAddressLine1Change={handleShippingAddressLine1Change}
        shippingAddressLine2={shippingAddressLine2}
        onShippingAddressLine2Change={handleShippingAddressLine2Change}
        countryOptions={COUNTRY_OPTIONS}
        regionOptions={REGION_OPTIONS}
        errors={errors}
        showShippingToggle={true}
      />
    </WizardFormStep>
  );
});

Step4Content.displayName = "Step4Content";

function AdminStaffAddStep4Page() {
  return (
    <UIXThemeProvider>
      <Step4Content />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep4Page;
