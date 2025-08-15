// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import { InvoiceGenerationStorage } from "../../../../../../services/Storage/InvoiceGenerationStorage";
import Layout from "../../../../../../components/Layout/Layout";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
} from "../../../../../../components/UI";
import {
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS,
  ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS,
} from "../../../../../../constants/FieldOptions";

function AdminFinancialGenerateInvoiceStep3Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);

  // Form state
  const [invoiceLabourAmount, setInvoiceLabourAmount] = useState(0);
  const [invoiceMaterialAmount, setInvoiceMaterialAmount] = useState(0);
  const [invoiceOtherCostsAmount, setInvoiceOtherCostsAmount] = useState(0);
  const [invoiceTaxAmount, setInvoiceTaxAmount] = useState(0);
  const [invoiceTotalAmount, setInvoiceTotalAmount] = useState(0);
  const [invoiceDepositAmount, setInvoiceDepositAmount] = useState(0);
  const [invoiceAmountDue, setInvoiceAmountDue] = useState(0);
  const [invoiceQuoteDays, setInvoiceQuoteDays] = useState(30);
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [invoiceQuoteDate, setInvoiceQuoteDate] = useState("");
  const [invoiceCustomersApproval, setInvoiceCustomersApproval] =
    useState("Signature");
  const [line01Notes, setLine01Notes] = useState("");
  const [line02Notes, setLine02Notes] = useState("");
  const [dateClientPaidInvoice, setDateClientPaidInvoice] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [clientSignature, setClientSignature] = useState("");
  const [associateSignDate, setAssociateSignDate] = useState("");
  const [associateSignature, setAssociateSignature] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);

          // Load existing wizard data
          const existingData = invoiceStorage.getInvoiceGenerationData();

          if (!existingData || existingData.invoiceId !== oid) {
            // No data from previous steps, redirect back
            navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
            return;
          }

          // Initialize form with existing data or order data
          setInvoiceLabourAmount(
            existingData.invoiceLabourAmount ||
              orderData.invoiceLabourAmount ||
              0,
          );
          setInvoiceMaterialAmount(
            existingData.invoiceMaterialAmount ||
              orderData.invoiceMaterialAmount ||
              0,
          );
          setInvoiceOtherCostsAmount(
            existingData.invoiceOtherCostsAmount ||
              orderData.invoiceOtherCostsAmount ||
              0,
          );
          setInvoiceTaxAmount(
            existingData.invoiceTaxAmount || orderData.invoiceTaxAmount || 0,
          );
          setInvoiceTotalAmount(
            existingData.invoiceTotalAmount ||
              orderData.invoiceTotalAmount ||
              0,
          );
          setInvoiceDepositAmount(
            existingData.invoiceDepositAmount ||
              orderData.invoiceDepositAmount ||
              0,
          );
          setInvoiceAmountDue(
            existingData.invoiceAmountDue || orderData.invoiceAmountDue || 0,
          );
          setInvoiceQuoteDays(existingData.invoiceQuoteDays || 30);
          setAssociateTaxId(
            existingData.associateTaxId || orderData.associateTaxId || "",
          );
          setInvoiceQuoteDate(
            existingData.invoiceQuoteDate || orderData.completionDate || "",
          );
          setInvoiceCustomersApproval(
            existingData.invoiceCustomersApproval || "Signature",
          );
          setLine01Notes(
            existingData.line01Notes || orderData.line01Notes || "",
          );
          setLine02Notes(
            existingData.line02Notes || orderData.line02Notes || "",
          );
          setDateClientPaidInvoice(
            existingData.dateClientPaidInvoice ||
              orderData.completionDate ||
              "",
          );
          setPaymentMethods(
            existingData.paymentMethods || orderData.paymentMethods || [],
          );
          setClientSignature(
            existingData.clientSignature || orderData.customerName || "",
          );
          setAssociateSignDate(
            existingData.associateSignDate || orderData.completionDate || "",
          );
          setAssociateSignature(
            existingData.associateSignature || orderData.associateName || "",
          );
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch order:", error);
          setErrors({ general: "Failed to load order details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [oid]);

  const handlePaymentMethodToggle = (methodValue) => {
    setPaymentMethods((prev) => {
      if (prev.includes(methodValue)) {
        return prev.filter((m) => m !== methodValue);
      }
      return [...prev, methodValue];
    });
  };

  const handleNext = () => {
    // Validate required fields
    const newErrors = {};

    if (!invoiceQuoteDays) {
      newErrors.invoiceQuoteDays = "Quote validity days is required";
    }
    if (!invoiceQuoteDate) {
      newErrors.invoiceQuoteDate = "Quote approval date is required";
    }
    if (!invoiceCustomersApproval) {
      newErrors.invoiceCustomersApproval = "Customer approval type is required";
    }
    if (!dateClientPaidInvoice) {
      newErrors.dateClientPaidInvoice = "Client payment date is required";
    }
    if (!clientSignature) {
      newErrors.clientSignature = "Client signature is required";
    }
    if (!associateSignDate) {
      newErrors.associateSignDate = "Associate signature date is required";
    }
    if (!associateSignature) {
      newErrors.associateSignature = "Associate signature is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Get existing data and update with step 3 data
    const existingData = invoiceStorage.getInvoiceGenerationData() || {};

    // Add step 3 data
    const updatedData = {
      ...existingData,
      invoiceLabourAmount,
      invoiceMaterialAmount,
      invoiceOtherCostsAmount,
      invoiceTaxAmount,
      invoiceTotalAmount,
      invoiceDepositAmount,
      invoiceAmountDue,
      invoiceQuoteDays,
      associateTaxId,
      invoiceQuoteDate,
      invoiceCustomersApproval,
      line01Notes,
      line02Notes,
      dateClientPaidInvoice,
      paymentMethods,
      clientSignature,
      associateSignDate,
      associateSignature,
    };

    invoiceStorage.saveInvoiceGenerationData(updatedData);

    // Navigate to step 4
    navigate(`/admin/financial/${oid}/invoice/generate/step-4`);
  };

  const handleBack = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-2`);
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Financials", path: "/admin/financials", icon: "💳" },
    {
      label: `Order #${oid} (Invoice)`,
      path: `/admin/financial/${oid}/invoice`,
      icon: "📄",
    },
    { label: "Generate Invoice", icon: "➕" },
  ];

  if (isFetching) {
    return (
      <Layout>
        <Loading message="Loading order details..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <Breadcrumb items={breadcrumbItems} />

      <h1>Financials</h1>
      <h4>Generate Invoice - Step 3 of 4</h4>

      {/* Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <progress value="75" max="100" style={{ width: "100%" }}>
          75%
        </progress>
      </div>

      <Card title="Financial Details & Signatures">
        {errors.general && <Alert type="error">{errors.general}</Alert>}

        {order && (
          <form>
            <h3>Financial Summary</h3>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Labour Amount
                <input
                  type="number"
                  step="0.01"
                  value={invoiceLabourAmount}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Material Amount
                <input
                  type="number"
                  step="0.01"
                  value={invoiceMaterialAmount}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Other Costs
                <input
                  type="number"
                  step="0.01"
                  value={invoiceOtherCostsAmount}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Tax {order.invoiceIsCustomTaxAmount && "(Custom value was set)"}
                <input
                  type="number"
                  step="0.01"
                  value={invoiceTaxAmount}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Total
                <input
                  type="number"
                  step="0.01"
                  value={invoiceTotalAmount}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Deposit
                <input
                  type="number"
                  step="0.01"
                  value={invoiceDepositAmount}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Amount Due
                <input
                  type="number"
                  step="0.01"
                  value={invoiceAmountDue}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <hr style={{ margin: "30px 0" }} />
            <h3>Quote & Payment Details</h3>

            <div style={{ marginBottom: "15px" }}>
              <label>
                This quote is valid for (days) *
                <select
                  value={invoiceQuoteDays}
                  onChange={(e) => setInvoiceQuoteDays(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                >
                  {ORDER_INVOICE_QUOTE_VALIDITY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              {errors.invoiceQuoteDays && (
                <small style={{ color: "red" }}>
                  {errors.invoiceQuoteDays}
                </small>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Associate Tax ID
                <input
                  type="text"
                  value={associateTaxId}
                  disabled
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "5px",
                    backgroundColor: "#f5f5f5",
                  }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Date of Quote Approval *
                <input
                  type="date"
                  value={invoiceQuoteDate}
                  onChange={(e) => setInvoiceQuoteDate(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              {errors.invoiceQuoteDate && (
                <small style={{ color: "red" }}>
                  {errors.invoiceQuoteDate}
                </small>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Customer Approval *</label>
              <div>
                <label>
                  <input
                    type="radio"
                    value="Signature"
                    checked={invoiceCustomersApproval === "Signature"}
                    onChange={(e) =>
                      setInvoiceCustomersApproval(e.target.value)
                    }
                  />
                  Signature
                </label>
                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="radio"
                    value="Verbal"
                    checked={invoiceCustomersApproval === "Verbal"}
                    onChange={(e) =>
                      setInvoiceCustomersApproval(e.target.value)
                    }
                  />
                  Verbal
                </label>
                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="radio"
                    value="Written"
                    checked={invoiceCustomersApproval === "Written"}
                    onChange={(e) =>
                      setInvoiceCustomersApproval(e.target.value)
                    }
                  />
                  Written
                </label>
              </div>
              {errors.invoiceCustomersApproval && (
                <small style={{ color: "red" }}>
                  {errors.invoiceCustomersApproval}
                </small>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Line 01 - Notes or Extras (Optional)
                <textarea
                  value={line01Notes}
                  onChange={(e) => setLine01Notes(e.target.value)}
                  maxLength="638"
                  rows="4"
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              <small>Max 638 characters</small>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Line 02 - Notes or Extras (Optional)
                <textarea
                  value={line02Notes}
                  onChange={(e) => setLine02Notes(e.target.value)}
                  maxLength="638"
                  rows="4"
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              <small>Max 638 characters</small>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Date client paid invoice *
                <input
                  type="date"
                  value={dateClientPaidInvoice}
                  onChange={(e) => setDateClientPaidInvoice(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              {errors.dateClientPaidInvoice && (
                <small style={{ color: "red" }}>
                  {errors.dateClientPaidInvoice}
                </small>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>Payment Method(s)</label>
              <div>
                {ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.map((method) => (
                  <label
                    key={method.value}
                    style={{ display: "block", marginBottom: "5px" }}
                  >
                    <input
                      type="checkbox"
                      value={method.value}
                      checked={paymentMethods.includes(method.value)}
                      onChange={() => handlePaymentMethodToggle(method.value)}
                    />
                    {method.label}
                  </label>
                ))}
              </div>
            </div>

            <hr style={{ margin: "30px 0" }} />
            <h3>Signatures</h3>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Client Signature upon completion *
                <input
                  type="text"
                  value={clientSignature}
                  onChange={(e) => setClientSignature(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              <small>
                If the client's partner or legal representative is signing,
                please write their full name here
              </small>
              {errors.clientSignature && (
                <small style={{ color: "red", display: "block" }}>
                  {errors.clientSignature}
                </small>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Associate Signature Date *
                <input
                  type="date"
                  value={associateSignDate}
                  onChange={(e) => setAssociateSignDate(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              {errors.associateSignDate && (
                <small style={{ color: "red" }}>
                  {errors.associateSignDate}
                </small>
              )}
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Associate Signature upon completion *
                <input
                  type="text"
                  value={associateSignature}
                  onChange={(e) => setAssociateSignature(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              <small>
                If the associate is being represented by their business partner,
                please write their full name here
              </small>
              {errors.associateSignature && (
                <small style={{ color: "red", display: "block" }}>
                  {errors.associateSignature}
                </small>
              )}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button onClick={handleBack} variant="secondary">
                ← Back to Step 2
              </Button>
              <Button onClick={handleNext} variant="primary">
                Save & Next →
              </Button>
            </div>
          </form>
        )}
      </Card>
    </Layout>
  );
}

export default AdminFinancialGenerateInvoiceStep3Page;
