// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, Spinner, etc.)
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";
import axios from "axios";

function AdminCustomerDetailMoreChangePasswordPage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoized theme classes
  const themeClasses = useMemo(
    () => ({
      textPrimary: getThemeClasses("text-primary"),
      textSecondary: getThemeClasses("text-secondary"),
      linkPrimary: getThemeClasses("link-primary"),
    }),
    [getThemeClasses],
  );

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalJustOpened, setModalJustOpened] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Memoized breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      { label: "Dashboard", path: "/admin/dashboard", icon: "chart-bar" },
      { label: "Customers", path: "/admin/customers", icon: "users" },
      { label: "Detail (More)", path: `/admin/customer/${cid}/more`, icon: "information-circle" },
      { label: "Password", icon: "key" },
    ],
    [cid],
  );

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

  // Handle password change with direct API call
  const handleChangePassword = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const passwordData = {
        customer_id: cid,
        password: password,
        password_repeated: passwordRepeated,
      };

      // Get access token - try common keys
      let accessToken =
        localStorage.getItem("WORKERY_ACCESS_TOKEN") ||
        localStorage.getItem("WORKERY_TENANT_ACCESS_TOKEN") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

      if (!accessToken) {
        // Try to find any key containing 'token'
        const tokenKey = Object.keys(localStorage).find(
          (key) =>
            key.toLowerCase().includes("token") &&
            !key.toLowerCase().includes("refresh") &&
            !key.toLowerCase().includes("timestamp"),
        );

        if (tokenKey) {
          accessToken = localStorage.getItem(tokenKey);
        }
      }

      if (!accessToken) {
        throw new Error("No access token found. Please login again.");
      }

      // Build the API URL
      const apiBaseUrl =
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000"
          : window.location.origin;

      const endpoint = "/api/v1/customers/operations/change-password";
      const fullUrl = `${apiBaseUrl}${endpoint}`;

      // Make the API call
      const response = await axios.post(fullUrl, passwordData, {
        headers: {
          Authorization: `JWT ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Success
      setSuccessMessage("Password changed successfully");
      setShowConfirmModal(false);

      // Clear form
      setPassword("");
      setPasswordRepeated("");

      // Show success message briefly then redirect
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change password:", error);

      // Handle different error types
      let errorMessage = "Failed to change password";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "API endpoint not found. Please contact support.";
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
          setTimeout(() => {
            navigate("/login?unauthorized=true");
          }, 2000);
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to change this password.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setErrors({ general: errorMessage });
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      setModalJustOpened(true);
      setShowConfirmModal(true);
      // Clear the flag after a short delay
      setTimeout(() => {
        setModalJustOpened(false);
      }, 500);
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    // Don't close if modal just opened or if submitting
    if (modalJustOpened || isSubmitting) {
      return;
    }
    setShowConfirmModal(false);
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
            onChange={(value) => setPassword(value)}
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
            onChange={(value) => setPasswordRepeated(value)}
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
        onClose={handleModalClose}
        title="Confirm Password Change"
        footer={
          <>
            <Button
              onClick={() => !isSubmitting && setShowConfirmModal(false)}
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
          {customer && (
            <p
              style={{
                margin: "0 0 15px 0",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {customer.firstName} {customer.lastName} ({customer.email})
            </p>
          )}
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            Make sure the customer can access their account with the new
            password.
          </p>

          {/* Show any errors in the modal */}
          {errors.general && (
            <Alert type="error" style={{ marginTop: "15px" }}>
              {errors.general}
            </Alert>
          )}
        </div>
      </Modal>
    </div>
  );
}

function AdminCustomerDetailMoreChangePasswordPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreChangePasswordPage />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreChangePasswordPageWithProvider;
