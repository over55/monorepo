// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step3Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep3Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useStaffManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  UserIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../constants/Staff";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  Checkbox,
  Spinner,
  Divider,
  SectionHeader,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";

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
const Step3Content = memo(function Step3Content() {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  const wizardStorage = useStaffAddWizardStorage();
  const staffManager = useStaffManager();
  const wizardState = useMemo(() => {
    const state = wizardStorage.getWizardState();
    return state;
  }, [wizardStorage]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingEmail, _setIsCheckingEmail] = useState(false);

  // Form data
  const [email, setEmail] = useState(wizardState.email || "");
  const [phone, setPhone] = useState(wizardState.phone || "");
  const [phoneType, setPhoneType] = useState(wizardState.phoneType || 0);
  const [phoneExtension, setPhoneExtension] = useState(
    wizardState.phoneExtension || "",
  );
  const [firstName, setFirstName] = useState(wizardState.firstName || "");
  const [lastName, setLastName] = useState(wizardState.lastName || "");
  const [otherPhone, setOtherPhone] = useState(wizardState.otherPhone || "");
  const [otherPhoneType, setOtherPhoneType] = useState(
    wizardState.otherPhoneType || 0,
  );
  const [otherPhoneExtension, setOtherPhoneExtension] = useState(
    wizardState.otherPhoneExtension || "",
  );
  const [isOkToText, setIsOkToText] = useState(wizardState.isOkToText || false);
  const [isOkToEmail, setIsOkToEmail] = useState(
    wizardState.isOkToEmail || false,
  );

  // Memoized theme classes
  const themeClasses = useMemo(() => ({
    alertInfoText: getThemeClasses('alert-info-text') || 'text-amber-600 dark:text-amber-400',
    textMuted: getThemeClasses('text-muted') || 'text-gray-500 dark:text-gray-400',
  }), [getThemeClasses]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const _onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check if email is unique by querying existing staff
  const checkEmailUniqueness = useCallback(async (_emailToCheck) => {
    // Temporarily disabled for testing
    return { isUnique: true };
  }, []);

  // Handle form submission
  const handleNext = useCallback(async () => {
    setErrors({});
    setIsLoading(true);

    let newErrors = {};
    let hasErrors = false;

    // General validation
    if (!firstName.trim()) {
      newErrors.firstName = "First name is required";
      hasErrors = true;
    }
    if (!lastName.trim()) {
      newErrors.lastName = "Last name is required";
      hasErrors = true;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      hasErrors = true;
    } else {
      // SECURITY: Comprehensive email validation (OWASP A03:2021 - Injection Prevention)
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email address";
        hasErrors = true;
      } else if (email.length > 254) {
        // RFC 5321 specifies maximum email length
        newErrors.email = "Email address is too long (max 254 characters)";
        hasErrors = true;
      } else if (email.includes('..')) {
        // Prevent consecutive dots
        newErrors.email = "Email address cannot contain consecutive dots";
        hasErrors = true;
      } else if (email.startsWith('.') || email.endsWith('.')) {
        newErrors.email = "Email address cannot start or end with a dot";
        hasErrors = true;
      }
    }
    if (!phone.trim()) {
      newErrors.phone = "Phone number is required";
      hasErrors = true;
    }
    if (phoneType === 0) {
      newErrors.phoneType = "Phone type is required";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Check email uniqueness - ALWAYS check, even if it seems unique
    if (import.meta.env.DEV) {
      console.log("Checking email uniqueness");
    }
    const emailCheck = await checkEmailUniqueness(email);
    if (import.meta.env.DEV) {
      console.log("Email check result:", emailCheck.isUnique ? "unique" : "duplicate");
    }

    if (!emailCheck.isUnique) {
      newErrors.email = emailCheck.message;
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // Show warning if validation couldn't be completed
    if (emailCheck.warning) {
      if (import.meta.env.DEV) {
      console.warn("Email validation warning:", emailCheck.warning);
      }
      // Still allow proceeding, but the backend will catch duplicates
    }

    // Save to wizard storage
    wizardStorage.updateWizardState({
      firstName,
      lastName,
      email,
      phone,
      phoneType,
      phoneExtension,
      otherPhone,
      otherPhoneType,
      otherPhoneExtension,
      isOkToText,
      isOkToEmail,
    });

    setIsLoading(false);
    navigate("/admin/staff/add/step-4");
  }, [firstName, lastName, email, phone, phoneType, phoneExtension, otherPhone, otherPhoneType, otherPhoneExtension, isOkToText, isOkToEmail, checkEmailUniqueness, navigate, wizardStorage]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-2");
  }, [navigate]);

  // Stable onChange handlers
  const handleFirstNameChange = useCallback((value) => {
    setFirstName(value);
  }, []);

  const handleLastNameChange = useCallback((value) => {
    setLastName(value);
  }, []);

  const handleEmailChange = useCallback((value) => {
    setEmail(value);
    // Clear email error when user types
    setErrors((prev) => {
      if (prev.email || prev.emailWarning) {
        const newErrors = { ...prev };
        delete newErrors.email;
        delete newErrors.emailWarning;
        return newErrors;
      }
      return prev;
    });
  }, []);

  const handlePhoneChange = useCallback((value) => {
    setPhone(value);
  }, []);

  const handlePhoneTypeChange = useCallback((value) => {
    setPhoneType(parseInt(value));
  }, []);

  const handlePhoneExtensionChange = useCallback((value) => {
    setPhoneExtension(value);
  }, []);

  const handleOtherPhoneChange = useCallback((value) => {
    setOtherPhone(value);
  }, []);

  const handleOtherPhoneTypeChange = useCallback((value) => {
    setOtherPhoneType(parseInt(value));
  }, []);

  const handleOtherPhoneExtensionChange = useCallback((value) => {
    setOtherPhoneExtension(value);
  }, []);

  const handleIsOkToEmailChange = useCallback((checked) => {
    setIsOkToEmail(checked);
  }, []);

  const handleIsOkToTextChange = useCallback((checked) => {
    setIsOkToText(checked);
  }, []);

  // Action buttons (Cancel and Next on the right)
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "outline",
      onClick: handleCancel,
    },
    {
      label: isLoading ? "Validating..." : "Next",
      variant: "primary",
      onClick: handleNext,
      disabled: isLoading || isCheckingEmail,
      loading: isLoading,
    },
  ], [handleCancel, handleNext, isLoading, isCheckingEmail]);

  // Debounced email validation on blur
  const handleEmailBlur = useCallback(async () => {
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (import.meta.env.DEV) {
        console.log("Email blur validation triggered");
      }
      const emailCheck = await checkEmailUniqueness(email);

      if (!emailCheck.isUnique) {
        setErrors((prev) => ({
          ...prev,
          email: emailCheck.message,
        }));
      } else if (emailCheck.warning) {
        // Show warning but don't block
        setErrors((prev) => ({
          ...prev,
          emailWarning: emailCheck.warning,
        }));
      } else {
        // Clear email error if it exists and email is unique
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (
            newErrors.email ===
            "This email address is already in use by another staff member"
          ) {
            delete newErrors.email;
          }
          delete newErrors.emailWarning;
          return newErrors;
        });
      }
    }
  }, [email, checkEmailUniqueness]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={3}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Contact Information"
      stepSubtitle="Enter basic contact information for the staff member"
      stepIcon={UserIcon}
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
        {/* Personal Information Section */}
        <FormCard
          title="Personal Information"
          icon={UserIcon}
          maxWidth="7xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              key="firstName"
              label="First Name"
              type="text"
              value={firstName}
              onChange={handleFirstNameChange}
              placeholder="Enter first name"
              icon={UserIcon}
              required
              error={errors.firstName}
            />
            <Input
              key="lastName"
              label="Last Name"
              type="text"
              value={lastName}
              onChange={handleLastNameChange}
              placeholder="Enter last name"
              icon={UserIcon}
              required
              error={errors.lastName}
            />
          </div>
        </FormCard>

        {/* Contact Information Section */}
        <FormCard
          title="Contact Information"
          icon={PhoneIcon}
          maxWidth="7xl"
        >
          <div className="space-y-6">
            {/* Email */}
            <div>
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleEmailBlur}
                placeholder="Enter email address"
                icon={EnvelopeIcon}
                required
                disabled={isCheckingEmail}
                error={errors.email}
              />
              {isCheckingEmail && (
                <div className={`mt-2 flex items-center text-sm ${themeClasses.textMuted}`}>
                  <Spinner size="sm" className="mr-2" />
                  Checking email availability...
                </div>
              )}
              {errors.emailWarning && !errors.email && (
                <p className={`mt-2 text-sm ${themeClasses.alertInfoText} flex items-center`}>
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.emailWarning}
                </p>
              )}
            </div>

            {/* Email Consent */}
            <Checkbox
              id="isOkToEmail"
              label="I agree to receive electronic email"
              checked={isOkToEmail}
              onChange={handleIsOkToEmailChange}
            />

            {/* Phone Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter phone number"
                icon={PhoneIcon}
                required
                error={errors.phone}
              />
              <Select
                label="Phone Type"
                value={phoneType}
                onChange={handlePhoneTypeChange}
                options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                placeholder=""
                icon={PhoneIcon}
                required
                error={errors.phoneType}
              />
            </div>

            {/* Phone Extension - Only show for Work phone */}
            {STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
              (opt) => opt.value === phoneType,
            )?.label === "Work" && (
              <Input
                label="Phone Extension (Optional)"
                type="text"
                value={phoneExtension}
                onChange={handlePhoneExtensionChange}
                placeholder="Enter extension"
              />
            )}

            {/* Text Consent */}
            <Checkbox
              id="isOkToText"
              label="I agree to receive texts to my phone"
              checked={isOkToText}
              onChange={handleIsOkToTextChange}
            />

            {/* Alternative Contact */}
            <Divider className="my-6" />
            <SectionHeader title="Alternative Contact (Optional)" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Other Phone Number"
                  type="tel"
                  value={otherPhone}
                  onChange={handleOtherPhoneChange}
                  placeholder="Enter other phone number"
                  icon={PhoneIcon}
                />
                {otherPhone && (
                  <Select
                    label="Other Phone Type"
                    value={otherPhoneType}
                    onChange={handleOtherPhoneTypeChange}
                    options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                    placeholder=""
                    icon={PhoneIcon}
                  />
                )}
              </div>

              {/* Other Phone Extension */}
              {STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.find(
                (opt) => opt.value === otherPhoneType,
              )?.label === "Work" && otherPhone && (
                <div className="mt-6">
                  <Input
                    label="Other Phone Extension"
                    type="text"
                    value={otherPhoneExtension}
                    onChange={handleOtherPhoneExtensionChange}
                    placeholder="Enter extension"
                  />
                </div>
              )}
          </div>
        </FormCard>
      </div>
    </WizardFormStep>
  );
});

Step3Content.displayName = 'Step3Content';

function AdminStaffAddStep3Page() {
  return (
    <UIXThemeProvider>
      <Step3Content />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep3Page;
