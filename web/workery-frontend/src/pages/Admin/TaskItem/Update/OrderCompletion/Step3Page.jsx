// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step3Page.jsx
// @uix-page: TaskItemOrderCompletionStep3
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Navigate, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useTenantManager,
  useServiceFeeManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  useUIXTheme,
} from "../../../../../components/UIX";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../../constants/Order";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../constants/FieldOptions";
import {
  ArrowRightIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon,
  CalculatorIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Status", description: "Completion Status", isCompleted: true },
  { title: "Financials", description: "Invoice Details" },
  { title: "Comments", description: "Add Notes" },
  { title: "Submit", description: "Review & Complete" },
]);

// Round to two decimal places
const roundToTwo = (num) => {
  return +(Math.round(num + "e+2") + "e-2");
};

// Memoized content component
const Step3Content = memo(function Step3Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const tenantManager = useTenantManager();
  const serviceFeeManager = useServiceFeeManager();
  const orderCompletionStorage = useOrderCompletionStorage();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    inputBorder: getThemeClasses("input-border") || "border-gray-300",
    inputFocus: getThemeClasses("input-focus") || "focus:ring-blue-500 focus:border-blue-500",
  }), [getThemeClasses]);

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
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

  // Generic handler for numeric inputs
  const handleNumericChange = useCallback(
    (setter) => (e) => {
      const value = e.target.value;
      setter(value);
    },
    [],
  );

  // Initialize state with saved values
  const savedState = useState(() => orderCompletionStorage.getState())[0];

  // Form state from storage
  const [hasInputtedFinancials, setHasInputtedFinancials] = useState(savedState.hasInputtedFinancials);
  const [invoicePaidTo, setInvoicePaidTo] = useState(savedState.invoicePaidTo);
  const [paymentStatus, setPaymentStatus] = useState(savedState.paymentStatus);
  const [completionDate, setCompletionDate] = useState(savedState.completionDate);
  const [invoiceDate, setInvoiceDate] = useState(savedState.invoiceDate);
  const [invoiceIDs, setInvoiceIDs] = useState(savedState.invoiceIDs);
  const [invoiceQuotedLabourAmount, setInvoiceQuotedLabourAmount] = useState(savedState.invoiceQuotedLabourAmount);
  const [invoiceQuotedMaterialAmount, setInvoiceQuotedMaterialAmount] = useState(savedState.invoiceQuotedMaterialAmount);
  const [invoiceQuotedOtherCostsAmount, setInvoiceQuotedOtherCostsAmount] = useState(savedState.invoiceQuotedOtherCostsAmount);
  const [invoiceTotalQuoteAmount, setInvoiceTotalQuoteAmount] = useState(savedState.invoiceTotalQuoteAmount);
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(savedState.invoiceLabourAmount);
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(savedState.invoiceMaterialAmount);
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(savedState.invoiceOtherCostsAmount);
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(savedState.invoiceTaxAmount);
  const [isCustomTaxAmount, setIsCustomTaxAmount] = useState(savedState.invoiceIsCustomTaxAmount);
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(savedState.invoiceTotalAmount);
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(savedState.invoiceDepositAmount);
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(savedState.invoiceAmountDue);
  const [invoiceServiceFeeID, setInvoiceServiceFeeID] = useState(savedState.invoiceServiceFeeID);
  const [invoiceServiceFeePercentage, setInvoiceServiceFeePercentage] = useState(savedState.invoiceServiceFeePercentage);
  const [invoiceServiceFeeAmount, setInvoiceServiceFeeAmount] = useState(savedState.invoiceServiceFeeAmount);
  const [invoiceServiceFeePaymentDate, setInvoiceServiceFeePaymentDate] = useState(savedState.invoiceServiceFeePaymentDate);
  const [invoiceActualServiceFeeAmountPaid, setInvoiceActualServiceFeeAmountPaid] = useState(savedState.invoiceActualServiceFeeAmountPaid);
  const [invoiceBalanceOwingAmount, setInvoiceBalanceOwingAmount] = useState(savedState.invoiceBalanceOwingAmount);
  const [paymentMethods, setPaymentMethods] = useState(savedState.paymentMethods || []);

  const onUnauthorized = useCallback(() => {
    setForceURL("/login?unauthorized=true");
  }, []);

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setFetching(true);
        setErrors({});

        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        const currentUser = JSON.parse(localStorage.getItem("WORKERY_ACCOUNT_DETAIL") || "{}");

        if (currentUser.tenantId) {
          const tenantData = await tenantManager.getTenantDetail(currentUser.tenantId, onUnauthorized);
          if (mounted) {
            setTaxRate(parseFloat(tenantData.taxRate || 0));
          }
        }

        const serviceFees = await serviceFeeManager.getServiceFeeSelectOptions(onUnauthorized);

        if (mounted) {
          setTask(taskData);
          setServiceFeeOptions(serviceFees || []);

          if (!invoiceServiceFeeID && taskData.associateServiceFeeID) {
            const initialServiceFeeId = taskData.associateServiceFeeID;
            setInvoiceServiceFeeID(initialServiceFeeId);

            const initialServiceFee = serviceFees?.find((sf) => {
              const sfId = sf.id || sf.value;
              return String(sfId) === String(initialServiceFeeId);
            });

            if (initialServiceFee) {
              const percentage = parseFloat(initialServiceFee.percentage || 0);
              setInvoiceServiceFeePercentage(percentage);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        if (mounted) {
          setErrors({ message: "Failed to load data. Please try again." });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    window.scrollTo(0, 0);
    fetchData();

    return () => {
      mounted = false;
    };
  }, [tid, taskManager, tenantManager, serviceFeeManager, onUnauthorized, invoiceServiceFeeID]);

  // Main calculation logic
  useEffect(() => {
    const performCalculations = () => {
      const quotedLabour = parseFloat(invoiceQuotedLabourAmount || 0) || 0;
      const quotedMaterial = parseFloat(invoiceQuotedMaterialAmount || 0) || 0;
      const quotedOther = parseFloat(invoiceQuotedOtherCostsAmount || 0) || 0;

      const actualLabour = parseFloat(invoiceLabourAmount || 0) || 0;
      const actualMaterial = parseFloat(invoiceMaterialAmount || 0) || 0;
      const actualOther = parseFloat(invoiceOtherCostsAmount || 0) || 0;
      const deposit = parseFloat(invoiceDepositAmount || 0) || 0;

      const quotedTotal = quotedLabour + quotedMaterial + quotedOther;

      let actualTax = 0;
      if (isCustomTaxAmount) {
        actualTax = parseFloat(invoiceTaxAmount || 0) || 0;
      } else if (taxRate > 0 && task?.associateTaxId && task.associateTaxId !== "NA") {
        actualTax = (taxRate / 100) * (actualLabour + actualMaterial + actualOther);
      }

      const actualTotal = actualLabour + actualMaterial + actualOther + actualTax;
      const amountDue = actualTotal - deposit;

      const serviceFeePercent = parseFloat(invoiceServiceFeePercentage || 0) || 0;
      const calculatedServiceFee = actualLabour * (serviceFeePercent / 100);

      const actualServiceFeePaid = parseFloat(invoiceActualServiceFeeAmountPaid || 0) || 0;
      const balanceOwing = Math.max(0, calculatedServiceFee - actualServiceFeePaid);

      setInvoiceTotalQuoteAmount(roundToTwo(quotedTotal));
      setInvoiceTotalAmount(roundToTwo(actualTotal));
      setInvoiceAmountDue(roundToTwo(amountDue));
      setInvoiceServiceFeeAmount(roundToTwo(calculatedServiceFee));
      setInvoiceBalanceOwingAmount(roundToTwo(balanceOwing));

      if (!isCustomTaxAmount) {
        setInvoiceTaxAmount(roundToTwo(actualTax));
      }
    };

    performCalculations();
  }, [
    invoiceQuotedLabourAmount,
    invoiceQuotedMaterialAmount,
    invoiceQuotedOtherCostsAmount,
    invoiceLabourAmount,
    invoiceMaterialAmount,
    invoiceOtherCostsAmount,
    invoiceTaxAmount,
    isCustomTaxAmount,
    taxRate,
    invoiceDepositAmount,
    invoiceServiceFeePercentage,
    invoiceActualServiceFeeAmountPaid,
    task?.associateTaxId,
  ]);

  // Handle service fee selection
  const handleServiceFeeChange = async (e) => {
    const selectedId = e.target.value;
    setInvoiceServiceFeeID(selectedId);

    if (!selectedId) {
      setInvoiceServiceFeePercentage(0);
      return;
    }

    try {
      const serviceFeeData = await serviceFeeManager.getServiceFeeDetail(selectedId, onUnauthorized);
      if (serviceFeeData) {
        const percentage = parseFloat(serviceFeeData.percentage || 0);
        setInvoiceServiceFeePercentage(percentage);
      }
    } catch (error) {
      console.error("Failed to fetch service fee detail:", error);
      const selected = serviceFeeOptions.find((sf) => {
        const sfId = sf.id || sf.value;
        return String(sfId) === String(selectedId);
      });

      if (selected) {
        let percentage = 0;
        if (selected.percentage !== undefined && selected.percentage !== null) {
          percentage = parseFloat(selected.percentage);
        }
        setInvoiceServiceFeePercentage(percentage);
      }
    }
  };

  const handleSubmit = useCallback(() => {
    const newErrors = {};

    if (!hasInputtedFinancials) {
      newErrors.hasInputtedFinancials = "Please select whether financials were inputted";
    }

    if (hasInputtedFinancials === 1) {
      if (!invoicePaidTo) newErrors.invoicePaidTo = "Please select who was paid";
      if (!paymentStatus) newErrors.paymentStatus = "Please select payment status";
      if (!invoiceDate) newErrors.invoiceDate = "Invoice date is required";
      if (!invoiceIDs) newErrors.invoiceIDs = "Invoice ID is required";
      if (!invoiceServiceFeeID) newErrors.invoiceServiceFeeID = "Service fee is required";
      if (!paymentMethods || paymentMethods.length === 0) {
        newErrors.paymentMethods = "At least one payment method is required";
      }

      // When payment status is "Paid", require service fee payment details
      if (paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID) {
        if (!invoiceServiceFeePaymentDate) {
          newErrors.invoiceServiceFeePaymentDate = "Service fee payment date is required when payment is complete";
        }
        const actualServiceFeePaid = parseFloat(invoiceActualServiceFeeAmountPaid || 0);
        if (actualServiceFeePaid === 0) {
          newErrors.invoiceActualServiceFeeAmountPaid = "Actual service fee paid amount is required when payment is complete";
        }
      } else {
        // For unpaid status, only require date if amount > 0
        const actualServiceFeePaid = parseFloat(invoiceActualServiceFeeAmountPaid || 0);
        if (actualServiceFeePaid > 0 && !invoiceServiceFeePaymentDate) {
          newErrors.invoiceServiceFeePaymentDate = "Payment date is required when a service fee amount has been paid.";
        }
      }
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
      invoiceQuotedOtherCostsAmount: parseFloat(invoiceQuotedOtherCostsAmount || 0),
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
      invoiceActualServiceFeeAmountPaid: parseFloat(invoiceActualServiceFeeAmountPaid || 0),
      invoiceBalanceOwingAmount: parseFloat(invoiceBalanceOwingAmount || 0),
      paymentMethods,
    });

    navigate(
      hasInputtedFinancials === 1
        ? `/admin/task/${tid}/order-completion/step-4`
        : `/admin/task/${tid}/order-completion/step-5`
    );
  }, [
    hasInputtedFinancials, invoicePaidTo, paymentStatus, completionDate, invoiceDate, invoiceIDs,
    invoiceQuotedLabourAmount, invoiceQuotedMaterialAmount, invoiceQuotedOtherCostsAmount,
    invoiceTotalQuoteAmount, invoiceLabourAmount, invoiceMaterialAmount, invoiceOtherCostsAmount,
    invoiceTaxAmount, isCustomTaxAmount, invoiceTotalAmount, invoiceDepositAmount, invoiceAmountDue,
    invoiceServiceFeeID, invoiceServiceFeePercentage, invoiceServiceFeeAmount, invoiceServiceFeePaymentDate,
    invoiceActualServiceFeeAmountPaid, invoiceBalanceOwingAmount, paymentMethods,
    orderCompletionStorage, navigate, tid
  ]);

  const handleBack = useCallback(() => {
    navigate(`/admin/task/${tid}/order-completion/step-2`);
  }, [navigate, tid]);

  // Redirect if needed
  if (forceURL !== "") return <Navigate to={forceURL} />;

  // Action buttons
  const actions = useMemo(() => [{
    label: "Save & Continue",
    variant: "primary",
    icon: ArrowRightIcon,
    iconPosition: "right",
    onClick: handleSubmit,
  }], [handleSubmit]);

  // Common input class
  const inputClass = `w-full pl-10 pr-3 py-2 border ${themeClasses.inputBorder} rounded-lg ${themeClasses.inputFocus}`;
  const inputErrorClass = `w-full pl-10 pr-3 py-2 border border-red-500 rounded-lg ${themeClasses.inputFocus}`;
  const disabledInputClass = `w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50`;

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={3}
      wizardTitle="Order Completion"
      wizardIcon={ClipboardDocumentCheckIcon}
      stepTitle="Financial Details"
      stepSubtitle="Enter invoice and payment information"
      stepIcon={CurrencyDollarIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isFetching}
      actions={actions}
      onBack={handleBack}
      backLabel="Back to Step 2"
      actionLayout="end"
    >
      {/* Status Alert */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert type="info" message="This task is archived / closed" className="mb-6" />
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
        {/* Initial Question */}
        <DetailCard title="Financial Information" icon={BanknotesIcon} maxWidth="full">
          <div>
            <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-3`}>
              Was there financials inputted? <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasInputtedFinancials"
                  value="1"
                  checked={hasInputtedFinancials === 1}
                  onChange={(e) => setHasInputtedFinancials(parseInt(e.target.value))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className={`ml-2 text-sm font-medium ${themeClasses.textPrimary}`}>Yes</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="hasInputtedFinancials"
                  value="2"
                  checked={hasInputtedFinancials === 2}
                  onChange={(e) => setHasInputtedFinancials(parseInt(e.target.value))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className={`ml-2 text-sm font-medium ${themeClasses.textPrimary}`}>No</span>
              </label>
            </div>
            {errors.hasInputtedFinancials && (
              <p className="mt-1 text-sm text-red-600">{errors.hasInputtedFinancials}</p>
            )}
          </div>
        </DetailCard>

        {hasInputtedFinancials === 1 && (
          <>
            {/* Payment Details */}
            <DetailCard title="Payment Details" icon={CreditCardIcon} maxWidth="full">
              <div className="space-y-4">
                {/* Who was paid */}
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
                    Who was paid for this job? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invoicePaidTo"
                        value="1"
                        checked={invoicePaidTo === 1}
                        onChange={(e) => setInvoicePaidTo(parseInt(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 text-sm font-medium ${themeClasses.textPrimary}`}>Associate</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="invoicePaidTo"
                        value="2"
                        checked={invoicePaidTo === 2}
                        onChange={(e) => setInvoicePaidTo(parseInt(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 text-sm font-medium ${themeClasses.textPrimary}`}>Organization</span>
                    </label>
                  </div>
                  {errors.invoicePaidTo && <p className="mt-1 text-sm text-red-600">{errors.invoicePaidTo}</p>}
                </div>

                {/* Payment Status */}
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
                    Were the service fees paid? <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentStatus"
                        value={ORDER_STATUS_COMPLETED_AND_PAID}
                        checked={paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID}
                        onChange={(e) => setPaymentStatus(parseInt(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 text-sm font-medium ${themeClasses.textPrimary}`}>Paid</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="paymentStatus"
                        value={ORDER_STATUS_COMPLETED_BUT_UNPAID}
                        checked={paymentStatus === ORDER_STATUS_COMPLETED_BUT_UNPAID}
                        onChange={(e) => setPaymentStatus(parseInt(e.target.value))}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className={`ml-2 text-sm font-medium ${themeClasses.textPrimary}`}>Unpaid</span>
                    </label>
                  </div>
                  {errors.paymentStatus && <p className="mt-1 text-sm text-red-600">{errors.paymentStatus}</p>}
                </div>

                {/* Dates and Invoice ID */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
                      Invoice Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        value={formatDateForInput(invoiceDate)}
                        onChange={(e) => setInvoiceDate(parseDateFromInput(e.target.value))}
                        className={errors.invoiceDate ? inputErrorClass : inputClass}
                      />
                    </div>
                    {errors.invoiceDate && <p className="mt-1 text-sm text-red-600">{errors.invoiceDate}</p>}
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
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
                        className={errors.invoiceIDs ? inputErrorClass : inputClass}
                      />
                    </div>
                    {errors.invoiceIDs && <p className="mt-1 text-sm text-red-600">{errors.invoiceIDs}</p>}
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
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
                              setPaymentMethods([...paymentMethods, method.value]);
                            } else {
                              setPaymentMethods(paymentMethods.filter((m) => m !== method.value));
                            }
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className={`ml-2 text-sm ${themeClasses.textPrimary}`}>{method.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.paymentMethods && <p className="mt-1 text-sm text-red-600">{errors.paymentMethods}</p>}
                </div>
              </div>
            </DetailCard>

            {/* Quote Details */}
            <DetailCard title="Quote Details" icon={DocumentTextIcon} maxWidth="full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Quoted Labour</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceQuotedLabourAmount} onChange={handleNumericChange(setInvoiceQuotedLabourAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Quoted Materials</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceQuotedMaterialAmount} onChange={handleNumericChange(setInvoiceQuotedMaterialAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Quoted Other Costs</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceQuotedOtherCostsAmount} onChange={handleNumericChange(setInvoiceQuotedOtherCostsAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Total Quoted</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceTotalQuoteAmount} disabled className={disabledInputClass} />
                  </div>
                </div>
              </div>
            </DetailCard>

            {/* Actual Amounts */}
            <DetailCard title="Actual Amounts" icon={BanknotesIcon} maxWidth="full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Actual Labour</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceLabourAmount} onChange={handleNumericChange(setInvoiceLabourAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Actual Material</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceMaterialAmount} onChange={handleNumericChange(setInvoiceMaterialAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Actual Other Costs</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceOtherCostsAmount} onChange={handleNumericChange(setInvoiceOtherCostsAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Actual Tax ({taxRate}%)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceTaxAmount}
                      onChange={isCustomTaxAmount ? handleNumericChange(setInvoiceTaxAmount) : undefined}
                      disabled={!isCustomTaxAmount}
                      placeholder="0.00"
                      className={isCustomTaxAmount ? inputClass : disabledInputClass}
                    />
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isCustomTaxAmount}
                        onChange={(e) => {
                          const isCustom = e.target.checked;
                          setIsCustomTaxAmount(isCustom);
                          if (!isCustom) setInvoiceTaxAmount("");
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className={`ml-2 text-sm ${themeClasses.textPrimary}`}>Custom Tax Amount?</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Actual Total Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceTotalAmount} disabled className={disabledInputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Deposit Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceDepositAmount} onChange={handleNumericChange(setInvoiceDepositAmount)} placeholder="0.00" className={inputClass} />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Amount Due</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceAmountDue} disabled className={disabledInputClass} />
                  </div>
                </div>
              </div>
            </DetailCard>

            {/* Service Fee */}
            <DetailCard title="Service Fee" icon={BuildingLibraryIcon} maxWidth="full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
                    Service Fee <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BuildingLibraryIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={invoiceServiceFeeID}
                      onChange={handleServiceFeeChange}
                      className={`${errors.invoiceServiceFeeID ? inputErrorClass : inputClass} appearance-none bg-white`}
                    >
                      <option value="">Please select...</option>
                      {serviceFeeOptions.map((sf) => {
                        const sfId = sf.id || sf.value;
                        const sfLabel = sf.title || sf.label || sf.name;
                        const sfPercentage = sf.percentage || sf.percent || sf.percentageValue || sf.rate || 0;
                        return (
                          <option key={sfId} value={sfId}>{sfLabel} ({sfPercentage}%)</option>
                        );
                      })}
                    </select>
                  </div>
                  {errors.invoiceServiceFeeID && <p className="mt-1 text-sm text-red-600">{errors.invoiceServiceFeeID}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Service Fee Percentage</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceServiceFeePercentage} disabled className={disabledInputClass} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Percentage applied to labour amount only</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Required Service Fee Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={isNaN(invoiceServiceFeeAmount) ? 0 : invoiceServiceFeeAmount} disabled className={disabledInputClass} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Calculated as: Labour Amount × Service Fee %</p>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
                    Service Fee Payment Date
                    {(paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID || parseFloat(invoiceActualServiceFeeAmountPaid || 0) > 0) && <span className="text-red-500"> *</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={formatDateForInput(invoiceServiceFeePaymentDate)}
                      onChange={(e) => setInvoiceServiceFeePaymentDate(parseDateFromInput(e.target.value))}
                      className={errors.invoiceServiceFeePaymentDate ? inputErrorClass : inputClass}
                    />
                  </div>
                  {errors.invoiceServiceFeePaymentDate && <p className="mt-1 text-sm text-red-600">{errors.invoiceServiceFeePaymentDate}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>
                    Actual Service Fee Amount Paid
                    {paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID && <span className="text-red-500"> *</span>}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CurrencyDollarIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      value={invoiceActualServiceFeeAmountPaid}
                      onChange={handleNumericChange(setInvoiceActualServiceFeeAmountPaid)}
                      placeholder="0.00"
                      className={errors.invoiceActualServiceFeeAmountPaid ? inputErrorClass : inputClass}
                    />
                  </div>
                  {errors.invoiceActualServiceFeeAmountPaid && <p className="mt-1 text-sm text-red-600">{errors.invoiceActualServiceFeeAmountPaid}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${themeClasses.textPrimary} mb-2`}>Balance Owing Amount</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CalculatorIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="number" step="0.01" value={invoiceBalanceOwingAmount} disabled className={disabledInputClass} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">Required Service Fee - Actual Amount Paid</p>
                </div>
              </div>
            </DetailCard>
          </>
        )}
      </form>
    </WizardFormStep>
  );
});

function AdminTaskItemOrderCompletionStep3Page() {
  return <Step3Content />;
}

export default AdminTaskItemOrderCompletionStep3Page;
