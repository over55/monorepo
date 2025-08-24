// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  CreditCardIcon,
  DocumentTextIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentCheckIcon,
  CheckIcon,
  ArrowRightIcon,
  PencilSquareIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";
import {
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
  ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS,
} from "../../../../../../constants/FieldOptions";

function AdminFinancialGenerateInvoiceStep3Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);

  // Form state
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(0);
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(0);
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(0);
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(0);
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(0);
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(0);
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(0);
  const [invoiceQuoteDays, setInvoiceQuoteDays] = useState(30);
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [invoiceQuoteDate, setInvoiceQuoteDate] = useState("");
  const [invoiceCustomersApproval, setInvoiceCustomersApproval] =
    useState("Signature");
  const [line01Notes, setLine01Notes] = useState("");
  const [line02Notes, setLine02Notes] = useState("");
  const [dateClientPaidInvoice, setDateClientPaidInvoice] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clientSignature, setClientSignature] = useState("");
  const [associateSignDate, setAssociateSignDate] = useState("");
  const [associateSignature, setAssociateSignature] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);

          // Load existing wizard data
          const existingData = invoiceStorage.getInvoiceGenerationData();

          if (!existingData || existingData.invoiceId !== oid) {
            // No data from previous steps, redirect back
            navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
            return;
          }

          // Initialize form with existing data or order data
          setInvoiceLabourAmount(
            existingData.invoiceLabourAmount ||
              orderData.invoiceLabourAmount ||
              0,
          );
          setInvoiceMaterialAmount(
            existingData.invoiceMaterialAmount ||
              orderData.invoiceMaterialAmount ||
              0,
          );
          setInvoiceOtherCostsAmount(
            existingData.invoiceOtherCostsAmount ||
              orderData.invoiceOtherCostsAmount ||
              0,
          );
          setInvoiceTaxAmount(
            existingData.invoiceTaxAmount || orderData.invoiceTaxAmount || 0,
          );
          setInvoiceTotalAmount(
            existingData.invoiceTotalAmount ||
              orderData.invoiceTotalAmount ||
              0,
          );
          setInvoiceDepositAmount(
            existingData.invoiceDepositAmount ||
              orderData.invoiceDepositAmount ||
              0,
          );
          setInvoiceAmountDue(
            existingData.invoiceAmountDue || orderData.invoiceAmountDue || 0,
          );
          setInvoiceQuoteDays(existingData.invoiceQuoteDays || 30);
          setAssociateTaxId(
            existingData.associateTaxId || orderData.associateTaxId || "",
          );
          setInvoiceQuoteDate(
            existingData.invoiceQuoteDate || orderData.completionDate || "",
          );
          setInvoiceCustomersApproval(
            existingData.invoiceCustomersApproval || "Signature",
          );
          setLine01Notes(
            existingData.line01Notes || orderData.line01Notes || "",
          );
          setLine02Notes(
            existingData.line02Notes || orderData.line02Notes || "",
          );
          setDateClientPaidInvoice(
            existingData.dateClientPaidInvoice ||
              orderData.completionDate ||
              "",
          );
          setPaymentMethods(
            existingData.paymentMethods || orderData.paymentMethods || [],
          );
          setClientSignature(
            existingData.clientSignature || orderData.customerName || "",
          );
          setAssociateSignDate(
            existingData.associateSignDate || orderData.completionDate || "",
          );
          setAssociateSignature(
            existingData.associateSignature || orderData.associateName || "",
          );
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch order:", error);
          setErrors({ general: "Failed to load order details" });
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

  const handlePaymentMethodToggle = (methodValue) => {
    setPaymentMethods((prev) => {
      if (prev.includes(methodValue)) {
        return prev.filter((m) => m !== methodValue);
      }
      return [...prev, methodValue];
    });
  };

  const handleNext = (e) => {
    e.preventDefault();

    // Validate required fields
    const newErrors = {};

    if (!invoiceQuoteDays) {
      newErrors.invoiceQuoteDays = "Quote validity days is required";
    }
    if (!invoiceQuoteDate) {
      newErrors.invoiceQuoteDate = "Quote approval date is required";
    }
    if (!invoiceCustomersApproval) {
      newErrors.invoiceCustomersApproval = "Customer approval type is required";
    }
    if (!dateClientPaidInvoice) {
      newErrors.dateClientPaidInvoice = "Client payment date is required";
    }
    if (!clientSignature) {
      newErrors.clientSignature = "Client signature is required";
    }
    if (!associateSignDate) {
      newErrors.associateSignDate = "Associate signature date is required";
    }
    if (!associateSignature) {
      newErrors.associateSignature = "Associate signature is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Get existing data and update with step 3 data
    const existingData = invoiceStorage.getInvoiceGenerationData() || {};

    // Add step 3 data
    const updatedData = {
      ...existingData,
      invoiceLabourAmount,
      invoiceMaterialAmount,
      invoiceOtherCostsAmount,
      invoiceTaxAmount,
      invoiceTotalAmount,
      invoiceDepositAmount,
      invoiceAmountDue,
      invoiceQuoteDays,
      associateTaxId,
      invoiceQuoteDate,
      invoiceCustomersApproval,
      line01Notes,
      line02Notes,
      dateClientPaidInvoice,
      paymentMethods,
      clientSignature,
      associateSignDate,
      associateSignature,
    };

    invoiceStorage.saveInvoiceGenerationData(updatedData);

    // Navigate to step 4
    navigate(`/admin/financial/${oid}/invoice/generate/step-4`);
  };

  if (isFetching || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading order details...</span>
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
                  to="/admin/financials"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <CreditCardIcon className="w-4 h-4 mr-2" />
                    Financials
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/financial/${oid}/invoice`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <DocumentTextIcon className="w-4 h-4 mr-2" />
                    Order #{oid} (Invoice)
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <DocumentCheckIcon className="w-4 h-4 mr-2" />
                  Generate Invoice
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <DocumentCheckIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
            Generate Invoice - Step 3 of 4
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
                      Review
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
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
                      Services
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
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
                      Financials
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Details & Sign
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
                      Confirm
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Review & Submit
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
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Complete</p>
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
                  <p className="text-sm font-medium text-gray-900">Services</p>
                  <p className="text-xs text-gray-500">Complete</p>
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
                  <p className="text-sm font-medium text-gray-900">
                    Financials
                  </p>
                  <p className="text-xs text-gray-500">Details & Signatures</p>
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
                  <p className="text-sm font-medium text-gray-500">Confirm</p>
                  <p className="text-xs text-gray-400">Review & Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{errors.general}</span>
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
              <CurrencyDollarIcon className="w-5 h-5 mr-2" />
              Financial Details & Signatures
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <form onSubmit={handleNext} className="max-w-3xl mx-auto">
              {/* Financial Summary Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <BanknotesIcon className="w-5 h-5 mr-2" />
                  Financial Summary
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Labour Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceLabourAmount}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Material Amount
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceMaterialAmount}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Other Costs
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceOtherCostsAmount}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tax{" "}
                        {order.invoiceIsCustomTaxAmount && (
                          <span className="text-xs text-gray-500">
                            (Custom value)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceTaxAmount}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceTotalAmount}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 font-semibold"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deposit
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceDepositAmount}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Due
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          value={invoiceAmountDue}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quote & Payment Details Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2" />
                  Quote & Payment Details
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Quote Valid For <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          value={invoiceQuoteDays}
                          onChange={(e) => setInvoiceQuoteDays(e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.invoiceQuoteDays
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                        >
                          {ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.invoiceQuoteDays && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceQuoteDays}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Associate Tax ID
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={associateTaxId}
                          disabled
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date of Quote Approval{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={invoiceQuoteDate}
                          onChange={(e) => setInvoiceQuoteDate(e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.invoiceQuoteDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.invoiceQuoteDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceQuoteDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date Client Paid Invoice{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={dateClientPaidInvoice}
                          onChange={(e) =>
                            setDateClientPaidInvoice(e.target.value)
                          }
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.dateClientPaidInvoice
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.dateClientPaidInvoice && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.dateClientPaidInvoice}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Customer Approval */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Customer Approval <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Signature"
                          checked={invoiceCustomersApproval === "Signature"}
                          onChange={(e) =>
                            setInvoiceCustomersApproval(e.target.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Signature
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Verbal"
                          checked={invoiceCustomersApproval === "Verbal"}
                          onChange={(e) =>
                            setInvoiceCustomersApproval(e.target.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Verbal
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="Written"
                          checked={invoiceCustomersApproval === "Written"}
                          onChange={(e) =>
                            setInvoiceCustomersApproval(e.target.value)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Written
                        </span>
                      </label>
                    </div>
                    {errors.invoiceCustomersApproval && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceCustomersApproval}
                      </p>
                    )}
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method(s)
                    </label>
                    <div className="space-y-2">
                      {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((method) => (
                        <label key={method.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={method.value}
                            checked={paymentMethods.includes(method.value)}
                            onChange={() =>
                              handlePaymentMethodToggle(method.value)
                            }
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {method.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Line 01 - Notes or Extras (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        value={line01Notes}
                        onChange={(e) => setLine01Notes(e.target.value)}
                        maxLength="638"
                        rows="3"
                        placeholder="Enter additional notes or extras..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {line01Notes.length}/638 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Line 02 - Notes or Extras (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        value={line02Notes}
                        onChange={(e) => setLine02Notes(e.target.value)}
                        maxLength="638"
                        rows="3"
                        placeholder="Enter additional notes or extras..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {line02Notes.length}/638 characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Signatures Section */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PencilSquareIcon className="w-5 h-5 mr-2" />
                  Signatures
                </h3>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-800 flex items-center">
                    <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                    <span>
                      Both client and associate signatures are required to
                      complete the invoice
                    </span>
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client Signature Upon Completion{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PencilSquareIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={clientSignature}
                        onChange={(e) => setClientSignature(e.target.value)}
                        placeholder="Enter client's full name"
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.clientSignature
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      If the client's partner or legal representative is
                      signing, please write their full name
                    </p>
                    {errors.clientSignature && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.clientSignature}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Associate Signature Date{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="date"
                          value={associateSignDate}
                          onChange={(e) => setAssociateSignDate(e.target.value)}
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.associateSignDate
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.associateSignDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.associateSignDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Associate Signature{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <PencilSquareIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={associateSignature}
                          onChange={(e) =>
                            setAssociateSignature(e.target.value)
                          }
                          placeholder="Enter associate's full name"
                          className={`w-full pl-10 pr-3 py-2 border ${
                            errors.associateSignature
                              ? "border-red-500"
                              : "border-gray-300"
                          } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        If represented by a business partner, write their full
                        name
                      </p>
                      {errors.associateSignature && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.associateSignature}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/admin/financial/${oid}/invoice/generate/step-2`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Link>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save & Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminFinancialGenerateInvoiceStep3Page;
