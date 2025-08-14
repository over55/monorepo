// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  FormGroup,
} from "../../../../components/UI";

function AdminOrderAddStep2Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state
  const existingOrder = orderCreationStorage.getOrderCreation();

  // Form fields
  const [startDate, setStartDate] = useState(existingOrder?.startDate || "");
  const [isOngoing, setIsOngoing] = useState(existingOrder?.isOngoing || 0);
  const [isHomeSupportService, setIsHomeSupportService] = useState(
    existingOrder?.isHomeSupportService || 0,
  );

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    let newErrors = {};
    let hasErrors = false;

    if (isOngoing === 0) {
      newErrors["isOngoing"] =
        "Please select if this job is one-time or ongoing";
      hasErrors = true;
    }

    if (isHomeSupportService === 0) {
      newErrors["isHomeSupportService"] =
        "Please select if this is a home support service";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    console.log("onSubmitClick: Success");

    // Update order state
    const updatedOrder = {
      ...existingOrder,
      startDate: startDate,
      isOngoing: isOngoing,
      isHomeSupportService: isHomeSupportService,
    };

    orderCreationStorage.saveOrderCreation(updatedOrder);
    navigate("/admin/orders/add/step-3");
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
      if (!existingOrder || !existingOrder.customerId) {
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
    return <Loading message="Loading..." />;
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
      <Card title="Step 2 of 4">
        <progress value="50" max="100" style={{ width: "100%" }}>
          50%
        </progress>
      </Card>

      <br />

      {/* Job Type Form */}
      <Card title="⭐ Job Type">
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Please fill out all the required fields before submitting this form.
        </p>

        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <form onSubmit={onSubmitClick}>
          <FormGroup>
            <label>Is this job one time or ongoing? *</label>
            {errors.isOngoing && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors.isOngoing}
              </div>
            )}
            <div>
              <label>
                <input
                  type="radio"
                  name="isOngoing"
                  value="2"
                  checked={isOngoing === 2}
                  onChange={(e) => setIsOngoing(parseInt(e.target.value))}
                />{" "}
                One-Time
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="isOngoing"
                  value="1"
                  checked={isOngoing === 1}
                  onChange={(e) => setIsOngoing(parseInt(e.target.value))}
                />{" "}
                Ongoing
              </label>
            </div>
          </FormGroup>

          <FormGroup>
            <label>Is this job a home support service? *</label>
            {errors.isHomeSupportService && (
              <div style={{ color: "red", fontSize: "12px" }}>
                {errors.isHomeSupportService}
              </div>
            )}
            <div>
              <label>
                <input
                  type="radio"
                  name="isHomeSupportService"
                  value="2"
                  checked={isHomeSupportService === 2}
                  onChange={(e) =>
                    setIsHomeSupportService(parseInt(e.target.value))
                  }
                />{" "}
                No
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="isHomeSupportService"
                  value="1"
                  checked={isHomeSupportService === 1}
                  onChange={(e) =>
                    setIsHomeSupportService(parseInt(e.target.value))
                  }
                />{" "}
                Yes
              </label>
            </div>
          </FormGroup>

          <FormGroup>
            <label>When should this job start? (Optional)</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: "10px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                width: "200px",
              }}
            />
            <div style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}>
              Leave blank if nothing was specified by client.
            </div>
          </FormGroup>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCancelWarning(true)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Next →
            </Button>
          </div>
        </form>
      </Card>

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
                navigate("/admin/orders/add/step-1-search");
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
    </div>
  );
}

export default AdminOrderAddStep2Page;
