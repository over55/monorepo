// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Detail/Page.jsx

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
  Modal,
} from "../../../../../components/UI";

function SettingVehicleTypeDetailPage() {
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchVehicleTypeDetail = async (vehicleTypeId) => {
    setIsLoading(true);
    setErrors({});

    try {
      const vehicleTypeData = await vehicleTypeManager.getVehicleTypeDetail(
        vehicleTypeId,
        onUnauthorized,
      );

      setVehicleType(vehicleTypeData);

      console.log(
        "VehicleTypeDetailPage: Vehicle type detail fetched successfully:",
        {
          id: vehicleTypeData.id,
          name: vehicleTypeData.name,
        },
      );
    } catch (error) {
      console.error(
        "VehicleTypeDetailPage: Failed to fetch vehicle type detail:",
        error,
      );
      setErrors({
        fetch: error.message || "Failed to load vehicle type details",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsLoading(true);

    try {
      await vehicleTypeManager.deleteVehicleType(id, onUnauthorized);
      console.log("VehicleTypeDetailPage: Vehicle type deleted successfully");
      navigate("/admin/settings/vehicle-types");
    } catch (error) {
      console.error(
        "VehicleTypeDetailPage: Failed to delete vehicle type:",
        error,
      );
      setErrors({ delete: error.message || "Failed to delete vehicle type" });
      window.scrollTo(0, 0);
      setShowDeleteModal(false);
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

  if (isLoading) {
    return <Loading message="Loading Vehicle Type Details..." />;
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
      minHeight: "20px",
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
          { label: "Detail", icon: "ℹ️" },
        ]}
      />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
      {errors.delete && <Alert type="error">{errors.delete}</Alert>}
      {errors.vehicleTypeId && (
        <Alert type="error">{errors.vehicleTypeId}</Alert>
      )}

      {vehicleType && (
        <Card
          title="🚗 Vehicle Type Details"
          actions={
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/vehicle-type/${id}/update`}>
                <Button variant="warning">✏️ Edit</Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isLoading}
              >
                🗑️ Delete
              </Button>
            </div>
          }
        >
          {/* Vehicle Type Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>🚗 Vehicle Type Information</h2>
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
            </div>
          </div>

          {/* System Information */}
          <div style={styles.detailSection}>
            <h2 style={styles.sectionTitle}>⚙️ System Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.detailGrid}>
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

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Created From:</label>
                <div style={styles.detailValue}>
                  {vehicleType.createdFromIpAddress || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified At:</label>
                <div style={styles.detailValue}>
                  {vehicleType.modifiedAt
                    ? new Date(vehicleType.modifiedAt).toLocaleString()
                    : "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified By:</label>
                <div style={styles.detailValue}>
                  {vehicleType.modifiedByUserName || "N/A"}
                </div>
              </div>

              <div style={styles.detailItem}>
                <label style={styles.detailLabel}>Modified From:</label>
                <div style={styles.detailValue}>
                  {vehicleType.modifiedFromIpAddress || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/admin/settings/vehicle-types">
              <Button variant="secondary">← Back to List</Button>
            </Link>
            <div style={styles.rightActions}>
              <Link to={`/admin/settings/vehicle-type/${id}/update`}>
                <Button variant="warning">✏️ Edit</Button>
              </Link>
              <Button
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                disabled={isLoading}
              >
                🗑️ Delete
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!vehicleType && !isLoading && (
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

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Confirm and Delete"}
            </Button>
          </>
        }
      >
        <div>
          <p>
            Are you sure you want to delete the vehicle type "
            <strong>{vehicleType?.name}</strong>"?
          </p>
          <p style={{ color: "#dc3545", fontWeight: "500" }}>
            This action cannot be undone and will permanently remove this
            vehicle type from the system.
          </p>
        </div>
      </Modal>
    </div>
  );
}

export default SettingVehicleTypeDetailPage;
