// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step5Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminCustomerAddStep5Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  UserIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  QuestionMarkCircleIcon,
  LanguageIcon,
  LockClosedIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  RadioGroup,
  Textarea,
  Divider,
  UIXThemeProvider,
  useUIXTheme,
  DatePicker,
} from "../../../../components/UIX";
import HowHearAboutUsSelect from "../../../../components/business/selects/HowHearAboutUsSelect";
import TagsMultiSelect from "../../../../components/business/selects/TagsMultiSelect";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Metrics" },
  { title: "Review" },
];

// Gender options
const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 1, label: "Other" },
];

// Language options for RadioGroup
const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

// Memoized content component
const Step5Content = memo(function Step5Content() {
  const authManager = useAuthManager();
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
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form data
  const [tags, setTags] = useState(customerData.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(customerData.howDidYouHearAboutUsID || "");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] = useState(customerData.isHowDidYouHearAboutUsOther || false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(customerData.howDidYouHearAboutUsOther || "");
  const [birthDate, setBirthDate] = useState(customerData.birthDate || "");
  const [joinDate, setJoinDate] = useState(customerData.joinDate || new Date().toISOString().split("T")[0]);
  const [gender, setGender] = useState(customerData.gender || 0);
  const [genderOther, setGenderOther] = useState(customerData.genderOther || "");
  const [additionalComment, setAdditionalComment] = useState(customerData.additionalComment || "");
  const [preferredLanguage, setPreferredLanguage] = useState(customerData.preferredLanguage || "English");
  const [password, setPassword] = useState(customerData.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(customerData.passwordRepeated || "");

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    if (!saved) {
      navigate("/admin/customers/add/step-1");
    }
  }, [authManager, navigate]);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID = "Please specify how you heard about us";
    } else if (isHowDidYouHearAboutUsOther && !howDidYouHearAboutUsOther.trim()) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
    }

    if (gender === 0) {
      newErrors.gender = "Gender is required";
    } else if (gender === 1 && !genderOther.trim()) {
      newErrors.genderOther = "Please specify the gender";
    }

    if (!joinDate) {
      newErrors.joinDate = "Join date is required";
    }

    if (!preferredLanguage) {
      newErrors.preferredLanguage = "Preferred language is required";
    }

    if (password || passwordRepeated) {
      if (password !== passwordRepeated) {
        newErrors.password = "Passwords do not match";
        newErrors.passwordRepeated = "Passwords do not match";
      }
    }

    return newErrors;
  }, [howDidYouHearAboutUsID, isHowDidYouHearAboutUsOther, howDidYouHearAboutUsOther, gender, genderOther, joinDate, preferredLanguage, password, passwordRepeated]);

  // Handle form submission
  const handleNext = useCallback(() => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      return;
    }

    setErrors({});

    // Save data to sessionStorage
    const updatedCustomerData = {
      ...customerData,
      tags,
      howDidYouHearAboutUsID,
      howDidYouHearAboutUsOther,
      isHowDidYouHearAboutUsOther,
      gender,
      genderOther,
      birthDate,
      joinDate,
      additionalComment,
      preferredLanguage,
      password,
      passwordRepeated,
    };

    sessionStorage.setItem("WORKERY_CUSTOMER_CREATION_STATE", JSON.stringify(updatedCustomerData));
    setCustomerData(updatedCustomerData);
    navigate("/admin/customers/add/step-6");
  }, [validateForm, customerData, tags, howDidYouHearAboutUsID, howDidYouHearAboutUsOther, isHowDidYouHearAboutUsOther, gender, genderOther, birthDate, joinDate, additionalComment, preferredLanguage, password, passwordRepeated, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");
    navigate("/admin/customers");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/customers/add/step-4");
  }, [navigate]);

  // Stable onChange handlers
  const handleHowHearChange = useCallback((value) => {
    setHowDidYouHearAboutUsID(value);
    if (errors.howDidYouHearAboutUsID) {
      setErrors((prev) => ({ ...prev, howDidYouHearAboutUsID: null }));
    }
  }, [errors.howDidYouHearAboutUsID]);

  const handleHowHearOtherDetected = useCallback((isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther("");
    }
  }, []);

  const handleGenderChange = useCallback((value) => setGender(parseInt(value)), []);
  const handleGenderOtherChange = useCallback((value) => setGenderOther(value), []);
  const handleBirthDateChange = useCallback((value) => setBirthDate(value), []);
  const handleJoinDateChange = useCallback((value) => setJoinDate(value), []);
  const handleAdditionalCommentChange = useCallback((value) => setAdditionalComment(value), []);
  const handlePreferredLanguageChange = useCallback((value) => setPreferredLanguage(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);
  const handlePasswordRepeatedChange = useCallback((value) => setPasswordRepeated(value), []);
  const handleHowHearOtherChange = useCallback((value) => setHowDidYouHearAboutUsOther(value), []);

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
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={5}
        wizardTitle="Add New Customer"
        wizardIcon={UserPlusIcon}
        stepTitle="Metrics & Preferences"
        stepSubtitle="Internal metrics and preferences for the customer"
        stepIcon={ChartPieIcon}
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
          {/* Discovery & Tags Section */}
          <FormCard
            title="Discovery & Classification"
            subtitle="How did they find us and how we categorize them"
            icon={QuestionMarkCircleIcon}
            maxWidth="7xl"
          >
            <div className="space-y-6">
              {/* Tags */}
              <TagsMultiSelect
                value={tags}
                onChange={setTags}
                error={errors.tags}
                required={false}
                label="Tags (Optional)"
                onUnauthorized={() => navigate("/login?unauthorized=true")}
              />

              {/* How did you hear about us */}
              <HowHearAboutUsSelect
                value={howDidYouHearAboutUsID}
                onChange={handleHowHearChange}
                onOtherDetected={handleHowHearOtherDetected}
                error={errors.howDidYouHearAboutUsID}
                required={true}
                label="How did you hear about us?"
                onUnauthorized={() => navigate("/login?unauthorized=true")}
              />

              {/* Show additional input field if "Other" is selected */}
              {isHowDidYouHearAboutUsOther && (
                <Input
                  label="How did you hear about us? (Other)"
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
          <FormCard
            title="Personal Information"
            subtitle="Demographic and preference details"
            icon={UserIcon}
            maxWidth="7xl"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <Select
                  label="Gender"
                  value={gender}
                  onChange={handleGenderChange}
                  options={GENDER_OPTIONS}
                  icon={UserIcon}
                  required
                  error={errors.gender}
                />

                {/* Gender Other field */}
                {gender === 1 && (
                  <Input
                    label="Gender (Other)"
                    value={genderOther}
                    onChange={handleGenderOtherChange}
                    placeholder="Please specify"
                    icon={UserIcon}
                    required
                    error={errors.genderOther}
                  />
                )}

                {/* Birth Date */}
                <DatePicker
                  label="Birth Date (Optional)"
                  value={birthDate}
                  onChange={handleBirthDateChange}
                  placeholder="Select date"
                />

                {/* Join Date */}
                <DatePicker
                  label="Join Date"
                  value={joinDate}
                  onChange={handleJoinDateChange}
                  placeholder="Select date"
                  required
                  error={errors.joinDate}
                  helperText="This indicates when the user joined the workery."
                />
              </div>

              {/* Preferred Language */}
              <RadioGroup
                id="preferredLanguage"
                label="Preferred Language"
                name="preferredLanguage"
                value={preferredLanguage}
                onChange={handlePreferredLanguageChange}
                options={LANGUAGE_OPTIONS}
                icon={LanguageIcon}
                required
                error={errors.preferredLanguage}
              />

              {/* Additional Comments */}
              <Divider className="my-6" />
              <Textarea
                label="Additional Comment (Optional)"
                value={additionalComment}
                onChange={handleAdditionalCommentChange}
                placeholder="Max 638 characters"
                maxLength={638}
                rows={4}
                showCharacterCount
                icon={ChatBubbleBottomCenterTextIcon}
              />
            </div>
          </FormCard>

          {/* Login Credentials Section */}
          <FormCard
            title="Login Credentials"
            subtitle="Set up account access (optional)"
            icon={LockClosedIcon}
            maxWidth="7xl"
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Password (Optional)"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Leave blank if not setting a password"
                  icon={LockClosedIcon}
                  error={errors.password}
                />
                <Input
                  label="Password Repeated (Optional)"
                  type="password"
                  value={passwordRepeated}
                  onChange={handlePasswordRepeatedChange}
                  placeholder="Repeat password here"
                  icon={LockClosedIcon}
                  error={errors.passwordRepeated}
                />
              </div>
              <p className="text-xs text-gray-500">
                Leave password fields empty if you don't want to set up login credentials at this time.
              </p>
            </div>
          </FormCard>
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Your Customer record will be cancelled and your work will be lost. This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Step5Content.displayName = 'Step5Content';

function AdminCustomerAddStep5Page() {
  return (
    <UIXThemeProvider>
      <Step5Content />
    </UIXThemeProvider>
  );
}

export default AdminCustomerAddStep5Page;
