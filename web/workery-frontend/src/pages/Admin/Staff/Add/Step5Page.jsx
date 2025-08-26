// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import { VehicleTypesMultiSelect } from "../../../../components/business/selects";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  ExclamationCircleIcon,
  CheckIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  TruckIcon,
  LanguageIcon,
  PhoneIcon,
  UserGroupIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  ClipboardDocumentIcon,
  IdentificationIcon,
  InformationCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

// Language constants
const LANGUAGE_ENGLISH = "English";
const LANGUAGE_FRENCH = "French";

// Password validation constants
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 255;
const PASSWORD_REGEX = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumbers: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
};

// DetailSection Component with Dark Header
const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminStaffAddStep5Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  const wizardState = wizardStorage.getWizardState();

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

  // Account form data
  const [limitSpecial, setLimitSpecial] = useState(
    wizardState.limitSpecial || "",
  );
  const [policeCheck, setPoliceCheck] = useState(wizardState.policeCheck || "");
  const [driversLicenseClass, setDriversLicenseClass] = useState(
    wizardState.driversLicenseClass || "",
  );
  const [vehicleTypes, setVehicleTypes] = useState(
    wizardState.vehicleTypes || [],
  );
  const [emergencyContactName, setEmergencyContactName] = useState(
    wizardState.emergencyContactName || "",
  );
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState(wizardState.emergencyContactRelationship || "");
  const [emergencyContactTelephone, setEmergencyContactTelephone] = useState(
    wizardState.emergencyContactTelephone || "",
  );
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState(wizardState.emergencyContactAlternativeTelephone || "");
  const [description, setDescription] = useState(wizardState.description || "");
  const [preferredLanguage, setPreferredLanguage] = useState(
    wizardState.preferredLanguage || LANGUAGE_ENGLISH,
  );
  const [password, setPassword] = useState(wizardState.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(
    wizardState.passwordRepeated || "",
  );

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Password strength calculator
  const calculatePasswordStrength = (pwd) => {
    if (!pwd) return 0;

    let strength = 0;
    const requirements = {
      minLength: pwd.length >= PASSWORD_MIN_LENGTH,
      hasUpperCase: PASSWORD_REGEX.hasUpperCase.test(pwd),
      hasLowerCase: PASSWORD_REGEX.hasLowerCase.test(pwd),
      hasNumbers: PASSWORD_REGEX.hasNumbers.test(pwd),
      hasSpecialChar: PASSWORD_REGEX.hasSpecialChar.test(pwd),
    };

    // Calculate strength based on requirements met
    Object.values(requirements).forEach((met) => {
      if (met) strength += 20;
    });

    setPasswordRequirements(requirements);
    setPasswordStrength(strength);
    return requirements;
  };

  // Handle password change with validation
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    calculatePasswordStrength(newPassword);

    // Clear password errors when user starts typing
    if (errors.password) {
      const newErrors = { ...errors };
      delete newErrors.password;
      setErrors(newErrors);
    }
  };

  // Validate password according to business rules
  const validatePassword = (pwd, pwdRepeated) => {
    const errors = {};

    if (!pwd || pwd.trim() === "") {
      errors.password = "Password is required";
      return errors;
    }

    if (pwd.length < PASSWORD_MIN_LENGTH) {
      errors.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;
      return errors;
    }

    if (pwd.length > PASSWORD_MAX_LENGTH) {
      errors.password = `Password must not exceed ${PASSWORD_MAX_LENGTH} characters`;
      return errors;
    }

    // Check password complexity requirements
    const requirements = calculatePasswordStrength(pwd);
    const missingRequirements = [];

    if (!requirements.hasUpperCase)
      missingRequirements.push("one uppercase letter");
    if (!requirements.hasLowerCase)
      missingRequirements.push("one lowercase letter");
    if (!requirements.hasNumbers) missingRequirements.push("one number");
    if (!requirements.hasSpecialChar)
      missingRequirements.push("one special character");

    if (missingRequirements.length > 0) {
      errors.password = `Password must contain at least ${missingRequirements.join(", ")}`;
      return errors;
    }

    if (pwd !== pwdRepeated) {
      errors.password = "Passwords do not match";
      errors.passwordRepeated = "Passwords do not match";
      return errors;
    }

    return errors;
  };

  const onSubmitClick = async (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Basic validation for emergency contact
    if (!emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
      hasErrors = true;
    }
    if (!emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship =
        "Emergency contact relationship is required";
      hasErrors = true;
    }
    if (!emergencyContactTelephone.trim()) {
      newErrors.emergencyContactTelephone =
        "Emergency contact telephone is required";
      hasErrors = true;
    }
    if (!preferredLanguage.trim()) {
      newErrors.preferredLanguage = "Preferred language is required";
      hasErrors = true;
    }

    // Password validation - now required
    const passwordErrors = validatePassword(password, passwordRepeated);
    if (Object.keys(passwordErrors).length > 0) {
      newErrors = { ...newErrors, ...passwordErrors };
      hasErrors = true;
    }

    // Check if password confirmation is empty when password is provided
    if (password && !passwordRepeated) {
      newErrors.passwordRepeated = "Please confirm your password";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      // Scroll to top to show errors
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);

    try {
      // Save to storage
      const dataToSave = {
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
      };

      // Update wizard storage
      wizardStorage.updateWizardState(dataToSave);

      // Navigate to next step
      navigate("/admin/staff/add/step-6");
    } catch (error) {
      console.error("Error saving account information:", error);
      setErrors({
        general: "Failed to save account information. Please try again.",
      });
      setIsLoading(false);
    }
  };

  // Get password strength color
  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 20) return "bg-red-500";
    if (passwordStrength <= 40) return "bg-orange-500";
    if (passwordStrength <= 60) return "bg-yellow-500";
    if (passwordStrength <= 80) return "bg-blue-500";
    return "bg-green-500";
  };

  // Get password strength text
  const getPasswordStrengthText = () => {
    if (passwordStrength <= 20) return "Weak";
    if (passwordStrength <= 40) return "Fair";
    if (passwordStrength <= 60) return "Good";
    if (passwordStrength <= 80) return "Strong";
    return "Very Strong";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <nav
          className="flex mb-4 sm:mb-6 overflow-x-auto"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to="/admin/staff"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Staff
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Staff Member
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Configure account settings and credentials
          </p>
        </div>

        {/* Wizard Steps - Mobile Simplified */}
        <div className="mb-4 sm:mb-6">
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 5: Account
                  </p>
                  <p className="text-xs text-gray-500">Settings & Security</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">5 of 7</div>
            </div>
          </div>

          {/* Desktop Wizard Steps */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Steps 1-4 Complete */}
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
                        {step === 3 && "Contact"}
                        {step === 4 && "Address"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 6 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Account</p>
                  <p className="text-xs text-gray-500">Details</p>
                </div>
              </div>

              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Steps 6-7 Inactive */}
              {[
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                      <span className="text-gray-600 font-semibold">
                        {step.num}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.subtitle}</p>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
              <span className="flex items-center break-words">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                {errors.general}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Submitting...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmitClick} className="max-w-4xl mx-auto">
            <div className="space-y-0">
              {/* Insurance & Financial Section */}
              <DetailSection
                title="Insurance, Financial, etc."
                icon={ShieldCheckIcon}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Limitation or Special Consideration (Optional)
                    </label>
                    <textarea
                      value={limitSpecial}
                      onChange={(e) => setLimitSpecial(e.target.value)}
                      placeholder="Enter any limitations or special considerations"
                      rows={3}
                      maxLength={638}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Max 638 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Police Check Expiry (Optional)
                      </label>
                      <input
                        type="date"
                        value={policeCheck}
                        onChange={(e) => setPoliceCheck(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Driver's License Class (Optional)
                      </label>
                      <input
                        type="text"
                        value={driversLicenseClass}
                        onChange={(e) => setDriversLicenseClass(e.target.value)}
                        placeholder="Enter license class"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Vehicle Types Section */}
              <DetailSection title="Vehicle Types" icon={TruckIcon}>
                <VehicleTypesMultiSelect
                  value={vehicleTypes}
                  onChange={setVehicleTypes}
                  error={errors.vehicleTypes}
                  required={false}
                  helperText="Select all vehicle types the staff member has access to"
                  onUnauthorized={onUnauthorized}
                />
              </DetailSection>

              {/* Emergency Contact */}
              <DetailSection title="Emergency Contact" icon={UserGroupIcon}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="Enter emergency contact name"
                      className={`w-full px-3 py-2 border ${
                        errors.emergencyContactName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.emergencyContactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactRelationship}
                      onChange={(e) =>
                        setEmergencyContactRelationship(e.target.value)
                      }
                      placeholder="Enter relationship"
                      className={`w-full px-3 py-2 border ${
                        errors.emergencyContactRelationship
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                    />
                    {errors.emergencyContactRelationship && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.emergencyContactRelationship}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={emergencyContactTelephone}
                        onChange={(e) =>
                          setEmergencyContactTelephone(e.target.value)
                        }
                        placeholder="Enter phone number"
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.emergencyContactTelephone
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                      />
                    </div>
                    {errors.emergencyContactTelephone && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.emergencyContactTelephone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Alternative Phone (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={emergencyContactAlternativeTelephone}
                        onChange={(e) =>
                          setEmergencyContactAlternativeTelephone(
                            e.target.value,
                          )
                        }
                        placeholder="Enter alternative phone number"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* System Settings */}
              <DetailSection title="System Settings" icon={ComputerDesktopIcon}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Preferred Language <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LanguageIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.preferredLanguage
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base`}
                      >
                        <option value={LANGUAGE_ENGLISH}>English</option>
                        <option value={LANGUAGE_FRENCH}>French</option>
                      </select>
                    </div>
                    {errors.preferredLanguage && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.preferredLanguage}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter any additional notes or description about this staff member"
                      rows={4}
                      maxLength={638}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Any internal notes about this staff member (not visible to
                      the staff member)
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Login Credentials */}
              <DetailSection title="Login Credentials" icon={LockClosedIcon}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={handlePasswordChange}
                      placeholder="Enter a secure password"
                      className={`w-full px-3 py-2 border ${
                        errors.password ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                    />

                    {/* Password strength indicator */}
                    {password && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600">
                            Password strength:
                          </span>
                          <span
                            className={`text-xs font-medium ${
                              passwordStrength >= 80
                                ? "text-green-600"
                                : passwordStrength >= 60
                                  ? "text-blue-600"
                                  : passwordStrength >= 40
                                    ? "text-yellow-600"
                                    : "text-red-600"
                            }`}
                          >
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                            style={{ width: `${passwordStrength}%` }}
                          ></div>
                        </div>

                        {/* Password requirements checklist */}
                        <div className="mt-2 space-y-1">
                          <div
                            className={`text-xs flex items-center ${
                              passwordRequirements.minLength
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <CheckIcon
                              className={`w-3 h-3 mr-1 ${
                                passwordRequirements.minLength
                                  ? "visible"
                                  : "invisible"
                              }`}
                            />
                            At least 8 characters
                          </div>
                          <div
                            className={`text-xs flex items-center ${
                              passwordRequirements.hasUpperCase
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <CheckIcon
                              className={`w-3 h-3 mr-1 ${
                                passwordRequirements.hasUpperCase
                                  ? "visible"
                                  : "invisible"
                              }`}
                            />
                            One uppercase letter
                          </div>
                          <div
                            className={`text-xs flex items-center ${
                              passwordRequirements.hasLowerCase
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <CheckIcon
                              className={`w-3 h-3 mr-1 ${
                                passwordRequirements.hasLowerCase
                                  ? "visible"
                                  : "invisible"
                              }`}
                            />
                            One lowercase letter
                          </div>
                          <div
                            className={`text-xs flex items-center ${
                              passwordRequirements.hasNumbers
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <CheckIcon
                              className={`w-3 h-3 mr-1 ${
                                passwordRequirements.hasNumbers
                                  ? "visible"
                                  : "invisible"
                              }`}
                            />
                            One number
                          </div>
                          <div
                            className={`text-xs flex items-center ${
                              passwordRequirements.hasSpecialChar
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <CheckIcon
                              className={`w-3 h-3 mr-1 ${
                                passwordRequirements.hasSpecialChar
                                  ? "visible"
                                  : "invisible"
                              }`}
                            />
                            One special character (!@#$%^&*...)
                          </div>
                        </div>
                      </div>
                    )}

                    {errors.password && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Confirm Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordRepeated}
                      onChange={(e) => {
                        setPasswordRepeated(e.target.value);
                        // Clear error when user starts typing
                        if (errors.passwordRepeated) {
                          const newErrors = { ...errors };
                          delete newErrors.passwordRepeated;
                          setErrors(newErrors);
                        }
                      }}
                      placeholder="Re-enter your password"
                      className={`w-full px-3 py-2 border ${
                        errors.passwordRepeated
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                    />
                    {errors.passwordRepeated && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.passwordRepeated}
                      </p>
                    )}
                    {passwordRepeated && password === passwordRepeated && (
                      <p className="mt-1 text-xs sm:text-sm text-green-600 flex items-center">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        Passwords match
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800">
                    <strong>Security Note:</strong> The staff member will need
                    this password to log into their account. Make sure to
                    securely share this password with them after account
                    creation.
                  </p>
                </div>
              </DetailSection>
            </div>

            {/* Form Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin/staff/add/step-4"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 order-1 sm:order-2 ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminStaffAddStep5Page;
