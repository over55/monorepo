// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTaskManager,
  useSurveyStorage,
} from "../../../../../services/Services";
import {
  ChartBarIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  DocumentTextIcon,
  UserIcon,
  BriefcaseIcon,
  ChatBubbleBottomCenterTextIcon,
  CalendarIcon,
  DocumentCheckIcon,
} from "@heroicons/react/24/outline";

const TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
];

export default function AdminTaskItemSurveyStep3Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const surveyStorage = useSurveyStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get form state from storage
  const formData = surveyStorage.getState();

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (mounted) {
        setFetching(true);
        try {
          const taskData = await taskManager.getTaskDetail(tid, () => {
            navigate("/login?unauthorized=true");
          });
          setTask(taskData);
        } catch (error) {
          console.error("Failed to fetch task details:", error);
          setErrors(error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [tid]);

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");
    console.log("onSubmitClick: task:", task);

    const payload = {
      task_id: tid,
      task_item_id: tid,
      was_survey_conducted: formData.wasSurveyConducted,
      no_survey_conducted_reason: formData.noSurveyConductedReason,
      no_survey_conducted_reason_other: formData.noSurveyConductedReasonOther,
      comment: formData.comment,
      was_job_satisfactory: formData.wasJobSatisfactory,
      was_job_finished_on_time_and_on_budget:
        formData.wasJobFinishedOnTimeAndOnBudget,
      was_associate_punctual: formData.wasAssociatePunctual,
      was_associate_professional: formData.wasAssociateProfessional,
      would_customer_refer_our_organization:
        formData.wouldCustomerReferOurOrganization,
    };

    // If no survey was conducted, remove survey-specific fields
    if (formData.wasSurveyConducted === 2) {
      console.log("onSubmitClick: no survey entered");
      delete payload.was_job_satisfactory;
      delete payload.was_job_finished_on_time_and_on_budget;
      delete payload.was_associate_punctual;
      delete payload.was_associate_professional;
      delete payload.would_customer_refer_our_organization;
    }

    console.log("onSubmitClick: payload:", payload);

    setIsSubmitting(true);
    setErrors({});

    try {
      await taskManager.submitSurvey(payload, () => {
        navigate("/login?unauthorized=true");
      });

      // Clear the wizard state
      surveyStorage.clearState();

      // Navigate to order detail page
      if (task && task.orderWjid) {
        navigate(`/admin/order/${task.orderWjid}`);
      } else {
        navigate("/admin/tasks");
      }
    } catch (error) {
      console.error("Failed to submit survey:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonLabel = (value) => {
    const option = TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS.find(
      (opt) => opt.value === value,
    );
    return option ? option.label : "";
  };

  const renderResponseBadge = (value) => {
    if (value === 1) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckIcon className="w-3 h-3 mr-1" />
          Yes
        </span>
      );
    } else if (value === 2) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg
            className="w-3 h-3 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          No
        </span>
      );
    }
    return <span className="text-gray-500">-</span>;
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading task details...</span>
          </div>
        </div>
      </div>
    );
  }

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
                  to="/admin/tasks"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Tasks</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <DocumentCheckIcon className="w-4 h-4 mr-2" />
                  Survey
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Task Survey
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Survey
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Complete
                  </p>
                </div>
              </div>
              <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Details
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Complete
                  </p>
                </div>
              </div>
              <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    3
                  </span>
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Review
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Submit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View (below 768px) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 3 of 3
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-1"></div>
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Review and Submit
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Please carefully review the following survey details. If
              everything looks correct, click the <strong>Submit</strong> button
              to save the survey.
            </p>

            {errors && errors.message && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.message}</span>
              </div>
            )}

            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting survey...</span>
              </div>
            ) : (
              task && (
                <div className="max-w-3xl mx-auto">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Task Information Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <DocumentTextIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                          Task Information
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Type:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              Order Completion
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Job #:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <Link
                                to={`/admin/order/${task.orderWjid}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.orderWjid}
                              </Link>
                            </p>
                          </div>
                          <div className="col-span-1 sm:col-span-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Description:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {task.description}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Job Start Date:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {task.orderStartDate
                                ? new Date(
                                    task.orderStartDate,
                                  ).toLocaleDateString()
                                : "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Client Name:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <Link
                                to={`/admin/customer/${task.customerId}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.customerName}
                              </Link>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Associate:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <Link
                                to={`/admin/associate/${task.associateId}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.associateName}
                              </Link>
                            </p>
                          </div>
                          {task.orderDescription && (
                            <div className="col-span-1 sm:col-span-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-500">
                                Job Description:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {task.orderDescription}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Survey Submission Section */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <ChatBubbleBottomCenterTextIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                          Survey Submission
                        </h3>
                        <Link
                          to={`/admin/task/${tid}/survey/step-2`}
                          className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                        >
                          <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Edit
                        </Link>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                        <div className="grid grid-cols-1 gap-y-3">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Was there a survey conducted?
                            </span>
                            <div className="mt-1">
                              {renderResponseBadge(formData.wasSurveyConducted)}
                            </div>
                          </div>

                          {formData.wasSurveyConducted === 1 && (
                            <>
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">
                                  Survey Responses
                                </p>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      Was the quality of the work satisfactory?
                                    </span>
                                    <div className="ml-4">
                                      {renderResponseBadge(
                                        formData.wasJobSatisfactory,
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      Was the work completed on time and on
                                      budget?
                                    </span>
                                    <div className="ml-4">
                                      {renderResponseBadge(
                                        formData.wasJobFinishedOnTimeAndOnBudget,
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      Was the Associate Member punctual?
                                    </span>
                                    <div className="ml-4">
                                      {renderResponseBadge(
                                        formData.wasAssociatePunctual,
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      Was the Associate Member professional?
                                    </span>
                                    <div className="ml-4">
                                      {renderResponseBadge(
                                        formData.wasAssociateProfessional,
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs sm:text-sm text-gray-600">
                                      Would you refer Over55 to a friend or
                                      family member?
                                    </span>
                                    <div className="ml-4">
                                      {renderResponseBadge(
                                        formData.wouldCustomerReferOurOrganization,
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          {formData.wasSurveyConducted === 2 && (
                            <>
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <div>
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Why was the survey not conducted?
                                  </span>
                                  <div className="mt-1">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      {getReasonLabel(
                                        formData.noSurveyConductedReason,
                                      )}
                                    </span>
                                  </div>
                                </div>

                                {formData.noSurveyConductedReason === 1 && (
                                  <div className="mt-3">
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Other Reason:
                                    </span>
                                    <p className="text-xs sm:text-sm text-gray-900 mt-1">
                                      {formData.noSurveyConductedReasonOther}
                                    </p>
                                  </div>
                                )}

                                {formData.comment && (
                                  <div className="mt-3">
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Comment:
                                    </span>
                                    <div className="mt-1 bg-white p-3 rounded-md border border-gray-200">
                                      <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">
                                        {formData.comment}
                                      </p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={`/admin/task/${tid}/survey/step-2`}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Back
                    </Link>
                    <button
                      onClick={onSubmitClick}
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                      Submit Survey
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
