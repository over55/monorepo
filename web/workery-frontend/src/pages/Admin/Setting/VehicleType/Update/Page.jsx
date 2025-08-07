// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
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

function SettingVehicleTypeUpdatePage() {
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: 1,
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchVehicleTypeDetail = async (vehicleTypeId) => {
    setIsFetching(true);
    setErrors({});

    try {
      const vehicleTypeData = await vehicleTypeManager.getVehicleTypeDetail(
        vehicleTypeId,
        onUnauthorized,
      );

      // Populate form fields
      setFormData({
        name: vehicleTypeData.name || "",
        description: vehicleTypeData.description || "",
        status: vehicleTypeData.status || 1,
      });

      console.log(
        "VehicleTypeUpdatePage: Vehicle type detail loaded for editing:",
        {
          id: vehicleTypeData.id,
          name: vehicleTypeData.name,
        },
      );
    } catch (error) {
      console.error(
        "VehicleTypeUpdatePage: Failed to fetch vehicle type detail:",
        error,
      );
      setErrors({
        fetch: error.message || "Failed to load vehicle type details",
      });
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
        "VehicleTypeUpdatePage: Submitting vehicle type update:",
        vehicleTypeData,
      );

      await vehicleTypeManager.updateVehicleType(
        id,
        vehicleTypeData,
        onUnauthorized,
      );

      console.log("VehicleTypeUpdatePage: Vehicle type updated successfully");
      navigate(`/admin/settings/vehicle-type/${id}/detail`);
    } catch (error) {
      console.error(
        "VehicleTypeUpdatePage: Failed to update vehicle type:",
        error,
      );
      setErrors({ submit: error.message || "Failed to update vehicle type" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!id || typeof id !== "string" || id.trim() === "") {
        setErrors({ vehicleTypeId: "Invalid vehicle type ID" });
        return;
      }

      fetchVehicleTypeDetail(id);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  if (isFetching) {
    return <Loading message="Loading Vehicle Type for Editing..." />;
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
          {
            label: "Detail",
            path: `/admin/settings/vehicle-type/${id}/detail`,
            icon: "ℹ️",
          },
          { label: "Update", icon: "✏️" },
        ]}
      />

      <Card title="🚗 Update Vehicle Type">
        {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
        {errors.submit && <Alert type="error">{errors.submit}</Alert>}
        {errors.vehicleTypeId && (
          <Alert type="error">{errors.vehicleTypeId}</Alert>
        )}

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
                <li>
                  Changing the status to "Inactive" will hide it from new
                  selections
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to={`/admin/settings/vehicle-type/${id}/detail`}>
              <Button variant="secondary">← Back</Button>
            </Link>
            <Button type="submit" variant="success" disabled={isLoading}>
              {isLoading ? "Saving..." : "✓ Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SettingVehicleTypeUpdatePage;
