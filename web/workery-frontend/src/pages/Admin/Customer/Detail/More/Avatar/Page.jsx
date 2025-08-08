// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Avatar/Page.jsx

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
  FormGroup,
} from "../../../../../../components/UI";

function AdminCustomerDetailMoreAvatarPage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
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

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setErrors({}); // Clear any previous errors
  };

  // Handle avatar upload
  const handleUploadAvatar = async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // Validate file selection
      if (!selectedFile) {
        setErrors({ file: "Please select a file to upload" });
        setIsSubmitting(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("customer_id", cid);
      formData.append("file", selectedFile);

      // Using callback-based approach for consistency
      await customerManager.uploadCustomerAvatarWithCallbacks(
        formData,
        (response) => {
          // Success callback
          setSuccessMessage("Photo changed successfully");

          // Show success message briefly then redirect
          setTimeout(() => {
            navigate(`/admin/customer/${cid}/more`);
          }, 2000);
        },
        (error) => {
          // Error callback
          console.error("Failed to upload avatar:", error);
          setErrors(error);
        },
        () => {
          // Done callback
          setIsSubmitting(false);
        },
        onUnauthorized,
      );
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setErrors({ general: "Failed to upload avatar" });
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUploadAvatar();
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
    { label: "Avatar", icon: "🖼️" },
  ];

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

      <Card title="🖼️ Change Photo">
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
        <Alert type="warning" style={{ marginBottom: "20px" }}>
          <strong>Warning:</strong> Submitting with new uploaded file will
          delete previous upload.
        </Alert>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            {selectedFile ? (
              <Alert type="success">
                ✅ File ready to upload: {selectedFile.name}
              </Alert>
            ) : (
              <>
                <label style={globalStyles.label}>
                  <strong>File (Optional)</strong>
                </label>
                <input
                  type="file"
                  name="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                  }}
                />
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "5px" }}
                >
                  Accepted formats: JPG, PNG, GIF. Maximum size: 10MB.
                </div>
              </>
            )}
          </FormGroup>

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
              type="submit"
              variant="success"
              disabled={isSubmitting || !selectedFile}
              style={{ minWidth: "200px" }}
            >
              {isSubmitting ? "Uploading..." : "💾 Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminCustomerDetailMoreAvatarPage;
