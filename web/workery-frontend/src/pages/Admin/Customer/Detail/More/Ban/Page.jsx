// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Ban/Page.jsx

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
  Select,
} from "../../../../../../components/UI";

// Banning reason options (based on typical customer ban reasons)
const CUSTOMER_BANNING_REASON_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Abusive behavior" },
  { value: 3, label: "Fraudulent activity" },
  { value: 4, label: "Violation of terms of service" },
  { value: 5, label: "Non-payment of services" },
  { value: 6, label: "Harassment of staff or associates" },
  { value: 7, label: "Repeated policy violations" },
];

function AdminCustomerDetailMoreBanPage() {
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
  const [banningReason, setBanningReason] = useState("");
  const [banningReasonOther, setBanningReasonOther] = useState("");

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

    if (!banningReason) {
      newErrors.banningReason = "Please select a banning reason";
    }

    if (parseInt(banningReason) === 1 && !banningReasonOther.trim()) {
      newErrors.banningReasonOther = "Please specify the banning reason";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle ban customer
  const handleBanCustomer = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const banData = {
        customer_id: cid,
        banning_reason: parseInt(banningReason),
        banning_reason_other: banningReasonOther.trim(),
      };

      // Using callback-based approach for consistency
      await customerManager.banCustomerWithCallbacks(
        banData,
        (response) => {
          // Success callback
          setSuccessMessage("Customer banned successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);

          setShowConfirmModal(false);
        },
        (error) => {
          // Error callback
          console.error("Failed to ban customer:", error);
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
      console.error("Failed to ban customer:", error);
      setErrors({ general: "Failed to ban customer" });
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
    { label: "Ban", icon: "🚫" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banners */}
      {customer?.status === 2 && (
        <Alert type="info">Customer is archived</Alert>
      )}
      {customer?.isBanned && (
        <Alert type="error">Customer is already banned</Alert>
      )}

      {/* Page Title */}
      <h1 style={{ fontSize: "28px", marginBottom: "10px" }}>👤 Customer</h1>
      <h2 style={{ fontSize: "20px", color: "#666", marginBottom: "30px" }}>
        ℹ️ Detail (More)
      </h2>

      {/* Success message */}
      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card title="🚫 Ban Customer">
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
            You are about to <strong>ban</strong> this customer from our system.
            This means the customer will still appear in search results but will
            have the
            <em> banned banner displayed</em>. Are you sure you want to
            continue?
          </p>
        </Alert>

        <form onSubmit={handleSubmit}>
          {/* Banning Reason */}
          <Select
            label="Banning Reason"
            name="banningReason"
            value={banningReason}
            onChange={(e) => setBanningReason(e.target.value)}
            options={CUSTOMER_BANNING_REASON_OPTIONS}
            error={errors.banningReason}
            required
          />

          {/* Other Reason Text Field (shown when "Other" is selected) */}
          {parseInt(banningReason) === 1 && (
            <Input
              label="Banning Reason (Other)"
              name="banningReasonOther"
              value={banningReasonOther}
              onChange={(e) => setBanningReasonOther(e.target.value)}
              placeholder="Please write a short reason"
              error={errors.banningReasonOther}
              required
            />
          )}

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
              ← Back to Detail
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={isSubmitting}
              style={{ minWidth: "200px" }}
            >
              {isSubmitting ? "Processing..." : "Confirm and Ban"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Ban"
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
              onClick={handleBanCustomer}
              variant="danger"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Banning..." : "Ban Customer"}
            </Button>
          </>
        }
      >
        <div style={{ padding: "10px 0" }}>
          <p style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
            Are you absolutely sure you want to <strong>ban</strong> this
            customer?
          </p>
          <div
            style={{
              backgroundColor: "#f8f9fa",
              padding: "15px",
              borderRadius: "4px",
              marginBottom: "15px",
            }}
          >
            <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
              Banning Reason:{" "}
              {
                CUSTOMER_BANNING_REASON_OPTIONS.find(
                  (opt) => opt.value == banningReason,
                )?.label
              }
            </p>
            {parseInt(banningReason) === 1 && banningReasonOther && (
              <p style={{ margin: 0, fontStyle: "italic" }}>
                Additional Details: {banningReasonOther}
              </p>
            )}
          </div>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            This will mark the customer as banned and display a warning banner
            on their profile.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default AdminCustomerDetailMoreBanPage;
