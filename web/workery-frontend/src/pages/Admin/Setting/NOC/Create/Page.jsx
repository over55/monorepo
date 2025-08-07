// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/Create/Page.jsx

import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { theme, globalStyles } from "../../../../../constants/Theme";
import { Card, Button, Alert, Breadcrumb } from "../../../../../components/UI";

function SettingNOCCreatePage() {
  const navigate = useNavigate();

  // Redirect to search page after a delay if user doesn't take action
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/admin/settings/noc/search");
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "NOC Search", path: "/admin/settings/noc/search", icon: "🎓" },
    { label: "Create", icon: "➕" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            ➕ Create NOC
          </h1>
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            National Occupational Classification creation
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/settings/noc/search")}
        >
          ← Back to NOC Search
        </Button>
      </div>

      <Alert type="info">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
          <div style={{ fontSize: "24px" }}>ℹ️</div>
          <div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              NOC Creation Not Available
            </h3>
            <p
              style={{
                margin: "0 0 15px 0",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              National Occupational Classifications (NOCs) are standardized
              reference data maintained by Employment and Social Development
              Canada (ESDC). These cannot be created or modified within this
              system.
            </p>
          </div>
        </div>
      </Alert>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {/* Information Card */}
        <Card title="🎓 About NOC System">
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <p>
              The National Occupational Classification (NOC) is Canada's
              national system for describing occupations. It is developed and
              maintained by Employment and Social Development Canada (ESDC) in
              collaboration with Statistics Canada.
            </p>
            <h4 style={{ margin: "20px 0 10px 0", color: "#333" }}>
              Key Features:
            </h4>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Over 30,000 job titles organized into 500 unit groups</li>
              <li>Hierarchical structure based on skill level and type</li>
              <li>Standardized descriptions and requirements</li>
              <li>Updated regularly by government officials</li>
            </ul>
          </div>
        </Card>

        {/* Alternative Actions */}
        <Card title="🔧 Available Actions">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <h4 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
                What you can do instead:
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <Button
                  variant="primary"
                  onClick={() => navigate("/admin/settings/noc/search")}
                  fullWidth
                >
                  🔍 Search NOC Database
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/settings/skill-sets/create")}
                  fullWidth
                >
                  🎯 Create Skill Set Instead
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/settings/tags/create")}
                  fullWidth
                >
                  🏷️ Create Tag Instead
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open("https://noc.esdc.gc.ca", "_blank")
                  }
                  fullWidth
                >
                  🌐 Visit Official NOC Website
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Help Card */}
        <Card title="💡 Need Custom Classifications?">
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <p>
              If you need to create custom job classifications or skill
              categories for your organization, consider using these
              alternatives:
            </p>
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  backgroundColor: theme.colors.successBg,
                  padding: "15px",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  border: `1px solid ${theme.colors.success}`,
                }}
              >
                <strong>✅ Skill Sets:</strong> Create custom skill categories
                and requirements that can be associated with work orders and
                associates.
              </div>
              <div
                style={{
                  backgroundColor: theme.colors.infoBg,
                  padding: "15px",
                  borderRadius: "4px",
                  border: `1px solid ${theme.colors.info}`,
                }}
              >
                <strong>🏷️ Tags:</strong> Create flexible labels and categories
                for organizing and filtering various types of content.
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card title="📞 Need Help?">
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <p>
              If you need assistance with NOC classifications or have questions
              about how to properly use them in your workflow:
            </p>
            <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
              <li>Contact your system administrator</li>
              <li>Review the NOC user guide</li>
              <li>Visit the official NOC website for detailed information</li>
            </ul>
            <div style={{ marginTop: "15px" }}>
              <Button
                variant="info"
                size="sm"
                onClick={() => navigate("/help")}
              >
                📚 View Help Documentation
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Auto-redirect notice */}
      <Card style={{ marginTop: "20px" }}>
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            backgroundColor: theme.colors.warningBg,
            borderRadius: "4px",
            border: `1px solid ${theme.colors.warning}`,
          }}
        >
          <p
            style={{ margin: "0 0 10px 0", fontSize: "14px", color: "#856404" }}
          >
            ⏰ You will be automatically redirected to the NOC search page in a
            few seconds.
          </p>
          <Button
            variant="warning"
            size="sm"
            onClick={() => navigate("/admin/settings/noc/search")}
          >
            Go Now
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default SettingNOCCreatePage;
