// File: web/workery-frontend/src/pages/Admin/Customer/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  UsersIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  TagIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  LanguageIcon,
  LockClosedIcon,
  InformationCircleIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import HowHearAboutUsSelect from "../../../../components/business/selects/HowHearAboutUsSelect";
import TagsMultiSelect from "../../../../components/business/selects/TagsMultiSelect";

// Gender options - Reordered with "Other" as third option
const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 1, label: "Other" },
];

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

function AdminCustomerAddStep5Page() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    return saved ? JSON.parse(saved) : {};
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [tags, setTags] = useState(customerData.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(
    customerData.howDidYouHearAboutUsID || "",
  );
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(customerData.isHowDidYouHearAboutUsOther || false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(
    customerData.howDidYouHearAboutUsOther || "",
  );
  const [birthDate, setBirthDate] = useState(customerData.birthDate || "");
  const [joinDate, setJoinDate] = useState(
    customerData.joinDate || new Date().toISOString().split("T")[0],
  );
  const [gender, setGender] = useState(customerData.gender || 0);
  const [genderOther, setGenderOther] = useState(
    customerData.genderOther || "",
  );
  const [additionalComment, setAdditionalComment] = useState(
    customerData.additionalComment || "",
  );
  // Default to "English" if no saved preference
  const [preferredLanguage, setPreferredLanguage] = useState(
    customerData.preferredLanguage || "English",
  );
  const [password, setPassword] = useState(customerData.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(
    customerData.passwordRepeated || "",
  );

  // Check authentication and load existing state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    window.scrollTo(0, 0);
    // Check if we have customer data, if not redirect to step 1
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    if (!saved) {
      navigate("/admin/customers/add/step-1");
    }
  }, [authManager, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID =
        "Please specify how you heard about us";
    } else if (
      isHowDidYouHearAboutUsOther &&
      !howDidYouHearAboutUsOther.trim()
    ) {
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
  };

  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");
    navigate("/admin/customers");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      console.log("onSubmitClick: Ending with error.", formErrors);
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

    sessionStorage.setItem(
      "WORKERY_CUSTOMER_CREATION_STATE",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    console.log("onSubmitClick: Ending with success.");
    navigate("/admin/customers/add/step-6");
  };

  const handleHowHearChange = (value) => {
    setHowDidYouHearAboutUsID(value);
    // Clear error when user selects a value
    if (errors.howDidYouHearAboutUsID) {
      setErrors({ ...errors, howDidYouHearAboutUsID: null });
    }
  };

  const handleHowHearOtherDetected = (isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther(""); // Clear other field if not "Other"
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
                  to="/admin/customers"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Customers</span>
                    <span className="sm:hidden">Cust</span>
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
            Add New Customer
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Internal metrics and preferences
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
                    Step 5: Comments
                  </p>
                  <p className="text-xs text-gray-500">Notes</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">5 of 7</div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-4 Complete */}
              {[
                { num: 1, title: "Search", subtitle: "Complete" },
                { num: 2, title: "Type", subtitle: "Complete" },
                { num: 3, title: "Contact", subtitle: "Complete" },
                { num: 4, title: "Address", subtitle: "Complete" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  {index > 0 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Comments</p>
                  <p className="text-xs text-gray-500">Notes</p>
                </div>
              </div>

              {/* Remaining Steps */}
              {[
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Review", subtitle: "Confirm" },
              ].map((step, index) => (
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

        {/* Main Form */}
        {isLoading ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Submitting...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmitClick}>
            <div className="space-y-0">
              {/* Discovery & Tags Section */}
              <DetailSection
                title="Discovery & Classification"
                icon={QuestionMarkCircleIcon}
                description="How did they find us and how we categorize them"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Tags */}
                  <div>
                    <TagsMultiSelect
                      value={tags}
                      onChange={setTags}
                      error={errors.tags}
                      required={false}
                      label="Tags (Optional)"
                      onUnauthorized={() =>
                        navigate("/login?unauthorized=true")
                      }
                    />
                  </div>

                  {/* How did you hear about us */}
                  <div>
                    <HowHearAboutUsSelect
                      value={howDidYouHearAboutUsID}
                      onChange={handleHowHearChange}
                      onOtherDetected={handleHowHearOtherDetected}
                      error={errors.howDidYouHearAboutUsID}
                      required={true}
                      label="How did you hear about us?"
                      onUnauthorized={() =>
                        navigate("/login?unauthorized=true")
                      }
                    />
                  </div>

                  {/* Show additional input field if "Other" is selected */}
                  {isHowDidYouHearAboutUsOther && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        How did you hear about us? (Other){" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={howDidYouHearAboutUsOther}
                        onChange={(e) =>
                          setHowDidYouHearAboutUsOther(e.target.value)
                        }
                        placeholder="Please specify"
                        className={`w-full px-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                          errors.howDidYouHearAboutUsOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.howDidYouHearAboutUsOther && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.howDidYouHearAboutUsOther}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </DetailSection>

              {/* Personal Information Section */}
              <DetailSection
                title="Personal Information"
                icon={UserIcon}
                description="Demographic and preference details"
              >
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Gender */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <select
                          value={String(gender)}
                          onChange={(e) => setGender(parseInt(e.target.value))}
                          className={`w-full pl-10 pr-8 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base transition-colors ${
                            errors.gender ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          {GENDER_OPTIONS.map((option) => (
                            <option
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.gender && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.gender}
                        </p>
                      )}
                    </div>

                    {/* Gender Other field */}
                    {gender === 1 && (
                      <div>
                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                          Gender (Other) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={genderOther}
                            onChange={(e) => setGenderOther(e.target.value)}
                            placeholder="Please specify"
                            className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                              errors.genderOther
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                        </div>
                        {errors.genderOther && (
                          <p className="mt-1 text-xs sm:text-sm text-red-600">
                            {errors.genderOther}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Birth Date */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Birth Date (Optional)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                        />
                      </div>
                    </div>

                    {/* Join Date */}
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Join Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={joinDate}
                          onChange={(e) => setJoinDate(e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                            errors.joinDate
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        This indicates when the user joined the workery.
                      </p>
                      {errors.joinDate && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600">
                          {errors.joinDate}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <LanguageIcon className="w-4 h-4 inline mr-1" />
                      Preferred Language <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="preferredLanguage"
                          value="English"
                          checked={preferredLanguage === "English"}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                          English
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="preferredLanguage"
                          value="French"
                          checked={preferredLanguage === "French"}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="form-radio h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-xs sm:text-sm font-medium text-gray-700">
                          French
                        </span>
                      </label>
                    </div>
                    {errors.preferredLanguage && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.preferredLanguage}
                      </p>
                    )}
                  </div>

                  {/* Additional Comments */}
                  <div className="border-t pt-4 sm:pt-6">
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      <ChatBubbleBottomCenterTextIcon className="w-4 h-4 inline mr-1" />
                      Additional Comment (Optional)
                    </label>
                    <textarea
                      value={additionalComment}
                      onChange={(e) => setAdditionalComment(e.target.value)}
                      placeholder="Max 638 characters"
                      rows={4}
                      maxLength={638}
                      className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {additionalComment.length}/638 characters
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Login Credentials Section */}
              <DetailSection
                title="Login Credentials"
                icon={LockClosedIcon}
                description="Set up account access (optional)"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Password */}
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
                        placeholder="Leave blank if not setting a password"
                        className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                          errors.password ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  {/* Password Repeated */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Password Repeated (Optional)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={passwordRepeated}
                        onChange={(e) => setPasswordRepeated(e.target.value)}
                        placeholder="Repeat password here"
                        className={`w-full pl-10 pr-3 py-2 sm:py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-colors ${
                          errors.passwordRepeated
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.passwordRepeated && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.passwordRepeated}
                      </p>
                    )}
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Leave password fields empty if you don't want to set up login
                  credentials at this time.
                </p>
              </DetailSection>

              {/* Form Actions */}
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <Link to="/admin/customers/add/step-4" className="flex-1">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Back
                  </button>
                </Link>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Cancel Confirmation Modal - Responsive */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Your Customer record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
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
    </div>
  );
}

export default AdminCustomerAddStep5Page;
