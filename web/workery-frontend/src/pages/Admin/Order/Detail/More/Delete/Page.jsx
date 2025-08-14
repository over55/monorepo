// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Delete/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";

function AdminOrderDetailMoreDeletePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrderDetail = async () => {
    setFetching(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
      console.log(
        "AdminOrderDetailMoreDeletePage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreDeletePage: Failed to fetch order:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Handle delete confirmation
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning delete operation...");

    setIsDeleting(true);
    setErrors({});

    try {
      await orderManager.deleteOrder(oid, onUnauthorized);

      console.log("AdminOrderDetailMoreDeletePage: Order deleted successfully");

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/admin/orders");
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreDeletePage: Failed to delete order:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchOrderDetail();
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  if (isFetching) {
    return <Loading message="Loading order details..." />;
  }

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    {
      path: `/admin/order/${oid}/more`,
      label: `Order #${oid} (More)`,
      icon: "ℹ️",
    },
    { label: "Delete", icon: "🗑️" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success">
          Order deleted successfully! Redirecting to orders list...
        </Alert>
      )}

      {/* Archived Banner */}
      {order && order.status === 2 && (
        <Alert type="info">This order is archived</Alert>
      )}

      {/* Page Title */}
      <h1>🔧 Order</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      {/* Page Content */}
      <Card title="🗑️ Delete Job - Are you sure?">
        {/* Error Display */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error" onClose={() => setErrors({})}>
            <div>
              <strong>There were errors with your request:</strong>
              <ul style={{ margin: "10px 0 0 20px" }}>
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        {order && (
          <div>
            {/* Warning Message */}
            <Alert type="warning">
              <strong>⚠️ Warning: This action cannot be undone!</strong>
              <p style={{ marginTop: "10px" }}>
                You are about to permanently delete this job from the Workery
                system. It will no longer exist in our database and will impact
                reports and future auditing.
              </p>
              <p style={{ marginTop: "10px" }}>
                <strong>Order Details:</strong>
                <br />• Order ID: #{order.id || oid}
                <br />• Customer:{" "}
                {order.customerName ||
                  order.customerFirstName + " " + order.customerLastName ||
                  "N/A"}
                <br />• Description: {order.description || "N/A"}
                <br />• Status: {order.statusLabel || "N/A"}
              </p>
              <p style={{ marginTop: "10px" }}>
                Are you absolutely sure you want to continue?
              </p>
            </Alert>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to={`/admin/order/${oid}/more`}>
                <Button variant="secondary">← Back to More</Button>
              </Link>

              <Button
                variant="danger"
                onClick={onSubmitClick}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "✓ Confirm and Delete"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreDeletePage;
