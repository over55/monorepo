// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Avatar/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useStaffManager } from "../../../../../../services/Services";
import { theme } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";

function AdminStaffDetailMoreAvatarPage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [staff, setStaff] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchStaffDetail = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const response = await staffManager.getStaffDetail(aid, onUnauthorized);
        if (mounted) {
          setStaff(response);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff detail:", error);
          setErrors(error);
          window.scrollTo(0, 0);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    window.scrollTo(0, 0);
    fetchStaffDetail();

    return () => {
      mounted = false;
    };
  }, [aid]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("staff_id", aid);
      formData.append("file", selectedFile);

      await staffManager.uploadStaffAvatar(formData, onUnauthorized);

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail (More)", path: `/admin/staff/${aid}/more`, icon: "ℹ️" },
    { label: "Avatar", icon: "📷" },
  ];

  // Render loading state
  if (isFetching) {
    return (
      <div style={{ padding: "20px" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Loading message="Loading staff details..." />
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2rem", marginBottom: "5px" }}>
            👔 Staff Member
          </h1>
          <h4 style={{ fontSize: "1.2rem", color: "#666", margin: 0 }}>
            📷 Change Photo
          </h4>
        </div>
      </div>

      {/* Success message */}
      {showSuccessMessage && (
        <Alert type="success" onClose={() => setShowSuccessMessage(false)}>
          Photo changed successfully! Redirecting...
        </Alert>
      )}

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error">
          {typeof errors === "string" ? (
            errors
          ) : errors.message ? (
            errors.message
          ) : (
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          )}
        </Alert>
      )}

      {/* Main Card */}
      <Card>
        <h3 style={{ fontSize: "1.3rem", marginBottom: "20px" }}>
          📷 Upload New Photo
        </h3>

        {staff && (
          <div>
            <div
              style={{
                backgroundColor: "#fff3cd",
                padding: "20px",
                borderRadius: "8px",
                border: "1px solid #ffc107",
                marginBottom: "30px",
              }}
            >
              <p style={{ margin: 0, lineHeight: "1.6" }}>
                <strong>Warning:</strong> Submitting a new uploaded file will
                replace the previous photo.
              </p>
            </div>

            {selectedFile ? (
              <div
                style={{
                  backgroundColor: "#d4edda",
                  padding: "20px",
                  borderRadius: "8px",
                  border: "1px solid #28a745",
                  marginBottom: "30px",
                }}
              >
                <p style={{ margin: 0, color: "#155724" }}>
                  ✓ File ready to upload: <strong>{selectedFile.name}</strong>
                </p>
              </div>
            ) : (
              <div style={{ marginBottom: "30px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    fontWeight: "600",
                  }}
                >
                  Select Photo File
                </label>
                <input
                  name="file"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    width: "100%",
                    maxWidth: "400px",
                  }}
                />
              </div>
            )}

            {/* Bottom Navigation */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "30px",
                paddingTop: "20px",
                borderTop: "1px solid #e0e0e0",
              }}
            >
              <Link to={`/admin/staff/${aid}/more`}>
                <Button variant="secondary">← Back to Detail</Button>
              </Link>

              <Button
                variant="success"
                onClick={handleSubmit}
                disabled={isSubmitting || !selectedFile}
              >
                {isSubmitting ? "Uploading..." : <>✓ Save Photo</>}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailMoreAvatarPage;
