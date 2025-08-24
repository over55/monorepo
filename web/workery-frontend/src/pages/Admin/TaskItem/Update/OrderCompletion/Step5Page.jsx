// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  ChevronRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  ExclamationCircleIcon,
  PencilSquareIcon,
  UserIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  CalendarIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
  TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
} from "../../../../../constants/FieldOptions";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../../constants/Order";

function AdminTaskItemOrderCompletionStep5Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get form state from storage
  const formData = orderCompletionStorage.getState();

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);

        if (mounted) {
          setTask(taskData);
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid]);

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Prepare payload for API - using snake_case as expected by backend
      const payload = {
        task_id: tid,
        task_item_id: tid,
        taskItemId: tid, // Include both formats for compatibility
        was_completed: formData.wasCompleted,
        wasCompleted: formData.wasCompleted, // Include both formats
        reason: formData.reason,
        reason_other: formData.reasonOther || "",
        reason_comment: formData.reasonComment || "",
        completion_date: formData.completionDate
          ? new Date(formData.completionDate).toISOString()
          : null,
        visits: parseInt(formData.visits || 0),
        closing_reason_comment: formData.closingReasonComment || "",
        has_inputted_financials: formData.hasInputtedFinancials,
        hasInputtedFinancials: formData.hasInputtedFinancials, // Include both formats
        comment: formData.comment || "",
      };

      // Add financial fields if applicable - using both snake_case and camelCase
      if (formData.hasInputtedFinancials === 1) {
        Object.assign(payload, {
          invoice_paid_to: formData.invoicePaidTo,
          payment_status: formData.paymentStatus,
          invoice_date: formData.invoiceDate
            ? new Date(formData.invoiceDate).toISOString()
            : null,
          invoice_ids: String(formData.invoiceIDs || ""),
          invoice_quoted_labour_amount: parseFloat(
            formData.invoiceQuotedLabourAmount || 0,
          ),
          invoice_quoted_material_amount: parseFloat(
            formData.invoiceQuotedMaterialAmount || 0,
          ),
          invoice_quoted_other_costs_amount: parseFloat(
            formData.invoiceQuotedOtherCostsAmount || 0,
          ),
          invoice_total_quote_amount: parseFloat(
            formData.invoiceTotalQuoteAmount || 0,
          ),
          invoice_labour_amount: parseFloat(formData.invoiceLabourAmount || 0),
          invoice_material_amount: parseFloat(
            formData.invoiceMaterialAmount || 0,
          ),
          invoice_other_costs_amount: parseFloat(
            formData.invoiceOtherCostsAmount || 0,
          ),
          invoice_tax_amount: parseFloat(formData.invoiceTaxAmount || 0),
          invoice_is_custom_tax_amount: Boolean(
            formData.invoiceIsCustomTaxAmount,
          ),
          invoice_total_amount: parseFloat(formData.invoiceTotalAmount || 0),
          invoice_deposit_amount: parseFloat(
            formData.invoiceDepositAmount || 0,
          ),
          invoice_amount_due: parseFloat(formData.invoiceAmountDue || 0),
          invoice_service_fee_id: formData.invoiceServiceFeeID || "",
          invoice_service_fee_percentage: parseFloat(
            formData.invoiceServiceFeePercentage || 0,
          ),
          invoice_service_fee_amount: parseFloat(
            formData.invoiceServiceFeeAmount || 0,
          ),
          invoiceServiceFeeAmount: parseFloat(
            formData.invoiceServiceFeeAmount || 0,
          ), // Include camelCase version
          invoice_service_fee_payment_date:
            formData.invoiceServiceFeePaymentDate
              ? new Date(formData.invoiceServiceFeePaymentDate).toISOString()
              : null,
          invoiceServiceFeePaymentDate: formData.invoiceServiceFeePaymentDate
            ? new Date(formData.invoiceServiceFeePaymentDate).toISOString()
            : null, // Include camelCase version
          invoice_actual_service_fee_amount_paid: parseFloat(
            formData.invoiceActualServiceFeeAmountPaid || 0,
          ),
          invoiceActualServiceFeeAmountPaid: parseFloat(
            formData.invoiceActualServiceFeeAmountPaid || 0,
          ), // Include camelCase version
          invoice_balance_owing_amount: parseFloat(
            formData.invoiceBalanceOwingAmount || 0,
          ),
          payment_methods: formData.paymentMethods || [],
        });
      }

      // Submit to API
      await taskManager.completeOrder(payload, onUnauthorized);

      // Clear the wizard state
      orderCompletionStorage.clearState();

      // Redirect to order detail page
      navigate(`/admin/order/${task.orderWjid}`);
    } catch (error) {
      console.error("Failed to submit order completion:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get label from options
  const getOptionLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Helper function to determine which step to go back to
  const getPreviousStep = () => {
    if (formData.hasInputtedFinancials === 1) {
      return `/admin/task/${tid}/order-completion/step-4`;
    }
    return `/admin/task/${tid}/order-completion/step-3`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading task details...</span>
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
                    <span className="hidden sm:inline">Tasks</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Task Detail
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 sm:w-7 h-6 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Order Completion Task
          </h1>
        </div>

        {/* Wizard Steps - Responsive Design */}
        <div className="mb-6">
          {/* Desktop/Tablet View (768px and up) */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
              {/* Steps 1-4 Complete */}
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-4 h-4 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="ml-2 lg:ml-3">
                      <p className="text-xs lg:text-sm font-medium text-gray-900">
                        {step === 1 && "Status"}
                        {step === 2 && "Details"}
                        {step === 3 && "Survey"}
                        {step === 4 && "Financials"}
                      </p>
                      <p className="text-xs text-gray-500 hidden xl:block">
                        Complete
                      </p>
                    </div>
                  </div>
                  {index < 4 && (
                    <div className="mx-1 lg:mx-2 w-8 lg:w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 lg:w-10 lg:h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm lg:text-base">
                    5
                  </span>
                </div>
                <div className="ml-2 lg:ml-3">
                  <p className="text-xs lg:text-sm font-medium text-gray-900">
                    Review
                  </p>
                  <p className="text-xs text-gray-500 hidden xl:block">
                    Submit
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile View (below 768px) */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 5 of 5
                  </p>
                  <p className="text-xs text-gray-500">Review & Submit</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Progress</p>
                <div className="flex items-center mt-1">
                  <div className="flex">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className="w-2 h-2 bg-green-600 rounded-full mr-1"
                      ></div>
                    ))}
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Review and Submit
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Please carefully review the following task completion details. If
              everything looks correct, click the <strong>Save & Submit</strong>{" "}
              button to complete this task.
            </p>

            {errors.message && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm sm:text-base">
                  {typeof errors === "string"
                    ? errors
                    : errors.message || JSON.stringify(errors)}
                </span>
              </div>
            )}

            {isSubmitting ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Submitting order completion...
                </span>
              </div>
            ) : (
              task && (
                <div className="max-w-3xl mx-auto">
                  <div className="space-y-6 sm:space-y-8">
                    {/* Task Details Section */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <InformationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600" />
                          Task Details
                        </h3>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Type:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              Order Completion
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Job #:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <Link
                                to={`/admin/order/${task.orderWjid}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.orderWjid}
                              </Link>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Client Name:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <Link
                                to={`/admin/customer/${task.customerId}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.customerName}
                              </Link>
                            </p>
                          </div>
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Associate:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <Link
                                to={`/admin/associate/${task.associateId}`}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                {task.associateName}
                              </Link>
                            </p>
                          </div>
                          <div className="sm:col-span-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Description:
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              {task.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Completion Status Section */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <DocumentTextIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-green-600" />
                          Completion Status
                        </h3>
                        <Link
                          to={`/admin/task/${tid}/order-completion/step-2`}
                          className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                        >
                          <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Edit
                        </Link>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Was job successfully completed?
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  formData.wasCompleted === 1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {formData.wasCompleted === 1 ? "Yes" : "No"}
                              </span>
                            </p>
                          </div>

                          {formData.wasCompleted === 1 && (
                            <>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Completion Date:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {formData.completionDate
                                    ? new Date(
                                        formData.completionDate,
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Visits:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {formData.visits}
                                </p>
                              </div>
                              {formData.reasonComment && (
                                <div className="sm:col-span-2">
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Reason Comment:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {formData.reasonComment}
                                  </p>
                                </div>
                              )}
                            </>
                          )}

                          {formData.wasCompleted === 2 && (
                            <>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Reason for cancellation:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {getOptionLabel(
                                    TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION,
                                    formData.reason,
                                  )}
                                </p>
                              </div>
                              {formData.reason === 1 &&
                                formData.reasonOther && (
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Reason (Other):
                                    </span>
                                    <p className="text-xs sm:text-sm text-gray-900">
                                      {formData.reasonOther}
                                    </p>
                                  </div>
                                )}
                              {formData.closingReasonComment && (
                                <div className="sm:col-span-2">
                                  <span className="text-xs sm:text-sm font-medium text-gray-500">
                                    Closing Reason Comment:
                                  </span>
                                  <p className="text-xs sm:text-sm text-gray-900">
                                    {formData.closingReasonComment}
                                  </p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Financial Information Section */}
                    <div className="pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <CurrencyDollarIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-purple-600" />
                          Financial Information
                        </h3>
                        {formData.hasInputtedFinancials === 1 && (
                          <Link
                            to={`/admin/task/${tid}/order-completion/step-4`}
                            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                          >
                            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            Edit
                          </Link>
                        )}
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                          <div>
                            <span className="text-xs sm:text-sm font-medium text-gray-500">
                              Was there financials inputted?
                            </span>
                            <p className="text-xs sm:text-sm text-gray-900">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  formData.hasInputtedFinancials === 1
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {formData.hasInputtedFinancials === 1
                                  ? "Yes"
                                  : "No"}
                              </span>
                            </p>
                          </div>

                          {formData.hasInputtedFinancials === 1 && (
                            <>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Who was paid?
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {formData.invoicePaidTo === 1
                                    ? "Associate"
                                    : "Organization"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Payment Status:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      formData.paymentStatus ===
                                      ORDER_STATUS_COMPLETED_AND_PAID
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {formData.paymentStatus ===
                                    ORDER_STATUS_COMPLETED_AND_PAID
                                      ? "Paid"
                                      : "Unpaid"}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Invoice Date:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {formData.invoiceDate
                                    ? new Date(
                                        formData.invoiceDate,
                                      ).toLocaleDateString()
                                    : "-"}
                                </p>
                              </div>
                              <div>
                                <span className="text-xs sm:text-sm font-medium text-gray-500">
                                  Invoice IDs:
                                </span>
                                <p className="text-xs sm:text-sm text-gray-900">
                                  {formData.invoiceIDs || "-"}
                                </p>
                              </div>

                              <div className="sm:col-span-2 pt-3 border-t">
                                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                                  Financial Summary
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2">
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Total Quoted:
                                    </span>
                                    <p className="text-xs sm:text-sm text-gray-900 font-semibold">
                                      $
                                      {formData.invoiceTotalQuoteAmount ||
                                        "0.00"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Actual Total Amount:
                                    </span>
                                    <p className="text-xs sm:text-sm text-gray-900 font-semibold">
                                      ${formData.invoiceTotalAmount || "0.00"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Service Fee Amount:
                                    </span>
                                    <p className="text-xs sm:text-sm text-gray-900">
                                      $
                                      {formData.invoiceServiceFeeAmount ||
                                        "0.00"}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Balance Owing:
                                    </span>
                                    <p
                                      className={`text-xs sm:text-sm font-semibold ${
                                        formData.invoiceBalanceOwingAmount > 0
                                          ? "text-red-600"
                                          : "text-gray-900"
                                      }`}
                                    >
                                      $
                                      {formData.invoiceBalanceOwingAmount ||
                                        "0.00"}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {formData.paymentMethods &&
                                formData.paymentMethods.length > 0 && (
                                  <div className="sm:col-span-2">
                                    <span className="text-xs sm:text-sm font-medium text-gray-500">
                                      Payment Methods:
                                    </span>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {formData.paymentMethods.map(
                                        (method, index) => (
                                          <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                          >
                                            {getOptionLabel(
                                              ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
                                              method,
                                            )}
                                          </span>
                                        ),
                                      )}
                                    </div>
                                  </div>
                                )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Comments Section */}
                    {formData.comment && (
                      <div className="pt-6 border-t">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                            <CalendarIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-orange-600" />
                            Additional Comments
                          </h3>
                          <Link
                            to={`/admin/task/${tid}/order-completion/step-3`}
                            className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                          >
                            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                            Edit
                          </Link>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                          <p className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap">
                            {formData.comment}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Form Actions */}
                  <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
                    <Link
                      to={getPreviousStep()}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <ArrowLeftIcon className="w-4 h-4 mr-2" />
                      Back
                    </Link>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                    >
                      <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                      Save & Submit
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep5Page;
