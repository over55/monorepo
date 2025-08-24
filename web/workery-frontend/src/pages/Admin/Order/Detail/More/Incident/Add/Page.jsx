// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Incident/Add/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  FireIcon,
  ChevronLeftIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  UserGroupIcon,
  UserIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderManager,
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../../../../services/Services";
import { ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../../../constants/FieldOptions";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../../../../constants/OrderIncident";

function AdminOrderDetailMoreIncidentAddPage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [startDate, setStartDate] = useState("");
  const [initiator, setInitiator] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingReason, setClosingReason] = useState(0);
  const [closingReasonOther, setClosingReasonOther] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrderDetail = async () => {
    setFetching(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
      console.log(
        "AdminOrderDetailMoreIncidentAddPage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentAddPage: Failed to fetch order:",
        error,
      );
      setErrors({ general: "Failed to load order details" });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Handle form submission
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // Validate fields
    if (!startDate) {
      newErrors["startDate"] = "Start date is required";
      hasErrors = true;
    }
    if (!initiator) {
      newErrors["initiator"] = "Please select who initiated this incident";
      hasErrors = true;
    }
    if (!title) {
      newErrors["title"] = "Title is required";
      hasErrors = true;
    }
    if (!description) {
      newErrors["description"] = "Description is required";
      hasErrors = true;
    }
    if (closingReason === 1 && !closingReasonOther) {
      newErrors["closingReasonOther"] = "Please specify the reason";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Prepare payload
    const incidentData = {
      orderId: oid,
      initiator: initiator,
      title: title,
      description: description,
      startDate: startDate,
      closingReason: closingReason,
      closingReasonOther: closingReasonOther,
    };

    console.log("onSubmitClick | payload:", incidentData);

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await orderIncidentManager.createOrderIncident(
        incidentData,
        onUnauthorized,
      );

      console.log(
        "AdminOrderDetailMoreIncidentAddPage: Incident created successfully",
      );

      // Show success message
      setAlertMessage("Incident created successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more/incident/${response.id}`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentAddPage: Failed to create incident:",
        error,
      );
      setErrors(error);
      setAlertMessage("Failed to create incident");
      setAlertStatus("error");
      window.scrollTo(0, 0);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchOrderDetail();
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}/more`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Order #{oid} (More)
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}/more/incidents`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <FireIcon className="w-4 h-4 mr-2" />
                  Incidents
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PlusCircleIcon className="w-4 h-4 mr-2" />
                Add
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FireIcon className="w-8 h-8 mr-3 text-orange-600" />
              Order - Add Incident
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Report and document incidents related to this order
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

      {/* Alert Messages */}
      {alertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
            alertStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {alertStatus === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{alertMessage}</span>
          </div>
          <button
            onClick={() => {
              setAlertMessage("");
              setAlertStatus("");
            }}
            className="ml-4 hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <PlusCircleIcon className="w-6 h-6 mr-2 text-orange-600" />
            New Incident
          </h2>
        </div>

        <div className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading order details...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    <span>{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Form Validation Errors */}
              {errors && Object.keys(errors).length > 0 && !errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-start">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        There were errors with your submission:
                      </p>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        {Object.entries(errors).map(([key, value]) => (
                          <li key={key} className="text-sm">
                            {value}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              <p className="mb-6 text-gray-600">
                Please fill out all the required fields before submitting this
                form.
              </p>

              {/* Form */}
              <div className="space-y-6">
                {/* Start Date Input */}
                <div>
                  <label
                    htmlFor="startDate"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.startDate
                        ? "border-red-300 text-red-900"
                        : "border-gray-300"
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Please enter the date this incident began
                  </p>
                  {errors.startDate && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                {/* Initiator Radio Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Who initiated this incident?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="initiator"
                        value={ORDER_INCIDENT_INIATOR_CLIENT}
                        checked={initiator === ORDER_INCIDENT_INIATOR_CLIENT}
                        onChange={(e) => setInitiator(parseInt(e.target.value))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-3 flex items-center">
                        <UserIcon className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          Client
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="initiator"
                        value={ORDER_INCIDENT_INIATOR_ASSOCIATE}
                        checked={initiator === ORDER_INCIDENT_INIATOR_ASSOCIATE}
                        onChange={(e) => setInitiator(parseInt(e.target.value))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-3 flex items-center">
                        <UserGroupIcon className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          Associate
                        </span>
                      </span>
                    </label>
                    <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="initiator"
                        value={ORDER_INCIDENT_INIATOR_STAFF}
                        checked={initiator === ORDER_INCIDENT_INIATOR_STAFF}
                        onChange={(e) => setInitiator(parseInt(e.target.value))}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-3 flex items-center">
                        <BriefcaseIcon className="w-5 h-5 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">
                          Staff
                        </span>
                      </span>
                    </label>
                  </div>
                  {errors.initiator && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.initiator}
                    </p>
                  )}
                </div>

                {/* Title Input */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter incident title"
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.title
                        ? "border-red-300 text-red-900 placeholder-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description TextArea */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the incident"
                    rows={5}
                    maxLength={1000}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.description
                        ? "border-red-300 text-red-900 placeholder-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {description.length}/1000 characters
                  </p>
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Closing Reason Select */}
                <div>
                  <label
                    htmlFor="closingReason"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Closing Reason (Optional)
                  </label>
                  <select
                    id="closingReason"
                    name="closingReason"
                    value={closingReason}
                    onChange={(e) => setClosingReason(parseInt(e.target.value))}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                      errors.closingReason
                        ? "border-red-300 text-red-900"
                        : "border-gray-300"
                    }`}
                  >
                    {ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS.map(
                      (option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ),
                    )}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    If this incident was resolved, please select the closing
                    reason for this incident
                  </p>
                  {errors.closingReason && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.closingReason}
                    </p>
                  )}
                </div>

                {/* Closing Reason Other Field */}
                {closingReason === 1 && (
                  <div>
                    <label
                      htmlFor="closingReasonOther"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Reason (Other) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="closingReasonOther"
                      name="closingReasonOther"
                      value={closingReasonOther}
                      onChange={(e) => setClosingReasonOther(e.target.value)}
                      placeholder="Please specify the reason"
                      rows={5}
                      maxLength={500}
                      className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm ${
                        errors.closingReasonOther
                          ? "border-red-300 text-red-900 placeholder-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {closingReasonOther.length}/500 characters
                    </p>
                    {errors.closingReasonOther && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.closingReasonOther}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <Link to={`/admin/order/${oid}/more/incidents`}>
                    <button
                      type="button"
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                      Back to Incidents
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={onSubmitClick}
                    disabled={isSubmitting}
                    className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                      isSubmitting
                        ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                        : "border-transparent text-white bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailMoreIncidentAddPage;
