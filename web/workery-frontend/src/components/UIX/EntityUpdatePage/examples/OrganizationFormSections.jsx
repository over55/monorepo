// File: src/components/UIX/EntityUpdatePage/examples/OrganizationFormSections.jsx

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserIcon,
  PlusIcon,
  XMarkIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { FormSection, FormRow, Input, Select, Checkbox, MultiSelect } from "../../index";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";
import { useTagManager } from "../../../../services/Services";

// Organization type options - frozen constant
const ORGANIZATION_TYPE_OPTIONS = Object.freeze([
  { value: "educational", label: "Educational" },
  { value: "corporate", label: "Corporate" },
  { value: "non-profit", label: "Non-Profit" },
  { value: "government", label: "Government" },
]);

// Phone type options - frozen constant
const PHONE_TYPE_OPTIONS = Object.freeze([
  { value: 0, label: "Please select" },
  { value: 1, label: "Mobile" },
  { value: 2, label: "Work" },
  { value: 3, label: "Home" },
]);

// Default contact template - frozen constant
const DEFAULT_CONTACT = Object.freeze({
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  isOkToEmail: true,
  phone: "",
  phoneType: 0,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: 0,
  otherPhoneExtension: "",
});

// Maximum contacts allowed
const MAX_CONTACTS = 10;

// Generate unique ID for contacts
const generateContactId = () =>
  `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Basic Information Section
export const OrganizationBasicInfoSection = React.memo(
  function OrganizationBasicInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoized handlers
    const handleOrganizationNameChange = useCallback(
      (value) => {
        onChange("organizationName", value);
      },
      [onChange],
    );

    const handleOrganizationShortNameChange = useCallback(
      (value) => {
        onChange("organizationShortName", value);
      },
      [onChange],
    );

    const handleOrganizationTypeChange = useCallback(
      (value) => {
        onChange("organizationType", value);
      },
      [onChange],
    );

    const handleWebsiteChange = useCallback(
      (value) => {
        onChange("website", value);
      },
      [onChange],
    );

    const handleDescriptionChange = useCallback(
      (e) => {
        onChange("description", e.target.value);
      },
      [onChange],
    );

    return (
      <FormSection title="Basic Information" icon={BuildingOffice2Icon}>
        <FormRow columns={2}>
          <Input
            label="Organization Name"
            value={formData.organizationName}
            onChange={handleOrganizationNameChange}
            error={errors.organizationName}
            required
          />
          <Input
            label="Short Name"
            value={formData.organizationShortName}
            onChange={handleOrganizationShortNameChange}
            error={errors.organizationShortName}
          />
        </FormRow>

        <FormRow columns={2}>
          <Select
            label="Organization Type"
            value={formData.organizationType}
            onChange={handleOrganizationTypeChange}
            options={ORGANIZATION_TYPE_OPTIONS}
            error={errors.organizationType}
            required
          />
          <Input
            label="Website"
            type="url"
            value={formData.website}
            onChange={handleWebsiteChange}
            error={errors.website}
          />
        </FormRow>

        <div>
          <label
            className={`block text-sm font-medium ${getThemeClasses("info-card-content-text")} mb-2`}
          >
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={handleDescriptionChange}
            rows={3}
            className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")}`}
          />
        </div>
      </FormSection>
    );
  },
);

// Contact Information Section
export const OrganizationContactInfoSection = React.memo(
  function OrganizationContactInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses } = useUIXTheme();

    // Initialize contacts with unique IDs
    const contacts = useMemo(() => {
      const existingContacts = formData.contacts || [];
      if (existingContacts.length === 0) {
        return [
          {
            ...DEFAULT_CONTACT,
            id: generateContactId(),
          },
        ];
      }
      // Ensure all contacts have IDs
      return existingContacts.map((contact) => ({
        ...contact,
        id: contact.id || generateContactId(),
      }));
    }, [formData.contacts]);

    // Memoized handler for adding contacts
    const addContact = useCallback(() => {
      if (contacts.length < MAX_CONTACTS) {
        const newContacts = [
          ...contacts,
          {
            ...DEFAULT_CONTACT,
            id: generateContactId(),
          },
        ];
        onChange("contacts", newContacts);
      }
    }, [contacts, onChange]);

    // Memoized handler for removing contacts
    const removeContact = useCallback(
      (index) => {
        if (contacts.length > 1) {
          const newContacts = contacts.filter((_, i) => i !== index);
          onChange("contacts", newContacts);
        }
      },
      [contacts, onChange],
    );

    // Memoized handler for updating contact fields
    const updateContact = useCallback(
      (index, field, value) => {
        const newContacts = [...contacts];
        newContacts[index] = {
          ...newContacts[index],
          [field]: value,
        };
        onChange("contacts", newContacts);
      },
      [contacts, onChange],
    );

    // Calculate remaining contacts allowed
    const remainingContacts = MAX_CONTACTS - contacts.length;
    const canAddMore = remainingContacts > 0;

    return (
      <FormSection title="Contact Information" icon={UserGroupIcon}>
        {contacts.map((contact, index) => (
          <OrganizationContactCard
            key={contact.id}
            contact={contact}
            index={index}
            errors={errors}
            canRemove={contacts.length > 1 && index > 0}
            onUpdate={updateContact}
            onRemove={() => removeContact(index)}
            getThemeClasses={getThemeClasses}
          />
        ))}

        {/* Add Additional Contact Button */}
        {canAddMore && (
          <div className="mt-6">
            <button
              type="button"
              onClick={addContact}
              className={`inline-flex items-center px-4 py-2 border ${getThemeClasses("border-accent")} ${getThemeClasses("text-accent")} rounded-lg hover:${getThemeClasses("bg-accent-light")} transition-colors text-sm font-medium`}
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Additional Contact
            </button>
            <p className={`mt-2 text-xs ${getThemeClasses("text-muted")}`}>
              You can add up to {remainingContacts} more contact
              {remainingContacts !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </FormSection>
    );
  },
);

// Separate ContactCard component for better performance
const OrganizationContactCard = React.memo(function OrganizationContactCard({
  contact,
  index,
  errors,
  canRemove,
  onUpdate,
  onRemove,
  getThemeClasses,
}) {
  // Create field-specific handlers
  const createFieldHandler = useCallback(
    (field) => {
      return (value) => onUpdate(index, field, value);
    },
    [index, onUpdate],
  );

  const handlePhoneTypeChange = useCallback(
    (value) => {
      onUpdate(index, "phoneType", parseInt(value));
    },
    [index, onUpdate],
  );

  const handleOtherPhoneTypeChange = useCallback(
    (value) => {
      onUpdate(index, "otherPhoneType", parseInt(value));
    },
    [index, onUpdate],
  );

  const handleIsOkToEmailChange = useCallback(
    (checked) => {
      onUpdate(index, "isOkToEmail", checked);
    },
    [index, onUpdate],
  );

  const contactNumber = index + 1;
  const showContactNumber = index > 0;

  return (
    <div
      className={`mb-6 pb-6 border-b last:border-b-0 ${getThemeClasses("border-default")}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold ${getThemeClasses("text-primary")} flex items-center`}
        >
          <UserIcon
            className={`w-5 h-5 mr-2 ${getThemeClasses("text-accent")}`}
          />
          Contact Person{showContactNumber ? ` #${contactNumber}` : ""}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className={`${getThemeClasses("text-error")} hover:${getThemeClasses("text-error-hover")} flex items-center text-sm font-medium`}
          >
            <XMarkIcon className="w-4 h-4 mr-1" />
            Remove
          </button>
        )}
      </div>

      <div className="space-y-4">
        <FormRow columns={2}>
          <Input
            label="First Name"
            value={contact.firstName}
            onChange={createFieldHandler("firstName")}
            error={errors[`contact_${index}_firstName`]}
            required
          />
          <Input
            label="Last Name"
            value={contact.lastName}
            onChange={createFieldHandler("lastName")}
            error={errors[`contact_${index}_lastName`]}
            required
          />
        </FormRow>

        <Input
          label="Title"
          value={contact.title}
          onChange={createFieldHandler("title")}
          error={errors[`contact_${index}_title`]}
        />

        <Input
          label="Email Address"
          type="email"
          value={contact.email}
          onChange={createFieldHandler("email")}
          error={errors[`contact_${index}_email`]}
          required
        />

        <Checkbox
          label="I agree to receive electronic email"
          checked={contact.isOkToEmail}
          onChange={handleIsOkToEmailChange}
        />

        <FormRow columns={2}>
          <Input
            label="Phone Number"
            type="tel"
            value={contact.phone}
            onChange={createFieldHandler("phone")}
            error={errors[`contact_${index}_phone`]}
            required
          />
          <Select
            label="Phone Type"
            value={contact.phoneType}
            onChange={handlePhoneTypeChange}
            options={PHONE_TYPE_OPTIONS}
            error={errors[`contact_${index}_phoneType`]}
          />
        </FormRow>

        {contact.phoneType === 2 && (
          <Input
            label="Phone Extension"
            value={contact.phoneExtension}
            onChange={createFieldHandler("phoneExtension")}
            error={errors[`contact_${index}_phoneExtension`]}
          />
        )}

        <FormRow columns={2}>
          <Input
            label="Other Phone Number (Optional)"
            type="tel"
            value={contact.otherPhone}
            onChange={createFieldHandler("otherPhone")}
            error={errors[`contact_${index}_otherPhone`]}
          />
          <Select
            label="Other Phone Type"
            value={contact.otherPhoneType}
            onChange={handleOtherPhoneTypeChange}
            options={PHONE_TYPE_OPTIONS}
            error={errors[`contact_${index}_otherPhoneType`]}
          />
        </FormRow>

        {contact.otherPhoneType === 2 && (
          <Input
            label="Other Phone Extension (Optional)"
            value={contact.otherPhoneExtension}
            onChange={createFieldHandler("otherPhoneExtension")}
            error={errors[`contact_${index}_otherPhoneExtension`]}
          />
        )}
      </div>
    </div>
  );
});

// Address Information Section
export const OrganizationAddressSection = React.memo(
  function OrganizationAddressSection({ formData, errors, onChange }) {
    // Create memoized handlers for each field
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
        <div className="space-y-4">
          <Input
            label="Country"
            value={formData.country}
            onChange={handleCountryChange}
            error={errors.country}
          />
          <Input
            label="Province/State"
            value={formData.region}
            onChange={handleRegionChange}
            error={errors.region}
          />
          <Input
            label="City"
            value={formData.city}
            onChange={handleCityChange}
            error={errors.city}
          />
          <Input
            label="Address Line 1"
            value={formData.addressLine1}
            onChange={handleAddressLine1Change}
            error={errors.addressLine1}
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
          />
        </div>
      </FormSection>
    );
  },
);

// Business Information Section
export const OrganizationBusinessInfoSection = React.memo(
  function OrganizationBusinessInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses } = useUIXTheme();

    // Memoized handlers for all fields
    const handleTaxIdChange = useCallback(
      (value) => {
        onChange("taxId", value);
      },
      [onChange],
    );

    const handleRegistrationNumberChange = useCallback(
      (value) => {
        onChange("registrationNumber", value);
      },
      [onChange],
    );

    const handleAllowOnlineBookingsChange = useCallback(
      (checked) => {
        onChange("allowOnlineBookings", checked);
      },
      [onChange],
    );

    const handleRequireApprovalForBookingsChange = useCallback(
      (checked) => {
        onChange("requireApprovalForBookings", checked);
      },
      [onChange],
    );

    return (
      <FormSection title="Business Information" icon={DocumentTextIcon}>
        <FormRow columns={2}>
          <Input
            label="Tax ID / Business Number"
            value={formData.taxId}
            onChange={handleTaxIdChange}
            error={errors.taxId}
            placeholder="Organization's tax identification number"
          />
          <Input
            label="Registration Number"
            value={formData.registrationNumber}
            onChange={handleRegistrationNumberChange}
            error={errors.registrationNumber}
            placeholder="Official registration or license number"
          />
        </FormRow>

        <div className="space-y-4 mt-4">
          <h4 className={`text-sm font-semibold ${getThemeClasses("text-primary")}`}>
            Booking Settings
          </h4>

          <Checkbox
            label="Allow Online Bookings"
            checked={formData.allowOnlineBookings}
            onChange={handleAllowOnlineBookingsChange}
          />

          <Checkbox
            label="Require Approval for Bookings"
            checked={formData.requireApprovalForBookings}
            onChange={handleRequireApprovalForBookingsChange}
          />
        </div>
      </FormSection>
    );
  },
);

// Additional Information Section
export const OrganizationAdditionalInfoSection = React.memo(
  function OrganizationAdditionalInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses: _getThemeClasses } = useUIXTheme();
    const tagManager = useTagManager();
    const [tagOptions, setTagOptions] = useState([]);
    const abortControllerRef = useRef(null);

    // Load tag options with cleanup
    useEffect(() => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const loadTags = async () => {
        try {
          const options = await tagManager.getTagSelectOptions(() => {}, {
            signal: abortControllerRef.current?.signal,
          });

          const formattedOptions = options.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }));
          setTagOptions(formattedOptions);
        } catch (error) {
          // Ignore abort errors
          if (error.name === "AbortError") {
            return;
          }
          if (process.env.NODE_ENV === "development") {
            console.error("OrganizationAdditionalInfoSection: Error loading tags:", error);
          }
        }
      };

      loadTags();

      // Cleanup function
      return () => {
        // Abort any pending requests
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
      };
    }, [tagManager]);

    return (
      <FormSection title="Additional Information" icon={TagIcon}>
        <div className="space-y-6">
          <MultiSelect
            label="Tags (Optional)"
            value={formData.tags || []}
            onChange={(value) => onChange("tags", value)}
            options={tagOptions}
            placeholder="Select tags..."
            error={errors.tags}
          />
        </div>
      </FormSection>
    );
  },
);
