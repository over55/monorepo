// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step5Page.jsx
// @uix-page: TaskItemOrderCompletionStep5
// UIX Upgraded - Uses WizardFormStep whole page component

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  WizardFormStep,
  DetailCard,
  Alert,
  useUIXTheme,
} from "../../../../../components/UIX";
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
import { convertLocalDateToISO } from "../../../../../constants/Date";
import {
  CheckCircleIcon,
  ClipboardDocumentCheckIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = Object.freeze([
  { title: "Review", description: "Task Details", isCompleted: true },
  { title: "Status", description: "Completion Status", isCompleted: true },
  { title: "Financials", description: "Invoice Details", isCompleted: true },
  { title: "Comments", description: "Add Notes", isCompleted: true },
  { title: "Submit", description: "Review & Complete" },
]);

// Memoized Detail Field Component
const DetailField = memo(function DetailField({ label, value, status }) {
  return (
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
});

// Memoized content component
const Step5Content = memo(function Step5Content() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-800",
  }), [getThemeClasses]);

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Get form state from storage
  const formData = orderCompletionStorage.getState();

  const onUnauthorized = useCallback(() => {
    setForceURL("/login?unauthorized=true");
  }, []);

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
          setErrors({ message: error.message || "Failed to load task details" });
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
  }, [tid, taskManager, onUnauthorized]);

  const handleSubmit = useCallback(async () => {
    console.log("=== handleSubmit CALLED ===");
    console.log("formData:", formData);
    console.log("task:", task);
    console.log("tid:", tid);

    try {
      setIsSubmitting(true);
      setErrors({});

      console.log("=== Starting validation ===");
      console.log("hasInputtedFinancials:", formData.hasInputtedFinancials);
      console.log("paymentStatus:", formData.paymentStatus);

      // Validate required fields before submission
      if (formData.hasInputtedFinancials === 1) {
        console.log("=== Financial validation triggered ===");
        const validationErrors = {};

        // Validate service fee fields if payment status indicates they were paid
        if (formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID) {
          if (
            !formData.invoiceServiceFeeAmount ||
            parseFloat(formData.invoiceServiceFeeAmount) === 0
          ) {
            validationErrors.invoiceServiceFeeAmount =
              "Service fee amount is required when service fees are paid";
          }
          if (!formData.invoiceServiceFeePaymentDate) {
            validationErrors.invoiceServiceFeePaymentDate =
              "Service fee payment date is required when service fees are paid";
          }
          if (
            !formData.invoiceActualServiceFeeAmountPaid ||
            parseFloat(formData.invoiceActualServiceFeeAmountPaid) === 0
          ) {
            validationErrors.invoiceActualServiceFeeAmountPaid =
              "Actual service fee paid amount is required when service fees are paid";
          }
        }

        console.log("validationErrors:", validationErrors);

        if (Object.keys(validationErrors).length > 0) {
          console.log("=== VALIDATION FAILED - returning early ===");
          // Format errors with a message property so WizardFormStep displays them
          const errorMessages = Object.values(validationErrors).join(". ");
          setErrors({
            ...validationErrors,
            message: `Please fix the following errors: ${errorMessages}`
          });
          window.scrollTo(0, 0);
          return;
        }
      }

      console.log("=== Validation passed, preparing payload ===");

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
          ? convertLocalDateToISO(formData.completionDate)
          : null,
        visits: parseInt(formData.visits || 0),
        closing_reason_comment: formData.closingReasonComment || "",
        has_inputted_financials: formData.hasInputtedFinancials,
        hasInputtedFinancials: formData.hasInputtedFinancials,
        comment: formData.comment || "",
      };

      // Add financial fields if applicable
      if (formData.hasInputtedFinancials === 1) {
        const serviceFeeAmount = parseFloat(formData.invoiceServiceFeeAmount || 0);
        const actualServiceFeePaid = parseFloat(formData.invoiceActualServiceFeeAmountPaid || 0);

        const effectiveServiceFeeAmount =
          formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID && serviceFeeAmount === 0
            ? parseFloat(formData.invoiceLabourAmount || 0) *
              (parseFloat(formData.invoiceServiceFeePercentage || 0) / 100)
            : serviceFeeAmount;

        const effectiveActualServiceFeePaid =
          formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID && actualServiceFeePaid === 0
            ? effectiveServiceFeeAmount
            : actualServiceFeePaid;

        const effectiveServiceFeePaymentDate =
          formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID && !formData.invoiceServiceFeePaymentDate
            ? formData.invoiceDate || new Date()
            : formData.invoiceServiceFeePaymentDate;

        Object.assign(payload, {
          invoice_paid_to: formData.invoicePaidTo,
          payment_status: formData.paymentStatus,
          invoice_date: formData.invoiceDate ? convertLocalDateToISO(formData.invoiceDate) : null,
          invoice_ids: String(formData.invoiceIDs || ""),
          invoice_quoted_labour_amount: parseFloat(formData.invoiceQuotedLabourAmount || 0),
          invoice_quoted_material_amount: parseFloat(formData.invoiceQuotedMaterialAmount || 0),
          invoice_quoted_other_costs_amount: parseFloat(formData.invoiceQuotedOtherCostsAmount || 0),
          invoice_total_quote_amount: parseFloat(formData.invoiceTotalQuoteAmount || 0),
          invoice_labour_amount: parseFloat(formData.invoiceLabourAmount || 0),
          invoice_material_amount: parseFloat(formData.invoiceMaterialAmount || 0),
          invoice_other_costs_amount: parseFloat(formData.invoiceOtherCostsAmount || 0),
          invoice_tax_amount: parseFloat(formData.invoiceTaxAmount || 0),
          invoice_is_custom_tax_amount: Boolean(formData.invoiceIsCustomTaxAmount),
          invoice_total_amount: parseFloat(formData.invoiceTotalAmount || 0),
          invoice_deposit_amount: parseFloat(formData.invoiceDepositAmount || 0),
          invoice_amount_due: parseFloat(formData.invoiceAmountDue || 0),
          invoice_service_fee_id: formData.invoiceServiceFeeID || "",
          invoice_service_fee_percentage: parseFloat(formData.invoiceServiceFeePercentage || 0),
          invoice_service_fee_amount: effectiveServiceFeeAmount,
          invoiceServiceFeeAmount: effectiveServiceFeeAmount,
          invoice_service_fee_payment_date: effectiveServiceFeePaymentDate
            ? convertLocalDateToISO(effectiveServiceFeePaymentDate)
            : null,
          invoiceServiceFeePaymentDate: effectiveServiceFeePaymentDate
            ? convertLocalDateToISO(effectiveServiceFeePaymentDate)
            : null,
          invoice_actual_service_fee_amount_paid: effectiveActualServiceFeePaid,
          invoiceActualServiceFeeAmountPaid: effectiveActualServiceFeePaid,
          invoice_balance_owing_amount: parseFloat(formData.invoiceBalanceOwingAmount || 0),
          payment_methods: formData.paymentMethods || [],
        });
        console.log("=== Financial fields added to payload ===");
      }

      console.log("=== FINAL PAYLOAD ===");
      console.log(JSON.stringify(payload, null, 2));

      console.log("=== Calling taskManager.completeOrder ===");
      await taskManager.completeOrder(payload, onUnauthorized);
      console.log("=== API call successful ===");

      orderCompletionStorage.clearState();
      console.log("=== Navigating to order page ===");
      console.log("task.orderWjid:", task?.orderWjid);
      navigate(`/admin/order/${task.orderWjid}`);
    } catch (error) {
      console.error("=== ERROR in handleSubmit ===");
      console.error("Error type:", typeof error);
      console.error("Error:", error);
      console.error("Error message:", error?.message);
      console.error("Error stack:", error?.stack);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      console.log("=== handleSubmit FINISHED ===");
      setIsSubmitting(false);
    }
  }, [formData, tid, task, taskManager, orderCompletionStorage, navigate, onUnauthorized]);

  const getOptionLabel = useCallback((options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  }, []);

  const getPreviousStep = useCallback(() => {
    if (formData.hasInputtedFinancials === 1) {
      return `/admin/task/${tid}/order-completion/step-4`;
    }
    return `/admin/task/${tid}/order-completion/step-3`;
  }, [formData.hasInputtedFinancials, tid]);

  const handleBack = useCallback(() => {
    navigate(getPreviousStep());
  }, [navigate, getPreviousStep]);

  // Redirect if needed
  if (forceURL !== "") return <Navigate to={forceURL} />;

  // Action buttons
  const actions = useMemo(() => [{
    label: "Save & Submit",
    variant: "success",
    icon: CheckCircleIcon,
    onClick: handleSubmit,
    disabled: isSubmitting,
    loading: isSubmitting,
    loadingText: "Submitting...",
  }], [handleSubmit, isSubmitting]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={5}
      wizardTitle="Order Completion"
      wizardIcon={ClipboardDocumentCheckIcon}
      stepTitle="Review & Submit"
      stepSubtitle="Review all details before completing the order"
      stepIcon={CheckCircleIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={isLoading}
      actions={actions}
      onBack={handleBack}
      backLabel="Back"
      actionLayout="end"
    >
      {/* Status Alert */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert type="info" message="This task is archived / closed" className="mb-6" />
      )}

      {/* Review Warning */}
      <Alert
        type="info"
        message="Please carefully review the following task completion details. If everything looks correct, click the Save & Submit button to complete this task."
        className="mb-6"
      />

      {isSubmitting ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-sm text-gray-600">
              Submitting order completion...
            </span>
          </div>
        </div>
      ) : (
        task && (
          <div className="space-y-6">
            {/* Task Details Section */}
            <DetailCard title="Task Details" icon={InformationCircleIcon} maxWidth="full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                <DetailField label="Type" value="Order Completion" />
                <DetailField
                  label="Job #"
                  value={
                    <Link to={`/admin/order/${task.orderWjid}`} className={themeClasses.linkPrimary}>
                      {task.orderWjid}
                    </Link>
                  }
                />
                <DetailField
                  label="Client Name"
                  value={
                    <Link to={`/admin/customer/${task.customerId}`} className={themeClasses.linkPrimary}>
                      {task.customerName}
                    </Link>
                  }
                />
                <DetailField
                  label="Associate"
                  value={
                    <Link to={`/admin/associate/${task.associateId}`} className={themeClasses.linkPrimary}>
                      {task.associateName}
                    </Link>
                  }
                />
                <div className="sm:col-span-2">
                  <DetailField label="Description" value={task.description} />
                </div>
              </div>
            </DetailCard>

            {/* Completion Status Section */}
            <DetailCard
              title="Completion Status"
              icon={DocumentTextIcon}
              maxWidth="full"
              headerAction={
                <Link
                  to={`/admin/task/${tid}/order-completion/step-2`}
                  className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                >
                  <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                  Edit
                </Link>
              }
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
                          ? new Date(formData.completionDate).toLocaleDateString()
                          : "-"
                      }
                    />
                    <DetailField label="Visits" value={formData.visits} />
                    {formData.reasonComment && (
                      <div className="sm:col-span-2">
                        <DetailField label="Reason Comment" value={formData.reasonComment} />
                      </div>
                    )}
                  </>
                )}

                {formData.wasCompleted === 2 && (
                  <>
                    <DetailField
                      label="Reason for cancellation"
                      value={getOptionLabel(TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION, formData.reason)}
                    />
                    {formData.reason === 1 && formData.reasonOther && (
                      <DetailField label="Reason (Other)" value={formData.reasonOther} />
                    )}
                    {formData.closingReasonComment && (
                      <div className="sm:col-span-2">
                        <DetailField label="Closing Reason Comment" value={formData.closingReasonComment} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </DetailCard>

            {/* Financial Information Section */}
            <DetailCard
              title="Financial Information"
              icon={CurrencyDollarIcon}
              maxWidth="full"
              headerAction={
                formData.hasInputtedFinancials === 1 ? (
                  <Link
                    to={`/admin/task/${tid}/order-completion/step-3`}
                    className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Edit
                  </Link>
                ) : null
              }
            >
              <div className="space-y-4">
                <DetailField
                  label="Was there financials inputted?"
                  value={formData.hasInputtedFinancials === 1 ? "Yes" : "No"}
                  status={formData.hasInputtedFinancials === 1 ? "success" : "default"}
                />

                {formData.hasInputtedFinancials === 1 && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      <DetailField
                        label="Who was paid?"
                        value={formData.invoicePaidTo === 1 ? "Associate" : "Organization"}
                      />
                      <DetailField
                        label="Payment Status"
                        value={formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID ? "Paid" : "Unpaid"}
                        status={formData.paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID ? "success" : "warning"}
                      />
                      <DetailField
                        label="Invoice Date"
                        value={formData.invoiceDate ? new Date(formData.invoiceDate).toLocaleDateString() : "-"}
                      />
                      <DetailField label="Invoice IDs" value={formData.invoiceIDs || "-"} />
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Summary</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                        <DetailField label="Total Quoted" value={`$${formData.invoiceTotalQuoteAmount || "0.00"}`} />
                        <DetailField label="Actual Total Amount" value={`$${formData.invoiceTotalAmount || "0.00"}`} />
                        <DetailField label="Service Fee Amount" value={`$${formData.invoiceServiceFeeAmount || "0.00"}`} />
                        <DetailField
                          label="Balance Owing"
                          value={`$${formData.invoiceBalanceOwingAmount || "0.00"}`}
                          status={formData.invoiceBalanceOwingAmount > 0 ? "error" : "success"}
                        />
                      </div>
                    </div>

                    {formData.paymentMethods && formData.paymentMethods.length > 0 && (
                      <div className="border-t pt-4">
                        <DetailField
                          label="Payment Methods"
                          value={
                            <div className="flex flex-wrap gap-2">
                              {formData.paymentMethods.map((method, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {getOptionLabel(ORDER_INVOICE_PAYMENT_METHODS_OPTIONS, method)}
                                </span>
                              ))}
                            </div>
                          }
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </DetailCard>

            {/* Comments Section */}
            {formData.comment && (
              <DetailCard
                title="Additional Comments"
                icon={ChatBubbleBottomCenterTextIcon}
                maxWidth="full"
                headerAction={
                  <Link
                    to={`/admin/task/${tid}/order-completion/step-4`}
                    className="inline-flex items-center text-xs sm:text-sm text-blue-600 hover:text-blue-800"
                  >
                    <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Edit
                  </Link>
                }
              >
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {formData.comment}
                </p>
              </DetailCard>
            )}
          </div>
        )
      )}
    </WizardFormStep>
  );
});

function AdminTaskItemOrderCompletionStep5Page() {
  return <Step5Content />;
}

export default AdminTaskItemOrderCompletionStep5Page;
