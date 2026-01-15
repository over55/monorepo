// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step4Page.jsx
// UIX Upgraded - Uses WizardFormStep + AddressFormStep whole page components
// @uix-page: AdminAssociateAddStep4Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  WizardFormStep,
  AddressFormStep,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
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

// Region options
const REGION_OPTIONS = {
  Canada: [
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
  ],
  "United States": [
    { value: "Alabama", label: "Alabama" },
    { value: "Alaska", label: "Alaska" },
    { value: "Arizona", label: "Arizona" },
    { value: "Arkansas", label: "Arkansas" },
    { value: "California", label: "California" },
    { value: "Colorado", label: "Colorado" },
    { value: "Connecticut", label: "Connecticut" },
    { value: "Delaware", label: "Delaware" },
    { value: "Florida", label: "Florida" },
    { value: "Georgia", label: "Georgia" },
    { value: "Hawaii", label: "Hawaii" },
    { value: "Idaho", label: "Idaho" },
    { value: "Illinois", label: "Illinois" },
    { value: "Indiana", label: "Indiana" },
    { value: "Iowa", label: "Iowa" },
    { value: "Kansas", label: "Kansas" },
    { value: "Kentucky", label: "Kentucky" },
    { value: "Louisiana", label: "Louisiana" },
    { value: "Maine", label: "Maine" },
    { value: "Maryland", label: "Maryland" },
    { value: "Massachusetts", label: "Massachusetts" },
    { value: "Michigan", label: "Michigan" },
    { value: "Minnesota", label: "Minnesota" },
    { value: "Mississippi", label: "Mississippi" },
    { value: "Missouri", label: "Missouri" },
    { value: "Montana", label: "Montana" },
    { value: "Nebraska", label: "Nebraska" },
    { value: "Nevada", label: "Nevada" },
    { value: "New Hampshire", label: "New Hampshire" },
    { value: "New Jersey", label: "New Jersey" },
    { value: "New Mexico", label: "New Mexico" },
    { value: "New York", label: "New York" },
    { value: "North Carolina", label: "North Carolina" },
    { value: "North Dakota", label: "North Dakota" },
    { value: "Ohio", label: "Ohio" },
    { value: "Oklahoma", label: "Oklahoma" },
    { value: "Oregon", label: "Oregon" },
    { value: "Pennsylvania", label: "Pennsylvania" },
    { value: "Rhode Island", label: "Rhode Island" },
    { value: "South Carolina", label: "South Carolina" },
    { value: "South Dakota", label: "South Dakota" },
    { value: "Tennessee", label: "Tennessee" },
    { value: "Texas", label: "Texas" },
    { value: "Utah", label: "Utah" },
    { value: "Vermont", label: "Vermont" },
    { value: "Virginia", label: "Virginia" },
    { value: "Washington", label: "Washington" },
    { value: "West Virginia", label: "West Virginia" },
    { value: "Wisconsin", label: "Wisconsin" },
    { value: "Wyoming", label: "Wyoming" },
  ],
  Mexico: [
    { value: "Aguascalientes", label: "Aguascalientes" },
    { value: "Baja California", label: "Baja California" },
    { value: "Baja California Sur", label: "Baja California Sur" },
    { value: "Campeche", label: "Campeche" },
    { value: "Chiapas", label: "Chiapas" },
    { value: "Chihuahua", label: "Chihuahua" },
    { value: "Ciudad de Mexico", label: "Ciudad de México" },
    { value: "Coahuila", label: "Coahuila" },
    { value: "Colima", label: "Colima" },
    { value: "Durango", label: "Durango" },
    { value: "Guanajuato", label: "Guanajuato" },
    { value: "Guerrero", label: "Guerrero" },
    { value: "Hidalgo", label: "Hidalgo" },
    { value: "Jalisco", label: "Jalisco" },
    { value: "Mexico", label: "México" },
    { value: "Michoacan", label: "Michoacán" },
    { value: "Morelos", label: "Morelos" },
    { value: "Nayarit", label: "Nayarit" },
    { value: "Nuevo Leon", label: "Nuevo León" },
    { value: "Oaxaca", label: "Oaxaca" },
    { value: "Puebla", label: "Puebla" },
    { value: "Queretaro", label: "Querétaro" },
    { value: "Quintana Roo", label: "Quintana Roo" },
    { value: "San Luis Potosi", label: "San Luis Potosí" },
    { value: "Sinaloa", label: "Sinaloa" },
    { value: "Sonora", label: "Sonora" },
    { value: "Tabasco", label: "Tabasco" },
    { value: "Tamaulipas", label: "Tamaulipas" },
    { value: "Tlaxcala", label: "Tlaxcala" },
    { value: "Veracruz", label: "Veracruz" },
    { value: "Yucatan", label: "Yucatán" },
    { value: "Zacatecas", label: "Zacatecas" },
  ],
};

// Memoized content component
const Step4Content = memo(function Step4Content() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Get existing associate data from sessionStorage
  const [associateData, setAssociateData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Address form data
  const [country, setCountry] = useState(associateData.country || "Canada");
  const [region, setRegion] = useState(associateData.region || "Ontario");
  const [city, setCity] = useState(associateData.city || "");
  const [postalCode, setPostalCode] = useState(associateData.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(associateData.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(associateData.addressLine2 || "");
  const [hasShippingAddress, setHasShippingAddress] = useState(associateData.hasShippingAddress || false);

  // Shipping address data
  const [shippingName, setShippingName] = useState(associateData.shippingName || "");
  const [shippingPhone, setShippingPhone] = useState(associateData.shippingPhone || "");
  const [shippingCountry, setShippingCountry] = useState(associateData.shippingCountry || "Canada");
  const [shippingRegion, setShippingRegion] = useState(associateData.shippingRegion || "Ontario");
  const [shippingCity, setShippingCity] = useState(associateData.shippingCity || "");
  const [shippingPostalCode, setShippingPostalCode] = useState(associateData.shippingPostalCode || "");
  const [shippingAddressLine1, setShippingAddressLine1] = useState(associateData.shippingAddressLine1 || "");
  const [shippingAddressLine2, setShippingAddressLine2] = useState(associateData.shippingAddressLine2 || "");

  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    if (!saved) {
      navigate("/admin/associates/add/step-1-search");
    }
  }, [authManager, navigate]);

  // Get region options based on selected country
  const regionOptions = useMemo(() => REGION_OPTIONS[country] || REGION_OPTIONS.Canada, [country]);
  const shippingRegionOptions = useMemo(() => REGION_OPTIONS[shippingCountry] || REGION_OPTIONS.Canada, [shippingCountry]);

  // Handle country change - reset region to first available option
  const handleCountryChange = useCallback((value) => {
    setCountry(value);
    const newRegionOptions = REGION_OPTIONS[value] || REGION_OPTIONS.Canada;
    if (newRegionOptions.length > 0) {
      setRegion(newRegionOptions[0].value);
    }
  }, []);

  const handleShippingCountryChange = useCallback((value) => {
    setShippingCountry(value);
    const newRegionOptions = REGION_OPTIONS[value] || REGION_OPTIONS.Canada;
    if (newRegionOptions.length > 0) {
      setShippingRegion(newRegionOptions[0].value);
    }
  }, []);

  // Handle form submission
  const handleNext = useCallback(() => {
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Billing address validation
    if (!country) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }
    if (!region) {
      newErrors.region = "Province/State is required";
      hasErrors = true;
    }
    if (!city.trim()) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
      hasErrors = true;
    }
    if (!postalCode.trim()) {
      newErrors.postalCode = "Postal/ZIP code is required";
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
      if (!shippingCountry) {
        newErrors.shippingCountry = "Shipping country is required";
        hasErrors = true;
      }
      if (!shippingRegion) {
        newErrors.shippingRegion = "Shipping province/state is required";
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
        newErrors.shippingPostalCode = "Shipping postal/ZIP code is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to session storage
    const updatedAssociateData = {
      ...associateData,
      country,
      region,
      city,
      postalCode,
      addressLine1,
      addressLine2,
      hasShippingAddress,
      shippingName,
      shippingPhone,
      shippingCountry,
      shippingRegion,
      shippingCity,
      shippingPostalCode,
      shippingAddressLine1,
      shippingAddressLine2,
    };

    try {
      sessionStorage.setItem("WORKERY_ASSOCIATE_CREATION_STATE", JSON.stringify(updatedAssociateData));
      setAssociateData(updatedAssociateData);
      navigate("/admin/associates/add/step-5");
    } catch (error) {
      console.error("Error saving associate state:", error);
      setErrors({ message: "Failed to save data. Please try again." });
    }
  }, [country, region, city, postalCode, addressLine1, addressLine2, hasShippingAddress, shippingName, shippingPhone, shippingCountry, shippingRegion, shippingCity, shippingPostalCode, shippingAddressLine1, shippingAddressLine2, associateData, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/associates");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/associates/add/step-3");
  }, [navigate]);

  // Action buttons
  const actions = useMemo(() => [
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
  ], [handleCancel, handleNext, isLoading]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={4}
      wizardTitle="Add New Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Address Information"
      stepSubtitle="Enter address details for the new associate"
      stepIcon={MapPinIcon}
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
        // Billing address values
        country={country}
        region={region}
        city={city}
        postalCode={postalCode}
        addressLine1={addressLine1}
        addressLine2={addressLine2}

        // Billing address handlers
        onCountryChange={handleCountryChange}
        onRegionChange={setRegion}
        onCityChange={setCity}
        onPostalCodeChange={setPostalCode}
        onAddressLine1Change={setAddressLine1}
        onAddressLine2Change={setAddressLine2}

        // Shipping toggle
        hasShippingAddress={hasShippingAddress}
        onHasShippingAddressChange={setHasShippingAddress}

        // Shipping address values
        shippingContactName={shippingName}
        shippingPhone={shippingPhone}
        shippingCountry={shippingCountry}
        shippingRegion={shippingRegion}
        shippingCity={shippingCity}
        shippingPostalCode={shippingPostalCode}
        shippingAddressLine1={shippingAddressLine1}
        shippingAddressLine2={shippingAddressLine2}

        // Shipping address handlers
        onShippingContactNameChange={setShippingName}
        onShippingPhoneChange={setShippingPhone}
        onShippingCountryChange={handleShippingCountryChange}
        onShippingRegionChange={setShippingRegion}
        onShippingCityChange={setShippingCity}
        onShippingPostalCodeChange={setShippingPostalCode}
        onShippingAddressLine1Change={setShippingAddressLine1}
        onShippingAddressLine2Change={setShippingAddressLine2}

        // Options
        countryOptions={COUNTRY_OPTIONS}
        regionOptions={regionOptions}

        // Errors
        errors={errors}
        showShippingToggle={true}
      />
    </WizardFormStep>
  );
});

Step4Content.displayName = 'Step4Content';

function AdminAssociateAddStep4Page() {
  return (
    <UIXThemeProvider>
      <Step4Content />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep4Page;
