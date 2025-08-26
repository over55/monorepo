// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  VehicleTypesDisplay,
  TagsDisplay,
  SkillSetsDisplay,
  InsuranceRequirementsDisplay,
} from "../../../../../components/business/displays";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../../constants/FieldOptions";
import {
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemSurveyStep1Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showPostponeConfirm, setShowPostponeConfirm] = useState(false);

  // Event handling
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  // Helper function to extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map((item) => {
        // Handle different possible structures
        if (typeof item === "number" || typeof item === "string") {
          return item;
        }
        // Try different possible ID properties
        return (
          item.id ||
          item.value ||
          item.skillSetId ||
          item.tagId ||
          item.vehicleTypeId ||
          item.insuranceRequirementId
        );
      })
      .filter(Boolean);
  };

  // Load task details
  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
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

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid]);

  // Section Component with Dark Header - Improved for responsiveness and accessibility
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

  // Detail Field Component - Improved for responsiveness and accessibility
  const DetailField = ({ label, value, fullWidth = false, link = null }) => (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
        {label}
      </dt>
      <dd className="text-base sm:text-lg font-medium text-gray-900 break-words">
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
      </dd>
    </div>
  );

  // Component rendering
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
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
                  <DocumentTextIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Survey Task
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
                Survey Task Detail
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Review task information before proceeding
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

        {/* Wizard Steps - Only show if task is not closed */}
        {task && task.isClosed === false && (
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
                <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

                {/* Step 2 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Survey</p>
                    <p className="text-xs text-gray-400">Complete Survey</p>
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
                    <p className="text-sm font-medium text-gray-500">
                      Complete
                    </p>
                    <p className="text-xs text-gray-400">Finish Task</p>
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
                      <span className="text-white font-semibold text-sm">
                        1
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Step 1: Review
                      </p>
                      <p className="text-xs text-gray-500">
                        Review task details
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">1 of 3</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display - Responsive */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div>
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Actions - Responsive */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                Task Details - Survey
              </h2>
            </div>
          </div>

          {isFetching ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-sm sm:text-base text-gray-600">
                  Loading task details...
                </p>
              </div>
            </div>
          ) : (
            task && (
              <div className="p-4 sm:p-6">
                {/* Task Information Section with Dark Header */}
                <DetailSection
                  title="Task Information"
                  icon={ClipboardDocumentListIcon}
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField label="Type" value={task.title || "Survey"} />
                    <DetailField
                      label="Created At"
                      value={
                        task.createdAt
                          ? new Date(task.createdAt).toLocaleString()
                          : "-"
                      }
                    />
                    <DetailField
                      label="Description"
                      value={task.description}
                      fullWidth
                    />
                  </dl>
                </DetailSection>

                {/* Job Information with Dark Header */}
                <DetailSection
                  title="Job Information"
                  icon={WrenchScrewdriverIcon}
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Job #"
                      value={task.orderWjid}
                      link={`/admin/order/${task.orderWjid}`}
                    />
                    <DetailField
                      label="Start Date"
                      value={
                        task.orderStartDate
                          ? new Date(task.orderStartDate).toLocaleDateString()
                          : "-"
                      }
                    />
                    <DetailField
                      label="Description"
                      value={task.orderDescription}
                      fullWidth
                    />
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Skill Sets
                      </dt>
                      <dd className="mt-1">
                        <SkillSetsDisplay
                          values={extractIds(task.orderSkillSets)}
                          onUnauthorized={onUnauthorized}
                          variant="primary"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Tags
                      </dt>
                      <dd className="mt-1">
                        <TagsDisplay
                          values={extractIds(task.orderTags)}
                          onUnauthorized={onUnauthorized}
                          variant="success"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Comments
                      </dt>
                      <dd>
                        <Link
                          to={`/admin/order/${task.orderWjid}/comments`}
                          className="text-blue-600 hover:text-blue-800 text-base sm:text-lg font-medium"
                        >
                          View comments →
                        </Link>
                      </dd>
                    </div>
                  </dl>
                </DetailSection>

                {/* Client Information with Dark Header */}
                <DetailSection title="Client Information" icon={UserIcon}>
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Name"
                      value={task.customerName}
                      link={`/admin/customer/${task.customerId}`}
                    />
                    {task.customerPhone && (
                      <DetailField
                        label={`Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                        value={`${task.customerPhone}${task.customerPhoneExtension ? ` ext. ${task.customerPhoneExtension}` : ""}`}
                      />
                    )}
                    {task.customerFullAddressUrl && (
                      <div className="lg:col-span-2">
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Address
                        </dt>
                        <dd>
                          <a
                            href={task.customerFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center text-base sm:text-lg font-medium"
                          >
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {task.customerFullAddressWithoutPostalCode}
                          </a>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Tags
                      </dt>
                      <dd className="mt-1">
                        <TagsDisplay
                          values={extractIds(task.customerTags)}
                          onUnauthorized={onUnauthorized}
                          variant="info"
                        />
                      </dd>
                    </div>
                  </dl>
                </DetailSection>

                {/* Associate Information with Dark Header */}
                <DetailSection
                  title="Associate Information"
                  icon={WrenchScrewdriverIcon}
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Name"
                      value={task.associateName}
                      link={`/admin/associate/${task.associateId}`}
                    />
                    {task.associatePhone && (
                      <DetailField
                        label={`Phone (${ASSOCIATE_PHONE_TYPE_OF_MAP[task.associatePhoneType]})`}
                        value={`${task.associatePhone}${task.associatePhoneExtension ? ` ext. ${task.associatePhoneExtension}` : ""}`}
                      />
                    )}
                    {task.associateFullAddressUrl && (
                      <div className="lg:col-span-2">
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Address
                        </dt>
                        <dd>
                          <a
                            href={task.associateFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:text-blue-800 inline-flex items-center text-base sm:text-lg font-medium"
                          >
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {task.associateFullAddressWithoutPostalCode}
                          </a>
                        </dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Tags
                      </dt>
                      <dd className="mt-1">
                        <TagsDisplay
                          values={extractIds(task.associateTags)}
                          onUnauthorized={onUnauthorized}
                          variant="warning"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Skill Sets
                      </dt>
                      <dd className="mt-1">
                        <SkillSetsDisplay
                          values={extractIds(task.associateSkillSets)}
                          onUnauthorized={onUnauthorized}
                          variant="primary"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Vehicle Types
                      </dt>
                      <dd className="mt-1">
                        <VehicleTypesDisplay
                          values={extractIds(task.associateVehicleTypes)}
                          onUnauthorized={onUnauthorized}
                          variant="warning"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Insurance Requirements
                      </dt>
                      <dd className="mt-1">
                        <InsuranceRequirementsDisplay
                          values={extractIds(
                            task.associateInsuranceRequirements,
                          )}
                          onUnauthorized={onUnauthorized}
                          variant="info"
                        />
                      </dd>
                    </div>
                  </dl>
                </DetailSection>

                {/* Action Buttons - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                  <Link to="/admin/tasks" className="order-2 sm:order-1">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                      <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Back to Tasks
                    </button>
                  </Link>

                  {task.isClosed === false && (
                    <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                      <button
                        onClick={() => setShowCloseConfirm(true)}
                        disabled={task.status === 2}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          task.status === 2
                            ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                            : "text-white bg-red-600 hover:bg-red-700"
                        }`}
                      >
                        <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        Close Task
                      </button>
                      <button
                        onClick={() => setShowPostponeConfirm(true)}
                        disabled={task.status === 2}
                        className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          task.status === 2
                            ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                            : "text-gray-700 bg-yellow-100 border-yellow-300 hover:bg-yellow-200"
                        }`}
                      >
                        <CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        Postpone
                      </button>
                      <Link
                        to={`/admin/task/${tid}/survey/step-2`}
                        className={`flex-1 sm:flex-initial ${task.status === 2 ? "pointer-events-none" : ""}`}
                      >
                        <button
                          disabled={task.status === 2}
                          className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                            task.status === 2
                              ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                              : "text-white bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          Begin Survey
                          <ChevronRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>

        {/* Close Confirmation Modal */}
        {showCloseConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <ExclamationCircleIcon className="h-5 w-5 mr-2 text-red-600" />
                  Close Task
                </h3>
              </div>

              <div className="px-4 sm:px-6 py-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to close this task? This action cannot
                  be undone.
                </p>
              </div>

              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowCloseConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Link
                  to={`/admin/task/${tid}/close`}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Yes, Close Task
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Postpone Confirmation Modal */}
        {showPostponeConfirm && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                  <CalendarIcon className="h-5 w-5 mr-2 text-yellow-600" />
                  Postpone Task
                </h3>
              </div>

              <div className="px-4 sm:px-6 py-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to postpone this task? You can resume it
                  later from the tasks list.
                </p>
              </div>

              <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
                <button
                  onClick={() => setShowPostponeConfirm(false)}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <Link
                  to={`/admin/task/${tid}/postpone`}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200"
                >
                  Yes, Postpone Task
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTaskItemSurveyStep1Page;
