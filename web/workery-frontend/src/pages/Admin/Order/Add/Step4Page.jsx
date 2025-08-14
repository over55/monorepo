// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
  useOrderManager,
  useSkillSetManager,
  useTagManager,
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

function AdminOrderAddStep4Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const orderManager = useOrderManager();
  const skillSetManager = useSkillSetManager();
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state
  const orderData = orderCreationStorage.getOrderCreation();

  // For displaying labels
  const [skillSetLabels, setSkillSetLabels] = useState([]);
  const [tagLabels, setTagLabels] = useState([]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchLabels = async () => {
    try {
      // Fetch skill set labels
      if (orderData?.skillSets?.length > 0) {
        const skillSetsData =
          await skillSetManager.getSkillSetSelectOptions(onUnauthorized);
        if (skillSetsData) {
          const labels = orderData.skillSets.map((id) => {
            const option = skillSetsData.find((opt) => opt.value === id);
            return option ? option.label : `ID: ${id}`;
          });
          setSkillSetLabels(labels);
        }
      }

      // Fetch tag labels
      if (orderData?.tags?.length > 0) {
        const tagsData = await tagManager.getTagSelectOptions(onUnauthorized);
        if (tagsData) {
          const labels = orderData.tags.map((id) => {
            const option = tagsData.find((opt) => opt.value === id);
            return option ? option.label : `ID: ${id}`;
          });
          setTagLabels(labels);
        }
      }
    } catch (error) {
      console.error("Failed to fetch labels:", error);
    }
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

      fetchLabels();
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
                {orderData.startDate || "-"}
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
                {orderData.isOngoing === 1 ? "✓ Yes" : "✗ No"}
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
                {orderData.isHomeSupportService === 1 ? "✓ Yes" : "✗ No"}
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
                Description:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {orderData.description}
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
                Skill Sets:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {skillSetLabels.length > 0
                  ? skillSetLabels.join(", ")
                  : "Loading..."}
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
                Additional Comment:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {orderData.additionalComment || "-"}
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
                Tags:
              </th>
              <td style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                {tagLabels.length > 0 ? tagLabels.join(", ") : "-"}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "20px",
          }}
        >
          <Link to="/admin/orders/add/step-3">
            <Button type="button" variant="secondary">
              ← Back
            </Button>
          </Link>
          <Button
            onClick={onSubmitClick}
            variant="primary"
            disabled={isFetching}
          >
            ✓ Submit
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderAddStep4Page;
