// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useNOCManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

function SettingNOCUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const nocManager = useNOCManager();

  const [noc, setNoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch NOC details to show what user was trying to edit
  useEffect(() => {
    const fetchNOCDetail = async () => {
      if (!id) {
        setError("NOC ID is required");
        setIsLoading(false);
        return;
      }

      try {
        const response = await nocManager.getNOCDetail(id, onUnauthorized);
        setNoc(response);
      } catch (err) {
        console.error("Failed to fetch NOC detail:", err);
        setError(err.message || "Failed to load NOC details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNOCDetail();

    // Redirect to detail page after a delay
    const timer = setTimeout(() => {
      if (id) {
        navigate(`/admin/settings/noc/${id}/detail`);
      } else {
        navigate("/admin/settings/noc/search");
      }
    }, 8000); // 8 seconds

    return () => clearTimeout(timer);
  }, [id, navigate]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "NOC Search", path: "/admin/settings/noc/search", icon: "🎓" },
    {
      label: noc?.code || "Edit",
      path: id
        ? `/admin/settings/noc/${id}/detail`
        : "/admin/settings/noc/search",
      icon: "🔍",
    },
    { label: "Edit", icon: "✏️" },
  ];

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading NOC details..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "20px",
          flexWrap: "wrap",
          gap: "15px",
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
            ✏️ Edit NOC
          </h1>
          {noc && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "15px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "16px",
                  fontWeight: "bold",
                  backgroundColor: theme.colors.primary,
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "4px",
                }}
              >
                {noc.code}
              </div>
              <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
                {noc.unitGroupTitle}
              </p>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {id && (
            <Button
              variant="outline"
              onClick={() => navigate(`/admin/settings/noc/${id}/detail`)}
            >
              ← Back to Details
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/noc/search")}
          >
            🔍 Search NOCs
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Alert type="warning">
        <div style={{ display: "flex", alignItems: "flex-start", gap: "15px" }}>
          <div style={{ fontSize: "24px" }}>⚠️</div>
          <div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
              NOC Editing Not Available
            </h3>
            <p
              style={{
                margin: "0 0 15px 0",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              National Occupational Classifications (NOCs) are official
              government reference data that cannot be modified within this
              system. These classifications are maintained by Employment and
              Social Development Canada.
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
        {/* Current NOC Information */}
        {noc && (
          <Card title="📋 Current NOC Information">
            <div
              style={{ display: "flex", flexDirection: "column", gap: "15px" }}
            >
              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Code
                </label>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    fontFamily: "monospace",
                    backgroundColor: "#f5f5f5",
                    padding: "8px 12px",
                    borderRadius: "4px",
                  }}
                >
                  {noc.code}
                </div>
              </div>

              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Unit Group Title
                </label>
                <div style={{ fontSize: "16px", fontWeight: "500" }}>
                  {noc.unitGroupTitle}
                </div>
              </div>

              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Description
                </label>
                <div
                  style={{ fontSize: "14px", lineHeight: "1.6", color: "#555" }}
                >
                  {noc.unitGroupDescription || "No description available"}
                </div>
              </div>

              <div>
                <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
                  Major Group
                </label>
                <div style={{ fontSize: "14px" }}>
                  {noc.majorGroupCode} - {noc.majorGroupTitle}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Why NOCs Can't Be Edited */}
        <Card title="🔒 Why NOCs Cannot Be Modified">
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <h4 style={{ margin: "0 0 15px 0", color: "#333" }}>
              Official Reference Data
            </h4>
            <p>
              NOCs are maintained as official reference standards by the
              Government of Canada to ensure consistency across all
              organizations and systems.
            </p>

            <h4 style={{ margin: "20px 0 10px 0", color: "#333" }}>
              Key Reasons:
            </h4>
            <ul style={{ paddingLeft: "20px" }}>
              <li>Standardization across all Canadian employers</li>
              <li>Legal and regulatory compliance requirements</li>
              <li>Integration with government systems and databases</li>
              <li>Ensures data consistency and comparability</li>
            </ul>

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: theme.colors.infoBg,
                borderRadius: "4px",
                border: `1px solid ${theme.colors.info}`,
              }}
            >
              <strong>💡 Tip:</strong> If you need custom job classifications,
              consider creating Skill Sets or Tags instead.
            </div>
          </div>
        </Card>

        {/* Alternative Actions */}
        <Card title="🛠️ Alternative Options">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            <div>
              <h4 style={{ margin: "0 0 15px 0", fontSize: "16px" }}>
                What you can do instead:
              </h4>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {id && (
                  <Button
                    variant="primary"
                    onClick={() => navigate(`/admin/settings/noc/${id}/detail`)}
                    fullWidth
                  >
                    👁️ View NOC Details
                  </Button>
                )}

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/settings/skill-sets/create")}
                  fullWidth
                >
                  🎯 Create Custom Skill Set
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/settings/tags/create")}
                  fullWidth
                >
                  🏷️ Create Custom Tag
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate("/admin/settings/noc/search")}
                  fullWidth
                >
                  🔍 Search Other NOCs
                </Button>
              </div>
            </div>

            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: theme.colors.successBg,
                borderRadius: "4px",
                border: `1px solid ${theme.colors.success}`,
              }}
            >
              <strong>✅ Recommended:</strong> Use Skill Sets to create custom
              categories that can be mapped to NOC classifications for your
              specific organizational needs.
            </div>
          </div>
        </Card>

        {/* Official Resources */}
        <Card title="📚 Official NOC Resources">
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <p>
              For official information about NOC classifications and updates:
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
                marginTop: "15px",
              }}
            >
              <Button
                variant="info"
                size="sm"
                onClick={() => window.open("https://noc.esdc.gc.ca", "_blank")}
                fullWidth
              >
                🌐 Official NOC Website
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    "https://noc.esdc.gc.ca/Structure/Matrix",
                    "_blank",
                  )
                }
                fullWidth
              >
                📊 NOC Matrix
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/help")}
                fullWidth
              >
                📖 System Help Guide
              </Button>
            </div>

            <div
              style={{
                marginTop: "20px",
                fontSize: "12px",
                color: "#888",
                borderTop: "1px solid #eee",
                paddingTop: "15px",
              }}
            >
              Last NOC update: 2021 version 1.0
              <br />
              Next scheduled update: As announced by ESDC
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
            ⏰ You will be automatically redirected to the NOC details in a few
            seconds.
          </p>
          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {id && (
              <Button
                variant="warning"
                size="sm"
                onClick={() => navigate(`/admin/settings/noc/${id}/detail`)}
              >
                View Details Now
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/settings/noc/search")}
            >
              Search NOCs
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default SettingNOCUpdatePage;
