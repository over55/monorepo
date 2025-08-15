// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
} from "../../../../../components/UI";
import { ORDER_STATUS_ARCHIVED } from "../../../../../constants/Order";

function AdminFinancialDetailMorePage() {
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

  // Check if order is archived
  const isOrderArchived = () => {
    return order && order.status === ORDER_STATUS_ARCHIVED;
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
            {
              path: `/admin/financial/${oid}`,
              label: `Order #${oid}`,
              icon: "📄",
            },
            { label: "More", icon: "⋯" },
          ]}
        />
        <Loading message="Loading order details..." />
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
          { label: "More", icon: "⋯" },
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
        <Card title="More Actions">
          {/* Tab Navigation */}
          <div style={{ marginBottom: "20px" }}>
            <ul
              style={{
                display: "flex",
                listStyle: "none",
                padding: 0,
                borderBottom: "1px solid #ddd",
              }}
            >
              <li style={{ marginRight: "20px", paddingBottom: "10px" }}>
                <Link to={`/admin/financial/${oid}`}>Detail</Link>
              </li>
              <li style={{ marginRight: "20px", paddingBottom: "10px" }}>
                <Link to={`/admin/financial/${oid}/invoice`}>Invoice</Link>
              </li>
              <li
                style={{
                  paddingBottom: "10px",
                  borderBottom: "2px solid #007bff",
                }}
              >
                <strong>More ⋯</strong>
              </li>
            </ul>
          </div>

          {/* Action Options */}
          <div>
            <h3>Available Actions</h3>

            {/* Clone Action */}
            <div
              style={{
                marginBottom: "20px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            >
              <h4>🔄 Clone Order</h4>
              <p>Create a duplicate of this order</p>
              <Link to={`/admin/financial/${oid}/more/clone`}>
                <Button variant="primary">Proceed to Clone</Button>
              </Link>
            </div>

            {/* Future actions can be added here */}
            {/* Example structure:
            <div style={{ marginBottom: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "4px" }}>
              <h4>📧 Email Invoice</h4>
              <p>Send invoice to customer via email</p>
              <Link to={`/admin/financial/${oid}/more/email`}>
                <Button variant="primary">
                  Send Email
                </Button>
              </Link>
            </div>
            */}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: "30px" }}>
            <Link to="/admin/financials">
              <Button variant="secondary">← Back to Financials</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AdminFinancialDetailMorePage;
