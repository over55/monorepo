// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useTenantManager,
  useServiceFeeManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../../constants/Order";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../constants/FieldOptions";
import {
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  CurrencyDollarIcon,
  CheckIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

function AdminTaskItemOrderCompletionStep3Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const tenantManager = useTenantManager();
  const serviceFeeManager = useServiceFeeManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [taxRate, setTaxRate] = useState(0);

  // Helper function to safely format date for input field
  const formatDateForInput = (date) => {
    if (!date) return "";

    try {
      // If it's already a Date object
      if (date instanceof Date && !isNaN(date)) {
        return date.toISOString().slice(0, 10);
      }

      // If it's a string, try to parse it
      if (typeof date === "string") {
        const parsed = new Date(date);
        if (!isNaN(parsed)) {
          return parsed.toISOString().slice(0, 10);
        }
      }

      return "";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Helper function to safely parse date from input
  const parseDateFromInput = (value) => {
    if (!value) return null;

    try {
      const date = new Date(value);
      if (!isNaN(date)) {
        return date;
      }
      return null;
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  // Form state from storage
  const savedState = orderCompletionStorage.getState();
  const [hasInputtedFinancials, setHasInputtedFinancials] = useState(
    savedState.hasInputtedFinancials,
  );
  const [invoicePaidTo, setInvoicePaidTo] = useState(savedState.invoicePaidTo);
  const [paymentStatus, setPaymentStatus] = useState(savedState.paymentStatus);
  const [completionDate, setCompletionDate] = useState(
    savedState.completionDate,
  );
  const [invoiceDate, setInvoiceDate] = useState(savedState.invoiceDate);
  const [invoiceIDs, setInvoiceIDs] = useState(savedState.invoiceIDs);
  const [invoiceQuotedLabourAmount, setInvoiceQuotedLabourAmount] = useState(
    savedState.invoiceQuotedLabourAmount,
  );
  const [invoiceQuotedMaterialAmount, setInvoiceQuotedMaterialAmount] =
    useState(savedState.invoiceQuotedMaterialAmount);
  const [invoiceQuotedOtherCostsAmount, setInvoiceQuotedOtherCostsAmount] =
    useState(savedState.invoiceQuotedOtherCostsAmount);
  const [invoiceTotalQuoteAmount, setInvoiceTotalQuoteAmount] = useState(
    savedState.invoiceTotalQuoteAmount,
  );
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(
    savedState.invoiceLabourAmount,
  );
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(
    savedState.invoiceMaterialAmount,
  );
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(
    savedState.invoiceOtherCostsAmount,
  );
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(
    savedState.invoiceTaxAmount,
  );
  const [isCustomTaxAmount, setIsCustomTaxAmount] = useState(
    savedState.invoiceIsCustomTaxAmount,
  );
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(
    savedState.invoiceTotalAmount,
  );
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(
    savedState.invoiceDepositAmount,
  );
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(
    savedState.invoiceAmountDue,
  );
  const [invoiceServiceFeeID, setInvoiceServiceFeeID] = useState(
    savedState.invoiceServiceFeeID,
  );
  const [invoiceServiceFeePercentage, setInvoiceServiceFeePercentage] =
    useState(savedState.invoiceServiceFeePercentage);
  const [invoiceServiceFeeAmount, setInvoiceServiceFeeAmount] = useState(
    savedState.invoiceServiceFeeAmount,
  );
  const [invoiceServiceFeePaymentDate, setInvoiceServiceFeePaymentDate] =
    useState(savedState.invoiceServiceFeePaymentDate);
  const [
    invoiceActualServiceFeeAmountPaid,
    setInvoiceActualServiceFeeAmountPaid,
  ] = useState(savedState.invoiceActualServiceFeeAmountPaid);
  const [invoiceBalanceOwingAmount, setInvoiceBalanceOwingAmount] = useState(
    savedState.invoiceBalanceOwingAmount,
  );
  const [paymentMethods, setPaymentMethods] = useState(
    savedState.paymentMethods || [],
  );
  const [serviceFeeOptions, setServiceFeeOptions] = useState([]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        // Fetch task details
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);

        // Fetch tenant details for tax rate
        const currentUser = JSON.parse(
          localStorage.getItem("WORKERY_ACCOUNT_DETAIL") || "{}",
        );
        if (currentUser.tenantId) {
          const tenantData = await tenantManager.getTenantDetail(
            currentUser.tenantId,
            onUnauthorized,
          );
          if (mounted) {
            setTaxRate(parseFloat(tenantData.taxRate || 0));
          }
        }

        // Fetch service fee options
        const serviceFees =
          await serviceFeeManager.getServiceFeeSelectOptions(onUnauthorized);

        if (mounted) {
          setTask(taskData);
          setServiceFeeOptions(serviceFees || []);

          // Set default service fee if not already set
          if (!invoiceServiceFeeID && taskData.associateServiceFeeID) {
            setInvoiceServiceFeeID(taskData.associateServiceFeeID);
            setInvoiceServiceFeePercentage(
              taskData.associateServiceFeePercentage || 0,
            );
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (mounted) {
          setErrors({ general: "Failed to load data. Please try again." });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [tid]);

  // Calculate totals when amounts change
  useEffect(() => {
    performCalculation();
  }, [
    invoiceQuotedLabourAmount,
    invoiceQuotedMaterialAmount,
    invoiceQuotedOtherCostsAmount,
    invoiceLabourAmount,
    invoiceMaterialAmount,
    invoiceOtherCostsAmount,
    isCustomTaxAmount,
    invoiceTaxAmount,
    invoiceDepositAmount,
    invoiceServiceFeePercentage,
    invoiceActualServiceFeeAmountPaid,
    taxRate,
  ]);

  const performCalculation = () => {
    // Calculate quoted total
    const quotedTotal =
      parseFloat(invoiceQuotedLabourAmount || 0) +
      parseFloat(invoiceQuotedMaterialAmount || 0) +
      parseFloat(invoiceQuotedOtherCostsAmount || 0);
    setInvoiceTotalQuoteAmount(quotedTotal.toFixed(2));

    // Calculate tax if not custom
    let taxAmount = parseFloat(invoiceTaxAmount || 0);
    if (!isCustomTaxAmount && taxRate > 0) {
      const subtotal =
        parseFloat(invoiceLabourAmount || 0) +
        parseFloat(invoiceMaterialAmount || 0) +
        parseFloat(invoiceOtherCostsAmount || 0);
      taxAmount = (taxRate / 100) * subtotal;
      setInvoiceTaxAmount(taxAmount.toFixed(2));
    }

    // Calculate actual total
    const actualTotal =
      parseFloat(invoiceLabourAmount || 0) +
      parseFloat(invoiceMaterialAmount || 0) +
      parseFloat(invoiceOtherCostsAmount || 0) +
      taxAmount;
    setInvoiceTotalAmount(actualTotal.toFixed(2));

    // Calculate amount due
    const amountDue = actualTotal - parseFloat(invoiceDepositAmount || 0);
    setInvoiceAmountDue(amountDue.toFixed(2));

    // Calculate service fee
    const serviceFee =
      parseFloat(invoiceLabourAmount || 0) *
      (parseFloat(invoiceServiceFeePercentage || 0) / 100);
    setInvoiceServiceFeeAmount(serviceFee.toFixed(2));

    // Calculate balance owing
    const balanceOwing =
      serviceFee - parseFloat(invoiceActualServiceFeeAmountPaid || 0);
    setInvoiceBalanceOwingAmount(balanceOwing.toFixed(2));
  };

  const handleSubmit = () => {
    const newErrors = {};

    // Validation
    if (!hasInputtedFinancials) {
      newErrors.hasInputtedFinancials =
        "Please select whether financials were inputted";
    }

    if (hasInputtedFinancials === 1) {
      if (!invoicePaidTo) {
        newErrors.invoicePaidTo = "Please select who was paid";
      }
      if (!paymentStatus) {
        newErrors.paymentStatus = "Please select payment status";
      }
      if (paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID) {
        if (!invoiceServiceFeeID) {
          newErrors.invoiceServiceFeeID = "Service fee is required";
        }
        if (
          !invoiceServiceFeeAmount ||
          parseFloat(invoiceServiceFeeAmount) === 0
        ) {
          newErrors.invoiceServiceFeeAmount =
            "Service fee amount is required when payment is complete";
        }
        if (!invoiceServiceFeePaymentDate) {
          newErrors.invoiceServiceFeePaymentDate =
            "Service fee payment date is required when payment is complete";
        }
        if (
          !invoiceActualServiceFeeAmountPaid ||
          parseFloat(invoiceActualServiceFeeAmountPaid) === 0
        ) {
          newErrors.invoiceActualServiceFeeAmountPaid =
            "Actual service fee paid amount is required when payment is complete";
        }
      }
      if (!invoiceDate) {
        newErrors.invoiceDate = "Invoice date is required";
      }
      if (!invoiceIDs) {
        newErrors.invoiceIDs = "Invoice ID is required";
      }
      if (!invoiceServiceFeeID) {
        newErrors.invoiceServiceFeeID = "Service fee is required";
      }
      if (!paymentMethods || paymentMethods.length === 0) {
        newErrors.paymentMethods = "At least one payment method is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage - ensure invoiceIDs is stored as a string
    orderCompletionStorage.updateState({
      hasInputtedFinancials,
      invoicePaidTo,
      paymentStatus,
      completionDate,
      invoiceDate,
      invoiceIDs: String(invoiceIDs || ""), // Ensure it's a string
      invoiceQuotedLabourAmount: parseFloat(invoiceQuotedLabourAmount || 0),
      invoiceQuotedMaterialAmount: parseFloat(invoiceQuotedMaterialAmount || 0),
      invoiceQuotedOtherCostsAmount: parseFloat(
        invoiceQuotedOtherCostsAmount || 0,
      ),
      invoiceTotalQuoteAmount: parseFloat(invoiceTotalQuoteAmount || 0),
      invoiceLabourAmount: parseFloat(invoiceLabourAmount || 0),
      invoiceMaterialAmount: parseFloat(invoiceMaterialAmount || 0),
      invoiceOtherCostsAmount: parseFloat(invoiceOtherCostsAmount || 0),
      invoiceTaxAmount: parseFloat(invoiceTaxAmount || 0),
      invoiceIsCustomTaxAmount: isCustomTaxAmount,
      invoiceTotalAmount: parseFloat(invoiceTotalAmount || 0),
      invoiceDepositAmount: parseFloat(invoiceDepositAmount || 0),
      invoiceAmountDue: parseFloat(invoiceAmountDue || 0),
      invoiceServiceFeeID,
      invoiceServiceFeePercentage: parseFloat(invoiceServiceFeePercentage || 0),
      invoiceServiceFeeAmount: parseFloat(invoiceServiceFeeAmount || 0),
      invoiceServiceFeePaymentDate,
      invoiceActualServiceFeeAmountPaid: parseFloat(
        invoiceActualServiceFeeAmountPaid || 0,
      ),
      invoiceBalanceOwingAmount: parseFloat(invoiceBalanceOwingAmount || 0),
      paymentMethods,
    });

    // Navigate to next step
    if (hasInputtedFinancials === 1) {
      navigate(`/admin/task/${tid}/order-completion/step-4`);
    } else {
      navigate(`/admin/task/${tid}/order-completion/step-5`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
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
                  to="/admin/tasks"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                  Order Completion
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
            Order Completion - Financial Details
          </h1>
        </div>

        {/* Wizard Steps - Responsive Version */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            {/* Mobile/Tablet View (< lg) */}
            <div className="lg:hidden w-full overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Task
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Review
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
                      Survey
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
                      Invoice
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
                      Comment
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Notes
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 5 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      5
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Complete
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Finish
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View (≥ lg) */}
            <div className="hidden lg:flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Task</p>
                  <p className="text-xs text-gray-500">Review</p>
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
                  <p className="text-sm font-medium text-gray-900">Survey</p>
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
                  <p className="text-xs text-gray-500">Invoice Details</p>
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
                  <p className="text-sm font-medium text-gray-500">Comment</p>
                  <p className="text-xs text-gray-400">Notes</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Complete</p>
                  <p className="text-xs text-gray-400">Finish</p>
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
              <BanknotesIcon className="w-5 h-5 mr-2" />
              Financial Information
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="max-w-3xl mx-auto"
            >
              <div className="space-y-4">
                {/* Initial Question */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Was there financials inputted?{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasInputtedFinancials"
                        value="1"
                        checked={hasInputtedFinancials === 1}
                        onChange={(e) =>
                          setHasInputtedFinancials(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Yes
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="hasInputtedFinancials"
                        value="2"
                        checked={hasInputtedFinancials === 2}
                        onChange={(e) =>
                          setHasInputtedFinancials(parseInt(e.target.value))
                        }
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        No
                      </span>
                    </label>
                  </div>
                  {errors.hasInputtedFinancials && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.hasInputtedFinancials}
                    </p>
                  )}
                </div>

                {hasInputtedFinancials === 1 && (
                  <>
                    {/* Payment Details Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Payment Details
                      </h3>

                      {/* Who was paid */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Who was paid for this job?{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="invoicePaidTo"
                              value="1"
                              checked={invoicePaidTo === 1}
                              onChange={(e) =>
                                setInvoicePaidTo(parseInt(e.target.value))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Associate
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="invoicePaidTo"
                              value="2"
                              checked={invoicePaidTo === 2}
                              onChange={(e) =>
                                setInvoicePaidTo(parseInt(e.target.value))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Organization
                            </span>
                          </label>
                        </div>
                        {errors.invoicePaidTo && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.invoicePaidTo}
                          </p>
                        )}
                      </div>

                      {/* Payment Status */}
                      <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Status <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentStatus"
                              value={ORDER_STATUS_COMPLETED_AND_PAID}
                              checked={
                                paymentStatus ===
                                ORDER_STATUS_COMPLETED_AND_PAID
                              }
                              onChange={(e) =>
                                setPaymentStatus(parseInt(e.target.value))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Paid
                            </span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="paymentStatus"
                              value={ORDER_STATUS_COMPLETED_BUT_UNPAID}
                              checked={
                                paymentStatus ===
                                ORDER_STATUS_COMPLETED_BUT_UNPAID
                              }
                              onChange={(e) =>
                                setPaymentStatus(parseInt(e.target.value))
                              }
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                              Unpaid
                            </span>
                          </label>
                        </div>
                        {errors.paymentStatus && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.paymentStatus}
                          </p>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Completion Date
                            {paymentStatus ===
                              ORDER_STATUS_COMPLETED_AND_PAID && (
                              <span className="text-red-500"> *</span>
                            )}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={formatDateForInput(completionDate)}
                              onChange={(e) =>
                                setCompletionDate(
                                  parseDateFromInput(e.target.value),
                                )
                              }
                              max={new Date().toISOString().slice(0, 10)}
                              className={`w-full pl-10 pr-3 py-2 border ${
                                errors.completionDate
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                          </div>
                          {errors.completionDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.completionDate}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Invoice Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={formatDateForInput(invoiceDate)}
                              onChange={(e) =>
                                setInvoiceDate(
                                  parseDateFromInput(e.target.value),
                                )
                              }
                              className={`w-full pl-10 pr-3 py-2 border ${
                                errors.invoiceDate
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                            />
                          </div>
                          {errors.invoiceDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.invoiceDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Invoice IDs */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Invoice IDs <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            value={invoiceIDs}
                            onChange={(e) => setInvoiceIDs(e.target.value)}
                            placeholder="Enter invoice ID(s)"
                            className={`w-full pl-10 pr-3 py-2 border ${
                              errors.invoiceIDs
                                ? "border-red-500"
                                : "border-gray-300"
                            } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                          />
                        </div>
                        {errors.invoiceIDs && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.invoiceIDs}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quote Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <DocumentTextIcon className="w-5 h-5 mr-2" />
                        Quote Details
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quoted Labour
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceQuotedLabourAmount}
                              onChange={(e) =>
                                setInvoiceQuotedLabourAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quoted Materials
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceQuotedMaterialAmount}
                              onChange={(e) =>
                                setInvoiceQuotedMaterialAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Quoted Other Costs
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceQuotedOtherCostsAmount}
                              onChange={(e) =>
                                setInvoiceQuotedOtherCostsAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Total Quoted
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalculatorIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceTotalQuoteAmount}
                              disabled
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actual Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BanknotesIcon className="w-5 h-5 mr-2" />
                        Actual Amounts
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Labour
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceLabourAmount}
                              onChange={(e) =>
                                setInvoiceLabourAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Material
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceMaterialAmount}
                              onChange={(e) =>
                                setInvoiceMaterialAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Other Costs
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceOtherCostsAmount}
                              onChange={(e) =>
                                setInvoiceOtherCostsAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Tax ({taxRate}%)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalculatorIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceTaxAmount}
                              onChange={(e) =>
                                setInvoiceTaxAmount(e.target.value)
                              }
                              disabled={!isCustomTaxAmount}
                              placeholder="0.00"
                              className={`w-full pl-10 pr-3 py-2 border ${
                                isCustomTaxAmount
                                  ? "border-gray-300"
                                  : "border-gray-200"
                              } rounded-lg ${
                                isCustomTaxAmount
                                  ? "focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  : "bg-gray-50"
                              }`}
                            />
                          </div>
                          <div className="mt-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={isCustomTaxAmount}
                                onChange={(e) =>
                                  setIsCustomTaxAmount(e.target.checked)
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">
                                Custom Tax Amount?
                              </span>
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Total Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalculatorIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceTotalAmount}
                              disabled
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Deposit Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceDepositAmount}
                              onChange={(e) =>
                                setInvoiceDepositAmount(e.target.value)
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Amount Due
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalculatorIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceAmountDue}
                              disabled
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Service Fee Section */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BuildingLibraryIcon className="w-5 h-5 mr-2" />
                        Service Fee
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Service Fee <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <select
                              value={invoiceServiceFeeID}
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                setInvoiceServiceFeeID(selectedId);
                                // Find and set the percentage
                                const selected = serviceFeeOptions.find(
                                  (opt) =>
                                    opt.value === selectedId ||
                                    opt.id === selectedId,
                                );
                                if (selected) {
                                  setInvoiceServiceFeePercentage(
                                    selected.percentage || 0,
                                  );
                                }
                              }}
                              className={`w-full pl-10 pr-3 py-2 border ${
                                errors.invoiceServiceFeeID
                                  ? "border-red-500"
                                  : "border-gray-300"
                              } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                            >
                              <option value="">Please select...</option>
                              {serviceFeeOptions.map((sf) => (
                                <option
                                  key={sf.id || sf.value}
                                  value={sf.id || sf.value}
                                >
                                  {sf.title || sf.label} ({sf.percentage}%)
                                </option>
                              ))}
                            </select>
                          </div>
                          {errors.invoiceServiceFeeID && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.invoiceServiceFeeID}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Required Service Fee Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalculatorIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceServiceFeeAmount}
                              disabled
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID
                              ? "Invoice Service Fee Payment Date"
                              : "Invoice Service Fee Payment Date (Optional)"}
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalendarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="date"
                              value={formatDateForInput(
                                invoiceServiceFeePaymentDate,
                              )}
                              onChange={(e) =>
                                setInvoiceServiceFeePaymentDate(
                                  parseDateFromInput(e.target.value),
                                )
                              }
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Actual Service Fee Paid
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceActualServiceFeeAmountPaid}
                              onChange={(e) =>
                                setInvoiceActualServiceFeeAmountPaid(
                                  e.target.value,
                                )
                              }
                              placeholder="0.00"
                              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Balance Owing Amount
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <CalculatorIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={invoiceBalanceOwingAmount}
                              disabled
                              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Payment Methods */}
                      <div className="mt-4">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Payment Method(s){" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map(
                            (method) => (
                              <label
                                key={method.value}
                                className="flex items-center"
                              >
                                <input
                                  type="checkbox"
                                  value={method.value}
                                  checked={paymentMethods.includes(
                                    method.value,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setPaymentMethods([
                                        ...paymentMethods,
                                        method.value,
                                      ]);
                                    } else {
                                      setPaymentMethods(
                                        paymentMethods.filter(
                                          (m) => m !== method.value,
                                        ),
                                      );
                                    }
                                  }}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {method.label}
                                </span>
                              </label>
                            ),
                          )}
                        </div>
                        {errors.paymentMethods && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.paymentMethods}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to={`/admin/task/${tid}/order-completion/step-2`}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Link>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Save & Continue
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

export default AdminTaskItemOrderCompletionStep3Page;
