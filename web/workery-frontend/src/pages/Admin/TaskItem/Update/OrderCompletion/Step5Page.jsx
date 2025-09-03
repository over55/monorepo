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
  BanknotesIcon,
  ChatBubbleBottomCenterTextIcon,
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
    console.log("handleSubmit triggered.");
    try {
      setIsSubmitting(true);
      setErrors({});
      console.log("Form data for submission:", formData);

      // Validate required fields before submission
      if (
        formData.hasInputtedFinancials === 1 &&
        formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID
      ) {
        const validationErrors = {};

        if (
          !formData.invoiceServiceFeeAmount ||
          parseFloat(formData.invoiceServiceFeeAmount) === 0
        ) {
          validationErrors.invoiceServiceFeeAmount =
            "Service fee amount is required when payment is complete";
        }
        if (!formData.invoiceServiceFeePaymentDate) {
          validationErrors.invoiceServiceFeePaymentDate =
            "Service fee payment date is required when payment is complete";
        }
        if (
          !formData.invoiceActualServiceFeeAmountPaid ||
          parseFloat(formData.invoiceActualServiceFeeAmountPaid) === 0
        ) {
          validationErrors.invoiceActualServiceFeeAmountPaid =
            "Actual service fee paid amount is required when payment is complete";
        }

        if (Object.keys(validationErrors).length > 0) {
          console.log("Validation failed with errors:", validationErrors);
          setErrors(validationErrors);
          window.scrollTo(0, 0);
          return;
        }
      }

      // Prepare payload for API
      const payload = {
        task_id: tid,
        task_item_id: tid,
        taskItemId: tid,
        was_completed: formData.wasCompleted,
        wasCompleted: formData.wasCompleted,
        reason: formData.reason,
        reason_other: formData.reasonOther || "",
        reason_comment: formData.reasonComment || "",
        completion_date: formData.completionDate
          ? new Date(formData.completionDate).toISOString()
          : null,
        visits: parseInt(formData.visits || 0),
        closing_reason_comment: formData.closingReasonComment || "",
        has_inputted_financials: formData.hasInputtedFinancials,
        hasInputtedFinancials: formData.hasInputtedFinancials,
        comment: formData.comment || "",
      };

      // Add financial fields if applicable
      if (formData.hasInputtedFinancials === 1) {
        const serviceFeeAmount = parseFloat(
          formData.invoiceServiceFeeAmount || 0,
        );
        const actualServiceFeePaid = parseFloat(
          formData.invoiceActualServiceFeeAmountPaid || 0,
        );

        const effectiveServiceFeeAmount =
          formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID &&
          serviceFeeAmount === 0
            ? parseFloat(formData.invoiceLabourAmount || 0) *
              (parseFloat(formData.invoiceServiceFeePercentage || 0) / 100)
            : serviceFeeAmount;

        const effectiveActualServiceFeePaid =
          formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID &&
          actualServiceFeePaid === 0
            ? effectiveServiceFeeAmount
            : actualServiceFeePaid;

        const effectiveServiceFeePaymentDate =
          formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID &&
          !formData.invoiceServiceFeePaymentDate
            ? formData.invoiceDate || new Date()
            : formData.invoiceServiceFeePaymentDate;

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
          invoice_service_fee_amount: effectiveServiceFeeAmount,
          invoiceServiceFeeAmount: effectiveServiceFeeAmount,
          invoice_service_fee_payment_date: effectiveServiceFeePaymentDate
            ? new Date(effectiveServiceFeePaymentDate).toISOString()
            : null,
          invoiceServiceFeePaymentDate: effectiveServiceFeePaymentDate
            ? new Date(effectiveServiceFeePaymentDate).toISOString()
            : null,
          invoice_actual_service_fee_amount_paid: effectiveActualServiceFeePaid,
          invoiceActualServiceFeeAmountPaid: effectiveActualServiceFeePaid,
          invoice_balance_owing_amount: parseFloat(
            formData.invoiceBalanceOwingAmount || 0,
          ),
          payment_methods: formData.paymentMethods || [],
        });
      }

      console.log("Submitting payload:", payload);
      await taskManager.completeOrder(payload, onUnauthorized);
      console.log("Order completion submitted successfully.");
      orderCompletionStorage.clearState();
      navigate(`/admin/order/${task.orderWjid}`);
    } catch (error) {
      console.error("Failed to submit order completion:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getOptionLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const getPreviousStep = () => {
    if (formData.hasInputtedFinancials === 1) {
      return `/admin/task/${tid}/order-completion/step-4`;
    }
    return `/admin/task/${tid}/order-completion/step-3`;
  };

  // Section Component with Dark Header
  const DetailSection = ({ title, icon: Icon, children, editLink }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
        {editLink && (
          <Link
            to={editLink}
            className="inline-flex items-center text-xs sm:text-sm text-blue-300 hover:text-blue-200"
          >
            <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
            Edit
          </Link>
        )}
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
        {children}
      </div>
    </div>
  );

  // Detail Field Component
  const DetailField = ({ label, value, status }) => (
    <div className="py-2">
      <dt className="text-xs sm:text-sm font-semibold text-gray-500 mb-1">
        {label}
      </dt>
      <dd className="text-sm sm:text-base text-gray-900">
        {status ? (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === "success"
                ? "bg-green-100 text-green-800"
                : status === "error"
                  ? "bg-red-100 text-red-800"
                  : status === "warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
            }`}
          >
            {value}
          </span>
        ) : (
          value || "-"
        )}
      </dd>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Loading task details...
          </p>
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
                <span className="sm:hidden">Dash</span>
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
                    <ClipboardDocumentListIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Tasks</span>
                    <span className="sm:hidden">Tasks</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <span className="ml-1 text-xs sm:text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center whitespace-nowrap">
                  <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Task Detail
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            Order Completion Task
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review and submit order completion
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
                    <span className="text-white font-semibold text-sm">5</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      Step 5: Review
                    </p>
                    <p className="text-xs text-gray-500">
                      Final review & submit
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">5 of 5</div>
              </div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center">
            <div className="flex items-center">
              {/* Steps 1-4 Complete */}
              {[1, 2, 3, 4].map((step, index) => (
                <React.Fragment key={step}>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                      <CheckIcon className="w-6 h-6 text-white" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {step === 1 && "Status"}
                        {step === 2 && "Details"}
                        {step === 3 && "Survey"}
                        {step === 4 && "Financials"}
                      </p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="mx-2 w-12 h-0.5 bg-green-600"></div>
                  )}
                </React.Fragment>
              ))}

              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Review</p>
                  <p className="text-xs text-gray-500">Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center">
            <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
            <span className="text-xs sm:text-sm">
              {typeof errors === "string"
                ? errors
                : errors.message || JSON.stringify(errors)}
            </span>
          </div>
        )}

        {/* Review Message */}
        <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="ml-3">
              <h3 className="text-sm sm:text-base font-semibold text-blue-900">
                Review and Submit
              </h3>
              <p className="mt-1 text-xs sm:text-sm text-blue-800">
                Please carefully review the following task completion details.
                If everything looks correct, click the{" "}
                <strong>Save & Submit</strong> button to complete this task.
              </p>
            </div>
          </div>
        </div>

        {isSubmitting ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm sm:text-base text-gray-600">
                Submitting order completion...
              </span>
            </div>
          </div>
        ) : (
          task && (
            <div className="space-y-4 sm:space-y-6">
              {/* Task Details Section */}
              <DetailSection title="Task Details" icon={InformationCircleIcon}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailField label="Type" value="Order Completion" />
                  <DetailField
                    label="Job #"
                    value={
                      <Link
                        to={`/admin/order/${task.orderWjid}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {task.orderWjid}
                      </Link>
                    }
                  />
                  <DetailField
                    label="Client Name"
                    value={
                      <Link
                        to={`/admin/customer/${task.customerId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {task.customerName}
                      </Link>
                    }
                  />
                  <DetailField
                    label="Associate"
                    value={
                      <Link
                        to={`/admin/associate/${task.associateId}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {task.associateName}
                      </Link>
                    }
                  />
                  <div className="sm:col-span-2">
                    <DetailField label="Description" value={task.description} />
                  </div>
                </div>
              </DetailSection>

              {/* Completion Status Section */}
              <DetailSection
                title="Completion Status"
                icon={DocumentTextIcon}
                editLink={`/admin/task/${tid}/order-completion/step-2`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                  <DetailField
                    label="Was job successfully completed?"
                    value={formData.wasCompleted === 1 ? "Yes" : "No"}
                    status={formData.wasCompleted === 1 ? "success" : "error"}
                  />

                  {formData.wasCompleted === 1 && (
                    <>
                      <DetailField
                        label="Completion Date"
                        value={
                          formData.completionDate
                            ? new Date(
                                formData.completionDate,
                              ).toLocaleDateString()
                            : "-"
                        }
                      />
                      <DetailField label="Visits" value={formData.visits} />
                      {formData.reasonComment && (
                        <div className="sm:col-span-2">
                          <DetailField
                            label="Reason Comment"
                            value={formData.reasonComment}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {formData.wasCompleted === 2 && (
                    <>
                      <DetailField
                        label="Reason for cancellation"
                        value={getOptionLabel(
                          TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION,
                          formData.reason,
                        )}
                      />
                      {formData.reason === 1 && formData.reasonOther && (
                        <DetailField
                          label="Reason (Other)"
                          value={formData.reasonOther}
                        />
                      )}
                      {formData.closingReasonComment && (
                        <div className="sm:col-span-2">
                          <DetailField
                            label="Closing Reason Comment"
                            value={formData.closingReasonComment}
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </DetailSection>

              {/* Financial Information Section */}
              <DetailSection
                title="Financial Information"
                icon={CurrencyDollarIcon}
                editLink={
                  formData.hasInputtedFinancials === 1
                    ? `/admin/task/${tid}/order-completion/step-4`
                    : null
                }
              >
                <div className="space-y-4">
                  <DetailField
                    label="Was there financials inputted?"
                    value={formData.hasInputtedFinancials === 1 ? "Yes" : "No"}
                    status={
                      formData.hasInputtedFinancials === 1
                        ? "success"
                        : "default"
                    }
                  />

                  {formData.hasInputtedFinancials === 1 && (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <DetailField
                          label="Who was paid?"
                          value={
                            formData.invoicePaidTo === 1
                              ? "Associate"
                              : "Organization"
                          }
                        />
                        <DetailField
                          label="Payment Status"
                          value={
                            formData.paymentStatus ===
                            ORDER_STATUS_COMPLETED_AND_PAID
                              ? "Paid"
                              : "Unpaid"
                          }
                          status={
                            formData.paymentStatus ===
                            ORDER_STATUS_COMPLETED_AND_PAID
                              ? "success"
                              : "warning"
                          }
                        />
                        <DetailField
                          label="Invoice Date"
                          value={
                            formData.invoiceDate
                              ? new Date(
                                  formData.invoiceDate,
                                ).toLocaleDateString()
                              : "-"
                          }
                        />
                        <DetailField
                          label="Invoice IDs"
                          value={formData.invoiceIDs || "-"}
                        />
                      </div>

                      <div className="border-t pt-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                          Financial Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                          <DetailField
                            label="Total Quoted"
                            value={`$${formData.invoiceTotalQuoteAmount || "0.00"}`}
                          />
                          <DetailField
                            label="Actual Total Amount"
                            value={`$${formData.invoiceTotalAmount || "0.00"}`}
                          />
                          <DetailField
                            label="Service Fee Amount"
                            value={`$${formData.invoiceServiceFeeAmount || "0.00"}`}
                          />
                          <DetailField
                            label="Balance Owing"
                            value={`$${formData.invoiceBalanceOwingAmount || "0.00"}`}
                            status={
                              formData.invoiceBalanceOwingAmount > 0
                                ? "error"
                                : "success"
                            }
                          />
                        </div>
                      </div>

                      {formData.paymentMethods &&
                        formData.paymentMethods.length > 0 && (
                          <div className="border-t pt-4">
                            <DetailField
                              label="Payment Methods"
                              value={
                                <div className="flex flex-wrap gap-2">
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
                              }
                            />
                          </div>
                        )}
                    </>
                  )}
                </div>
              </DetailSection>

              {/* Comments Section */}
              {formData.comment && (
                <DetailSection
                  title="Additional Comments"
                  icon={ChatBubbleBottomCenterTextIcon}
                  editLink={`/admin/task/${tid}/order-completion/step-3`}
                >
                  <p className="text-sm sm:text-base text-gray-900 whitespace-pre-wrap">
                    {formData.comment}
                  </p>
                </DetailSection>
              )}

              {/* Form Actions - Responsive */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Link
                  to={getPreviousStep()}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back
                </Link>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Save & Submit
                </button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep5Page;
