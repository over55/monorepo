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
} from "@heroicons/react/24/outline";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import {
  TASK_ASSIGN_ASSOCIATE_STATUS,
  TASK_HOW_JOB_ACCEPTED,
  TASK_WHY_JOB_DECLINED,
  TASK_WIZARD_STEPS,
  TASK_PROGRESS_PERCENTAGE,
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
                <span className="sm:hidden">Home</span>
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
                  <ClipboardDocumentCheckIcon className="w-4 h-4 mr-2" />
                  Task Detail
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
            Task - Assign Associate
          </h1>
        </div>

        {/* Wizard Steps - Responsive Version */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            {/* Mobile/Tablet View (< 1024px) */}
            <div className="lg:hidden w-full overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Search
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Find Associate
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-green-600"></div>

                {/* Step 2 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Select
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Choose Associate
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Confirm
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Job Status
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      4
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Complete
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Assignment Done
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View (≥ 1024px) */}
            <div className="hidden lg:flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Find Associate</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Select</p>
                  <p className="text-xs text-gray-500">Choose Associate</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

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
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

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

        {/* Error Message */}
        {errors && Object.keys(errors).length > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {Object.entries(errors).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2" />
              Assignment Confirmation
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Processing...</span>
              </div>
            ) : (
              <form onSubmit={onSubmitClick} className="max-w-2xl mx-auto">
                <div className="space-y-4">
                  {/* Previous Data Loaded Notification */}
                  {status !== 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-sm text-blue-800 flex items-center">
                        <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                        <span>
                          Your previous responses have been loaded. You can
                          review and modify them if needed.
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Associate Info */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Associate
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <Link
                        to={`/admin/associate/${associateData.associateID}`}
                        className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                      >
                        <UserIcon className="w-5 h-5 mr-2" />
                        {associateData.associateName}
                      </Link>
                    </div>
                  </div>

                  {/* Accepted Job? */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Accepted Job? <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                          <CheckIcon className="w-5 h-5 mr-2 text-green-600" />
                          Yes
                        </span>
                      </label>
                      <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                          No
                        </span>
                      </label>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.status}
                      </p>
                    )}
                  </div>

                  {/* How was job accepted */}
                  {status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        How was this job accepted?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="howWasJobAccepted"
                            value={TASK_HOW_JOB_ACCEPTED.PHONE}
                            checked={
                              howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.PHONE
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
                            Phone
                          </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                            Text
                          </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="howWasJobAccepted"
                            value={TASK_HOW_JOB_ACCEPTED.EMAIL}
                            checked={
                              howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.EMAIL
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
                            Email
                          </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                            In-person confirmation
                          </span>
                        </label>
                      </div>
                      {errors.howWasJobAccepted && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.howWasJobAccepted}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Why was job declined */}
                  {status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Why was this job declined?{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                            Associate was busy
                          </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="whyJobDeclined"
                            value={TASK_WHY_JOB_DECLINED.NO_SKILLS}
                            checked={
                              whyJobDeclined === TASK_WHY_JOB_DECLINED.NO_SKILLS
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
                            Associate does not have the skills
                          </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="radio"
                            name="whyJobDeclined"
                            value={TASK_WHY_JOB_DECLINED.NO_TRAVEL}
                            checked={
                              whyJobDeclined === TASK_WHY_JOB_DECLINED.NO_TRAVEL
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
                            Associate does not wish to travel to the customer's
                            location
                          </span>
                        </label>
                        <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
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
                            Associate does not wish to work with this client
                          </span>
                        </label>
                      </div>
                      {errors.whyJobDeclined && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.whyJobDeclined}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Predefined Comment */}
                  {status !== 0 && predefinedComment && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Predefined Comment
                      </label>
                      <div className="relative">
                        <textarea
                          value={predefinedComment}
                          disabled={true}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                        />
                      </div>
                    </div>
                  )}

                  {/* Additional Comment */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Comment (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Write any additional comments here."
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <Link
                    to={`/admin/task/${tid}/assign-associate/step-2`}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Step 2
                  </Link>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
