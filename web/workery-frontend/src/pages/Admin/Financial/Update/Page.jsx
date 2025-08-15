// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useOrderManager,
  useTenantManager,
  useServiceFeeManager,
  useFinancialManager,
  useAccountManager,
} from "../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
  Input,
  Select,
  FormGroup,
  TextArea,
} from "../../../../components/UI";
import { DateTime } from "luxon";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../constants/FieldOptions";
import {
  ORDER_STATUS_ARCHIVED,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../constants/Order";

function AdminFinancialUpdatePage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();
  const tenantManager = useTenantManager();
  const serviceFeeManager = useServiceFeeManager();
  const financialManager = useFinancialManager();
  const accountManager = useAccountManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [taxRate, setTaxRate] = useState(0.0);
  const [successMessage, setSuccessMessage] = useState("");
  const [onPageLoaded, setOnPageLoaded] = useState(false);

  // Form states
  const [invoicePaidTo, setInvoicePaidTo] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState(
    ORDER_STATUS_COMPLETED_BUT_UNPAID,
  );
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

  // Constants
  const INVOICE_PAID_TO_ASSOCIATE = 1;
  const INVOICE_PAID_TO_ORGANIZATION = 2;
  const EMPTY_OBJECT_ID = "000000000000000000000000";

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

  // Initial data fetch
  useEffect(() => {
    let mounted = true;

    const initializePage = async () => {
      if (!oid) {
        setErrors({ general: "Order ID is required" });
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
      }

      // Fetch order details if not already loaded
      if (!order || Object.keys(order).length === 0) {
        setFetching(true);
        setErrors({});

        try {
          const orderData = await orderManager.getOrderDetail(
            oid,
            onUnauthorized,
          );

          if (mounted) {
            setOrder(orderData);

            // Set form fields from order data
            setInvoicePaidTo(
              orderData.invoicePaidTo || INVOICE_PAID_TO_ASSOCIATE,
            );
            setPaymentStatus(
              orderData.status || ORDER_STATUS_COMPLETED_BUT_UNPAID,
            );
            setCompletionDate(orderData.completionDate);
            setInvoiceDate(orderData.invoiceDate);
            setInvoiceIds(orderData.invoiceIds || "");

            // Quote fields
            setInvoiceQuotedLabourAmount(
              orderData.invoiceQuotedLabourAmount || 0,
            );
            setInvoiceQuotedMaterialAmount(
              orderData.invoiceQuotedMaterialAmount || 0,
            );
            setInvoiceQuotedOtherCostsAmount(
              orderData.invoiceQuotedOtherCostsAmount || 0,
            );
            setInvoiceTotalQuoteAmount(orderData.invoiceTotalQuoteAmount || 0);

            // Actual fields
            setInvoiceLabourAmount(orderData.invoiceLabourAmount || 0);
            setInvoiceMaterialAmount(orderData.invoiceMaterialAmount || 0);
            setInvoiceOtherCostsAmount(orderData.invoiceOtherCostsAmount || 0);
            setAssociateTaxId(orderData.associateTaxId || "");
            setInvoiceTaxAmount(orderData.invoiceTaxAmount || 0);
            setInvoiceIsCustomTaxAmount(
              orderData.invoiceIsCustomTaxAmount || false,
            );
            setInvoiceTotalAmount(orderData.invoiceTotalAmount || 0);
            setInvoiceDepositAmount(orderData.invoiceDepositAmount || 0);
            setInvoiceAmountDue(orderData.invoiceAmountDue || 0);

            // Service fee fields
            setInvoiceServiceFeeId(orderData.invoiceServiceFeeId || "");
            setInvoiceServiceFeePercentage(
              orderData.invoiceServiceFeePercentage || 0,
            );
            setIsInvoiceServiceFeeOther(
              orderData.isInvoiceServiceFeeOther || false,
            );
            setInvoiceServiceFeeOther(orderData.invoiceServiceFeeOther || "");
            setInvoiceServiceFeeAmount(orderData.invoiceServiceFeeAmount || 0);
            setInvoiceServiceFeePaymentDate(
              orderData.invoiceServiceFeePaymentDate,
            );
            setPaymentMethods(orderData.paymentMethods || []);
            setInvoiceActualServiceFeeAmountPaid(
              orderData.invoiceActualServiceFeeAmountPaid || 0,
            );
            setInvoiceBalanceOwingAmount(
              orderData.invoiceBalanceOwingAmount || 0,
            );

            // Fetch service fee details if ID exists
            if (orderData.invoiceServiceFeeId) {
              await fetchServiceFeeDetails(orderData.invoiceServiceFeeId);
            }
          }
        } catch (error) {
          console.error("Failed to fetch order details:", error);
          if (mounted) {
            if (typeof error === "object" && error !== null) {
              setErrors(error);
            } else {
              setErrors({
                general: "Failed to load order details. Please try again.",
              });
            }
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
  }, [oid, onPageLoaded]);

  // Recalculate when relevant fields change
  useEffect(() => {
    if (order) {
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
    setSuccessMessage("");

    const updateData = {
      wjid: order.wjid,
      invoicePaidTo: parseInt(invoicePaidTo),
      paymentStatus: parseInt(paymentStatus),
      completionDate: completionDate,
      invoiceDate: invoiceDate,
      invoiceIds: invoiceIds.toString(),
      invoiceQuotedLabourAmount: parseFloat(invoiceQuotedLabourAmount),
      invoiceQuotedMaterialAmount: parseFloat(invoiceQuotedMaterialAmount),
      invoiceQuotedOtherCostsAmount: parseFloat(invoiceQuotedOtherCostsAmount),
      invoiceTotalQuoteAmount: parseFloat(invoiceTotalQuoteAmount),
      invoiceLabourAmount: parseFloat(invoiceLabourAmount),
      invoiceMaterialAmount: parseFloat(invoiceMaterialAmount),
      invoiceOtherCostsAmount: parseFloat(invoiceOtherCostsAmount),
      invoiceTaxAmount: parseFloat(invoiceTaxAmount),
      invoiceIsCustomTaxAmount: invoiceIsCustomTaxAmount === true,
      invoiceTotalAmount: parseFloat(invoiceTotalAmount),
      invoiceDepositAmount: parseFloat(invoiceDepositAmount),
      invoiceAmountDue: parseFloat(invoiceAmountDue),
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
    };

    try {
      setFetching(true);

      // Use the FinancialManager to update financial data
      // If FinancialManager doesn't have an update method, fall back to OrderManager
      if (financialManager && financialManager.updateFinancial) {
        await financialManager.updateFinancial(oid, updateData, onUnauthorized);
      } else {
        // Fall back to order manager update
        await orderManager.updateOrder(oid, updateData, onUnauthorized);
      }

      setSuccessMessage("Order financials updated");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/financial/${oid}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update financial information:", error);
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to update financial information. Please try again.",
        });
      }
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
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

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
  };

  // Loading state
  if (isFetching && !order) {
    return (
      <div>
        <Breadcrumb
          items={[
            { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
            { path: "/admin/financials", label: "Financials", icon: "💳" },
            {
              path: `/admin/financial/${oid}`,
              label: `Order #${oid}`,
              icon: "📄",
            },
            { label: "Update", icon: "✏️" },
          ]}
        />
        <Loading message="Loading financial details..." />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/financials", label: "Financials", icon: "💳" },
          {
            path: `/admin/financial/${oid}`,
            label: `Order #${oid}`,
            icon: "📄",
          },
          { label: "Update", icon: "✏️" },
        ]}
      />

      {/* Page banner for archived orders */}
      {isOrderArchived() && <Alert type="info">This order is archived.</Alert>}

      {/* Success message */}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Error display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          <h4>Error</h4>
          {errors.general && <p>{errors.general}</p>}
          {Object.keys(errors).map((key) => {
            if (key !== "general") {
              return <p key={key}>{`${key}: ${errors[key]}`}</p>;
            }
            return null;
          })}
        </Alert>
      )}

      {/* Page Title */}
      <h1>💳 Financials</h1>
      <h4>✏️ Update</h4>
      <hr />

      {/* Main Form */}
      {order && (
        <Card title="Update Financial Information">
          <form onSubmit={handleSubmit}>
            {/* General Section */}
            <h3>📊 General</h3>
            <hr />

            <FormGroup>
              <label>Who was paid for this job? *</label>
              <div>
                <label>
                  <input
                    type="radio"
                    value={INVOICE_PAID_TO_ASSOCIATE}
                    checked={invoicePaidTo === INVOICE_PAID_TO_ASSOCIATE}
                    onChange={(e) => setInvoicePaidTo(parseInt(e.target.value))}
                  />
                  Associate
                </label>
                <label style={{ marginLeft: "20px" }}>
                  <input
                    type="radio"
                    value={INVOICE_PAID_TO_ORGANIZATION}
                    checked={invoicePaidTo === INVOICE_PAID_TO_ORGANIZATION}
                    onChange={(e) => setInvoicePaidTo(parseInt(e.target.value))}
                  />
                  Organization
                </label>
              </div>
            </FormGroup>

            <FormGroup>
              <label>What is the service fee payment status? *</label>
              <div>
                <label>
                  <input
                    type="radio"
                    value={ORDER_STATUS_COMPLETED_AND_PAID}
                    checked={paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID}
                    onChange={(e) => setPaymentStatus(parseInt(e.target.value))}
                  />
                  Paid
                </label>
                <label style={{ marginLeft: "20px" }}>
                  <input
                    type="radio"
                    value={ORDER_STATUS_COMPLETED_BUT_UNPAID}
                    checked={
                      paymentStatus === ORDER_STATUS_COMPLETED_BUT_UNPAID
                    }
                    onChange={(e) => setPaymentStatus(parseInt(e.target.value))}
                  />
                  Unpaid
                </label>
              </div>
            </FormGroup>

            {paymentStatus === ORDER_STATUS_COMPLETED_AND_PAID && (
              <Input
                label="Completion Date"
                type="date"
                value={formatDateForInput(completionDate)}
                onChange={(e) => setCompletionDate(e.target.value)}
                error={errors.completionDate}
              />
            )}

            <Input
              label="Invoice Date"
              type="date"
              value={formatDateForInput(invoiceDate)}
              onChange={(e) => setInvoiceDate(e.target.value)}
              error={errors.invoiceDate}
            />

            <Input
              label="Invoice IDs"
              type="text"
              value={invoiceIds}
              onChange={(e) => setInvoiceIds(e.target.value)}
              error={errors.invoiceIds}
              placeholder="Please note, the system automatically generates an ID"
              required
            />

            {/* Quote Section */}
            <h3>📋 Quote</h3>
            <hr />

            <Input
              label="Quoted Labour"
              type="number"
              step="0.01"
              value={invoiceQuotedLabourAmount}
              onChange={(e) => setInvoiceQuotedLabourAmount(e.target.value)}
              error={errors.invoiceQuotedLabourAmount}
              placeholder="If no quoted labour costs, enter 0"
              required
            />

            <Input
              label="Quoted Materials"
              type="number"
              step="0.01"
              value={invoiceQuotedMaterialAmount}
              onChange={(e) => setInvoiceQuotedMaterialAmount(e.target.value)}
              error={errors.invoiceQuotedMaterialAmount}
              placeholder="If no quoted material costs, enter 0"
              required
            />

            <Input
              label="Quoted Other Costs"
              type="number"
              step="0.01"
              value={invoiceQuotedOtherCostsAmount}
              onChange={(e) => setInvoiceQuotedOtherCostsAmount(e.target.value)}
              error={errors.invoiceQuotedOtherCostsAmount}
              placeholder="If no quoted other costs, enter 0"
              required
            />

            <Input
              label="Total Quoted (Calculated)"
              type="number"
              step="0.01"
              value={invoiceTotalQuoteAmount}
              disabled
              required
            />

            {/* Actual Section */}
            <h3>✅ Actual</h3>
            <hr />

            <Input
              label="Actual Labour"
              type="number"
              step="0.01"
              value={invoiceLabourAmount}
              onChange={(e) => setInvoiceLabourAmount(e.target.value)}
              error={errors.invoiceLabourAmount}
              placeholder="If no actual labour costs, enter 0"
              required
            />

            <Input
              label="Actual Material"
              type="number"
              step="0.01"
              value={invoiceMaterialAmount}
              onChange={(e) => setInvoiceMaterialAmount(e.target.value)}
              error={errors.invoiceMaterialAmount}
              placeholder="If no material costs were incurred, enter 0"
              required
            />

            <Input
              label="Actual Other Costs"
              type="number"
              step="0.01"
              value={invoiceOtherCostsAmount}
              onChange={(e) => setInvoiceOtherCostsAmount(e.target.value)}
              error={errors.invoiceOtherCostsAmount}
              placeholder="If no other costs were incurred, enter 0"
              required
            />

            <Input
              label={`Actual Tax (Tax rate: ${taxRate}%${associateTaxId ? ", HST#: " + associateTaxId : ""})`}
              type="number"
              step="0.01"
              value={invoiceTaxAmount}
              onChange={(e) => setInvoiceTaxAmount(e.target.value)}
              error={errors.invoiceTaxAmount}
              disabled={!invoiceIsCustomTaxAmount}
              placeholder={`Tax is automatically calculated at ${taxRate}%`}
              required
            />

            <FormGroup>
              <label>
                <input
                  type="checkbox"
                  checked={invoiceIsCustomTaxAmount}
                  onChange={(e) =>
                    setInvoiceIsCustomTaxAmount(e.target.checked)
                  }
                />
                Custom Actual Tax? (Override automatic calculation with custom
                value)
              </label>
            </FormGroup>

            <Input
              label="Actual Total Amount (Calculated)"
              type="number"
              step="0.01"
              value={invoiceTotalAmount}
              disabled
              required
            />

            <Input
              label="Actual Deposit Amount"
              type="number"
              step="0.01"
              value={invoiceDepositAmount}
              onChange={(e) => setInvoiceDepositAmount(e.target.value)}
              error={errors.invoiceDepositAmount}
              placeholder="If no deposit, enter 0"
              required
            />

            <Input
              label="Actual Amount Due (Calculated)"
              type="number"
              step="0.01"
              value={invoiceAmountDue}
              disabled
              placeholder="Total amount minus deposit"
              required
            />

            <FormGroup>
              <label>Payment Method(s) *</label>
              <div>
                {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    style={{ display: "block", marginBottom: "5px" }}
                  >
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
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.paymentMethods && (
                <div style={{ color: "red" }}>{errors.paymentMethods}</div>
              )}
            </FormGroup>

            {/* Service Fee Section */}
            <h3>💰 Service Fee</h3>
            <hr />

            <Input
              label="Service Fee ID"
              type="text"
              value={invoiceServiceFeeId}
              onChange={(e) => {
                setInvoiceServiceFeeId(e.target.value);
                if (e.target.value) {
                  fetchServiceFeeDetails(e.target.value);
                }
              }}
              error={errors.invoiceServiceFeeId}
              placeholder="Select service fee"
            />

            {isInvoiceServiceFeeOther && (
              <Input
                label="Service Fee Other"
                type="text"
                value={invoiceServiceFeeOther}
                onChange={(e) => setInvoiceServiceFeeOther(e.target.value)}
                error={errors.invoiceServiceFeeOther}
                placeholder="Enter custom service fee description"
              />
            )}

            <Input
              label="Service Fee Percentage"
              type="number"
              step="0.01"
              value={invoiceServiceFeePercentage}
              onChange={(e) => setInvoiceServiceFeePercentage(e.target.value)}
              error={errors.invoiceServiceFeePercentage}
              placeholder="Percentage of labour amount"
            />

            <Input
              label="Required Service Fee Amount (Calculated)"
              type="number"
              step="0.01"
              value={invoiceServiceFeeAmount}
              disabled
              placeholder="Service fee owed by associate"
              required
            />

            <Input
              label="Invoice Service Fee Payment Date"
              type="date"
              value={formatDateForInput(invoiceServiceFeePaymentDate)}
              onChange={(e) => setInvoiceServiceFeePaymentDate(e.target.value)}
              error={errors.invoiceServiceFeePaymentDate}
            />

            <Input
              label="Actual Service Fee Paid"
              type="number"
              step="0.01"
              value={invoiceActualServiceFeeAmountPaid}
              onChange={(e) =>
                setInvoiceActualServiceFeeAmountPaid(e.target.value)
              }
              error={errors.invoiceActualServiceFeeAmountPaid}
              placeholder="Amount paid by associate and received by organization"
              required
            />

            <Input
              label="Balance Owing Amount (Calculated)"
              type="number"
              step="0.01"
              value={invoiceBalanceOwingAmount}
              disabled
              placeholder="Remaining balance to be paid by associate"
              required
            />

            {/* Action Buttons */}
            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Link to={`/admin/financial/${oid}`}>
                <Button variant="secondary">← Back to Detail</Button>
              </Link>
              <Button
                type="submit"
                variant="success"
                disabled={isOrderArchived() || isFetching}
              >
                {isFetching ? "Saving..." : "✓ Save & Submit"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default AdminFinancialUpdatePage;
