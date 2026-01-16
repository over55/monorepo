// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step5Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminAssociateAddStep5Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  Textarea,
  Divider,
  RadioGroup,
  DatePicker,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  IdentificationIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  PhoneIcon,
  LanguageIcon,
} from "@heroicons/react/24/outline";
import {
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
  VehicleTypesMultiSelect,
  ServiceFeeSelect,
} from "../../../../components/business/selects";

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

  // Get existing associate data from sessionStorage
  const [associateData, setAssociateData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Account form data
  const [skillSets, setSkillSets] = useState(associateData.skillSets || []);
  const [insuranceRequirements, setInsuranceRequirements] = useState(associateData.insuranceRequirements || []);
  const [hourlySalaryDesired, setHourlySalaryDesired] = useState(associateData.hourlySalaryDesired || "");
  const [limitSpecial, setLimitSpecial] = useState(associateData.limitSpecial || "");
  const [duesDate, setDuesDate] = useState(associateData.duesDate || "");
  const [commercialInsuranceExpiryDate, setCommercialInsuranceExpiryDate] = useState(associateData.commercialInsuranceExpiryDate || "");
  const [autoInsuranceExpiryDate, setAutoInsuranceExpiryDate] = useState(associateData.autoInsuranceExpiryDate || "");
  const [wsibNumber, setWsibNumber] = useState(associateData.wsibNumber || "");
  const [wsibInsuranceDate, setWsibInsuranceDate] = useState(associateData.wsibInsuranceDate || "");
  const [policeCheck, setPoliceCheck] = useState(associateData.policeCheck || "");
  const [taxId, setTaxId] = useState(associateData.taxId || "");
  const [driversLicenseClass, setDriversLicenseClass] = useState(associateData.driversLicenseClass || "");
  const [vehicleTypes, setVehicleTypes] = useState(associateData.vehicleTypes || []);
  const [serviceFeeId, setServiceFeeId] = useState(associateData.serviceFeeId || "");
  const [isServiceFeeOther, setIsServiceFeeOther] = useState(associateData.isServiceFeeOther || false);
  const [serviceFeeOther, setServiceFeeOther] = useState(associateData.serviceFeeOther || "");
  const [emergencyContactName, setEmergencyContactName] = useState(associateData.emergencyContactName || "");
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(associateData.emergencyContactRelationship || "");
  const [emergencyContactTelephone, setEmergencyContactTelephone] = useState(associateData.emergencyContactTelephone || "");
  const [emergencyContactAlternativeTelephone, setEmergencyContactAlternativeTelephone] = useState(associateData.emergencyContactAlternativeTelephone || "");
  const [description, setDescription] = useState(associateData.description || "");
  const [preferredLanguage, setPreferredLanguage] = useState(associateData.preferredLanguage || "English");
  const [password, setPassword] = useState(associateData.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(associateData.passwordRepeated || "");

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
    const saved = sessionStorage.getItem("WORKERY_ASSOCIATE_CREATION_STATE");
    if (!saved) {
      navigate("/admin/associates/add/step-1-search");
    }
  }, [authManager, navigate]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

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

    // Basic validation
    if (!skillSets || skillSets.length === 0) {
      newErrors.skillSets = "At least one skill set is required";
      hasErrors = true;
    }
    if (!insuranceRequirements || insuranceRequirements.length === 0) {
      newErrors.insuranceRequirements = "At least one insurance requirement is required";
      hasErrors = true;
    }
    if (!duesDate.trim()) {
      newErrors.duesDate = "Member dues date is required";
      hasErrors = true;
    }
    if (!policeCheck.trim()) {
      newErrors.policeCheck = "Police check date is required";
      hasErrors = true;
    }
    if (!commercialInsuranceExpiryDate.trim()) {
      newErrors.commercialInsuranceExpiryDate = "Commercial insurance expiry date is required";
      hasErrors = true;
    }
    if (!serviceFeeId) {
      newErrors.serviceFeeId = "Service fee is required";
      hasErrors = true;
    }
    if (isServiceFeeOther && !serviceFeeOther.trim()) {
      newErrors.serviceFeeOther = "Please specify the custom service fee";
      hasErrors = true;
    }
    if (!emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
      hasErrors = true;
    }
    if (!emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship = "Emergency contact relationship is required";
      hasErrors = true;
    }
    if (!emergencyContactTelephone.trim()) {
      newErrors.emergencyContactTelephone = "Emergency contact telephone is required";
      hasErrors = true;
    }
    if (!preferredLanguage.trim()) {
      newErrors.preferredLanguage = "Preferred language is required";
      hasErrors = true;
    }

    // Password validation
    if (password || passwordRepeated) {
      if (password !== passwordRepeated) {
        newErrors.password = "Passwords do not match";
        newErrors.passwordRepeated = "Passwords do not match";
        hasErrors = true;
      }
      if (password && password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to session storage
    const updatedAssociateData = {
      ...getExistingState(),
      skillSets,
      insuranceRequirements,
      hourlySalaryDesired: hourlySalaryDesired ? parseInt(hourlySalaryDesired) : 0,
      limitSpecial,
      duesDate,
      commercialInsuranceExpiryDate,
      autoInsuranceExpiryDate,
      wsibNumber,
      wsibInsuranceDate,
      policeCheck,
      taxId,
      driversLicenseClass,
      vehicleTypes,
      serviceFeeId,
      isServiceFeeOther,
      serviceFeeOther,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactTelephone,
      emergencyContactAlternativeTelephone,
      description,
      preferredLanguage,
      password,
      passwordRepeated,
    };

    try {
      sessionStorage.setItem("WORKERY_ASSOCIATE_CREATION_STATE", JSON.stringify(updatedAssociateData));
      setAssociateData(updatedAssociateData);
      navigate("/admin/associates/add/step-6");
    } catch (error) {
      console.error("Error saving associate state:", error);
      setErrors({ message: "Failed to save data. Please try again." });
    }
  }, [skillSets, insuranceRequirements, hourlySalaryDesired, limitSpecial, duesDate, commercialInsuranceExpiryDate, autoInsuranceExpiryDate, wsibNumber, wsibInsuranceDate, policeCheck, taxId, driversLicenseClass, vehicleTypes, serviceFeeId, isServiceFeeOther, serviceFeeOther, emergencyContactName, emergencyContactRelationship, emergencyContactTelephone, emergencyContactAlternativeTelephone, description, preferredLanguage, password, passwordRepeated, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/associates");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/associates/add/step-4");
  }, [navigate]);

  // Stable onChange handlers
  const handleHourlySalaryChange = useCallback((value) => setHourlySalaryDesired(value), []);
  const handleLimitSpecialChange = useCallback((value) => setLimitSpecial(value), []);
  const handleDuesDateChange = useCallback((value) => setDuesDate(value), []);
  const handleCommercialInsuranceExpiryChange = useCallback((value) => setCommercialInsuranceExpiryDate(value), []);
  const handleAutoInsuranceExpiryChange = useCallback((value) => setAutoInsuranceExpiryDate(value), []);
  const handleWsibNumberChange = useCallback((value) => setWsibNumber(value), []);
  const handleWsibInsuranceDateChange = useCallback((value) => setWsibInsuranceDate(value), []);
  const handlePoliceCheckChange = useCallback((value) => setPoliceCheck(value), []);
  const handleTaxIdChange = useCallback((value) => setTaxId(value), []);
  const handleDriversLicenseClassChange = useCallback((value) => setDriversLicenseClass(value), []);
  const handleEmergencyContactNameChange = useCallback((value) => setEmergencyContactName(value), []);
  const handleEmergencyContactRelationshipChange = useCallback((value) => setEmergencyContactRelationship(value), []);
  const handleEmergencyContactTelephoneChange = useCallback((value) => setEmergencyContactTelephone(value), []);
  const handleEmergencyContactAltTelephoneChange = useCallback((value) => setEmergencyContactAlternativeTelephone(value), []);
  const handleDescriptionChange = useCallback((value) => setDescription(value), []);
  const handlePreferredLanguageChange = useCallback((value) => setPreferredLanguage(value), []);
  const handlePasswordChange = useCallback((value) => setPassword(value), []);
  const handlePasswordRepeatedChange = useCallback((value) => setPasswordRepeated(value), []);

  const handleServiceFeeChange = useCallback((value) => {
    setServiceFeeId(value);
    if (errors.serviceFeeId) {
      setErrors((prev) => ({ ...prev, serviceFeeId: null }));
    }
  }, [errors.serviceFeeId]);

  const handleServiceFeeOtherDetected = useCallback((isOther) => {
    setIsServiceFeeOther(isOther);
    if (!isOther) {
      setServiceFeeOther("");
    }
  }, []);

  const handleServiceFeeOtherChange = useCallback((value) => setServiceFeeOther(value), []);

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
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={5}
      wizardTitle="Add New Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Account Settings"
      stepSubtitle="Configure account settings and preferences for the new associate"
      stepIcon={ComputerDesktopIcon}
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
        {/* Skill Sets Section */}
        <FormCard
          title="Skill Sets"
          subtitle="Select all skill sets that apply to this associate"
          icon={AcademicCapIcon}
          maxWidth="7xl"
        >
          <SkillSetsMultiSelect
            value={skillSets}
            onChange={setSkillSets}
            error={errors.skillSets}
            required={true}
            helperText="Choose the skills and expertise areas"
            onUnauthorized={onUnauthorized}
          />
        </FormCard>

        {/* Insurance Requirements Section */}
        <FormCard
          title="Insurance Requirements"
          subtitle="Select all insurance requirements for this associate"
          icon={ShieldCheckIcon}
          maxWidth="7xl"
        >
          <InsuranceRequirementsMultiSelect
            value={insuranceRequirements}
            onChange={setInsuranceRequirements}
            error={errors.insuranceRequirements}
            required={true}
            helperText="Choose applicable insurance coverage types"
            onUnauthorized={onUnauthorized}
          />
        </FormCard>

        {/* Financial Information */}
        <FormCard
          title="Financial Information"
          subtitle="Configure rates, fees, and financial details"
          icon={CurrencyDollarIcon}
          maxWidth="7xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Hourly Rate (Optional)"
                type="number"
                value={hourlySalaryDesired}
                onChange={handleHourlySalaryChange}
                placeholder="$ / hr"
                icon={CurrencyDollarIcon}
              />
              <div>
                <ServiceFeeSelect
                  value={serviceFeeId}
                  onChange={handleServiceFeeChange}
                  onOtherDetected={handleServiceFeeOtherDetected}
                  error={errors.serviceFeeId}
                  required={true}
                  label="Service Fee"
                  onUnauthorized={onUnauthorized}
                />
              </div>
            </div>

            {isServiceFeeOther && (
              <Input
                label="Specify Other Service Fee"
                value={serviceFeeOther}
                onChange={handleServiceFeeOtherChange}
                placeholder="Enter custom service fee details"
                required
                error={errors.serviceFeeOther}
              />
            )}

            <Textarea
              label="Limitations or Special Considerations (Optional)"
              value={limitSpecial}
              onChange={handleLimitSpecialChange}
              placeholder="Enter any limitations or special considerations"
              rows={3}
              maxLength={638}
            />
          </div>
        </FormCard>

        {/* Important Dates */}
        <FormCard
          title="Important Dates"
          subtitle="Track expiry dates and renewal schedules"
          icon={CalendarDaysIcon}
          maxWidth="7xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              label="Member Dues Date"
              value={duesDate}
              onChange={handleDuesDateChange}
              required
              error={errors.duesDate}
            />
            <DatePicker
              label="Police Check Expiry"
              value={policeCheck}
              onChange={handlePoliceCheckChange}
              required
              error={errors.policeCheck}
            />
            <DatePicker
              label="Commercial Insurance Expiry"
              value={commercialInsuranceExpiryDate}
              onChange={handleCommercialInsuranceExpiryChange}
              required
              error={errors.commercialInsuranceExpiryDate}
            />
            <DatePicker
              label="Auto Insurance Expiry (Optional)"
              value={autoInsuranceExpiryDate}
              onChange={handleAutoInsuranceExpiryChange}
            />
            <DatePicker
              label="WSIB Insurance Date (Optional)"
              value={wsibInsuranceDate}
              onChange={handleWsibInsuranceDateChange}
            />
          </div>
        </FormCard>

        {/* Licenses & Certifications */}
        <FormCard
          title="Licenses & Certifications"
          subtitle="Professional licenses and certification numbers"
          icon={IdentificationIcon}
          maxWidth="7xl"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="WSIB # (Optional)"
                value={wsibNumber}
                onChange={handleWsibNumberChange}
                placeholder="Enter WSIB number"
              />
              <Input
                label="HST # (Optional)"
                value={taxId}
                onChange={handleTaxIdChange}
                placeholder="Enter HST number"
              />
              <Input
                label="Driver's License Class (Optional)"
                value={driversLicenseClass}
                onChange={handleDriversLicenseClassChange}
                placeholder="Enter license class"
              />
            </div>

            <div>
              <VehicleTypesMultiSelect
                value={vehicleTypes}
                onChange={setVehicleTypes}
                error={errors.vehicleTypes}
                required={false}
                label="Vehicle Types (Optional)"
                helperText="Select all vehicle types the associate has access to"
                onUnauthorized={onUnauthorized}
              />
            </div>
          </div>
        </FormCard>

        {/* Hidden honeypot fields to prevent browser autofill issues */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          <input type="email" name="email" autoComplete="email" tabIndex={-1} />
          <input type="text" name="username" autoComplete="username" tabIndex={-1} />
        </div>

        {/* Emergency Contact */}
        <FormCard
          title="Emergency Contact"
          subtitle="Contact information for emergencies"
          icon={UserGroupIcon}
          maxWidth="7xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Contact Name"
              value={emergencyContactName}
              onChange={handleEmergencyContactNameChange}
              placeholder="Enter emergency contact name"
              required
              error={errors.emergencyContactName}
              autoComplete="off"
            />
            <Input
              label="Relationship"
              value={emergencyContactRelationship}
              onChange={handleEmergencyContactRelationshipChange}
              placeholder="Enter relationship"
              required
              error={errors.emergencyContactRelationship}
              autoComplete="off"
            />
            <Input
              label="Phone Number"
              type="tel"
              value={emergencyContactTelephone}
              onChange={handleEmergencyContactTelephoneChange}
              placeholder="Enter phone number"
              icon={PhoneIcon}
              required
              error={errors.emergencyContactTelephone}
              autoComplete="tel"
            />
            <Input
              label="Alternative Phone (Optional)"
              type="tel"
              value={emergencyContactAlternativeTelephone}
              onChange={handleEmergencyContactAltTelephoneChange}
              placeholder="Enter alternative phone number"
              icon={PhoneIcon}
              autoComplete="off"
            />
          </div>
        </FormCard>

        {/* System Settings */}
        <FormCard
          title="System Settings"
          subtitle="Language preferences and system configuration"
          icon={ComputerDesktopIcon}
          maxWidth="7xl"
        >
          <div className="space-y-6">
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

            <Divider className="my-6" />

            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter any additional notes or description about this associate"
              rows={4}
              maxLength={638}
              helperText="Internal notes about this associate (not visible to them)"
            />
          </div>
        </FormCard>

        {/* Hidden honeypot fields to prevent browser password autofill issues */}
        <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', width: '1px', height: '1px', overflow: 'hidden' }}>
          <input type="text" name="fakeusernameremembered" autoComplete="username" tabIndex={-1} />
          <input type="password" name="fakepasswordremembered" autoComplete="current-password" tabIndex={-1} />
        </div>

        {/* Login Credentials */}
        <FormCard
          title="Login Credentials"
          subtitle="Set up authentication for the associate's account"
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
                placeholder="Enter password (min 8 characters)"
                icon={LockClosedIcon}
                error={errors.password}
                helperText="Leave blank to auto-generate a password"
                autoComplete="new-password"
              />
              <Input
                label="Confirm Password (Optional)"
                type="password"
                value={passwordRepeated}
                onChange={handlePasswordRepeatedChange}
                placeholder="Repeat password"
                icon={LockClosedIcon}
                error={errors.passwordRepeated}
                helperText="Must match the password above if entered"
                autoComplete="new-password"
              />
            </div>
          </div>
        </FormCard>
      </div>
    </WizardFormStep>
  );
});

Step5Content.displayName = 'Step5Content';

function AdminAssociateAddStep5Page() {
  return (
    <UIXThemeProvider>
      <Step5Content />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep5Page;
