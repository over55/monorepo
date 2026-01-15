// File: src/components/UIX/EntityUpdatePage/examples/StaffFormSections.jsx

import React, { useCallback, useMemo } from "react";
import {
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
  TagsMultiSelect,
  VehicleTypesMultiSelect,
  HowHearAboutUsSelect,
} from "../../../business/selects";
import {
  STAFF_TYPE_EXECUTIVE,
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_FRONTLINE,
  STAFF_PHONE_TYPE_OF_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";
import {
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";

// Static constants - frozen for performance
const STAFF_TYPE_OPTIONS = Object.freeze([
  { value: STAFF_TYPE_EXECUTIVE, label: "Executive" },
  { value: STAFF_TYPE_MANAGEMENT, label: "Management" },
  { value: STAFF_TYPE_FRONTLINE, label: "Frontline" },
]);

const LANGUAGE_OPTIONS = Object.freeze([
  { value: "English", label: "English" },
  { value: "French", label: "French" },
]);

// Get today's date for birth date max value
const TODAY_ISO = new Date().toISOString().split("T")[0];

// Basic Information Section
export const StaffBasicInfoSection = React.memo(function StaffBasicInfoSection({
  formData,
  errors,
  onChange,
}) {
  // Memoized handlers
  const handleTypeChange = useCallback(
    (value) => {
      onChange("type", parseInt(value));
    },
    [onChange],
  );

  const handleEmailChange = useCallback(
    (value) => {
      onChange("email", value);
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

  const handleIsOkToTextChange = useCallback(
    (checked) => {
      onChange("isOkToText", checked);
    },
    [onChange],
  );

  return (
    <FormSection title="Basic Information" icon={UserIcon}>
      <FormRow columns={2}>
        <Select
          label="Type"
          value={formData.type}
          onChange={handleTypeChange}
          options={STAFF_TYPE_OPTIONS}
          error={errors.type}
          required
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={handleEmailChange}
          error={errors.email}
          required
        />
      </FormRow>

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
          options={STAFF_PHONE_TYPE_OF_OPTIONS}
          error={errors.phoneType}
        />
      </FormRow>

      <Checkbox
        label="I agree to receive texts to my phone"
        checked={formData.isOkToText}
        onChange={handleIsOkToTextChange}
      />
    </FormSection>
  );
});

// Address Information Section
export const StaffAddressSection = React.memo(function StaffAddressSection({
  formData,
  errors,
  onChange,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers for all address fields
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

  return (
    <FormSection title="Address Information" icon={MapPinIcon}>
      <Checkbox
        label="Has mailing address different than home address"
        checked={formData.hasShippingAddress}
        onChange={handleHasShippingAddressChange}
      />

      <div
        className={`grid ${formData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6`}
      >
        {/* Home Address */}
        <div>
          {formData.hasShippingAddress && (
            <h4
              className={`text-base font-medium ${getThemeClasses("text-primary")} mb-4`}
            >
              Home Address
            </h4>
          )}

          <div className="space-y-4">
            <Input
              label="Country"
              value={formData.country}
              onChange={handleCountryChange}
              error={errors.country}
              required
            />
            <Input
              label="Province/State"
              value={formData.region}
              onChange={handleRegionChange}
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
              className={`text-base font-medium ${getThemeClasses("text-primary")} mb-4`}
            >
              Shipping Address
            </h4>
            {/* Shipping address fields would go here */}
          </div>
        )}
      </div>
    </FormSection>
  );
});

// Additional Information Section
export const StaffAdditionalInfoSection = React.memo(
  function StaffAdditionalInfoSection({
    formData,
    errors,
    onChange,
    onUnauthorized,
  }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoized handlers
    const handleLimitSpecialChange = useCallback(
      (e) => {
        onChange("limitSpecial", e.target.value);
      },
      [onChange],
    );

    const handlePoliceCheckChange = useCallback(
      (value) => {
        onChange("policeCheck", value);
      },
      [onChange],
    );

    const handleVehicleTypesChange = useCallback(
      (value) => {
        onChange("vehicleTypes", value);
      },
      [onChange],
    );

    return (
      <FormSection title="Additional Information" icon={BriefcaseIcon}>
        <div className="space-y-6">
          <div>
            <textarea
              value={formData.limitSpecial}
              onChange={handleLimitSpecialChange}
              rows={4}
              className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")}`}
              maxLength={638}
              placeholder="Limitation or Special Consideration"
            />
            <p className={`mt-1 text-sm ${getThemeClasses("text-muted")}`}>
              Max 638 characters
            </p>
          </div>

          <FormRow columns={2}>
            <DateInput
              label="Police Check Expiry"
              value={formData.policeCheck}
              onChange={handlePoliceCheckChange}
              error={errors.policeCheck}
            />
            <VehicleTypesMultiSelect
              value={formData.vehicleTypes}
              onChange={handleVehicleTypesChange}
              error={errors.vehicleTypes}
              required={false}
              label="Vehicle Types (Optional)"
              onUnauthorized={onUnauthorized}
            />
          </FormRow>
        </div>
      </FormSection>
    );
  },
);

// Emergency Contact Section
export const StaffEmergencyContactSection = React.memo(
  function StaffEmergencyContactSection({ formData, errors, onChange }) {
    // Memoized handlers
    const handleContactNameChange = useCallback(
      (value) => {
        onChange("emergencyContactName", value);
      },
      [onChange],
    );

    const handleContactRelationshipChange = useCallback(
      (value) => {
        onChange("emergencyContactRelationship", value);
      },
      [onChange],
    );

    const handleContactTelephoneChange = useCallback(
      (value) => {
        onChange("emergencyContactTelephone", value);
      },
      [onChange],
    );

    const handleContactAltTelephoneChange = useCallback(
      (value) => {
        onChange("emergencyContactAlternativeTelephone", value);
      },
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
            label="Contact Alternative Telephone (Optional)"
            type="tel"
            value={formData.emergencyContactAlternativeTelephone}
            onChange={handleContactAltTelephoneChange}
            error={errors.emergencyContactAlternativeTelephone}
          />
        </FormRow>
      </FormSection>
    );
  },
);

// Metrics Section
export const StaffMetricsSection = React.memo(function StaffMetricsSection({
  formData,
  errors,
  onChange,
  onUnauthorized,
}) {
  // Memoized handlers
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

  const handleTagsChange = useCallback(
    (value) => {
      onChange("tags", value);
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
      <TagsMultiSelect
        value={formData.tags}
        onChange={handleTagsChange}
        error={errors.tags}
        required={false}
        label="Tags (Optional)"
        helperText=""
        onUnauthorized={onUnauthorized}
      />

      <HowHearAboutUsSelect
        value={formData.howDidYouHearAboutUsID}
        onChange={handleHowHearChange}
        onOtherDetected={handleHowHearOtherDetected}
        error={errors.howDidYouHearAboutUsID}
        required={true}
        helperText="Tell us how this person discovered our organization"
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

      <DateInput
        label="Join Date (Optional)"
        value={formData.joinDate}
        onChange={handleJoinDateChange}
        error={errors.joinDate}
      />
    </FormSection>
  );
});

// System Information Section
export const StaffSystemInfoSection = React.memo(
  function StaffSystemInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoized handlers
    const handlePreferredLanguageChange = useCallback(
      (value) => {
        onChange("preferredLanguage", value);
      },
      [onChange],
    );

    const handleIdentifyAsChange = useCallback(
      (e) => {
        const id = parseInt(e.target.value);
        const currentIdentifyAs = formData.identifyAs || [];

        if (currentIdentifyAs.includes(id)) {
          onChange(
            "identifyAs",
            currentIdentifyAs.filter((i) => i !== id),
          );
        } else {
          onChange("identifyAs", [...currentIdentifyAs, id]);
        }
      },
      [formData.identifyAs, onChange],
    );

    // Memoized set of selected values for faster lookups
    const selectedIdentifyAs = useMemo(
      () => new Set(formData.identifyAs || []),
      [formData.identifyAs],
    );

    return (
      <FormSection icon={ComputerDesktopIcon}>
        <div className="space-y-6">
          <div className="max-w-xl">
            <Select
              label="Preferred Language"
              value={formData.preferredLanguage}
              onChange={handlePreferredLanguageChange}
              options={LANGUAGE_OPTIONS}
              error={errors.preferredLanguage}
            />
          </div>

          {/* Identify As Options */}
          <div className="max-w-xl">
            <label
              className={`block text-base sm:text-lg font-semibold ${getThemeClasses("text-primary")} mb-3`}
            >
              Do you identify as belonging to any of the following groups?
              (Optional)
            </label>
            <div className="space-y-3">
              {IDENTIFY_AS_OPTIONS.map((opt) => (
                <IdentifyAsCheckbox
                  key={opt.value}
                  option={opt}
                  isChecked={selectedIdentifyAs.has(opt.value)}
                  onChange={handleIdentifyAsChange}
                  getThemeClasses={getThemeClasses}
                />
              ))}
            </div>
          </div>
        </div>
      </FormSection>
    );
  },
);

// Separate component for identify-as checkboxes for better performance
const IdentifyAsCheckbox = React.memo(function IdentifyAsCheckbox({
  option,
  isChecked,
  onChange,
  getThemeClasses,
}) {
  return (
    <label className="flex items-center">
      <input
        type="checkbox"
        value={option.value}
        checked={isChecked}
        onChange={onChange}
        className={`w-5 h-5 rounded ${getThemeClasses("input-border")} ${getThemeClasses("accent-primary")} ${getThemeClasses("focus-ring")}`}
      />
      <span
        className={`ml-3 text-base sm:text-lg ${getThemeClasses("info-card-content-text")}`}
      >
        {option.label}
      </span>
    </label>
  );
});
