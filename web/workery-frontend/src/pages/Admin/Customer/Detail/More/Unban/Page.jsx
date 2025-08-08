// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Unban/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../../../../components/UI";

function AdminCustomerDetailMoreUnbanPage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer details
  useEffect(() => {
    let mounted = true;

    const fetchCustomer = async () => {
      if (!authManager.isAuthenticated()) {
        navigate("/login");
        return;
      }

      try {
        setIsLoading(true);
        setErrors({});

        // Using callback-based approach similar to old code structure
        await customerManager.getCustomerDetailWithCallbacks(
          cid,
          (customerData) => {
            if (mounted) {
              setCustomer(customerData);
            }
          },
          (error) => {
            if (mounted) {
              setErrors(error);
            }
          },
          () => {
            if (mounted) {
              setIsLoading(false);
            }
          },
          onUnauthorized,
        );
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        if (mounted) {
          setErrors({ general: "Failed to load customer information" });
          setIsLoading(false);
        }
      }
    };

    if (cid) {
      fetchCustomer();
    } else {
      setErrors({ general: "Customer ID is required" });
      setIsLoading(false);
    }

    return () => {
      mounted = false;
    };
  }, [cid, customerManager, authManager, navigate]);

  // Handle unban customer
  const handleUnbanCustomer = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const unbanData = {
        customer_id: cid,
      };

      // Using callback-based approach for consistency
      await customerManager.unbanCustomerWithCallbacks(
        unbanData,
        (response) => {
          // Success callback
          setSuccessMessage("Customer unbanned successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to unban customer:", error);
          setErrors(error);
          setShowConfirmModal(false);
        },
        () => {
          // Done callback
          setIsSubmitting(false);
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to unban customer:", error);
      setErrors({ general: "Failed to unban customer" });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    setErrors({});
    setShowConfirmModal(true);
  };

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading customer information..." />
      </div>
    );
  }

  if (!customer && !isLoading) {
    return (
      <div style={globalStyles.container}>
        <Alert type="error">{errors.general || "Customer not found"}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Button
            onClick={() => navigate("/admin/customers")}
            variant="outline"
          >
            ← Back to Customers
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Customers", path: "/admin/customers", icon: "👤" },
    { label: "Detail (More)", path: `/admin/customer/${cid}/more`, icon: "ℹ️" },
    { label: "Unban", icon: "✅" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banners */}
      {customer?.status === 2 && (
        <Alert type="info">Customer is archived</Alert>
      )}
      {customer?.isBanned && (
        <Alert type="error">Customer is currently banned</Alert>
      )}

      {/* Page Title */}
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>👤 Customer</h1>
      <h2 style={{ fontSize: "20px", color: "#666", marginBottom: "30px" }}>
        ℹ️ Detail
      </h2>

      {/* Success message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card title="✅ Unban Customer">
        {/* Error display */}
        {Object.keys(errors).length > 0 && (
          <Alert type="error">
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {Object.entries(errors).map(([field, message]) => (
                <li key={field}>
                  {field === "general" ? message : `${field}: ${message}`}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Warning message */}
        <Alert type="warning" style={{ marginBottom: "30px" }}>
          <h4 style={{ margin: "0 0 10px 0" }}>⚠️ Warning</h4>
          <p style={{ margin: 0 }}>
            You are about to <strong>unban</strong> this customer. This will
            remove the <em>banner warning</em> from this customer. Are you sure
            you want to continue?
          </p>
        </Alert>

        {/* Current customer info */}
        {customer && (
          <div
            style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <h5 style={{ margin: "0 0 15px 0" }}>Customer Information:</h5>
            <p style={{ margin: "5px 0" }}>
              <strong>Name:</strong> {customer.firstName} {customer.lastName}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Email:</strong> {customer.email}
            </p>
            <p style={{ margin: "5px 0" }}>
              <strong>Current Status:</strong>{" "}
              {customer.isBanned ? "🚫 Banned" : "✅ Active"}
            </p>
            {customer.banningReason && (
              <p style={{ margin: "5px 0" }}>
                <strong>Ban Reason:</strong> {customer.banningReason}
              </p>
            )}
            {customer.banningReasonOther && (
              <p style={{ margin: "5px 0" }}>
                <strong>Additional Details:</strong>{" "}
                {customer.banningReasonOther}
              </p>
            )}
          </div>
        )}

        {/* Action buttons */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            flexWrap: "wrap",
            paddingTop: "20px",
            borderTop: "1px solid #eee",
          }}
        >
          <Button
            onClick={() => navigate(`/admin/customer/${cid}/more`)}
            variant="secondary"
            style={{ minWidth: "200px" }}
          >
            ← Back to Detail
          </Button>
          <Button
            onClick={handleSubmit}
            variant="success"
            disabled={isSubmitting || !customer?.isBanned}
            style={{ minWidth: "200px" }}
          >
            {isSubmitting ? "Processing..." : "Confirm and Unban"}
          </Button>
        </div>

        {/* Info message if customer is not banned */}
        {customer && !customer.isBanned && (
          <Alert type="info" style={{ marginTop: "20px" }}>
            This customer is not currently banned. No action is needed.
          </Alert>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Unban"
        footer={
          <>
            <Button
              onClick={() => setShowConfirmModal(false)}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnbanCustomer}
              variant="success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Unbanning..." : "Unban Customer"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Are you sure you want to <strong>unban</strong> this customer?
          </p>
          <div
            style={{
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              borderRadius: "4px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px 0",
                fontWeight: "bold",
                color: "#155724",
              }}
            >
              Actions that will occur:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#155724" }}>
              <li>Ban status will be removed</li>
              <li>Warning banner will no longer display</li>
              <li>Customer will regain full access to services</li>
              <li>Previous ban reason will be cleared</li>
            </ul>
          </div>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            The customer can be banned again if necessary.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMoreUnbanPage;
