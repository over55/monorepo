// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step1Page.jsx

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
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  BriefcaseIcon,
  PhoneIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
  TagIcon,
  WrenchScrewdriverIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemAssignAssociateStep1Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

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
        return item.id || item.value || item.skillSetId || item.tagId;
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

  // Section Component - Using dark header pattern from FullPage
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

  // Detail Field Component
  const DetailField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
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
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Assign Associate
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
                Task: Assign Associate
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Review task details before assignment
              </p>
            </div>
          </div>
        </div>

        {/* Status Alert - Responsive */}
        {task && (task.status === 2 || task.isClosed === true) && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
            <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            This task is archived / closed
          </div>
        )}

        {/* Wizard Steps - Only show if task is not closed */}
        {task && task.isClosed === false && (
          <div className="mb-4 sm:mb-6 bg-white shadow-sm rounded-lg p-3 sm:p-4">
            {/* Mobile View */}
            <div className="md:hidden">
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
                <div className="text-xs text-gray-500">1 of 4</div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:flex items-center justify-center overflow-x-auto">
              <div className="flex items-center min-w-max">
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
                <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>

                {/* Step 2 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold">2</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Search</p>
                    <p className="text-xs text-gray-400">Find Associate</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold">3</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Assign</p>
                    <p className="text-xs text-gray-400">Select Associate</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                    <span className="text-gray-600 font-semibold">4</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">Confirm</p>
                    <p className="text-xs text-gray-400">Complete Assignment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message - Responsive */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
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
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Actions - Responsive */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                Task Details
              </h2>
            </div>
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
                <DetailSection
                  title="Task Information"
                  icon={ClipboardDocumentListIcon}
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField label="Task Type" value={task.title} />
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
                  </dl>
                </DetailSection>

                {/* Skills and Tags Section */}
                <DetailSection
                  title="Requirements"
                  icon={WrenchScrewdriverIcon}
                >
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Required Skill Sets
                      </dt>
                      <dd>
                        <SkillSetsDisplay
                          values={extractIds(task.orderSkillSets)}
                          onUnauthorized={onUnauthorized}
                          variant="primary"
                        />
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Job Tags
                      </dt>
                      <dd>
                        <TagsDisplay
                          values={extractIds(task.orderTags)}
                          onUnauthorized={onUnauthorized}
                          variant="success"
                        />
                      </dd>
                    </div>
                  </dl>
                </DetailSection>

                {/* Client Information Section */}
                <DetailSection title="Client Information" icon={UserIcon}>
                  <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <DetailField
                      label="Client Name"
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
                        label="Client Address"
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
                    <div className="lg:col-span-2">
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        Client Tags
                      </dt>
                      <dd>
                        <TagsDisplay
                          values={extractIds(task.customerTags)}
                          onUnauthorized={onUnauthorized}
                          variant="info"
                        />
                      </dd>
                    </div>
                  </dl>
                </DetailSection>

                {/* Comments Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 flex items-center">
                      <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                      Comments
                    </label>
                    <Link
                      to={`/admin/order/${task.orderWjid}/comments`}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View all comments →
                    </Link>
                  </div>
                </div>

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
                      <Link
                        to={`/admin/task/${tid}/close`}
                        className="flex-1 sm:flex-initial"
                      >
                        <button
                          disabled={task.status === 2}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent text-white bg-red-600 hover:bg-red-700 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                          Close Task
                        </button>
                      </Link>
                      <Link
                        to={`/admin/task/${tid}/assign-associate/step-2`}
                        className="flex-1 sm:flex-initial"
                      >
                        <button
                          disabled={task.status === 2}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm sm:text-base font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Begin Assignment
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
      </div>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep1Page;
