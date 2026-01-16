// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step5Page.jsx
// UIX Upgraded - Uses UIX primitives (Spinner, Breadcrumb, UIXThemeProvider, useUIXTheme)
// @uix-page: OrderTransferWizardStep5

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Spinner,
  Breadcrumb,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import {
  useAuthManager,
  useOrderManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ArrowsRightLeftIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
  ClipboardDocumentIcon,
  EllipsisHorizontalIcon,
  WrenchScrewdriverIcon,
  CheckIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

// Section Component with Dark Header Pattern - Matching Step1Page
const DetailSection = ({
  title,
  icon: Icon,
  children,
  description,
  actions,
}) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
            <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
            <span className="truncate">{title}</span>
          </h3>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-gray-300">
              {description}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

function AdminOrderDetailMoreTransferStep5Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
    { label: `#${oid}`, to: `/admin/order/${oid}`, icon: ClipboardDocumentIcon },
    { label: "More", to: `/admin/order/${oid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Transfer", icon: ArrowsRightLeftIcon, isActive: true },
  ], [oid]);

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [transferOperation, setTransferOperation] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch order data
  const fetchOrder = useCallback(async () => {
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
  }, [oid, orderManager, onUnauthorized]);

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

  // Handle cancel
  const handleCancel = () => {
    const hasData =
      transferOperation &&
      (transferOperation.pickedClientID || transferOperation.pickedAssociateID);

    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate(`/admin/order/${oid}/more`);
    }
  };

  // Confirm cancel
  const handleConfirmCancel = () => {
    setShowCancelWarning(false);
    // Clear transfer operation storage
    transferOperationStorage.clearTransferOperation();
    navigate(`/admin/order/${oid}/more`);
  };

  const hasSelection =
    transferOperation &&
    (transferOperation.pickedClientID || transferOperation.pickedAssociateID);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
        <span className="ml-3 text-gray-600">Loading order details...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Responsive Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className={`text-xl sm:text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
            <ArrowsRightLeftIcon className={`w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 ${themeClasses.linkPrimary} flex-shrink-0`} />
            Transfer Order
          </h1>
          <p className={`mt-1 text-xs sm:text-sm ${themeClasses.textSecondary} flex items-center`}>
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review and confirm the transfer details
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 ${hasSelection ? "bg-blue-600" : "bg-orange-600"} rounded-full`}
                >
                  <span className="text-white font-semibold text-sm">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 5: Confirm
                  </p>
                  <p className="text-xs text-gray-500">Review Transfer</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">5 of 5</div>
            </div>
            <div className="mt-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Steps 1-4 - Complete */}
              {[
                { num: 1, title: "Search Client", subtitle: "Find Customer" },
                { num: 2, title: "Pick Client", subtitle: "Select Result" },
                { num: 3, title: "Search Associate", subtitle: "Find Worker" },
                { num: 4, title: "Pick Associate", subtitle: "Select Worker" },
              ].map((step) => (
                <React.Fragment key={step.num}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">{step.subtitle}</p>
                    </div>
                  </div>
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 ${hasSelection ? "bg-blue-600" : "bg-orange-600"} rounded-full`}
                >
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Confirm</p>
                  <p className="text-xs text-gray-500">Review Transfer</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {order && order.status === ORDER_STATUS_ARCHIVED && (
          <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center">
            <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">This order is archived</span>
          </div>
        )}

        {/* Error Messages */}
        {(errors.general || errors.fetch) && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-xs sm:text-sm">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>{errors.general || errors.fetch}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 text-green-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center">
            <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">{successMessage}</span>
          </div>
        )}

        {/* Main Content */}
        {submitting ? (
          <div className="bg-white shadow-sm rounded-lg p-8">
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
              <span className="ml-3 text-gray-600">Processing transfer...</span>
            </div>
          </div>
        ) : (
          <>
            {!hasSelection ? (
              <DetailSection
                title="No Transfer Selection"
                icon={ExclamationTriangleIcon}
                description="Nothing to transfer"
              >
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 sm:p-6">
                  <p className="text-sm sm:text-base text-amber-700">
                    Please go back to the beginning and select either a customer
                    or associate to transfer this job to.
                  </p>
                  <Link
                    to={`/admin/order/${oid}/more/transfer/step-1`}
                    className="inline-flex items-center mt-4 px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                  >
                    <ArrowPathIcon className="w-4 h-4 mr-2" />
                    Start Over
                  </Link>
                </div>
              </DetailSection>
            ) : (
              <DetailSection
                title="Review Transfer Details"
                icon={CheckCircleIcon}
                description="Please carefully review the following transfer details"
                actions={
                  <Link
                    to={`/admin/order/${oid}/more/transfer/step-4`}
                    className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-gray-300 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-1.5" />
                    <span className="hidden sm:inline">Edit</span>
                    <span className="sm:hidden">Edit</span>
                  </Link>
                }
              >
                <div className="space-y-4 sm:space-y-6">
                  {/* Transfer Information Box */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 sm:p-6">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4 flex items-center">
                      <ArrowsRightLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 text-blue-600" />
                      Transfer Information
                    </h3>

                    <div className="space-y-3">
                      {order && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Order Number:
                          </span>
                          <p className="text-sm sm:text-base font-semibold text-gray-900 mt-1">
                            #{order.wjid}
                          </p>
                        </div>
                      )}

                      {transferOperation.pickedClientID && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Transfer to Client:
                          </span>
                          <p className="text-sm sm:text-base font-semibold text-blue-600 mt-1">
                            {transferOperation.pickedClientName}
                          </p>
                        </div>
                      )}

                      {transferOperation.pickedAssociateID && (
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-500">
                            Transfer to Associate:
                          </span>
                          <p className="text-sm sm:text-base font-semibold text-green-600 mt-1">
                            {transferOperation.pickedAssociateName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                      <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                      <span>
                        If everything looks correct, click the Submit Transfer
                        button to complete the transfer operation.
                      </span>
                    </p>
                  </div>
                </div>
              </DetailSection>
            )}

            {/* Form Actions */}
            {hasSelection && (
              <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Cancel
                </button>
                <div className="flex flex-col sm:flex-row gap-3 flex-1 sm:flex-initial sm:ml-auto">
                  <Link
                    to={`/admin/order/${oid}/more/transfer/step-4`}
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Back
                  </Link>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm sm:text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Submit Transfer
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Back Link */}
        <div className="mt-6 sm:mt-8">
          <Link
            to={`/admin/order/${oid}/more`}
            className={`inline-flex items-center text-xs sm:text-sm ${themeClasses.linkPrimary} hover:opacity-80 transition-colors`}
          >
            <ArrowLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Back to More Options
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 sm:h-6 w-5 sm:w-6 mr-2 text-amber-600 flex-shrink-0" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm sm:text-base text-gray-600">
                Your transfer operation will be cancelled and your transfer
                details will be lost. This cannot be undone. Do you want to
                continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreTransferStep5PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreTransferStep5Page />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreTransferStep5PageWithProvider;
