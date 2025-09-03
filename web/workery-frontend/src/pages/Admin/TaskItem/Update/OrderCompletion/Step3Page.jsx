// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step3Page.jsx

import React, { useState, useEffect, useCallback } from "react";
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
  CheckIcon,
  ArrowRightIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Move DetailSection outside to prevent recreation on each render
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
  const [serviceFeeOptions, setServiceFeeOptions] = useState([]);

  // Helper functions for date handling
  const formatDateForInput = useCallback((date) => {
    if (!date) return "";
    try {
      if (date instanceof Date && !isNaN(date)) {
        return date.toISOString().slice(0, 10);
      }
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
  }, []);

  const parseDateFromInput = useCallback((value) => {
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
  }, []);

  // Initialize state with saved values
  const savedState = useState(() => orderCompletionStorage.getState())[0];

  // Form state from storage
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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
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

        const serviceFees =
          await serviceFeeManager.getServiceFeeSelectOptions(onUnauthorized);

        if (mounted) {
          setTask(taskData);
          setServiceFeeOptions(serviceFees || []);

          console.log("Service Fee Options loaded:", serviceFees);

          // Set initial service fee if available from task
          if (!invoiceServiceFeeID && taskData.associateServiceFeeID) {
            const initialServiceFeeId = taskData.associateServiceFeeID;
            setInvoiceServiceFeeID(initialServiceFeeId);

            // Find the service fee and set its percentage
            const initialServiceFee = serviceFees?.find((sf) => {
              const sfId = sf.id || sf.value;
              return String(sfId) === String(initialServiceFeeId);
            });

            if (initialServiceFee) {
              const percentage = parseFloat(initialServiceFee.percentage || 0);
              setInvoiceServiceFeePercentage(percentage);
              console.log("Initial service fee percentage set to:", percentage);
            }
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
  }, [tid]); // Minimal dependencies

  // Simplified calculation function - NOT wrapped in useCallback
  const performCalculation = () => {
    console.log("performCalculation: calculating...");

    // Calculate quoted total
    const quotedLabour = parseFloat(invoiceQuotedLabourAmount || 0);
    const quotedMaterial = parseFloat(invoiceQuotedMaterialAmount || 0);
    const quotedOther = parseFloat(invoiceQuotedOtherCostsAmount || 0);
    const quotedTotal = quotedLabour + quotedMaterial + quotedOther;
    setInvoiceTotalQuoteAmount(quotedTotal.toFixed(2));

    // Calculate actual amounts
    const actualLabour = parseFloat(invoiceLabourAmount || 0);
    const actualMaterial = parseFloat(invoiceMaterialAmount || 0);
    const actualOther = parseFloat(invoiceOtherCostsAmount || 0);

    // Calculate tax
    let taxAmount = parseFloat(invoiceTaxAmount || 0);
    if (!isCustomTaxAmount && taxRate > 0) {
      const subtotal = actualLabour + actualMaterial + actualOther;
      taxAmount = (taxRate / 100) * subtotal;
      setInvoiceTaxAmount(taxAmount.toFixed(2));
    }

    // Calculate actual total
    const actualTotal = actualLabour + actualMaterial + actualOther + taxAmount;
    setInvoiceTotalAmount(actualTotal.toFixed(2));

    // Calculate amount due
    const deposit = parseFloat(invoiceDepositAmount || 0);
    const amountDue = actualTotal - deposit;
    setInvoiceAmountDue(amountDue.toFixed(2));

    // Calculate service fee (ALWAYS based on labour amount only)
    const serviceFeePercent = parseFloat(invoiceServiceFeePercentage || 0);
    const serviceFee = actualLabour * (serviceFeePercent / 100);
    setInvoiceServiceFeeAmount(serviceFee.toFixed(2));

    // Calculate balance owing
    const actualPaid = parseFloat(invoiceActualServiceFeeAmountPaid || 0);
    const balanceOwing = serviceFee - actualPaid;
    setInvoiceBalanceOwingAmount(Math.max(0, balanceOwing).toFixed(2));

    console.log("Calculation complete:", {
      quotedTotal,
      actualTotal,
      amountDue,
      serviceFee,
      balanceOwing,
      labourAmount: actualLabour,
      serviceFeePercent,
    });
  };

  // Single useEffect to trigger calculations whenever ANY relevant field changes
  useEffect(() => {
    performCalculation();
  }, [
    // Quote fields
    invoiceQuotedLabourAmount,
    invoiceQuotedMaterialAmount,
    invoiceQuotedOtherCostsAmount,
    // Actual fields
    invoiceLabourAmount,
    invoiceMaterialAmount,
    invoiceOtherCostsAmount,
    invoiceTaxAmount,
    isCustomTaxAmount,
    invoiceDepositAmount,
    // Service fee fields
    invoiceServiceFeePercentage,
    invoiceActualServiceFeeAmountPaid,
    // Tax rate
    taxRate,
  ]);

  // Handle service fee selection
  const handleServiceFeeChange = (e) => {
    const selectedId = e.target.value;
    setInvoiceServiceFeeID(selectedId);

    if (!selectedId) {
      // Clear service fee if nothing selected
      setInvoiceServiceFeePercentage(0);
      return;
    }

    // Find the selected service fee option
    const selected = serviceFeeOptions.find((sf) => {
      const sfId = sf.id || sf.value;
      return String(sfId) === String(selectedId);
    });

    if (selected) {
      // Get the percentage from the service fee object
      let percentage = 0;

      if (selected.percentage !== undefined && selected.percentage !== null) {
        percentage = parseFloat(selected.percentage);
      } else if (
        selected.percentageValue !== undefined &&
        selected.percentageValue !== null
      ) {
        percentage = parseFloat(selected.percentageValue);
      } else if (selected.percent !== undefined && selected.percent !== null) {
        percentage = parseFloat(selected.percent);
      } else if (selected.rate !== undefined && selected.rate !== null) {
        percentage = parseFloat(selected.rate);
      }

      // Ensure we have a valid number
      if (isNaN(percentage)) {
        percentage = 0;
        console.warn("Invalid service fee percentage in:", selected);
      }

      console.log("Service Fee Selected:", {
        id: selectedId,
        selected: selected,
        percentage: percentage,
      });

      setInvoiceServiceFeePercentage(percentage);
    } else {
      console.warn("Service fee not found for ID:", selectedId);
      setInvoiceServiceFeePercentage(0);
    }
  };

  const handleSubmit = () => {
    const newErrors = {};

    if (!hasInputtedFinancials) {
      newErrors.hasInputtedFinancials =
        "Please select whether financials were inputted";
    }

    if (hasInputtedFinancials === 1) {
      if (!invoicePaidTo)
        newErrors.invoicePaidTo = "Please select who was paid";
      if (!paymentStatus)
        newErrors.paymentStatus = "Please select payment status";
      if (!invoiceDate) newErrors.invoiceDate = "Invoice date is required";
      if (!invoiceIDs) newErrors.invoiceIDs = "Invoice ID is required";
      if (!invoiceServiceFeeID)
        newErrors.invoiceServiceFeeID = "Service fee is required";
      if (!paymentMethods || paymentMethods.length === 0)
        newErrors.paymentMethods = "At least one payment method is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    orderCompletionStorage.updateState({
      hasInputtedFinancials,
      invoicePaidTo,
      paymentStatus,
      completionDate,
      invoiceDate,
      invoiceIDs: String(invoiceIDs || ""),
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

    navigate(
      hasInputtedFinancials === 1
        ? `/admin/task/${tid}/order-completion/step-4`
        : `/admin/task/${tid}/order-completion/step-5`,
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm sm:text-base text-gray-600">Loading...</p>
        </div>
      </div>
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
                <span className="sm:hidden">Home</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <Link
                  to="/admin/tasks"
                  className="ml-1 text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                    Tasks
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center whitespace-nowrap">
                  <CurrencyDollarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  Order Completion
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <CurrencyDollarIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Order Completion - Financial Details
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Enter invoice and payment information
          </p>
        </div>

        {/* Status Alerts - Responsive */}
        {task && (task.status === 2 || task.isClosed === true) && (
          <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
            <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            This task is archived / closed
          </div>
        )}

        {/* Wizard Steps - Mobile Optimized */}
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
                    <p className="text-xs text-gray-500">Invoice details</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">3 of 5</div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center">
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        Step {step}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                </React.Fragment>
              ))}

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

              {[4, 5].map((step) => (
                <React.Fragment key={step}>
                  <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                      <span className="text-gray-600 font-semibold">
                        {step}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        Step {step}
                      </p>
                      <p className="text-xs text-gray-400">Pending</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.general && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              {errors.general}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Initial Question */}
          <DetailSection title="Financial Information" icon={BanknotesIcon}>
            <div>
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
          </DetailSection>

          {hasInputtedFinancials === 1 && (
            <>
              {/* Payment Details */}
              <DetailSection title="Payment Details" icon={CreditCardIcon}>
                <div className="space-y-4">
                  {/* Who was paid */}
                  <div>
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
                  <div>
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
                            paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID
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
                            paymentStatus === ORDER_STATUS_COMPLETED_BUT_UNPAID
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

                  {/* Dates and Invoice ID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            setInvoiceDate(parseDateFromInput(e.target.value))
                          }
                          className={`w-full pl-10 pr-3 py-2 border ${errors.invoiceDate ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.invoiceDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceDate}
                        </p>
                      )}
                    </div>

                    <div>
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
                          className={`w-full pl-10 pr-3 py-2 border ${errors.invoiceIDs ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                        />
                      </div>
                      {errors.invoiceIDs && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceIDs}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Payment Method(s) <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((method) => (
                        <label key={method.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={method.value}
                            checked={paymentMethods.includes(method.value)}
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
                      ))}
                    </div>
                    {errors.paymentMethods && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.paymentMethods}
                      </p>
                    )}
                  </div>
                </div>
              </DetailSection>

              {/* Quote Details */}
              <DetailSection title="Quote Details" icon={DocumentTextIcon}>
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
              </DetailSection>

              {/* Actual Amounts */}
              <DetailSection title="Actual Amounts" icon={BanknotesIcon}>
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
                        onChange={(e) => setInvoiceLabourAmount(e.target.value)}
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
                        onChange={(e) => setInvoiceTaxAmount(e.target.value)}
                        disabled={!isCustomTaxAmount}
                        placeholder="0.00"
                        className={`w-full pl-10 pr-3 py-2 border ${isCustomTaxAmount ? "border-gray-300" : "border-gray-200"} rounded-lg ${isCustomTaxAmount ? "" : "bg-gray-50"}`}
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
                      Deposit Amount
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
                      Amount Due
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
              </DetailSection>

              {/* Service Fee */}
              <DetailSection title="Service Fee" icon={BuildingLibraryIcon}>
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
                        onChange={handleServiceFeeChange}
                        className={`w-full pl-10 pr-3 py-2 border ${errors.invoiceServiceFeeID ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white`}
                      >
                        <option value="">Please select...</option>
                        {serviceFeeOptions.map((sf) => {
                          const sfId = sf.id || sf.value;
                          const sfLabel = sf.title || sf.label || sf.name;
                          const sfPercentage =
                            sf.percentage ||
                            sf.percent ||
                            sf.percentageValue ||
                            sf.rate ||
                            0;
                          return (
                            <option key={sfId} value={sfId}>
                              {sfLabel} ({sfPercentage}%)
                            </option>
                          );
                        })}
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
                      Service Fee Percentage
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalculatorIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceServiceFeePercentage}
                        disabled
                        className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Percentage applied to labour amount only
                    </p>
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
                    <p className="mt-1 text-xs text-gray-500">
                      Calculated as: Labour Amount × Service Fee %
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Service Fee Payment Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formatDateForInput(invoiceServiceFeePaymentDate)}
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
                      Actual Service Fee Amount Paid
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
                          setInvoiceActualServiceFeeAmountPaid(e.target.value)
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
                    <p className="mt-1 text-xs text-gray-500">
                      Required Service Fee - Actual Amount Paid
                    </p>
                  </div>
                </div>
              </DetailSection>
            </>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
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
  );
}

export default AdminTaskItemOrderCompletionStep3Page;
