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
} from "@heroicons/react/24/outline";
import {
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/Form";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import { STAFF_GENDER_OTHER } from "../../../../constants/Staff";

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
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/staff"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Staff</span>
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Add New Staff Member
          </h1>
        </div>

        {/* Wizard Steps - Responsive Container */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="inline-flex items-center min-w-max px-2 sm:px-0">
            {/* Steps 1-5 Complete */}
            {[1, 2, 3, 4, 5].map((step, index) => (
              <React.Fragment key={step}>
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                      {step === 1 && "Search"}
                      {step === 2 && "Type"}
                      {step === 3 && "Contact"}
                      {step === 4 && "Address"}
                      {step === 5 && "Account"}
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Complete
                    </p>
                  </div>
                </div>
                {index < 6 && (
                  <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-green-600 flex-shrink-0"></div>
                )}
              </React.Fragment>
            ))}

            {/* Step 6 - Active */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                <span className="text-white font-semibold text-sm sm:text-base">
                  6
                </span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-900 whitespace-nowrap">
                  Metrics
                </p>
                <p className="text-xs text-gray-500 hidden lg:block">
                  Performance
                </p>
              </div>
            </div>

            <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300 flex-shrink-0"></div>

            {/* Step 7 Inactive */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                <span className="text-gray-600 font-semibold text-sm sm:text-base">
                  7
                </span>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm font-medium text-gray-500 whitespace-nowrap">
                  Comments
                </p>
                <p className="text-xs text-gray-400 hidden lg:block">Notes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              <span className="text-sm sm:text-base">{errors.general}</span>
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
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2" />
              Metrics Information
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
                <div className="space-y-6 sm:space-y-8">
                  {/* Personal Information Section */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <UserIcon className="w-5 h-5 mr-2 text-purple-600" />
                      Personal Information
                    </h3>

                    <div className="space-y-4">
                      {/* Tags */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <TagIcon className="w-4 h-4 inline mr-1" />
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
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <IdentificationIcon className="w-4 h-4 inline mr-1" />
                          Do you identify as belonging to any of the following
                          groups? (Optional)
                        </label>
                        <div className="space-y-2 ml-2 sm:ml-6">
                          {IDENTIFY_AS_OPTIONS.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center text-sm text-gray-700"
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

                      {/* How did you hear about us */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <QuestionMarkCircleIcon className="w-4 h-4 inline mr-1" />
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
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.howDidYouHearAboutUsOther
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.howDidYouHearAboutUsOther && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.howDidYouHearAboutUsOther}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <UserIcon className="w-4 h-4 inline mr-1" />
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={String(gender)}
                          onChange={(e) => setGender(parseInt(e.target.value))}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.gender ? "border-red-500" : "border-gray-300"
                          }`}
                        >
                          {GENDER_OPTIONS_WITH_EMPTY_OPTION.map((option) => (
                            <option
                              key={option.value}
                              value={String(option.value)}
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.gender}
                          </p>
                        )}
                      </div>

                      {gender === STAFF_GENDER_OTHER && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Gender (Other){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={genderOther}
                            onChange={(e) => setGenderOther(e.target.value)}
                            placeholder="Please specify"
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                              errors.genderOther
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.genderOther && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.genderOther}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Birth Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Birth Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.birthDate
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.birthDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.birthDate}
                          </p>
                        )}
                      </div>

                      {/* Join Date */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <CalendarIcon className="w-4 h-4 inline mr-1" />
                          Join Date
                        </label>
                        <input
                          type="date"
                          value={joinDate}
                          onChange={(e) => setJoinDate(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          The date this staff member joined the organization
                        </p>
                      </div>

                      {/* Additional Comments */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <ChatBubbleBottomCenterTextIcon className="w-4 h-4 inline mr-1" />
                          Additional Comment (Optional)
                        </label>
                        <textarea
                          value={additionalComment}
                          onChange={(e) => setAdditionalComment(e.target.value)}
                          placeholder="Enter any additional comments or notes about this staff member"
                          rows={4}
                          maxLength={638}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {additionalComment.length}/638 characters
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions - Responsive */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to="/admin/staff/add/step-5"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
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
