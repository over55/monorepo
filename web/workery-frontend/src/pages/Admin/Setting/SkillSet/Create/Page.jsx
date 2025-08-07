// File Path: web/workery-frontend/src/pages/Admin/Setting/SkillSet/Create/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSkillSetManager } from "../../../../../services/Services";
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

function SettingSkillSetCreatePage() {
  const skillSetManager = useSkillSetManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    description: "",
    status: 1, // Active by default
    insuranceRequirement: 1, // None by default
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

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    } else if (formData.category.length > 127) {
      newErrors.category = "Category must be less than 127 characters";
    }

    if (!formData.subCategory.trim()) {
      newErrors.subCategory = "Sub-category is required";
    } else if (formData.subCategory.length > 127) {
      newErrors.subCategory = "Sub-category must be less than 127 characters";
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
      const skillSetData = {
        category: formData.category.trim(),
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        status: formData.status,
        insuranceRequirement: formData.insuranceRequirement,
      };

      console.log(
        "SkillSetCreatePage: Submitting skill set creation:",
        skillSetData,
      );

      const createdSkillSet = await skillSetManager.createSkillSet(
        skillSetData,
        onUnauthorized,
      );

      console.log("SkillSetCreatePage: Skill set created successfully");
      navigate(`/admin/settings/skill-set/${createdSkillSet.id}/detail`);
    } catch (error) {
      console.error("SkillSetCreatePage: Failed to create skill set:", error);
      setErrors({ submit: error.message || "Failed to create skill set" });
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
    return <Loading message="Creating Skill Set..." />;
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
            label: "Skill Sets",
            path: "/admin/settings/skill-sets",
            icon: "🎓",
          },
          { label: "Create", icon: "➕" },
        ]}
      />

      <Card title="🎓 Create New Skill Set">
        {errors.submit && <Alert type="error">{errors.submit}</Alert>}

        <form onSubmit={handleSubmit}>
          {/* Basic Information Section */}
          <div style={styles.formSection}>
            <h2 style={styles.sectionTitle}>ℹ️ Basic Information</h2>
            <hr style={{ marginBottom: "15px" }} />

            <div style={styles.formGrid}>
              <Input
                label="Category"
                value={formData.category}
                onChange={(e) => handleFieldChange("category", e.target.value)}
                placeholder="Enter skill set category"
                error={errors.category}
                required
                disabled={isLoading}
              />

              <Input
                label="Sub-Category"
                value={formData.subCategory}
                onChange={(e) =>
                  handleFieldChange("subCategory", e.target.value)
                }
                placeholder="Enter skill set sub-category"
                error={errors.subCategory}
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

              <Select
                label="Insurance Requirement"
                value={formData.insuranceRequirement}
                onChange={(e) =>
                  handleFieldChange(
                    "insuranceRequirement",
                    parseInt(e.target.value),
                  )
                }
                options={[
                  { value: 1, label: "None" },
                  { value: 2, label: "Commercial General Liability" },
                  { value: 3, label: "WSIB" },
                ]}
                error={errors.insuranceRequirement}
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
                  Choose a clear and descriptive category and sub-category
                </li>
                <li>
                  Categories should represent broad skill areas (e.g.,
                  "Electrical", "Plumbing")
                </li>
                <li>
                  Sub-categories should be more specific (e.g., "Residential
                  Wiring", "Commercial Installation")
                </li>
                <li>
                  Use the description to provide additional context or
                  requirements
                </li>
                <li>
                  Select appropriate insurance requirements based on the skill
                  set risk level
                </li>
                <li>
                  Skill sets help categorize associate abilities and job
                  requirements
                </li>
              </ul>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div style={styles.actionButtons}>
            <Link to="/admin/settings/skill-sets">
              <Button variant="secondary">← Back</Button>
            </Link>
            <Button type="submit" variant="success" disabled={isLoading}>
              {isLoading ? "Creating..." : "✓ Create Skill Set"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default SettingSkillSetCreatePage;
