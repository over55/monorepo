// File: src/components/UIX/EntityUpdatePage/examples/AssociateFormSections.jsx

import React, { useCallback } from "react";
import {
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  ExclamationCircleIcon,
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
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
  VehicleTypesMultiSelect,
  ServiceFeeSelect,
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../business/selects";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";

// Static constants - frozen for performance
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;

const ASSOCIATE_TYPE_OPTIONS = Object.freeze([
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
]);

const ORGANIZATION_TYPE_OPTIONS = Object.freeze([
  { value: 0, label: "Please select" },
  { value: 1, label: "Unknown" },
  { value: 2, label: "Private" },
  { value: 3, label: "Non-profit" },
  { value: 4, label: "Government" },
]);

const PHONE_TYPE_OPTIONS = Object.freeze([
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

const JOB_SEEKER_OPTIONS = Object.freeze([
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
]);

const LANGUAGE_OPTIONS = Object.freeze([
  { value: "English", label: "English" },
  { value: "French", label: "French" },
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

// Get today's date for birth date max value
const TODAY_ISO = new Date().toISOString().split("T")[0];

// Settings Section - Associate Type
export const AssociateSettingsSection = React.memo(function AssociateSettingsSection({
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
          label="Associate Type"
          value={formData.type}
          onChange={handleTypeChange}
          options={ASSOCIATE_TYPE_OPTIONS}
          error={errors.type}
          required
        />
      </div>
    </FormSection>
  );
});

// Contact Information Section
export const AssociateContactInfoSection = React.memo(function AssociateContactInfoSection({
  formData,
  errors,
  onChange,
}) {
  // Memoized handlers
  const handleOrganizationNameChange = useCallback(
    (value) => onChange("organizationName", value),
    [onChange],
  );

  const handleOrganizationTypeChange = useCallback(
    (value) => onChange("organizationType", parseInt(value)),
    [onChange],
  );

  const handleFirstNameChange = useCallback(
    (value) => onChange("firstName", value),
    [onChange],
  );

  const handleLastNameChange = useCallback(
    (value) => onChange("lastName", value),
    [onChange],
  );

  const handleEmailChange = useCallback(
    (value) => onChange("email", value),
    [onChange],
  );

  const handleIsOkToEmailChange = useCallback(
    (checked) => onChange("isOkToEmail", checked),
    [onChange],
  );

  const handlePhoneChange = useCallback(
    (value) => onChange("phone", value),
    [onChange],
  );

  const handlePhoneTypeChange = useCallback(
    (value) => onChange("phoneType", parseInt(value)),
    [onChange],
  );

  const handlePhoneExtensionChange = useCallback(
    (value) => onChange("phoneExtension", value),
    [onChange],
  );

  const handleIsOkToTextChange = useCallback(
    (checked) => onChange("isOkToText", checked),
    [onChange],
  );

  const handleOtherPhoneChange = useCallback(
    (value) => onChange("otherPhone", value),
    [onChange],
  );

  const handleOtherPhoneTypeChange = useCallback(
    (value) => onChange("otherPhoneType", parseInt(value)),
    [onChange],
  );

  const handleOtherPhoneExtensionChange = useCallback(
    (value) => onChange("otherPhoneExtension", value),
    [onChange],
  );

  return (
    <FormSection title="Contact Information" icon={UserIcon}>
      {/* Organization fields for commercial associates */}
      {formData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
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
            options={ORGANIZATION_TYPE_OPTIONS}
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
        required
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
          options={PHONE_TYPE_OPTIONS}
          error={errors.phoneType}
        />
      </FormRow>

      {formData.phoneType === ASSOCIATE_PHONE_TYPE_WORK && (
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
          options={PHONE_TYPE_OPTIONS}
          error={errors.otherPhoneType}
        />
      </FormRow>

      {formData.otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK && (
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
export const AssociateAddressSection = React.memo(function AssociateAddressSection({
  formData,
  errors,
  onChange,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers
  const handleHasShippingAddressChange = useCallback(
    (checked) => onChange("hasShippingAddress", checked),
    [onChange],
  );

  const handleCountryChange = useCallback(
    (value) => onChange("country", value),
    [onChange],
  );

  const handleRegionChange = useCallback(
    (value) => onChange("region", value),
    [onChange],
  );

  const handleCityChange = useCallback(
    (value) => onChange("city", value),
    [onChange],
  );

  const handleAddressLine1Change = useCallback(
    (value) => onChange("addressLine1", value),
    [onChange],
  );

  const handleAddressLine2Change = useCallback(
    (value) => onChange("addressLine2", value),
    [onChange],
  );

  const handlePostalCodeChange = useCallback(
    (value) => onChange("postalCode", value),
    [onChange],
  );

  // Shipping address handlers
  const handleShippingNameChange = useCallback(
    (value) => onChange("shippingName", value),
    [onChange],
  );

  const handleShippingPhoneChange = useCallback(
    (value) => onChange("shippingPhone", value),
    [onChange],
  );

  const handleShippingCountryChange = useCallback(
    (value) => onChange("shippingCountry", value),
    [onChange],
  );

  const handleShippingRegionChange = useCallback(
    (value) => onChange("shippingRegion", value),
    [onChange],
  );

  const handleShippingCityChange = useCallback(
    (value) => onChange("shippingCity", value),
    [onChange],
  );

  const handleShippingAddressLine1Change = useCallback(
    (value) => onChange("shippingAddressLine1", value),
    [onChange],
  );

  const handleShippingAddressLine2Change = useCallback(
    (value) => onChange("shippingAddressLine2", value),
    [onChange],
  );

  const handleShippingPostalCodeChange = useCallback(
    (value) => onChange("shippingPostalCode", value),
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

// Professional Information Section
export const AssociateProfessionalInfoSection = React.memo(function AssociateProfessionalInfoSection({
  formData,
  errors,
  onChange,
  onUnauthorized,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers
  const handleSkillSetsChange = useCallback(
    (value) => onChange("skillSets", value),
    [onChange],
  );

  const handleInsuranceRequirementsChange = useCallback(
    (value) => onChange("insuranceRequirements", value),
    [onChange],
  );

  const handleVehicleTypesChange = useCallback(
    (value) => onChange("vehicleTypes", value),
    [onChange],
  );

  const handleServiceFeeChange = useCallback(
    (value) => onChange("serviceFeeId", value),
    [onChange],
  );

  const handleDuesDateChange = useCallback(
    (value) => onChange("duesDate", value),
    [onChange],
  );

  const handlePoliceCheckChange = useCallback(
    (value) => onChange("policeCheck", value),
    [onChange],
  );

  const handleCommercialInsuranceChange = useCallback(
    (value) => onChange("commercialInsuranceExpiryDate", value),
    [onChange],
  );

  const handleAutoInsuranceChange = useCallback(
    (value) => onChange("autoInsuranceExpiryDate", value),
    [onChange],
  );

  const handleWsibNumberChange = useCallback(
    (value) => onChange("wsibNumber", value),
    [onChange],
  );

  const handleWsibDateChange = useCallback(
    (value) => onChange("wsibInsuranceDate", value),
    [onChange],
  );

  const handleTaxIdChange = useCallback(
    (value) => onChange("taxId", value),
    [onChange],
  );

  const handleDriversLicenseChange = useCallback(
    (value) => onChange("driversLicenseClass", value),
    [onChange],
  );

  const handleHourlySalaryChange = useCallback(
    (value) => onChange("hourlySalaryDesired", value),
    [onChange],
  );

  const handleLimitSpecialChange = useCallback(
    (value) => onChange("limitSpecial", value),
    [onChange],
  );

  return (
    <FormSection title="Professional Information" icon={BriefcaseIcon}>
      <div className="space-y-4 sm:space-y-6">
        <SkillSetsMultiSelect
          value={formData.skillSets}
          onChange={handleSkillSetsChange}
          error={errors.skillSets}
          required={true}
          label="Skill Sets"
          helperText="Select all skill sets that apply to this associate"
          onUnauthorized={onUnauthorized}
        />

        <InsuranceRequirementsMultiSelect
          value={formData.insuranceRequirements}
          onChange={handleInsuranceRequirementsChange}
          error={errors.insuranceRequirements}
          required={true}
          label="Insurance Requirements"
          helperText="Select all insurance requirements for this associate"
          onUnauthorized={onUnauthorized}
        />

        <VehicleTypesMultiSelect
          value={formData.vehicleTypes}
          onChange={handleVehicleTypesChange}
          error={errors.vehicleTypes}
          required={false}
          label="Vehicle Types (Optional)"
          helperText="Select all vehicle types the associate has access to"
          onUnauthorized={onUnauthorized}
        />

        <ServiceFeeSelect
          value={formData.serviceFeeId}
          onChange={handleServiceFeeChange}
          error={errors.serviceFeeId}
          required={true}
          label="Service Fee"
          helperText="Select the applicable service fee for this associate"
          onUnauthorized={onUnauthorized}
        />

        <FormRow columns={2}>
          <DateInput
            label="Member Dues Date"
            value={formData.duesDate}
            onChange={handleDuesDateChange}
            error={errors.duesDate}
            required
          />
          <DateInput
            label="Police Check Expiry"
            value={formData.policeCheck}
            onChange={handlePoliceCheckChange}
            error={errors.policeCheck}
            required
          />
        </FormRow>

        <DateInput
          label="Commercial Insurance Expiry Date"
          value={formData.commercialInsuranceExpiryDate}
          onChange={handleCommercialInsuranceChange}
          error={errors.commercialInsuranceExpiryDate}
          required
        />

        <DateInput
          label="Auto Insurance Expiry Date (Optional)"
          value={formData.autoInsuranceExpiryDate}
          onChange={handleAutoInsuranceChange}
          error={errors.autoInsuranceExpiryDate}
        />

        <FormRow columns={2}>
          <Input
            label="WSIB Number (Optional)"
            value={formData.wsibNumber}
            onChange={handleWsibNumberChange}
            error={errors.wsibNumber}
          />
          <DateInput
            label="WSIB Insurance Date (Optional)"
            value={formData.wsibInsuranceDate}
            onChange={handleWsibDateChange}
            error={errors.wsibInsuranceDate}
          />
        </FormRow>

        <FormRow columns={2}>
          <Input
            label="Tax ID (Optional)"
            value={formData.taxId}
            onChange={handleTaxIdChange}
            error={errors.taxId}
          />
          <Input
            label="Driver's License Class (Optional)"
            value={formData.driversLicenseClass}
            onChange={handleDriversLicenseChange}
            error={errors.driversLicenseClass}
          />
        </FormRow>

        <Input
          label="Hourly Salary Desired (Optional)"
          type="number"
          value={formData.hourlySalaryDesired}
          onChange={handleHourlySalaryChange}
          error={errors.hourlySalaryDesired}
        />

        <Input
          label="Limit Special (Optional)"
          value={formData.limitSpecial}
          onChange={handleLimitSpecialChange}
          error={errors.limitSpecial}
          helperText="Any special limitations or notes"
        />
      </div>
    </FormSection>
  );
});

// Emergency Contact Section
export const AssociateEmergencyContactSection = React.memo(function AssociateEmergencyContactSection({
  formData,
  errors,
  onChange,
}) {
  const handleContactNameChange = useCallback(
    (value) => onChange("emergencyContactName", value),
    [onChange],
  );

  const handleContactRelationshipChange = useCallback(
    (value) => onChange("emergencyContactRelationship", value),
    [onChange],
  );

  const handleContactTelephoneChange = useCallback(
    (value) => onChange("emergencyContactTelephone", value),
    [onChange],
  );

  const handleContactAltTelephoneChange = useCallback(
    (value) => onChange("emergencyContactAlternativeTelephone", value),
    [onChange],
  );

  return (
    <FormSection title="Emergency Contact" icon={ExclamationCircleIcon}>
      <FormRow columns={2}>
        <Input
          label="Contact Name"
          value={formData.emergencyContactName}
          onChange={handleContactNameChange}
          error={errors.emergencyContactName}
          required
        />
        <Input
          label="Contact Relationship"
          value={formData.emergencyContactRelationship}
          onChange={handleContactRelationshipChange}
          error={errors.emergencyContactRelationship}
          required
        />
      </FormRow>

      <FormRow columns={2}>
        <Input
          label="Contact Telephone"
          type="tel"
          value={formData.emergencyContactTelephone}
          onChange={handleContactTelephoneChange}
          error={errors.emergencyContactTelephone}
          required
        />
        <Input
          label="Alternative Telephone (Optional)"
          type="tel"
          value={formData.emergencyContactAlternativeTelephone}
          onChange={handleContactAltTelephoneChange}
          error={errors.emergencyContactAlternativeTelephone}
        />
      </FormRow>
    </FormSection>
  );
});

// Metrics Section
export const AssociateMetricsSection = React.memo(function AssociateMetricsSection({
  formData,
  errors,
  onChange,
  onUnauthorized,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers
  const handleTagsChange = useCallback(
    (value) => onChange("tags", value),
    [onChange],
  );

  const handleHowHearChange = useCallback(
    (value) => onChange("howDidYouHearAboutUsID", value),
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
    (value) => onChange("howDidYouHearAboutUsOther", value),
    [onChange],
  );

  const handleGenderChange = useCallback(
    (value) => onChange("gender", parseInt(value)),
    [onChange],
  );

  const handleGenderOtherChange = useCallback(
    (value) => onChange("genderOther", value),
    [onChange],
  );

  const handleBirthDateChange = useCallback(
    (value) => onChange("birthDate", value),
    [onChange],
  );

  const handleJoinDateChange = useCallback(
    (value) => onChange("joinDate", value),
    [onChange],
  );

  const handleIsJobSeekerChange = useCallback(
    (value) => onChange("isJobSeeker", parseInt(value)),
    [onChange],
  );

  const handleAdditionalCommentChange = useCallback(
    (e) => onChange("additionalComment", e.target.value),
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
          helperText="Select tags to categorize this associate"
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
            required
          />
          <DateInput
            label="Birth Date"
            value={formData.birthDate}
            onChange={handleBirthDateChange}
            max={TODAY_ISO}
            error={errors.birthDate}
            required
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
          helperText="This indicates when the associate joined the workery"
        />

        <Select
          label="Is Job Seeker"
          value={formData.isJobSeeker}
          onChange={handleIsJobSeekerChange}
          options={JOB_SEEKER_OPTIONS}
          error={errors.isJobSeeker}
        />

        <div>
          <label className={`block text-sm font-medium ${getThemeClasses("text-primary")} mb-2`}>
            Additional Comment (Optional)
          </label>
          <textarea
            value={formData.additionalComment}
            onChange={handleAdditionalCommentChange}
            rows={4}
            className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")} text-sm`}
            maxLength={638}
          />
        </div>
      </div>
    </FormSection>
  );
});

// System Information Section
export const AssociateSystemInfoSection = React.memo(function AssociateSystemInfoSection({
  formData,
  errors,
  onChange,
}) {
  const { getThemeClasses } = useUIXTheme();

  const handleDescriptionChange = useCallback(
    (e) => onChange("description", e.target.value),
    [onChange],
  );

  const handlePreferredLanguageChange = useCallback(
    (value) => onChange("preferredLanguage", value),
    [onChange],
  );

  return (
    <FormSection title="System Information" icon={ComputerDesktopIcon}>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <label className={`block text-sm font-medium ${getThemeClasses("text-primary")} mb-2`}>
            Description (Optional)
          </label>
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            rows={4}
            className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")} text-sm`}
            maxLength={638}
          />
        </div>

        <div className="max-w-xl">
          <Select
            label="Preferred Language"
            value={formData.preferredLanguage}
            onChange={handlePreferredLanguageChange}
            options={LANGUAGE_OPTIONS}
            error={errors.preferredLanguage}
            required
          />
        </div>
      </div>
    </FormSection>
  );
});
