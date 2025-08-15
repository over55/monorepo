// File Path: monorepo/web/workery-frontend/src/pages/Admin/Financial/Detail/More/Clone/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useOrderManager } from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Loading,
  Breadcrumb,
  Button,
} from "../../../../../../components/UI";
import { ORDER_STATUS_ARCHIVED } from "../../../../../../constants/Order";

function AdminFinancialDetailMoreClonePage() {
  // URL Parameters
  const { oid } = useParams();
  const navigate = useNavigate();

  // Service hooks
  const orderManager = useOrderManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [isCloning, setIsCloning] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);

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

  // Handle clone operation
  const onCloneClick = async () => {
    setIsCloning(true);
    setErrors({});
    setShowSuccessMessage(false);
    setShowErrorMessage(false);

    try {
      const clonedOrder = await orderManager.cloneOrder(oid, onUnauthorized);

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after showing success message briefly
      setTimeout(() => {
        // Navigate to the new cloned order
        if (clonedOrder && clonedOrder.wjid) {
          navigate(`/admin/financial/${clonedOrder.wjid}`);
        } else if (clonedOrder && clonedOrder.id) {
          navigate(`/admin/financial/${clonedOrder.id}`);
        } else {
          // Fallback to financials list if no ID returned
          navigate("/admin/financials");
        }
      }, 2000);
    } catch (error) {
      console.error("Failed to clone order:", error);

      // Set error state
      if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to clone order. Please try again.",
        });
      }

      // Show error message
      setShowErrorMessage(true);

      // Clear error message after 2 seconds
      setTimeout(() => {
        setShowErrorMessage(false);
      }, 2000);

      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setIsCloning(false);
    }
  };

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
            { path: `/admin/financial/${oid}/more`, label: "More", icon: "⋯" },
            { label: "Clone", icon: "🔄" },
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
          { path: `/admin/financial/${oid}/more`, label: "More", icon: "⋯" },
          { label: "Clone", icon: "🔄" },
        ]}
      />

      {/* Success/Error Messages */}
      {showSuccessMessage && (
        <Alert type="success">
          Clone was successful! Redirecting to the new order...
        </Alert>
      )}
      {showErrorMessage && (
        <Alert type="error">Failed to clone order. Please try again.</Alert>
      )}

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
        <Card title="🔄 Clone Order">
          {isCloning ? (
            <Loading message="Cloning order..." />
          ) : (
            <div>
              {/* Warning/Information Section */}
              <div
                style={{
                  backgroundColor: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "4px",
                  marginBottom: "30px",
                  border: "1px solid #dee2e6",
                }}
              >
                <h3>📢 Important Information</h3>
                <p>
                  <strong>Warning:</strong> You are about to clone work order #
                  {oid}. Cloning will perform the following actions:
                </p>
                <ul>
                  <li>
                    A single new work order will be created in the system.
                  </li>
                  <li>
                    All data from work order #{oid} will be copied into the new
                    work order. Pending tasks from the original work order will
                    NOT be copied to the cloned work order.
                  </li>
                  <li>
                    The state of the cloned work order will be set to{" "}
                    <strong>completed but unpaid</strong>.
                  </li>
                  <li>
                    You will be responsible for making any necessary edits to
                    the cloned order afterwards.
                  </li>
                </ul>
                <p>
                  Please review this information carefully before proceeding
                  with the clone operation.
                </p>
              </div>

              {/* Action Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <Link to={`/admin/financial/${oid}/more`}>
                    <Button variant="secondary">✕ Cancel</Button>
                  </Link>
                </div>
                <div>
                  <Button
                    variant="success"
                    onClick={onCloneClick}
                    disabled={isOrderArchived()}
                  >
                    ✓ Clone Order
                  </Button>
                </div>
              </div>

              {isOrderArchived() && (
                <p style={{ marginTop: "10px", color: "#6c757d" }}>
                  <em>Note: Archived orders cannot be cloned.</em>
                </p>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default AdminFinancialDetailMoreClonePage;
