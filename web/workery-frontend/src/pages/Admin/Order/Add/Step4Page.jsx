// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
  useOrderManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../components/UI";
import { SkillSetsDisplay, TagsDisplay } from "../../../../components/Display";

function AdminOrderAddStep4Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const orderManager = useOrderManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state
  const orderData = orderCreationStorage.getOrderCreation();

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = async (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");
    setFetching(true);
    setErrors({});

    try {
      // Prepare the payload
      const payload = {
        customerId: orderData.customerId,
        description: orderData.description,
        skillSets: orderData.skillSets,
        isOngoing: orderData.isOngoing,
        isHomeSupportService: orderData.isHomeSupportService,
        startDate: orderData.startDate,
        additionalComment: orderData.additionalComment,
        tags: orderData.tags,
      };

      console.log("onSubmitClick: payload:", payload);

      // Create the order
      const response = await orderManager.createOrder(payload, onUnauthorized);

      console.log("Order created successfully:", response);

      // Clear the order creation state
      orderCreationStorage.clearOrderCreation();

      // Redirect to the order detail page
      navigate(`/admin/order/${response.wjid || response.id}`);
    } catch (error) {
      console.error("Failed to create order:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
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

      // Check if we have order state
      if (!orderData || !orderData.customerId) {
        // No customer selected, redirect to step 1
        navigate("/admin/orders/add/step-1-search");
        return;
      }
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading message="Submitting order..." />;
  }

  if (!orderData) {
    return <Loading message="Loading order data..." />;
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Orders", path: "/admin/orders", icon: "🔧" },
          { label: "New", icon: "➕" },
        ]}
      />

      <h1>Orders</h1>
      <h4>New Order</h4>
      <hr />

      {/* Progress Wizard */}
      <Card title="Step 4 of 4" style={{ backgroundColor: "#d4edda" }}>
        <progress value="100" max="100" style={{ width: "100%" }}>
          100%
        </progress>
      </Card>

      <br />

      {/* Cancel Warning Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => setShowCancelWarning(false)}
              variant="secondary"
            >
              No
            </Button>
            <Button
              onClick={() => {
                orderCreationStorage.clearOrderCreation();
                navigate("/admin/orders");
              }}
              variant="success"
            >
              Yes
            </Button>
          </>
        }
      >
        <p>
          Your Order record will be cancelled and your work will be lost. This
          cannot be undone. Do you want to continue?
        </p>
      </Modal>

      {/* Review */}
      <Card title="📝 Review">
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Please review the following order summary table before submitting this
          order into the system.
        </p>

        {errors.message && <Alert type="error">{errors.message}</Alert>}
        {errors.detail && <Alert type="error">{errors.detail}</Alert>}

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#333", color: "white" }}>
              <th colSpan="2" style={{ padding: "10px", textAlign: "left" }}>
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th
                style={{
                  width: "30%",
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Customer:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                <Link
                  to={`/admin/customer/${orderData.customerId}`}
                  target="_blank"
                  style={{ color: theme.colors.primary }}
                >
                  {orderData.customerFirstName} {orderData.customerLastName}
                </Link>
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Start Date:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {formatDate(orderData.startDate)}
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Is Ongoing:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {orderData.isOngoing === 1 ? (
                  <span style={{ color: "green" }}>✓ Yes</span>
                ) : (
                  <span style={{ color: "red" }}>✗ No</span>
                )}
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                }}
              >
                Is Home Support Service:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {orderData.isHomeSupportService === 1 ? (
                  <span style={{ color: "green" }}>✓ Yes</span>
                ) : (
                  <span style={{ color: "red" }}>✗ No</span>
                )}
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  verticalAlign: "top",
                }}
              >
                Description:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {orderData.description || "-"}
                </div>
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  verticalAlign: "top",
                }}
              >
                Skill Sets:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {orderData.skillSets && orderData.skillSets.length > 0 ? (
                  <SkillSetsDisplay
                    values={orderData.skillSets}
                    onUnauthorized={onUnauthorized}
                  />
                ) : (
                  <span style={{ color: "#999" }}>No skill sets selected</span>
                )}
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  verticalAlign: "top",
                }}
              >
                Additional Comment:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                <div style={{ whiteSpace: "pre-wrap" }}>
                  {orderData.additionalComment || "-"}
                </div>
              </td>
            </tr>
            <tr>
              <th
                style={{
                  padding: "10px",
                  backgroundColor: "#f5f5f5",
                  textAlign: "left",
                  borderBottom: "1px solid #ddd",
                  verticalAlign: "top",
                }}
              >
                Tags:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {orderData.tags && orderData.tags.length > 0 ? (
                  <TagsDisplay
                    values={orderData.tags}
                    onUnauthorized={onUnauthorized}
                  />
                ) : (
                  <span style={{ color: "#999" }}>No tags selected</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "2px solid #eee",
          }}
        >
          <Link to="/admin/orders/add/step-3">
            <Button type="button" variant="secondary">
              ← Back
            </Button>
          </Link>
          <Button
            onClick={onSubmitClick}
            variant="success"
            disabled={isFetching}
          >
            {isFetching ? "Submitting..." : "✓ Submit Order"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderAddStep4Page;
