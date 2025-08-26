// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useAuthManager } from "../../../../../services/Services";
import {
  ClipboardDocumentCheckIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  UserIcon,
  CheckIcon,
  ArrowRightIcon,
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  XCircleIcon,
  ClockIcon,
  WrenchScrewdriverIcon,
  MapPinIcon,
  UsersIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import {
  TASK_ASSIGN_ASSOCIATE_STATUS,
  TASK_HOW_JOB_ACCEPTED,
  TASK_WHY_JOB_DECLINED,
} from "../../../../../constants/Task";

function AdminTaskItemAssignAssociateStep3Page() {
  const authManager = useAuthManager();
  const { tid } = useParams();

  // Component states
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [associateData, setAssociateData] = useState(null);
  const [status, setStatus] = useState(0);
  const [predefinedComment, setPredefinedComment] = useState("");
  const [comment, setComment] = useState("");
  const [howWasJobAccepted, setHowWasJobAccepted] = useState(0);
  const [whyJobDeclined, setWhyJobDeclined] = useState(0);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication and load associate data
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      setForceURL("/login");
      return;
    }

    const storedData = sessionStorage.getItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
    );
    if (!storedData) {
      setForceURL(`/admin/task/${tid}/assign-associate/step-2`);
      return;
    }

    const data = JSON.parse(storedData);
    setAssociateData(data);

    // Load previously entered form data if it exists
    if (data.status !== undefined && data.status !== null) {
      console.log("Loading previous form data from sessionStorage");

      // Set the status
      setStatus(data.status);

      // Set the comment
      setComment(data.comment || "");

      // Set the predefined comment
      setPredefinedComment(data.predefinedComment || "");

      // Set how job was accepted or why it was declined based on status
      if (data.status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED) {
        setHowWasJobAccepted(data.howWasJobAccepted || 0);
        setWhyJobDeclined(0);
      } else if (data.status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED) {
        setWhyJobDeclined(data.whyJobDeclined || 0);
        setHowWasJobAccepted(0);
      }
    }

    setIsDataLoaded(true);
  }, [authManager, tid]);

  // Event handling
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (!status || status === 0) {
      newErrors["status"] = "Please select whether the job was accepted";
      hasErrors = true;
    } else {
      if (
        status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED &&
        (!howWasJobAccepted || howWasJobAccepted === 0)
      ) {
        newErrors["howWasJobAccepted"] =
          "Please select how the job was accepted";
        hasErrors = true;
      }
      if (
        status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED &&
        (!whyJobDeclined || whyJobDeclined === 0)
      ) {
        newErrors["whyJobDeclined"] = "Please select why the job was declined";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to session storage with existing data
    const updatedData = {
      ...associateData,
      status: status,
      comment: comment,
      howWasJobAccepted: howWasJobAccepted,
      whyJobDeclined: whyJobDeclined,
      predefinedComment: predefinedComment,
    };
    sessionStorage.setItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
      JSON.stringify(updatedData),
    );

    // Redirect to the next page
    setForceURL(`/admin/task/${tid}/assign-associate/step-4`);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    // Only reset these if we're changing to a different status
    if (value !== status) {
      setPredefinedComment("");
      setHowWasJobAccepted(0);
      setWhyJobDeclined(0);
    }
  };

  const handleHowAcceptedChange = (value) => {
    setHowWasJobAccepted(value);

    const todayDate = new Date().toISOString().slice(0, 10);
    let method = "";
    switch (value) {
      case TASK_HOW_JOB_ACCEPTED.PHONE:
        method = "phone";
        break;
      case TASK_HOW_JOB_ACCEPTED.TEXT:
        method = "text";
        break;
      case TASK_HOW_JOB_ACCEPTED.EMAIL:
        method = "email";
        break;
      case TASK_HOW_JOB_ACCEPTED.IN_PERSON:
        method = "in-person confirmation";
        break;
      default:
    }

    if (method && associateData) {
      setPredefinedComment(
        `Job accepted by ${associateData.associateName} on ${todayDate} via ${method}.`,
      );
    }
  };

  const handleWhyDeclinedChange = (value) => {
    setWhyJobDeclined(value);

    const todayDate = new Date().toISOString().slice(0, 10);
    let reason = "";
    switch (value) {
      case TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY:
        reason = "associate was busy";
        break;
      case TASK_WHY_JOB_DECLINED.NO_SKILLS:
        reason = "associate does not have the skills";
        break;
      case TASK_WHY_JOB_DECLINED.NO_TRAVEL:
        reason = "associate does not wish to travel to the customer's location";
        break;
      case TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT:
        reason = "associate does not wish to work with this client";
        break;
      default:
    }

    if (reason && associateData) {
      setPredefinedComment(
        `Job declined by ${associateData.associateName} on ${todayDate} because ${reason}.`,
      );
    }
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

  // Component rendering
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  if (!associateData || !isDataLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
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
                  <ClipboardDocumentCheckIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Assignment Details
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
                <ClipboardDocumentCheckIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                Assignment Confirmation
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Confirm assignment details
              </p>
            </div>
          </div>
        </div>

        {/* Wizard Steps - Responsive */}
        <div className="mb-4 sm:mb-6 bg-white shadow-sm rounded-lg p-3 sm:p-4">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 3: Confirm
                  </p>
                  <p className="text-xs text-gray-500">Job acceptance status</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">3 of 4</div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full"
                  style={{ width: "75%" }}
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
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-4 w-16 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Select</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-4 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Confirm</p>
                  <p className="text-xs text-gray-500">Job Status</p>
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
                  <p className="text-xs text-gray-400">Assignment Done</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message - Responsive */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            {Object.entries(errors).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                <span>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Previous Data Loaded Notification */}
        {status !== 0 && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <p className="flex items-center">
              <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              Your previous responses have been loaded. You can review and
              modify them if needed.
            </p>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
              Assignment Details
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600 text-sm sm:text-base">
                  Processing...
                </span>
              </div>
            ) : (
              <form onSubmit={onSubmitClick} className="max-w-3xl mx-auto">
                {/* Associate Information Section */}
                <DetailSection title="Selected Associate" icon={UserIcon}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                        Associate Name
                      </dt>
                      <dd className="text-base sm:text-lg font-medium text-gray-900">
                        <Link
                          to={`/admin/associate/${associateData.associateID}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {associateData.associateName}
                        </Link>
                      </dd>
                    </div>
                    {associateData.associatePhone && (
                      <div>
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Phone
                        </dt>
                        <dd className="text-base sm:text-lg font-medium text-gray-900">
                          <a
                            href={`tel:${associateData.associatePhone}`}
                            className="text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <PhoneIcon className="w-4 h-4 mr-1" />
                            {associateData.associatePhone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {associateData.associateEmail && (
                      <div className="lg:col-span-2">
                        <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                          Email
                        </dt>
                        <dd className="text-base sm:text-lg font-medium text-gray-900">
                          <a
                            href={`mailto:${associateData.associateEmail}`}
                            className="text-blue-600 hover:text-blue-700 flex items-center break-all"
                          >
                            <EnvelopeIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                            {associateData.associateEmail}
                          </a>
                        </dd>
                      </div>
                    )}
                  </div>
                </DetailSection>

                {/* Job Acceptance Status Section */}
                <DetailSection
                  title="Job Acceptance Status"
                  icon={ClipboardDocumentCheckIcon}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Has the associate accepted this job?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value={TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED}
                            checked={
                              status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED,
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-3 flex items-center">
                            <CheckCircleIcon className="w-5 h-5 mr-2 text-green-600" />
                            <span className="text-base font-medium">
                              Yes - Job Accepted
                            </span>
                          </span>
                        </label>
                        <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                          <input
                            type="radio"
                            name="status"
                            value={TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED}
                            checked={
                              status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED
                            }
                            onChange={(e) =>
                              handleStatusChange(
                                TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED,
                              )
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-3 flex items-center">
                            <XCircleIcon className="w-5 h-5 mr-2 text-red-600" />
                            <span className="text-base font-medium">
                              No - Job Declined
                            </span>
                          </span>
                        </label>
                      </div>
                      {errors.status && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.status}
                        </p>
                      )}
                    </div>

                    {/* How was job accepted */}
                    {status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED && (
                      <div className="pt-4 border-t">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          How was this job accepted?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="howWasJobAccepted"
                              value={TASK_HOW_JOB_ACCEPTED.PHONE}
                              checked={
                                howWasJobAccepted ===
                                TASK_HOW_JOB_ACCEPTED.PHONE
                              }
                              onChange={(e) =>
                                handleHowAcceptedChange(
                                  TASK_HOW_JOB_ACCEPTED.PHONE,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <PhoneIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">Phone Call</span>
                            </span>
                          </label>
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="howWasJobAccepted"
                              value={TASK_HOW_JOB_ACCEPTED.TEXT}
                              checked={
                                howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.TEXT
                              }
                              onChange={(e) =>
                                handleHowAcceptedChange(
                                  TASK_HOW_JOB_ACCEPTED.TEXT,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">Text Message</span>
                            </span>
                          </label>
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="howWasJobAccepted"
                              value={TASK_HOW_JOB_ACCEPTED.EMAIL}
                              checked={
                                howWasJobAccepted ===
                                TASK_HOW_JOB_ACCEPTED.EMAIL
                              }
                              onChange={(e) =>
                                handleHowAcceptedChange(
                                  TASK_HOW_JOB_ACCEPTED.EMAIL,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">Email</span>
                            </span>
                          </label>
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="howWasJobAccepted"
                              value={TASK_HOW_JOB_ACCEPTED.IN_PERSON}
                              checked={
                                howWasJobAccepted ===
                                TASK_HOW_JOB_ACCEPTED.IN_PERSON
                              }
                              onChange={(e) =>
                                handleHowAcceptedChange(
                                  TASK_HOW_JOB_ACCEPTED.IN_PERSON,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <UserGroupIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">
                                In-person confirmation
                              </span>
                            </span>
                          </label>
                        </div>
                        {errors.howWasJobAccepted && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.howWasJobAccepted}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Why was job declined */}
                    {status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED && (
                      <div className="pt-4 border-t">
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Why was this job declined?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="whyJobDeclined"
                              value={TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY}
                              checked={
                                whyJobDeclined ===
                                TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY
                              }
                              onChange={(e) =>
                                handleWhyDeclinedChange(
                                  TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <ClockIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">
                                Associate was busy
                              </span>
                            </span>
                          </label>
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="whyJobDeclined"
                              value={TASK_WHY_JOB_DECLINED.NO_SKILLS}
                              checked={
                                whyJobDeclined ===
                                TASK_WHY_JOB_DECLINED.NO_SKILLS
                              }
                              onChange={(e) =>
                                handleWhyDeclinedChange(
                                  TASK_WHY_JOB_DECLINED.NO_SKILLS,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">
                                Associate does not have the required skills
                              </span>
                            </span>
                          </label>
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="whyJobDeclined"
                              value={TASK_WHY_JOB_DECLINED.NO_TRAVEL}
                              checked={
                                whyJobDeclined ===
                                TASK_WHY_JOB_DECLINED.NO_TRAVEL
                              }
                              onChange={(e) =>
                                handleWhyDeclinedChange(
                                  TASK_WHY_JOB_DECLINED.NO_TRAVEL,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <MapPinIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">
                                Associate does not wish to travel to the
                                customer's location
                              </span>
                            </span>
                          </label>
                          <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="whyJobDeclined"
                              value={TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT}
                              checked={
                                whyJobDeclined ===
                                TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT
                              }
                              onChange={(e) =>
                                handleWhyDeclinedChange(
                                  TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT,
                                )
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-3 flex items-center">
                              <UsersIcon className="w-5 h-5 mr-2 text-gray-600" />
                              <span className="text-base">
                                Associate does not wish to work with this client
                              </span>
                            </span>
                          </label>
                        </div>
                        {errors.whyJobDeclined && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.whyJobDeclined}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </DetailSection>

                {/* Comments Section */}
                <DetailSection title="Comments" icon={ChatBubbleLeftRightIcon}>
                  {/* Predefined Comment */}
                  {status !== 0 && predefinedComment && (
                    <div className="mb-4">
                      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                        System Generated Comment
                      </label>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                        <p className="text-sm sm:text-base text-gray-700">
                          {predefinedComment}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Additional Comment */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                      Additional Comments (Optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add any additional notes or comments about this assignment..."
                      rows={5}
                      className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      This comment will be added to the task history.
                    </p>
                  </div>
                </DetailSection>

                {/* Form Actions - Responsive */}
                <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 gap-3">
                  <Link
                    to={`/admin/task/${tid}/assign-associate/step-2`}
                    className="order-2 sm:order-1"
                  >
                    <button
                      type="button"
                      className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Back to Step 2
                    </button>
                  </Link>
                  <button
                    type="submit"
                    className="order-1 sm:order-2 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Confirm & Continue
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep3Page;
