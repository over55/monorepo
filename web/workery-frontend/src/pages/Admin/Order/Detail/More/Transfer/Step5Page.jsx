// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAuthManager,
  useOrderManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";

// Order Status Constants
const ORDER_STATUS_ARCHIVED = 2;

function AdminOrderDetailMoreTransferStep5Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [transferOperation, setTransferOperation] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order data
  const fetchOrder = async () => {
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

  // Initialize component
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Load transfer operation from storage
    const savedOp = transferOperationStorage.getTransferOperation();
    setTransferOperation(savedOp);

    fetchOrder();
  }, [oid]);

  // Handle form submission
  const handleSubmit = async () => {
    if (!transferOperation) {
      setErrors({ general: "Transfer operation data not found" });
      return;
    }

    // Validate that at least one selection was made
    if (
      !transferOperation.pickedClientID &&
      !transferOperation.pickedAssociateID
    ) {
      setErrors({
        general: "Please select either a client or an associate to transfer to",
      });
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      // Prepare transfer data
      const transferData = {
        clientId: transferOperation.pickedClientID || null,
        associateId: transferOperation.pickedAssociateID || null,
      };

      // Use the existing transferOrder method from OrderManager
      await orderManager.transferOrder(order.id, transferData, onUnauthorized);

      // Clear the transfer operation storage
      transferOperationStorage.clearTransferOperation();

      // Set success message
      setSuccessMessage("Order transferred successfully");

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 1500);
    } catch (err) {
      console.error("Failed to transfer order:", err);

      // Handle API errors
      if (err && typeof err === "object") {
        setErrors(err);
      } else {
        setErrors({
          general: "Failed to transfer order. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "📋" },
    { label: "More", path: `/admin/order/${oid}/more`, icon: "⋯" },
    { label: "Transfer", icon: "🔄" },
  ];

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading order details..." />
      </div>
    );
  }

  const hasSelection =
    transferOperation &&
    (transferOperation.pickedClientID || transferOperation.pickedAssociateID);

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ margin: 0 }}>🔧 Order</h1>
      <h4 style={{ margin: "5px 0 20px 0", color: theme.colors.secondary }}>
        ℹ️ Detail
      </h4>
      <hr />

      {/* Status Alert */}
      {order && order.status === ORDER_STATUS_ARCHIVED && (
        <Alert type="info">📁 This order is archived</Alert>
      )}

      {/* Progress Bar */}
      <Card
        style={{
          marginBottom: "20px",
          backgroundColor: hasSelection
            ? theme.colors.successBg
            : theme.colors.errorBg,
        }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Step 5 of 5</p>
        <div
          style={{
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
            height: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: hasSelection
                ? theme.colors.success
                : theme.colors.danger,
              width: "100%",
              height: "100%",
              borderRadius: "10px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </Card>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          ✅ {successMessage}
        </Alert>
      )}

      {/* Error Display */}
      {errors.general && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.general}
        </Alert>
      )}

      <Card>
        <h3 style={{ marginBottom: "20px" }}>📝 Review Transfer</h3>

        <p style={{ color: theme.colors.secondary, marginBottom: "20px" }}>
          Please review the following order transfer details before submitting.
        </p>

        {!hasSelection ? (
          <Alert type="warning">
            <h4>⚠️ No Transfer Selection</h4>
            <p>
              Nothing to transfer. Please go back to the beginning and select
              either a customer or associate to transfer this job to.
            </p>
            <Link to={`/admin/order/${oid}/more/transfer/step-1`}>
              <Button variant="primary" style={{ marginTop: "10px" }}>
                ↻ Start Over
              </Button>
            </Link>
          </Alert>
        ) : (
          <>
            {order && (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  marginBottom: "20px",
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: theme.colors.dark }}>
                    <th
                      colSpan="2"
                      style={{
                        color: "white",
                        padding: "10px",
                        textAlign: "left",
                      }}
                    >
                      Job Transfer Details
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th
                      style={{
                        backgroundColor: theme.colors.light,
                        padding: "10px",
                        width: "30%",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Job #
                    </th>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      {order.wjid}
                    </td>
                  </tr>

                  {transferOperation.pickedClientID && (
                    <tr>
                      <th
                        style={{
                          backgroundColor: theme.colors.light,
                          padding: "10px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Transfer to Client
                      </th>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <strong>{transferOperation.pickedClientName}</strong>
                      </td>
                    </tr>
                  )}

                  {transferOperation.pickedAssociateID && (
                    <tr>
                      <th
                        style={{
                          backgroundColor: theme.colors.light,
                          padding: "10px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        Transfer to Associate
                      </th>
                      <td
                        style={{
                          padding: "10px",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <strong>{transferOperation.pickedAssociateName}</strong>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
              }}
            >
              <Link to={`/admin/order/${oid}/more/transfer/step-4`}>
                <Button variant="outline" disabled={submitting}>
                  ← Back to Step 4
                </Button>
              </Link>

              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "✓ Submit Transfer"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep5Page;
