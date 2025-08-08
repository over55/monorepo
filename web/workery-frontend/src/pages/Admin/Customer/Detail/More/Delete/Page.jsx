// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Delete/Page.jsx

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

function AdminCustomerDetailMoreDeletePage() {
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

  // Handle delete customer
  const handleDeleteCustomer = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Using callback-based approach for consistency
      await customerManager.deleteCustomerWithCallbacks(
        cid,
        (response) => {
          // Success callback
          setSuccessMessage("Customer deleted successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate("/admin/customers");
          }, 2000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to delete customer:", error);
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
      console.error("Failed to delete customer:", error);
      setErrors({ general: "Failed to delete customer" });
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
    { label: "Delete", icon: "🗑️" },
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

      <Card title="🗑️ Delete Customer - Are you sure?">
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
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: theme.colors.errorBg,
            borderRadius: "4px",
            border: `1px solid ${theme.colors.danger}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              lineHeight: "1.5",
              color: theme.colors.danger,
            }}
          >
            You are about to <strong>permanently delete</strong> this customer;
            it will no longer exist in our database. This action can be undone
            but you'll need to contact the system administrator. Are you sure
            you would like to continue?
          </p>
        </div>

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
            variant="danger"
            disabled={isSubmitting}
            style={{ minWidth: "200px" }}
          >
            {isSubmitting ? "Processing..." : "Confirm and Delete"}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="⚠️ PERMANENT DELETION WARNING"
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
              onClick={handleDeleteCustomer}
              variant="danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "PERMANENTLY DELETE"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
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
                fontSize: "16px",
                fontWeight: "bold",
                color: "#856404",
              }}
            >
              ⚠️ THIS ACTION CANNOT BE EASILY UNDONE!
            </p>
            <p style={{ margin: 0, fontSize: "14px", color: "#856404" }}>
              You are about to permanently delete this customer from the
              database. All associated data will be removed.
            </p>
          </div>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Customer:{" "}
            <strong>
              {customer?.firstName} {customer?.lastName}
            </strong>
          </p>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Email: <strong>{customer?.email}</strong>
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Type "DELETE" below to confirm this permanent action:
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMoreDeletePage;
