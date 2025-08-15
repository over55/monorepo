// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step4Page.jsx

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
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../../../constants/FieldOptions";

function AdminFinancialGenerateInvoiceStep4Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and invoice data
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

          setInvoiceData(existingData);
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

  const handleSubmit = async () => {
    if (!invoiceData) {
      setErrors({ general: "Invoice data is missing" });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare payload in snake_case format expected by API
      const payload = {
        order_id: order.id,

        // Step 1 - Header
        invoice_id: invoiceData.invoiceId,
        invoice_date: invoiceData.invoiceDate,
        associate_name: invoiceData.associateName,
        associate_phone: invoiceData.associatePhone,
        associate_tax_id: invoiceData.associateTaxId,
        client_name: invoiceData.customerName,
        client_address: invoiceData.customerAddress,
        client_email: invoiceData.customerEmail,
        client_phone: invoiceData.customerPhone,

        // Step 2 - Line Items
        line_01_quantity: parseInt(invoiceData.line01Quantity) || 0,
        line_01_description: invoiceData.line01Description || "",
        line_01_unit_price: parseFloat(invoiceData.line01UnitPrice) || 0,
        line_01_amount: parseFloat(invoiceData.line01Amount) || 0,
        line_02_quantity: parseInt(invoiceData.line02Quantity) || 0,
        line_02_description: invoiceData.line02Description || "",
        line_02_unit_price: parseFloat(invoiceData.line02UnitPrice) || 0,
        line_02_amount: parseFloat(invoiceData.line02Amount) || 0,
        line_03_quantity: parseInt(invoiceData.line03Quantity) || 0,
        line_03_description: invoiceData.line03Description || "",
        line_03_unit_price: parseFloat(invoiceData.line03UnitPrice) || 0,
        line_03_amount: parseFloat(invoiceData.line03Amount) || 0,
        line_04_quantity: parseInt(invoiceData.line04Quantity) || 0,
        line_04_description: invoiceData.line04Description || "",
        line_04_unit_price: parseFloat(invoiceData.line04UnitPrice) || 0,
        line_04_amount: parseFloat(invoiceData.line04Amount) || 0,
        line_05_quantity: parseInt(invoiceData.line05Quantity) || 0,
        line_05_description: invoiceData.line05Description || "",
        line_05_unit_price: parseFloat(invoiceData.line05UnitPrice) || 0,
        line_05_amount: parseFloat(invoiceData.line05Amount) || 0,
        line_06_quantity: parseInt(invoiceData.line06Quantity) || 0,
        line_06_description: invoiceData.line06Description || "",
        line_06_unit_price: parseFloat(invoiceData.line06UnitPrice) || 0,
        line_06_amount: parseFloat(invoiceData.line06Amount) || 0,
        line_07_quantity: parseInt(invoiceData.line07Quantity) || 0,
        line_07_description: invoiceData.line07Description || "",
        line_07_unit_price: parseFloat(invoiceData.line07UnitPrice) || 0,
        line_07_amount: parseFloat(invoiceData.line07Amount) || 0,
        line_08_quantity: parseInt(invoiceData.line08Quantity) || 0,
        line_08_description: invoiceData.line08Description || "",
        line_08_unit_price: parseFloat(invoiceData.line08UnitPrice) || 0,
        line_08_amount: parseFloat(invoiceData.line08Amount) || 0,
        line_09_quantity: parseInt(invoiceData.line09Quantity) || 0,
        line_09_description: invoiceData.line09Description || "",
        line_09_unit_price: parseFloat(invoiceData.line09UnitPrice) || 0,
        line_09_amount: parseFloat(invoiceData.line09Amount) || 0,
        line_10_quantity: parseInt(invoiceData.line10Quantity) || 0,
        line_10_description: invoiceData.line10Description || "",
        line_10_unit_price: parseFloat(invoiceData.line10UnitPrice) || 0,
        line_10_amount: parseFloat(invoiceData.line10Amount) || 0,
        line_11_quantity: parseInt(invoiceData.line11Quantity) || 0,
        line_11_description: invoiceData.line11Description || "",
        line_11_unit_price: parseFloat(invoiceData.line11UnitPrice) || 0,
        line_11_amount: parseFloat(invoiceData.line11Amount) || 0,
        line_12_quantity: parseInt(invoiceData.line12Quantity) || 0,
        line_12_description: invoiceData.line12Description || "",
        line_12_unit_price: parseFloat(invoiceData.line12UnitPrice) || 0,
        line_12_amount: parseFloat(invoiceData.line12Amount) || 0,
        line_13_quantity: parseInt(invoiceData.line13Quantity) || 0,
        line_13_description: invoiceData.line13Description || "",
        line_13_unit_price: parseFloat(invoiceData.line13UnitPrice) || 0,
        line_13_amount: parseFloat(invoiceData.line13Amount) || 0,
        line_14_quantity: parseInt(invoiceData.line14Quantity) || 0,
        line_14_description: invoiceData.line14Description || "",
        line_14_unit_price: parseFloat(invoiceData.line14UnitPrice) || 0,
        line_14_amount: parseFloat(invoiceData.line14Amount) || 0,
        line_15_quantity: parseInt(invoiceData.line15Quantity) || 0,
        line_15_description: invoiceData.line15Description || "",
        line_15_unit_price: parseFloat(invoiceData.line15UnitPrice) || 0,
        line_15_amount: parseFloat(invoiceData.line15Amount) || 0,

        // Step 3 - Financial Details
        total_labour: parseFloat(invoiceData.invoiceLabourAmount) || 0,
        total_materials: parseFloat(invoiceData.invoiceMaterialAmount) || 0,
        other_costs: parseFloat(invoiceData.invoiceOtherCostsAmount) || 0,
        sub_total:
          parseFloat(invoiceData.invoiceLabourAmount || 0) +
          parseFloat(invoiceData.invoiceMaterialAmount || 0) +
          parseFloat(invoiceData.invoiceOtherCostsAmount || 0),
        tax: parseFloat(invoiceData.invoiceTaxAmount) || 0,
        total: parseFloat(invoiceData.invoiceTotalAmount) || 0,
        deposit: parseFloat(invoiceData.invoiceDepositAmount) || 0,
        amount_due: parseFloat(invoiceData.invoiceAmountDue) || 0,
        invoice_quote_date: invoiceData.invoiceQuoteDate,
        invoice_customers_approval: invoiceData.invoiceCustomersApproval,
        line_01_notes: invoiceData.line01Notes || "",
        line_02_notes: invoiceData.line02Notes || "",
        date_client_paid_invoice: invoiceData.dateClientPaidInvoice,
        payment_methods: invoiceData.paymentMethods || [],
        client_signature: invoiceData.clientSignature,
        associate_sign_date: invoiceData.associateSignDate,
        associate_signature: invoiceData.associateSignature,
        invoice_quote_days: parseInt(invoiceData.invoiceQuoteDays) || 30,
      };

      console.log("Submitting invoice generation payload:", payload);

      // Call the invoice operation
      await orderManager.invoiceOrder(oid, payload, onUnauthorized);

      // Clear the wizard data
      invoiceStorage.clearInvoiceGenerationData();

      // Navigate back to invoice detail page
      navigate(`/admin/financial/${oid}/invoice`);
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-3`);
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return `$${num.toFixed(2)}`;
  };

  const getPaymentMethodLabels = (methodValues) => {
    if (!methodValues || methodValues.length === 0) return "None";

    return methodValues
      .map((value) => {
        const method = ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.find(
          (m) => m.value === value,
        );
        return method ? method.label : "";
      })
      .filter((label) => label)
      .join(", ");
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
      <h4>Generate Invoice - Step 4 of 4</h4>

      {/* Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <progress
          value="100"
          max="100"
          style={{ width: "100%", backgroundColor: "#d4edda" }}
        >
          100%
        </progress>
      </div>

      <Card title="Review Invoice Details">
        {errors.general && <Alert type="error">{errors.general}</Alert>}
        {Object.keys(errors).length > 0 &&
          Object.keys(errors).some((key) => key !== "general") && (
            <Alert type="error">
              Please correct the following errors:
              <ul>
                {Object.entries(errors).map(
                  ([key, value]) =>
                    key !== "general" && <li key={key}>{value}</li>,
                )}
              </ul>
            </Alert>
          )}

        <p style={{ marginBottom: "20px" }}>
          Please carefully review the following invoice details and if you are
          ready click the <strong>Submit</strong> button to complete.
        </p>

        {order && invoiceData && (
          <div>
            {/* Step 1 Summary */}
            <div style={{ marginBottom: "30px" }}>
              <h3>
                Step 1 - Header Information
                <Link
                  to={`/admin/financial/${oid}/invoice/generate/step-1`}
                  style={{ marginLeft: "10px", fontSize: "14px" }}
                >
                  ✏️ Edit
                </Link>
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Invoice ID #:
                    </td>
                    <td>{invoiceData.invoiceId}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Invoice Date:
                    </td>
                    <td>{invoiceData.invoiceDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Associate Name:
                    </td>
                    <td>{invoiceData.associateName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Associate Phone:
                    </td>
                    <td>{invoiceData.associatePhone}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Associate Tax ID:
                    </td>
                    <td>{invoiceData.associateTaxId || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Client Name:
                    </td>
                    <td>{invoiceData.customerName}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Client Address:
                    </td>
                    <td>{invoiceData.customerAddress}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Client Phone:
                    </td>
                    <td>{invoiceData.customerPhone}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Client Email:
                    </td>
                    <td>{invoiceData.customerEmail || "-"}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Step 2 Summary - Only show line 01 for brevity */}
            <div style={{ marginBottom: "30px" }}>
              <h3>
                Step 2 - Line Items
                <Link
                  to={`/admin/financial/${oid}/invoice/generate/step-2`}
                  style={{ marginLeft: "10px", fontSize: "14px" }}
                >
                  ✏️ Edit
                </Link>
              </h3>
              {invoiceData.line01Quantity > 0 && (
                <div>
                  <h4>Line 01</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: "5px", fontWeight: "bold" }}>
                          Quantity:
                        </td>
                        <td>{invoiceData.line01Quantity}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "5px", fontWeight: "bold" }}>
                          Description:
                        </td>
                        <td>{invoiceData.line01Description}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "5px", fontWeight: "bold" }}>
                          Unit Price:
                        </td>
                        <td>{formatCurrency(invoiceData.line01UnitPrice)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: "5px", fontWeight: "bold" }}>
                          Amount:
                        </td>
                        <td>{formatCurrency(invoiceData.line01Amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
              {/* Add indication if there are more line items */}
              {invoiceData.line02Quantity > 0 && (
                <p style={{ fontStyle: "italic", marginTop: "10px" }}>
                  ...and additional line items (click Edit to review all)
                </p>
              )}
            </div>

            {/* Step 3 Summary */}
            <div style={{ marginBottom: "30px" }}>
              <h3>
                Step 3 - Financial Details & Signatures
                <Link
                  to={`/admin/financial/${oid}/invoice/generate/step-3`}
                  style={{ marginLeft: "10px", fontSize: "14px" }}
                >
                  ✏️ Edit
                </Link>
              </h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Labour Amount:
                    </td>
                    <td>{formatCurrency(invoiceData.invoiceLabourAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Material Amount:
                    </td>
                    <td>{formatCurrency(invoiceData.invoiceMaterialAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Other Costs:
                    </td>
                    <td>
                      {formatCurrency(invoiceData.invoiceOtherCostsAmount)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Sub-Total:
                    </td>
                    <td>
                      {formatCurrency(
                        (parseFloat(invoiceData.invoiceLabourAmount) || 0) +
                          (parseFloat(invoiceData.invoiceMaterialAmount) || 0) +
                          (parseFloat(invoiceData.invoiceOtherCostsAmount) ||
                            0),
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>Tax:</td>
                    <td>{formatCurrency(invoiceData.invoiceTaxAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Total:
                    </td>
                    <td>{formatCurrency(invoiceData.invoiceTotalAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Deposit:
                    </td>
                    <td>{formatCurrency(invoiceData.invoiceDepositAmount)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Amount Due:
                    </td>
                    <td>{formatCurrency(invoiceData.invoiceAmountDue)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Quote Valid For:
                    </td>
                    <td>{invoiceData.invoiceQuoteDays} days</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Date of Quote Approval:
                    </td>
                    <td>{invoiceData.invoiceQuoteDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Customer Approval:
                    </td>
                    <td>{invoiceData.invoiceCustomersApproval}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Line 01 Notes:
                    </td>
                    <td>{invoiceData.line01Notes || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Line 02 Notes:
                    </td>
                    <td>{invoiceData.line02Notes || "-"}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Date Client Paid:
                    </td>
                    <td>{invoiceData.dateClientPaidInvoice}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Payment Methods:
                    </td>
                    <td>
                      {getPaymentMethodLabels(invoiceData.paymentMethods)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Client Signature:
                    </td>
                    <td>{invoiceData.clientSignature}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Associate Sign Date:
                    </td>
                    <td>{invoiceData.associateSignDate}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "5px", fontWeight: "bold" }}>
                      Associate Signature:
                    </td>
                    <td>{invoiceData.associateSignature}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
              }}
            >
              <Button
                onClick={handleBack}
                variant="secondary"
                disabled={isSubmitting}
              >
                ← Back to Step 3
              </Button>
              <Button
                onClick={handleSubmit}
                variant="success"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "✓ Submit"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Layout>
  );
}

export default AdminFinancialGenerateInvoiceStep4Page;
