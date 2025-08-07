// File Path: web/workery-frontend/src/pages/Admin/Setting/Tag/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useTagManager } from "../../../../../services/Services";
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

function SettingTagCreatePage() {
  const tagManager = useTagManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    text: "",
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

    if (!formData.text.trim()) {
      newErrors.text = "Tag text is required";
    } else if (formData.text.length > 100) {
      newErrors.text = "Tag text must be less than 100 characters";
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
      const tagData = {
        text: formData.text.trim(),
        description: formData.description.trim(),
        status: formData.status,
      };

      console.log("TagCreatePage: Submitting tag creation:", tagData);

      const createdTag = await tagManager.createTag(tagData, onUnauthorized);

      console.log("TagCreatePage: Tag created successfully");
      navigate(`/admin/settings/tag/${createdTag.id}/detail`);
    } catch (error) {
      console.error("TagCreatePage: Failed to create tag:", error);
      setErrors({ submit: error.message || "Failed to create tag" });
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
    return <Loading message="Creating Tag..." />;
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
            label: "Tags",
            path: "/admin/settings/tags",
            icon: "🏷️",
          },
          { label: "Create", icon: "➕" },
        ]}
      />

      <Card title="🏷️ Create New Tag">
        {errors.submit && <Alert type="error">{errors.submit}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>ℹ️ Basic Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.formGrid}>
              <Input
                label="Text"
                value={formData.text}
                onChange={(e) => handleFieldChange("text", e.target.value)}
                placeholder="Enter tag text"
                error={errors.text}
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
                <li>Choose a clear and descriptive text for the tag</li>
                <li>The text should be unique and easily recognizable</li>
                <li>
                  Use the description to provide additional context or details
                </li>
                <li>
                  Tags help categorize and organize content throughout the
                  system
                </li>
                <li>Keep tag text concise for better usability</li>
              </ul>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/admin/settings/tags">
              <Button variant="secondary">← Back</Button>
            </Link>
            <Button type="submit" variant="success" disabled={isLoading}>
              {isLoading ? "Creating..." : "✓ Create Tag"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SettingTagCreatePage;
