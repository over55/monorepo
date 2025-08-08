// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/2FA/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
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

function AdminCustomerDetailMore2FAPage() {
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

  // Handle 2FA toggle
  const handleToggle2FA = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const newOtpEnabled = !customer.otpEnabled;

      // Using callback-based approach for consistency
      await customerManager.changeCustomer2FAWithCallbacks(
        {
          customerId: cid,
          otpEnabled: newOtpEnabled,
        },
        (response) => {
          // Success callback
          setCustomer((prev) => ({
            ...prev,
            otpEnabled: newOtpEnabled,
          }));

          setSuccessMessage("2FA changed successfully");
          setTimeout(() => {
            setSuccessMessage("");
          }, 3000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to change 2FA:", error);
          setErrors(error);
        },
        () => {
          // Done callback
          setIsSubmitting(false);
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to change 2FA:", error);
      setErrors({ general: "Failed to change 2FA setting" });
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
    { label: "Two-Factor Authentication", icon: "📱" },
  ];

  const isEnabled = customer?.otpEnabled || false;

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>👤 Customer</h1>
      <h2 style={{ fontSize: "20px", color: "#666", marginBottom: "30px" }}>
        ℹ️ Detail
      </h2>

      {/* Page banners */}
      {customer?.status === 2 && (
        <Alert type="info">Customer is archived</Alert>
      )}
      {customer?.isBanned && <Alert type="error">Customer is banned</Alert>}

      {/* Success message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card title="📱 Change Two-Factor Authentication">
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

        {/* Current status and action */}
        <div style={{ marginBottom: "30px" }}>
          {!isEnabled ? (
            <div
              style={{
                backgroundColor: theme.colors.successBg,
                color: theme.colors.success,
                border: `1px solid ${theme.colors.success}`,
                borderRadius: "4px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "24px" }}>✅</span>
                Enable 2FA
              </h3>
              <p style={{ margin: 0, lineHeight: "1.5" }}>
                You are about to <strong>enable 2FA</strong> for this customer
                member. This operation will force the customer member on next
                successful login to be taken through a{" "}
                <strong>3-step wizard</strong> to setup 2FA. Afterwards every
                time the customer member logs in, they will be asked to carry
                out a 2FA process. Are you sure you want to continue?
              </p>
            </div>
          ) : (
            <div
              style={{
                backgroundColor: theme.colors.warningBg,
                color: "#856404",
                border: `1px solid ${theme.colors.warning}`,
                borderRadius: "4px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <h3
                style={{
                  margin: "0 0 15px 0",
                  fontSize: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span style={{ fontSize: "24px" }}>⚠️</span>
                Remove 2FA
              </h3>
              <p style={{ margin: 0, lineHeight: "1.5" }}>
                You are about to <strong>remove 2FA</strong> for this customer
                member. This operation will remove previous 2FA setup codes and
                disable 2FA on login for this customer. This is recommended if
                the user lost their 2FA codes from their device. Are you sure
                you want to continue?
              </p>
            </div>
          )}
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
            ← Back to Detail (More)
          </Button>
          <Button
            onClick={handleSubmit}
            variant={isEnabled ? "warning" : "success"}
            disabled={isSubmitting}
            style={{ minWidth: "200px" }}
          >
            {isSubmitting ? "Processing..." : "Confirm and Submit"}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm 2FA Change"
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
              onClick={handleToggle2FA}
              variant={isEnabled ? "warning" : "success"}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Confirm"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Are you sure you want to{" "}
            <strong>{isEnabled ? "disable" : "enable"}</strong> 2FA for this
            customer?
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            This action will{" "}
            {isEnabled
              ? "remove all existing 2FA setup and disable 2FA authentication"
              : "require the customer to setup 2FA on their next login"}
            .
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMore2FAPage;
