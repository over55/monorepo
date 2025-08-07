// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Delete/Page.jsx

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
} from "../../../../../components/UI";

function SettingVehicleTypeDeletePage() {
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [vehicleType, setVehicleType] = useState(null);

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

      setVehicleType(vehicleTypeData);

      console.log(
        "VehicleTypeDeletePage: Vehicle type detail loaded for deletion:",
        {
          id: vehicleTypeData.id,
          name: vehicleTypeData.name,
        },
      );
    } catch (error) {
      console.error(
        "VehicleTypeDeletePage: Failed to fetch vehicle type detail:",
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

  const handleDeleteConfirm = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      await vehicleTypeManager.deleteVehicleType(id, onUnauthorized);

      console.log("VehicleTypeDeletePage: Vehicle type deleted successfully");
      navigate("/admin/settings/vehicle-types");
    } catch (error) {
      console.error(
        "VehicleTypeDeletePage: Failed to delete vehicle type:",
        error,
      );
      setErrors({ delete: error.message || "Failed to delete vehicle type" });
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
    return <Loading message="Loading Vehicle Type for Deletion..." />;
  }

  const styles = {
    detailSection: {
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
    detailGrid: {
      display: "grid",
      gap: "15px",
      gridTemplateColumns: "1fr",
      maxWidth: "600px",
    },
    detailItem: {
      display: "flex",
      flexDirection: "column",
    },
    detailLabel: {
      fontWeight: "bold",
      marginBottom: "5px",
      fontSize: "14px",
      color: "#333",
    },
    detailValue: {
      padding: "10px",
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      fontSize: "14px",
      color: "#666",
    },
    warningSection: {
      backgroundColor: "#fff3cd",
      border: "1px solid #ffeaa7",
      borderRadius: "4px",
      padding: "20px",
      marginBottom: "30px",
    },
    warningTitle: {
      color: "#856404",
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    warningText: {
      color: "#856404",
      lineHeight: "1.5",
    },
    actionButtons: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "40px",
      flexWrap: "wrap",
      gap: "10px",
    },
    rightActions: {
      display: "flex",
      gap: "10px",
      flexWrap: "wrap",
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
          { label: "Delete", icon: "🗑️" },
        ]}
      />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
      {errors.delete && <Alert type="error">{errors.delete}</Alert>}
      {errors.vehicleTypeId && (
        <Alert type="error">{errors.vehicleTypeId}</Alert>
      )}

      {vehicleType && (
        <Card title="🗑️ Delete Vehicle Type">
          {/* Warning Section */}
          <div style={styles.warningSection}>
            <div style={styles.warningTitle}>
              ⚠️ Warning: Permanent Deletion
            </div>
            <div style={styles.warningText}>
              <p>
                You are about to permanently delete this vehicle type. This
                action cannot be undone.
              </p>
              <p>
                <strong>Important considerations:</strong>
              </p>
              <ul style={{ margin: "10px 0", paddingLeft: "20px" }}>
                <li>
                  This vehicle type will be completely removed from the system
                </li>
                <li>
                  Any associates currently assigned to this vehicle type may be
                  affected
                </li>
                <li>
                  Historical records referencing this vehicle type will still
                  exist but may show as "Deleted"
                </li>
                <li>
                  You will not be able to recover this vehicle type once deleted
                </li>
              </ul>
              <p>Please ensure you want to proceed with this deletion.</p>
            </div>
          </div>

          {/* Vehicle Type Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>🚗 Vehicle Type to be Deleted</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Name:</label>
                <div style={styles.detailValue}>
                  {vehicleType.name || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Description:</label>
                <div style={styles.detailValue}>
                  {vehicleType.description || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Status:</label>
                <div style={styles.detailValue}>
                  {vehicleType.status === 1 ? "Active" : "Inactive"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created At:</label>
                <div style={styles.detailValue}>
                  {vehicleType.createdAt
                    ? new Date(vehicleType.createdAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created By:</label>
                <div style={styles.detailValue}>
                  {vehicleType.createdByUserName || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to={`/admin/settings/vehicle-type/${id}/detail`}>
              <Button variant="secondary">← Cancel</Button>
            </Link>
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/vehicle-type/${id}/update`}>
                <Button variant="warning">✏️ Edit Instead</Button>
              </Link>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "🗑️ Confirm and Delete"}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!vehicleType && !isFetching && (
        <Card>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h2>Vehicle Type Not Found</h2>
            <p>The requested vehicle type could not be found.</p>
            <Link to="/admin/settings/vehicle-types">
              <Button variant="primary">← Back to Vehicle Types List</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SettingVehicleTypeDeletePage;
