// File: src/components/UIX/EntityUpdatePage/examples/OrderFormSections.jsx

import React, { useCallback } from "react";
import {
  BriefcaseIcon,
  AcademicCapIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import {
  FormSection,
  FormRow,
  DateInput,
} from "../../index";
import {
  TagsMultiSelect,
  SkillSetsMultiSelect,
} from "../../../business/selects";
import { useUIXTheme } from "../../themes/useUIXTheme.jsx";

// General Information Section
export const OrderGeneralInfoSection = React.memo(function OrderGeneralInfoSection({
  formData,
  errors,
  onChange,
  isArchived,
  isSubmitting,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers
  const handleIsOngoingChange = useCallback(
    (e) => {
      onChange("isOngoing", parseInt(e.target.value));
    },
    [onChange],
  );

  const handleIsHomeSupportServiceChange = useCallback(
    (e) => {
      onChange("isHomeSupportService", parseInt(e.target.value));
    },
    [onChange],
  );

  const handleStartDateChange = useCallback(
    (value) => {
      onChange("startDate", value);
    },
    [onChange],
  );

  const isDisabled = isArchived || isSubmitting;

  return (
    <FormSection title="General Information" icon={BriefcaseIcon}>
      <div className="space-y-6">
        {/* Is Ongoing */}
        <div>
          <label className={`block text-sm font-medium ${getThemeClasses("text-primary")} mb-2`}>
            Is this job one time or ongoing?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="isOngoing"
                value="2"
                checked={formData.isOngoing === 2}
                onChange={handleIsOngoingChange}
                disabled={isDisabled}
                className={`mr-2 ${getThemeClasses("accent-primary")} ${getThemeClasses("focus-ring")}`}
              />
              <span className={`text-sm ${getThemeClasses("text-secondary")}`}>One-Time</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isOngoing"
                value="1"
                checked={formData.isOngoing === 1}
                onChange={handleIsOngoingChange}
                disabled={isDisabled}
                className={`mr-2 ${getThemeClasses("accent-primary")} ${getThemeClasses("focus-ring")}`}
              />
              <span className={`text-sm ${getThemeClasses("text-secondary")}`}>Ongoing</span>
            </label>
          </div>
          {errors.isOngoing && (
            <p className="mt-1 text-sm text-red-600">{errors.isOngoing}</p>
          )}
        </div>

        {/* Is Home Support Service */}
        <div>
          <label className={`block text-sm font-medium ${getThemeClasses("text-primary")} mb-2`}>
            Is this job a home support service?{" "}
            <span className="text-red-500">*</span>
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="isHomeSupportService"
                value="2"
                checked={formData.isHomeSupportService === 2}
                onChange={handleIsHomeSupportServiceChange}
                disabled={isDisabled}
                className={`mr-2 ${getThemeClasses("accent-primary")} ${getThemeClasses("focus-ring")}`}
              />
              <span className={`text-sm ${getThemeClasses("text-secondary")}`}>No</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="isHomeSupportService"
                value="1"
                checked={formData.isHomeSupportService === 1}
                onChange={handleIsHomeSupportServiceChange}
                disabled={isDisabled}
                className={`mr-2 ${getThemeClasses("accent-primary")} ${getThemeClasses("focus-ring")}`}
              />
              <span className={`text-sm ${getThemeClasses("text-secondary")}`}>Yes</span>
            </label>
          </div>
          {errors.isHomeSupportService && (
            <p className="mt-1 text-sm text-red-600">{errors.isHomeSupportService}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="max-w-md">
          <DateInput
            label="When should this job start? (Optional)"
            value={formData.startDate}
            onChange={handleStartDateChange}
            error={errors.startDate}
            disabled={isDisabled}
            helperText="Leave blank if nothing was specified by client."
          />
        </div>
      </div>
    </FormSection>
  );
});

// Skill Sets & Description Section
export const OrderSkillSetsSection = React.memo(function OrderSkillSetsSection({
  formData,
  errors,
  onChange,
  onUnauthorized,
  isArchived,
  isSubmitting,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Memoized handlers
  const handleDescriptionChange = useCallback(
    (e) => {
      onChange("description", e.target.value);
    },
    [onChange],
  );

  const handleSkillSetsChange = useCallback(
    (value) => {
      onChange("skillSets", value);
    },
    [onChange],
  );

  const isDisabled = isArchived || isSubmitting;

  return (
    <FormSection title="Skill Sets & Description" icon={AcademicCapIcon}>
      <div className="space-y-6">
        {/* Job Description */}
        <div>
          <label className={`block text-sm font-medium ${getThemeClasses("text-primary")} mb-2`}>
            Describe the Job <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Describe the work that needs to be done..."
            value={formData.description}
            onChange={handleDescriptionChange}
            rows={4}
            maxLength={1000}
            disabled={isDisabled}
            className={`block w-full px-3 py-2 border rounded-lg text-sm sm:text-base ${
              errors.description
                ? "border-red-300"
                : getThemeClasses("input-border")
            } ${getThemeClasses("focus-ring")} ${getThemeClasses("focus-border")}`}
            required
          />
          <p className={`mt-1 text-xs sm:text-sm ${getThemeClasses("text-muted")}`}>
            {formData.description?.length || 0}/1000 characters
          </p>
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        {/* Skill Sets */}
        <SkillSetsMultiSelect
          value={formData.skillSets}
          onChange={handleSkillSetsChange}
          error={errors.skillSets}
          required={true}
          label="Please select required job skill(s)"
          helperText="Pick at least a single skill set at minimum."
          disabled={isDisabled}
          onUnauthorized={onUnauthorized}
        />
      </div>
    </FormSection>
  );
});

// Metrics Section
export const OrderMetricsSection = React.memo(function OrderMetricsSection({
  formData,
  errors,
  onChange,
  onUnauthorized,
  isArchived,
  isSubmitting,
}) {
  // Memoized handlers
  const handleTagsChange = useCallback(
    (value) => {
      onChange("tags", value);
    },
    [onChange],
  );

  const isDisabled = isArchived || isSubmitting;

  return (
    <FormSection title="Metrics" icon={ChartPieIcon}>
      <TagsMultiSelect
        value={formData.tags}
        onChange={handleTagsChange}
        error={errors.tags}
        required={false}
        label="Tags (Optional)"
        helperText="Pick the tags you would like to associate with this order."
        disabled={isDisabled}
        onUnauthorized={onUnauthorized}
      />
    </FormSection>
  );
});
