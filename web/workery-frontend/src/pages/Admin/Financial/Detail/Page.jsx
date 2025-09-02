// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  ChartBarIcon,
  CreditCardIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserGroupIcon,
  UserIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  ReceiptPercentIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  HashtagIcon,
  ClockIcon,
  CalculatorIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { useOrderManager } from "../../../../services/Services";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../constants/FieldOptions";
import { ORDER_STATUS_ARCHIVED } from "../../../../constants/Order";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

function AdminFinancialDetailPage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // Component states
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrderDetails = async () => {
    if (!oid) {
      setError("Order ID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order details:", err);
      setError("Failed to load financial details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrderDetails();
  }, [oid]);

  // Helper functions
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getPaymentMethodsDisplay = (paymentMethods) => {
    if (!paymentMethods || !Array.isArray(paymentMethods)) return "-";

    const methods = paymentMethods.map((methodId) => {
      const option = ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.find(
        (opt) => opt.value === methodId,
      );
      return option ? option.label : `Unknown (${methodId})`;
    });

    return methods.join(", ");
  };

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
  };

  // Check if customer ID is valid
  const hasValidCustomer = () => {
    const EMPTY_OBJECT_ID = "000000000000000000000000";
    return order && order.customerId && order.customerId !== EMPTY_OBJECT_ID;
  };

  // Check if associate ID is valid
  const hasValidAssociate = () => {
    const EMPTY_OBJECT_ID = "000000000000000000000000";
    return order && order.associateId && order.associateId !== EMPTY_OBJECT_ID;
  };

  // Section Component - Updated with dark theme to match Customer Detail
  const DetailSection = ({ title, icon: Icon, children }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {children}
        </dl>
      </div>
    </div>
  );

  // Detail Field Component - Updated to match Customer Detail styling
  const DetailField = ({
    label,
    value,
    fullWidth = false,
    highlight = false,
  }) => (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
        {label}
      </dt>
      <dd
        className={`text-base sm:text-lg font-medium ${highlight ? "font-semibold text-gray-900" : "text-gray-900"} break-words`}
      >
        {value || "-"}
      </dd>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading financial details...
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
                to="/admin/financials"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <CreditCardIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Financials
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Detail
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
              <CreditCardIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Financials
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              View complete financial information for order #
              {order?.wjid || order?.id || oid}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {order && isOrderArchived() && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This order is archived
        </div>
      )}

      {/* Error Display - Responsive */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="break-words">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {order && (
          <>
            {/* Header with Actions - Responsive */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                  Financial Detail
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    to="/admin/financials"
                    className="flex-1 sm:flex-initial"
                  >
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-600 rounded-lg text-sm sm:text-base font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                      <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Back
                    </button>
                  </Link>
                  <Link
                    to={`/admin/financial/${oid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={isOrderArchived()}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        isOrderArchived()
                          ? "border-gray-300 text-gray-400 bg-gray-200 cursor-not-allowed"
                          : "border-orange-500 text-white bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Responsive with horizontal scroll on mobile */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-6">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                  <div className="border-b-2 border-blue-600 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-blue-600 whitespace-nowrap">
                    Detail
                  </div>
                  <Link
                    to={`/admin/financial/${oid}/invoice`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Invoice
                  </Link>
                  <Link
                    to={`/admin/financial/${oid}/more`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
                  >
                    More
                    <EllipsisHorizontalIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                  </Link>
                </nav>
              </div>
            </div>

            {/* Detail Sections - Responsive with dark theme */}
            <div className="p-4 sm:p-6">
              {/* Order Information */}
              <DetailSection
                title="Order Information"
                icon={ClipboardDocumentListIcon}
              >
                <DetailField
                  label="Order #"
                  value={
                    <Link
                      to={`/admin/order/${order.wjid || order.id}`}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      {order.wjid || order.id}
                    </Link>
                  }
                />
                <DetailField label="# of Visits" value={order.visits} />

                {hasValidCustomer() && (
                  <DetailField
                    label="Customer"
                    value={
                      <Link
                        to={`/admin/customer/${order.customerId}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {order.customerName || "View Customer"}
                      </Link>
                    }
                  />
                )}

                {hasValidAssociate() && (
                  <DetailField
                    label="Associate"
                    value={
                      <Link
                        to={`/admin/associate/${order.associateId}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {order.associateName || "View Associate"}
                      </Link>
                    }
                  />
                )}
              </DetailSection>

              {/* Important Dates */}
              <DetailSection title="Important Dates" icon={CalendarIcon}>
                <DetailField
                  label="Order Assignment Date"
                  value={formatDateForDisplay(order.assignmentDate)}
                />
                <DetailField
                  label="Order Start Date"
                  value={formatDateForDisplay(order.startDate)}
                />
                <DetailField
                  label="Order Completion Date"
                  value={formatDateForDisplay(order.completionDate)}
                />
                <DetailField
                  label="Invoice Date"
                  value={formatDateForDisplay(order.invoiceDate)}
                />
                <DetailField
                  label="Invoice Service Fee Payment Date"
                  value={formatDateForDisplay(
                    order.invoiceServiceFeePaymentDate,
                  )}
                />
              </DetailSection>

              {/* Invoice Details */}
              <DetailSection title="Invoice Details" icon={DocumentTextIcon}>
                <DetailField label="Invoice ID(s) #" value={order.invoiceIds} />
                <DetailField
                  label="Invoice Quote"
                  value={formatCurrency(order.invoiceQuoteAmount)}
                />
                <DetailField
                  label="Invoice Labour"
                  value={formatCurrency(order.invoiceLabourAmount)}
                />
                <DetailField
                  label="Invoice Material"
                  value={formatCurrency(order.invoiceMaterialAmount)}
                />
                <DetailField
                  label="Invoice Tax"
                  value={
                    <>
                      {formatCurrency(order.invoiceTaxAmount)}
                      {order.invoiceIsCustomTaxAmount && (
                        <span className="ml-2 text-xs sm:text-sm text-gray-600">
                          (Custom value was set)
                        </span>
                      )}
                    </>
                  }
                />
                {order.associateTaxId && (
                  <DetailField
                    label="Invoice HST #"
                    value={order.associateTaxId}
                  />
                )}
                <DetailField
                  label="Invoice Total"
                  value={formatCurrency(order.invoiceTotalAmount)}
                  highlight={true}
                />
              </DetailSection>

              {/* Payment Information */}
              <DetailSection title="Payment Information" icon={CreditCardIcon}>
                <DetailField
                  label="Invoice Service Fee"
                  value={formatCurrency(order.invoiceServiceFeeAmount)}
                />
                <DetailField
                  label="Payment Method(s)"
                  value={getPaymentMethodsDisplay(order.paymentMethods)}
                />
                <DetailField
                  label="Actual Service Fee Amount Paid"
                  value={formatCurrency(
                    order.invoiceActualServiceFeeAmountPaid,
                  )}
                />
                <DetailField
                  label="Account Balance"
                  value={
                    <span
                      className={`font-semibold ${
                        order.invoiceBalanceOwingAmount > 0
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {formatCurrency(order.invoiceBalanceOwingAmount)}
                    </span>
                  }
                />
              </DetailSection>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                <Link to="/admin/financials" className="order-2 sm:order-1">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-600 rounded-lg text-sm sm:text-base font-medium text-white bg-gray-600 hover:bg-gray-700 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Financials
                  </button>
                </Link>

                <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                  <Link
                    to={`/admin/financial/${oid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={isOrderArchived()}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        isOrderArchived()
                          ? "border-gray-300 text-gray-400 bg-gray-200 cursor-not-allowed"
                          : "border-orange-500 text-white bg-orange-500 hover:bg-orange-600"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {!order && !loading && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full mb-4">
              <CreditCardIcon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Financial Record Not Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              The financial record you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <Link to="/admin/financials">
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Back to Financials
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminFinancialDetailPage;
