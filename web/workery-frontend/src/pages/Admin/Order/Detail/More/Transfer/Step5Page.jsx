// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAuthManager,
  useOrderManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ChartBarIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  CheckIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

function AdminOrderDetailMoreTransferStep5Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [transferOperation, setTransferOperation] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order data
  const fetchOrder = async () => {
    setLoading(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setErrors({ fetch: "Failed to load order details. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Load transfer operation from storage
    const savedOp = transferOperationStorage.getTransferOperation();
    setTransferOperation(savedOp);

    fetchOrder();
  }, [oid]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!transferOperation) {
      setErrors({ general: "Transfer operation data not found" });
      return;
    }

    // Validate that at least one selection was made
    if (
      !transferOperation.pickedClientID &&
      !transferOperation.pickedAssociateID
    ) {
      setErrors({
        general: "Please select either a client or an associate to transfer to",
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare transfer data
      const transferData = {
        clientId: transferOperation.pickedClientID || null,
        associateId: transferOperation.pickedAssociateID || null,
      };

      // Use the existing transferOrder method from OrderManager
      await orderManager.transferOrder(order.id, transferData, onUnauthorized);

      // Clear the transfer operation storage
      transferOperationStorage.clearTransferOperation();

      // Set success message
      setSuccessMessage("Order transferred successfully");

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 1500);
    } catch (err) {
      console.error("Failed to transfer order:", err);

      // Handle API errors
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({
          general: "Failed to transfer order. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const hasSelection =
    transferOperation &&
    (transferOperation.pickedClientID || transferOperation.pickedAssociateID);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading order details...</span>
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
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Orders</span>
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                    Order #{oid}
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}/more`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  More
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Transfer
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <WrenchScrewdriverIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Order Transfer
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Transfer order to another client or associate
          </p>
        </div>

        {/* Status Alert */}
        {order && order.status === ORDER_STATUS_ARCHIVED && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg flex items-center">
            <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm sm:text-base">This order is archived</span>
          </div>
        )}

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-4 Complete */}
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-3">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {step === 1 && "Choose"}
                        {step === 2 && "Search"}
                        {step === 3 && "Pick"}
                        {step === 4 && "Confirm"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 4 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 ${hasSelection ? "bg-blue-600" : "bg-orange-600"} rounded-full`}
                >
                  <span className="text-white font-semibold text-sm lg:text-base">
                    5
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

          {/* Mobile View (below 768px) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 ${hasSelection ? "bg-blue-600" : "bg-orange-600"} rounded-full`}
                >
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 5 of 5
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="w-2 h-2 bg-green-600 rounded-full mr-1"
                      ></div>
                    ))}
                    <div
                      className={`w-2 h-2 ${hasSelection ? "bg-blue-600" : "bg-orange-600"} rounded-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Review Transfer Details
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center">
                <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{successMessage}</span>
              </div>
            )}

            {/* Error Display */}
            {errors.general && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.general}</span>
              </div>
            )}

            {errors.fetch && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">{errors.fetch}</span>
              </div>
            )}

            {!hasSelection ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-600 mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-amber-900">
                      No Transfer Selection
                    </h3>
                    <p className="text-sm text-amber-700 mt-2">
                      Nothing to transfer. Please go back to the beginning and
                      select either a customer or associate to transfer this job
                      to.
                    </p>
                    <Link
                      to={`/admin/order/${oid}/more/transfer/step-1`}
                      className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                      <ArrowPathIcon className="w-4 h-4 mr-2" />
                      Start Over
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Please carefully review the following transfer details. If
                  everything looks correct, click the{" "}
                  <strong>Submit Transfer</strong> button to complete the
                  transfer operation.
                </p>

                {submitting ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Processing transfer...
                    </span>
                  </div>
                ) : (
                  <div className="max-w-3xl mx-auto">
                    <div className="space-y-6 sm:space-y-8">
                      {/* Transfer Details Section */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                            <ArrowPathIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                            Transfer Information
                          </h3>
                          <Link
                            to={`/admin/order/${oid}/more/transfer/step-4`}
                            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                          >
                            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            Edit
                          </Link>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-3">
                            {order && (
                              <div className="sm:col-span-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Order Number:
                                </span>
                                <p className="text-sm sm:text-base font-semibold text-gray-900">
                                  #{order.wjid}
                                </p>
                              </div>
                            )}

                            {transferOperation.pickedClientID && (
                              <div className="sm:col-span-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Transfer to Client:
                                </span>
                                <p className="text-sm sm:text-base font-semibold text-blue-600">
                                  {transferOperation.pickedClientName}
                                </p>
                              </div>
                            )}

                            {transferOperation.pickedAssociateID && (
                              <div className="sm:col-span-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Transfer to Associate:
                                </span>
                                <p className="text-sm sm:text-base font-semibold text-green-600">
                                  {transferOperation.pickedAssociateName}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Form Actions */}
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/admin/order/${oid}/more/transfer/step-4`}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                      >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back
                      </Link>
                      <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                      >
                        <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                        Submit Transfer
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep5Page;
