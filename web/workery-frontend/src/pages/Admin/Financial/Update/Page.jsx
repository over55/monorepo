// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  CalendarIcon,
  CalculatorIcon,
  BanknotesIcon,
  ClipboardDocumentCheckIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import {
  useFinancialManager,
  useTenantManager,
  useServiceFeeManager,
  useAccountManager,
} from "../../../../services/Services";
import { DateTime } from "luxon";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../constants/FieldOptions";
import {
  ORDER_STATUS_ARCHIVED,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../constants/Order";
import {
  FINANCIAL_STATUS_PAID,
  FINANCIAL_STATUS_PENDING,
  FINANCIAL_STATUS_CANCELLED,
} from "../../../../constants/Financial";

function AdminFinancialUpdatePage() {
  // URL Parameters
  const { fid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const financialManager = useFinancialManager();
  const tenantManager = useTenantManager();
  const serviceFeeManager = useServiceFeeManager();
  const accountManager = useAccountManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [financial, setFinancial] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [taxRate, setTaxRate] = useState(0.0);
  const [alert, setAlert] = useState(null);
  const [onPageLoaded, setOnPageLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [invoicePaidTo, setInvoicePaidTo] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState(FINANCIAL_STATUS_PENDING);
  const [completionDate, setCompletionDate] = useState(null);
  const [invoiceDate, setInvoiceDate] = useState(null);
  const [invoiceIds, setInvoiceIds] = useState("");

  // Quote fields
  const [invoiceQuotedLabourAmount, setInvoiceQuotedLabourAmount] = useState(0);
  const [invoiceQuotedMaterialAmount, setInvoiceQuotedMaterialAmount] =
    useState(0);
  const [invoiceQuotedOtherCostsAmount, setInvoiceQuotedOtherCostsAmount] =
    useState(0);
  const [invoiceTotalQuoteAmount, setInvoiceTotalQuoteAmount] = useState(0);

  // Actual fields
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(0);
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(0);
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(0);
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(0);
  const [invoiceIsCustomTaxAmount, setInvoiceIsCustomTaxAmount] =
    useState(false);
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(0);
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(0);
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(0);

  // Service fee fields
  const [invoiceServiceFeeId, setInvoiceServiceFeeId] = useState("");
  const [invoiceServiceFee, setInvoiceServiceFee] = useState(null);
  const [invoiceServiceFeePercentage, setInvoiceServiceFeePercentage] =
    useState(0);
  const [isInvoiceServiceFeeOther, setIsInvoiceServiceFeeOther] =
    useState(false);
  const [invoiceServiceFeeOther, setInvoiceServiceFeeOther] = useState("");
  const [invoiceServiceFeeAmount, setInvoiceServiceFeeAmount] = useState(0);
  const [invoiceServiceFeePaymentDate, setInvoiceServiceFeePaymentDate] =
    useState(null);
  const [
    invoiceActualServiceFeeAmountPaid,
    setInvoiceActualServiceFeeAmountPaid,
  ] = useState(0);
  const [invoiceBalanceOwingAmount, setInvoiceBalanceOwingAmount] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);

  // Service fees list for dropdown
  const [availableServiceFees, setAvailableServiceFees] = useState([]);

  // Constants
  const INVOICE_PAID_TO_ASSOCIATE = 1;
  const INVOICE_PAID_TO_ORGANIZATION = 2;

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Round to two decimal places
  const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
  };

  // Perform calculations
  const performCalculation = () => {
    console.log("performCalculation: calculating...");

    // Quote calculations
    let quotedLabour = parseFloat(invoiceQuotedLabourAmount) || 0;
    let quotedMaterial = parseFloat(invoiceQuotedMaterialAmount) || 0;
    let quotedOther = parseFloat(invoiceQuotedOtherCostsAmount) || 0;

    const totalQuote = quotedLabour + quotedMaterial + quotedOther;
    setInvoiceTotalQuoteAmount(roundToTwo(totalQuote));

    // Actual calculations
    let actualLabour = parseFloat(invoiceLabourAmount) || 0;
    let actualMaterial = parseFloat(invoiceMaterialAmount) || 0;
    let actualOther = parseFloat(invoiceOtherCostsAmount) || 0;
    let actualTax = parseFloat(invoiceTaxAmount) || 0;

    // Calculate tax if not custom
    if (associateTaxId && associateTaxId !== "" && associateTaxId !== "NA") {
      if (!invoiceIsCustomTaxAmount) {
        actualTax =
          (taxRate / 100.0) * (actualLabour + actualMaterial + actualOther);
        setInvoiceTaxAmount(roundToTwo(actualTax));
      }
    } else if (!invoiceIsCustomTaxAmount) {
      setInvoiceTaxAmount(0);
      actualTax = 0;
    }

    const totalAmount = actualLabour + actualMaterial + actualOther + actualTax;
    setInvoiceTotalAmount(roundToTwo(totalAmount));

    // Service fee calculation
    const serviceFeePercent = parseFloat(invoiceServiceFeePercentage) || 0;
    let serviceFeeAmount = actualLabour * (serviceFeePercent / 100);
    setInvoiceServiceFeeAmount(roundToTwo(serviceFeeAmount));

    // Balance owing calculation
    let actualServiceFeePaid =
      parseFloat(invoiceActualServiceFeeAmountPaid) || 0;
    const balanceOwing = serviceFeeAmount - actualServiceFeePaid;
    setInvoiceBalanceOwingAmount(roundToTwo(balanceOwing));

    // Amount due calculation
    let deposit = parseFloat(invoiceDepositAmount) || 0;
    const amountDue = totalAmount - deposit;
    setInvoiceAmountDue(roundToTwo(amountDue));
  };

  // Format errors for display
  const formatErrorsForDisplay = (errorData) => {
    const formattedErrors = {};

    // Handle different error response structures
    if (typeof errorData === "string") {
      formattedErrors.general = errorData;
    } else if (errorData && typeof errorData === "object") {
      // Check if it's an API validation error response
      if (errorData.errors && typeof errorData.errors === "object") {
        // Handle nested errors object
        Object.keys(errorData.errors).forEach((key) => {
          if (Array.isArray(errorData.errors[key])) {
            formattedErrors[key] = errorData.errors[key].join(", ");
          } else {
            formattedErrors[key] = errorData.errors[key];
          }
        });
      } else if (errorData.error) {
        // Handle single error message
        formattedErrors.general = errorData.error;
      } else if (errorData.message) {
        // Handle message field
        formattedErrors.general = errorData.message;
      } else {
        // Handle flat error object
        Object.keys(errorData).forEach((key) => {
          if (key !== "statusCode" && key !== "status") {
            if (Array.isArray(errorData[key])) {
              formattedErrors[key] = errorData[key].join(", ");
            } else if (typeof errorData[key] === "string") {
              formattedErrors[key] = errorData[key];
            } else if (
              typeof errorData[key] === "object" &&
              errorData[key].message
            ) {
              formattedErrors[key] = errorData[key].message;
            } else {
              formattedErrors[key] = String(errorData[key]);
            }
          }
        });
      }
    }

    // Map API field names to form field names
    if (formattedErrors.amount && !formattedErrors.invoiceTotalAmount) {
      formattedErrors.invoiceTotalAmount = formattedErrors.amount;
    }
    if (formattedErrors.type) {
      formattedErrors.general = formattedErrors.general
        ? `${formattedErrors.general}. ${formattedErrors.type}`
        : formattedErrors.type;
    }

    // Add default error if no specific errors were extracted
    if (Object.keys(formattedErrors).length === 0) {
      formattedErrors.general =
        "An error occurred while updating the financial information.";
    }

    return formattedErrors;
  };

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const userData = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      return null;
    }
  };

  // Fetch tenant details for tax rate
  const fetchTenantDetails = async (tenantId) => {
    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );
      setTaxRate(parseFloat(tenantData.taxRate) || 0);
    } catch (error) {
      console.error("Failed to fetch tenant details:", error);
      setTaxRate(0);
    }
  };

  // Fetch service fee details
  const fetchServiceFeeDetails = async (serviceFeeId) => {
    if (!serviceFeeId || serviceFeeId === "") return;

    try {
      const serviceFeeData = await serviceFeeManager.getServiceFeeDetail(
        serviceFeeId,
        onUnauthorized,
      );
      setInvoiceServiceFee(serviceFeeData);
      if (serviceFeeData && serviceFeeData.percentage) {
        setInvoiceServiceFeePercentage(serviceFeeData.percentage);
      }
    } catch (error) {
      console.error("Failed to fetch service fee details:", error);
    }
  };

  // Fetch available service fees for dropdown
  const fetchAvailableServiceFees = async () => {
    try {
      const response = await serviceFeeManager.getServiceFees(
        {
          status: 1, // Only get active service fees
          limit: 100, // Get up to 100 service fees
          sortBy: "name",
          sortOrder: "ASC",
        },
        onUnauthorized,
      );

      if (response && response.results) {
        setAvailableServiceFees(response.results);
      }
    } catch (error) {
      console.error("Failed to fetch available service fees:", error);
      setAvailableServiceFees([]);
    }
  };

  // Initial data fetch
  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      if (!fid) {
        setErrors({ general: "Financial ID is required" });
        return;
      }

      // First time page load
      if (!onPageLoaded) {
        window.scrollTo(0, 0);
        setOnPageLoaded(true);

        // Fetch current user and tenant tax rate
        const userData = await fetchCurrentUser();
        if (userData && userData.tenantId && mounted) {
          await fetchTenantDetails(userData.tenantId);
        }

        // Fetch available service fees for dropdown
        await fetchAvailableServiceFees();
      }

      // Fetch financial details if not already loaded
      if (!financial || Object.keys(financial).length === 0) {
        setFetching(true);
        setErrors({});

        try {
          // Use FinancialManager to get financial details
          const financialData = await financialManager.getFinancialDetail(
            fid,
            onUnauthorized,
          );

          if (mounted) {
            setFinancial(financialData);

            // Set form fields from financial data
            setInvoicePaidTo(
              financialData.invoicePaidTo || INVOICE_PAID_TO_ASSOCIATE,
            );
            setPaymentStatus(financialData.status || FINANCIAL_STATUS_PENDING);
            setCompletionDate(financialData.completionDate);
            setInvoiceDate(financialData.invoiceDate);
            setInvoiceIds(financialData.invoiceIds || "");

            // Quote fields
            setInvoiceQuotedLabourAmount(
              financialData.invoiceQuotedLabourAmount || 0,
            );
            setInvoiceQuotedMaterialAmount(
              financialData.invoiceQuotedMaterialAmount || 0,
            );
            setInvoiceQuotedOtherCostsAmount(
              financialData.invoiceQuotedOtherCostsAmount || 0,
            );
            setInvoiceTotalQuoteAmount(
              financialData.invoiceTotalQuoteAmount || 0,
            );

            // Actual fields
            setInvoiceLabourAmount(financialData.invoiceLabourAmount || 0);
            setInvoiceMaterialAmount(financialData.invoiceMaterialAmount || 0);
            setInvoiceOtherCostsAmount(
              financialData.invoiceOtherCostsAmount || 0,
            );
            setAssociateTaxId(financialData.associateTaxId || "");
            setInvoiceTaxAmount(financialData.invoiceTaxAmount || 0);
            setInvoiceIsCustomTaxAmount(
              financialData.invoiceIsCustomTaxAmount || false,
            );
            setInvoiceTotalAmount(financialData.invoiceTotalAmount || 0);
            setInvoiceDepositAmount(financialData.invoiceDepositAmount || 0);
            setInvoiceAmountDue(financialData.invoiceAmountDue || 0);

            // Service fee fields
            setInvoiceServiceFeeId(financialData.invoiceServiceFeeId || "");
            setInvoiceServiceFeePercentage(
              financialData.invoiceServiceFeePercentage || 0,
            );
            setIsInvoiceServiceFeeOther(
              financialData.isInvoiceServiceFeeOther || false,
            );
            setInvoiceServiceFeeOther(
              financialData.invoiceServiceFeeOther || "",
            );
            setInvoiceServiceFeeAmount(
              financialData.invoiceServiceFeeAmount || 0,
            );
            setInvoiceServiceFeePaymentDate(
              financialData.invoiceServiceFeePaymentDate,
            );
            setPaymentMethods(financialData.paymentMethods || []);
            setInvoiceActualServiceFeeAmountPaid(
              financialData.invoiceActualServiceFeeAmountPaid || 0,
            );
            setInvoiceBalanceOwingAmount(
              financialData.invoiceBalanceOwingAmount || 0,
            );

            // Set the service fee object if ID exists
            if (financialData.invoiceServiceFeeId) {
              // Find from available service fees if already loaded
              const foundFee = availableServiceFees.find(
                (fee) => fee.id === financialData.invoiceServiceFeeId,
              );
              if (foundFee) {
                setInvoiceServiceFee(foundFee);
              } else {
                // Fetch if not in the list (for backward compatibility)
                await fetchServiceFeeDetails(financialData.invoiceServiceFeeId);
              }
            }
          }
        } catch (error) {
          console.error("Failed to fetch financial details:", error);
          if (mounted) {
            const formattedErrors = formatErrorsForDisplay(error);
            setErrors(formattedErrors);
          }
        } finally {
          if (mounted) {
            setFetching(false);
          }
        }
      }
    };

    initializePage();

    return () => {
      mounted = false;
    };
  }, [fid, onPageLoaded, availableServiceFees]);

  // Recalculate when relevant fields change
  useEffect(() => {
    if (financial) {
      performCalculation();
    }
  }, [
    invoiceQuotedLabourAmount,
    invoiceQuotedMaterialAmount,
    invoiceQuotedOtherCostsAmount,
    invoiceLabourAmount,
    invoiceMaterialAmount,
    invoiceOtherCostsAmount,
    invoiceTaxAmount,
    invoiceIsCustomTaxAmount,
    invoiceDepositAmount,
    invoiceServiceFeePercentage,
    invoiceActualServiceFeeAmountPaid,
    taxRate,
    associateTaxId,
  ]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setAlert(null);
    setIsSubmitting(true);

    // Validate required fields
    const validationErrors = {};

    // Validate amount (total amount must be greater than 0)
    if (!invoiceTotalAmount || parseFloat(invoiceTotalAmount) === 0) {
      validationErrors.invoiceTotalAmount =
        "Total amount is required and must be greater than 0";
    }

    // Basic validation
    if (!invoiceDate) {
      validationErrors.invoiceDate = "Invoice date is required";
    }

    if (!invoiceIds || invoiceIds.trim() === "") {
      validationErrors.invoiceIds = "Invoice ID is required";
    }

    if (!invoicePaidTo) {
      validationErrors.invoicePaidTo =
        "Please select who was paid for this job";
    }

    if (!paymentStatus) {
      validationErrors.paymentStatus = "Payment status is required";
    }

    // Validate amounts are not negative
    if (parseFloat(invoiceLabourAmount) < 0) {
      validationErrors.invoiceLabourAmount = "Labour amount cannot be negative";
    }

    if (parseFloat(invoiceMaterialAmount) < 0) {
      validationErrors.invoiceMaterialAmount =
        "Material amount cannot be negative";
    }

    if (parseFloat(invoiceOtherCostsAmount) < 0) {
      validationErrors.invoiceOtherCostsAmount =
        "Other costs cannot be negative";
    }

    if (parseFloat(invoiceDepositAmount) < 0) {
      validationErrors.invoiceDepositAmount =
        "Deposit amount cannot be negative";
    }

    if (parseFloat(invoiceActualServiceFeeAmountPaid) < 0) {
      validationErrors.invoiceActualServiceFeeAmountPaid =
        "Service fee paid cannot be negative";
    }

    // Check if at least one payment method is selected for paid status
    if (
      paymentStatus === FINANCIAL_STATUS_PAID &&
      paymentMethods.length === 0
    ) {
      validationErrors.paymentMethods =
        "Please select at least one payment method for paid invoices";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below before submitting.",
      });
      setIsSubmitting(false);
      window.scrollTo(0, 0);
      return;
    }

    // Build update data for the financial record
    const updateData = {
      // Status update
      payment_status: parseInt(paymentStatus),

      // Financial fields
      invoicePaidTo: parseInt(invoicePaidTo),
      completionDate: completionDate,
      invoiceDate: invoiceDate,
      invoiceIds: invoiceIds.toString().trim(),

      // Quote fields
      invoiceQuotedLabourAmount: parseFloat(invoiceQuotedLabourAmount),
      invoiceQuotedMaterialAmount: parseFloat(invoiceQuotedMaterialAmount),
      invoiceQuotedOtherCostsAmount: parseFloat(invoiceQuotedOtherCostsAmount),
      invoiceTotalQuoteAmount: parseFloat(invoiceTotalQuoteAmount),

      // Actual fields
      invoiceLabourAmount: parseFloat(invoiceLabourAmount),
      invoiceMaterialAmount: parseFloat(invoiceMaterialAmount),
      invoiceOtherCostsAmount: parseFloat(invoiceOtherCostsAmount),
      invoiceTaxAmount: parseFloat(invoiceTaxAmount),
      invoiceIsCustomTaxAmount: invoiceIsCustomTaxAmount === true,
      invoiceTotalAmount: parseFloat(invoiceTotalAmount),
      invoiceDepositAmount: parseFloat(invoiceDepositAmount),
      invoiceAmountDue: parseFloat(invoiceAmountDue),

      // Service fee fields
      invoiceServiceFeeId: invoiceServiceFeeId,
      invoiceServiceFeePercentage: parseFloat(invoiceServiceFeePercentage),
      invoiceServiceFee: invoiceServiceFee,
      invoiceServiceFeeOther: invoiceServiceFeeOther,
      isInvoiceServiceFeeOther: isInvoiceServiceFeeOther,
      invoiceServiceFeeAmount: parseFloat(invoiceServiceFeeAmount),
      invoiceServiceFeePaymentDate: invoiceServiceFeePaymentDate,
      paymentMethods: paymentMethods,
      invoiceActualServiceFeeAmountPaid: parseFloat(
        invoiceActualServiceFeeAmountPaid,
      ),
      invoiceBalanceOwingAmount: parseFloat(invoiceBalanceOwingAmount),

      // Include the order ID if it exists
      orderId: financial.orderId,
    };

    try {
      // Debug log to see what we're sending
      console.log("Submitting financial update:", updateData);

      // Use FinancialManager to update the financial information
      await financialManager.updateFinancial(fid, updateData, onUnauthorized);

      setAlert({
        type: "success",
        message: "Financial information updated successfully!",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/financial/${fid}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update financial information:", error);

      // Format and set errors
      const formattedErrors = formatErrorsForDisplay(error);
      setErrors(formattedErrors);

      // Create detailed error message for alert
      const errorMessages = [];
      Object.keys(formattedErrors).forEach((key) => {
        if (key === "general") {
          errorMessages.push(formattedErrors[key]);
        } else {
          // Format field name for display
          const fieldName = key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase());
          errorMessages.push(`${fieldName}: ${formattedErrors[key]}`);
        }
      });

      setAlert({
        type: "error",
        message:
          errorMessages.length > 0
            ? errorMessages.join(". ")
            : "Failed to update financial information. Please check the form and try again.",
      });

      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for input
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      return DateTime.fromISO(dateString).toFormat("yyyy-MM-dd");
    } catch (error) {
      return "";
    }
  };

  // Check if financial is archived
  const isFinancialArchived = () => {
    return financial && financial.status === ORDER_STATUS_ARCHIVED;
  };

  // Loading state
  if (isFetching && !financial) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading financial details...</p>
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
                to={`/admin/financial/${fid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Financial #{fid}
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Update
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
              Financial Record
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Update financial information #{fid}
              {financial && financial.orderId && (
                <span className="ml-2">
                  (Related to Order #{financial.orderId})
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {isFinancialArchived() && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
          <div className="flex items-center">
            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
            <span>This financial record is archived.</span>
          </div>
        </div>
      )}

      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-start">
              {alert.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-medium">
                  {alert.type === "error"
                    ? "Please fix the following errors:"
                    : "Success!"}
                </span>
                <div className="mt-1 text-sm">{alert.message}</div>
              </div>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-current hover:opacity-70 text-xl ml-4"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Detailed Error display (only if there are errors and no alert) */}
      {errors && Object.keys(errors).length > 0 && !alert && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
          <div className="flex items-start mb-2">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-medium">
                Please correct the following errors:
              </span>
              <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                {Object.keys(errors).map((key) => {
                  const fieldName =
                    key === "general"
                      ? ""
                      : key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase()) + ": ";
                  return (
                    <li key={key}>
                      <span className="font-medium">{fieldName}</span>
                      {errors[key]}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      {financial && (
        <div className="bg-white shadow-sm rounded-lg">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                <PencilSquareIcon className="w-7 h-7 mr-2 text-blue-600" />
                Update Financial Information
              </h2>
              <Link to={`/admin/financial/${fid}`}>
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Detail
                </button>
              </Link>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* General Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="w-5 h-5 mr-2 text-blue-600" />
                  General
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Who was paid for this job?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-x-6">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value={INVOICE_PAID_TO_ASSOCIATE}
                          checked={invoicePaidTo === INVOICE_PAID_TO_ASSOCIATE}
                          onChange={(e) =>
                            setInvoicePaidTo(parseInt(e.target.value))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          <UserGroupIcon className="inline w-4 h-4 mr-1" />
                          Associate
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value={INVOICE_PAID_TO_ORGANIZATION}
                          checked={
                            invoicePaidTo === INVOICE_PAID_TO_ORGANIZATION
                          }
                          onChange={(e) =>
                            setInvoicePaidTo(parseInt(e.target.value))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          <BuildingOfficeIcon className="inline w-4 h-4 mr-1" />
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      What is the payment status?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-x-6">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value={FINANCIAL_STATUS_PAID}
                          checked={paymentStatus === FINANCIAL_STATUS_PAID}
                          onChange={(e) =>
                            setPaymentStatus(parseInt(e.target.value))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          <CheckCircleIcon className="inline w-4 h-4 mr-1 text-green-600" />
                          Paid
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value={FINANCIAL_STATUS_PENDING}
                          checked={paymentStatus === FINANCIAL_STATUS_PENDING}
                          onChange={(e) =>
                            setPaymentStatus(parseInt(e.target.value))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          <XCircleIcon className="inline w-4 h-4 mr-1 text-yellow-600" />
                          Pending
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          value={FINANCIAL_STATUS_CANCELLED}
                          checked={paymentStatus === FINANCIAL_STATUS_CANCELLED}
                          onChange={(e) =>
                            setPaymentStatus(parseInt(e.target.value))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          <XCircleIcon className="inline w-4 h-4 mr-1 text-red-600" />
                          Cancelled
                        </span>
                      </label>
                    </div>
                    {errors.paymentStatus && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.paymentStatus}
                      </p>
                    )}
                  </div>

                  {paymentStatus === FINANCIAL_STATUS_PAID && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Completion Date
                        </label>
                        <input
                          type="date"
                          value={formatDateForInput(completionDate)}
                          onChange={(e) => setCompletionDate(e.target.value)}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.completionDate
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        />
                        {errors.completionDate && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.completionDate}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={formatDateForInput(invoiceDate)}
                        onChange={(e) => setInvoiceDate(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceDate
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.invoiceDate && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceDate}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Invoice IDs <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={invoiceIds}
                        onChange={(e) => setInvoiceIds(e.target.value)}
                        placeholder="Enter invoice ID"
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceIds
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.invoiceIds && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceIds}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        The system automatically generates an ID if not provided
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quote Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentCheckIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Quote
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quoted Labour <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceQuotedLabourAmount}
                        onChange={(e) =>
                          setInvoiceQuotedLabourAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceQuotedLabourAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceQuotedLabourAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceQuotedLabourAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no quoted labour costs, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quoted Materials <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceQuotedMaterialAmount}
                        onChange={(e) =>
                          setInvoiceQuotedMaterialAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceQuotedMaterialAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceQuotedMaterialAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceQuotedMaterialAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no quoted material costs, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quoted Other Costs <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceQuotedOtherCostsAmount}
                        onChange={(e) =>
                          setInvoiceQuotedOtherCostsAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceQuotedOtherCostsAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceQuotedOtherCostsAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceQuotedOtherCostsAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no quoted other costs, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Quoted <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceTotalQuoteAmount}
                        disabled
                        className="block w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <CalculatorIcon className="w-3 h-3 mr-1" />
                      Automatically calculated
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actual Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BanknotesIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Actual
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Labour <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceLabourAmount}
                        onChange={(e) => setInvoiceLabourAmount(e.target.value)}
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceLabourAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceLabourAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceLabourAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no actual labour costs, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Material <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceMaterialAmount}
                        onChange={(e) =>
                          setInvoiceMaterialAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceMaterialAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceMaterialAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceMaterialAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no material costs were incurred, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Other Costs <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceOtherCostsAmount}
                        onChange={(e) =>
                          setInvoiceOtherCostsAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceOtherCostsAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceOtherCostsAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceOtherCostsAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no other costs were incurred, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Tax <span className="text-red-500">*</span>
                      {taxRate > 0 && (
                        <span className="text-xs text-gray-500 ml-2">
                          (Tax rate: {taxRate}%
                          {associateTaxId && `, HST#: ${associateTaxId}`})
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceTaxAmount}
                        onChange={(e) => setInvoiceTaxAmount(e.target.value)}
                        placeholder="0.00"
                        disabled={!invoiceIsCustomTaxAmount}
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          !invoiceIsCustomTaxAmount ? "bg-gray-50" : ""
                        } ${errors.invoiceTaxAmount ? "border-red-300" : "border-gray-300"}`}
                        required
                      />
                    </div>
                    {errors.invoiceTaxAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceTaxAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      {!invoiceIsCustomTaxAmount
                        ? `Tax is automatically calculated at ${taxRate}%`
                        : "Using custom tax amount"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={invoiceIsCustomTaxAmount}
                        onChange={(e) =>
                          setInvoiceIsCustomTaxAmount(e.target.checked)
                        }
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Custom Actual Tax? (Override automatic calculation with
                        custom value)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Total Amount{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceTotalAmount}
                        disabled
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg bg-gray-50 text-gray-700 ${
                          errors.invoiceTotalAmount || errors.amount
                            ? "border-red-300"
                            : "border-gray-200"
                        }`}
                      />
                    </div>
                    {(errors.invoiceTotalAmount || errors.amount) && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceTotalAmount || errors.amount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <CalculatorIcon className="w-3 h-3 mr-1" />
                      Automatically calculated
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Deposit Amount{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceDepositAmount}
                        onChange={(e) =>
                          setInvoiceDepositAmount(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceDepositAmount
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceDepositAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceDepositAmount}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      If no deposit, enter 0
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Amount Due <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceAmountDue}
                        disabled
                        className="block w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <CalculatorIcon className="w-3 h-3 mr-1" />
                      Total amount minus deposit
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method(s) <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            value={option.value}
                            checked={paymentMethods.includes(option.value)}
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (e.target.checked) {
                                setPaymentMethods([...paymentMethods, value]);
                              } else {
                                setPaymentMethods(
                                  paymentMethods.filter((v) => v !== value),
                                );
                              }
                            }}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            <CreditCardIcon className="inline w-4 h-4 mr-1" />
                            {option.label}
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
              </div>
            </div>

            {/* Service Fee Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Service Fee
                </h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee
                    </label>
                    <select
                      value={invoiceServiceFeeId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setInvoiceServiceFeeId(selectedId);

                        // Find the selected service fee and update percentage
                        const selectedFee = availableServiceFees.find(
                          (fee) => fee.id === selectedId,
                        );

                        if (selectedFee) {
                          setInvoiceServiceFee(selectedFee);
                          setInvoiceServiceFeePercentage(
                            selectedFee.percentage || 0,
                          );

                          // Check if it's "Other" option
                          if (
                            selectedFee.name &&
                            selectedFee.name.toLowerCase() === "other"
                          ) {
                            setIsInvoiceServiceFeeOther(true);
                          } else {
                            setIsInvoiceServiceFeeOther(false);
                            setInvoiceServiceFeeOther("");
                          }
                        } else {
                          setInvoiceServiceFee(null);
                          setInvoiceServiceFeePercentage(0);
                          setIsInvoiceServiceFeeOther(false);
                          setInvoiceServiceFeeOther("");
                        }
                      }}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.invoiceServiceFeeId
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    >
                      <option value="">Select a service fee...</option>
                      {availableServiceFees.map((fee) => (
                        <option key={fee.id} value={fee.id}>
                          {fee.name} ({fee.percentage}%)
                        </option>
                      ))}
                    </select>
                    {errors.invoiceServiceFeeId && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceServiceFeeId}
                      </p>
                    )}
                    {invoiceServiceFee && invoiceServiceFee.description && (
                      <p className="mt-1 text-xs text-gray-500">
                        {invoiceServiceFee.description}
                      </p>
                    )}
                  </div>

                  {isInvoiceServiceFeeOther && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service Fee Other
                      </label>
                      <input
                        type="text"
                        value={invoiceServiceFeeOther}
                        onChange={(e) =>
                          setInvoiceServiceFeeOther(e.target.value)
                        }
                        placeholder="Enter custom service fee description"
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceServiceFeeOther
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                      />
                      {errors.invoiceServiceFeeOther && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.invoiceServiceFeeOther}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Service Fee Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceServiceFeePercentage}
                        readOnly
                        className="block w-full pr-8 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">%</span>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Automatically set based on selected service fee
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Required Service Fee Amount{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceServiceFeeAmount}
                        disabled
                        className="block w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <CalculatorIcon className="w-3 h-3 mr-1" />
                      Service fee owed by associate
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invoice Service Fee Payment Date
                    </label>
                    <input
                      type="date"
                      value={formatDateForInput(invoiceServiceFeePaymentDate)}
                      onChange={(e) =>
                        setInvoiceServiceFeePaymentDate(e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.invoiceServiceFeePaymentDate
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.invoiceServiceFeePaymentDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceServiceFeePaymentDate}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Service Fee Paid{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceActualServiceFeeAmountPaid}
                        onChange={(e) =>
                          setInvoiceActualServiceFeeAmountPaid(e.target.value)
                        }
                        placeholder="0.00"
                        className={`block w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.invoiceActualServiceFeeAmountPaid
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {errors.invoiceActualServiceFeeAmountPaid && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.invoiceActualServiceFeeAmountPaid}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Amount paid by associate and received by organization
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Balance Owing Amount{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">$</span>
                      </div>
                      <input
                        type="number"
                        step="0.01"
                        value={invoiceBalanceOwingAmount}
                        disabled
                        className="block w-full pl-7 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500 flex items-center">
                      <CalculatorIcon className="w-3 h-3 mr-1" />
                      Remaining balance to be paid by associate
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Link to={`/admin/financial/${fid}`}>
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Detail
                </button>
              </Link>

              <button
                type="submit"
                disabled={isFinancialArchived() || isSubmitting}
                className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                  isFinancialArchived() || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {isSubmitting ? "Saving..." : "Save & Submit"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AdminFinancialUpdatePage;
