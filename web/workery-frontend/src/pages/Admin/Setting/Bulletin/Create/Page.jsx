// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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

function SettingBulletinCreatePage() {
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    text: "",
    howDidYouHearAboutUsID: "",
    status: 1, // Default to active
  });

  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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

    try {
      setIsLoading(true);
      setError(null);

      // Prepare submission data
      const submissionData = {
        text: formData.text.trim(),
        status: parseInt(formData.status),
      };

      // Add optional fields if provided
      if (formData.howDidYouHearAboutUsID) {
        submissionData.howDidYouHearAboutUsID = parseInt(
          formData.howDidYouHearAboutUsID,
        );
      }

      // Create bulletin
      const createdBulletin = await bulletinManager.createBulletin(
        submissionData,
        onUnauthorized,
      );

      setSuccessMessage("Bulletin created successfully!");

      // Redirect to detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/settings/bulletin/${createdBulletin.id}/detail`);
      }, 1500);
    } catch (err) {
      console.error("Failed to create bulletin:", err);

      // Handle validation errors from server
      if (typeof err === "object" && err !== null) {
        setErrors(err);
        setError("Please correct the errors below");
      } else {
        setError(err.message || "Failed to create bulletin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (formData.text.trim() || formData.howDidYouHearAboutUsID) {
      if (
        window.confirm(
          "Are you sure you want to cancel? Any unsaved changes will be lost.",
        )
      ) {
        navigate("/admin/settings/bulletins");
      }
    } else {
      navigate("/admin/settings/bulletins");
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

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          { path: "/admin/settings/bulletins", label: "Bulletins", icon: "📰" },
          { label: "Create", icon: "➕" },
        ]}
      />

      <Card title="➕ Create New Bulletin">
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
        {isLoading && <Loading message="Creating bulletin..." />}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ opacity: isLoading ? 0.6 : 1 }}>
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
              disabled={isLoading}
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
                disabled={isLoading}
              />

              <Select
                label="How did you hear about us?"
                name="howDidYouHearAboutUsID"
                value={formData.howDidYouHearAboutUsID}
                onChange={handleInputChange}
                options={howHearOptions}
                error={errors.howDidYouHearAboutUsID}
                disabled={isLoading}
              />
            </div>

            {/* Form Info */}
            <div
              style={{
                padding: "15px",
                backgroundColor: theme.colors.infoBg,
                borderRadius: "4px",
                marginBottom: "20px",
                fontSize: "14px",
                color: "#0c5460",
              }}
            >
              <strong>📝 Note:</strong> The bulletin will be visible to all
              users once created. Make sure the content is appropriate and
              accurate.
            </div>

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
                to="/admin/settings/bulletins"
                style={{
                  textDecoration: "none",
                  color: theme.colors.secondary,
                  fontSize: "14px",
                }}
              >
                ← Back to Bulletins
              </Link>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="success"
                  disabled={isLoading || !formData.text.trim()}
                >
                  {isLoading ? "Creating..." : "✅ Create Bulletin"}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </Card>

      {/* Help Section */}
      <Card
        title="💡 Tips for Creating Bulletins"
        style={{ marginTop: "30px" }}
      >
        <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
          <ul style={{ marginLeft: "20px" }}>
            <li>Keep bulletin text clear and concise</li>
            <li>Use simple language that all users can understand</li>
            <li>Include important dates or deadlines if applicable</li>
            <li>Proofread your content before submitting</li>
            <li>Consider the audience and ensure the message is relevant</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

export default SettingBulletinCreatePage;
