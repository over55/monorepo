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

  // Component rendering
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
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
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-1 sm:mr-2" />
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
                  Survey Task
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Survey Task Detail
          </h1>
        </div>

        {/* Status Banner */}
        {task && (task.status === 2 || task.isClosed === true) && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-3 sm:px-4 py-3 rounded-lg flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">This task is archived / closed</span>
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

            {/* Tablet View */}
            <div className="hidden md:block lg:hidden">
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center min-w-max px-2">
                  {[
                    { num: 1, title: "Review", active: true },
                    { num: 2, title: "Survey", active: false },
                    { num: 3, title: "Complete", active: false },
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
                      {index < 2 && (
                        <div className="mx-1 w-6 h-0.5 bg-gray-300"></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden">
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

        {/* Error Message */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
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
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Task Details - Survey
            </h2>
          </div>

          {isFetching ? (
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 text-sm sm:text-base">
                  Loading task details...
                </span>
              </div>
            </div>
          ) : (
            task && (
              <div className="p-4 sm:p-6">
                {/* Task Information Section */}
                <div className="space-y-6">
                  {/* Basic Task Info */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                      Task Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Type
                          </label>
                          <p className="text-sm text-gray-900">
                            {task.title || "Survey"}
                          </p>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Created At
                          </label>
                          <p className="text-sm text-gray-900">
                            {task.createdAt
                              ? new Date(task.createdAt).toLocaleString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Description
                        </label>
                        <p className="text-sm text-gray-900">
                          {task.description || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                      Job Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Job #
                          </label>
                          <Link
                            to={`/admin/order/${task.orderWjid}`}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {task.orderWjid}
                          </Link>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Start Date
                          </label>
                          <p className="text-sm text-gray-900">
                            {task.orderStartDate
                              ? new Date(
                                  task.orderStartDate,
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Description
                        </label>
                        <p className="text-sm text-gray-900">
                          {task.orderDescription || "-"}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Skill Sets
                        </label>
                        <div className="mt-1">
                          <SkillSetsDisplay
                            values={extractIds(task.orderSkillSets)}
                            onUnauthorized={onUnauthorized}
                            variant="primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tags
                        </label>
                        <div className="mt-1">
                          <TagsDisplay
                            values={extractIds(task.orderTags)}
                            onUnauthorized={onUnauthorized}
                            variant="success"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Comments
                        </label>
                        <Link
                          to={`/admin/order/${task.orderWjid}/comments`}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View comments →
                        </Link>
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
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Name
                        </label>
                        <Link
                          to={`/admin/customer/${task.customerId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {task.customerName}
                        </Link>
                      </div>
                      {task.customerPhone && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Phone (
                            {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})
                          </label>
                          <p className="text-sm text-gray-900">
                            {task.customerPhone}
                            {task.customerPhoneExtension &&
                              ` ext. ${task.customerPhoneExtension}`}
                          </p>
                        </div>
                      )}
                      {task.customerFullAddressUrl && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Address
                          </label>
                          <a
                            href={task.customerFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {task.customerFullAddressWithoutPostalCode}
                          </a>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tags
                        </label>
                        <div className="mt-1">
                          <TagsDisplay
                            values={extractIds(task.customerTags)}
                            onUnauthorized={onUnauthorized}
                            variant="info"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Associate Information */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                      Associate Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Name
                        </label>
                        <Link
                          to={`/admin/associate/${task.associateId}`}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {task.associateName}
                        </Link>
                      </div>
                      {task.associatePhone && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Phone (
                            {
                              ASSOCIATE_PHONE_TYPE_OF_MAP[
                                task.associatePhoneType
                              ]
                            }
                            )
                          </label>
                          <p className="text-sm text-gray-900">
                            {task.associatePhone}
                            {task.associatePhoneExtension &&
                              ` ext. ${task.associatePhoneExtension}`}
                          </p>
                        </div>
                      )}
                      {task.associateFullAddressUrl && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Address
                          </label>
                          <a
                            href={task.associateFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center"
                          >
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {task.associateFullAddressWithoutPostalCode}
                          </a>
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tags
                        </label>
                        <div className="mt-1">
                          <TagsDisplay
                            values={extractIds(task.associateTags)}
                            onUnauthorized={onUnauthorized}
                            variant="warning"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Skill Sets
                        </label>
                        <div className="mt-1">
                          <SkillSetsDisplay
                            values={extractIds(task.associateSkillSets)}
                            onUnauthorized={onUnauthorized}
                            variant="primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Vehicle Types
                        </label>
                        <div className="mt-1">
                          <VehicleTypesDisplay
                            values={extractIds(task.associateVehicleTypes)}
                            onUnauthorized={onUnauthorized}
                            variant="warning"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Insurance Requirements
                        </label>
                        <div className="mt-1">
                          <InsuranceRequirementsDisplay
                            values={extractIds(
                              task.associateInsuranceRequirements,
                            )}
                            onUnauthorized={onUnauthorized}
                            variant="info"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Link
                    to="/admin/tasks"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Tasks
                  </Link>

                  {task.isClosed === false && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowCloseConfirm(true)}
                        disabled={task.status === 2}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <XMarkIcon className="w-4 h-4 mr-2" />
                        Close Task
                      </button>
                      <button
                        onClick={() => setShowPostponeConfirm(true)}
                        disabled={task.status === 2}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        Postpone
                      </button>
                      <Link
                        to={`/admin/task/${tid}/survey/step-2`}
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${task.status === 2 ? "opacity-50 pointer-events-none" : ""}`}
                      >
                        Begin Survey
                        <ChevronRightIcon className="w-4 h-4 ml-2" />
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
