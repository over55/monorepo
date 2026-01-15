// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderIncident/Add/Page.jsx
// UIX Upgraded - Uses UIX primitives (Breadcrumb, Spinner, UIXThemeProvider, useUIXTheme)

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import {
  useOrderIncidentManager,
  useOrderManager,
  useAuthManager,
} from "../../../../services/Services";
import { ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../constants/FieldOptions";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../constants/OrderIncident";
import {
  Breadcrumb,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ChartBarIcon,
  FireIcon,
  PlusCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

function AdminOrderIncidentAddPage() {
  const orderIncidentManager = useOrderIncidentManager();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    bgCard: getThemeClasses("bg-card"),
    cardBorder: getThemeClasses("card-border"),
  }), [getThemeClasses]);

  // Component states
  const [errors, setErrors] = useState({});
  const [startDate, setStartDate] = useState("");
  const [initiator, setInitiator] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingReason, setClosingReason] = useState(0);
  const [closingReasonOther, setClosingReasonOther] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Order selection states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [ordersList, setOrdersList] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchPage, setOrderSearchPage] = useState(1);
  const [ordersTotalCount, setOrdersTotalCount] = useState(0);

  // Use ref for search timer to avoid stale closures
  const searchTimerRef = useRef(null);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Incidents",
      to: "/admin/order-incidents",
      icon: FireIcon,
    },
    {
      label: "New",
      icon: PlusCircleIcon,
      isActive: true,
    },
  ], []);

  // Helper function to safely get field values from order object
  const getFieldValue = (obj, path, defaultValue = "") => {
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined && current[key] !== null
        ? current[key]
        : defaultValue;
    }, obj);
  };

  // Format customer name from order data
  const getCustomerName = (order) => {
    const fullName = getFieldValue(order, "customerName", "");
    const orgName = getFieldValue(order, "customerOrganizationName", "");

    if (orgName) return orgName;
    return fullName || "N/A";
  };

  // Format associate name from order data
  const getAssociateName = (order) => {
    const fullName = getFieldValue(order, "associateName", "");
    return fullName || "Not assigned";
  };

  // Fetch orders for selection modal
  const fetchOrders = async (searchText = "", page = 1) => {
    console.log("fetchOrders called with:", { searchText, page });

    setIsLoadingOrders(true);
    try {
      const params = {
        page: page,
        limit: 10,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      if (searchText && searchText.trim()) {
        params.search = searchText.trim();
      }

      console.log("Fetching orders with params:", params);

      // Clear the orders cache to ensure fresh data
      orderManager.clearOrdersCache();

      // Fetch orders using the OrderManager
      const data = await orderManager.getOrders(params, onUnauthorized, true);

      console.log("Orders fetched successfully:", {
        count: data.count,
        resultsLength: data.results ? data.results.length : 0,
      });

      setOrdersList(data.results || []);
      setOrdersTotalCount(data.count || 0);
      setOrderSearchPage(page);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrdersList([]);
      setOrdersTotalCount(0);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Handle order search with debouncing
  const handleOrderSearch = (e) => {
    const query = e.target.value;
    console.log("handleOrderSearch - query changed to:", query);

    setOrderSearchQuery(query);
    setOrderSearchPage(1);

    // Clear existing timer
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }

    // Show loading immediately for better UX
    setIsLoadingOrders(true);

    // Set new timer for debounced search
    searchTimerRef.current = setTimeout(() => {
      console.log("Debounce timer fired, fetching with query:", query);
      fetchOrders(query, 1);
    }, 500);
  };

  // Handle order selection
  const handleOrderSelect = (order) => {
    console.log("Order selected:", order);
    setSelectedOrder(order);
    setShowOrderModal(false);
    setOrderSearchQuery("");

    // Clear timer if exists
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  };

  // Remove selected order
  const handleRemoveOrder = () => {
    setSelectedOrder(null);
  };

  // Open order modal
  const handleOpenOrderModal = () => {
    console.log("Opening order modal");
    setShowOrderModal(true);
    setOrderSearchQuery("");
    setOrderSearchPage(1);
    setOrdersList([]);
    fetchOrders("", 1);
  };

  // Handle modal close
  const handleCloseOrderModal = () => {
    console.log("Closing order modal");
    setShowOrderModal(false);
    setOrderSearchQuery("");
    setOrdersList([]);
    setOrdersTotalCount(0);

    // Clear timer if exists
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    console.log("Page change to:", newPage);
    setOrderSearchPage(newPage);
    fetchOrders(orderSearchQuery, newPage);
  };

  // Format order status
  const getOrderStatusLabel = (status) => {
    const statusMap = {
      1: "New",
      2: "Declined",
      3: "Pending",
      4: "Cancelled",
      5: "Ongoing",
      6: "In Progress",
      7: "Completed but Unpaid",
      8: "Completed and Paid",
      9: "Archived",
    };
    return statusMap[status] || "Unknown";
  };

  // Format order status badge
  const getOrderStatusBadge = (status) => {
    const statusStyles = {
      1: "bg-cyan-100 text-cyan-800",
      2: "bg-red-100 text-red-800",
      3: "bg-yellow-100 text-yellow-800",
      4: "bg-gray-100 text-gray-800",
      5: "bg-blue-100 text-blue-800",
      6: "bg-green-100 text-green-800",
      7: "bg-orange-100 text-orange-800",
      8: "bg-green-100 text-green-800",
      9: "bg-gray-100 text-gray-800",
    };
    return statusStyles[status] || "bg-gray-100 text-gray-800";
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
      initiator: initiator,
      title: title,
      description: description,
      startDate: startDate,
      closingReason: closingReason,
      closingReasonOther: closingReasonOther,
    };

    // Add orderId if an order is selected
    if (selectedOrder) {
      incidentData.orderId = selectedOrder.id || selectedOrder.wjid;
    }

    console.log("onSubmitClick | payload:", incidentData);

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await orderIncidentManager.createOrderIncident(
        incidentData,
        onUnauthorized,
      );

      console.log("AdminOrderIncidentAddPage: Incident created successfully");

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/incident/${response.id}`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderIncidentAddPage: Failed to create incident:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
      setIsSubmitting(false);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(ordersTotalCount / 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-sm">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-sm font-medium text-green-800">
                Incident created successfully! Redirecting...
              </p>
            </div>
          </div>
        )}

        {/* Page Title */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                <FireIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-red-600" />
                New Incident
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Create a new incident report for tracking issues
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Card with Dark Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700 border-b border-gray-600">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <PlusCircleIcon className="w-5 h-5 mr-2 text-blue-400" />
              New Incident Form
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 mt-1">
              Please fill out all the required fields before submitting
            </p>
          </div>

          <div className="p-4 sm:p-6">
            {/* Error Display */}
            {errors && Object.keys(errors).length > 0 && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <div className="flex">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      There were errors with your submission:
                    </h3>
                    <ul className="list-disc list-inside mt-2 text-sm text-red-700">
                      {Object.entries(errors).map(([key, value]) => (
                        <li key={key}>{value}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Work Order Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Work Order (Optional)
              </label>

              {selectedOrder ? (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-semibold text-gray-900">
                          Order #
                          {getFieldValue(selectedOrder, "wjid") ||
                            selectedOrder.id}
                        </span>
                      </div>
                      <div className="text-sm space-y-1 text-gray-700">
                        <div>
                          <span className="font-medium">Customer:</span>{" "}
                          {getCustomerName(selectedOrder)}
                        </div>
                        <div>
                          <span className="font-medium">Associate:</span>{" "}
                          {getAssociateName(selectedOrder)}
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium mr-2">Status:</span>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadge(selectedOrder.status)}`}
                          >
                            {getOrderStatusLabel(selectedOrder.status)}
                          </span>
                        </div>
                        {selectedOrder.description && (
                          <div>
                            <span className="font-medium">Description:</span>{" "}
                            {selectedOrder.description.length > 100
                              ? `${selectedOrder.description.substring(0, 100)}...`
                              : selectedOrder.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleRemoveOrder}
                      className="ml-3 text-red-600 hover:text-red-800 transition-colors"
                      title="Remove order"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <button
                    onClick={handleOpenOrderModal}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                    Select Work Order
                  </button>
                  <p className="mt-2 text-xs text-gray-500">
                    Click to search and select a work order, or leave blank if
                    this incident is not related to a specific order
                  </p>
                </div>
              )}
            </div>

            {/* Start Date Field */}
            <div className="mb-6">
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CalendarIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.startDate ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Please enter the date this incident began
              </p>
            </div>

            {/* Initiator Radio Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Who initiated this incident?{" "}
                <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="initiator"
                    value={ORDER_INCIDENT_INIATOR_CLIENT}
                    checked={initiator === ORDER_INCIDENT_INIATOR_CLIENT}
                    onChange={(e) => setInitiator(parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Client
                  </span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="initiator"
                    value={ORDER_INCIDENT_INIATOR_ASSOCIATE}
                    checked={initiator === ORDER_INCIDENT_INIATOR_ASSOCIATE}
                    onChange={(e) => setInitiator(parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Associate
                  </span>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="initiator"
                    value={ORDER_INCIDENT_INIATOR_STAFF}
                    checked={initiator === ORDER_INCIDENT_INIATOR_STAFF}
                    onChange={(e) => setInitiator(parseInt(e.target.value))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    Staff
                  </span>
                </label>
              </div>
              {errors.initiator && (
                <p className="mt-2 text-sm text-red-600">{errors.initiator}</p>
              )}
            </div>

            {/* Title Field */}
            <div className="mb-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Title <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Enter incident title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description Field */}
            <div className="mb-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  id="description"
                  name="description"
                  placeholder="Describe the incident"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  maxLength={1000}
                  className={`block w-full px-3 py-2 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
              </div>
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {description.length}/1000 characters
              </p>
            </div>

            {/* Closing Reason Field (Optional) */}
            <div className="mb-6">
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
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                If this incident was resolved, please select the closing reason
              </p>
              {errors.closingReason && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.closingReason}
                </p>
              )}
            </div>

            {/* Closing Reason Other Field */}
            {closingReason === 1 && (
              <div className="mb-6">
                <label
                  htmlFor="closingReasonOther"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Reason (Other) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="closingReasonOther"
                  name="closingReasonOther"
                  placeholder="Please specify the reason"
                  value={closingReasonOther}
                  onChange={(e) => setClosingReasonOther(e.target.value)}
                  rows={5}
                  maxLength={500}
                  className={`block w-full px-3 py-2 border ${errors.closingReasonOther ? "border-red-500" : "border-gray-300"} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                />
                {errors.closingReasonOther && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.closingReasonOther}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {closingReasonOther.length}/500 characters
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-between pt-6 border-t gap-3">
              <Link to="/admin/order-incidents">
                <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Incidents
                </button>
              </Link>

              <button
                onClick={onSubmitClick}
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Order Selection Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"
              onClick={handleCloseOrderModal}
            ></div>

            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
              {/* Modal Header with Dark Background */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 sm:px-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white flex items-center">
                    <MagnifyingGlassIcon className="w-5 h-5 mr-2 text-blue-400" />
                    Select Work Order
                  </h3>
                  <button
                    onClick={handleCloseOrderModal}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search by order ID, customer name, or description..."
                      value={orderSearchQuery}
                      onChange={handleOrderSearch}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                  {orderSearchQuery && (
                    <p className="mt-1 text-xs text-gray-500">
                      Searching for: "{orderSearchQuery}"
                    </p>
                  )}
                </div>

                {/* Results Section */}
                <div className="min-h-[200px] max-h-[400px] overflow-y-auto">
                  {isLoadingOrders ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Spinner size="lg" />
                        <p className="mt-3 text-sm text-gray-600">
                          Searching orders...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {ordersList.length > 0 ? (
                        <>
                          {/* Results count */}
                          <div className="mb-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              Found {ordersTotalCount} order
                              {ordersTotalCount !== 1 ? "s" : ""}
                              {orderSearchQuery &&
                                ` matching "${orderSearchQuery}"`}
                            </p>
                          </div>

                          {/* Orders List */}
                          <div className="space-y-2">
                            {ordersList.map((order, index) => (
                              <div
                                key={order.id || order.wjid || index}
                                onClick={() => handleOrderSelect(order)}
                                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-1">
                                      <span className="font-semibold text-gray-900">
                                        #
                                        {getFieldValue(order, "wjid") ||
                                          order.id}
                                      </span>
                                      <span
                                        className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getOrderStatusBadge(order.status)}`}
                                      >
                                        {getOrderStatusLabel(order.status)}
                                      </span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Customer:
                                      </span>{" "}
                                      {getCustomerName(order)}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      <span className="font-medium">
                                        Associate:
                                      </span>{" "}
                                      {getAssociateName(order)}
                                    </div>
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOrderSelect(order);
                                    }}
                                    className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                  >
                                    Select
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="mt-4 flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                Page {orderSearchPage} of {totalPages}
                              </p>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    handlePageChange(orderSearchPage - 1)
                                  }
                                  disabled={
                                    orderSearchPage <= 1 || isLoadingOrders
                                  }
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                  Previous
                                </button>
                                <button
                                  onClick={() =>
                                    handlePageChange(orderSearchPage + 1)
                                  }
                                  disabled={
                                    orderSearchPage >= totalPages ||
                                    isLoadingOrders
                                  }
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                  Next
                                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="py-12 text-center">
                          <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            No orders found
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {orderSearchQuery
                              ? `No orders found matching "${orderSearchQuery}". Try a different search term.`
                              : "No orders available. Start typing to search for orders."}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  onClick={handleCloseOrderModal}
                  className="mt-3 inline-flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderIncidentAddPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderIncidentAddPage />
    </UIXThemeProvider>
  );
}

export default AdminOrderIncidentAddPageWithProvider;
