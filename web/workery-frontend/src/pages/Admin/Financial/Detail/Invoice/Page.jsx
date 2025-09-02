// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../services/Services";
import { DateTime } from "luxon";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
} from "../../../../../constants/FieldOptions";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  PencilSquareIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../../../services/Helpers/DateFormatter";

function AdminFinancialInvoiceDetailPage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  useEffect(() => {
    let mounted = true;

    const fetchOrderDetails = async () => {
      if (!oid) {
        setErrors({ general: "Order ID is required" });
        return;
      }

      setFetching(true);
      setErrors({});

      try {
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);
        }
      } catch (error) {
        console.error("Failed to fetch order details:", error);
        if (mounted) {
          if (typeof error === "object" && error !== null) {
            setErrors(error);
          } else {
            setErrors({
              general: "Failed to load order details. Please try again.",
            });
          }
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchOrderDetails();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Handle generate invoice click
  const onGenerateInvoiceClick = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
  };

  // Handle regenerate invoice click
  const onRegenerateInvoiceClick = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
  };

  // Handle invoice download
  const onDownloadInvoiceClick = async () => {
    if (!order?.invoice?.fileObjectUrl) {
      console.error("No invoice file URL available");
      setErrors({ general: "Invoice file not available for download" });
      return;
    }

    setIsDownloading(true);
    setErrors({});

    try {
      // Fetch the file from the URL
      const response = await fetch(order.invoice.fileObjectUrl);

      if (!response.ok) {
        throw new Error(`Failed to download invoice: ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = URL.createObjectURL(blob);

      // Create a temporary anchor element to trigger download
      const link = document.createElement("a");
      link.href = blobUrl;

      // Set the filename - use invoice ID or order ID
      const fileName = `invoice_${order.invoiceIds || order.wjid || order.id}.pdf`;
      link.download = fileName;

      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the blob URL
      URL.revokeObjectURL(blobUrl);

      console.log(`Invoice downloaded successfully: ${fileName}`);
    } catch (error) {
      console.error("Failed to download invoice:", error);
      setErrors({
        general: "Failed to download invoice. Please try again later.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Get payment methods display
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

  // Render invoice line item
  const renderLineItem = (lineNumber, qty, desc, price, amount) => {
    if (!qty || qty <= 0) return null;

    return (
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          Line {lineNumber.toString().padStart(2, "0")}
        </td>
        <td className="px-6 py-4 text-sm text-gray-900">x{qty}</td>
        <td className="px-6 py-4 text-sm text-gray-900">{desc}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          {formatCurrency(price)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          {formatCurrency(amount)}
        </td>
      </tr>
    );
  };

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading invoice details...</p>
          </div>
        </div>
      </div>
    );
  }

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
                to="/admin/financials"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Financials
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/financial/${oid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Order #{oid}
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Invoice
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
              <CurrencyDollarIcon className="w-8 h-8 mr-3 text-blue-600" />
              Financials
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Manage invoice and financial details
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {isOrderArchived() && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

      {/* Error Display */}
      {errors.general && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            <span>{errors.general}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Title and Action Buttons */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-7 h-7 mr-2 text-blue-600" />
              Invoice Detail
            </h2>
            {order && (
              <div className="flex gap-2">
                {order.invoice ? (
                  <>
                    <button
                      onClick={onRegenerateInvoiceClick}
                      className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors"
                    >
                      <PencilSquareIcon className="w-5 h-5 mr-2" />
                      Edit & Regenerate
                    </button>
                    {order.invoice.fileObjectUrl && (
                      <button
                        onClick={onDownloadInvoiceClick}
                        disabled={isDownloading}
                        className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                          isDownloading
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                        {isDownloading ? "Downloading..." : "Download Invoice"}
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    onClick={onGenerateInvoiceClick}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    <PlusCircleIcon className="w-5 h-5 mr-2" />
                    Generate Invoice
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/financial/${oid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
              Invoice
            </div>
            <Link
              to={`/admin/financial/${oid}/more`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
            >
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </Link>
          </nav>
        </div>

        <div className="p-6">
          {order && order.invoice ? (
            <div className="space-y-6">
              {/* Invoice Header Section */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="bg-gray-900 px-6 py-3">
                  <h3 className="text-lg font-medium text-white">
                    Invoice Header
                  </h3>
                </div>
                <div className="bg-white">
                  <dl className="divide-y divide-gray-200">
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Order #
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.wjid || order.id}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Invoice Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatDateForDisplay(order.invoice.invoiceDate)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Associate Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.associateName || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Associate Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatPhone(order.invoice.associatePhone)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Associate Tax #
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.associateTaxId || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Client Name
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.clientName || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Client Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.clientAddress ||
                          order.customerFullAddressWithoutPostalCode ||
                          "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Client Phone
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatPhone(
                          order.invoice.clientPhone || order.customerPhone,
                        )}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Client Email
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.clientEmail ||
                          order.customerEmail ||
                          "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Invoice Description Section */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="bg-gray-900 px-6 py-3">
                  <h3 className="text-lg font-medium text-white">
                    Invoice Description
                  </h3>
                </div>
                <div className="bg-white">
                  <dl className="divide-y divide-gray-200">
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Invoice IDs
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoiceIds || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Order #
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.wjid || order.id}
                      </dd>
                    </div>
                  </dl>

                  {/* Line Items Table */}
                  {(order.invoice.line01Qty > 0 ||
                    order.invoice.line02Qty > 0 ||
                    order.invoice.line03Qty > 0 ||
                    order.invoice.line04Qty > 0 ||
                    order.invoice.line05Qty > 0 ||
                    order.invoice.line06Qty > 0 ||
                    order.invoice.line07Qty > 0 ||
                    order.invoice.line08Qty > 0 ||
                    order.invoice.line09Qty > 0 ||
                    order.invoice.line10Qty > 0 ||
                    order.invoice.line11Qty > 0 ||
                    order.invoice.line12Qty > 0 ||
                    order.invoice.line13Qty > 0 ||
                    order.invoice.line14Qty > 0 ||
                    order.invoice.line15Qty > 0) && (
                    <div className="px-6 py-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Line Items
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-300">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Line
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Qty
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Description
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Amount
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {renderLineItem(
                              1,
                              order.invoice.line01Qty,
                              order.invoice.line01Desc,
                              order.invoice.line01Price,
                              order.invoice.line01Amount,
                            )}
                            {renderLineItem(
                              2,
                              order.invoice.line02Qty,
                              order.invoice.line02Desc,
                              order.invoice.line02Price,
                              order.invoice.line02Amount,
                            )}
                            {renderLineItem(
                              3,
                              order.invoice.line03Qty,
                              order.invoice.line03Desc,
                              order.invoice.line03Price,
                              order.invoice.line03Amount,
                            )}
                            {renderLineItem(
                              4,
                              order.invoice.line04Qty,
                              order.invoice.line04Desc,
                              order.invoice.line04Price,
                              order.invoice.line04Amount,
                            )}
                            {renderLineItem(
                              5,
                              order.invoice.line05Qty,
                              order.invoice.line05Desc,
                              order.invoice.line05Price,
                              order.invoice.line05Amount,
                            )}
                            {renderLineItem(
                              6,
                              order.invoice.line06Qty,
                              order.invoice.line06Desc,
                              order.invoice.line06Price,
                              order.invoice.line06Amount,
                            )}
                            {renderLineItem(
                              7,
                              order.invoice.line07Qty,
                              order.invoice.line07Desc,
                              order.invoice.line07Price,
                              order.invoice.line07Amount,
                            )}
                            {renderLineItem(
                              8,
                              order.invoice.line08Qty,
                              order.invoice.line08Desc,
                              order.invoice.line08Price,
                              order.invoice.line08Amount,
                            )}
                            {renderLineItem(
                              9,
                              order.invoice.line09Qty,
                              order.invoice.line09Desc,
                              order.invoice.line09Price,
                              order.invoice.line09Amount,
                            )}
                            {renderLineItem(
                              10,
                              order.invoice.line10Qty,
                              order.invoice.line10Desc,
                              order.invoice.line10Price,
                              order.invoice.line10Amount,
                            )}
                            {renderLineItem(
                              11,
                              order.invoice.line11Qty,
                              order.invoice.line11Desc,
                              order.invoice.line11Price,
                              order.invoice.line11Amount,
                            )}
                            {renderLineItem(
                              12,
                              order.invoice.line12Qty,
                              order.invoice.line12Desc,
                              order.invoice.line12Price,
                              order.invoice.line12Amount,
                            )}
                            {renderLineItem(
                              13,
                              order.invoice.line13Qty,
                              order.invoice.line13Desc,
                              order.invoice.line13Price,
                              order.invoice.line13Amount,
                            )}
                            {renderLineItem(
                              14,
                              order.invoice.line14Qty,
                              order.invoice.line14Desc,
                              order.invoice.line14Price,
                              order.invoice.line14Amount,
                            )}
                            {renderLineItem(
                              15,
                              order.invoice.line15Qty,
                              order.invoice.line15Desc,
                              order.invoice.line15Price,
                              order.invoice.line15Amount,
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <dl className="divide-y divide-gray-200">
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Deposit
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.invoice.deposit)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Actual Labour
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.invoice.totalLabour)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Actual Materials
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.invoice.totalMaterials)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Other Costs
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.invoice.otherCosts)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Total Tax
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.invoice.tax)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4 bg-gray-50">
                      <dt className="text-sm font-bold text-gray-900">Total</dt>
                      <dd className="mt-1 text-sm font-bold text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatCurrency(order.invoice.total)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Date of Quote Approval
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatDate(order.invoice.invoiceQuoteDate)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Customer Approval
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.invoiceCustomersApproval || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Line 01 - Notes or Extras
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.line01Notes || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Line 02 - Notes or Extras
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.line02Notes || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Date Client Paid Invoice
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatDate(order.invoice.dateClientPaidInvoice)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Payment Method(s)
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {getPaymentMethodsDisplay(order.invoice.paymentMethods)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Client Signature upon completion
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.clientSignature || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Associate Signature Date
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatDate(order.invoice.associateSignDate)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Associate Signature
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.associateSignature || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* System Information Section */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <div className="bg-gray-900 px-6 py-3">
                  <h3 className="text-lg font-medium text-white">
                    System Information
                  </h3>
                </div>
                <div className="bg-white">
                  <dl className="divide-y divide-gray-200">
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Order #
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.wjid || order.id}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Created At
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatDate(order.invoice.createdAt)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Created By
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.createdByUserName || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Modified At
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {formatDate(order.invoice.modifiedAt)}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Modified By
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.modifiedByUserName || "-"}
                      </dd>
                    </div>
                    <div className="px-6 py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                      <dt className="text-sm font-medium text-gray-900">
                        Revision Version
                      </dt>
                      <dd className="mt-1 text-sm text-gray-700 sm:mt-0 sm:col-span-2">
                        {order.invoice.revisionVersion || "-"}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          ) : (
            // No invoice message
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <DocumentTextIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Invoice
              </h3>
              <p className="text-gray-500 mb-4">
                No invoice has been created for this order yet. You will need to
                create it before you can download the PDF copy.
              </p>
              <button
                onClick={onGenerateInvoiceClick}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <PlusCircleIcon className="w-4 h-4 mr-2" />
                Click here to generate invoice
              </button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Link to="/admin/financials">
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Financials
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFinancialInvoiceDetailPage;
