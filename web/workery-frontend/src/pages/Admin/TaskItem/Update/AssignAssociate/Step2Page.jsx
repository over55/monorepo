// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  useTaskManager,
  useAssociateManager,
} from "../../../../../services/Services";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import { ASSOCIATE_STATUS_ACTIVE } from "../../../../../constants/Associate";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ExclamationCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  TagIcon,
  MapPinIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemAssignAssociateStep2Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();
  const associateManager = useAssociateManager();

  // Component states
  const [task, setTask] = useState(null);
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [selectedAssociateId, setSelectedAssociateId] = useState(null);

  // Event handling
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  const onSelectClick = (associate) => {
    sessionStorage.setItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
      JSON.stringify({
        associateID: associate.id,
        associateName: associate.name,
        associatePhone: associate.phone,
        associateEmail: associate.email,
        associateOrganizationName: associate.organizationName,
        associateContactsLast30Days: associate.contactsLast30Days,
        associateWsibNumber: associate.wsibNumber,
        associateHourlySalaryDesired: associate.hourlySalaryDesired,
        associateSkillSets: associate.skillSets,
      }),
    );
    setForceURL(`/admin/task/${tid}/assign-associate/step-3`);
  };

  // Load previously selected associate from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
    );
    if (storedData) {
      try {
        const data = JSON.parse(storedData);
        if (data.associateID) {
          setSelectedAssociateId(data.associateID);
          console.log("Found previously selected associate:", data.associateID);
        }
      } catch (error) {
        console.error("Error parsing stored associate data:", error);
      }
    }
  }, []);

  // Load task details and then load filtered associates
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (!mounted) return;

        setTask(taskData);

        let skillSetIds = [];
        if (taskData.orderSkillSets && taskData.orderSkillSets.length > 0) {
          skillSetIds = taskData.orderSkillSets
            .map((skill) => skill.id || skill.value || skill._id)
            .filter((id) => id);
        }

        const filtersMap = new Map();
        filtersMap.set("status", ASSOCIATE_STATUS_ACTIVE);

        if (skillSetIds.length > 0) {
          filtersMap.set("inSkillSetIds", skillSetIds.join(","));
        }

        console.log("Fetching associates with skill set filters:", skillSetIds);

        const associatesData =
          await associateManager.getAssociatesWithFiltersMap(
            filtersMap,
            onUnauthorized,
            true,
          );

        if (mounted) {
          if (associatesData.results && skillSetIds.length > 0) {
            associatesData.results.sort((a, b) => {
              const aMatchCount = countMatchingSkills(a.skillSets, skillSetIds);
              const bMatchCount = countMatchingSkills(b.skillSets, skillSetIds);
              return bMatchCount - aMatchCount;
            });
          }

          setAssociates(associatesData);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching data:", error);
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

  const countMatchingSkills = (associateSkills, requiredSkillIds) => {
    if (!associateSkills || associateSkills.length === 0) return 0;

    const requiredSet = new Set(requiredSkillIds);
    let count = 0;

    for (const skill of associateSkills) {
      const skillId = skill.id || skill.value || skill._id;
      if (requiredSet.has(skillId)) {
        count++;
      }
    }

    return count;
  };

  const renderSkillSets = (associateSkillSets, taskSkillSets) => {
    if (!associateSkillSets || associateSkillSets.length === 0) {
      return <span className="text-gray-400">-</span>;
    }

    const taskSkillIds = new Set();
    if (taskSkillSets && taskSkillSets.length > 0) {
      taskSkillSets.forEach((skill) => {
        const skillId = skill.id || skill.value || skill._id;
        if (skillId) taskSkillIds.add(skillId);
      });
    }

    const matchingSkills = [];
    const nonMatchingSkills = [];

    associateSkillSets.forEach((skill) => {
      const skillId = skill.id || skill.value || skill._id;
      const skillName = skill.name || skill.text || skill.label;
      const isMatching = taskSkillIds.has(skillId);

      if (isMatching) {
        matchingSkills.push({ id: skillId, name: skillName });
      } else {
        nonMatchingSkills.push({ id: skillId, name: skillName });
      }
    });

    return (
      <div className="flex flex-wrap gap-1">
        {matchingSkills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full"
            title="Matches job requirement"
          >
            ✓ {skill.name}
          </span>
        ))}
        {nonMatchingSkills.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
          >
            {skill.name}
          </span>
        ))}
      </div>
    );
  };

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
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
                <span className="sm:hidden">Dash</span>
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
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Task Detail
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Task - Assign Associate
          </h1>
        </div>

        {/* Status Banner */}
        {task && task.status === 2 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2" />
            <span className="text-sm sm:text-base">
              <strong>Note:</strong> This task is archived.
            </span>
          </div>
        )}

        {/* Wizard Steps */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex items-center justify-start xl:justify-center min-w-max px-2">
              <div className="flex items-center">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckCircleIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Review
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Task Details
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-900">1</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 2 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm sm:text-base">
                      2
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Select
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Associate
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-900">Select</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm sm:text-base">
                      3
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Confirm
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Assignment
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-500">3</p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-6 sm:w-8 lg:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm sm:text-base">
                      4
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3 hidden md:block">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Complete
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Finish
                    </p>
                  </div>
                  <div className="ml-2 sm:ml-3 md:hidden">
                    <p className="text-xs font-medium text-gray-500">4</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6 bg-white shadow-sm rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Step 2 of 4</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-600 h-2 rounded-full"
              style={{ width: "50%" }}
            ></div>
          </div>
        </div>

        {/* Error Message */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                <span className="text-sm sm:text-base">
                  <strong>Error:</strong>
                  {Object.entries(errors).map(([key, value]) => (
                    <span key={key} className="ml-2">
                      {key}: {value}
                    </span>
                  ))}
                </span>
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-600 hover:text-red-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {isFetching ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {task && (
                <>
                  {/* Task Details Section */}
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                      <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                      Task Details
                    </h2>
                  </div>

                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Type
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          Assign Associate
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Description
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {task.description}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Job #
                        </p>
                        <Link
                          to={`/admin/order/${task.orderWjid}`}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {task.orderWjid} →
                        </Link>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Job Start Date
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {task.orderStartDate
                            ? new Date(task.orderStartDate).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-medium text-gray-500">
                          Job Description
                        </p>
                        <p className="mt-1 text-sm text-gray-900">
                          {task.orderDescription || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Job Skill Sets
                        </p>
                        <div className="mt-1">
                          {task.orderSkillSets &&
                          task.orderSkillSets.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {task.orderSkillSets.map((skill, index) => (
                                <span
                                  key={skill.id || skill.value || index}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                                >
                                  {skill.name || skill.text || skill.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Job Tags
                        </p>
                        <div className="mt-1">
                          {task.orderTags && task.orderTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {task.orderTags.map((tag, index) => (
                                <span
                                  key={tag.id || tag.value || index}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full"
                                >
                                  {tag.name || tag.text || tag.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Client Name
                        </p>
                        <Link
                          to={`/admin/client/${task.customerId}`}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                        >
                          {task.customerName} →
                        </Link>
                      </div>
                      {task.customerPhone && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Client Phone (
                            {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})
                          </p>
                          <a
                            href={`tel:${task.customerPhone}`}
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {task.customerPhone}
                            {task.customerPhoneExtension && (
                              <span className="ml-1">
                                ext. {task.customerPhoneExtension}
                              </span>
                            )}
                          </a>
                        </div>
                      )}
                      {task.customerFullAddressUrl && (
                        <div>
                          <p className="text-sm font-medium text-gray-500">
                            Client Address
                          </p>
                          <a
                            href={task.customerFullAddressUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {task.customerFullAddressWithoutPostalCode}
                          </a>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Client Tags
                        </p>
                        <div className="mt-1">
                          {task.customerTags && task.customerTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {task.customerTags.map((tag, index) => (
                                <span
                                  key={tag.id || tag.value || index}
                                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full"
                                >
                                  {tag.name || tag.text || tag.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          Comments
                        </p>
                        <Link
                          to={`/admin/order/${task.orderWjid}/comments`}
                          className="mt-1 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
                          View comments →
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Available Associates Section */}
                  <div className="border-t border-gray-200">
                    <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                      <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-2" />
                        Available Associates
                      </h2>
                    </div>

                    {task.orderSkillSets && task.orderSkillSets.length > 0 && (
                      <div className="px-4 sm:px-6 pt-4">
                        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
                          <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Note:</strong> Associates are filtered by
                            matching skill sets. Green highlighted skills match
                            the job requirements.
                          </span>
                        </div>
                      </div>
                    )}

                    {selectedAssociateId && (
                      <div className="px-4 sm:px-6 pt-4">
                        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                          <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                          <span className="text-sm">
                            <strong>Associate Selected:</strong> You have
                            already selected an associate. You can continue or
                            choose a different one.
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="p-4 sm:p-6">
                      {associates &&
                      associates.results &&
                      associates.results.length > 0 ? (
                        <>
                          {/* Desktop View */}
                          <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    #
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Phone
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contacts (30d)
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    WSIB #
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Rate
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Matching Skills
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Action
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {associates.results.map((associate, index) => {
                                  const isSelected =
                                    selectedAssociateId === associate.id;
                                  return (
                                    <tr
                                      key={associate.id}
                                      className={
                                        isSelected
                                          ? "bg-green-50"
                                          : "hover:bg-gray-50"
                                      }
                                    >
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {index + 1}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <Link
                                          to={`/admin/associate/${associate.id}`}
                                          target="_blank"
                                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                        >
                                          {associate.name}
                                        </Link>
                                        {isSelected && (
                                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            Selected
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        {associate.phone ? (
                                          <a
                                            href={`tel:${associate.phone}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                          >
                                            <PhoneIcon className="w-4 h-4 mr-1" />
                                            {associate.phone}
                                          </a>
                                        ) : (
                                          <span className="text-sm text-gray-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        {associate.email ? (
                                          <a
                                            href={`mailto:${associate.email}`}
                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                          >
                                            <EnvelopeIcon className="w-4 h-4 mr-1" />
                                            {associate.email}
                                          </a>
                                        ) : (
                                          <span className="text-sm text-gray-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {associate.contactsLast30Days || 0}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {associate.wsibNumber || (
                                          <span className="text-gray-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        {associate.hourlySalaryDesired ? (
                                          <span className="text-sm text-green-600 font-medium">
                                            ${associate.hourlySalaryDesired}/hr
                                          </span>
                                        ) : (
                                          <span className="text-sm text-gray-400">
                                            -
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-4 py-4">
                                        {renderSkillSets(
                                          associate.skillSets,
                                          task?.orderSkillSets,
                                        )}
                                      </td>
                                      <td className="px-4 py-4 whitespace-nowrap">
                                        <button
                                          className={`inline-flex items-center px-3 py-1.5 text-xs font-medium text-white rounded-md ${
                                            isSelected
                                              ? "bg-green-600 hover:bg-green-700"
                                              : "bg-blue-600 hover:bg-blue-700"
                                          }`}
                                          onClick={() =>
                                            onSelectClick(associate)
                                          }
                                        >
                                          {isSelected ? "Reselect" : "Assign"}
                                          <ArrowRightIcon className="w-3 h-3 ml-1" />
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>

                          {/* Mobile View */}
                          <div className="md:hidden space-y-4">
                            {associates.results.map((associate, index) => {
                              const isSelected =
                                selectedAssociateId === associate.id;
                              return (
                                <div
                                  key={associate.id}
                                  className={`p-4 rounded-lg border ${
                                    isSelected
                                      ? "bg-green-50 border-green-200"
                                      : "bg-white border-gray-200"
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <Link
                                        to={`/admin/associate/${associate.id}`}
                                        target="_blank"
                                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                      >
                                        {associate.name}
                                      </Link>
                                      {isSelected && (
                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                      #{index + 1}
                                    </span>
                                  </div>

                                  <div className="space-y-2 text-sm">
                                    {associate.phone && (
                                      <div className="flex items-center">
                                        <PhoneIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        <a
                                          href={`tel:${associate.phone}`}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          {associate.phone}
                                        </a>
                                      </div>
                                    )}

                                    {associate.email && (
                                      <div className="flex items-center">
                                        <EnvelopeIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        <a
                                          href={`mailto:${associate.email}`}
                                          className="text-blue-600 hover:text-blue-800"
                                        >
                                          {associate.email}
                                        </a>
                                      </div>
                                    )}

                                    {associate.organizationName && (
                                      <div className="flex items-center">
                                        <BuildingOfficeIcon className="w-4 h-4 mr-2 text-gray-400" />
                                        <span className="text-gray-900">
                                          {associate.organizationName}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Contacts (30d):
                                      </span>
                                      <span className="text-gray-900">
                                        {associate.contactsLast30Days || 0}
                                      </span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        WSIB #:
                                      </span>
                                      <span className="text-gray-900">
                                        {associate.wsibNumber || "-"}
                                      </span>
                                    </div>

                                    <div className="flex justify-between">
                                      <span className="text-gray-500">
                                        Rate:
                                      </span>
                                      <span className="text-green-600 font-medium">
                                        {associate.hourlySalaryDesired
                                          ? `$${associate.hourlySalaryDesired}/hr`
                                          : "-"}
                                      </span>
                                    </div>

                                    <div>
                                      <span className="text-gray-500">
                                        Skills:
                                      </span>
                                      <div className="mt-1">
                                        {renderSkillSets(
                                          associate.skillSets,
                                          task?.orderSkillSets,
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <button
                                    className={`mt-4 w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md ${
                                      isSelected
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                    }`}
                                    onClick={() => onSelectClick(associate)}
                                  >
                                    {isSelected ? "Reselect" : "Assign"}
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-12">
                          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No Associates Available
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {task.orderSkillSets &&
                            task.orderSkillSets.length > 0 ? (
                              <>
                                No active associates found with the required
                                skill sets.{" "}
                                <Link
                                  to="/admin/associates/add/step-1-search"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Click here →
                                </Link>{" "}
                                to add a new associate.
                              </>
                            ) : (
                              <>
                                No active associates found.{" "}
                                <Link
                                  to="/admin/associates/add/step-1-search"
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Click here →
                                </Link>{" "}
                                to add a new associate.
                              </>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0">
                    <Link
                      to={`/admin/task/${tid}/assign-associate/step-1`}
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 w-full sm:w-auto"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Back to Step 1
                    </Link>
                    {selectedAssociateId && (
                      <Link
                        to={`/admin/task/${tid}/assign-associate/step-3`}
                        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
                      >
                        Continue to Step 3
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Link>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep2Page;
