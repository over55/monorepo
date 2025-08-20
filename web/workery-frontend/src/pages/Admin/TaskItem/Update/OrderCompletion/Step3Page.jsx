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
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  FormGroup,
  Input,
  Select,
  TextArea,
} from "../../../../../components/UI";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../../constants/Order";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../constants/FieldOptions";

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
          setErrors(error);
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
      if (
        paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID &&
        !completionDate
      ) {
        newErrors.completionDate = "Completion date is required";
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
    return <Loading message="Loading..." />;
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Tasks", path: "/admin/tasks", icon: "📋" },
    { label: "Task Detail", icon: "ℹ️" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1>Task</h1>
      <h4>Detail</h4>
      <hr />

      {/* Progress Bar */}
      <Card style={{ marginBottom: "20px" }}>
        <p>
          <strong>Step 3 of 5</strong>
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
              width: "60%",
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
            {Object.entries(errors).map(([key, value]) => (
              <div key={key}>{value}</div>
            ))}
          </Alert>
        )}

        <FormGroup>
          <label>
            Was there financials inputted?{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="hasInputtedFinancials"
                value="1"
                checked={hasInputtedFinancials === 1}
                onChange={(e) =>
                  setHasInputtedFinancials(parseInt(e.target.value))
                }
              />{" "}
              Yes
            </label>{" "}
            <label>
              <input
                type="radio"
                name="hasInputtedFinancials"
                value="2"
                checked={hasInputtedFinancials === 2}
                onChange={(e) =>
                  setHasInputtedFinancials(parseInt(e.target.value))
                }
              />{" "}
              No
            </label>
          </div>
          {errors.hasInputtedFinancials && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {errors.hasInputtedFinancials}
            </div>
          )}
        </FormGroup>

        {hasInputtedFinancials === 1 && (
          <>
            <h3>Financials</h3>

            <FormGroup>
              <label>
                Who was paid for this job?{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="invoicePaidTo"
                    value="1"
                    checked={invoicePaidTo === 1}
                    onChange={(e) => setInvoicePaidTo(parseInt(e.target.value))}
                  />{" "}
                  Associate
                </label>{" "}
                <label>
                  <input
                    type="radio"
                    name="invoicePaidTo"
                    value="2"
                    checked={invoicePaidTo === 2}
                    onChange={(e) => setInvoicePaidTo(parseInt(e.target.value))}
                  />{" "}
                  Organization
                </label>
              </div>
              {errors.invoicePaidTo && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.invoicePaidTo}
                </div>
              )}
            </FormGroup>

            <FormGroup>
              <label>
                Payment Status <span style={{ color: "red" }}>*</span>
              </label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="paymentStatus"
                    value={ORDER_STATUS_COMPLETED_AND_PAID}
                    checked={paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID}
                    onChange={(e) => setPaymentStatus(parseInt(e.target.value))}
                  />{" "}
                  Paid
                </label>{" "}
                <label>
                  <input
                    type="radio"
                    name="paymentStatus"
                    value={ORDER_STATUS_COMPLETED_BUT_UNPAID}
                    checked={
                      paymentStatus === ORDER_STATUS_COMPLETED_BUT_UNPAID
                    }
                    onChange={(e) => setPaymentStatus(parseInt(e.target.value))}
                  />{" "}
                  Unpaid
                </label>
              </div>
              {errors.paymentStatus && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.paymentStatus}
                </div>
              )}
            </FormGroup>

            <Input
              label="Completion Date"
              type="date"
              value={formatDateForInput(completionDate)}
              onChange={(e) =>
                setCompletionDate(parseDateFromInput(e.target.value))
              }
              error={errors.completionDate}
              max={new Date().toISOString().slice(0, 10)}
            />

            <Input
              label="Invoice Date"
              type="date"
              value={formatDateForInput(invoiceDate)}
              onChange={(e) =>
                setInvoiceDate(parseDateFromInput(e.target.value))
              }
              error={errors.invoiceDate}
              required
            />

            <Input
              label="Invoice IDs"
              value={invoiceIDs}
              onChange={(e) => setInvoiceIDs(e.target.value)}
              error={errors.invoiceIDs}
              required
            />

            <h4>Quote</h4>
            <Input
              label="Quoted Labour"
              type="number"
              step="0.01"
              value={invoiceQuotedLabourAmount}
              onChange={(e) => setInvoiceQuotedLabourAmount(e.target.value)}
              error={errors.invoiceQuotedLabourAmount}
            />

            <Input
              label="Quoted Materials"
              type="number"
              step="0.01"
              value={invoiceQuotedMaterialAmount}
              onChange={(e) => setInvoiceQuotedMaterialAmount(e.target.value)}
              error={errors.invoiceQuotedMaterialAmount}
            />

            <Input
              label="Quoted Other Costs"
              type="number"
              step="0.01"
              value={invoiceQuotedOtherCostsAmount}
              onChange={(e) => setInvoiceQuotedOtherCostsAmount(e.target.value)}
              error={errors.invoiceQuotedOtherCostsAmount}
            />

            <Input
              label="Total Quoted"
              type="number"
              step="0.01"
              value={invoiceTotalQuoteAmount}
              disabled
            />

            <h4>Actual</h4>
            <Input
              label="Actual Labour"
              type="number"
              step="0.01"
              value={invoiceLabourAmount}
              onChange={(e) => setInvoiceLabourAmount(e.target.value)}
              error={errors.invoiceLabourAmount}
            />

            <Input
              label="Actual Material"
              type="number"
              step="0.01"
              value={invoiceMaterialAmount}
              onChange={(e) => setInvoiceMaterialAmount(e.target.value)}
              error={errors.invoiceMaterialAmount}
            />

            <Input
              label="Actual Other Costs"
              type="number"
              step="0.01"
              value={invoiceOtherCostsAmount}
              onChange={(e) => setInvoiceOtherCostsAmount(e.target.value)}
              error={errors.invoiceOtherCostsAmount}
            />

            <Input
              label={`Actual Tax (${taxRate}%)`}
              type="number"
              step="0.01"
              value={invoiceTaxAmount}
              onChange={(e) => setInvoiceTaxAmount(e.target.value)}
              disabled={!isCustomTaxAmount}
            />

            <FormGroup>
              <label>
                <input
                  type="checkbox"
                  checked={isCustomTaxAmount}
                  onChange={(e) => setIsCustomTaxAmount(e.target.checked)}
                />{" "}
                Custom Tax Amount?
              </label>
            </FormGroup>

            <Input
              label="Actual Total Amount"
              type="number"
              step="0.01"
              value={invoiceTotalAmount}
              disabled
            />

            <Input
              label="Actual Deposit Amount"
              type="number"
              step="0.01"
              value={invoiceDepositAmount}
              onChange={(e) => setInvoiceDepositAmount(e.target.value)}
            />

            <Input
              label="Actual Amount Due"
              type="number"
              step="0.01"
              value={invoiceAmountDue}
              disabled
            />

            <h4>Service Fee</h4>
            <Select
              label="Service Fee"
              value={invoiceServiceFeeID}
              onChange={(e) => {
                const selectedId = e.target.value;
                setInvoiceServiceFeeID(selectedId);
                // Find and set the percentage
                const selected = serviceFeeOptions.find(
                  (opt) => opt.value === selectedId || opt.id === selectedId,
                );
                if (selected) {
                  setInvoiceServiceFeePercentage(selected.percentage || 0);
                }
              }}
              error={errors.invoiceServiceFeeID}
              required
              options={[
                { value: "", label: "Please select..." },
                ...serviceFeeOptions.map((sf) => ({
                  value: sf.id || sf.value,
                  label: `${sf.title || sf.label} (${sf.percentage}%)`,
                })),
              ]}
            />

            <Input
              label="Required Service Fee Amount"
              type="number"
              step="0.01"
              value={invoiceServiceFeeAmount}
              disabled
            />

            <Input
              label={
                paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID
                  ? "Invoice Service Fee Payment Date"
                  : "Invoice Service Fee Payment Date (Optional)"
              }
              type="date"
              value={formatDateForInput(invoiceServiceFeePaymentDate)}
              onChange={(e) =>
                setInvoiceServiceFeePaymentDate(
                  parseDateFromInput(e.target.value),
                )
              }
              error={errors.invoiceServiceFeePaymentDate}
            />

            <FormGroup>
              <label>
                Payment Method(s) <span style={{ color: "red" }}>*</span>
              </label>
              {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((method) => (
                <div key={method.value}>
                  <label>
                    <input
                      type="checkbox"
                      value={method.value}
                      checked={paymentMethods.includes(method.value)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setPaymentMethods([...paymentMethods, method.value]);
                        } else {
                          setPaymentMethods(
                            paymentMethods.filter((m) => m !== method.value),
                          );
                        }
                      }}
                    />{" "}
                    {method.label}
                  </label>
                </div>
              ))}
              {errors.paymentMethods && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.paymentMethods}
                </div>
              )}
            </FormGroup>

            <Input
              label="Actual Service Fee Paid"
              type="number"
              step="0.01"
              value={invoiceActualServiceFeeAmountPaid}
              onChange={(e) =>
                setInvoiceActualServiceFeeAmountPaid(e.target.value)
              }
            />

            <Input
              label="Balance Owing Amount"
              type="number"
              step="0.01"
              value={invoiceBalanceOwingAmount}
              disabled
            />
          </>
        )}

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link to={`/admin/task/${tid}/order-completion/step-2`}>
            <Button variant="secondary">← Back to Step 2</Button>
          </Link>
          <Button onClick={handleSubmit} variant="primary">
            Save & Continue →
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep3Page;
