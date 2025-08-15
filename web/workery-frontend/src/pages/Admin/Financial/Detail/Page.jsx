// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
} from "../../../../components/UI";
import { DateTime } from "luxon";
import { ORDER_INVOICE_PAYMENT_METHODS_OPTIONS } from "../../../../constants/FieldOptions";
import { ORDER_STATUS_ARCHIVED } from "../../../../constants/Order";

function AdminFinancialDetailPage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  useEffect(() => {
    let mounted = true;

    const fetchOrderDetails = async () => {
      if (!oid) {
        setErrors({ general: "Order ID is required" });
        return;
      }

      setFetching(true);
      setErrors({});

      try {
        // Use the new OrderManager to fetch order details
        const orderData = await orderManager.getOrderDetail(
          oid,
          onUnauthorized,
        );

        if (mounted) {
          setOrder(orderData);
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
    };

    fetchOrderDetails();

    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return "-";
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_MED);
    } catch (error) {
      return dateString;
    }
  };

  // Get payment methods display
  const getPaymentMethodsDisplay = (paymentMethods) => {
    if (!paymentMethods || !Array.isArray(paymentMethods)) return "-";

    const methods = paymentMethods.map((methodId) => {
      const option = ORDER_INVOICE_PAYMENT_METHODS_OPTIONS.find(
        (opt) => opt.value === methodId,
      );
      return option ? option.label : `Unknown (${methodId})`;
    });

    return methods.join(", ");
  };

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
  };

  // Check if customer ID is valid (not empty or default MongoDB ObjectId)
  const hasValidCustomer = () => {
    const EMPTY_OBJECT_ID = "000000000000000000000000";
    return order && order.customerId && order.customerId !== EMPTY_OBJECT_ID;
  };

  // Check if associate ID is valid (not empty or default MongoDB ObjectId)
  const hasValidAssociate = () => {
    const EMPTY_OBJECT_ID = "000000000000000000000000";
    return order && order.associateId && order.associateId !== EMPTY_OBJECT_ID;
  };

  // Render error messages
  const renderErrors = () => {
    if (!errors || Object.keys(errors).length === 0) return null;

    return (
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
    );
  };

  // Loading state
  if (isFetching) {
    return (
      <div>
        <Breadcrumb
          items={[
            { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
            { path: "/admin/financials", label: "Financials", icon: "💳" },
            { label: `Order #${oid}`, icon: "📄" },
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
          { label: `Order #${oid}`, icon: "📄" },
        ]}
      />

      {/* Page banner for archived orders */}
      {isOrderArchived() && <Alert type="info">This order is archived.</Alert>}

      {/* Page Title */}
      <h1>💳 Financials</h1>
      <h4>📄 Detail</h4>
      <hr />

      {/* Error display */}
      {renderErrors()}

      {/* Main Content */}
      {order && (
        <Card
          title="Financial Detail"
          actions={
            <Link to={`/admin/financial/${oid}/edit`}>
              <Button variant="warning" disabled={isOrderArchived()}>
                ✏️ Edit
              </Button>
            </Link>
          }
        >
          {/* Tab Navigation */}
          <div>
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                padding: 0,
                borderBottom: "1px solid #ddd",
              }}
            >
              <li
                style={{
                  marginRight: "20px",
                  paddingBottom: "10px",
                  borderBottom: "2px solid #007bff",
                }}
              >
                <strong>Detail</strong>
              </li>
              <li style={{ marginRight: "20px", paddingBottom: "10px" }}>
                <Link to={`/admin/financial/${oid}/invoice`}>Invoice</Link>
              </li>
              <li style={{ paddingBottom: "10px" }}>
                <Link to={`/admin/financial/${oid}/more`}>More ⋯</Link>
              </li>
            </ul>
          </div>

          {/* Financial Information Table */}
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "20px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                <th colSpan="2" style={{ padding: "10px", textAlign: "left" }}>
                  Financial Information
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
                    textAlign: "left",
                  }}
                >
                  Order #
                </th>
                <td style={{ padding: "10px" }}>
                  <Link to={`/admin/order/${order.wjid || order.id}`}>
                    {order.wjid || order.id}
                  </Link>
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Order Assignment Date
                </th>
                <td style={{ padding: "10px" }}>
                  {formatDate(order.assignmentDate)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Order Start Date
                </th>
                <td style={{ padding: "10px" }}>
                  {formatDate(order.startDate)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Order Completion Date
                </th>
                <td style={{ padding: "10px" }}>
                  {formatDate(order.completionDate)}
                </td>
              </tr>

              {hasValidCustomer() && (
                <tr>
                  <th
                    style={{
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      textAlign: "left",
                    }}
                  >
                    Customer
                  </th>
                  <td style={{ padding: "10px" }}>
                    <Link to={`/admin/customer/${order.customerId}`}>
                      {order.customerName || "View Customer"}
                    </Link>
                  </td>
                </tr>
              )}

              {hasValidAssociate() && (
                <tr>
                  <th
                    style={{
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      textAlign: "left",
                    }}
                  >
                    Associate
                  </th>
                  <td style={{ padding: "10px" }}>
                    <Link to={`/admin/associate/${order.associateId}`}>
                      {order.associateName || "View Associate"}
                    </Link>
                  </td>
                </tr>
              )}

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Date
                </th>
                <td style={{ padding: "10px" }}>
                  {formatDate(order.invoiceDate)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice ID(s) #
                </th>
                <td style={{ padding: "10px" }}>{order.invoiceIds || "-"}</td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Quote
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceQuoteAmount)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Labour
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceLabourAmount)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Material
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceMaterialAmount)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Tax
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceTaxAmount)}
                  {order.invoiceIsCustomTaxAmount && (
                    <span> (ℹ️ Note: Custom value was set)</span>
                  )}
                </td>
              </tr>

              {order.associateTaxId && (
                <tr>
                  <th
                    style={{
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      textAlign: "left",
                    }}
                  >
                    Invoice HST #
                  </th>
                  <td style={{ padding: "10px" }}>{order.associateTaxId}</td>
                </tr>
              )}

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Total
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceTotalAmount)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Service Fee
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceServiceFeeAmount)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Invoice Service Fee Payment Date
                </th>
                <td style={{ padding: "10px" }}>
                  {formatDate(order.invoiceServiceFeePaymentDate)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Payment Method(s)
                </th>
                <td style={{ padding: "10px" }}>
                  {getPaymentMethodsDisplay(order.paymentMethods)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Actual Service Fee Amount Paid
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceActualServiceFeeAmountPaid)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  Account Balance
                </th>
                <td style={{ padding: "10px" }}>
                  {formatCurrency(order.invoiceBalanceOwingAmount)}
                </td>
              </tr>

              <tr>
                <th
                  style={{
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    textAlign: "left",
                  }}
                >
                  # of Visits
                </th>
                <td style={{ padding: "10px" }}>{order.visits || "-"}</td>
              </tr>
            </tbody>
          </table>

          {/* Action Buttons */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link to="/admin/financials">
              <Button variant="secondary">← Back to Financials</Button>
            </Link>
            <Link to={`/admin/financial/${oid}/edit`}>
              <Button variant="warning" disabled={isOrderArchived()}>
                ✏️ Edit
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminFinancialDetailPage;
