// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
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
  FormGroup,
} from "../../../../../components/UI";

function SettingBulletinUpdatePage() {
  const { id } = useParams();
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    text: "",
    howDidYouHearAboutUsID: "",
    status: 1,
  });

  // Component state
  const [originalBulletin, setOriginalBulletin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletin data
  const loadBulletin = async () => {
    if (!id) {
      setError("Bulletin ID is required");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const bulletinData = await bulletinManager.getBulletinDetail(
        id,
        onUnauthorized,
      );

      setOriginalBulletin(bulletinData);
      setFormData({
        text: bulletinData.text || "",
        howDidYouHearAboutUsID: bulletinData.howDidYouHearAboutUsID || "",
        status: bulletinData.status || 1,
      });
    } catch (err) {
      console.error("Failed to load bulletin:", err);
      setError(err.message || "Failed to load bulletin details");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadBulletin();
  }, [id]);

  // Check for changes
  useEffect(() => {
    if (originalBulletin) {
      const hasFormChanges =
        formData.text !== (originalBulletin.text || "") ||
        formData.howDidYouHearAboutUsID !==
          (originalBulletin.howDidYouHearAboutUsID || "") ||
        formData.status !== (originalBulletin.status || 1);

      setHasChanges(hasFormChanges);
    }
  }, [formData, originalBulletin]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Validate text (required)
    if (!formData.text.trim()) {
      newErrors.text = "Bulletin text is required";
    } else if (formData.text.length > 1000) {
      newErrors.text = "Bulletin text must be less than 1000 characters";
    }

    // Validate status
    if (!formData.status) {
      newErrors.status = "Status is required";
    }

    // Validate howDidYouHearAboutUsID (optional, but if provided must be valid)
    if (
      formData.howDidYouHearAboutUsID &&
      isNaN(formData.howDidYouHearAboutUsID)
    ) {
      newErrors.howDidYouHearAboutUsID = "Invalid source selection";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please correct the errors below");
      return;
    }

    if (!hasChanges) {
      setError("No changes detected");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      // Prepare submission data
      const submissionData = {
        id: id,
        text: formData.text.trim(),
        status: parseInt(formData.status),
      };

      // Add optional fields if provided
      if (formData.howDidYouHearAboutUsID) {
        submissionData.howDidYouHearAboutUsID = parseInt(
          formData.howDidYouHearAboutUsID,
        );
      }

      // Update bulletin
      const updatedBulletin = await bulletinManager.updateBulletin(
        id,
        submissionData,
        onUnauthorized,
      );

      setSuccessMessage("Bulletin updated successfully!");
      setOriginalBulletin(updatedBulletin);
      setHasChanges(false);

      // Optionally redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/bulletin/${id}/detail`);
      }, 1500);
    } catch (err) {
      console.error("Failed to update bulletin:", err);

      // Handle validation errors from server
      if (typeof err === "object" && err !== null) {
        setErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to update bulletin");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate(`/admin/settings/bulletin/${id}/detail`);
      }
    } else {
      navigate(`/admin/settings/bulletin/${id}/detail`);
    }
  };

  // Handle reset form
  const handleReset = () => {
    if (originalBulletin) {
      setFormData({
        text: originalBulletin.text || "",
        howDidYouHearAboutUsID: originalBulletin.howDidYouHearAboutUsID || "",
        status: originalBulletin.status || 1,
      });
      setErrors({});
      setError(null);
    }
  };

  // Status options
  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 2, label: "Archived" },
  ];

  // How did you hear about us options (example data)
  const howHearOptions = [
    { value: "", label: "Select source (optional)" },
    { value: 1, label: "Search Engine" },
    { value: 2, label: "Social Media" },
    { value: 3, label: "Word of Mouth" },
    { value: 4, label: "Advertisement" },
    { value: 5, label: "Other" },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading bulletin details..." />
      </div>
    );
  }

  // Error state
  if (error && !originalBulletin) {
    return (
      <div style={globalStyles.container}>
        <Alert type="error">{error}</Alert>
        <div style={{ marginTop: "20px" }}>
          <Link to="/admin/settings/bulletins">← Back to Bulletins</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          { path: "/admin/settings/bulletins", label: "Bulletins", icon: "📰" },
          {
            path: `/admin/settings/bulletin/${id}/detail`,
            label: "Detail",
            icon: "📋",
          },
          { label: "Edit", icon: "✏️" },
        ]}
      />

      <Card
        title="✏️ Edit Bulletin"
        actions={
          hasChanges && (
            <div
              style={{
                fontSize: "12px",
                color: theme.colors.warning,
                fontWeight: "bold",
              }}
            >
              ⚠️ Unsaved changes
            </div>
          )
        }
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert type="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Loading Overlay */}
        {isSaving && <Loading message="Updating bulletin..." />}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ opacity: isSaving ? 0.6 : 1 }}>
            {/* Bulletin Text */}
            <TextArea
              label="Bulletin Text"
              name="text"
              value={formData.text}
              onChange={handleInputChange}
              error={errors.text}
              required
              rows={6}
              maxLength={1000}
              placeholder="Enter the bulletin text..."
              disabled={isSaving}
            />

            {/* Optional Fields */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <Select
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={statusOptions}
                error={errors.status}
                required
                disabled={isSaving}
              />

              <Select
                label="How did you hear about us?"
                name="howDidYouHearAboutUsID"
                value={formData.howDidYouHearAboutUsID}
                onChange={handleInputChange}
                options={howHearOptions}
                error={errors.howDidYouHearAboutUsID}
                disabled={isSaving}
              />
            </div>

            {/* Original vs Current Comparison */}
            {hasChanges && originalBulletin && (
              <Card title="📋 Change Summary" style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "14px" }}>
                  <div style={{ marginBottom: "15px" }}>
                    <strong>Original Text:</strong>
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#ffe6e6",
                        borderRadius: "4px",
                        marginTop: "5px",
                        fontStyle: "italic",
                      }}
                    >
                      {originalBulletin.text}
                    </div>
                  </div>
                  <div>
                    <strong>New Text:</strong>
                    <div
                      style={{
                        padding: "10px",
                        backgroundColor: "#e6ffe6",
                        borderRadius: "4px",
                        marginTop: "5px",
                      }}
                    >
                      {formData.text}
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Form Actions */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "15px",
                paddingTop: "20px",
                borderTop: "1px solid #eee",
              }}
            >
              <Link
                to={`/admin/settings/bulletin/${id}/detail`}
                style={{
                  textDecoration: "none",
                  color: theme.colors.secondary,
                  fontSize: "14px",
                }}
              >
                ← Back to Bulletin Detail
              </Link>

              <div style={{ display: "flex", gap: "10px" }}>
                {hasChanges && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={handleReset}
                    disabled={isSaving}
                    size="sm"
                  >
                    🔄 Reset
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  disabled={isSaving || !formData.text.trim() || !hasChanges}
                >
                  {isSaving ? "Updating..." : "✅ Update Bulletin"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      {/* Metadata Information */}
      {originalBulletin && (
        <Card title="📊 Bulletin Metadata" style={{ marginTop: "30px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              fontSize: "14px",
            }}
          >
            <div>
              <strong>Created:</strong>
              <br />
              {originalBulletin.createdAt
                ? new Date(originalBulletin.createdAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>Created By:</strong>
              <br />
              {originalBulletin.createdByUserName || "System"}
            </div>
            <div>
              <strong>Last Modified:</strong>
              <br />
              {originalBulletin.modifiedAt
                ? new Date(originalBulletin.modifiedAt).toLocaleString()
                : "N/A"}
            </div>
            <div>
              <strong>Modified By:</strong>
              <br />
              {originalBulletin.modifiedByUserName || "N/A"}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SettingBulletinUpdatePage;
