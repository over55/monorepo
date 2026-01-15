// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step4Page.jsx
// UIX Upgraded - Uses WizardFormStep + AddressFormStep whole page components
// @uix-page: AdminCustomerAddStep4Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import {
  UserPlusIcon,
  MapPinIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  AddressFormStep,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Metrics" },
  { title: "Review" },
];

// Country options
const COUNTRY_OPTIONS = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

// Region options by country
const REGION_OPTIONS = {
  CA: [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "YT", label: "Yukon" },
  ],
  US: [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    { value: "AR", label: "Arkansas" },
    { value: "CA", label: "California" },
    { value: "CO", label: "Colorado" },
    { value: "CT", label: "Connecticut" },
    { value: "DE", label: "Delaware" },
    { value: "FL", label: "Florida" },
    { value: "GA", label: "Georgia" },
    { value: "HI", label: "Hawaii" },
    { value: "ID", label: "Idaho" },
    { value: "IL", label: "Illinois" },
    { value: "IN", label: "Indiana" },
    { value: "IA", label: "Iowa" },
    { value: "KS", label: "Kansas" },
    { value: "KY", label: "Kentucky" },
    { value: "LA", label: "Louisiana" },
    { value: "ME", label: "Maine" },
    { value: "MD", label: "Maryland" },
    { value: "MA", label: "Massachusetts" },
    { value: "MI", label: "Michigan" },
    { value: "MN", label: "Minnesota" },
    { value: "MS", label: "Mississippi" },
    { value: "MO", label: "Missouri" },
    { value: "MT", label: "Montana" },
    { value: "NE", label: "Nebraska" },
    { value: "NV", label: "Nevada" },
    { value: "NH", label: "New Hampshire" },
    { value: "NJ", label: "New Jersey" },
    { value: "NM", label: "New Mexico" },
    { value: "NY", label: "New York" },
    { value: "NC", label: "North Carolina" },
    { value: "ND", label: "North Dakota" },
    { value: "OH", label: "Ohio" },
    { value: "OK", label: "Oklahoma" },
    { value: "OR", label: "Oregon" },
    { value: "PA", label: "Pennsylvania" },
    { value: "RI", label: "Rhode Island" },
    { value: "SC", label: "South Carolina" },
    { value: "SD", label: "South Dakota" },
    { value: "TN", label: "Tennessee" },
    { value: "TX", label: "Texas" },
    { value: "UT", label: "Utah" },
    { value: "VT", label: "Vermont" },
    { value: "VA", label: "Virginia" },
    { value: "WA", label: "Washington" },
    { value: "WV", label: "West Virginia" },
    { value: "WI", label: "Wisconsin" },
    { value: "WY", label: "Wyoming" },
  ],
  MX: [
    { value: "AGU", label: "Aguascalientes" },
    { value: "BCN", label: "Baja California" },
    { value: "BCS", label: "Baja California Sur" },
    { value: "CAM", label: "Campeche" },
    { value: "CHP", label: "Chiapas" },
    { value: "CHH", label: "Chihuahua" },
    { value: "COA", label: "Coahuila" },
    { value: "COL", label: "Colima" },
    { value: "DIF", label: "Ciudad de México" },
    { value: "DUR", label: "Durango" },
    { value: "GUA", label: "Guanajuato" },
    { value: "GRO", label: "Guerrero" },
    { value: "HID", label: "Hidalgo" },
    { value: "JAL", label: "Jalisco" },
    { value: "MEX", label: "México" },
    { value: "MIC", label: "Michoacán" },
    { value: "MOR", label: "Morelos" },
    { value: "NAY", label: "Nayarit" },
    { value: "NLE", label: "Nuevo León" },
    { value: "OAX", label: "Oaxaca" },
    { value: "PUE", label: "Puebla" },
    { value: "QUE", label: "Querétaro" },
    { value: "ROO", label: "Quintana Roo" },
    { value: "SLP", label: "San Luis Potosí" },
    { value: "SIN", label: "Sinaloa" },
    { value: "SON", label: "Sonora" },
    { value: "TAB", label: "Tabasco" },
    { value: "TAM", label: "Tamaulipas" },
    { value: "TLA", label: "Tlaxcala" },
    { value: "VER", label: "Veracruz" },
    { value: "YUC", label: "Yucatán" },
    { value: "ZAC", label: "Zacatecas" },
  ],
};

// Memoized content component
const Step4Content = memo(function Step4Content() {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Address form data
  const [country, setCountry] = useState(customerData.country || "CA");
  const [region, setRegion] = useState(customerData.region || "ON");
  const [city, setCity] = useState(customerData.city || "");
  const [postalCode, setPostalCode] = useState(customerData.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(customerData.addressLine1 || "");
  const [addressLine2, setAddressLine2] = useState(customerData.addressLine2 || "");
  const [hasShippingAddress, setHasShippingAddress] = useState(customerData.hasShippingAddress || false);

  // Shipping address data
  const [shippingName, setShippingName] = useState(customerData.shippingName || "");
  const [shippingPhone, setShippingPhone] = useState(customerData.shippingPhone || "");
  const [shippingCountry, setShippingCountry] = useState(customerData.shippingCountry || "CA");
  const [shippingRegion, setShippingRegion] = useState(customerData.shippingRegion || "ON");
  const [shippingCity, setShippingCity] = useState(customerData.shippingCity || "");
  const [shippingPostalCode, setShippingPostalCode] = useState(customerData.shippingPostalCode || "");
  const [shippingAddressLine1, setShippingAddressLine1] = useState(customerData.shippingAddressLine1 || "");
  const [shippingAddressLine2, setShippingAddressLine2] = useState(customerData.shippingAddressLine2 || "");

  useEffect(() => {
    window.scrollTo(0, 0);
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    if (!saved) {
      navigate("/admin/customers/add/step-1");
    }
  }, [navigate]);

  // Get region options based on selected country
  const regionOptions = useMemo(() => REGION_OPTIONS[country] || REGION_OPTIONS.CA, [country]);
  const shippingRegionOptions = useMemo(() => REGION_OPTIONS[shippingCountry] || REGION_OPTIONS.CA, [shippingCountry]);

  // Handle country change - reset region to first available option
  const handleCountryChange = useCallback((value) => {
    setCountry(value);
    const newRegionOptions = REGION_OPTIONS[value] || REGION_OPTIONS.CA;
    if (newRegionOptions.length > 0) {
      setRegion(newRegionOptions[0].value);
    }
  }, []);

  const handleShippingCountryChange = useCallback((value) => {
    setShippingCountry(value);
    const newRegionOptions = REGION_OPTIONS[value] || REGION_OPTIONS.CA;
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
    const updatedCustomerData = {
      ...customerData,
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
      sessionStorage.setItem("WORKERY_CUSTOMER_CREATION_STATE", JSON.stringify(updatedCustomerData));
      setCustomerData(updatedCustomerData);
      navigate("/admin/customers/add/step-5");
    } catch (error) {
      console.error("Error saving customer state:", error);
      setErrors({ message: "Failed to save data. Please try again." });
    }
  }, [country, region, city, postalCode, addressLine1, addressLine2, hasShippingAddress, shippingName, shippingPhone, shippingCountry, shippingRegion, shippingCity, shippingPostalCode, shippingAddressLine1, shippingAddressLine2, customerData, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/customers");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/customers/add/step-3");
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
      wizardTitle="Add New Customer"
      wizardIcon={UserPlusIcon}
      stepTitle="Address Information"
      stepSubtitle="Enter address details for the new customer"
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

function AdminCustomerAddStep4Page() {
  return (
    <UIXThemeProvider>
      <Step4Content />
    </UIXThemeProvider>
  );
}

export default AdminCustomerAddStep4Page;
