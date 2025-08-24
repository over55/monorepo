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
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/tasks"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/task/${tid}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Task Detail
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-2" />
                  Survey
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Task Survey
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Complete the survey questions for this task
          </p>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex items-center justify-start xl:justify-center min-w-max px-2">
              <div className="flex items-center">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <svg
                      className="w-4 h-4 sm:w-6 sm:h-6 text-white"
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
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Task Info
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Complete
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-900">1</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 lg:w-16 h-0.5 bg-gray-300"></div>

                {/* Step 2 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm sm:text-base">
                      2
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Survey Questions
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      In Progress
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-900">Survey</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 lg:w-16 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm sm:text-base">
                      3
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Review & Submit
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Pending
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-500">Review</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base">
                  Please correct the following errors:
                </p>
                <ul className="mt-2 list-disc list-inside text-sm">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>{value}</li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors({})}
                className="text-red-600 hover:text-red-800 ml-2"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <QuestionMarkCircleIcon className="w-5 h-5 mr-2" />
              Survey Questions
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-600">
              Please complete the survey questions below
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Was Survey Conducted */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Was there a survey conducted?
                <span className="text-red-500 ml-1">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Selecting 'Yes' will close this job as success
              </p>
              <div className="space-y-2">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Yes
                  </span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
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
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    No
                  </span>
                </label>
              </div>
              {errors.wasSurveyConducted && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                  {errors.wasSurveyConducted}
                </p>
              )}
            </div>

            {/* Survey Questions - Show if Yes */}
            {wasSurveyConducted === 1 && (
              <div className="mt-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                  Survey Questions
                </h3>

                {/* Job Satisfactory */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Was the quality of the work satisfactory?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasJobSatisfactory"
                        value={1}
                        checked={wasJobSatisfactory === 1}
                        onChange={(e) =>
                          setWasJobSatisfactory(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasJobSatisfactory"
                        value={2}
                        checked={wasJobSatisfactory === 2}
                        onChange={(e) =>
                          setWasJobSatisfactory(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {errors.wasJobSatisfactory && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.wasJobSatisfactory}
                    </p>
                  )}
                </div>

                {/* On Time and Budget */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Was the work completed on time and on budget?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasJobFinishedOnTimeAndOnBudget"
                        value={1}
                        checked={wasJobFinishedOnTimeAndOnBudget === 1}
                        onChange={(e) =>
                          setWasJobFinishedOnTimeAndOnBudget(
                            parseInt(e.target.value),
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasJobFinishedOnTimeAndOnBudget"
                        value={2}
                        checked={wasJobFinishedOnTimeAndOnBudget === 2}
                        onChange={(e) =>
                          setWasJobFinishedOnTimeAndOnBudget(
                            parseInt(e.target.value),
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {errors.wasJobFinishedOnTimeAndOnBudget && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.wasJobFinishedOnTimeAndOnBudget}
                    </p>
                  )}
                </div>

                {/* Associate Punctual */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Was the Associate Member punctual?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasAssociatePunctual"
                        value={1}
                        checked={wasAssociatePunctual === 1}
                        onChange={(e) =>
                          setWasAssociatePunctual(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasAssociatePunctual"
                        value={2}
                        checked={wasAssociatePunctual === 2}
                        onChange={(e) =>
                          setWasAssociatePunctual(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {errors.wasAssociatePunctual && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.wasAssociatePunctual}
                    </p>
                  )}
                </div>

                {/* Associate Professional */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Was the Associate Member professional?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasAssociateProfessional"
                        value={1}
                        checked={wasAssociateProfessional === 1}
                        onChange={(e) =>
                          setWasAssociateProfessional(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wasAssociateProfessional"
                        value={2}
                        checked={wasAssociateProfessional === 2}
                        onChange={(e) =>
                          setWasAssociateProfessional(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {errors.wasAssociateProfessional && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.wasAssociateProfessional}
                    </p>
                  )}
                </div>

                {/* Would Refer */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Would you refer Over55 to a friend or family member?
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wouldCustomerReferOurOrganization"
                        value={1}
                        checked={wouldCustomerReferOurOrganization === 1}
                        onChange={(e) =>
                          setWouldCustomerReferOurOrganization(
                            parseInt(e.target.value),
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="wouldCustomerReferOurOrganization"
                        value={2}
                        checked={wouldCustomerReferOurOrganization === 2}
                        onChange={(e) =>
                          setWouldCustomerReferOurOrganization(
                            parseInt(e.target.value),
                          )
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">No</span>
                    </label>
                  </div>
                  {errors.wouldCustomerReferOurOrganization && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.wouldCustomerReferOurOrganization}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* No Survey Conducted - Show if No */}
            {wasSurveyConducted === 2 && (
              <div className="mt-6 p-4 sm:p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <XCircleIcon className="w-5 h-5 mr-2 text-amber-600" />
                  No Survey Conducted
                </h3>

                {/* Reason Select */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please select why the survey was not conducted
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <select
                    value={noSurveyConductedReason}
                    onChange={(e) =>
                      setNoSurveyConductedReason(parseInt(e.target.value))
                    }
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.noSurveyConductedReason}
                    </p>
                  )}
                </div>

                {/* Other Reason Input */}
                {noSurveyConductedReason === 1 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                    {errors.noSurveyConductedReasonOther && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                        {errors.noSurveyConductedReasonOther}
                      </p>
                    )}
                  </div>
                )}

                {/* Comment Textarea */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write any additional comments here..."
                    rows={5}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Include any additional information here.
                  </p>
                  {errors.comment && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <ExclamationCircleIcon className="w-4 h-4 mr-1" />
                      {errors.comment}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between">
              <Link
                to={`/admin/task/${tid}/survey/step-1`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Step 1
              </Link>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  onClick={onSubmitClick}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save & Continue
                  <ChevronRightIcon className="w-4 h-4 inline ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help Text */}
        <div className="mt-6">
          <Link
            to={`/admin/task/${tid}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
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

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 w-full sm:w-auto"
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
