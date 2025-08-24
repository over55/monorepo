// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../../constants/FieldOptions";
import {
  ChartBarIcon,
  ChevronRightIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ClockIcon,
  ArrowRightIcon,
  HomeIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemOrderCompletionStep1Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);

        if (mounted) {
          setTask(taskData);

          // Initialize order completion storage with task data if needed
          const currentState = orderCompletionStorage.getState();
          if (!currentState.invoiceIDs) {
            orderCompletionStorage.updateState({
              invoiceIDs: taskData.orderWjid,
              invoiceServiceFeeID: taskData.associateServiceFeeID || "",
              invoiceServiceFeePercentage:
                taskData.associateServiceFeePercentage || 0,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid]);

  const handleBegin = () => {
    navigate(`/admin/task/${tid}/order-completion/step-2`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-600">Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/tasks"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <DocumentTextIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  Order Completion
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Task - Order Completion
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop View */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Task Details</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Survey</p>
                  <p className="text-xs text-gray-400">Questions</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Comment</p>
                  <p className="text-xs text-gray-400">Add Notes</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Review</p>
                  <p className="text-xs text-gray-400">Confirm</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Complete</p>
                  <p className="text-xs text-gray-400">Finish</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet View - Horizontal Scroll */}
          <div className="hidden md:block lg:hidden">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {[
                  {
                    num: 1,
                    title: "Review",
                    subtitle: "Details",
                    active: true,
                  },
                  {
                    num: 2,
                    title: "Survey",
                    subtitle: "Questions",
                    active: false,
                  },
                  {
                    num: 3,
                    title: "Comment",
                    subtitle: "Notes",
                    active: false,
                  },
                  {
                    num: 4,
                    title: "Review",
                    subtitle: "Confirm",
                    active: false,
                  },
                  {
                    num: 5,
                    title: "Complete",
                    subtitle: "Finish",
                    active: false,
                  },
                ].map((step, index) => (
                  <React.Fragment key={step.num}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 ${step.active ? "bg-blue-600" : "bg-gray-300"} rounded-full`}
                      >
                        <span
                          className={`${step.active ? "text-white" : "text-gray-600"} font-semibold text-xs`}
                        >
                          {step.num}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p
                          className={`text-xs font-medium ${step.active ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < 4 && (
                      <div className="mx-1 w-6 h-0.5 bg-gray-300"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View - Simplified Current Step Display */}
          <div className="md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 1: Review
                    </p>
                    <p className="text-xs text-gray-500">Review task details</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">1 of 5</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm">
              <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>
                {typeof errors === "string" ? errors : JSON.stringify(errors)}
              </span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Task Detail - Order Completion
            </h2>
          </div>

          {task && (
            <div className="px-4 sm:px-6 py-4">
              {/* Task Information Section */}
              <div className="space-y-6">
                {/* Task Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                    Task Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Type</p>
                        <p className="text-sm font-medium text-gray-900">
                          {task.title}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Job #</p>
                        <Link
                          to={`/admin/order/${task.orderWjid}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {task.orderWjid}
                        </Link>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Description
                        </p>
                        <p className="text-sm text-gray-900">
                          {task.description}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">
                          Job Description
                        </p>
                        <p className="text-sm text-gray-900">
                          {task.orderDescription || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Job Details */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <BriefcaseIcon className="w-4 h-4 mr-2" />
                    Job Details
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Skill Sets</p>
                      <div className="flex flex-wrap gap-2">
                        {task.orderSkillSets?.length > 0 ? (
                          task.orderSkillSets.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {skill.subCategory}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {task.orderTags?.length > 0 ? (
                          task.orderTags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag.text}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Client Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <Link
                          to={`/admin/customer/${task.customerId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {task.customerName}
                        </Link>
                      </div>
                      {task.customerPhone && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Phone (
                            {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})
                          </p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {task.customerPhone}
                            {task.customerPhoneExtension &&
                              ` x${task.customerPhoneExtension}`}
                          </p>
                        </div>
                      )}
                      {task.customerFullAddressWithoutPostalCode && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm text-gray-900 flex items-start">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400 mt-0.5" />
                            {task.customerFullAddressWithoutPostalCode}
                          </p>
                        </div>
                      )}
                    </div>
                    {task.customerTags?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {task.customerTags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Associate Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Associate Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Name</p>
                        <Link
                          to={`/admin/associate/${task.associateId}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          {task.associateName}
                        </Link>
                      </div>
                      {task.associatePhone && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">
                            Phone (
                            {
                              ASSOCIATE_PHONE_TYPE_OF_MAP[
                                task.associatePhoneType
                              ]
                            }
                            )
                          </p>
                          <p className="text-sm text-gray-900 flex items-center">
                            <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {task.associatePhone}
                            {task.associatePhoneExtension &&
                              ` x${task.associatePhoneExtension}`}
                          </p>
                        </div>
                      )}
                      {task.associateFullAddressWithoutPostalCode && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-gray-500 mb-1">Address</p>
                          <p className="text-sm text-gray-900 flex items-start">
                            <MapPinIcon className="w-4 h-4 mr-1 text-gray-400 mt-0.5" />
                            {task.associateFullAddressWithoutPostalCode}
                          </p>
                        </div>
                      )}
                    </div>
                    {task.associateTags?.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tags</p>
                        <div className="flex flex-wrap gap-2">
                          {task.associateTags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <TagIcon className="w-3 h-3 mr-1" />
                              {tag.text}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    Additional Information
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Comments</p>
                        <Link
                          to={`/admin/order/${task.orderWjid}/comments`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          View comments
                        </Link>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">
                          Task Created At
                        </p>
                        <p className="text-sm text-gray-900 flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                          {task.createdAt
                            ? new Date(task.createdAt).toLocaleString()
                            : "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <Link
                  to="/admin/tasks"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Tasks
                </Link>

                <div className="flex flex-col sm:flex-row gap-3">
                  {!task?.isClosed && (
                    <>
                      <Link
                        to={`/admin/task/${tid}/close`}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Close Task
                      </Link>
                      <Link
                        to={`/admin/task/${tid}/postpone`}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <ClockIcon className="w-4 h-4 mr-2" />
                        Postpone
                      </Link>
                      <button
                        onClick={handleBegin}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Begin
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep1Page;
