// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../../components/business/displays";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarIcon,
  WrenchScrewdriverIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  DocumentCheckIcon,
  CalendarDaysIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemAssignAssociateStep4Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [assignmentData, setAssignmentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Event handling
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  // Helper function to extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map((item) => {
        if (typeof item === "number" || typeof item === "string") {
          return item;
        }
        return item.id || item.value || item.skillSetId || item.tagId;
      })
      .filter(Boolean);
  };

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Starting...");

    if (!assignmentData) {
      setErrors({ general: "Assignment data not found" });
      return;
    }

    // Prepare payload - using snake_case as required by API
    const payload = {
      task_id: tid,
      task_item_id: tid,
      associate_id: assignmentData.associateID,
      status: assignmentData.status,
      how_was_job_accepted: assignmentData.howWasJobAccepted,
      why_job_declined: assignmentData.whyJobDeclined,
      predefined_comment: assignmentData.predefinedComment,
      comment: assignmentData.comment,
    };

    console.log("onSubmitClick: Payload:", payload);
    setErrors({});
    setIsSubmitting(true);

    try {
      await taskManager.assignAssociate(payload, onUnauthorized);

      // Clear session storage
      sessionStorage.removeItem("WORKERY_ASSIGN_ASSOCIATE_DATA");

      // Show success message (handled by navigate)
      setForceURL(`/admin/order/${task.orderWjid}`);
    } catch (error) {
      console.error("Error assigning associate:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load task details and assignment data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      // Load assignment data from session storage
      const storedData = sessionStorage.getItem(
        "WORKERY_ASSIGN_ASSOCIATE_DATA",
      );
      if (!storedData) {
        setForceURL(`/admin/task/${tid}/assign-associate/step-3`);
        return;
      }

      const data = JSON.parse(storedData);
      setAssignmentData(data);

      setFetching(true);
      setErrors({});

      try {
        // Fetch fresh task details
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (mounted) {
          setTask(taskData);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching task:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [tid]);

  // Section Component - Using dark header pattern
  const DetailSection = ({ title, icon: Icon, children, action = null }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
        {action && <div>{action}</div>}
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );

  // Detail Field Component
  const DetailField = ({
    label,
    value,
    fullWidth = false,
    icon: Icon = null,
  }) => (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 flex items-center">
        {Icon && <Icon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />}
        {label}
      </dt>
      <dd className="text-base sm:text-lg font-medium text-gray-900 break-words">
        {value || "-"}
      </dd>
    </div>
  );

  // Component rendering
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  const assignAssociateStatusMap = {
    3: "Yes - Accepted",
    4: "No - Declined",
  };

  if (isFetching || !task || !assignmentData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
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
                  Review & Submit
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
                <DocumentCheckIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                Review & Submit Assignment
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Review all details before finalizing the assignment
              </p>
            </div>
          </div>
        </div>

        {/* Status Alerts - Responsive */}
        {task && (task.status === 2 || task.isClosed === true) && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
            <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            This task is archived / closed
          </div>
        )}

        {/* Wizard Steps - Responsive */}
        <div className="mb-4 sm:mb-6 bg-white shadow-sm rounded-lg p-3 sm:p-4">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Final Step
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">4 of 4</div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-3 Complete */}
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Select"}
                        {step === 3 && "Details"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mx-4 w-16 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                <CheckCircleIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                Final Review
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-yellow-800">
                Please review all information carefully
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Please carefully review the following assignment details. If
              everything looks correct, click the{" "}
              <strong>Submit Assignment</strong> button to complete the process.
            </p>

            {errors && Object.keys(errors).length > 0 && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
                <div className="flex items-start">
                  <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    {Object.entries(errors).map(([key, value]) => (
                      <div key={key} className="break-words">
                        {key}: {value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 text-sm sm:text-base">
                  Submitting assignment...
                </span>
              </div>
            ) : (
              <div>
                {/* Task Information Section */}
                <DetailSection
                  title="Task Information"
                  icon={ClipboardDocumentListIcon}
                  action={
                    <Link
                      to={`/admin/task/${tid}/assign-associate/step-1`}
                      className="inline-flex items-center text-xs sm:text-sm text-white hover:text-blue-200"
                    >
                      <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  }
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField label="Type" value="Assign Associate" />
                    <DetailField label="Description" value={task.description} />
                  </dl>
                </DetailSection>

                {/* Job Information Section */}
                <DetailSection title="Job Information" icon={BriefcaseIcon}>
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Job #"
                      value={
                        <Link
                          to={`/admin/order/${task.orderWjid}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {task.orderWjid}
                        </Link>
                      }
                    />
                    <DetailField
                      label="Start Date"
                      icon={CalendarDaysIcon}
                      value={
                        task.orderStartDate
                          ? new Date(task.orderStartDate).toLocaleDateString()
                          : "-"
                      }
                    />
                    <DetailField
                      label="Job Description"
                      value={task.orderDescription}
                      fullWidth
                    />

                    {/* Skill Sets Display */}
                    {task.orderSkillSets && task.orderSkillSets.length > 0 && (
                      <div className="lg:col-span-2">
                        <SkillSetsDisplay
                          values={extractIds(task.orderSkillSets)}
                          onUnauthorized={onUnauthorized}
                          label="Required Skill Sets"
                          variant="primary"
                        />
                      </div>
                    )}

                    {/* Tags Display */}
                    {task.orderTags && task.orderTags.length > 0 && (
                      <div className="lg:col-span-2">
                        <TagsDisplay
                          values={extractIds(task.orderTags)}
                          onUnauthorized={onUnauthorized}
                          label="Job Tags"
                          variant="success"
                        />
                      </div>
                    )}
                  </dl>
                </DetailSection>

                {/* Client Information Section */}
                <DetailSection title="Client Information" icon={UserIcon}>
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Name"
                      value={
                        <Link
                          to={`/admin/customer/${task.customerId}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {task.customerName}
                        </Link>
                      }
                    />
                    {task.customerPhone && (
                      <DetailField
                        label={`Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                        icon={PhoneIcon}
                        value={
                          <>
                            {task.customerPhone}
                            {task.customerPhoneExtension &&
                              ` ext. ${task.customerPhoneExtension}`}
                          </>
                        }
                      />
                    )}
                    {task.customerFullAddressUrl && (
                      <DetailField
                        label="Address"
                        icon={MapPinIcon}
                        value={
                          <a
                            href={task.customerFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {task.customerFullAddressWithoutPostalCode}
                          </a>
                        }
                        fullWidth
                      />
                    )}

                    {/* Client Tags Display */}
                    {task.customerTags && task.customerTags.length > 0 && (
                      <div className="lg:col-span-2">
                        <TagsDisplay
                          values={extractIds(task.customerTags)}
                          onUnauthorized={onUnauthorized}
                          label="Client Tags"
                          variant="info"
                        />
                      </div>
                    )}
                  </dl>
                </DetailSection>

                {/* Associate Assignment Section */}
                <DetailSection
                  title="Associate Assignment"
                  icon={WrenchScrewdriverIcon}
                  action={
                    <Link
                      to={`/admin/task/${tid}/assign-associate/step-3`}
                      className="inline-flex items-center text-xs sm:text-sm text-white hover:text-blue-200"
                    >
                      <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                      <span className="hidden sm:inline">Edit</span>
                    </Link>
                  }
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Associate"
                      icon={UserIcon}
                      value={
                        <Link
                          to={`/admin/associate/${assignmentData.associateID}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {assignmentData.associateName}
                        </Link>
                      }
                    />
                    {assignmentData.associatePhone && (
                      <DetailField
                        label="Phone"
                        icon={PhoneIcon}
                        value={assignmentData.associatePhone}
                      />
                    )}
                    {assignmentData.associateEmail && (
                      <DetailField
                        label="Email"
                        icon={EnvelopeIcon}
                        value={assignmentData.associateEmail}
                        fullWidth
                      />
                    )}
                    <DetailField
                      label="Job Acceptance Status"
                      value={
                        <span
                          className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                            assignmentData.status === 3
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {assignmentData.status === 3 ? (
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                          ) : (
                            <XCircleIcon className="w-4 h-4 mr-1" />
                          )}
                          {assignAssociateStatusMap[assignmentData.status]}
                        </span>
                      }
                    />
                  </dl>

                  {/* Comments */}
                  {(assignmentData.predefinedComment ||
                    assignmentData.comment) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                        Comments
                      </h4>

                      {assignmentData.predefinedComment && (
                        <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start">
                            <InformationCircleIcon className="w-4 h-4 mt-0.5 mr-2 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-blue-800 mb-1">
                                System Generated Comment
                              </p>
                              <p className="text-sm text-gray-700">
                                {assignmentData.predefinedComment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {assignmentData.comment && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                          <div className="flex items-start">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-600 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-gray-700 mb-1">
                                Additional Comment
                              </p>
                              <p className="text-sm text-gray-700">
                                {assignmentData.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </DetailSection>

                {/* Form Actions - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                  <Link
                    to={`/admin/task/${tid}/assign-associate/step-3`}
                    className="order-2 sm:order-1"
                  >
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Back to Step 3
                    </button>
                  </Link>
                  <button
                    onClick={onSubmitClick}
                    disabled={isSubmitting}
                    className="order-1 sm:order-2 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Submit Assignment
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep4Page;
