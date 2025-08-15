// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Invoice/Generate/Step1Page.jsx

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

function AdminFinancialGenerateInvoiceStep1Page() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const orderManager = useOrderManager();
  const invoiceStorage = new InvoiceGenerationStorage();

  // Page state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);

  // Form state
  const [invoiceId, setInvoiceId] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [associateName, setAssociateName] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateTaxId, setAssociateTaxId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load order details and existing invoice data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        // Get order details
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);

          // Check for existing invoice generation data
          const existingData = invoiceStorage.getInvoiceGenerationData();

          // Initialize form with order data or existing wizard data
          if (existingData && existingData.invoiceId === oid) {
            // Use existing wizard data
            setInvoiceId(existingData.invoiceId || oid);
            setInvoiceDate(
              existingData.invoiceDate || orderData.invoiceDate || "",
            );
            setAssociateName(
              existingData.associateName || orderData.associateName || "",
            );
            setAssociatePhone(
              existingData.associatePhone || orderData.associatePhone || "",
            );
            setAssociateTaxId(
              existingData.associateTaxId || orderData.associateTaxId || "",
            );
            setCustomerName(
              existingData.customerName || orderData.customerName || "",
            );
            setCustomerAddress(
              existingData.customerAddress ||
                orderData.customerFullAddressWithoutPostalCode ||
                "",
            );
            setCustomerPhone(
              existingData.customerPhone || orderData.customerPhone || "",
            );
            setCustomerEmail(
              existingData.customerEmail || orderData.customerEmail || "",
            );
          } else {
            // Initialize with order data
            setInvoiceId(oid);
            setInvoiceDate(orderData.invoiceDate || "");
            setAssociateName(orderData.associateName || "");
            setAssociatePhone(orderData.associatePhone || "");
            setAssociateTaxId(orderData.associateTaxId || "");
            setCustomerName(orderData.customerName || "");
            setCustomerAddress(
              orderData.customerFullAddressWithoutPostalCode || "",
            );
            setCustomerPhone(orderData.customerPhone || "");
            setCustomerEmail(orderData.customerEmail || "");
          }
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch order:", error);
          setErrors(error);
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

  const handleNext = () => {
    // Save data to storage
    const invoiceData = {
      invoiceId,
      invoiceDate,
      associateName,
      associatePhone,
      associateTaxId,
      customerName,
      customerAddress,
      customerPhone,
      customerEmail,
    };

    invoiceStorage.saveInvoiceGenerationData(invoiceData);

    // Navigate to step 2
    navigate(`/admin/financial/${oid}/invoice/generate/step-2`);
  };

  const handleCancel = () => {
    invoiceStorage.clearInvoiceGenerationData();
    navigate(`/admin/financial/${oid}/invoice`);
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
      <h4>Generate Invoice - Step 1 of 4</h4>

      {/* Progress Bar */}
      <div style={{ marginBottom: "20px" }}>
        <progress value="25" max="100" style={{ width: "100%" }}>
          25%
        </progress>
      </div>

      <Card title="Invoice Header Information">
        {errors.general && <Alert type="error">{errors.general}</Alert>}

        {order && (
          <form>
            <div style={{ marginBottom: "15px" }}>
              <label>
                Invoice ID # *
                <input
                  type="text"
                  value={invoiceId}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              <small>
                If you need to change this value, please update the financials
                screen for this job.
              </small>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Invoice Date *
                <input
                  type="date"
                  value={invoiceDate}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
              <small>
                If you need to change this value, please update the financials
                screen for this job.
              </small>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Associate Name *
                <input
                  type="text"
                  value={associateName}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Associate Phone *
                <input
                  type="tel"
                  value={associatePhone}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Associate Tax ID
                <input
                  type="text"
                  value={associateTaxId}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Client Name *
                <input
                  type="text"
                  value={customerName}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Client Address *
                <input
                  type="text"
                  value={customerAddress}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Client Phone *
                <input
                  type="tel"
                  value={customerPhone}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label>
                Client Email
                <input
                  type="email"
                  value={customerEmail}
                  disabled
                  style={{ display: "block", width: "100%", padding: "5px" }}
                />
              </label>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button onClick={handleCancel} variant="danger">
                ✕ Cancel
              </Button>
              <Button onClick={handleNext} variant="primary">
                Next →
              </Button>
            </div>
          </form>
        )}
      </Card>
    </Layout>
  );
}

export default AdminFinancialGenerateInvoiceStep1Page;
