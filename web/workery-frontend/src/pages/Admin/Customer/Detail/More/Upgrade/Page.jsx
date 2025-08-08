// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Upgrade/Page.jsx

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
  Input,
  Select,
  FormGroup,
} from "../../../../../../components/UI";

function AdminCustomerDetailMoreUpgradePage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();

  const [customer, setCustomer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Organization type options (matching the old CLIENT_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS)
  const organizationTypeOptions = [
    { value: "", label: "Please select" },
    { value: "1", label: "Private Corporation" },
    { value: "2", label: "Non-Profit Corporation" },
    { value: "3", label: "Partnership" },
    { value: "4", label: "Sole Proprietorship" },
    { value: "5", label: "Government" },
    { value: "6", label: "Other" },
  ];

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchCustomer = async () => {
      if (!cid) {
        setErrors({ general: "Customer ID is required" });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const customerData = await customerManager.getCustomerDetail(
          cid,
          onUnauthorized,
        );

        if (mounted) {
          setCustomer(customerData);
          setErrors({});
        }
      } catch (error) {
        console.error("Failed to fetch customer:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load customer details" });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCustomer();

    return () => {
      mounted = false;
    };
  }, [cid, customerManager]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    // Validate form
    const newErrors = {};
    if (!organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!organizationType) {
      newErrors.organizationType = "Organization type is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare upgrade data in snake_case format as expected by the API
      const upgradeData = {
        customer_id: cid,
        organization_name: organizationName.trim(),
        organization_type: parseInt(organizationType),
      };

      await customerManager.upgradeCustomer(upgradeData, onUnauthorized);

      // Show success message
      setSuccessMessage("Customer upgraded successfully");

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upgrade customer:", error);
      setErrors(error || { general: "Failed to upgrade customer" });

      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setOrganizationName("");
    setOrganizationType("");
    setErrors({});
  };

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/customers", label: "Customers", icon: "👤" },
    { path: `/admin/customer/${cid}/more`, label: "Detail (More)", icon: "ℹ️" },
    { label: "Upgrade", icon: "🏢" },
  ];

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading customer details..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ fontSize: "32px", marginBottom: "10px" }}>👤 Customer</h1>
      <h2 style={{ fontSize: "24px", marginBottom: "20px", color: "#666" }}>
        ℹ️ Detail
      </h2>

      {/* Page banner alerts */}
      {customer?.status === 2 && <Alert type="info">Archived</Alert>}
      {customer?.isBanned && <Alert type="error">Customer is Banned</Alert>}

      {successMessage && <Alert type="success">{successMessage}</Alert>}

      <Card title="🏢 Upgrade Customer">
        {errors.general && <Alert type="error">{errors.general}</Alert>}

        {/* Warning message about the upgrade */}
        <Alert type="warning">
          <div style={{ marginBottom: "10px" }}>
            <strong>⚠️ Warning</strong>
          </div>
          <p>
            You are about to <strong>upgrade</strong> this customer from{" "}
            <em>Residential</em> type into <em>Business</em>. This will affect
            the rates, associates and terms the customer will now be applied.
            Are you sure you want to continue?
          </p>
        </Alert>

        <form onSubmit={handleSubmit}>
          <FormGroup>
            <Input
              label="Organization Name"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              error={errors.organizationName}
              required
              placeholder="Enter organization name"
              disabled={isSubmitting}
              name="organizationName"
            />
          </FormGroup>

          <FormGroup>
            <Select
              label="Organization Type"
              value={organizationType}
              onChange={(e) => setOrganizationType(e.target.value)}
              options={organizationTypeOptions}
              error={errors.organizationType}
              required
              disabled={isSubmitting}
              name="organizationType"
            />
          </FormGroup>

          {/* Action buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "30px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to={`/admin/customer/${cid}/more`}>
                <Button variant="secondary" disabled={isSubmitting}>
                  ← Back to Detail
                </Button>
              </Link>

              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset Form
              </Button>
            </div>

            <Button
              type="submit"
              variant="danger"
              disabled={
                isSubmitting || !organizationName.trim() || !organizationType
              }
            >
              {isSubmitting ? "Upgrading..." : "✓ Confirm and Upgrade"}
            </Button>
          </div>
        </form>

        {/* Customer info display for reference */}
        {customer && (
          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
              border: "1px solid #dee2e6",
            }}
          >
            <h4 style={{ margin: "0 0 10px 0", color: "#333" }}>
              Customer Information
            </h4>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              <strong>Name:</strong> {customer.firstName} {customer.lastName}
            </p>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              <strong>Email:</strong> {customer.email}
            </p>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              <strong>Current Type:</strong>{" "}
              {customer.typeOf === 1
                ? "Unassigned"
                : customer.typeOf === 2
                  ? "Residential"
                  : "Commercial"}
            </p>
            <p style={{ margin: "5px 0", fontSize: "14px" }}>
              <strong>Status:</strong>{" "}
              {customer.status === 1 ? "Active" : "Archived"}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerDetailMoreUpgradePage;
