// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Unarchive/Page.jsx

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

function AdminCustomerDetailMoreUnarchivePage() {
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

  // Handle unarchive operation
  const handleUnarchiveCustomer = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Using callback-based approach for consistency
      // Note: The same archiveCustomer API is used, which toggles the archive status
      await customerManager.archiveCustomerWithCallbacks(
        cid,
        (response) => {
          // Success callback
          setSuccessMessage("Customer unarchived successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate("/admin/customers");
          }, 2000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to unarchive customer:", error);
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
      console.error("Failed to unarchive customer:", error);
      setErrors({ general: "Failed to unarchive customer" });
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
    { label: "Unarchive", icon: "📤" },
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

      <Card title="📤 Unarchive Customer - Are you sure?">
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

        {/* Information message */}
        <div
          style={{
            marginBottom: "30px",
            padding: "20px",
            backgroundColor: theme.colors.infoBg,
            borderRadius: "4px",
            border: `1px solid ${theme.colors.info}`,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "16px",
              lineHeight: "1.5",
              color: "#0c5460",
            }}
          >
            You are about to <strong>unarchive</strong> this customer; this
            customer will exist in the list again. Are you sure you would like
            to continue?
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
            variant="success"
            disabled={isSubmitting}
            style={{ minWidth: "200px" }}
          >
            {isSubmitting ? "Processing..." : "Confirm and Unarchive"}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Unarchive"
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
              onClick={handleUnarchiveCustomer}
              variant="success"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Unarchiving..." : "Unarchive Customer"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Are you sure you want to <strong>unarchive</strong> this customer?
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            This will restore the customer to active listings and make them
            visible again.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMoreUnarchivePage;
