// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  PlusIcon,
  ExclamationCircleIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  HomeIcon,
  CalendarIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

function AdminFinancialGenerateInvoiceStep1Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form state
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [associateName, setAssociateName] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing invoice data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        // Get order details
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);

          // Check for existing invoice generation data
          const existingData = invoiceStorage.getInvoiceGenerationData();

          // Initialize form with order data or existing wizard data
          if (existingData && existingData.invoiceId === oid) {
            // Use existing wizard data
            setInvoiceId(existingData.invoiceId || oid);
            setInvoiceDate(
              existingData.invoiceDate || orderData.invoiceDate || "",
            );
            setAssociateName(
              existingData.associateName || orderData.associateName || "",
            );
            setAssociatePhone(
              existingData.associatePhone || orderData.associatePhone || "",
            );
            setAssociateTaxId(
              existingData.associateTaxId || orderData.associateTaxId || "",
            );
            setCustomerName(
              existingData.customerName || orderData.customerName || "",
            );
            setCustomerAddress(
              existingData.customerAddress ||
                orderData.customerFullAddressWithoutPostalCode ||
                "",
            );
            setCustomerPhone(
              existingData.customerPhone || orderData.customerPhone || "",
            );
            setCustomerEmail(
              existingData.customerEmail || orderData.customerEmail || "",
            );
          } else {
            // Initialize with order data
            setInvoiceId(oid);
            setInvoiceDate(orderData.invoiceDate || "");
            setAssociateName(orderData.associateName || "");
            setAssociatePhone(orderData.associatePhone || "");
            setAssociateTaxId(orderData.associateTaxId || "");
            setCustomerName(orderData.customerName || "");
            setCustomerAddress(
              orderData.customerFullAddressWithoutPostalCode || "",
            );
            setCustomerPhone(orderData.customerPhone || "");
            setCustomerEmail(orderData.customerEmail || "");
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch order:", error);
          setErrors({
            general: error.message || "Failed to fetch order details",
          });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [oid]);

  const handleNext = () => {
    // Save data to storage
    const invoiceData = {
      invoiceId,
      invoiceDate,
      associateName,
      associatePhone,
      associateTaxId,
      customerName,
      customerAddress,
      customerPhone,
      customerEmail,
    };

    invoiceStorage.saveInvoiceGenerationData(invoiceData);

    // Navigate to step 2
    navigate(`/admin/financial/${oid}/invoice/generate/step-2`);
  };

  const handleCancel = () => {
    const hasData = true; // Since we're working with existing order data
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate(`/admin/financial/${oid}/invoice`);
    }
  };

  const handleConfirmCancel = () => {
    invoiceStorage.clearInvoiceGenerationData();
    setShowCancelWarning(false);
    navigate(`/admin/financial/${oid}/invoice`);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading order details...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/financials"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Financials
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to={`/admin/financial/${oid}/invoice`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-1 sm:mr-2" />
                    Order #{oid}
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <PlusIcon className="w-4 h-4 mr-1 sm:mr-2" />
                  Generate Invoice
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <DocumentTextIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Generate Invoice
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop View */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="flex items-center">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Header Info
                  </p>
                  <p className="text-xs text-gray-500">Basic Details</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Line Items
                  </p>
                  <p className="text-xs text-gray-400">Services</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">
                    Footer Info
                  </p>
                  <p className="text-xs text-gray-400">Totals</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-16 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Review</p>
                  <p className="text-xs text-gray-400">Confirm</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet View */}
          <div className="hidden md:block lg:hidden">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {[
                  { num: 1, title: "Header", active: true },
                  { num: 2, title: "Items", active: false },
                  { num: 3, title: "Footer", active: false },
                  { num: 4, title: "Review", active: false },
                ].map((step, index) => (
                  <React.Fragment key={step.num}>
                    <div className="flex items-center">
                      <div
                        className={`flex items-center justify-center w-8 h-8 ${step.active ? "bg-blue-600" : "bg-gray-300"} rounded-full`}
                      >
                        <span
                          className={`${step.active ? "text-white" : "text-gray-600"} font-semibold text-xs`}
                        >
                          {step.num}
                        </span>
                      </div>
                      <div className="ml-2">
                        <p
                          className={`text-xs font-medium ${step.active ? "text-gray-900" : "text-gray-500"}`}
                        >
                          {step.title}
                        </p>
                      </div>
                    </div>
                    {index < 3 && (
                      <div className="mx-1 w-8 h-0.5 bg-gray-300"></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile View */}
          <div className="md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">1</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 1: Header Info
                    </p>
                    <p className="text-xs text-gray-500">
                      Invoice basic details
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">1 of 4</div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span>{errors.general}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Invoice Header Information
            </h2>
          </div>

          {order && (
            <form className="p-4 sm:p-6">
              <div className="space-y-6">
                {/* Invoice Details Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Invoice Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="invoiceId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Invoice ID # *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IdentificationIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="invoiceId"
                          name="invoiceId"
                          value={invoiceId}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        To change this value, update the financials screen for
                        this job.
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="invoiceDate"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Invoice Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          id="invoiceDate"
                          name="invoiceDate"
                          value={invoiceDate}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        To change this value, update the financials screen for
                        this job.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Associate Information Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Associate Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="associateName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Associate Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="associateName"
                          name="associateName"
                          value={associateName}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="associatePhone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Associate Phone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="associatePhone"
                          name="associatePhone"
                          value={associatePhone}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="associateTaxId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Associate Tax ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <IdentificationIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="associateTaxId"
                          name="associateTaxId"
                          value={associateTaxId}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Client Information Section */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">
                    Client Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label
                        htmlFor="customerName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Client Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <UserIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="customerName"
                          name="customerName"
                          value={customerName}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label
                        htmlFor="customerAddress"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Client Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HomeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          id="customerAddress"
                          name="customerAddress"
                          value={customerAddress}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="customerPhone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Client Phone *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          id="customerPhone"
                          name="customerPhone"
                          value={customerPhone}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="customerEmail"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Client Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          id="customerEmail"
                          name="customerEmail"
                          value={customerEmail}
                          disabled
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed text-sm sm:text-base"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info Note */}
                <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span>
                      The invoice header information is pulled from the order
                      details. If you need to modify any of these values, please
                      update them in the financials screen for this job before
                      generating the invoice.
                    </span>
                  </p>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/financial/${oid}/invoice`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Invoice
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4">
              <p className="text-sm text-gray-600">
                Your invoice generation progress will be cancelled and any
                unsaved changes will be lost. This cannot be undone. Do you want
                to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 order-2 sm:order-1"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 order-1 sm:order-2"
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

export default AdminFinancialGenerateInvoiceStep1Page;
