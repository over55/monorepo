// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  TagIcon,
  IdentificationIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  UserIcon,
  QuestionMarkCircleIcon,
  UsersIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/business/selects";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import { STAFF_GENDER_OTHER } from "../../../../constants/Staff";

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

function AdminStaffAddStep6Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const wizardState = wizardStorage.getWizardState();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form data
  const [tags, setTags] = useState(wizardState.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(
    wizardState.howDidYouHearAboutUsID || "",
  );
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(wizardState.isHowDidYouHearAboutUsOther || false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(
    wizardState.howDidYouHearAboutUsOther || "",
  );
  const [birthDate, setBirthDate] = useState(wizardState.birthDate || "");
  const [joinDate, setJoinDate] = useState(
    wizardState.joinDate || new Date().toISOString().split("T")[0],
  );
  const [gender, setGender] = useState(wizardState.gender || 0);
  const [genderOther, setGenderOther] = useState(wizardState.genderOther || "");
  const [additionalComment, setAdditionalComment] = useState(
    wizardState.additionalComment || "",
  );
  const [identifyAs, setIdentifyAs] = useState(wizardState.identifyAs || []);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    wizardStorage.clearWizardState();
    navigate("/admin/staff");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    // Basic validation
    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID =
        "Please specify how you heard about us";
      hasErrors = true;
    } else if (
      isHowDidYouHearAboutUsOther &&
      !howDidYouHearAboutUsOther.trim()
    ) {
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
      // Scroll to top to show errors
      window.scrollTo(0, 0);
      return;
    }

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

    navigate("/admin/staff/add/step-7");
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
            Add metrics and demographic information
          </p>
        </div>

        {/* Wizard Steps - Mobile Simplified */}
        <div className="mb-4 sm:mb-6">
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 6: Metrics
                  </p>
                  <p className="text-xs text-gray-500">Performance Data</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">6 of 7</div>
            </div>
          </div>

          {/* Desktop Wizard Steps */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Steps 1-5 Complete */}
              {[1, 2, 3, 4, 5].map((step, index) => (
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
                        {step === 5 && "Account"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 6 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 6 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Metrics</p>
                  <p className="text-xs text-gray-500">Performance</p>
                </div>
              </div>

              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 7 Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Comments</p>
                  <p className="text-xs text-gray-400">Notes</p>
                </div>
              </div>
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
              {/* Tags and Identification Section */}
              <DetailSection title="Tags & Identification" icon={TagIcon}>
                <div className="space-y-4">
                  {/* Tags */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Tags (Optional)
                    </label>
                    <TagsMultiSelect
                      value={tags}
                      onChange={setTags}
                      error={errors.tags}
                      required={false}
                      helperText="Select tags to categorize this staff member"
                      onUnauthorized={onUnauthorized}
                    />
                  </div>

                  {/* Identity Groups */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Do you identify as belonging to any of the following
                      groups? (Optional)
                    </label>
                    <div className="space-y-2 ml-2 sm:ml-6">
                      {IDENTIFY_AS_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center text-xs sm:text-sm text-gray-700"
                        >
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={identifyAs.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setIdentifyAs([
                                  ...identifyAs,
                                  parseInt(e.target.value),
                                ]);
                              } else {
                                setIdentifyAs(
                                  identifyAs.filter(
                                    (id) => id !== parseInt(e.target.value),
                                  ),
                                );
                              }
                            }}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </DetailSection>

              {/* Discovery & Marketing Section */}
              <DetailSection
                title="Discovery & Marketing"
                icon={QuestionMarkCircleIcon}
              >
                <div className="space-y-4">
                  {/* How did you hear about us */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      How did you hear about us?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <HowHearAboutUsSelect
                      value={howDidYouHearAboutUsID}
                      onChange={handleHowHearChange}
                      onOtherDetected={handleHowHearOtherDetected}
                      error={errors.howDidYouHearAboutUsID}
                      required={true}
                      helperText="Tell us how you discovered our organization"
                      onUnauthorized={onUnauthorized}
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
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
              <DetailSection title="Personal Information" icon={UserIcon}>
                <div className="space-y-4">
                  {/* Gender */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={String(gender)}
                      onChange={(e) => setGender(parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {GENDER_OPTIONS_WITH_EMPTY_OPTION.map((option) => (
                        <option key={option.value} value={String(option.value)}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.gender}
                      </p>
                    )}
                  </div>

                  {gender === STAFF_GENDER_OTHER && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Gender (Other) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={genderOther}
                        onChange={(e) => setGenderOther(e.target.value)}
                        placeholder="Please specify"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.genderOther
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
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
                      Birth Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                          errors.birthDate
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                      />
                    </div>
                    {errors.birthDate && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600">
                        {errors.birthDate}
                      </p>
                    )}
                  </div>

                  {/* Join Date */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Join Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={joinDate}
                        onChange={(e) => setJoinDate(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      The date this staff member joined the organization
                    </p>
                  </div>
                </div>
              </DetailSection>

              {/* Additional Comments Section */}
              <DetailSection
                title="Additional Information"
                icon={ChatBubbleBottomCenterTextIcon}
              >
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Additional Comment (Optional)
                  </label>
                  <textarea
                    value={additionalComment}
                    onChange={(e) => setAdditionalComment(e.target.value)}
                    placeholder="Enter any additional comments or notes about this staff member"
                    rows={4}
                    maxLength={638}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {additionalComment.length}/638 characters
                  </p>
                </div>
              </DetailSection>
            </div>

            {/* Form Actions - Responsive */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/admin/staff/add/step-5"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-3 sm:order-1"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Link>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-2"
              >
                <XMarkIcon className="w-4 h-4 mr-2" />
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 order-1 sm:order-3"
              >
                Next
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
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
              <p className="text-sm text-gray-600">
                Your Staff record will be cancelled and your work will be lost.
                This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
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

export default AdminStaffAddStep6Page;
