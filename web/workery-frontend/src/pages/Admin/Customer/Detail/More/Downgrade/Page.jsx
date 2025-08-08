// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Downgrade/Page.jsx

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

function AdminCustomerDetailMoreDowngradePage() {
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

  // Handle downgrade customer
  const handleDowngradeCustomer = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Using callback-based approach for consistency
      await customerManager.downgradeCustomerWithCallbacks(
        cid,
        (response) => {
          // Success callback
          setSuccessMessage("Customer downgraded successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to downgrade customer:", error);
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
      console.error("Failed to downgrade customer:", error);
      setErrors({ general: "Failed to downgrade customer" });
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
    { label: "Downgrade", icon: "⬇️" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banners */}
      {customer?.status === 2 && (
        <Alert type="info">Customer is archived</Alert>
      )}
      {customer?.isBanned && <Alert type="error">Customer is banned</Alert>}

      {/* Page Title */}
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>👤 Customer</h1>
      <h2 style={{ fontSize: "20px", color: "#666", marginBottom: "30px" }}>
        ℹ️ Detail
      </h2>

      {/* Success message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card title="⬇️ Downgrade Customer">
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
            You are about to <strong>downgrade</strong> this customer from{" "}
            <em>Business</em> type into <em>Residential</em>. This will affect
            the rates, associates and terms the customer will now be applied.
            Are you sure you want to continue?
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
              <strong>Current Type:</strong>{" "}
              {customer.typeOf === 3
                ? "Business"
                : customer.typeOf === 2
                  ? "Residential"
                  : "Unassigned"}
            </p>
            {customer.organizationName && (
              <p style={{ margin: "5px 0" }}>
                <strong>Organization:</strong> {customer.organizationName}
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
            variant="warning"
            disabled={isSubmitting}
            style={{ minWidth: "200px" }}
          >
            {isSubmitting ? "Processing..." : "Confirm and Downgrade"}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Downgrade"
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
              onClick={handleDowngradeCustomer}
              variant="warning"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Downgrading..." : "Downgrade Customer"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Are you sure you want to <strong>downgrade</strong> this customer
            from Business to Residential?
          </p>
          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "4px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <p
              style={{
                margin: "0 0 10px 0",
                fontWeight: "bold",
                color: "#856404",
              }}
            >
              Changes that will occur:
            </p>
            <ul style={{ margin: 0, paddingLeft: "20px", color: "#856404" }}>
              <li>Customer type will change from Business to Residential</li>
              <li>Different pricing rates may apply</li>
              <li>Associate assignment criteria may change</li>
              <li>Service terms and conditions will be updated</li>
            </ul>
          </div>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            This action can be reversed by upgrading the customer again.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMoreDowngradePage;
