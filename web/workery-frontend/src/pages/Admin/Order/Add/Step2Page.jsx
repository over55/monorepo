// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step2Page.jsx

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import { DateInput } from "../../../../components/UI";
import {
  PlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchIcon,
  ExclamationCircleIcon,
  ClockIcon,
  HomeModernIcon,
  CalendarIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  QuestionMarkCircleIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";

function AdminOrderAddStep2Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const errorSectionRef = useRef(null);

  // Get existing order state
  const existingOrder = orderCreationStorage.getOrderCreation();

  // Form fields
  const [startDate, setStartDate] = useState(existingOrder?.startDate || "");
  const [isOngoing, setIsOngoing] = useState(existingOrder?.isOngoing || 0);
  const [isHomeSupportService, setIsHomeSupportService] = useState(
    existingOrder?.isHomeSupportService || 0,
  );

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    let newErrors = {};
    let hasErrors = false;

    if (isOngoing === 0) {
      newErrors["isOngoing"] =
        "Please select if this job is one-time or ongoing";
      hasErrors = true;
    }

    if (isHomeSupportService === 0) {
      newErrors["isHomeSupportService"] =
        "Please select if this is a home support service";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      // Smooth scroll to error section instead of jumping to top
      if (errorSectionRef.current) {
        errorSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      return;
    }

    console.log("onSubmitClick: Success");

    // Update order state
    const updatedOrder = {
      ...existingOrder,
      startDate: startDate,
      isOngoing: isOngoing,
      isHomeSupportService: isHomeSupportService,
    };

    orderCreationStorage.saveOrderCreation(updatedOrder);
    navigate("/admin/orders/add/step-3");
  };

  // Handle cancel
  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    orderCreationStorage.clearOrderCreation();
    navigate("/admin/orders/add/step-1-search");
  };

  // Handle date change
  const handleStartDateChange = (value) => {
    setStartDate(value);
    // Clear any date-related errors if they exist
    if (errors.startDate) {
      const newErrors = { ...errors };
      delete newErrors.startDate;
      setErrors(newErrors);
    }
  };

  // Section Component - Matching Customer Detail styling
  const FormSection = ({ title, icon: Icon, children, description }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-gray-300">{description}</p>
        )}
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      // Removed automatic scroll to top to prevent jumping when date is selected
      // window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Check if we have order state
      if (!existingOrder || !existingOrder.customerId) {
        // No customer selected, redirect to step 1
        navigate("/admin/orders/add/step-1-search");
        return;
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
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
                to="/admin/orders"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <WrenchIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <PlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Add
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
              <WrenchIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Add New Order
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <PlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              Create a new work order for customer
            </p>
          </div>
        </div>
      </div>

      {/* Wizard Steps - Responsive Design */}
      <div className="mb-4 sm:mb-6 bg-white shadow-sm rounded-lg p-4">
        <div className="overflow-x-auto">
          <div className="flex items-center justify-start xl:justify-center min-w-max px-2">
            <div className="flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckCircleIcon className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3 hidden md:block">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Search Customer
                  </p>
                  <p className="text-xs text-gray-500 hidden lg:block">
                    Complete
                  </p>
                </div>
                <div className="ml-2 sm:ml-3 md:hidden">
                  <p className="text-xs font-medium text-gray-900">Customer</p>
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
                    Job Type
                  </p>
                  <p className="text-xs text-blue-600 hidden lg:block">
                    Configure Job
                  </p>
                </div>
                <div className="ml-2 sm:ml-3 md:hidden">
                  <p className="text-xs font-medium text-blue-600">Type</p>
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
                    Services
                  </p>
                  <p className="text-xs text-gray-400 hidden lg:block">
                    Select Services
                  </p>
                </div>
                <div className="ml-2 sm:ml-3 md:hidden">
                  <p className="text-xs font-medium text-gray-500">Services</p>
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
                    Review
                  </p>
                  <p className="text-xs text-gray-400 hidden lg:block">
                    Confirm Details
                  </p>
                </div>
                <div className="ml-2 sm:ml-3 md:hidden">
                  <p className="text-xs font-medium text-gray-500">Review</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message - Responsive */}
      <div ref={errorSectionRef}>
        {(errors.message ||
          errors.isOngoing ||
          errors.isHomeSupportService) && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
              <span className="flex items-center break-words">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                {errors.message ||
                  errors.isOngoing ||
                  errors.isHomeSupportService}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
                aria-label="Close error message"
              >
                <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Dark Background */}
        <div className="bg-gray-700 rounded-t-lg px-4 sm:px-6 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
              <ClockIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-300 flex-shrink-0" />
              Job Type Configuration
            </h2>
          </div>
          <p className="mt-2 text-xs sm:text-sm text-gray-300">
            Please fill out all the required fields before submitting this form
          </p>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6">
          <form onSubmit={onSubmitClick} className="space-y-4 sm:space-y-6">
            {/* Job Duration Section */}
            <FormSection
              title="Job Duration"
              icon={ClockIcon}
              description="Specify if this is a one-time job or ongoing service"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Is this job one time or ongoing?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.isOngoing && (
                  <div className="text-red-600 text-xs sm:text-sm mb-3 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.isOngoing}
                  </div>
                )}
                <div className="space-y-3">
                  <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                    <input
                      type="radio"
                      name="isOngoing"
                      value="2"
                      checked={isOngoing === 2}
                      onChange={(e) => {
                        setIsOngoing(parseInt(e.target.value));
                        // Clear error when selection is made
                        if (errors.isOngoing) {
                          const newErrors = { ...errors };
                          delete newErrors.isOngoing;
                          setErrors(newErrors);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="block text-sm sm:text-base font-medium text-gray-900">
                        One-Time Job
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-500 mt-0.5">
                        Single service visit with defined completion
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                    <input
                      type="radio"
                      name="isOngoing"
                      value="1"
                      checked={isOngoing === 1}
                      onChange={(e) => {
                        setIsOngoing(parseInt(e.target.value));
                        // Clear error when selection is made
                        if (errors.isOngoing) {
                          const newErrors = { ...errors };
                          delete newErrors.isOngoing;
                          setErrors(newErrors);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="block text-sm sm:text-base font-medium text-gray-900">
                        Ongoing Service
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-500 mt-0.5">
                        Recurring or continuous service arrangement
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Home Support Service Section */}
            <FormSection
              title="Service Category"
              icon={HomeModernIcon}
              description="Identify if this qualifies as a home support service"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Is this job a home support service?
                  <span className="text-red-500 ml-1">*</span>
                </label>
                {errors.isHomeSupportService && (
                  <div className="text-red-600 text-xs sm:text-sm mb-3 flex items-center">
                    <ExclamationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.isHomeSupportService}
                  </div>
                )}
                <div className="space-y-3">
                  <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                    <input
                      type="radio"
                      name="isHomeSupportService"
                      value="2"
                      checked={isHomeSupportService === 2}
                      onChange={(e) => {
                        setIsHomeSupportService(parseInt(e.target.value));
                        // Clear error when selection is made
                        if (errors.isHomeSupportService) {
                          const newErrors = { ...errors };
                          delete newErrors.isHomeSupportService;
                          setErrors(newErrors);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="block text-sm sm:text-base font-medium text-gray-900">
                        No - Regular Service
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-500 mt-0.5">
                        Standard maintenance or repair service
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center p-3 sm:p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all">
                    <input
                      type="radio"
                      name="isHomeSupportService"
                      value="1"
                      checked={isHomeSupportService === 1}
                      onChange={(e) => {
                        setIsHomeSupportService(parseInt(e.target.value));
                        // Clear error when selection is made
                        if (errors.isHomeSupportService) {
                          const newErrors = { ...errors };
                          delete newErrors.isHomeSupportService;
                          setErrors(newErrors);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="block text-sm sm:text-base font-medium text-gray-900">
                        Yes - Home Support Service
                      </span>
                      <span className="block text-xs sm:text-sm text-gray-500 mt-0.5">
                        Qualifies for home support service category
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </FormSection>

            {/* Start Date Section - Updated with DateInput component */}
            <FormSection
              title="Schedule Information"
              icon={CalendarIcon}
              description="Optional scheduling details for the job"
            >
              <div className="max-w-xs">
                <DateInput
                  label={
                    <>
                      When should this job start?
                      <span className="text-gray-500 font-normal ml-1">
                        (Optional)
                      </span>
                    </>
                  }
                  value={startDate}
                  onChange={handleStartDateChange}
                  error={errors.startDate}
                  helperText="Leave blank if nothing was specified by the client"
                  placeholder="Select a date"
                  className="mb-0"
                  min={new Date().toISOString().split("T")[0]} // Prevent past dates
                />
              </div>
            </FormSection>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between pt-4 sm:pt-6 mt-6 border-t border-gray-200 gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="order-2 sm:order-1 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                Cancel
              </button>
              <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                <Link
                  to="/admin/orders/add/step-1-search"
                  className="flex-1 sm:flex-initial"
                >
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back
                  </button>
                </Link>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Continue
                  <ArrowRightIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1 sm:ml-2" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Cancel Confirmation Modal - Responsive */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="bg-gray-700 rounded-t-lg px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-400 flex-shrink-0" />
                Confirm Cancellation
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <p className="text-sm sm:text-base text-gray-600">
                Your Order record will be cancelled and your work will be lost.
                This action cannot be undone.
              </p>
              <p className="mt-2 text-sm sm:text-base font-medium text-gray-900">
                Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="px-4 py-2 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 w-full sm:w-auto transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 text-sm sm:text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full sm:w-auto transition-colors"
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrderAddStep2Page;
