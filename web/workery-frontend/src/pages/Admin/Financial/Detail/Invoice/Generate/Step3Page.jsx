// File Path: web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step3Page.jsx
// @uix-page: FinancialInvoiceGenerateStep3
// UIX Upgraded - Uses UIX primitives (Card, Alert, Spinner, Modal, Breadcrumb, Button)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router";
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
  ChevronLeftIcon,
  DocumentPlusIcon,
  InformationCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
  ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS,
} from "../../../../../../constants/FieldOptions";
import { DateInput } from "../../../../../../components/UI";
import {
  Card,
  Alert,
  Spinner,
  Modal,
  Breadcrumb,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

// Move DetailSection outside the main component to prevent recreation on every render
const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminFinancialGenerateInvoiceStep3Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get("mode") === "edit";
  const { getThemeClasses } = useUIXTheme();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

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

  const handleNext = () => {
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
    const nextUrl = isEditMode
      ? `/admin/financial/${oid}/invoice/generate/step-4?mode=edit`
      : `/admin/financial/${oid}/invoice/generate/step-4`;
    navigate(nextUrl);
  };

  const handleCancel = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    invoiceStorage.clearInvoiceGenerationData();
    setShowCancelWarning(false);
    navigate(`/admin/financial/${oid}/invoice`);
  };

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Financials",
      to: "/admin/financials",
      icon: CreditCardIcon,
    },
    {
      label: `Order #${oid}`,
      to: `/admin/financial/${oid}/invoice`,
      icon: DocumentTextIcon,
    },
    {
      label: "Generate Invoice",
      icon: DocumentPlusIcon,
      isActive: true,
    },
  ], [oid]);

  if (isFetching || !order) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading order details...</p>
          </div>
        </Card>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
            <li>
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to={`/admin/financial/${oid}/invoice`}
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <DocumentTextIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Order #{oid}
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <DocumentPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Generate Invoice
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
                <DocumentPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
                {isEditMode ? "Edit Invoice" : "Generate Invoice"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                Step 3 of 4 - Financial Details & Signatures
              </p>
            </div>
          </div>
        </div>

        {/* Wizard Steps - Improved Responsive Design */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 3: Financials
                    </p>
                    <p className="text-xs text-gray-500">
                      Details & Signatures
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">3 of 4</div>
              </div>
            </div>
          </div>

          {/* Tablet/Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Steps 1-2 Complete */}
              {[1, 2].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Header Info"}
                        {step === 2 && "Line Items"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 2 && (
                    <div className="mx-2 w-16 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Footer Info
                  </p>
                  <p className="text-xs text-gray-500">Details & Sign</p>
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
        </div>

        {/* Error Message - Responsive */}
        {errors.general && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between text-sm sm:text-base">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{errors.general}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header with Dark Background */}
          <div className="bg-gray-700 rounded-t-lg px-4 sm:px-6 py-4 sm:py-5">
            <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
              <CurrencyDollarIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 flex-shrink-0" />
              Financial Details & Signatures
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {/* Financial Summary Section */}
            <DetailSection title="Financial Summary" icon={BanknotesIcon}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Labour Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceLabourAmount}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceMaterialAmount}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Costs
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceOtherCostsAmount}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base"
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
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceTaxAmount}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base"
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
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceTotalAmount}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-semibold text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Deposit
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceDepositAmount}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount Due
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CurrencyDollarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-blue-600" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceAmountDue}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-semibold text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Quote & Payment Details Section */}
            <DetailSection
              title="Quote & Payment Details"
              icon={DocumentTextIcon}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Quote Valid For <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <select
                        value={invoiceQuoteDays}
                        onChange={(e) => setInvoiceQuoteDays(e.target.value)}
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.invoiceQuoteDays
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-sm sm:text-base`}
                      >
                        {ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.invoiceQuoteDays && (
                      <p className="mt-1 text-xs text-red-600">
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
                        <DocumentTextIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={associateTaxId}
                        disabled
                        className="w-full pl-10 pr-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 text-sm sm:text-base"
                      />
                    </div>
                  </div>

                  <div>
                    <DateInput
                      label="Date of Quote Approval"
                      value={invoiceQuoteDate}
                      onChange={(value) => {
                        setInvoiceQuoteDate(value);
                        // Clear error when user enters a value
                        if (errors.invoiceQuoteDate) {
                          setErrors((prev) => ({
                            ...prev,
                            invoiceQuoteDate: undefined,
                          }));
                        }
                      }}
                      error={errors.invoiceQuoteDate}
                      required={true}
                    />
                  </div>

                  <div>
                    <DateInput
                      label="Date Client Paid Invoice"
                      value={dateClientPaidInvoice}
                      onChange={(value) => {
                        setDateClientPaidInvoice(value);
                        // Clear error when user enters a value
                        if (errors.dateClientPaidInvoice) {
                          setErrors((prev) => ({
                            ...prev,
                            dateClientPaidInvoice: undefined,
                          }));
                        }
                      }}
                      error={errors.dateClientPaidInvoice}
                      required={true}
                    />
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
                      <span className="ml-2 text-sm text-gray-700">Verbal</span>
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
                    <p className="mt-1 text-xs text-red-600">
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
                  <textarea
                    value={line01Notes}
                    onChange={(e) => setLine01Notes(e.target.value)}
                    maxLength="638"
                    rows="3"
                    placeholder="Enter additional notes or extras..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {line01Notes.length}/638 characters
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Line 02 - Notes or Extras (Optional)
                  </label>
                  <textarea
                    value={line02Notes}
                    onChange={(e) => setLine02Notes(e.target.value)}
                    maxLength="638"
                    rows="3"
                    placeholder="Enter additional notes or extras..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {line02Notes.length}/638 characters
                  </p>
                </div>
              </div>
            </DetailSection>

            {/* Signatures Section */}
            <DetailSection title="Signatures" icon={PencilSquareIcon}>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-xs sm:text-sm text-blue-800 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
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
                      <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
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
                      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    If the client's partner or legal representative is signing,
                    please write their full name
                  </p>
                  {errors.clientSignature && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.clientSignature}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <DateInput
                      label="Associate Signature Date"
                      value={associateSignDate}
                      onChange={(value) => {
                        setAssociateSignDate(value);
                        // Clear error when user enters a value
                        if (errors.associateSignDate) {
                          setErrors((prev) => ({
                            ...prev,
                            associateSignDate: undefined,
                          }));
                        }
                      }}
                      error={errors.associateSignDate}
                      required={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Associate Signature{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <UserIcon className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={associateSignature}
                        onChange={(e) => setAssociateSignature(e.target.value)}
                        placeholder="Enter associate's full name"
                        className={`w-full pl-10 pr-3 py-2 border ${
                          errors.associateSignature
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base`}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      If represented by a business partner, write their full
                      name
                    </p>
                    {errors.associateSignature && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.associateSignature}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </DetailSection>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
              <Link
                to={
                  isEditMode
                    ? `/admin/financial/${oid}/invoice/generate/step-2?mode=edit`
                    : `/admin/financial/${oid}/invoice/generate/step-2`
                }
                className="order-2 sm:order-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back
              </Link>

              <div className="flex gap-3 order-1 sm:order-2">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <XMarkIcon className="w-4 h-4 mr-2" />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  Save & Next
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to={`/admin/financial/${oid}/invoice`}
            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
          >
            <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Back to Invoice
          </Link>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        size="md"
      >
        <div className="space-y-4">
          <Alert type="warning" className="mb-4">
            <ExclamationCircleIcon className="h-5 w-5 mr-2 inline" />
            Your invoice generation will be cancelled and your work will be
            lost. This cannot be undone.
          </Alert>

          <p className="text-sm text-gray-600">
            Do you want to continue?
          </p>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowCancelWarning(false)}
              className="order-2 sm:order-1"
            >
              No, Keep Working
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmCancel}
              className="order-1 sm:order-2"
            >
              Yes, Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminFinancialGenerateInvoiceStep3PageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminFinancialGenerateInvoiceStep3Page />
    </UIXThemeProvider>
  );
}

export default AdminFinancialGenerateInvoiceStep3PageWithProvider;
