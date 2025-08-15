// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step2Page.jsx

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

function AdminFinancialGenerateInvoiceStep2Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);

  // Form state - Line items
  const [lineItems, setLineItems] = useState(
    Array(15).fill({
      quantity: 0,
      description: "",
      unitPrice: 0,
      amount: 0,
    }),
  );

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing line items
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
            // No data from step 1, redirect back
            navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
            return;
          }

          // Initialize line items from existing data or order
          const initialLineItems = [];
          for (let i = 1; i <= 15; i++) {
            const lineNum = String(i).padStart(2, "0");
            initialLineItems.push({
              quantity:
                existingData[`line${lineNum}Quantity`] ||
                orderData[`line${lineNum}Quantity`] ||
                0,
              description:
                existingData[`line${lineNum}Description`] ||
                orderData[`line${lineNum}Description`] ||
                "",
              unitPrice:
                existingData[`line${lineNum}UnitPrice`] ||
                orderData[`line${lineNum}UnitPrice`] ||
                0,
              amount:
                existingData[`line${lineNum}Amount`] ||
                orderData[`line${lineNum}Amount`] ||
                0,
            });
          }
          setLineItems(initialLineItems);
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

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };

    // Auto-calculate amount if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity =
        field === "quantity"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].quantity) || 0;
      const unitPrice =
        field === "unitPrice"
          ? parseFloat(value) || 0
          : parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].amount = quantity * unitPrice;
    }

    setLineItems(updatedItems);
  };

  const handleNext = () => {
    // Validate at least line 01 has data
    const line01 = lineItems[0];
    const newErrors = {};

    if (!line01.quantity || line01.quantity === 0) {
      newErrors.line01Quantity = "Line 01 quantity is required";
    }
    if (!line01.description) {
      newErrors.line01Description = "Line 01 description is required";
    }
    if (!line01.unitPrice || line01.unitPrice === 0) {
      newErrors.line01UnitPrice = "Line 01 unit price is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Get existing data and update with line items
    const existingData = invoiceStorage.getInvoiceGenerationData() || {};

    // Add line items to storage
    lineItems.forEach((item, index) => {
      const lineNum = String(index + 1).padStart(2, "0");
      existingData[`line${lineNum}Quantity`] = item.quantity;
      existingData[`line${lineNum}Description`] = item.description;
      existingData[`line${lineNum}UnitPrice`] = item.unitPrice;
      existingData[`line${lineNum}Amount`] = item.amount;
    });

    invoiceStorage.saveInvoiceGenerationData(existingData);

    // Navigate to step 3
    navigate(`/admin/financial/${oid}/invoice/generate/step-3`);
  };

  const handleBack = () => {
    navigate(`/admin/financial/${oid}/invoice/generate/step-1`);
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

  // Only show additional lines if previous line has data
  const shouldShowLine = (index) => {
    if (index === 0) return true;
    const prevItem = lineItems[index - 1];
    return prevItem.quantity > 0 && prevItem.description;
  };

  return (
    <Layout>
      <Breadcrumb items={breadcrumbItems} />

      <h1>Financials</h1>
      <h4>Generate Invoice - Step 2 of 4</h4>

      {/* Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <progress value="50" max="100" style={{ width: "100%" }}>
          50%
        </progress>
      </div>

      <Card title="Invoice Line Items">
        {errors.general && <Alert type="error">{errors.general}</Alert>}

        <p>
          Please fill out all the required fields before submitting this form.
        </p>

        {order && (
          <form>
            {lineItems.map((item, index) => {
              if (!shouldShowLine(index)) return null;

              const lineNum = String(index + 1).padStart(2, "0");
              const errorPrefix = `line${lineNum}`;

              return (
                <div
                  key={index}
                  style={{
                    marginBottom: "30px",
                    paddingBottom: "20px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  <h3>Line {lineNum}</h3>

                  <div style={{ marginBottom: "15px" }}>
                    <label>
                      Quantity {index === 0 ? "*" : ""}
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "quantity",
                            e.target.value,
                          )
                        }
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "5px",
                        }}
                      />
                    </label>
                    {errors[`${errorPrefix}Quantity`] && (
                      <small style={{ color: "red" }}>
                        {errors[`${errorPrefix}Quantity`]}
                      </small>
                    )}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>
                      Description {index === 0 ? "*" : ""}
                      <textarea
                        value={item.description}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        maxLength="638"
                        rows="4"
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "5px",
                        }}
                      />
                    </label>
                    <small>Max 638 characters</small>
                    {errors[`${errorPrefix}Description`] && (
                      <small style={{ color: "red", display: "block" }}>
                        {errors[`${errorPrefix}Description`]}
                      </small>
                    )}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>
                      Unit Price {index === 0 ? "*" : ""}
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleLineItemChange(
                            index,
                            "unitPrice",
                            e.target.value,
                          )
                        }
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "5px",
                        }}
                      />
                    </label>
                    {errors[`${errorPrefix}UnitPrice`] && (
                      <small style={{ color: "red" }}>
                        {errors[`${errorPrefix}UnitPrice`]}
                      </small>
                    )}
                  </div>

                  <div style={{ marginBottom: "15px" }}>
                    <label>
                      Total Amount
                      <input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        disabled
                        style={{
                          display: "block",
                          width: "100%",
                          padding: "5px",
                          backgroundColor: "#f5f5f5",
                        }}
                      />
                    </label>
                    <small>
                      This field is auto-calculated from Quantity × Unit Price
                    </small>
                  </div>
                </div>
              );
            })}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button onClick={handleBack} variant="secondary">
                ← Back to Step 1
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

export default AdminFinancialGenerateInvoiceStep2Page;
