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

  // Component rendering
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  const assignAssociateStatusMap = {
    3: "Yes",
    4: "No",
  };

  if (isFetching || !task || !assignmentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
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
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Assign Associate
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Assign Associate to Task
          </h1>
        </div>

        {/* Archived Alert */}
        {task && task.status === 2 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">This task is archived</span>
          </div>
        )}

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-3 Complete */}
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-3">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Select"}
                        {step === 3 && "Details"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    4
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
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 4 of 4
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className="w-2 h-2 bg-green-600 rounded-full mr-1"
                      ></div>
                    ))}
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
              Please carefully review the following assignment details. If
              everything looks correct, click the <strong>Submit</strong> button
              to complete the assignment.
            </p>

            {errors && Object.keys(errors).length > 0 && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <div className="flex items-start">
                  <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm sm:text-base">
                    {Object.entries(errors).map(([key, value]) => (
                      <div key={key}>
                        {key}: {value}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Submitting assignment...
                </span>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6 sm:space-y-8">
                  {/* Task Information Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                        Task Information
                      </h3>
                      <Link
                        to={`/admin/task/${tid}/assign-associate/step-1`}
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Type:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            Assign Associate
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Description:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {task.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Job Information Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <BriefcaseIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                        Job Information
                      </h3>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
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
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Start Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {task.orderStartDate
                              ? new Date(
                                  task.orderStartDate,
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                        <div className="col-span-1 sm:col-span-2">
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Description:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            {task.orderDescription || "-"}
                          </p>
                        </div>
                      </div>

                      {/* Skill Sets Display */}
                      {task.orderSkillSets &&
                        task.orderSkillSets.length > 0 && (
                          <div className="mt-3">
                            <SkillSetsDisplay
                              values={extractIds(task.orderSkillSets)}
                              onUnauthorized={onUnauthorized}
                              label="Job Skill Sets"
                              variant="primary"
                            />
                          </div>
                        )}

                      {/* Tags Display */}
                      {task.orderTags && task.orderTags.length > 0 && (
                        <div className="mt-3">
                          <TagsDisplay
                            values={extractIds(task.orderTags)}
                            onUnauthorized={onUnauthorized}
                            label="Job Tags"
                            variant="success"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Client Information Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-purple-600" />
                        Client Information
                      </h3>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Name:
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
                        {task.customerPhone && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Phone (
                              {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]}
                              ):
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {task.customerPhone}
                              {task.customerPhoneExtension &&
                                ` ext. ${task.customerPhoneExtension}`}
                            </p>
                          </div>
                        )}
                        {task.customerFullAddressUrl && (
                          <div className="col-span-1 sm:col-span-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Address:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <a
                                href={task.customerFullAddressUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.customerFullAddressWithoutPostalCode}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Client Tags Display */}
                      {task.customerTags && task.customerTags.length > 0 && (
                        <div className="mt-3">
                          <TagsDisplay
                            values={extractIds(task.customerTags)}
                            onUnauthorized={onUnauthorized}
                            label="Client Tags"
                            variant="info"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Associate Assignment Section */}
                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <WrenchScrewdriverIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-orange-600" />
                        Associate Assignment
                      </h3>
                      <Link
                        to={`/admin/task/${tid}/assign-associate/step-3`}
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Associate:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            <Link
                              to={`/admin/associate/${assignmentData.associateID}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {assignmentData.associateName}
                            </Link>
                          </p>
                        </div>
                        {assignmentData.associatePhone && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
                              <PhoneIcon className="w-3 h-3 mr-1" />
                              Phone:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {assignmentData.associatePhone}
                            </p>
                          </div>
                        )}
                        {assignmentData.associateEmail && (
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500 flex items-center">
                              <EnvelopeIcon className="w-3 h-3 mr-1" />
                              Email:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900 break-all">
                              {assignmentData.associateEmail}
                            </p>
                          </div>
                        )}
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Accepted Job?
                          </span>
                          <p className="text-xs sm:text-sm">
                            <span
                              className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                assignmentData.status === 3
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {assignAssociateStatusMap[assignmentData.status]}
                            </span>
                          </p>
                        </div>
                      </div>

                      {assignmentData.predefinedComment && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-start">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                                Predefined Comment:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {assignmentData.predefinedComment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {assignmentData.comment && (
                        <div className="mt-4">
                          <div className="flex items-start">
                            <ChatBubbleLeftRightIcon className="w-4 h-4 mt-0.5 mr-2 text-gray-500 flex-shrink-0" />
                            <div className="flex-1">
                              <span className="text-xs sm:text-sm font-medium text-gray-500 block mb-1">
                                Additional Comment:
                              </span>
                              <p className="text-xs sm:text-sm text-gray-900">
                                {assignmentData.comment}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/admin/task/${tid}/assign-associate/step-3`}
                    className="flex-1"
                  >
                    <button
                      type="button"
                      disabled={isSubmitting}
                      className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Back
                    </button>
                  </Link>
                  <button
                    onClick={onSubmitClick}
                    disabled={isSubmitting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Save & Submit
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
