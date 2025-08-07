// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
} from "../../../../../components/UI";

function SettingVehicleTypeCreatePage() {
  const vehicleTypeManager = useVehicleTypeManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: 1, // Active by default
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
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
      newErrors.name = "Vehicle type name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Vehicle type name must be less than 100 characters";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Description must be less than 500 characters";
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
      const vehicleTypeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      console.log(
        "VehicleTypeCreatePage: Submitting vehicle type creation:",
        vehicleTypeData,
      );

      const createdVehicleType = await vehicleTypeManager.createVehicleType(
        vehicleTypeData,
        onUnauthorized,
      );

      console.log("VehicleTypeCreatePage: Vehicle type created successfully");
      navigate(`/admin/settings/vehicle-type/${createdVehicleType.id}/detail`);
    } catch (error) {
      console.error(
        "VehicleTypeCreatePage: Failed to create vehicle type:",
        error,
      );
      setErrors({ submit: error.message || "Failed to create vehicle type" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <Loading message="Creating Vehicle Type..." />;
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
    helpText: {
      fontSize: "12px",
      color: "#666",
      marginTop: "4px",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Settings", path: "/admin/settings", icon: "⚙️" },
          {
            label: "Vehicle Types",
            path: "/admin/settings/vehicle-types",
            icon: "🚗",
          },
          { label: "Create", icon: "➕" },
        ]}
      />

      <Card title="🚗 Create New Vehicle Type">
        {errors.submit && <Alert type="error">{errors.submit}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>ℹ️ Basic Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.formGrid}>
              <Input
                label="Name"
                value={formData.name}
                onChange={(e) => handleFieldChange("name", e.target.value)}
                placeholder="Enter vehicle type name"
                error={errors.name}
                required
                disabled={isLoading}
              />

              <TextArea
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                placeholder="Enter description (optional)"
                rows={4}
                maxLength={500}
                error={errors.description}
                disabled={isLoading}
              />

              <Select
                label="Status"
                value={formData.status}
                onChange={(e) =>
                  handleFieldChange("status", parseInt(e.target.value))
                }
                options={[
                  { value: 1, label: "Active" },
                  { value: 2, label: "Inactive" },
                ]}
                error={errors.status}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Guidelines Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>📋 Guidelines</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "4px",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: "20px" }}>
                <li>
                  Choose a clear and descriptive name for the vehicle type
                </li>
                <li>The name should be unique and easily recognizable</li>
                <li>
                  Use the description to provide additional context or details
                </li>
                <li>
                  Vehicle types help categorize and organize associate vehicles
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/admin/settings/vehicle-types">
              <Button variant="secondary">← Back</Button>
            </Link>
            <Button type="submit" variant="success" disabled={isLoading}>
              {isLoading ? "Creating..." : "✓ Create Vehicle Type"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SettingVehicleTypeCreatePage;
