// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step3Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminAssociateAddStep3Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  Checkbox,
  Divider,
  SectionHeader,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const ASSOCIATE_PHONE_TYPE_WORK = 2;

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
];

// Phone type options
const PHONE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Mobile" },
  { value: 2, label: "Work" },
  { value: 3, label: "Home" },
];

// Organization type options
const ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

// Memoized content component
const Step3Content = memo(function Step3Content() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form data
  const [associateType, setAssociateType] = useState(null);
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(1);
  const [phoneExtension, setPhoneExtension] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToText, setIsOkToText] = useState(true);
  const [isOkToEmail, setIsOkToEmail] = useState(true);

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
    loadAssociateState();
  }, [authManager, navigate]);

  const loadAssociateState = () => {
    try {
      const existing = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
      if (existing) {
        const associateState = JSON.parse(existing);
        setAssociateType(associateState.type || null);
        setOrganizationName(associateState.organizationName || "");
        setOrganizationType(associateState.organizationType || 0);
        setEmail(associateState.email || "");
        setPhone(associateState.phone || "");
        setPhoneType(associateState.phoneType || 1);
        setPhoneExtension(associateState.phoneExtension || "");
        setFirstName(associateState.firstName || "");
        setLastName(associateState.lastName || "");
        setOtherPhone(associateState.otherPhone || "");
        setOtherPhoneType(associateState.otherPhoneType || 0);
        setOtherPhoneExtension(associateState.otherPhoneExtension || "");
        setIsOkToText(associateState.isOkToText !== undefined ? associateState.isOkToText : true);
        setIsOkToEmail(associateState.isOkToEmail !== undefined ? associateState.isOkToEmail : true);
      } else {
        navigate("/admin/associates/add/step-2");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-2");
    }
  };

  const getExistingState = () => {
    try {
      const existing = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
      return existing ? JSON.parse(existing) : {};
    } catch (error) {
      return {};
    }
  };

  // Handle form submission
  const handleNext = useCallback(() => {
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Validation for commercial associates
    if (associateType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      if (!organizationName.trim()) {
        newErrors.organizationName = "Organization name is required";
        hasErrors = true;
      }
      if (organizationType === 0) {
        newErrors.organizationType = "Organization type is required";
        hasErrors = true;
      }
    }

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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
      hasErrors = true;
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
      window.scrollTo(0, 0);
      return;
    }

    // Save to session storage
    const associateState = {
      ...getExistingState(),
      type: associateType,
      organizationName,
      organizationType,
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
    };

    try {
      sessionStorage.setItem("WORKERY_ASSOCIATE_CREATION_STATE", JSON.stringify(associateState));
      navigate("/admin/associates/add/step-4");
    } catch (error) {
      console.error("Error saving associate state:", error);
      setErrors({ message: "Failed to save data. Please try again." });
    }
  }, [associateType, organizationName, organizationType, firstName, lastName, email, phone, phoneType, phoneExtension, otherPhone, otherPhoneType, otherPhoneExtension, isOkToText, isOkToEmail, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/associates");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/associates/add/step-2");
  }, [navigate]);

  // Stable onChange handlers
  const handleOrganizationNameChange = useCallback((value) => setOrganizationName(value), []);
  const handleOrganizationTypeChange = useCallback((value) => setOrganizationType(parseInt(value)), []);
  const handleFirstNameChange = useCallback((value) => setFirstName(value), []);
  const handleLastNameChange = useCallback((value) => setLastName(value), []);
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePhoneChange = useCallback((value) => setPhone(value), []);
  const handlePhoneTypeChange = useCallback((value) => setPhoneType(parseInt(value)), []);
  const handlePhoneExtensionChange = useCallback((value) => setPhoneExtension(value), []);
  const handleOtherPhoneChange = useCallback((value) => setOtherPhone(value), []);
  const handleOtherPhoneTypeChange = useCallback((value) => setOtherPhoneType(parseInt(value)), []);
  const handleOtherPhoneExtensionChange = useCallback((value) => setOtherPhoneExtension(value), []);
  const handleIsOkToEmailChange = useCallback((checked) => setIsOkToEmail(checked), []);
  const handleIsOkToTextChange = useCallback((checked) => setIsOkToText(checked), []);

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

  // Loading state while associate type is being loaded
  if (associateType === null) {
    return (
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={3}
        wizardTitle="Add New Associate"
        wizardIcon={UserPlusIcon}
        stepTitle="Contact Information"
        stepSubtitle="Loading..."
        stepIcon={UserIcon}
        isLoading={true}
      />
    );
  }

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={3}
      wizardTitle="Add New Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Contact Information"
      stepSubtitle="Enter basic contact information for the new associate"
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
        {/* Commercial Associate Section */}
        {associateType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
          <FormCard
            title="Organization Information"
            subtitle="Commercial associate details"
            icon={BuildingOfficeIcon}
            maxWidth="7xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Organization Name"
                type="text"
                value={organizationName}
                onChange={handleOrganizationNameChange}
                placeholder="Enter organization name"
                icon={BuildingOfficeIcon}
                required
                error={errors.organizationName}
              />
              <Select
                label="Organization Type"
                value={organizationType}
                onChange={handleOrganizationTypeChange}
                options={ORGANIZATION_TYPE_OPTIONS}
                icon={BuildingOfficeIcon}
                required
                error={errors.organizationType}
              />
            </div>
          </FormCard>
        )}

        {/* Personal Information Section */}
        <FormCard
          title="Personal Information"
          subtitle="Associate contact details"
          icon={UserIcon}
          maxWidth="7xl"
        >
          <div className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
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

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter email address"
              icon={EnvelopeIcon}
              required
              error={errors.email}
            />

            {/* Email Consent */}
            <Checkbox
              id="isOkToEmail"
              label="I agree to receive electronic email"
              checked={isOkToEmail}
              onChange={handleIsOkToEmailChange}
            />
          </div>
        </FormCard>

        {/* Phone Information Section */}
        <FormCard
          title="Phone Information"
          subtitle="Primary and alternative contact numbers"
          icon={PhoneIcon}
          maxWidth="7xl"
        >
          <div className="space-y-6">
            {/* Primary Phone */}
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
                options={PHONE_TYPE_OPTIONS}
                icon={PhoneIcon}
                required
                error={errors.phoneType}
              />
            </div>

            {/* Phone Extension - Only show for Work phone */}
            {phoneType === ASSOCIATE_PHONE_TYPE_WORK && (
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
            <SectionHeader title="Alternative Phone (Optional)" />
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
                  options={PHONE_TYPE_OPTIONS}
                  icon={PhoneIcon}
                />
              )}
            </div>

            {/* Other Phone Extension */}
            {otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK && otherPhone && (
              <Input
                label="Other Phone Extension (Optional)"
                type="text"
                value={otherPhoneExtension}
                onChange={handleOtherPhoneExtensionChange}
                placeholder="Enter extension"
              />
            )}
          </div>
        </FormCard>
      </div>
    </WizardFormStep>
  );
});

Step3Content.displayName = 'Step3Content';

function AdminAssociateAddStep3Page() {
  return (
    <UIXThemeProvider>
      <Step3Content />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep3Page;
