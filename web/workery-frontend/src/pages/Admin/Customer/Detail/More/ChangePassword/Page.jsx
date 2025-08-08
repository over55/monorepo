// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/ChangePassword/Page.jsx

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
  Input,
} from "../../../../../../components/UI";

function AdminCustomerDetailMoreChangePasswordPage() {
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

  // Form fields
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

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

  // Handle form validation
  const validateForm = () => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!passwordRepeated.trim()) {
      newErrors.passwordRepeated = "Password confirmation is required";
    } else if (password !== passwordRepeated) {
      newErrors.passwordRepeated = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password change
  const handleChangePassword = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const passwordData = {
        customer_id: cid,
        password: password,
        password_repeated: passwordRepeated,
      };

      // Using callback-based approach for consistency
      await customerManager.changeCustomerPasswordWithCallbacks(
        passwordData,
        (response) => {
          // Success callback
          setSuccessMessage("Password changed successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to change password:", error);
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
      console.error("Failed to change password:", error);
      setErrors({ general: "Failed to change password" });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmModal(true);
    }
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
    { label: "Password", icon: "🔑" },
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

      <Card title="🔑 Change Password">
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
            You are about to <strong>change the password</strong> for this
            customer. Please make sure you enter it correctly or else customer
            will be locked out of the account and requiring password resetting.
            Are you sure you want to continue?
          </p>
        </Alert>

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            error={errors.password}
            required
          />

          {/* Password Repeated */}
          <Input
            label="Password Repeated"
            name="passwordRepeated"
            type="password"
            value={passwordRepeated}
            onChange={(e) => setPasswordRepeated(e.target.value)}
            placeholder="Enter password again"
            error={errors.passwordRepeated}
            required
          />

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
              paddingTop: "30px",
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
              type="submit"
              variant="danger"
              disabled={isSubmitting}
              style={{ minWidth: "200px" }}
            >
              {isSubmitting ? "Processing..." : "Confirm and Submit"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Password Change"
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
              onClick={handleChangePassword}
              variant="danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Changing..." : "Change Password"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Are you sure you want to <strong>change the password</strong> for
            this customer?
          </p>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Make sure the customer can access their account with the new
            password.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMoreChangePasswordPage;
