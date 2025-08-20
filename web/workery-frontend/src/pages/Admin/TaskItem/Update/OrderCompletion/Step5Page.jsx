// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
} from "../../../../../components/UI";
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

      // Prepare payload for API
      const payload = {
        task_id: tid,
        task_item_id: tid,
        was_completed: formData.wasCompleted,
        reason: formData.reason,
        reason_other: formData.reasonOther || "",
        reason_comment: formData.reasonComment || "",
        completion_date: formData.completionDate
          ? new Date(formData.completionDate).toISOString()
          : null,
        visits: parseInt(formData.visits || 0),
        closing_reason_comment: formData.closingReasonComment || "",
        has_inputted_financials: formData.hasInputtedFinancials,
        comment: formData.comment || "",
      };

      // Add financial fields if applicable
      if (formData.hasInputtedFinancials === 1) {
        Object.assign(payload, {
          invoice_paid_to: formData.invoicePaidTo,
          payment_status: formData.paymentStatus,
          invoice_date: formData.invoiceDate
            ? new Date(formData.invoiceDate).toISOString()
            : null,
          invoice_ids: String(formData.invoiceIDs || ""), // FIX: Convert to string
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
          invoice_service_fee_payment_date:
            formData.invoiceServiceFeePaymentDate
              ? new Date(formData.invoiceServiceFeePaymentDate).toISOString()
              : null,
          invoice_actual_service_fee_amount_paid: parseFloat(
            formData.invoiceActualServiceFeeAmountPaid || 0,
          ),
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

  if (isLoading) {
    return <Loading message="Loading task details..." />;
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Tasks", path: "/admin/tasks", icon: "📋" },
    { label: "Task Detail", icon: "ℹ️" },
  ];

  // Helper function to get label from options
  const getOptionLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1>Task</h1>
      <h4>Detail</h4>
      <hr />

      {/* Progress Bar */}
      <Card style={{ marginBottom: "20px", backgroundColor: "#d4edda" }}>
        <p>
          <strong>Step 5 of 5</strong>
        </p>
        <div
          style={{
            backgroundColor: "#e9ecef",
            borderRadius: "4px",
            height: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              backgroundColor: "#28a745",
              height: "100%",
              borderRadius: "4px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </Card>

      {/* Main Content */}
      <Card title="Task Detail - Order Completion">
        {Object.keys(errors).length > 0 && (
          <Alert type="error">
            {typeof errors === "string" ? errors : JSON.stringify(errors)}
          </Alert>
        )}

        {task && (
          <>
            {/* Task Details Table */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "30px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                  <th
                    colSpan="2"
                    style={{ padding: "10px", textAlign: "left" }}
                  >
                    Task Detail
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th
                    style={{
                      width: "30%",
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    Type
                  </th>
                  <td style={{ padding: "10px" }}>Order Completion</td>
                </tr>
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Description
                  </th>
                  <td style={{ padding: "10px" }}>{task.description}</td>
                </tr>
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Job #
                  </th>
                  <td style={{ padding: "10px" }}>
                    <Link to={`/admin/order/${task.orderWjid}`}>
                      {task.orderWjid}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Client Name
                  </th>
                  <td style={{ padding: "10px" }}>
                    <Link to={`/admin/customer/${task.customerId}`}>
                      {task.customerName}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Associate
                  </th>
                  <td style={{ padding: "10px" }}>
                    <Link to={`/admin/associate/${task.associateId}`}>
                      {task.associateName}
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Form Submission Summary Table */}
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                  <th
                    colSpan="2"
                    style={{ padding: "10px", textAlign: "left" }}
                  >
                    Form Submission
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th
                    style={{
                      width: "30%",
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                    }}
                  >
                    Was job successfully completed?
                  </th>
                  <td style={{ padding: "10px" }}>
                    {formData.wasCompleted === 1 ? "Yes" : "No"}
                  </td>
                </tr>

                {formData.wasCompleted === 1 && (
                  <>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Completion Date
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.completionDate
                          ? new Date(
                              formData.completionDate,
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Reason Comment
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.reasonComment}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Visits
                      </th>
                      <td style={{ padding: "10px" }}>{formData.visits}</td>
                    </tr>
                  </>
                )}

                {formData.wasCompleted === 2 && (
                  <>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Reason for cancellation
                      </th>
                      <td style={{ padding: "10px" }}>
                        {getOptionLabel(
                          TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION,
                          formData.reason,
                        )}
                      </td>
                    </tr>
                    {formData.reason === 1 && (
                      <tr>
                        <th
                          style={{
                            padding: "10px",
                            backgroundColor: "#f8f9fa",
                          }}
                        >
                          Reason (Other)
                        </th>
                        <td style={{ padding: "10px" }}>
                          {formData.reasonOther}
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Closing Reason Comment
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.closingReasonComment}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Was there financials inputted?
                  </th>
                  <td style={{ padding: "10px" }}>
                    {formData.hasInputtedFinancials === 1 ? "Yes" : "No"}
                  </td>
                </tr>

                {formData.hasInputtedFinancials === 1 && (
                  <>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Who was paid?
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.invoicePaidTo === 1
                          ? "Associate"
                          : "Organization"}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Payment Status
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.paymentStatus ===
                        ORDER_STATUS_COMPLETED_AND_PAID
                          ? "Paid"
                          : "Unpaid"}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Invoice Date
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.invoiceDate
                          ? new Date(formData.invoiceDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Invoice IDs
                      </th>
                      <td style={{ padding: "10px" }}>{formData.invoiceIDs}</td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Total Quoted
                      </th>
                      <td style={{ padding: "10px" }}>
                        ${formData.invoiceTotalQuoteAmount}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Actual Total Amount
                      </th>
                      <td style={{ padding: "10px" }}>
                        ${formData.invoiceTotalAmount}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Service Fee Amount
                      </th>
                      <td style={{ padding: "10px" }}>
                        ${formData.invoiceServiceFeeAmount}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Balance Owing
                      </th>
                      <td style={{ padding: "10px" }}>
                        ${formData.invoiceBalanceOwingAmount}
                      </td>
                    </tr>
                    <tr>
                      <th
                        style={{ padding: "10px", backgroundColor: "#f8f9fa" }}
                      >
                        Payment Methods
                      </th>
                      <td style={{ padding: "10px" }}>
                        {formData.paymentMethods
                          .map((method) =>
                            getOptionLabel(
                              ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
                              method,
                            ),
                          )
                          .join(", ")}
                      </td>
                    </tr>
                  </>
                )}

                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Comment
                  </th>
                  <td style={{ padding: "10px" }}>{formData.comment}</td>
                </tr>
              </tbody>
            </table>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Link
                to={
                  formData.hasInputtedFinancials === 1
                    ? `/admin/task/${tid}/order-completion/step-4`
                    : `/admin/task/${tid}/order-completion/step-3`
                }
              >
                <Button variant="secondary">
                  ← Back to Step{" "}
                  {formData.hasInputtedFinancials === 1 ? "4" : "3"}
                </Button>
              </Link>
              <Button
                onClick={handleSubmit}
                variant="success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "✓ Save & Submit"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep5Page;
