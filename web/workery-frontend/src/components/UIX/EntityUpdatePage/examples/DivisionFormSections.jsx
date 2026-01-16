// File: src/components/UIX/EntityUpdatePage/examples/DivisionFormSections.jsx

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  BuildingOffice2Icon,
  UserGroupIcon,
  MapPinIcon,
  TagIcon,
  CalendarIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  FormSection,
  FormRow,
  Input,
  Select,
  Checkbox,
  DateInput,
  MultiSelect,
} from "../../index";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";
import { OrganizationSelect } from "../../../business/selects";
import { useTagManager } from "../../../../services/Services";
import {
  DIVISION_TYPE_OPTIONS,
  DIVISION_STATUS,
  DIVISION_STATUS_LABELS,
  COUNTRY_OPTIONS,
  getRegionOptions,
  getRegionLabel,
  PHONE_TYPE_OPTIONS,
  DEFAULT_VALUES,
} from "../../../../constants/Division";

// Map division types to organization types - memoized constant
const DIVISION_TYPE_TO_ORG_TYPE = Object.freeze({
  educational: "educational",
  corporate: "corporate",
  "non-profit": "non-profit",
  government: "government",
});

// Default contact template - memoized constant
const DEFAULT_CONTACT = Object.freeze({
  firstName: "",
  lastName: "",
  title: "",
  email: "",
  isOkToEmail: false,
  phone: "",
  phoneType: 0,
  phoneExtension: "",
  otherPhone: "",
  otherPhoneType: 0,
  otherPhoneExtension: "",
});

// Generate unique ID for contacts
const generateContactId = () =>
  `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Basic Information Section
export const DivisionBasicInfoSection = React.memo(
  function DivisionBasicInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses: _getThemeClasses } = useUIXTheme();

    // Memoized handler for unauthorized access
    const handleUnauthorized = useCallback(() => {
      // This will be handled by the parent EntityUpdatePage
      console.log("Unauthorized access");
    }, []);

    // Memoized handler for division type change
    const handleDivisionTypeChange = useCallback(
      (value) => {
        onChange("divisionType", value);
        // Clear organization when type changes
        onChange("organizationId", "");
      },
      [onChange],
    );

    // Memoized handler for status change
    const handleStatusChange = useCallback(
      (value) => {
        onChange("status", parseInt(value));
      },
      [onChange],
    );

    // Memoized status options
    const statusOptions = useMemo(
      () => [
        {
          value: DIVISION_STATUS.ACTIVE,
          label: DIVISION_STATUS_LABELS[DIVISION_STATUS.ACTIVE],
        },
        {
          value: DIVISION_STATUS.INACTIVE,
          label: DIVISION_STATUS_LABELS[DIVISION_STATUS.INACTIVE],
        },
        {
          value: DIVISION_STATUS.ARCHIVED,
          label: DIVISION_STATUS_LABELS[DIVISION_STATUS.ARCHIVED],
        },
      ],
      [],
    );

    // Memoized filtered division type options
    const filteredDivisionTypeOptions = useMemo(
      () => DIVISION_TYPE_OPTIONS.filter((opt) => opt.value),
      [],
    );

    // Memoized placeholder text
    const orgSelectPlaceholder = useMemo(() => {
      if (!formData.divisionType) return "Select organization (optional)";

      const typeLabel =
        formData.divisionType === "non-profit"
          ? "Non-Profit"
          : formData.divisionType.charAt(0).toUpperCase() +
            formData.divisionType.slice(1);

      return `Select ${typeLabel} Organization`;
    }, [formData.divisionType]);

    return (
      <FormSection title="Basic Information" icon={BuildingOffice2Icon}>
        <FormRow columns={2}>
          <Input
            label="Division Name"
            value={formData.divisionName}
            onChange={(value) => onChange("divisionName", value)}
            error={errors.divisionName}
            required
            placeholder="Enter division name"
          />
          <Input
            label="Division Short Name"
            value={formData.divisionShortName}
            onChange={(value) => onChange("divisionShortName", value)}
            error={errors.divisionShortName}
            placeholder="Enter short name (optional)"
          />
        </FormRow>

        <FormRow columns={2}>
          <Select
            label="Division Type"
            value={formData.divisionType}
            onChange={handleDivisionTypeChange}
            options={filteredDivisionTypeOptions}
            error={errors.divisionType}
            required
          />
          <Select
            label="Status"
            value={formData.status}
            onChange={handleStatusChange}
            options={statusOptions}
            error={errors.status}
            required
          />
        </FormRow>

        <FormRow columns={2}>
          <div>
            <OrganizationSelect
              value={formData.organizationId}
              onChange={(value) => onChange("organizationId", value)}
              error={errors.organizationId}
              label="Host Organization"
              onUnauthorized={handleUnauthorized}
              type={
                formData.divisionType
                  ? DIVISION_TYPE_TO_ORG_TYPE[formData.divisionType]
                  : null
              }
              placeholder={orgSelectPlaceholder}
            />
            {formData.divisionType && (
              <p className="mt-1 text-xs text-gray-600">
                Only showing{" "}
                {formData.divisionType === "non-profit"
                  ? "non-profit"
                  : formData.divisionType}{" "}
                organizations
              </p>
            )}
          </div>
          <DateInput
            label="Join Date"
            value={formData.joinDate}
            onChange={(value) => onChange("joinDate", value)}
            error={errors.joinDate}
            required
          />
        </FormRow>
      </FormSection>
    );
  },
);

// Contact Information Section
export const DivisionContactInfoSection = React.memo(
  function DivisionContactInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses: _getThemeClasses } = useUIXTheme();

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

    // Memoized handler for contact changes
    const handleContactChange = useCallback(
      (index, field, value) => {
        const updatedContacts = [...contacts];
        updatedContacts[index] = {
          ...updatedContacts[index],
          [field]: value,
        };
        onChange("contacts", updatedContacts);
      },
      [contacts, onChange],
    );

    // Memoized handler for adding contacts
    const addContact = useCallback(() => {
      if (contacts.length >= DEFAULT_VALUES.MAX_CONTACTS) {
        return;
      }
      const newContacts = [
        ...contacts,
        {
          ...DEFAULT_CONTACT,
          id: generateContactId(),
        },
      ];
      onChange("contacts", newContacts);
    }, [contacts, onChange]);

    // Memoized handler for removing contacts
    const removeContact = useCallback(
      (index) => {
        if (contacts.length <= 1) {
          return;
        }
        const newContacts = contacts.filter((_, i) => i !== index);
        onChange("contacts", newContacts);
      },
      [contacts, onChange],
    );

    return (
      <FormSection title="Contact Information" icon={UserGroupIcon}>
        <div className="space-y-6">
          {contacts.map((contact, index) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              index={index}
              errors={errors}
              canRemove={contacts.length > 1}
              onContactChange={handleContactChange}
              onRemove={() => removeContact(index)}
            />
          ))}

          {contacts.length < DEFAULT_VALUES.MAX_CONTACTS && (
            <button
              type="button"
              onClick={addContact}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Another Contact
            </button>
          )}
        </div>
      </FormSection>
    );
  },
);

// Separate ContactCard component for better performance
const ContactCard = React.memo(function ContactCard({
  contact,
  index,
  errors,
  canRemove,
  onContactChange,
  onRemove,
}) {
  // Create handlers for each field to avoid recreating functions
  const createFieldHandler = useCallback(
    (field) => {
      return (value) => onContactChange(index, field, value);
    },
    [index, onContactChange],
  );

  const handlePhoneTypeChange = useCallback(
    (value) => {
      onContactChange(index, "phoneType", parseInt(value));
    },
    [index, onContactChange],
  );

  const handleOtherPhoneTypeChange = useCallback(
    (value) => {
      onContactChange(index, "otherPhoneType", parseInt(value));
    },
    [index, onContactChange],
  );

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-lg font-medium text-gray-900">
          Contact {index + 1}
        </h4>
        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-red-600 hover:text-red-700"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <FormRow columns={2}>
        <Input
          label="First Name"
          value={contact.firstName}
          onChange={createFieldHandler("firstName")}
          error={errors[`contacts[${index}].firstName`]}
          required
        />
        <Input
          label="Last Name"
          value={contact.lastName}
          onChange={createFieldHandler("lastName")}
          error={errors[`contacts[${index}].lastName`]}
          required
        />
      </FormRow>

      <FormRow columns={2}>
        <Input
          label="Title"
          value={contact.title}
          onChange={createFieldHandler("title")}
          placeholder="e.g., Manager, Director"
        />
        <Input
          label="Email"
          type="email"
          value={contact.email}
          onChange={createFieldHandler("email")}
          error={errors[`contacts[${index}].email`]}
          required
        />
      </FormRow>

      <FormRow columns={2}>
        <Input
          label="Phone"
          value={contact.phone}
          onChange={createFieldHandler("phone")}
          placeholder="(555) 123-4567"
        />
        <Select
          label="Phone Type"
          value={contact.phoneType}
          onChange={handlePhoneTypeChange}
          options={PHONE_TYPE_OPTIONS}
        />
      </FormRow>

      {contact.phoneType === 2 && (
        <FormRow columns={2}>
          <Input
            label="Phone Extension"
            value={contact.phoneExtension}
            onChange={createFieldHandler("phoneExtension")}
            placeholder="Optional"
          />
          <div /> {/* Empty div to maintain grid */}
        </FormRow>
      )}

      <div className="mt-4">
        <Checkbox
          label="OK to Email"
          checked={contact.isOkToEmail}
          onChange={createFieldHandler("isOkToEmail")}
        />
      </div>

      {/* Other Phone Section */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <h5 className="text-sm font-medium text-gray-700 mb-3">
          Other Phone (Optional)
        </h5>
        <FormRow columns={3}>
          <Input
            label="Other Phone"
            value={contact.otherPhone}
            onChange={createFieldHandler("otherPhone")}
            placeholder="(555) 123-4567"
          />
          <Select
            label="Other Phone Type"
            value={contact.otherPhoneType}
            onChange={handleOtherPhoneTypeChange}
            options={PHONE_TYPE_OPTIONS}
          />
          {contact.otherPhoneType === 2 && (
            <Input
              label="Other Phone Extension"
              value={contact.otherPhoneExtension}
              onChange={createFieldHandler("otherPhoneExtension")}
              placeholder="Optional"
            />
          )}
        </FormRow>
      </div>
    </div>
  );
});

// Address Information Section
export const DivisionAddressSection = React.memo(
  function DivisionAddressSection({ formData, errors, onChange }) {
    const { getThemeClasses: _getThemeClasses } = useUIXTheme();

    // Memoized region options and labels
    const regionOptions = useMemo(
      () => getRegionOptions(formData.country),
      [formData.country],
    );

    const regionLabel = useMemo(
      () => getRegionLabel(formData.country),
      [formData.country],
    );

    const shippingRegionOptions = useMemo(
      () =>
        formData.hasShippingAddress
          ? getRegionOptions(formData.shippingCountry)
          : [],
      [formData.hasShippingAddress, formData.shippingCountry],
    );

    const shippingRegionLabel = useMemo(
      () =>
        formData.hasShippingAddress
          ? getRegionLabel(formData.shippingCountry)
          : "Region",
      [formData.hasShippingAddress, formData.shippingCountry],
    );

    return (
      <FormSection title="Address Information" icon={MapPinIcon}>
        <div className="mb-6">
          <Checkbox
            label="Has shipping address different than mailing address"
            checked={formData.hasShippingAddress}
            onChange={(checked) => onChange("hasShippingAddress", checked)}
          />
        </div>

        <div
          className={`grid ${formData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-8`}
        >
          {/* Mailing Address */}
          <div>
            {formData.hasShippingAddress && (
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Mailing Address
              </h4>
            )}

            <div className="space-y-4">
              <Select
                label="Country"
                value={formData.country}
                onChange={(value) => onChange("country", value)}
                options={COUNTRY_OPTIONS}
                error={errors.country}
                required
              />

              <Select
                label={regionLabel}
                value={formData.region}
                onChange={(value) => onChange("region", value)}
                options={regionOptions}
                error={errors.region}
                required
              />

              <Input
                label="City"
                value={formData.city}
                onChange={(value) => onChange("city", value)}
                error={errors.city}
                required
              />

              <Input
                label="Address Line 1"
                value={formData.addressLine1}
                onChange={(value) => onChange("addressLine1", value)}
                error={errors.addressLine1}
                required
              />

              <Input
                label="Address Line 2 (Optional)"
                value={formData.addressLine2}
                onChange={(value) => onChange("addressLine2", value)}
                placeholder="Apartment, suite, etc. (optional)"
              />

              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChange={(value) => onChange("postalCode", value)}
                error={errors.postalCode}
                required
              />
            </div>
          </div>

          {/* Shipping Address */}
          {formData.hasShippingAddress && (
            <div>
              <h4 className="text-base font-medium text-gray-900 mb-4">
                Shipping Address
              </h4>

              <div className="space-y-4">
                <Input
                  label="Shipping Name"
                  value={formData.shippingName}
                  onChange={(value) => onChange("shippingName", value)}
                  placeholder="Company or recipient name"
                  error={errors.shippingName}
                />

                <Input
                  label="Shipping Phone"
                  value={formData.shippingPhone}
                  onChange={(value) => onChange("shippingPhone", value)}
                  placeholder="(555) 123-4567"
                  error={errors.shippingPhone}
                />

                <Select
                  label="Country"
                  value={formData.shippingCountry}
                  onChange={(value) => onChange("shippingCountry", value)}
                  options={COUNTRY_OPTIONS}
                  error={errors.shippingCountry}
                  required={formData.hasShippingAddress}
                />

                <Select
                  label={shippingRegionLabel}
                  value={formData.shippingRegion}
                  onChange={(value) => onChange("shippingRegion", value)}
                  options={shippingRegionOptions}
                  error={errors.shippingRegion}
                  required={formData.hasShippingAddress}
                />

                <Input
                  label="City"
                  value={formData.shippingCity}
                  onChange={(value) => onChange("shippingCity", value)}
                  error={errors.shippingCity}
                  required={formData.hasShippingAddress}
                />

                <Input
                  label="Address Line 1"
                  value={formData.shippingAddressLine1}
                  onChange={(value) => onChange("shippingAddressLine1", value)}
                  error={errors.shippingAddressLine1}
                  required={formData.hasShippingAddress}
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={formData.shippingAddressLine2}
                  onChange={(value) => onChange("shippingAddressLine2", value)}
                  placeholder="Apartment, suite, etc. (optional)"
                />

                <Input
                  label="Postal Code"
                  value={formData.shippingPostalCode}
                  onChange={(value) => onChange("shippingPostalCode", value)}
                  error={errors.shippingPostalCode}
                  required={formData.hasShippingAddress}
                />
              </div>
            </div>
          )}
        </div>
      </FormSection>
    );
  },
);

// Additional Information Section
export const DivisionAdditionalInfoSection = React.memo(
  function DivisionAdditionalInfoSection({ formData, errors, onChange }) {
    const { getThemeClasses } = useUIXTheme();
    const tagManager = useTagManager();
    const [tagOptions, setTagOptions] = useState([]);
    const abortControllerRef = useRef(null);

    // Load tag options with cleanup
    useEffect(() => {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const loadTags = async () => {
        try {
          console.log("DivisionAdditionalInfoSection: Loading tag options...");
          const options = await tagManager.getTagSelectOptions(() => {}, {
            signal: abortControllerRef.current?.signal,
          });

          console.log("DivisionAdditionalInfoSection: Raw options received:", options);
          const formattedOptions = options.map((opt) => ({
            value: opt.value,
            label: opt.label,
          }));
          console.log("DivisionAdditionalInfoSection: Setting tagOptions to:", formattedOptions);
          setTagOptions(formattedOptions);
        } catch (error) {
          // Ignore abort errors
          if (error.name === "AbortError") {
            console.log("DivisionAdditionalInfoSection: Tag loading aborted (expected on unmount)");
            return;
          }
          console.error("DivisionAdditionalInfoSection: Error loading tags:", error);
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

    // Memoized handler for textarea change
    const handleCommentChange = useCallback(
      (e) => {
        onChange("additionalComment", e.target.value);
      },
      [onChange],
    );

    // Debug logging
    useEffect(() => {
      console.log("DivisionAdditionalInfoSection: formData.tags:", formData.tags);
      console.log("DivisionAdditionalInfoSection: tagOptions:", tagOptions);
      console.log("DivisionAdditionalInfoSection: tagOptions loaded?", tagOptions.length > 0);
    }, [formData.tags, tagOptions]);

    return (
      <FormSection title="Additional Information" icon={TagIcon}>
        <div className="space-y-6">
          <MultiSelect
            label="Tags (Optional)"
            value={formData.tags}
            onChange={(value) => onChange("tags", value)}
            options={tagOptions}
            placeholder="Select tags..."
            error={errors.tags}
          />

          <div>
            <label
              className={`block text-sm font-medium ${getThemeClasses("info-card-content-text")} mb-2`}
            >
              Additional Comments
            </label>
            <textarea
              value={formData.additionalComment}
              onChange={handleCommentChange}
              rows={4}
              placeholder="Any additional information..."
              className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")}`}
            />
            <p className="mt-1 text-xs text-gray-600">
              {formData.additionalComment?.length || 0}/
              {DEFAULT_VALUES.COMMENT_MAX_LENGTH} characters
            </p>
          </div>
        </div>
      </FormSection>
    );
  },
);
