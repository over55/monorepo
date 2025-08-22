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
} from "@heroicons/react/24/outline";
import {
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
  VehicleTypesMultiSelect,
  ServiceFeeSelect,
} from "../../../../components/business/selects";

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

        // Restore password fields from sessionStorage
        // We'll store them encrypted/hashed but for now just restore them
        setPassword(associateState.password || "");
        setPasswordRepeated(associateState.passwordRepeated || "");
      } else {
        // No state found, redirect back to step 1
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

    // Simple password validation - only validate if password is entered
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
      // Scroll to top to show errors
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
    // Clear error when user selects a value
    if (errors.serviceFeeId) {
      setErrors({ ...errors, serviceFeeId: null });
    }
  };

  const handleServiceFeeOtherDetected = (isOther) => {
    setIsServiceFeeOther(isOther);
    if (!isOther) {
      setServiceFeeOther(""); // Clear other field if not "Other"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/associates"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Associates
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-7 h-7 mr-3 text-blue-600" />
            Add New Associate
          </h1>
        </div>

        {/* Wizard Steps - Responsive */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex items-center justify-start xl:justify-center min-w-max px-2">
            <div className="flex items-center">
              {/* Steps 1-4 Complete */}
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Type"}
                        {step === 3 && "Contact"}
                        {step === 4 && "Address"}
                      </p>
                      <p className="text-xs text-gray-500 hidden lg:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 6 && (
                    <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    5
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Account
                  </p>
                  <p className="text-xs text-gray-500 hidden lg:block">
                    Settings
                  </p>
                </div>
              </div>

              <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

              {/* Steps 6-7 Inactive */}
              {[6, 7].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full">
                      <span className="text-gray-600 font-semibold text-sm sm:text-base">
                        {step}
                      </span>
                    </div>
                    <div className="ml-2 sm:ml-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">
                        {step === 6 && "Metrics"}
                        {step === 7 && "Comments"}
                      </p>
                      <p className="text-xs text-gray-400 hidden lg:block">
                        {step === 6 && "Performance"}
                        {step === 7 && "Notes"}
                      </p>
                    </div>
                  </div>
                  {index === 0 && (
                    <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              {errors.general}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentIcon className="w-5 h-5 mr-2" />
              Account Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            ) : (
              <form onSubmit={onSubmitClick} className="max-w-3xl mx-auto">
                <div className="space-y-8">
                  {/* Skill Sets Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                      Skill Sets
                    </h3>
                    <SkillSetsMultiSelect
                      value={skillSets}
                      onChange={setSkillSets}
                      error={errors.skillSets}
                      required={true}
                      helperText="Select all skill sets that apply to this associate"
                      onUnauthorized={onUnauthorized}
                    />
                  </div>

                  {/* Insurance Requirements Section */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <ShieldCheckIcon className="w-5 h-5 mr-2 text-green-600" />
                      Insurance Requirements
                    </h3>
                    <InsuranceRequirementsMultiSelect
                      value={insuranceRequirements}
                      onChange={setInsuranceRequirements}
                      error={errors.insuranceRequirements}
                      required={true}
                      helperText="Select all insurance requirements for this associate"
                      onUnauthorized={onUnauthorized}
                    />
                  </div>

                  {/* Financial Information */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CurrencyDollarIcon className="w-5 h-5 mr-2 text-green-600" />
                      Financial Information
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Hourly Rate (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            value={hourlySalaryDesired}
                            onChange={(e) =>
                              setHourlySalaryDesired(e.target.value)
                            }
                            placeholder="$ / hr"
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Limitations or Special Considerations (Optional)
                        </label>
                        <textarea
                          value={limitSpecial}
                          onChange={(e) => setLimitSpecial(e.target.value)}
                          placeholder="Enter any limitations or special considerations"
                          rows={3}
                          maxLength={638}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <ServiceFeeSelect
                        value={serviceFeeId}
                        onChange={handleServiceFeeChange}
                        onOtherDetected={handleServiceFeeOtherDetected}
                        error={errors.serviceFeeId}
                        required={true}
                        label="Service Fee"
                        helperText="Select the applicable service fee for this associate"
                        onUnauthorized={onUnauthorized}
                      />

                      {isServiceFeeOther && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Please specify other service fee{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={serviceFeeOther}
                            onChange={(e) => setServiceFeeOther(e.target.value)}
                            placeholder="Enter custom service fee details"
                            className={`w-full px-3 py-2 border ${
                              errors.serviceFeeOther
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                          {errors.serviceFeeOther && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.serviceFeeOther}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Important Dates */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <CalendarDaysIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Important Dates
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Member Dues Date{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={duesDate}
                          onChange={(e) => setDuesDate(e.target.value)}
                          className={`w-full px-3 py-2 border ${
                            errors.duesDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.duesDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.duesDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Police Check Expiry{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={policeCheck}
                          onChange={(e) => setPoliceCheck(e.target.value)}
                          className={`w-full px-3 py-2 border ${
                            errors.policeCheck
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.policeCheck && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.policeCheck}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Commercial Insurance Expiry{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={commercialInsuranceExpiryDate}
                          onChange={(e) =>
                            setCommercialInsuranceExpiryDate(e.target.value)
                          }
                          className={`w-full px-3 py-2 border ${
                            errors.commercialInsuranceExpiryDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.commercialInsuranceExpiryDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.commercialInsuranceExpiryDate}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Auto Insurance Expiry (Optional)
                        </label>
                        <input
                          type="date"
                          value={autoInsuranceExpiryDate}
                          onChange={(e) =>
                            setAutoInsuranceExpiryDate(e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          WSIB Insurance Date (Optional)
                        </label>
                        <input
                          type="date"
                          value={wsibInsuranceDate}
                          onChange={(e) => setWsibInsuranceDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Licenses & Certifications */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <IdentificationIcon className="w-5 h-5 mr-2 text-orange-600" />
                      Licenses & Certifications
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          WSIB # (Optional)
                        </label>
                        <input
                          type="text"
                          value={wsibNumber}
                          onChange={(e) => setWsibNumber(e.target.value)}
                          placeholder="Enter WSIB number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          HST # (Optional)
                        </label>
                        <input
                          type="text"
                          value={taxId}
                          onChange={(e) => setTaxId(e.target.value)}
                          placeholder="Enter HST number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Driver's License Class (Optional)
                        </label>
                        <input
                          type="text"
                          value={driversLicenseClass}
                          onChange={(e) =>
                            setDriversLicenseClass(e.target.value)
                          }
                          placeholder="Enter license class"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
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

                  {/* Emergency Contact */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserGroupIcon className="w-5 h-5 mr-2 text-red-600" />
                      Emergency Contact
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Contact Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={emergencyContactName}
                          onChange={(e) =>
                            setEmergencyContactName(e.target.value)
                          }
                          placeholder="Enter emergency contact name"
                          className={`w-full px-3 py-2 border ${
                            errors.emergencyContactName
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.emergencyContactName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.emergencyContactName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.emergencyContactRelationship && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.emergencyContactRelationship}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
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
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        {errors.emergencyContactTelephone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.emergencyContactTelephone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Alternative Phone (Optional)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <PhoneIcon className="h-5 w-5 text-gray-400" />
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
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Settings */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <ComputerDesktopIcon className="w-5 h-5 mr-2 text-indigo-600" />
                      System Settings
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Preferred Language{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LanguageIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <select
                            value={preferredLanguage}
                            onChange={(e) =>
                              setPreferredLanguage(e.target.value)
                            }
                            className={`w-full pl-10 pr-3 py-2 border ${
                              errors.preferredLanguage
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                          >
                            <option value="English">English</option>
                            <option value="French">French</option>
                          </select>
                        </div>
                        {errors.preferredLanguage && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.preferredLanguage}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter any additional notes or description about this associate"
                          rows={4}
                          maxLength={638}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Any internal notes about this associate (not visible
                          to the associate)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Login Credentials */}
                  <div className="pt-6 border-t">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <LockClosedIcon className="w-5 h-5 mr-2 text-gray-600" />
                      Login Credentials
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Password (Optional)
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter password (min 8 characters)"
                          className={`w-full px-3 py-2 border ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.password}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Leave blank to auto-generate a password
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Confirm Password (Optional)
                        </label>
                        <input
                          type="password"
                          value={passwordRepeated}
                          onChange={(e) => setPasswordRepeated(e.target.value)}
                          placeholder="Repeat password"
                          className={`w-full px-3 py-2 border ${
                            errors.passwordRepeated
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.passwordRepeated && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.passwordRepeated}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Must match the password above if entered
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/admin/associates/add/step-4"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAssociateAddStep5Page;
