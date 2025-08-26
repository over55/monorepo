// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSurveyStorage } from "../../../../../services/Services";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

const TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
];

export default function AdminTaskItemSurveyStep2Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const surveyStorage = useSurveyStorage();

  // Get form state from storage
  const formData = surveyStorage.getState();

  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [wasSurveyConducted, setWasSurveyConducted] = useState(
    formData.wasSurveyConducted || 0,
  );
  const [noSurveyConductedReason, setNoSurveyConductedReason] = useState(
    formData.noSurveyConductedReason || 0,
  );
  const [noSurveyConductedReasonOther, setNoSurveyConductedReasonOther] =
    useState(formData.noSurveyConductedReasonOther || "");
  const [comment, setComment] = useState(formData.comment || "");
  const [wasJobSatisfactory, setWasJobSatisfactory] = useState(
    formData.wasJobSatisfactory || 0,
  );
  const [wasJobFinishedOnTimeAndOnBudget, setWasJobFinishedOnTimeAndOnBudget] =
    useState(formData.wasJobFinishedOnTimeAndOnBudget || 0);
  const [wasAssociatePunctual, setWasAssociatePunctual] = useState(
    formData.wasAssociatePunctual || 0,
  );
  const [wasAssociateProfessional, setWasAssociateProfessional] = useState(
    formData.wasAssociateProfessional || 0,
  );
  const [
    wouldCustomerReferOurOrganization,
    setWouldCustomerReferOurOrganization,
  ] = useState(formData.wouldCustomerReferOurOrganization || 0);

  // Handle radio button changes without scroll jumps
  const handleRadioChange = (setter, value, e) => {
    e.preventDefault();
    e.stopPropagation();
    const scrollY = window.scrollY;
    setter(value);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollY);
    });
  };

  // Section Component with Dark Header
  const DetailSection = ({
    title,
    icon: Icon,
    variant = "default",
    children,
  }) => {
    const variantStyles = {
      default: "bg-gray-700",
      success: "bg-green-700",
      warning: "bg-amber-700",
    };

    return (
      <div className="rounded-lg shadow-sm mb-4 sm:mb-6">
        <div
          className={`${variantStyles[variant]} px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg`}
        >
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
  };

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // Validation
    if (
      wasSurveyConducted === undefined ||
      wasSurveyConducted === null ||
      wasSurveyConducted === "" ||
      wasSurveyConducted === 0
    ) {
      newErrors["wasSurveyConducted"] = "This field is required";
      hasErrors = true;
    }

    if (wasSurveyConducted === 1) {
      if (
        wasJobSatisfactory === undefined ||
        wasJobSatisfactory === null ||
        wasJobSatisfactory === "" ||
        wasJobSatisfactory === 0
      ) {
        newErrors["wasJobSatisfactory"] = "This field is required";
        hasErrors = true;
      }
      if (
        wasJobFinishedOnTimeAndOnBudget === undefined ||
        wasJobFinishedOnTimeAndOnBudget === null ||
        wasJobFinishedOnTimeAndOnBudget === "" ||
        wasJobFinishedOnTimeAndOnBudget === 0
      ) {
        newErrors["wasJobFinishedOnTimeAndOnBudget"] = "This field is required";
        hasErrors = true;
      }
      if (
        wasAssociatePunctual === undefined ||
        wasAssociatePunctual === null ||
        wasAssociatePunctual === "" ||
        wasAssociatePunctual === 0
      ) {
        newErrors["wasAssociatePunctual"] = "This field is required";
        hasErrors = true;
      }
      if (
        wasAssociateProfessional === undefined ||
        wasAssociateProfessional === null ||
        wasAssociateProfessional === "" ||
        wasAssociateProfessional === 0
      ) {
        newErrors["wasAssociateProfessional"] = "This field is required";
        hasErrors = true;
      }
      if (
        wouldCustomerReferOurOrganization === undefined ||
        wouldCustomerReferOurOrganization === null ||
        wouldCustomerReferOurOrganization === "" ||
        wouldCustomerReferOurOrganization === 0
      ) {
        newErrors["wouldCustomerReferOurOrganization"] =
          "This field is required";
        hasErrors = true;
      }
    }

    if (wasSurveyConducted === 2) {
      if (
        noSurveyConductedReason === undefined ||
        noSurveyConductedReason === null ||
        noSurveyConductedReason === "" ||
        noSurveyConductedReason === 0
      ) {
        newErrors["noSurveyConductedReason"] = "This field is required";
        hasErrors = true;
      } else {
        if (noSurveyConductedReason === 1) {
          if (
            noSurveyConductedReasonOther === undefined ||
            noSurveyConductedReasonOther === null ||
            noSurveyConductedReasonOther === "" ||
            noSurveyConductedReasonOther === 0
          ) {
            newErrors["noSurveyConductedReasonOther"] =
              "This field is required";
            hasErrors = true;
          }
        }
      }
      if (comment === undefined || comment === null || comment === "") {
        newErrors["comment"] = "This field is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    surveyStorage.updateState({
      wasSurveyConducted,
      noSurveyConductedReason,
      noSurveyConductedReasonOther,
      comment,
      wasJobSatisfactory,
      wasJobFinishedOnTimeAndOnBudget,
      wasAssociatePunctual,
      wasAssociateProfessional,
      wouldCustomerReferOurOrganization,
    });

    // Navigate to step 3
    navigate(`/admin/task/${tid}/survey/step-3`);
  };

  // Handle cancel
  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    navigate(`/admin/task/${tid}`);
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
                  to="/admin/tasks"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentCheckIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to={`/admin/task/${tid}`}
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  Task Detail
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <DocumentTextIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Survey
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <ClipboardDocumentCheckIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                Task Survey
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <QuestionMarkCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Complete the survey questions for this task
              </p>
            </div>
          </div>
        </div>

        {/* Wizard Steps - Responsive */}
        <div className="mb-6">
          {/* Desktop View */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-green-600"></div>

              {/* Step 2 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Survey</p>
                  <p className="text-xs text-gray-500">In Progress</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Complete</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 2: Survey
                    </p>
                    <p className="text-xs text-gray-500">Answer questions</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">2 of 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display - Responsive */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">
                  Please correct the following errors:
                </p>
                <ul className="mt-2 list-disc list-inside text-xs sm:text-sm">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors({})}
                className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
              >
                <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Actions - Responsive */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                <QuestionMarkCircleIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                Survey Questions
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Was Survey Conducted Section with Dark Header */}
            <DetailSection
              title="Survey Status"
              icon={ClipboardDocumentCheckIcon}
            >
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                  Was there a survey conducted?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">
                  Selecting 'Yes' will close this job as success
                </p>
                <div className="space-y-2">
                  <label className="flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="wasSurveyConducted"
                      value={1}
                      checked={wasSurveyConducted === 1}
                      onChange={(e) =>
                        setWasSurveyConducted(parseInt(e.target.value))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm sm:text-base font-medium text-gray-900">
                      Yes
                    </span>
                  </label>
                  <label className="flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="wasSurveyConducted"
                      value={2}
                      checked={wasSurveyConducted === 2}
                      onChange={(e) =>
                        setWasSurveyConducted(parseInt(e.target.value))
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm sm:text-base font-medium text-gray-900">
                      No
                    </span>
                  </label>
                </div>
                {errors.wasSurveyConducted && (
                  <p className="mt-2 text-xs sm:text-sm text-red-600 flex items-center">
                    <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                    {errors.wasSurveyConducted}
                  </p>
                )}
              </div>
            </DetailSection>

            {/* Survey Questions - Show if Yes */}
            {wasSurveyConducted === 1 && (
              <DetailSection
                title="Survey Questions"
                icon={CheckCircleIcon}
                variant="success"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Job Satisfactory */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Was the quality of the work satisfactory?
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasJobSatisfactory"
                          value={1}
                          checked={wasJobSatisfactory === 1}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasJobSatisfactory,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasJobSatisfactory"
                          value={2}
                          checked={wasJobSatisfactory === 2}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasJobSatisfactory,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.wasJobSatisfactory && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.wasJobSatisfactory}
                      </p>
                    )}
                  </div>

                  {/* On Time and Budget */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Was the work completed on time and on budget?
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasJobFinishedOnTimeAndOnBudget"
                          value={1}
                          checked={wasJobFinishedOnTimeAndOnBudget === 1}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasJobFinishedOnTimeAndOnBudget,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasJobFinishedOnTimeAndOnBudget"
                          value={2}
                          checked={wasJobFinishedOnTimeAndOnBudget === 2}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasJobFinishedOnTimeAndOnBudget,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.wasJobFinishedOnTimeAndOnBudget && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.wasJobFinishedOnTimeAndOnBudget}
                      </p>
                    )}
                  </div>

                  {/* Associate Punctual */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Was the Associate Member punctual?
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasAssociatePunctual"
                          value={1}
                          checked={wasAssociatePunctual === 1}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasAssociatePunctual,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasAssociatePunctual"
                          value={2}
                          checked={wasAssociatePunctual === 2}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasAssociatePunctual,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.wasAssociatePunctual && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.wasAssociatePunctual}
                      </p>
                    )}
                  </div>

                  {/* Associate Professional */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Was the Associate Member professional?
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasAssociateProfessional"
                          value={1}
                          checked={wasAssociateProfessional === 1}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasAssociateProfessional,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wasAssociateProfessional"
                          value={2}
                          checked={wasAssociateProfessional === 2}
                          onChange={(e) => {
                            handleRadioChange(
                              setWasAssociateProfessional,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.wasAssociateProfessional && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.wasAssociateProfessional}
                      </p>
                    )}
                  </div>

                  {/* Would Refer */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Would you refer Over55 to a friend or family member?
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wouldCustomerReferOurOrganization"
                          value={1}
                          checked={wouldCustomerReferOurOrganization === 1}
                          onChange={(e) => {
                            handleRadioChange(
                              setWouldCustomerReferOurOrganization,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="wouldCustomerReferOurOrganization"
                          value={2}
                          checked={wouldCustomerReferOurOrganization === 2}
                          onChange={(e) => {
                            handleRadioChange(
                              setWouldCustomerReferOurOrganization,
                              parseInt(e.target.value),
                              e,
                            );
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="ml-2 text-sm sm:text-base text-gray-700 select-none">
                          No
                        </span>
                      </label>
                    </div>
                    {errors.wouldCustomerReferOurOrganization && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.wouldCustomerReferOurOrganization}
                      </p>
                    )}
                  </div>
                </div>
              </DetailSection>
            )}

            {/* No Survey Conducted - Show if No */}
            {wasSurveyConducted === 2 && (
              <DetailSection
                title="No Survey Conducted"
                icon={XCircleIcon}
                variant="warning"
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Reason Select */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Please select why the survey was not conducted
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={noSurveyConductedReason}
                      onChange={(e) =>
                        setNoSurveyConductedReason(parseInt(e.target.value))
                      }
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    >
                      {TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS.map(
                        (option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ),
                      )}
                    </select>
                    {errors.noSurveyConductedReason && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.noSurveyConductedReason}
                      </p>
                    )}
                  </div>

                  {/* Other Reason Input */}
                  {noSurveyConductedReason === 1 && (
                    <div>
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Please specify the reason
                        <span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        value={noSurveyConductedReasonOther}
                        onChange={(e) =>
                          setNoSurveyConductedReasonOther(e.target.value)
                        }
                        placeholder="Enter the specific reason..."
                        className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                      />
                      {errors.noSurveyConductedReasonOther && (
                        <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                          <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                          {errors.noSurveyConductedReasonOther}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Comment Textarea */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Comment
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write any additional comments here..."
                      rows={5}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Include any additional information here.
                    </p>
                    {errors.comment && (
                      <p className="mt-1 text-xs sm:text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                        {errors.comment}
                      </p>
                    )}
                  </div>
                </div>
              </DetailSection>
            )}

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
              <Link
                to={`/admin/task/${tid}/survey/step-1`}
                className="order-2 sm:order-1"
              >
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white border-gray-300 hover:bg-gray-50 transition-colors">
                  <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                  Back to Step 1
                </button>
              </Link>
              <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                <button
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                  Cancel
                </button>
                <button
                  onClick={onSubmitClick}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Save & Continue
                  <ChevronRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-6">
          <Link
            to={`/admin/task/${tid}`}
            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Back to Task Detail
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Your survey responses will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
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
