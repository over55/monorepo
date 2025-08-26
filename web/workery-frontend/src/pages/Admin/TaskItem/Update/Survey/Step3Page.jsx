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

  // Section Component with Dark Header
  const DetailSection = ({ title, icon: Icon, children, editLink = null }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </h3>
          {editLink && (
            <Link
              to={editLink}
              className="inline-flex items-center text-xs sm:text-sm text-blue-300 hover:text-blue-100"
            >
              <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
              Edit
            </Link>
          )}
        </div>
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );

  // Detail Field Component
  const DetailField = ({ label, value, link = null, fullWidth = false }) => (
    <div className={fullWidth ? "col-span-1 sm:col-span-2" : ""}>
      <span className="text-xs sm:text-sm font-semibold text-gray-700">
        {label}:
      </span>
      <p className="text-sm sm:text-base text-gray-900 mt-1">
        {link ? (
          <Link
            to={link}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            {value || "-"}
          </Link>
        ) : (
          value || "-"
        )}
      </p>
    </div>
  );

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">
                Loading task details...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                    <ClipboardDocumentListIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <DocumentCheckIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
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
                <ClipboardDocumentListIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                Task Survey
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Review and submit your survey
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
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Survey</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Complete</p>
                  <p className="text-xs text-gray-500">Submit</p>
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
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 3: Review
                    </p>
                    <p className="text-xs text-gray-500">Review & Submit</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">3 of 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Actions - Responsive */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                <CheckCircleIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                Review and Submit
              </h2>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Please carefully review the following survey details. If
              everything looks correct, click the <strong>Submit</strong> button
              to save the survey.
            </p>

            {/* Error Display - Responsive */}
            {errors && errors.message && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                <div className="flex items-center">
                  <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                  <span className="break-words">{errors.message}</span>
                </div>
              </div>
            )}

            {isSubmitting ? (
              <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-sm sm:text-base text-gray-600">
                    Submitting survey...
                  </p>
                </div>
              </div>
            ) : (
              task && (
                <div>
                  {/* Task Information Section with Dark Header */}
                  <DetailSection
                    title="Task Information"
                    icon={DocumentTextIcon}
                  >
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <DetailField label="Type" value="Order Completion" />
                      <DetailField
                        label="Job #"
                        value={task.orderWjid}
                        link={`/admin/order/${task.orderWjid}`}
                      />
                      <DetailField
                        label="Description"
                        value={task.description}
                        fullWidth
                      />
                      <DetailField
                        label="Job Start Date"
                        value={
                          task.orderStartDate
                            ? new Date(task.orderStartDate).toLocaleDateString()
                            : "-"
                        }
                      />
                      <DetailField
                        label="Client Name"
                        value={task.customerName}
                        link={`/admin/customer/${task.customerId}`}
                      />
                      <DetailField
                        label="Associate"
                        value={task.associateName}
                        link={`/admin/associate/${task.associateId}`}
                      />
                      {task.orderDescription && (
                        <DetailField
                          label="Job Description"
                          value={task.orderDescription}
                          fullWidth
                        />
                      )}
                    </dl>
                  </DetailSection>

                  {/* Survey Submission Section with Dark Header */}
                  <DetailSection
                    title="Survey Submission"
                    icon={ChatBubbleBottomCenterTextIcon}
                    editLink={`/admin/task/${tid}/survey/step-2`}
                  >
                    <div>
                      <div className="mb-4">
                        <span className="text-xs sm:text-sm font-semibold text-gray-700">
                          Was there a survey conducted?
                        </span>
                        <div className="mt-2">
                          {renderResponseBadge(formData.wasSurveyConducted)}
                        </div>
                      </div>

                      {formData.wasSurveyConducted === 1 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-sm sm:text-base font-semibold text-gray-700 mb-4">
                            Survey Responses
                          </p>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Was the quality of the work satisfactory?
                              </span>
                              <div className="sm:ml-4">
                                {renderResponseBadge(
                                  formData.wasJobSatisfactory,
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Was the work completed on time and on budget?
                              </span>
                              <div className="sm:ml-4">
                                {renderResponseBadge(
                                  formData.wasJobFinishedOnTimeAndOnBudget,
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Was the Associate Member punctual?
                              </span>
                              <div className="sm:ml-4">
                                {renderResponseBadge(
                                  formData.wasAssociatePunctual,
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Was the Associate Member professional?
                              </span>
                              <div className="sm:ml-4">
                                {renderResponseBadge(
                                  formData.wasAssociateProfessional,
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <span className="text-xs sm:text-sm text-gray-600">
                                Would you refer Over55 to a friend or family
                                member?
                              </span>
                              <div className="sm:ml-4">
                                {renderResponseBadge(
                                  formData.wouldCustomerReferOurOrganization,
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {formData.wasSurveyConducted === 2 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="space-y-4">
                            <div>
                              <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                Why was the survey not conducted?
                              </span>
                              <div className="mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {getReasonLabel(
                                    formData.noSurveyConductedReason,
                                  )}
                                </span>
                              </div>
                            </div>

                            {formData.noSurveyConductedReason === 1 && (
                              <div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                  Other Reason:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900 mt-1">
                                  {formData.noSurveyConductedReasonOther}
                                </p>
                              </div>
                            )}

                            {formData.comment && (
                              <div>
                                <span className="text-xs sm:text-sm font-semibold text-gray-700">
                                  Comment:
                                </span>
                                <div className="mt-2 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                  <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">
                                    {formData.comment}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </DetailSection>

                  {/* Action Buttons - Responsive */}
                  <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                    <Link
                      to={`/admin/task/${tid}/survey/step-2`}
                      className="order-2 sm:order-1"
                    >
                      <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        Back
                      </button>
                    </Link>
                    <button
                      onClick={onSubmitClick}
                      disabled={isSubmitting}
                      className="order-1 sm:order-2 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
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
