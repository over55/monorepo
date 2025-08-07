// File Path: web/workery-frontend/src/pages/Root/Tenant/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
} from "../../../../components/UI";

function RootTenantUpdatePage() {
  const { tid } = useParams();
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    alternateName: "",
    description: "",
    schemaName: "",
    addressLocality: "",
    addressRegion: "",
    addressCountry: "",
    email: "",
    telephone: "",
    streetAddress: "",
    streetAddressExtra: "",
    postalCode: "",
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenantDetail = async (tenantId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );

      // Populate form fields
      setFormData({
        name: tenantData.name || "",
        alternateName: tenantData.alternateName || "",
        description: tenantData.description || "",
        schemaName: tenantData.schemaName || "",
        addressCountry: tenantData.addressCountry || "",
        addressRegion: tenantData.addressRegion || "",
        addressLocality: tenantData.addressLocality || "",
        postalCode: tenantData.postalCode || "",
        email: tenantData.email || "",
        telephone: tenantData.telephone || "",
        streetAddress: tenantData.streetAddress || "",
        streetAddressExtra: tenantData.streetAddressExtra || "",
      });

      console.log("RootTenantUpdatePage: Tenant detail loaded for editing:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error(
        "RootTenantUpdatePage: Failed to fetch tenant detail:",
        error,
      );
      setErrors({ fetch: error.message || "Failed to load tenant details" });
      window.scrollTo(0, 0);
    } finally {
      setIsFetching(false);
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo(0, 0);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const tenantData = {
        name: formData.name.trim(),
        alternateName: formData.alternateName.trim(),
        description: formData.description.trim(),
        schemaName: formData.schemaName.trim(),
        addressLocality: formData.addressLocality.trim(),
        addressRegion: formData.addressRegion.trim(),
        addressCountry: formData.addressCountry.trim(),
        email: formData.email.trim(),
        telephone: formData.telephone.trim(),
        streetAddress: formData.streetAddress.trim(),
        streetAddressExtra: formData.streetAddressExtra.trim(),
        postalCode: formData.postalCode.trim(),
        state: 1, // Active state
      };

      console.log(
        "RootTenantUpdatePage: Submitting tenant update:",
        tenantData,
      );

      await tenantManager.updateTenant(tid, tenantData, onUnauthorized);

      console.log("RootTenantUpdatePage: Tenant updated successfully");
      navigate(`/root/tenant/${tid}`);
    } catch (error) {
      console.error("RootTenantUpdatePage: Failed to update tenant:", error);
      setErrors({ submit: error.message || "Failed to update tenant" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      if (!tid || typeof tid !== "string" || tid.trim() === "") {
        setErrors({ tenantId: "Invalid tenant ID" });
        return;
      }

      fetchTenantDetail(tid);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

  if (isFetching) {
    return <Loading message="Loading Tenant for Editing..." />;
  }

  const styles = {
    formSection: {
      marginBottom: "30px",
    },
    sectionTitle: {
      fontSize: "18px",
      marginBottom: "15px",
      color: theme.colors.secondary,
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    formGrid: {
      display: "grid",
      gap: "15px",
      gridTemplateColumns: "1fr",
      maxWidth: "600px",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "40px",
      flexWrap: "wrap",
      gap: "10px",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Root Dashboard", path: "/root/dashboard", icon: "📊" },
          { label: "Tenants", path: "/root/tenants", icon: "🏢" },
          { label: "Detail", path: `/root/tenant/${tid}`, icon: "ℹ️" },
          { label: "Update", icon: "✏️" },
        ]}
      />

      <Card title="🏢 Update Tenant">
        {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
        {errors.submit && <Alert type="error">{errors.submit}</Alert>}
        {errors.tenantId && <Alert type="error">{errors.tenantId}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Identification Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>🆔 Identification</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.formGrid}>
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Enter tenant name"
                error={errors.name}
                required
                disabled={isLoading}
              />

              <Input
                label="Alternate Name"
                value={formData.alternateName}
                onChange={(e) =>
                  handleFieldChange("alternateName", e.target.value)
                }
                placeholder="Enter alternate name"
                error={errors.alternateName}
                disabled={isLoading}
              />

              <TextArea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Enter description (max 500 characters)"
                rows={4}
                maxLength={500}
                error={errors.description}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Contact Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>📞 Contact</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.formGrid}>
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                placeholder="Enter email address"
                error={errors.email}
                disabled={isLoading}
              />

              <Input
                label="Telephone"
                type="tel"
                value={formData.telephone}
                onChange={(e) => handleFieldChange("telephone", e.target.value)}
                placeholder="Enter telephone number"
                error={errors.telephone}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Address Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>📍 Address</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.formGrid}>
              <Select
                label="Country"
                value={formData.addressCountry}
                onChange={(e) =>
                  handleFieldChange("addressCountry", e.target.value)
                }
                options={[
                  { value: "", label: "Select Country" },
                  { value: "CA", label: "Canada" },
                  { value: "US", label: "United States" },
                  { value: "MX", label: "Mexico" },
                ]}
                error={errors.addressCountry}
                disabled={isLoading}
              />

              <Input
                label="Province/Territory"
                value={formData.addressRegion}
                onChange={(e) =>
                  handleFieldChange("addressRegion", e.target.value)
                }
                placeholder="Enter province/state/region"
                error={errors.addressRegion}
                disabled={isLoading}
              />

              <Input
                label="City"
                value={formData.addressLocality}
                onChange={(e) =>
                  handleFieldChange("addressLocality", e.target.value)
                }
                placeholder="Enter city"
                error={errors.addressLocality}
                disabled={isLoading}
              />

              <Input
                label="Street Address"
                value={formData.streetAddress}
                onChange={(e) =>
                  handleFieldChange("streetAddress", e.target.value)
                }
                placeholder="Enter street address"
                error={errors.streetAddress}
                disabled={isLoading}
              />

              <Input
                label="Address (Extra line)"
                value={formData.streetAddressExtra}
                onChange={(e) =>
                  handleFieldChange("streetAddressExtra", e.target.value)
                }
                placeholder="Enter additional address info (optional)"
                error={errors.streetAddressExtra}
                disabled={isLoading}
              />

              <Input
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) =>
                  handleFieldChange("postalCode", e.target.value)
                }
                placeholder="Enter postal/zip code"
                error={errors.postalCode}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to={`/root/tenant/${tid}`}>
              <Button variant="secondary">← Back</Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Saving..." : "✓ Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default RootTenantUpdatePage;
