// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step1Page.jsx
// @uix-page: TaskItemOrderCompletionStep1
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb, UIXThemeProvider)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import { Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme } from "../../../../../components/UIX";
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

  // UIX Theme
  const { theme } = useUIXTheme();
  const themeClasses = useMemo(() => ({
    container: theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900',
    card: theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    text: theme === 'dark' ? 'text-gray-100' : 'text-gray-900',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
  }), [theme]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", path: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Tasks", path: "/admin/tasks", icon: ClipboardDocumentCheckIcon },
    { label: "Order Completion", icon: DocumentTextIcon },
  ], []);

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

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

  // Section Component with Dark Header
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner size="lg" label="Loading task details..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Task - Order Completion
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review task details before proceeding
          </p>
        </div>

        {/* Status Alerts - Responsive */}
        {task && (task.status === 2 || task.isClosed === true) && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
            <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            This task is archived / closed
          </div>
        )}

        {/* Wizard Steps - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View - Simplified */}
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

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center">
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

              {/* Steps 2-5 - Inactive */}
              {[
                { num: 2, title: "Survey", subtitle: "Questions" },
                { num: 3, title: "Comment", subtitle: "Add Notes" },
                { num: 4, title: "Review", subtitle: "Confirm" },
                { num: 5, title: "Complete", subtitle: "Finish" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
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
                  {index < 3 && (
                    <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message - Responsive */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between text-sm sm:text-base">
            <span className="flex items-center">
              <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>
                {typeof errors === "string" ? errors : JSON.stringify(errors)}
              </span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        {task && (
          <div className="space-y-4 sm:space-y-6">
            {/* Task Information Section */}
            <DetailSection
              title="Task Information"
              icon={ClipboardDocumentCheckIcon}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Type
                  </dt>
                  <dd className="text-base sm:text-lg font-medium text-gray-900">
                    {task.title}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Job #
                  </dt>
                  <dd className="text-base sm:text-lg font-medium">
                    <Link
                      to={`/admin/order/${task.orderWjid}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {task.orderWjid}
                    </Link>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </dt>
                  <dd className="text-base sm:text-lg text-gray-900">
                    {task.description}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Job Description
                  </dt>
                  <dd className="text-base sm:text-lg text-gray-900">
                    {task.orderDescription || "-"}
                  </dd>
                </div>
              </div>
            </DetailSection>

            {/* Job Details Section */}
            <DetailSection title="Job Details" icon={BriefcaseIcon}>
              <div className="space-y-4">
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Skill Sets
                  </dt>
                  <dd>
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
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    Tags
                  </dt>
                  <dd>
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
                  </dd>
                </div>
              </div>
            </DetailSection>

            {/* Client Information Section */}
            <DetailSection title="Client Information" icon={UserIcon}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Name
                  </dt>
                  <dd className="text-base sm:text-lg font-medium">
                    <Link
                      to={`/admin/customer/${task.customerId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {task.customerName}
                    </Link>
                  </dd>
                </div>
                {task.customerPhone && (
                  <div>
                    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Phone ({CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})
                    </dt>
                    <dd className="text-base sm:text-lg text-gray-900 flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {task.customerPhone}
                      {task.customerPhoneExtension &&
                        ` x${task.customerPhoneExtension}`}
                    </dd>
                  </div>
                )}
                {task.customerFullAddressWithoutPostalCode && (
                  <div className="md:col-span-2">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Address
                    </dt>
                    <dd className="text-base sm:text-lg text-gray-900 flex items-start">
                      <MapPinIcon className="w-4 h-4 mr-1 text-gray-400 mt-0.5" />
                      {task.customerFullAddressWithoutPostalCode}
                    </dd>
                  </div>
                )}
                {task.customerTags?.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </dt>
                    <dd>
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
                    </dd>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Associate Information Section */}
            <DetailSection
              title="Associate Information"
              icon={WrenchScrewdriverIcon}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Name
                  </dt>
                  <dd className="text-base sm:text-lg font-medium">
                    <Link
                      to={`/admin/associate/${task.associateId}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {task.associateName}
                    </Link>
                  </dd>
                </div>
                {task.associatePhone && (
                  <div>
                    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Phone (
                      {ASSOCIATE_PHONE_TYPE_OF_MAP[task.associatePhoneType]})
                    </dt>
                    <dd className="text-base sm:text-lg text-gray-900 flex items-center">
                      <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {task.associatePhone}
                      {task.associatePhoneExtension &&
                        ` x${task.associatePhoneExtension}`}
                    </dd>
                  </div>
                )}
                {task.associateFullAddressWithoutPostalCode && (
                  <div className="md:col-span-2">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                      Address
                    </dt>
                    <dd className="text-base sm:text-lg text-gray-900 flex items-start">
                      <MapPinIcon className="w-4 h-4 mr-1 text-gray-400 mt-0.5" />
                      {task.associateFullAddressWithoutPostalCode}
                    </dd>
                  </div>
                )}
                {task.associateTags?.length > 0 && (
                  <div className="md:col-span-2">
                    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </dt>
                    <dd>
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
                    </dd>
                  </div>
                )}
              </div>
            </DetailSection>

            {/* Additional Information Section */}
            <DetailSection
              title="Additional Information"
              icon={InformationCircleIcon}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Comments
                  </dt>
                  <dd>
                    <Link
                      to={`/admin/order/${task.orderWjid}/comments`}
                      className="text-base sm:text-lg font-medium text-blue-600 hover:text-blue-800 flex items-center"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                      View comments
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Task Created At
                  </dt>
                  <dd className="text-base sm:text-lg text-gray-900 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                    {task.createdAt
                      ? new Date(task.createdAt).toLocaleString()
                      : "-"}
                  </dd>
                </div>
              </div>
            </DetailSection>

            {/* Action Buttons - Responsive */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4">
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
  );
}

function AdminTaskItemOrderCompletionStep1PageWithTheme() {
  return (
    <UIXThemeProvider>
      <AdminTaskItemOrderCompletionStep1Page />
    </UIXThemeProvider>
  );
}

export default AdminTaskItemOrderCompletionStep1PageWithTheme;
