// File: src/components/UIX/EntityUpdatePage/examples/CustomerFormSections.jsx

import React, { useCallback } from "react";
import {
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import {
  FormSection,
  FormRow,
  Input,
  Select,
  Checkbox,
  DateInput,
} from "../../index";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../business/selects";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_PHONE_TYPE_WORK,
} from "../../../../constants/Customer";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";

// Static constants - frozen for performance
const CLIENT_TYPE_OPTIONS = Object.freeze([
  { value: RESIDENTIAL_CUSTOMER_TYPE_OF_ID, label: "Residential" },
  { value: COMMERCIAL_CUSTOMER_TYPE_OF_ID, label: "Commercial" },
]);

const CLIENT_ORGANIZATION_TYPE_OPTIONS = Object.freeze([
  { value: 0, label: "Please select" },
  { value: 1, label: "Unknown" },
  { value: 2, label: "Private" },
  { value: 3, label: "Non-profit" },
  { value: 4, label: "Government" },
]);

const CLIENT_PHONE_TYPE_OPTIONS = Object.freeze([
  { value: 0, label: "Please select" },
  { value: 1, label: "Mobile" },
  { value: 2, label: "Work" },
  { value: 3, label: "Home" },
]);

const GENDER_OPTIONS = Object.freeze([
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Transgender" },
  { value: 5, label: "Non-Binary" },
  { value: 6, label: "Two Spirit" },
  { value: 7, label: "Prefer not to say" },
  { value: 8, label: "Do not know" },
]);

const REGION_OPTIONS = Object.freeze([
  { value: "", label: "Please select" },
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
]);

const LANGUAGE_OPTIONS = Object.freeze([
  { value: "English", label: "English" },
  { value: "French", label: "French" },
]);

// Get today's date for birth date max value
const TODAY_ISO = new Date().toISOString().split("T")[0];

// Settings Section - Customer Type
export const CustomerSettingsSection = React.memo(function CustomerSettingsSection({
  formData,
  errors,
  onChange,
}) {
  const handleTypeChange = useCallback(
    (value) => {
      onChange("type", parseInt(value));
    },
    [onChange],
  );

  return (
    <FormSection title="Settings" icon={BuildingOfficeIcon}>
      <div className="max-w-xl">
        <Select
          label="Customer Type"
          value={formData.type}
          onChange={handleTypeChange}
          options={CLIENT_TYPE_OPTIONS}
          error={errors.type}
          required
        />
      </div>
    </FormSection>
  );
});

// Contact Information Section
export const CustomerContactInfoSection = React.memo(function CustomerContactInfoSection({
  formData,
  errors,
  onChange,
}) {
  // Memoized handlers
  const handleOrganizationNameChange = useCallback(
    (value) => {
      onChange("organizationName", value);
    },
    [onChange],
  );

  const handleOrganizationTypeChange = useCallback(
    (value) => {
      onChange("organizationType", parseInt(value));
    },
    [onChange],
  );

  const handleFirstNameChange = useCallback(
    (value) => {
      onChange("firstName", value);
    },
    [onChange],
  );

  const handleLastNameChange = useCallback(
    (value) => {
      onChange("lastName", value);
    },
    [onChange],
  );

  const handleEmailChange = useCallback(
    (value) => {
      onChange("email", value);
    },
    [onChange],
  );

  const handleIsOkToEmailChange = useCallback(
    (checked) => {
      onChange("isOkToEmail", checked);
    },
    [onChange],
  );

  const handlePhoneChange = useCallback(
    (value) => {
      onChange("phone", value);
    },
    [onChange],
  );

  const handlePhoneTypeChange = useCallback(
    (value) => {
      onChange("phoneType", parseInt(value));
    },
    [onChange],
  );

  const handlePhoneExtensionChange = useCallback(
    (value) => {
      onChange("phoneExtension", value);
    },
    [onChange],
  );

  const handleIsOkToTextChange = useCallback(
    (checked) => {
      onChange("isOkToText", checked);
    },
    [onChange],
  );

  const handleOtherPhoneChange = useCallback(
    (value) => {
      onChange("otherPhone", value);
    },
    [onChange],
  );

  const handleOtherPhoneTypeChange = useCallback(
    (value) => {
      onChange("otherPhoneType", parseInt(value));
    },
    [onChange],
  );

  const handleOtherPhoneExtensionChange = useCallback(
    (value) => {
      onChange("otherPhoneExtension", value);
    },
    [onChange],
  );

  return (
    <FormSection title="Contact Information" icon={UserIcon}>
      {/* Organization fields for commercial customers */}
      {formData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
        <FormRow columns={2}>
          <Input
            label="Organization Name"
            value={formData.organizationName}
            onChange={handleOrganizationNameChange}
            error={errors.organizationName}
            required
          />
          <Select
            label="Organization Type"
            value={formData.organizationType}
            onChange={handleOrganizationTypeChange}
            options={CLIENT_ORGANIZATION_TYPE_OPTIONS}
            error={errors.organizationType}
          />
        </FormRow>
      )}

      <FormRow columns={2}>
        <Input
          label="First Name"
          value={formData.firstName}
          onChange={handleFirstNameChange}
          error={errors.firstName}
          required
        />
        <Input
          label="Last Name"
          value={formData.lastName}
          onChange={handleLastNameChange}
          error={errors.lastName}
          required
        />
      </FormRow>

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleEmailChange}
        error={errors.email}
        helperText="Optional - a temporary email will be generated if not provided"
      />

      <Checkbox
        label="I agree to receive electronic email"
        checked={formData.isOkToEmail}
        onChange={handleIsOkToEmailChange}
      />

      <FormRow columns={2}>
        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          error={errors.phone}
          required
        />
        <Select
          label="Phone Type"
          value={formData.phoneType}
          onChange={handlePhoneTypeChange}
          options={CLIENT_PHONE_TYPE_OPTIONS}
          error={errors.phoneType}
        />
      </FormRow>

      {formData.phoneType === CLIENT_PHONE_TYPE_WORK && (
        <Input
          label="Phone Extension"
          value={formData.phoneExtension}
          onChange={handlePhoneExtensionChange}
          error={errors.phoneExtension}
        />
      )}

      <Checkbox
        label="I agree to receive texts to my phone"
        checked={formData.isOkToText}
        onChange={handleIsOkToTextChange}
      />

      <FormRow columns={2}>
        <Input
          label="Other Phone (Optional)"
          type="tel"
          value={formData.otherPhone}
          onChange={handleOtherPhoneChange}
          error={errors.otherPhone}
        />
        <Select
          label="Other Phone Type"
          value={formData.otherPhoneType}
          onChange={handleOtherPhoneTypeChange}
          options={CLIENT_PHONE_TYPE_OPTIONS}
          error={errors.otherPhoneType}
        />
      </FormRow>

      {formData.otherPhoneType === CLIENT_PHONE_TYPE_WORK && (
        <Input
          label="Other Phone Extension"
          value={formData.otherPhoneExtension}
          onChange={handleOtherPhoneExtensionChange}
          error={errors.otherPhoneExtension}
        />
      )}
    </FormSection>
  );
});

// Address Section
export const CustomerAddressSection = React.memo(function CustomerAddressSection({
  formData,
  errors,
  onChange,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers
  const handleHasShippingAddressChange = useCallback(
    (checked) => {
      onChange("hasShippingAddress", checked);
    },
    [onChange],
  );

  const handleCountryChange = useCallback(
    (value) => {
      onChange("country", value);
    },
    [onChange],
  );

  const handleRegionChange = useCallback(
    (value) => {
      onChange("region", value);
    },
    [onChange],
  );

  const handleCityChange = useCallback(
    (value) => {
      onChange("city", value);
    },
    [onChange],
  );

  const handleAddressLine1Change = useCallback(
    (value) => {
      onChange("addressLine1", value);
    },
    [onChange],
  );

  const handleAddressLine2Change = useCallback(
    (value) => {
      onChange("addressLine2", value);
    },
    [onChange],
  );

  const handlePostalCodeChange = useCallback(
    (value) => {
      onChange("postalCode", value);
    },
    [onChange],
  );

  // Shipping address handlers
  const handleShippingNameChange = useCallback(
    (value) => {
      onChange("shippingName", value);
    },
    [onChange],
  );

  const handleShippingPhoneChange = useCallback(
    (value) => {
      onChange("shippingPhone", value);
    },
    [onChange],
  );

  const handleShippingCountryChange = useCallback(
    (value) => {
      onChange("shippingCountry", value);
    },
    [onChange],
  );

  const handleShippingRegionChange = useCallback(
    (value) => {
      onChange("shippingRegion", value);
    },
    [onChange],
  );

  const handleShippingCityChange = useCallback(
    (value) => {
      onChange("shippingCity", value);
    },
    [onChange],
  );

  const handleShippingAddressLine1Change = useCallback(
    (value) => {
      onChange("shippingAddressLine1", value);
    },
    [onChange],
  );

  const handleShippingAddressLine2Change = useCallback(
    (value) => {
      onChange("shippingAddressLine2", value);
    },
    [onChange],
  );

  const handleShippingPostalCodeChange = useCallback(
    (value) => {
      onChange("shippingPostalCode", value);
    },
    [onChange],
  );

  return (
    <FormSection title="Address" icon={MapPinIcon}>
      <Checkbox
        label="Has shipping address different than billing address"
        checked={formData.hasShippingAddress}
        onChange={handleHasShippingAddressChange}
      />

      <div
        className={`grid ${formData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 sm:gap-8`}
      >
        {/* Billing Address */}
        <div>
          {formData.hasShippingAddress && (
            <h4
              className={`text-sm sm:text-base font-medium ${getThemeClasses("text-primary")} mb-3 sm:mb-4`}
            >
              Billing Address
            </h4>
          )}

          <div className="space-y-3 sm:space-y-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={handleCountryChange}
              error={errors.country}
              required
            />
            <Select
              label="Province/Territory"
              value={formData.region}
              onChange={handleRegionChange}
              options={REGION_OPTIONS}
              error={errors.region}
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChange={handleCityChange}
              error={errors.city}
              required
            />
            <Input
              label="Address Line 1"
              value={formData.addressLine1}
              onChange={handleAddressLine1Change}
              error={errors.addressLine1}
              required
            />
            <Input
              label="Address Line 2 (Optional)"
              value={formData.addressLine2}
              onChange={handleAddressLine2Change}
              error={errors.addressLine2}
            />
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={handlePostalCodeChange}
              error={errors.postalCode}
              required
            />
          </div>
        </div>

        {/* Shipping Address */}
        {formData.hasShippingAddress && (
          <div>
            <h4
              className={`text-sm sm:text-base font-medium ${getThemeClasses("text-primary")} mb-3 sm:mb-4`}
            >
              Shipping Address
            </h4>

            <div className="space-y-3 sm:space-y-4">
              <Input
                label="Name"
                value={formData.shippingName}
                onChange={handleShippingNameChange}
                placeholder="The name to contact for this shipping address"
                error={errors.shippingName}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.shippingPhone}
                onChange={handleShippingPhoneChange}
                placeholder="The contact phone number for this shipping address"
                error={errors.shippingPhone}
                required
              />
              <Input
                label="Country"
                value={formData.shippingCountry}
                onChange={handleShippingCountryChange}
                error={errors.shippingCountry}
                required
              />
              <Select
                label="Province/Territory"
                value={formData.shippingRegion}
                onChange={handleShippingRegionChange}
                options={REGION_OPTIONS}
                error={errors.shippingRegion}
                required
              />
              <Input
                label="City"
                value={formData.shippingCity}
                onChange={handleShippingCityChange}
                error={errors.shippingCity}
                required
              />
              <Input
                label="Address Line 1"
                value={formData.shippingAddressLine1}
                onChange={handleShippingAddressLine1Change}
                error={errors.shippingAddressLine1}
                required
              />
              <Input
                label="Address Line 2 (Optional)"
                value={formData.shippingAddressLine2}
                onChange={handleShippingAddressLine2Change}
                error={errors.shippingAddressLine2}
              />
              <Input
                label="Postal Code"
                value={formData.shippingPostalCode}
                onChange={handleShippingPostalCodeChange}
                error={errors.shippingPostalCode}
                required
              />
            </div>
          </div>
        )}
      </div>
    </FormSection>
  );
});

// Metrics Section
export const CustomerMetricsSection = React.memo(function CustomerMetricsSection({
  formData,
  errors,
  onChange,
  onUnauthorized,
}) {
  // Memoized handlers
  const handleTagsChange = useCallback(
    (value) => {
      onChange("tags", value);
    },
    [onChange],
  );

  const handleHowHearChange = useCallback(
    (value) => {
      onChange("howDidYouHearAboutUsID", value);
    },
    [onChange],
  );

  const handleHowHearOtherDetected = useCallback(
    (isOther) => {
      onChange("isHowDidYouHearAboutUsOther", isOther);
      if (!isOther) {
        onChange("howDidYouHearAboutUsOther", "");
      }
    },
    [onChange],
  );

  const handleHowHearOtherChange = useCallback(
    (value) => {
      onChange("howDidYouHearAboutUsOther", value);
    },
    [onChange],
  );

  const handleGenderChange = useCallback(
    (value) => {
      onChange("gender", parseInt(value));
    },
    [onChange],
  );

  const handleGenderOtherChange = useCallback(
    (value) => {
      onChange("genderOther", value);
    },
    [onChange],
  );

  const handleBirthDateChange = useCallback(
    (value) => {
      onChange("birthDate", value);
    },
    [onChange],
  );

  const handleJoinDateChange = useCallback(
    (value) => {
      onChange("joinDate", value);
    },
    [onChange],
  );

  return (
    <FormSection title="Metrics" icon={ChartPieIcon}>
      <div className="space-y-4 sm:space-y-6">
        <TagsMultiSelect
          value={formData.tags}
          onChange={handleTagsChange}
          error={errors.tags}
          required={false}
          label="Tags (Optional)"
          helperText="Select tags to categorize this customer"
          onUnauthorized={onUnauthorized}
        />

        <HowHearAboutUsSelect
          value={formData.howDidYouHearAboutUsID}
          onChange={handleHowHearChange}
          onOtherDetected={handleHowHearOtherDetected}
          error={errors.howDidYouHearAboutUsID}
          required={true}
          helperText="Tell us how you discovered our organization"
          onUnauthorized={onUnauthorized}
        />

        {formData.isHowDidYouHearAboutUsOther && (
          <Input
            label="How did you hear about us? (Other)"
            value={formData.howDidYouHearAboutUsOther}
            onChange={handleHowHearOtherChange}
            error={errors.howDidYouHearAboutUsOther}
            required
          />
        )}

        <FormRow columns={2}>
          <Select
            label="Gender"
            value={formData.gender}
            onChange={handleGenderChange}
            options={GENDER_OPTIONS}
            error={errors.gender}
          />
          <DateInput
            label="Birth Date (Optional)"
            value={formData.birthDate}
            onChange={handleBirthDateChange}
            max={TODAY_ISO}
            error={errors.birthDate}
          />
        </FormRow>

        {formData.gender === 1 && (
          <Input
            label="Gender (Other)"
            value={formData.genderOther}
            onChange={handleGenderOtherChange}
            error={errors.genderOther}
            required
          />
        )}

        <DateInput
          label="Join Date (Optional)"
          value={formData.joinDate}
          onChange={handleJoinDateChange}
          error={errors.joinDate}
          helperText="This indicates when the user joined the workery"
        />
      </div>
    </FormSection>
  );
});

// System Information Section
export const CustomerSystemInfoSection = React.memo(function CustomerSystemInfoSection({
  formData,
  errors,
  onChange,
}) {
  const handlePreferredLanguageChange = useCallback(
    (value) => {
      onChange("preferredLanguage", value);
    },
    [onChange],
  );

  return (
    <FormSection title="System Information" icon={ComputerDesktopIcon}>
      <div className="max-w-xl">
        <Select
          label="Preferred Language"
          value={formData.preferredLanguage}
          onChange={handlePreferredLanguageChange}
          options={LANGUAGE_OPTIONS}
          error={errors.preferredLanguage}
        />
      </div>
    </FormSection>
  );
});
