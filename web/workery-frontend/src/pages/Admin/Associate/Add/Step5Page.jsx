// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ExclamationCircleIcon,
  CheckIcon,
  ArrowRightIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarDaysIcon,
  DocumentCheckIcon,
  TruckIcon,
  LanguageIcon,
  PhoneIcon,
  UserGroupIcon,
  LockClosedIcon,
  ComputerDesktopIcon,
  ClipboardDocumentIcon,
  IdentificationIcon,
  CreditCardIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
  VehicleTypesMultiSelect,
  ServiceFeeSelect,
} from "../../../../components/business/selects";

// Section Component with Dark Header Pattern - Moved outside to prevent re-creation
const DetailSection = ({ title, icon: Icon, children, description }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
      {description && (
        <p className="mt-1 text-xs sm:text-sm text-gray-300">{description}</p>
      )}
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminAssociateAddStep5Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Account form data
  const [skillSets, setSkillSets] = useState([]);
  const [insuranceRequirements, setInsuranceRequirements] = useState([]);
  const [hourlySalaryDesired, setHourlySalaryDesired] = useState("");
  const [limitSpecial, setLimitSpecial] = useState("");
  const [duesDate, setDuesDate] = useState("");
  const [commercialInsuranceExpiryDate, setCommercialInsuranceExpiryDate] =
    useState("");
  const [autoInsuranceExpiryDate, setAutoInsuranceExpiryDate] = useState("");
  const [wsibNumber, setWsibNumber] = useState("");
  const [wsibInsuranceDate, setWsibInsuranceDate] = useState("");
  const [policeCheck, setPoliceCheck] = useState("");
  const [taxId, setTaxId] = useState("");
  const [driversLicenseClass, setDriversLicenseClass] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [serviceFeeId, setServiceFeeId] = useState("");
  const [isServiceFeeOther, setIsServiceFeeOther] = useState(false);
  const [serviceFeeOther, setServiceFeeOther] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactTelephone, setEmergencyContactTelephone] =
    useState("");
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState("");
  const [description, setDescription] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    loadAssociateState();
  }, [authManager, navigate]);

  const loadAssociateState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      if (existing) {
        const associateState = JSON.parse(existing);

        setSkillSets(associateState.skillSets || []);
        setInsuranceRequirements(associateState.insuranceRequirements || []);
        setHourlySalaryDesired(associateState.hourlySalaryDesired || "");
        setLimitSpecial(associateState.limitSpecial || "");
        setDuesDate(associateState.duesDate || "");
        setCommercialInsuranceExpiryDate(
          associateState.commercialInsuranceExpiryDate || "",
        );
        setAutoInsuranceExpiryDate(
          associateState.autoInsuranceExpiryDate || "",
        );
        setWsibNumber(associateState.wsibNumber || "");
        setWsibInsuranceDate(associateState.wsibInsuranceDate || "");
        setPoliceCheck(associateState.policeCheck || "");
        setTaxId(associateState.taxId || "");
        setDriversLicenseClass(associateState.driversLicenseClass || "");
        setVehicleTypes(associateState.vehicleTypes || []);
        setServiceFeeId(associateState.serviceFeeId || "");
        setIsServiceFeeOther(associateState.isServiceFeeOther || false);
        setServiceFeeOther(associateState.serviceFeeOther || "");
        setEmergencyContactName(associateState.emergencyContactName || "");
        setEmergencyContactRelationship(
          associateState.emergencyContactRelationship || "",
        );
        setEmergencyContactTelephone(
          associateState.emergencyContactTelephone || "",
        );
        setEmergencyContactAlternativeTelephone(
          associateState.emergencyContactAlternativeTelephone || "",
        );
        setDescription(associateState.description || "");
        setPreferredLanguage(associateState.preferredLanguage || "English");
        setPassword(associateState.password || "");
        setPasswordRepeated(associateState.passwordRepeated || "");
      } else {
        navigate("/admin/associates/add/step-1-search");
      }
    } catch (error) {
      console.error("Error loading associate state:", error);
      navigate("/admin/associates/add/step-1-search");
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Basic validation
    if (!skillSets || skillSets.length === 0) {
      newErrors.skillSets = "At least one skill set is required";
      hasErrors = true;
    }
    if (!insuranceRequirements || insuranceRequirements.length === 0) {
      newErrors.insuranceRequirements =
        "At least one insurance requirement is required";
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
      newErrors.commercialInsuranceExpiryDate =
        "Commercial insurance expiry date is required";
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
    const associateState = {
      ...getExistingState(),
      skillSets,
      insuranceRequirements,
      hourlySalaryDesired: hourlySalaryDesired
        ? parseInt(hourlySalaryDesired)
        : 0,
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
      sessionStorage.setItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
        JSON.stringify(associateState),
      );
      navigate("/admin/associates/add/step-6");
    } catch (error) {
      console.error("Error saving associate state:", error);
      setErrors({ general: "Failed to save data. Please try again." });
    }
  };

  const getExistingState = () => {
    try {
      const existing = sessionStorage.getItem(
        "WORKERY_ASSOCIATE_CREATION_STATE",
      );
      return existing ? JSON.parse(existing) : {};
    } catch (error) {
      return {};
    }
  };

  const handleServiceFeeChange = (value) => {
    setServiceFeeId(value);
    if (errors.serviceFeeId) {
      setErrors({ ...errors, serviceFeeId: null });
    }
  };

  const handleServiceFeeOtherDetected = (isOther) => {
    setIsServiceFeeOther(isOther);
    if (!isOther) {
      setServiceFeeOther("");
    }
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
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <Link
                  to="/admin/associates"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Associates</span>
                    <span className="sm:hidden">Assoc</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Add New Associate
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Configure account settings and preferences for the new associate
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
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
                  <p className="text-xs text-gray-500">
                    Settings & Preferences
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">5 of 7</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "71%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-4 Complete */}
              {[1, 2, 3, 4].map((step) => (
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
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Account</p>
                  <p className="text-xs text-gray-500">Settings</p>
                </div>
              </div>

              {/* Remaining Steps */}
              {[
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
              ].map((step) => (
                <React.Fragment key={step.num}>
                  <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
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
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-xs sm:text-sm">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>{errors.general}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Form - UPDATED: Removed max-w-3xl mx-auto constraint */}
        <form onSubmit={onSubmitClick}>
          {isLoading ? (
            <div className="bg-white shadow-sm rounded-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Skill Sets Section */}
              <DetailSection
                title="Skill Sets"
                icon={AcademicCapIcon}
                description="Select all skill sets that apply to this associate"
              >
                <SkillSetsMultiSelect
                  value={skillSets}
                  onChange={setSkillSets}
                  error={errors.skillSets}
                  required={true}
                  helperText="Choose the skills and expertise areas"
                  onUnauthorized={onUnauthorized}
                />
              </DetailSection>

              {/* Insurance Requirements Section */}
              <DetailSection
                title="Insurance Requirements"
                icon={ShieldCheckIcon}
                description="Select all insurance requirements for this associate"
              >
                <InsuranceRequirementsMultiSelect
                  value={insuranceRequirements}
                  onChange={setInsuranceRequirements}
                  error={errors.insuranceRequirements}
                  required={true}
                  helperText="Choose applicable insurance coverage types"
                  onUnauthorized={onUnauthorized}
                />
              </DetailSection>

              {/* Financial Information */}
              <DetailSection
                title="Financial Information"
                icon={CurrencyDollarIcon}
                description="Configure rates, fees, and financial details"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Hourly Rate (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          value={hourlySalaryDesired}
                          onChange={(e) =>
                            setHourlySalaryDesired(e.target.value)
                          }
                          placeholder="$ / hr"
                          className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <ServiceFeeSelect
                        value={serviceFeeId}
                        onChange={handleServiceFeeChange}
                        onOtherDetected={handleServiceFeeOtherDetected}
                        error={errors.serviceFeeId}
                        required={true}
                        label="Service Fee"
                        helperText="Select the applicable service fee"
                        onUnauthorized={onUnauthorized}
                      />
                    </div>
                  </div>

                  {isServiceFeeOther && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Specify Other Service Fee{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={serviceFeeOther}
                        onChange={(e) => setServiceFeeOther(e.target.value)}
                        placeholder="Enter custom service fee details"
                        className={`w-full px-3 py-2 sm:py-2.5 border ${
                          errors.serviceFeeOther
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                      {errors.serviceFeeOther && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.serviceFeeOther}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Limitations or Special Considerations (Optional)
                    </label>
                    <textarea
                      value={limitSpecial}
                      onChange={(e) => setLimitSpecial(e.target.value)}
                      placeholder="Enter any limitations or special considerations"
                      rows={3}
                      maxLength={638}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                  </div>
                </div>
              </DetailSection>

              {/* Important Dates */}
              <DetailSection
                title="Important Dates"
                icon={CalendarDaysIcon}
                description="Track expiry dates and renewal schedules"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Member Dues Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={duesDate}
                      onChange={(e) => setDuesDate(e.target.value)}
                      className={`w-full px-3 py-2 sm:py-2.5 border ${
                        errors.duesDate ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                    />
                    {errors.duesDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.duesDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Police Check Expiry{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={policeCheck}
                      onChange={(e) => setPoliceCheck(e.target.value)}
                      className={`w-full px-3 py-2 sm:py-2.5 border ${
                        errors.policeCheck
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                    />
                    {errors.policeCheck && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.policeCheck}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Commercial Insurance Expiry{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={commercialInsuranceExpiryDate}
                      onChange={(e) =>
                        setCommercialInsuranceExpiryDate(e.target.value)
                      }
                      className={`w-full px-3 py-2 sm:py-2.5 border ${
                        errors.commercialInsuranceExpiryDate
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                    />
                    {errors.commercialInsuranceExpiryDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.commercialInsuranceExpiryDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Auto Insurance Expiry (Optional)
                    </label>
                    <input
                      type="date"
                      value={autoInsuranceExpiryDate}
                      onChange={(e) =>
                        setAutoInsuranceExpiryDate(e.target.value)
                      }
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      WSIB Insurance Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={wsibInsuranceDate}
                      onChange={(e) => setWsibInsuranceDate(e.target.value)}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                  </div>
                </div>
              </DetailSection>

              {/* Licenses & Certifications */}
              <DetailSection
                title="Licenses & Certifications"
                icon={IdentificationIcon}
                description="Professional licenses and certification numbers"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        WSIB # (Optional)
                      </label>
                      <input
                        type="text"
                        value={wsibNumber}
                        onChange={(e) => setWsibNumber(e.target.value)}
                        placeholder="Enter WSIB number"
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        HST # (Optional)
                      </label>
                      <input
                        type="text"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        placeholder="Enter HST number"
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Driver's License Class (Optional)
                      </label>
                      <input
                        type="text"
                        value={driversLicenseClass}
                        onChange={(e) => setDriversLicenseClass(e.target.value)}
                        placeholder="Enter license class"
                        className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Vehicle Types (Optional)
                    </label>
                    <VehicleTypesMultiSelect
                      value={vehicleTypes}
                      onChange={setVehicleTypes}
                      error={errors.vehicleTypes}
                      required={false}
                      helperText="Select all vehicle types the associate has access to"
                      onUnauthorized={onUnauthorized}
                    />
                  </div>
                </div>
              </DetailSection>

              {/* Emergency Contact */}
              <DetailSection
                title="Emergency Contact"
                icon={UserGroupIcon}
                description="Contact information for emergencies"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Contact Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="Enter emergency contact name"
                      className={`w-full px-3 py-2 sm:py-2.5 border ${
                        errors.emergencyContactName
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.emergencyContactName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Relationship <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={emergencyContactRelationship}
                      onChange={(e) =>
                        setEmergencyContactRelationship(e.target.value)
                      }
                      placeholder="Enter relationship"
                      className={`w-full px-3 py-2 sm:py-2.5 border ${
                        errors.emergencyContactRelationship
                          ? "border-red-500"
                          : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                    />
                    {errors.emergencyContactRelationship && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.emergencyContactRelationship}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                        className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                          errors.emergencyContactTelephone
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                    </div>
                    {errors.emergencyContactTelephone && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.emergencyContactTelephone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
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
                        className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* System Settings */}
              <DetailSection
                title="System Settings"
                icon={ComputerDesktopIcon}
                description="Language preferences and system configuration"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Preferred Language{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <LanguageIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={preferredLanguage}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border ${
                            errors.preferredLanguage
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors bg-white`}
                        >
                          <option value="English">English</option>
                          <option value="French">French</option>
                        </select>
                      </div>
                      {errors.preferredLanguage && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.preferredLanguage}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter any additional notes or description about this associate"
                      rows={4}
                      maxLength={638}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Internal notes about this associate (not visible to them)
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Login Credentials */}
              <DetailSection
                title="Login Credentials"
                icon={LockClosedIcon}
                description="Set up authentication for the associate's account"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Password (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Leave blank to auto-generate a password
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Confirm Password (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordRepeated}
                        onChange={(e) => setPasswordRepeated(e.target.value)}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border ${
                          errors.passwordRepeated
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors`}
                      />
                    </div>
                    {errors.passwordRepeated && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.passwordRepeated}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Must match the password above if entered
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/admin/associates/add/step-4" className="flex-1">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Back
                  </button>
                </Link>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default AdminAssociateAddStep5Page;
