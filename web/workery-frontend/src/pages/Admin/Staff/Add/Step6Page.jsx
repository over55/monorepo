// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step6Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep6Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  UserPlusIcon,
  TagIcon,
  QuestionMarkCircleIcon,
  UserIcon,
  ChatBubbleBottomCenterTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  Textarea,
  CheckboxGroup,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/business/selects";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import { STAFF_GENDER_OTHER } from "../../../../constants/Staff";

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

// Memoized content component
const Step6Content = memo(function Step6Content() {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();
  const wizardStorage = useStaffAddWizardStorage();
  const wizardState = useMemo(() => {
    const state = wizardStorage.getWizardState();
    return state;
  }, [wizardStorage]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [tags, setTags] = useState(wizardState.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(
    wizardState.howDidYouHearAboutUsID || ""
  );
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] = useState(
    wizardState.isHowDidYouHearAboutUsOther || false
  );
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(
    wizardState.howDidYouHearAboutUsOther || ""
  );
  const [birthDate, setBirthDate] = useState(wizardState.birthDate || "");
  const [joinDate, setJoinDate] = useState(
    wizardState.joinDate || new Date().toISOString().split("T")[0]
  );
  const [gender, setGender] = useState(wizardState.gender || 0);
  const [genderOther, setGenderOther] = useState(wizardState.genderOther || "");
  const [additionalComment, setAdditionalComment] = useState(
    wizardState.additionalComment || ""
  );
  const [identifyAs, setIdentifyAs] = useState(wizardState.identifyAs || []);

  // Memoized theme classes
  const themeClasses = useMemo(() => ({
    textSecondary: getThemeClasses('text-secondary') || 'text-gray-600 dark:text-gray-400',
  }), [getThemeClasses]);

  useEffect(() => {
    window.scrollTo(0, 0);
    // If no wizard state exists, redirect back to step 1
    if (!wizardState || Object.keys(wizardState).length === 0) {
      navigate("/admin/staff/add/step-1-search");
    }
  }, [wizardState, navigate]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle form submission
  const handleNext = useCallback(() => {
    setErrors({});
    let newErrors = {};
    let hasErrors = false;

    // Basic validation
    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID = "Please specify how you heard about us";
      hasErrors = true;
    } else if (isHowDidYouHearAboutUsOther && !howDidYouHearAboutUsOther.trim()) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
      hasErrors = true;
    }

    if (gender === 0) {
      newErrors.gender = "Gender is required";
      hasErrors = true;
    } else if (gender === STAFF_GENDER_OTHER && !genderOther.trim()) {
      newErrors.genderOther = "Please specify other gender";
      hasErrors = true;
    }

    if (!birthDate) {
      newErrors.birthDate = "Birth date is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    // Save to wizard storage
    wizardStorage.updateWizardState({
      tags,
      howDidYouHearAboutUsID,
      isHowDidYouHearAboutUsOther,
      howDidYouHearAboutUsOther,
      birthDate,
      joinDate,
      gender,
      genderOther,
      additionalComment,
      identifyAs,
    });

    setIsLoading(false);
    navigate("/admin/staff/add/step-7");
  }, [
    tags,
    howDidYouHearAboutUsID,
    isHowDidYouHearAboutUsOther,
    howDidYouHearAboutUsOther,
    birthDate,
    joinDate,
    gender,
    genderOther,
    additionalComment,
    identifyAs,
    navigate,
    wizardStorage,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-5");
  }, [navigate]);

  // Stable onChange handlers
  const handleTagsChange = useCallback((value) => {
    setTags(value);
  }, []);

  const handleHowHearChange = useCallback((value) => {
    setHowDidYouHearAboutUsID(value);
    // Clear error when user selects a value
    setErrors((prev) => {
      if (prev.howDidYouHearAboutUsID) {
        const newErrors = { ...prev };
        delete newErrors.howDidYouHearAboutUsID;
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handleHowHearOtherDetected = useCallback((isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther("");
    }
  }, []);

  const handleHowHearOtherChange = useCallback((value) => {
    setHowDidYouHearAboutUsOther(value);
  }, []);

  const handleBirthDateChange = useCallback((value) => {
    setBirthDate(value);
  }, []);

  const handleJoinDateChange = useCallback((value) => {
    setJoinDate(value);
  }, []);

  const handleGenderChange = useCallback((value) => {
    setGender(parseInt(value));
  }, []);

  const handleGenderOtherChange = useCallback((value) => {
    setGenderOther(value);
  }, []);

  const handleAdditionalCommentChange = useCallback((value) => {
    setAdditionalComment(value);
  }, []);

  const handleIdentifyAsChange = useCallback((selectedValues) => {
    setIdentifyAs(selectedValues.map((v) => parseInt(v)));
  }, []);

  // Memoized gender options for Select component
  const genderOptions = useMemo(
    () =>
      GENDER_OPTIONS_WITH_EMPTY_OPTION.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    []
  );

  // Memoized identity options for CheckboxGroup
  const identityOptions = useMemo(
    () =>
      IDENTIFY_AS_OPTIONS.map((opt) => ({
        value: opt.value,
        label: opt.label,
      })),
    []
  );

  // Action buttons
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
      currentStep={6}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Metrics & Demographics"
      stepSubtitle="Add metrics and demographic information"
      stepIcon={TagIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isLoading}
      actions={actions}
      onCancel={handleCancel}
      onBack={handleBack}
      actionLayout="end"
    >
      <div className="space-y-8">
        {/* Tags & Identification Section */}
        <FormCard title="Tags & Identification" icon={TagIcon} maxWidth="7xl">
          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold ${themeClasses.textSecondary} mb-2`}>
                Tags (Optional)
              </label>
              <TagsMultiSelect
                value={tags}
                onChange={handleTagsChange}
                error={errors.tags}
                required={false}
                onUnauthorized={onUnauthorized}
              />
            </div>

            <CheckboxGroup
              label="Do you identify as belonging to any of the following groups? (Optional)"
              options={identityOptions}
              value={identifyAs}
              onChange={handleIdentifyAsChange}
            />
          </div>
        </FormCard>

        {/* Discovery & Marketing Section */}
        <FormCard title="Discovery & Marketing" icon={QuestionMarkCircleIcon} maxWidth="7xl">
          <div className="space-y-6">
            <HowHearAboutUsSelect
              value={howDidYouHearAboutUsID}
              onChange={handleHowHearChange}
              onOtherDetected={handleHowHearOtherDetected}
              error={errors.howDidYouHearAboutUsID}
              required={true}
              onUnauthorized={onUnauthorized}
            />

            {isHowDidYouHearAboutUsOther && (
              <Input
                label="How did you hear about us? (Other)"
                type="text"
                value={howDidYouHearAboutUsOther}
                onChange={handleHowHearOtherChange}
                placeholder="Please specify"
                required
                error={errors.howDidYouHearAboutUsOther}
              />
            )}
          </div>
        </FormCard>

        {/* Personal Information Section */}
        <FormCard title="Personal Information" icon={UserIcon} maxWidth="7xl">
          <div className="space-y-6">
            <Select
              label="Gender"
              value={gender}
              onChange={handleGenderChange}
              options={genderOptions}
              required
              error={errors.gender}
            />

            {gender === STAFF_GENDER_OTHER && (
              <Input
                label="Gender (Other)"
                type="text"
                value={genderOther}
                onChange={handleGenderOtherChange}
                placeholder="Please specify"
                required
                error={errors.genderOther}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Birth Date"
                type="date"
                value={birthDate}
                onChange={handleBirthDateChange}
                icon={CalendarIcon}
                required
                error={errors.birthDate}
              />
              <Input
                label="Join Date"
                type="date"
                value={joinDate}
                onChange={handleJoinDateChange}
                icon={CalendarIcon}
                helperText="The date this staff member joined the organization"
              />
            </div>
          </div>
        </FormCard>

        {/* Additional Information Section */}
        <FormCard title="Additional Information" icon={ChatBubbleBottomCenterTextIcon} maxWidth="7xl">
          <Textarea
            label="Additional Comment (Optional)"
            value={additionalComment}
            onChange={handleAdditionalCommentChange}
            placeholder="Enter any additional comments or notes about this staff member"
            rows={4}
            maxLength={638}
            helperText={`${additionalComment.length}/638 characters`}
          />
        </FormCard>
      </div>
    </WizardFormStep>
  );
});

Step6Content.displayName = "Step6Content";

function AdminStaffAddStep6Page() {
  return (
    <UIXThemeProvider>
      <Step6Content />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep6Page;
