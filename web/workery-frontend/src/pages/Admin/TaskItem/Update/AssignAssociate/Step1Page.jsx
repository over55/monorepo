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
                  <UserPlusIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  Assign Associate
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Task: Assign Associate
          </h1>
        </div>

        {/* Status Alert */}
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

            {/* Tablet View */}
            <div className="hidden md:block lg:hidden">
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center min-w-max px-2">
                  {[
                    { num: 1, title: "Review", active: true },
                    { num: 2, title: "Search", active: false },
                    { num: 3, title: "Assign", active: false },
                    { num: 4, title: "Confirm", active: false },
                  ].map((step, index) => (
                    <React.Fragment key={step.num}>
                      <div className="flex items-center">
                        <div
                          className={`flex items-center justify-center w-8 h-8 ${
                            step.active ? "bg-blue-600" : "bg-gray-300"
                          } rounded-full`}
                        >
                          <span
                            className={`${
                              step.active ? "text-white" : "text-gray-600"
                            } font-semibold text-xs`}
                          >
                            {step.num}
                          </span>
                        </div>
                        <div className="ml-2">
                          <p
                            className={`text-xs font-medium ${
                              step.active ? "text-gray-900" : "text-gray-500"
                            }`}
                          >
                            {step.title}
                          </p>
                        </div>
                      </div>
                      {index < 3 && (
                        <div className="mx-2 w-8 h-0.5 bg-gray-300"></div>
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
                  <div className="text-xs text-gray-500">1 of 4</div>
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
              <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
              Task Details
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
                <div className="space-y-4">
                  {/* Task Type and Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Type
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">{task.title}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">
                          {task.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Job Information */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <BriefcaseIcon className="w-4 h-4 mr-2" />
                      Job Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Job #
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Link
                            to={`/admin/order/${task.orderWjid}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {task.orderWjid}
                          </Link>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <CalendarDaysIcon className="w-4 h-4 inline mr-1" />
                          Start Date
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-900">
                            {task.orderStartDate
                              ? new Date(
                                  task.orderStartDate,
                                ).toLocaleDateString()
                              : "-"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Description
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900">
                          {task.orderDescription || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Skills and Tags */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                      Requirements
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Required Skill Sets
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <SkillSetsDisplay
                            values={extractIds(task.orderSkillSets)}
                            onUnauthorized={onUnauthorized}
                            variant="primary"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <TagIcon className="w-4 h-4 inline mr-1" />
                          Job Tags
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <TagsDisplay
                            values={extractIds(task.orderTags)}
                            onUnauthorized={onUnauthorized}
                            variant="success"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Client Information */}
                  <div className="border-t pt-4">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Client Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Client Name
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Link
                            to={`/admin/customer/${task.customerId}`}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {task.customerName}
                          </Link>
                        </div>
                      </div>
                      {task.customerPhone && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            <PhoneIcon className="w-4 h-4 inline mr-1" />
                            Phone (
                            {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})
                          </label>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-900">
                              {task.customerPhone}
                              {task.customerPhoneExtension &&
                                ` ext. ${task.customerPhoneExtension}`}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {task.customerFullAddressUrl && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <MapPinIcon className="w-4 h-4 inline mr-1" />
                          Client Address
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <a
                            href={task.customerFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            {task.customerFullAddressWithoutPostalCode}
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <TagIcon className="w-4 h-4 inline mr-1" />
                        Client Tags
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <TagsDisplay
                          values={extractIds(task.customerTags)}
                          onUnauthorized={onUnauthorized}
                          variant="info"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Comments Link */}
                  <div className="border-t pt-4">
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
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Link
                    to="/admin/tasks"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Tasks
                  </Link>

                  {task.isClosed === false && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/admin/task/${tid}/close`}
                        className="w-full sm:w-auto"
                      >
                        <button
                          disabled={task.status === 2}
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XMarkIcon className="w-4 h-4 mr-2" />
                          Close Task
                        </button>
                      </Link>
                      <Link
                        to={`/admin/task/${tid}/assign-associate/step-2`}
                        className="w-full sm:w-auto"
                      >
                        <button
                          disabled={task.status === 2}
                          className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Begin Assignment
                          <ChevronRightIcon className="w-4 h-4 ml-2" />
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
