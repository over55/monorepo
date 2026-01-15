// File: src/components/UIX/EntityUpdatePage/examples/EventFormSections.jsx

import React, { useCallback, useMemo } from "react";
import {
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CogIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { FormSection, FormRow, Input, Select, Checkbox, DateTime } from "../../index";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";
import { SpecializationCertificationPicker } from "../../../business/selects";

// Event status options - frozen constant
const EVENT_STATUS_OPTIONS = Object.freeze([
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
]);

// SHSM options - frozen constant (boolean values as strings for Select component)
const SHSM_OPTIONS = Object.freeze([
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
]);

// Event Type Label Map
const EVENT_TYPE_LABELS = {
  "1": "Conference",
  "2": "In-School",
  "3": "Field Trip",
  "4": "Virtual",
};

// Basic Event Information Section
export const EventBasicInfoSection = React.memo(function EventBasicInfoSection({
  formData,
  errors,
  onChange,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers for text areas
  const handleDescriptionChange = useCallback(
    (e) => {
      onChange("description", e.target.value);
    },
    [onChange],
  );

  const handleAdditionalNotesChange = useCallback(
    (e) => {
      onChange("additionalNotes", e.target.value);
    },
    [onChange],
  );

  // Memoized handler for event name
  const handleEventNameChange = useCallback(
    (value) => {
      onChange("eventName", value);
    },
    [onChange],
  );

  // Get event type label
  const eventTypeLabel = formData.eventType ? EVENT_TYPE_LABELS[formData.eventType] || "Unknown" : "";

  return (
    <FormSection title="Event Information" icon={CalendarDaysIcon}>
      <FormRow columns={2}>
        <Input
          id="eventName"
          name="eventName"
          label="Event Name"
          value={formData.eventName}
          onChange={handleEventNameChange}
          error={errors.eventName}
          required
        />
        <Input
          id="eventType"
          name="eventType"
          label="Event Type"
          value={eventTypeLabel}
          onChange={() => {}}
          disabled
          readOnly
        />
      </FormRow>

      <div>
        <label
          htmlFor="description"
          className={`block text-sm font-medium ${getThemeClasses("info-card-content-text")} mb-2`}
        >
          Event Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleDescriptionChange}
          rows={3}
          className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} ${getThemeClasses("input-bg")} ${getThemeClasses("info-card-content-text")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")}`}
        />
      </div>

      <div>
        <label
          htmlFor="additionalNotes"
          className={`block text-sm font-medium ${getThemeClasses("info-card-content-text")} mb-2`}
        >
          Additional Notes
        </label>
        <textarea
          id="additionalNotes"
          name="additionalNotes"
          value={formData.additionalNotes}
          onChange={handleAdditionalNotesChange}
          rows={2}
          className={`block w-full px-3 py-2 border ${getThemeClasses("input-border")} ${getThemeClasses("input-bg")} ${getThemeClasses("info-card-content-text")} rounded-lg ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")}`}
        />
      </div>
    </FormSection>
  );
});

// Date & Time Information Section
export const EventDateTimeSection = React.memo(function EventDateTimeSection({
  formData,
  errors,
  onChange,
}) {
  // Convert DateTime component format back to separate datetime-local formats
  const handleDateTimeChange = useCallback((value) => {
    if (!value?.date || !value?.startTime) {
      onChange("startDateTime", "");
      onChange("endDateTime", "");
      return;
    }

    const startDateTime = `${value.date}T${value.startTime}`;
    onChange("startDateTime", startDateTime);

    if (value.endTime) {
      const endDateTime = `${value.date}T${value.endTime}`;
      onChange("endDateTime", endDateTime);
    } else {
      onChange("endDateTime", "");
    }
  }, [onChange]);

  // Memoized datetime value - convert datetime-local formats to DateTime component format
  const dateTimeValue = useMemo(() => {
    if (!formData.startDateTime) return { date: "", startTime: "", endTime: "" };

    const [startDate, startTime] = formData.startDateTime.split("T");
    let endTime = "";

    if (formData.endDateTime) {
      const [, endTimeStr] = formData.endDateTime.split("T");
      endTime = endTimeStr || "";
    }

    return {
      date: startDate || "",
      startTime: startTime || "",
      endTime: endTime
    };
  }, [formData.startDateTime, formData.endDateTime]);

  // Get today's date for minDate
  const getTodayDate = useCallback(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Calculate day of week from date
  const dayOfWeek = useMemo(() => {
    if (!formData.startDateTime) return "";
    const dateStr = formData.startDateTime.split("T")[0];
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[date.getDay()];
  }, [formData.startDateTime]);

  // Checkbox handlers
  const handleFacilitatorAMChange = useCallback(
    (e) => {
      onChange("facilitatorAM", e.target.checked);
    },
    [onChange],
  );

  const handleFacilitatorPMChange = useCallback(
    (e) => {
      onChange("facilitatorPM", e.target.checked);
    },
    [onChange],
  );

  const { getThemeClasses } = useUIXTheme();

  return (
    <FormSection title="Date & Time Information" icon={ClockIcon}>
      <FormRow columns={1}>
        <DateTime
          id="eventDateTime"
          label="Event Date & Time"
          value={dateTimeValue}
          onChange={handleDateTimeChange}
          error={errors.startDateTime || errors.endDateTime}
          required
          enableEndTime={true}
          minDate={getTodayDate()}
          helperText="When does the event take place?"
        />
      </FormRow>

      <FormRow columns={1}>
        <Input
          id="dayOfWeek"
          name="dayOfWeek"
          label="Day of Week"
          value={dayOfWeek}
          onChange={() => {}}
          disabled
          readOnly
          helperText="This field is automatically populated based on the selected date"
        />
      </FormRow>

      <div className="space-y-3">
        <p className={`text-sm font-semibold ${getThemeClasses("info-card-content-text")}`}>
          Facilitator/Speaker Time Frames
        </p>
        <div className="flex items-center gap-6">
          <label className="flex items-center cursor-pointer" htmlFor="facilitator-am">
            <input
              type="checkbox"
              id="facilitator-am"
              name="facilitatorAM"
              checked={formData.facilitatorAM || false}
              onChange={handleFacilitatorAMChange}
              className={`h-4 w-4 ${getThemeClasses("checkbox-focus")} ${getThemeClasses("border-secondary")} rounded focus:ring-2`}
            />
            <span className={`ml-2 text-sm ${getThemeClasses("info-card-content-text")}`}>AM</span>
          </label>
          <label className="flex items-center cursor-pointer" htmlFor="facilitator-pm">
            <input
              type="checkbox"
              id="facilitator-pm"
              name="facilitatorPM"
              checked={formData.facilitatorPM || false}
              onChange={handleFacilitatorPMChange}
              className={`h-4 w-4 ${getThemeClasses("checkbox-focus")} ${getThemeClasses("border-secondary")} rounded focus:ring-2`}
            />
            <span className={`ml-2 text-sm ${getThemeClasses("info-card-content-text")}`}>PM</span>
          </label>
        </div>
        <p className={`text-sm ${getThemeClasses("text-secondary")}`}>
          Select when facilitators/speakers will be needed
        </p>
      </div>
    </FormSection>
  );
});

// Location & Logistics Section
export const EventLocationSection = React.memo(function EventLocationSection({
  formData,
  errors,
  onChange,
}) {
  // Memoized handlers for inputs
  const handleLocationChange = useCallback(
    (value) => {
      onChange("location", value);
    },
    [onChange],
  );

  const handleAttendeeCapacityChange = useCallback(
    (value) => {
      onChange("attendeeCapacity", value);
    },
    [onChange],
  );

  const handlePartnersChange = useCallback(
    (value) => {
      onChange("partners", value);
    },
    [onChange],
  );

  const handleListingURLChange = useCallback(
    (value) => {
      onChange("listingURL", value);
    },
    [onChange],
  );

  return (
    <FormSection title="Location & Logistics" icon={MapPinIcon}>
      <FormRow columns={1}>
        <Input
          id="location"
          name="location"
          label="Location"
          value={formData.location}
          onChange={handleLocationChange}
          error={errors.location}
        />
      </FormRow>

      <FormRow columns={2}>
        <Input
          id="attendeeCapacity"
          name="attendeeCapacity"
          label="Attendee Capacity"
          type="number"
          value={formData.attendeeCapacity}
          onChange={handleAttendeeCapacityChange}
          error={errors.attendeeCapacity}
        />
        <Input
          id="partners"
          name="partners"
          label="Partners"
          value={formData.partners}
          onChange={handlePartnersChange}
          error={errors.partners}
        />
      </FormRow>

      <FormRow columns={1}>
        <Input
          id="listingURL"
          name="listingURL"
          label="Event Listing URL"
          type="url"
          value={formData.listingURL}
          onChange={handleListingURLChange}
          error={errors.listingURL}
        />
      </FormRow>
    </FormSection>
  );
});

// Contact Information Section
export const EventContactSection = React.memo(function EventContactSection({
  formData,
  errors,
  onChange,
}) {
  // Memoized handlers for inputs
  const handleContactNameChange = useCallback(
    (value) => {
      onChange("contactName", value);
    },
    [onChange],
  );

  const handleContactEmailChange = useCallback(
    (value) => {
      onChange("contactEmail", value);
    },
    [onChange],
  );

  const handleContactPhoneChange = useCallback(
    (value) => {
      onChange("contactPhone", value);
    },
    [onChange],
  );

  return (
    <FormSection title="Contact Information" icon={EnvelopeIcon}>
      <FormRow columns={1}>
        <Input
          id="contactName"
          name="contactName"
          label="Contact Name"
          value={formData.contactName}
          onChange={handleContactNameChange}
          error={errors.contactName}
        />
      </FormRow>

      <FormRow columns={2}>
        <Input
          id="contactEmail"
          name="contactEmail"
          label="Contact Email"
          type="email"
          value={formData.contactEmail}
          onChange={handleContactEmailChange}
          error={errors.contactEmail}
        />
        <Input
          id="contactPhone"
          name="contactPhone"
          label="Contact Phone"
          type="tel"
          value={formData.contactPhone}
          onChange={handleContactPhoneChange}
          error={errors.contactPhone}
        />
      </FormRow>
    </FormSection>
  );
});

// Settings & Status Section
export const EventSettingsSection = React.memo(function EventSettingsSection({
  formData,
  errors,
  onChange,
}) {
  // Memoized handlers for selects
  const handleStatusChange = useCallback(
    (value) => {
      onChange("status", value);
    },
    [onChange],
  );

  const handleSHSMChange = useCallback(
    (value) => {
      onChange("isSHSM", value);
    },
    [onChange],
  );

  return (
    <FormSection title="Settings & Status" icon={CogIcon}>
      <FormRow columns={2}>
        <Select
          id="status"
          name="status"
          label="Event Status"
          value={formData.status}
          onChange={handleStatusChange}
          options={EVENT_STATUS_OPTIONS}
          error={errors.status}
        />
        <Select
          id="isSHSM"
          name="isSHSM"
          label="SHSM Eligible"
          value={formData.isSHSM}
          onChange={handleSHSMChange}
          options={SHSM_OPTIONS}
          error={errors.isSHSM}
        />
      </FormRow>
    </FormSection>
  );
});

// Specializations & Certifications Section
export const EventSpecializationCertificationSection = React.memo(function EventSpecializationCertificationSection({
  formData,
  errors,
  onChange,
}) {
  // Handler for SpecializationCertificationPicker
  const handleSpecializationCertificationChange = useCallback(
    (value) => {
      // Update all three fields when the picker changes
      onChange("certificationIds", value.certificationIds);
      onChange("specializationIds", value.specializationIds);
      onChange("specializationCertificationItems", value._items || []);
    },
    [onChange],
  );

  // Build value object for SpecializationCertificationPicker
  const pickerValue = useMemo(() => ({
    certificationIds: formData.certificationIds || [],
    specializationIds: formData.specializationIds || [],
    _items: formData.specializationCertificationItems || [],
  }), [formData.certificationIds, formData.specializationIds, formData.specializationCertificationItems]);

  const onUnauthorized = useCallback(() => {
    // Navigate to login or show error
    window.location.href = "/login?unauthorized=true";
  }, []);

  return (
    <FormSection title="Specializations & Certifications" icon={AcademicCapIcon}>
      <SpecializationCertificationPicker
        id="specializationCertification"
        value={pickerValue}
        onChange={handleSpecializationCertificationChange}
        error={errors.certifications}
        label="Event Specializations & Certifications"
        helperText="Select specializations and their associated certifications for this event"
        onUnauthorized={onUnauthorized}
      />
    </FormSection>
  );
});
