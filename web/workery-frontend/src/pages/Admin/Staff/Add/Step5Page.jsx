// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step5Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep5Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  UserPlusIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
  LockClosedIcon,
  LanguageIcon,
  PhoneIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  WizardFormStep,
  FormCard,
  Input,
  Select,
  Textarea,
  Alert,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import { VehicleTypesMultiSelect } from "../../../../components/business/selects";

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

// Language options
const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 255;
const PASSWORD_REGEX = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumbers: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

// Memoized content component
const Step5Content = memo(function Step5Content() {
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
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumbers: false,
    hasSpecialChar: false,
  });

  // Memoized theme classes
  const themeClasses = useMemo(() => ({
    textMuted: getThemeClasses('text-muted') || 'text-gray-500 dark:text-gray-400',
    bgMuted: getThemeClasses('bg-muted') || 'bg-gray-200 dark:bg-gray-700',
    alertInfoBg: getThemeClasses('alert-info-bg'),
    alertInfoBorder: getThemeClasses('alert-info-border'),
    alertInfoText: getThemeClasses('alert-info-text'),
    // Password strength colors
    strengthWeak: getThemeClasses('strength-weak') || 'bg-red-500 dark:bg-red-600',
    strengthFair: getThemeClasses('strength-fair') || 'bg-orange-500 dark:bg-orange-600',
    strengthGood: getThemeClasses('strength-good') || 'bg-yellow-500 dark:bg-yellow-600',
    strengthStrong: getThemeClasses('strength-strong') || 'bg-blue-500 dark:bg-blue-600',
    strengthVeryStrong: getThemeClasses('strength-very-strong') || 'bg-green-500 dark:bg-green-600',
    // Password strength text colors
    textWeakStrength: getThemeClasses('text-error') || 'text-red-600 dark:text-red-400',
    textFairStrength: getThemeClasses('text-warning') || 'text-yellow-600 dark:text-yellow-400',
    textGoodStrength: getThemeClasses('text-info') || 'text-blue-600 dark:text-blue-400',
    textStrongStrength: getThemeClasses('text-info') || 'text-blue-600 dark:text-blue-400',
    textVeryStrongStrength: getThemeClasses('text-success') || 'text-green-600 dark:text-green-400',
    // Requirement met color
    textSuccess: getThemeClasses('text-success') || 'text-green-600 dark:text-green-400',
  }), [getThemeClasses]);

  // Account form data
  const [limitSpecial, setLimitSpecial] = useState(wizardState.limitSpecial || "");
  const [policeCheck, setPoliceCheck] = useState(wizardState.policeCheck || "");
  const [driversLicenseClass, setDriversLicenseClass] = useState(
    wizardState.driversLicenseClass || ""
  );
  const [vehicleTypes, setVehicleTypes] = useState(wizardState.vehicleTypes || []);
  const [emergencyContactName, setEmergencyContactName] = useState(
    wizardState.emergencyContactName || ""
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] = useState(
    wizardState.emergencyContactRelationship || ""
  );
  const [emergencyContactTelephone, setEmergencyContactTelephone] = useState(
    wizardState.emergencyContactTelephone || ""
  );
  const [emergencyContactAlternativeTelephone, setEmergencyContactAlternativeTelephone] = useState(
    wizardState.emergencyContactAlternativeTelephone || ""
  );
  const [description, setDescription] = useState(wizardState.description || "");
  const [preferredLanguage, setPreferredLanguage] = useState(
    wizardState.preferredLanguage || "English"
  );
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

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

  // Password strength calculator
  const calculatePasswordStrength = useCallback((pwd) => {
    if (!pwd) return { strength: 0, requirements: {} };

    let strength = 0;
    const requirements = {
      minLength: pwd.length >= PASSWORD_MIN_LENGTH,
      hasUpperCase: PASSWORD_REGEX.hasUpperCase.test(pwd),
      hasLowerCase: PASSWORD_REGEX.hasLowerCase.test(pwd),
      hasNumbers: PASSWORD_REGEX.hasNumbers.test(pwd),
      hasSpecialChar: PASSWORD_REGEX.hasSpecialChar.test(pwd),
    };

    Object.values(requirements).forEach((met) => {
      if (met) strength += 20;
    });

    return { strength, requirements };
  }, []);

  // Validate password according to business rules
  const validatePassword = useCallback((pwd, pwdRepeated) => {
    const validationErrors = {};

    if (!pwd || pwd.trim() === "") {
      validationErrors.password = "Password is required";
      return validationErrors;
    }

    if (pwd.length < PASSWORD_MIN_LENGTH) {
      validationErrors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
      return validationErrors;
    }

    if (pwd.length > PASSWORD_MAX_LENGTH) {
      validationErrors.password = `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`;
      return validationErrors;
    }

    const { requirements } = calculatePasswordStrength(pwd);
    const missingRequirements = [];

    if (!requirements.hasUpperCase) missingRequirements.push("one uppercase letter");
    if (!requirements.hasLowerCase) missingRequirements.push("one lowercase letter");
    if (!requirements.hasNumbers) missingRequirements.push("one number");
    if (!requirements.hasSpecialChar) missingRequirements.push("one special character");

    if (missingRequirements.length > 0) {
      validationErrors.password = `Password must contain at least ${missingRequirements.join(", ")}`;
      return validationErrors;
    }

    if (pwd !== pwdRepeated) {
      validationErrors.password = "Passwords do not match";
      validationErrors.passwordRepeated = "Passwords do not match";
      return validationErrors;
    }

    return validationErrors;
  }, [calculatePasswordStrength]);

  // Handle form submission
  const handleNext = useCallback(() => {
    setErrors({});
    let newErrors = {};
    let hasErrors = false;

    // Basic validation for emergency contact
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
    const passwordErrors = validatePassword(password, passwordRepeated);
    if (Object.keys(passwordErrors).length > 0) {
      newErrors = { ...newErrors, ...passwordErrors };
      hasErrors = true;
    }

    if (password && !passwordRepeated) {
      newErrors.passwordRepeated = "Please confirm your password";
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
      limitSpecial,
      policeCheck,
      driversLicenseClass,
      vehicleTypes,
      emergencyContactName,
      emergencyContactRelationship,
      emergencyContactTelephone,
      emergencyContactAlternativeTelephone,
      description,
      preferredLanguage,
      password,
      passwordRepeated,
    });

    setIsLoading(false);
    navigate("/admin/staff/add/step-6");
  }, [
    limitSpecial,
    policeCheck,
    driversLicenseClass,
    vehicleTypes,
    emergencyContactName,
    emergencyContactRelationship,
    emergencyContactTelephone,
    emergencyContactAlternativeTelephone,
    description,
    preferredLanguage,
    password,
    passwordRepeated,
    validatePassword,
    navigate,
    wizardStorage,
  ]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-4");
  }, [navigate]);

  // Stable onChange handlers
  const handleLimitSpecialChange = useCallback((value) => {
    setLimitSpecial(value);
  }, []);

  const handlePoliceCheckChange = useCallback((value) => {
    setPoliceCheck(value);
  }, []);

  const handleDriversLicenseClassChange = useCallback((value) => {
    setDriversLicenseClass(value);
  }, []);

  const handleVehicleTypesChange = useCallback((value) => {
    setVehicleTypes(value);
  }, []);

  const handleEmergencyContactNameChange = useCallback((value) => {
    setEmergencyContactName(value);
  }, []);

  const handleEmergencyContactRelationshipChange = useCallback((value) => {
    setEmergencyContactRelationship(value);
  }, []);

  const handleEmergencyContactTelephoneChange = useCallback((value) => {
    setEmergencyContactTelephone(value);
  }, []);

  const handleEmergencyContactAlternativeTelephoneChange = useCallback((value) => {
    setEmergencyContactAlternativeTelephone(value);
  }, []);

  const handleDescriptionChange = useCallback((value) => {
    setDescription(value);
  }, []);

  const handlePreferredLanguageChange = useCallback((value) => {
    setPreferredLanguage(value);
  }, []);

  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
    const { strength, requirements } = calculatePasswordStrength(value);
    setPasswordStrength(strength);
    setPasswordRequirements(requirements);
    // Clear password error when user types
    setErrors((prev) => {
      if (prev.password) {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      }
      return prev;
    });
  }, [calculatePasswordStrength]);

  const handlePasswordRepeatedChange = useCallback((value) => {
    setPasswordRepeated(value);
    // Clear error when user types
    setErrors((prev) => {
      if (prev.passwordRepeated) {
        const newErrors = { ...prev };
        delete newErrors.passwordRepeated;
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Get password strength color
  const getPasswordStrengthColor = useCallback(() => {
    if (passwordStrength <= 20) return themeClasses.strengthWeak;
    if (passwordStrength <= 40) return themeClasses.strengthFair;
    if (passwordStrength <= 60) return themeClasses.strengthGood;
    if (passwordStrength <= 80) return themeClasses.strengthStrong;
    return themeClasses.strengthVeryStrong;
  }, [passwordStrength, themeClasses]);

  // Get password strength text
  const getPasswordStrengthText = useCallback(() => {
    if (passwordStrength <= 20) return "Weak";
    if (passwordStrength <= 40) return "Fair";
    if (passwordStrength <= 60) return "Good";
    if (passwordStrength <= 80) return "Strong";
    return "Very Strong";
  }, [passwordStrength]);

  // Get password strength text color
  const getPasswordStrengthTextColor = useCallback(() => {
    if (passwordStrength <= 20) return themeClasses.textWeakStrength;
    if (passwordStrength <= 40) return themeClasses.textFairStrength;
    if (passwordStrength <= 60) return themeClasses.textGoodStrength;
    if (passwordStrength <= 80) return themeClasses.textStrongStrength;
    return themeClasses.textVeryStrongStrength;
  }, [passwordStrength, themeClasses]);

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
      currentStep={5}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Account Information"
      stepSubtitle="Configure account settings and credentials"
      stepIcon={ShieldCheckIcon}
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
        {/* Insurance & Financial Section */}
        <FormCard title="Insurance, Financial, etc." icon={ShieldCheckIcon} maxWidth="7xl">
          <div className="space-y-6">
            <Textarea
              label="Limitation or Special Consideration (Optional)"
              value={limitSpecial}
              onChange={handleLimitSpecialChange}
              placeholder="Enter any limitations or special considerations"
              rows={3}
              maxLength={638}
              helperText="Max 638 characters"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Police Check Expiry (Optional)"
                type="date"
                value={policeCheck}
                onChange={handlePoliceCheckChange}
              />
              <Input
                label="Driver's License Class (Optional)"
                type="text"
                value={driversLicenseClass}
                onChange={handleDriversLicenseClassChange}
                placeholder="Enter license class"
              />
            </div>
          </div>
        </FormCard>

        {/* Vehicle Types Section */}
        <FormCard title="Vehicle Types" icon={TruckIcon} maxWidth="7xl">
          <VehicleTypesMultiSelect
            value={vehicleTypes}
            onChange={handleVehicleTypesChange}
            error={errors.vehicleTypes}
            required={false}
            helperText="Select all vehicle types the staff member has access to"
            onUnauthorized={onUnauthorized}
          />
        </FormCard>

        {/* Emergency Contact Section */}
        <FormCard title="Emergency Contact" icon={UserGroupIcon} maxWidth="7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Contact Name"
              type="text"
              value={emergencyContactName}
              onChange={handleEmergencyContactNameChange}
              placeholder="Enter emergency contact name"
              required
              error={errors.emergencyContactName}
            />
            <Input
              label="Relationship"
              type="text"
              value={emergencyContactRelationship}
              onChange={handleEmergencyContactRelationshipChange}
              placeholder="Enter relationship"
              required
              error={errors.emergencyContactRelationship}
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
            />
            <Input
              label="Alternative Phone (Optional)"
              type="tel"
              value={emergencyContactAlternativeTelephone}
              onChange={handleEmergencyContactAlternativeTelephoneChange}
              placeholder="Enter alternative phone number"
              icon={PhoneIcon}
            />
          </div>
        </FormCard>

        {/* System Settings Section */}
        <FormCard title="System Settings" icon={ComputerDesktopIcon} maxWidth="7xl">
          <div className="space-y-6">
            <Select
              label="Preferred Language"
              value={preferredLanguage}
              onChange={handlePreferredLanguageChange}
              options={LANGUAGE_OPTIONS}
              icon={LanguageIcon}
              required
              error={errors.preferredLanguage}
            />
            <Textarea
              label="Description (Optional)"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter any additional notes or description about this staff member"
              rows={4}
              maxLength={638}
              helperText="Any internal notes about this staff member (not visible to the staff member)"
            />
          </div>
        </FormCard>

        {/* Login Credentials Section */}
        <FormCard title="Login Credentials" icon={LockClosedIcon} maxWidth="7xl">
          {/* Honeypot fields to prevent browser autofill on real fields */}
          {/* These hidden fields catch autofill attempts */}
          <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, height: 0, overflow: 'hidden' }}>
            <input
              type="email"
              name="email"
              tabIndex={-1}
              autoComplete="username email"
            />
            <input
              type="password"
              name="password"
              tabIndex={-1}
              autoComplete="current-password"
            />
          </div>
          <div className="space-y-6">
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={handlePasswordChange}
                placeholder="Enter a secure password"
                required
                error={errors.password}
                autoComplete="new-password"
                name="staff_new_pwd"
              />

              {/* Password strength indicator */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs ${themeClasses.textMuted}`}>Password strength:</span>
                    <span
                      className={`text-xs font-medium ${getPasswordStrengthTextColor()}`}
                    >
                      {getPasswordStrengthText()}
                    </span>
                  </div>
                  <div className={`w-full ${themeClasses.bgMuted} rounded-full h-2`}>
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    ></div>
                  </div>

                  {/* Password requirements checklist */}
                  <div className="mt-2 space-y-1">
                    <div
                      className={`text-xs flex items-center ${
                        passwordRequirements.minLength ? themeClasses.textSuccess : themeClasses.textMuted
                      }`}
                    >
                      <CheckIcon
                        className={`w-3 h-3 mr-1 ${
                          passwordRequirements.minLength ? "visible" : "invisible"
                        }`}
                      />
                      At least 8 characters
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordRequirements.hasUpperCase ? themeClasses.textSuccess : themeClasses.textMuted
                      }`}
                    >
                      <CheckIcon
                        className={`w-3 h-3 mr-1 ${
                          passwordRequirements.hasUpperCase ? "visible" : "invisible"
                        }`}
                      />
                      One uppercase letter
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordRequirements.hasLowerCase ? themeClasses.textSuccess : themeClasses.textMuted
                      }`}
                    >
                      <CheckIcon
                        className={`w-3 h-3 mr-1 ${
                          passwordRequirements.hasLowerCase ? "visible" : "invisible"
                        }`}
                      />
                      One lowercase letter
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordRequirements.hasNumbers ? themeClasses.textSuccess : themeClasses.textMuted
                      }`}
                    >
                      <CheckIcon
                        className={`w-3 h-3 mr-1 ${
                          passwordRequirements.hasNumbers ? "visible" : "invisible"
                        }`}
                      />
                      One number
                    </div>
                    <div
                      className={`text-xs flex items-center ${
                        passwordRequirements.hasSpecialChar ? themeClasses.textSuccess : themeClasses.textMuted
                      }`}
                    >
                      <CheckIcon
                        className={`w-3 h-3 mr-1 ${
                          passwordRequirements.hasSpecialChar ? "visible" : "invisible"
                        }`}
                      />
                      One special character (!@#$%^&*...)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Input
                label="Confirm Password"
                type="password"
                value={passwordRepeated}
                onChange={handlePasswordRepeatedChange}
                placeholder="Re-enter your password"
                required
                error={errors.passwordRepeated}
                autoComplete="new-password"
                name="staff_confirm_pwd"
              />
              {passwordRepeated && password === passwordRepeated && (
                <p className={`mt-1 text-xs sm:text-sm ${themeClasses.textSuccess} flex items-center`}>
                  <CheckIcon className="w-4 h-4 mr-1" />
                  Passwords match
                </p>
              )}
            </div>

            <Alert type="info">
              <strong>Security Note:</strong> The staff member will need this password to log
              into their account. Make sure to securely share this password with them after
              account creation.
            </Alert>
          </div>
        </FormCard>
      </div>
    </WizardFormStep>
  );
});

Step5Content.displayName = "Step5Content";

function AdminStaffAddStep5Page() {
  return (
    <UIXThemeProvider>
      <Step5Content />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep5Page;
