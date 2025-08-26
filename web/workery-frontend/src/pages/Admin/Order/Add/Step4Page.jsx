// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
  useOrderManager,
} from "../../../../services/Services";
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  UserIcon,
  ClipboardDocumentIcon,
  CalendarIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  ClockIcon,
  HomeIcon,
  TagIcon,
  AcademicCapIcon,
  ChatBubbleBottomCenterTextIcon,
  DocumentCheckIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";

function AdminOrderAddStep4Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const orderManager = useOrderManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get existing order state
  const orderData = orderCreationStorage.getOrderCreation();

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = async (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");
    setIsLoading(true);
    setErrors({});

    try {
      // Prepare the payload
      const payload = {
        customerId: orderData.customerId,
        description: orderData.description,
        skillSets: orderData.skillSets,
        isOngoing: orderData.isOngoing,
        isHomeSupportService: orderData.isHomeSupportService,
        startDate: orderData.startDate,
        additionalComment: orderData.additionalComment,
        tags: orderData.tags,
      };

      console.log("onSubmitClick: payload:", payload);

      // Create the order
      const response = await orderManager.createOrder(payload, onUnauthorized);

      console.log("Order created successfully:", response);

      setIsSubmitted(true);

      // Clear the order creation state
      orderCreationStorage.clearOrderCreation();

      // Redirect to the order detail page
      navigate(`/admin/order/${response.wjid || response.id}`, {
        state: { successMessage: "Order created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
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

      if (isSubmitted) {
        return;
      }

      // Check if we have order state
      if (!orderData || !orderData.customerId) {
        // No customer selected, redirect to step 1
        navigate("/admin/orders/add/step-1-search");
        return;
      }
    }

    return () => {
      mounted = false;
    };
  }, [authManager, navigate, orderData, isSubmitted]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  const handleCancelClick = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    orderCreationStorage.clearOrderCreation();
    navigate("/admin/orders");
  };

  if (!orderData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading order data...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Enhanced Breadcrumb */}
        <nav
          className="flex mb-4 bg-white rounded-lg shadow-sm p-2 sm:p-3"
          aria-label="Breadcrumb"
        >
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Orders</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <PlusCircleIcon className="w-4 h-4 mr-2" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Enhanced Page Title */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <PlusCircleIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Add New Order
          </h1>
          <p className="mt-1 text-sm text-gray-600 flex items-center">
            <DocumentCheckIcon className="w-4 h-4 mr-1" />
            Step 4: Review and submit your order
          </p>
        </div>

        {/* Enhanced Wizard Steps */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          {/* Desktop/Tablet View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-3 Complete */}
              {[1, 2, 3].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full shadow-lg">
                      <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-3">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {step === 1 && "Search"}
                        {step === 2 && "Customer"}
                        {step === 3 && "Details"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full shadow-lg animate-pulse">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    4
                  </span>
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Review
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Submit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full shadow-lg animate-pulse">
                  <span className="text-white font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 4 of 4
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className="w-2 h-2 bg-green-600 rounded-full mr-1"
                      ></div>
                    ))}
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Warning Modal - Enhanced */}
        {showCancelWarning && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-2xl rounded-xl bg-white">
              <div className="mt-3">
                <div className="flex items-center mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    Are you sure?
                  </h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Your Order record will be cancelled and your work will be
                  lost. This cannot be undone. Do you want to continue?
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowCancelWarning(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-400 transition-all transform hover:scale-105"
                  >
                    No
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm font-medium rounded-md hover:from-green-700 hover:to-green-800 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Yes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content with Dark Header */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-gray-800 to-gray-700">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2 text-green-400" />
              Review and Submit
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              Please review the order details before submitting
            </p>
          </div>

          <div className="p-4 sm:p-6">
            <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
              <p className="text-sm sm:text-base text-blue-800 flex items-start">
                <SparklesIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <span>
                  Please review the following order summary before submitting.
                  If everything looks correct, click the
                  <strong> Submit Order</strong> button to create the new order.
                </span>
              </p>
            </div>

            {errors.message && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.message}</span>
              </div>
            )}
            {errors.detail && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.detail}</span>
              </div>
            )}

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <RocketLaunchIcon className="w-16 h-16 text-blue-600 mb-4 animate-bounce" />
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-lg text-gray-600 font-medium">
                  Creating order...
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  Please wait while we process your request
                </p>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6 sm:space-y-8">
                  {/* Customer Information Section */}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4 sm:p-6 border border-purple-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-purple-600" />
                        Customer Information
                      </h3>
                      <Link
                        to="/admin/orders/add/step-2"
                        className="inline-flex items-center text-xs sm:text-sm text-purple-600 hover:text-purple-800 transition-colors"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-white rounded-lg p-3 sm:p-4 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Customer:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900">
                            <Link
                              to={`/admin/customer/${orderData.customerId}`}
                              target="_blank"
                              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                            >
                              {orderData.customerFirstName}{" "}
                              {orderData.customerLastName}
                            </Link>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Section */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 sm:p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                        <ClipboardDocumentIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                        Order Details
                      </h3>
                      <Link
                        to="/admin/orders/add/step-3"
                        className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Edit
                      </Link>
                    </div>

                    <div className="bg-white rounded-lg p-3 sm:p-4 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Start Date:
                          </span>
                          <p className="text-xs sm:text-sm text-gray-900 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(orderData.startDate)}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Is Ongoing:
                          </span>
                          <p className="text-xs sm:text-sm">
                            {orderData.isOngoing === 1 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <CheckIcon className="w-3 h-3 mr-1" />
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <XMarkIcon className="w-3 h-3 mr-1" />
                                No
                              </span>
                            )}
                          </p>
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Is Home Support Service:
                          </span>
                          <p className="text-xs sm:text-sm">
                            {orderData.isHomeSupportService === 1 ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <HomeIcon className="w-3 h-3 mr-1" />
                                Yes
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                <XMarkIcon className="w-3 h-3 mr-1" />
                                No
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      {orderData.description && (
                        <div className="mt-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500 flex items-center mb-1">
                            <ClipboardDocumentIcon className="w-4 h-4 mr-1" />
                            Description:
                          </span>
                          <div className="mt-1 text-xs sm:text-sm text-gray-900 bg-gray-50 p-3 rounded border border-gray-200">
                            <p className="whitespace-pre-wrap">
                              {orderData.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Skill Sets Display */}
                      {orderData.skillSets &&
                        orderData.skillSets.length > 0 && (
                          <div className="mt-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                            <span className="text-xs sm:text-sm font-medium text-gray-500 flex items-center mb-2">
                              <AcademicCapIcon className="w-4 h-4 mr-1 text-purple-600" />
                              Required Skills:
                            </span>
                            <SkillSetsDisplay
                              values={orderData.skillSets}
                              label=""
                              variant="primary"
                              onUnauthorized={onUnauthorized}
                            />
                          </div>
                        )}

                      {orderData.additionalComment && (
                        <div className="mt-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-500 flex items-center mb-1">
                            <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-1" />
                            Additional Comments:
                          </span>
                          <div className="mt-1 text-xs sm:text-sm text-gray-900 bg-amber-50 p-3 rounded border border-amber-200">
                            <p className="whitespace-pre-wrap">
                              {orderData.additionalComment}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tags Display */}
                      {orderData.tags && orderData.tags.length > 0 && (
                        <div className="mt-3 bg-green-50 rounded-lg p-3 border border-green-200">
                          <span className="text-xs sm:text-sm font-medium text-gray-500 flex items-center mb-2">
                            <TagIcon className="w-4 h-4 mr-1 text-green-600" />
                            Tags:
                          </span>
                          <TagsDisplay
                            values={orderData.tags}
                            label=""
                            variant="success"
                            onUnauthorized={onUnauthorized}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Actions - Enhanced */}
                <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t-2 border-gray-200">
                  <button
                    onClick={handleCancelClick}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <Link
                    to="/admin/orders/add/step-3"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    onClick={onSubmitClick}
                    disabled={isLoading}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    {isLoading ? "Submitting..." : "Submit Order"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderAddStep4Page;
