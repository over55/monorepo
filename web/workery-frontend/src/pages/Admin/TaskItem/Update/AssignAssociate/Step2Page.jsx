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
  WrenchScrewdriverIcon,
  BriefcaseIcon,
  UserIcon,
  CalendarDaysIcon,
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

  // Section Component - Using dark header pattern
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
                  <UserGroupIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Select Associate
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
                <UserGroupIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                Select Associate
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Choose the best associate for this task
              </p>
            </div>
          </div>
        </div>

        {/* Status Banner - Responsive */}
        {task && task.status === 2 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
            <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            <strong>Note:</strong> This task is archived.
          </div>
        )}

        {/* Wizard Steps - Responsive */}
        <div className="mb-4 sm:mb-6 bg-white shadow-sm rounded-lg p-3 sm:p-4">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 2: Select
                  </p>
                  <p className="text-xs text-gray-500">Choose associate</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">2 of 4</div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "50%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-4 w-16 h-0.5 bg-green-600"></div>

              {/* Step 2 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Select</p>
                  <p className="text-xs text-gray-500">Associate</p>
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
                  <p className="text-sm font-medium text-gray-500">Confirm</p>
                  <p className="text-xs text-gray-400">Assignment</p>
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
                  <p className="text-sm font-medium text-gray-500">Complete</p>
                  <p className="text-xs text-gray-400">Finish</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message - Responsive */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
              <span className="flex items-center">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                <strong>Error:</strong>
                {Object.entries(errors).map(([key, value]) => (
                  <span key={key} className="ml-2 break-words">
                    {key}: {value}
                  </span>
                ))}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
              >
                <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {isFetching ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          ) : (
            <>
              {task && (
                <>
                  {/* Task Details Section using Dark Header Pattern */}
                  <DetailSection
                    title="Task Details"
                    icon={ClipboardDocumentListIcon}
                  >
                    <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <DetailField label="Type" value="Assign Associate" />
                      <DetailField
                        label="Description"
                        value={task.description}
                      />
                      <DetailField
                        label="Job #"
                        value={
                          <Link
                            to={`/admin/order/${task.orderWjid}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {task.orderWjid} →
                          </Link>
                        }
                      />
                      <DetailField
                        label="Job Start Date"
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
                      <div>
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Job Skill Sets
                        </dt>
                        <dd>
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
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Job Tags
                        </dt>
                        <dd>
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
                        </dd>
                      </div>
                      <DetailField
                        label="Client Name"
                        icon={UserIcon}
                        value={
                          <Link
                            to={`/admin/customer/${task.customerId}`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            {task.customerName} →
                          </Link>
                        }
                      />
                      {task.customerPhone && (
                        <DetailField
                          label={`Client Phone (${CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})`}
                          icon={PhoneIcon}
                          value={
                            <a
                              href={`tel:${task.customerPhone}`}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {task.customerPhone}
                              {task.customerPhoneExtension && (
                                <span className="ml-1">
                                  ext. {task.customerPhoneExtension}
                                </span>
                              )}
                            </a>
                          }
                        />
                      )}
                      {task.customerFullAddressUrl && (
                        <DetailField
                          label="Client Address"
                          icon={MapPinIcon}
                          value={
                            <a
                              href={task.customerFullAddressUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              {task.customerFullAddressWithoutPostalCode}
                            </a>
                          }
                          fullWidth
                        />
                      )}
                      <div>
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 flex items-center">
                          <TagIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Client Tags
                        </dt>
                        <dd>
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
                        </dd>
                      </div>
                      <DetailField
                        label="Comments"
                        icon={ChatBubbleLeftRightIcon}
                        value={
                          <Link
                            to={`/admin/order/${task.orderWjid}/comments`}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            View comments →
                          </Link>
                        }
                      />
                    </dl>
                  </DetailSection>

                  {/* Available Associates Section */}
                  <DetailSection
                    title="Available Associates"
                    icon={UserGroupIcon}
                  >
                    {task.orderSkillSets && task.orderSkillSets.length > 0 && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
                        <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                        <strong>Note:</strong> Associates are filtered by
                        matching skill sets. Green highlighted skills match the
                        job requirements.
                      </div>
                    )}

                    {selectedAssociateId && (
                      <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
                        <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                        <strong>Associate Selected:</strong> You have already
                        selected an associate. You can continue or choose a
                        different one.
                      </div>
                    )}

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
                                        <span className="text-gray-400">-</span>
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
                                        onClick={() => onSelectClick(associate)}
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
                                        className="text-blue-600 hover:text-blue-800 break-all"
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
                                    <span className="text-gray-500">Rate:</span>
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
                              No active associates found with the required skill
                              sets.{" "}
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
                  </DetailSection>

                  {/* Navigation Buttons - Responsive */}
                  <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-3">
                    <Link
                      to={`/admin/task/${tid}/assign-associate/step-1`}
                      className="order-2 sm:order-1"
                    >
                      <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Step 1
                      </button>
                    </Link>
                    {selectedAssociateId && (
                      <Link
                        to={`/admin/task/${tid}/assign-associate/step-3`}
                        className="order-1 sm:order-2"
                      >
                        <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                          Continue to Step 3
                          <ArrowRightIcon className="w-4 h-4 ml-2" />
                        </button>
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
