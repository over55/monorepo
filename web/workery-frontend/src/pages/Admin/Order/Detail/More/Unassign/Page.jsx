// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Unassign/Page.jsx

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
  Select,
  TextArea,
} from "../../../../../../components/UI";
import { ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../../constants/FieldOptions";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

function AdminOrderDetailMoreUnassignPage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order data
  const fetchOrder = async () => {
    if (!oid) return;

    setLoading(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setErrors({ fetch: "Failed to load order details. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }

    // Clear previous errors
    setErrors({});
    let newErrors = {};
    let hasErrors = false;

    // Validate reason
    if (!reason || reason === 0) {
      newErrors.reason = "Please select a reason";
      hasErrors = true;
    } else if (reason === 1) {
      // Validate reasonOther if "Other" is selected
      if (!reasonOther || !reasonOther.trim()) {
        newErrors.reasonOther = "Please specify the reason";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Submit the unassign operation
    setSubmitting(true);

    try {
      await orderManager.unassignAssociateFromOrder(
        order.id,
        reason,
        reasonOther,
        onUnauthorized,
      );

      // Set success message
      setSuccessMessage("Associate unassigned successfully");

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 1500);
    } catch (err) {
      console.error("Failed to unassign associate:", err);

      // Handle API errors
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({
          general: "Failed to unassign associate. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchOrder();
  }, [oid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "📋" },
    { label: "More", path: `/admin/order/${oid}/more`, icon: "⋯" },
    { label: "Unassign", icon: "👤❌" },
  ];

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading order details..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ margin: 0 }}>🔧 Order</h1>
        <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
          ℹ️ Detail
        </h4>
      </div>

      <hr style={{ margin: "20px 0" }} />

      {/* Status Alert */}
      {order && order.status === ORDER_STATUS_ARCHIVED && (
        <Alert type="info">📁 This order is archived</Alert>
      )}

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          ✅ {successMessage}
        </Alert>
      )}

      {/* Error Display */}
      {errors.fetch && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.fetch}
        </Alert>
      )}

      {errors.general && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.general}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {order ? (
          <>
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ margin: 0 }}>👤❌ Unassign Associate</h3>
            </div>

            <p style={{ marginBottom: "20px" }}>
              Please fill out all the required fields before submitting this
              form.
            </p>

            {/* Check if associate is assigned */}
            {!order.associateId ||
            order.associateId === "" ||
            order.associateId === "000000000000000000000000" ? (
              <Alert type="warning">
                ⚠️ This order does not have an associate assigned.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Current Associate Info */}
                <div
                  style={{
                    backgroundColor: theme.colors.light,
                    padding: "15px",
                    borderRadius: "4px",
                    marginBottom: "20px",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <strong>Current Associate:</strong>{" "}
                    {order.associateName || order.associateFullName || "N/A"}
                  </p>
                  {order.associatePhone && (
                    <p style={{ margin: "5px 0 0 0" }}>
                      <strong>Phone:</strong> {order.associatePhone}
                    </p>
                  )}
                  {order.associateEmail && (
                    <p style={{ margin: "5px 0 0 0" }}>
                      <strong>Email:</strong> {order.associateEmail}
                    </p>
                  )}
                </div>

                {/* Reason Select */}
                <Select
                  label="Reason"
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(parseInt(e.target.value))}
                  options={ORDER_UNASSIGN_REASON_OPTIONS_WITH_EMPTY_OPTIONS}
                  error={errors.reason}
                  required
                />

                {/* Reason Other Textarea */}
                {reason === 1 && (
                  <TextArea
                    label="Reason (Other)"
                    name="reasonOther"
                    value={reasonOther}
                    onChange={(e) => setReasonOther(e.target.value)}
                    placeholder="Please describe the reason for unassigning this associate..."
                    error={errors.reasonOther}
                    required
                    rows={5}
                    maxLength={1000}
                  />
                )}

                {/* Form Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Link to={`/admin/order/${oid}/more`}>
                    <Button variant="outline" disabled={submitting}>
                      ← Back to More
                    </Button>
                  </Link>

                  <Button type="submit" variant="success" disabled={submitting}>
                    {submitting ? "Submitting..." : "✓ Submit"}
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          !loading && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
              <h3>Order Not Found</h3>
              <p
                style={{ color: theme.colors.secondary, marginBottom: "30px" }}
              >
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Link to="/admin/orders">
                <Button variant="primary">← Back to Orders</Button>
              </Link>
            </div>
          )
        )}
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreUnassignPage;
