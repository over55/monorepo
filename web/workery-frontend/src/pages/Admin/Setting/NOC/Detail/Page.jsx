// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/Detail/Page.jsx

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

// Component to render the elements table grouped by type
function ElementsDisplay({ elements }) {
  if (!elements || !Array.isArray(elements) || elements.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        No elements available
      </div>
    );
  }

  try {
    // Group elements by type
    const groupedElements = elements.reduce((acc, element) => {
      if (!acc[element.type]) {
        acc[element.type] = [];
      }
      acc[element.type].push(element.description.trim());
      return acc;
    }, {});

    return (
      <div>
        {Object.entries(groupedElements).map(([type, descriptions]) => (
          <div key={type} style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "200px 1fr",
                gap: "15px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  padding: "10px",
                  backgroundColor: theme.colors.light,
                  borderRadius: "4px",
                }}
              >
                {type}
              </div>
              <div style={{ padding: "10px 0" }}>
                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                  {descriptions.map((description, index) => (
                    <li
                      key={index}
                      style={{ marginBottom: "5px", lineHeight: "1.5" }}
                    >
                      {description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  } catch (error) {
    console.error("Error rendering elements:", error);
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
        Error displaying elements
      </div>
    );
  }
}

// Component to render a NOC section (Unit Group, Major Group, etc.)
function NOCSection({ title, data, fields }) {
  return (
    <Card title={title}>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {fields.map((field) => (
          <div key={field.key}>
            <label style={{ ...globalStyles.label, marginBottom: "5px" }}>
              {field.label}
            </label>
            <div
              style={{
                fontSize: field.key === "code" ? "16px" : "14px",
                fontWeight: field.key === "code" ? "600" : "normal",
                fontFamily: field.key === "code" ? "monospace" : "inherit",
                lineHeight: field.key.includes("description") ? "1.6" : "1.4",
                color: field.key.includes("description") ? "#555" : "#333",
              }}
            >
              {data[field.key] || "Not specified"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SettingNOCDetailPage() {
  const { id } = useParams();
  const nocManager = useNOCManager();
  const navigate = useNavigate();

  // Component state
  const [noc, setNoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchNOCDetail = async () => {
    if (!id) {
      setError("NOC ID is required");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

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

  useEffect(() => {
    fetchNOCDetail();
  }, [id]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "NOC Search", path: "/admin/settings/noc/search", icon: "🎓" },
    { label: noc?.code || "Detail", icon: "🔍" },
  ];

  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading NOC details..." />
      </div>
    );
  }

  if (error && !noc) {
    return (
      <div style={globalStyles.container}>
        <Breadcrumb items={breadcrumbItems} />
        <Alert type="error">
          {error}
          <div style={{ marginTop: "15px" }}>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/settings/noc/search")}
            >
              ← Back to NOC Search
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  const unitGroupFields = [
    { key: "code", label: "Code" },
    { key: "unitGroupTitle", label: "Title" },
    { key: "unitGroupDescription", label: "Description" },
  ];

  const broadCategoryFields = [
    { key: "broadCategoryCode", label: "Code" },
    { key: "broadCategoryTitle", label: "Title" },
    { key: "broadCategoryDescription", label: "Description" },
  ];

  const majorGroupFields = [
    { key: "majorGroupCode", label: "Code" },
    { key: "majorGroupTitle", label: "Title" },
    { key: "majorGroupDescription", label: "Description" },
  ];

  const subMinorGroupFields = [
    { key: "subMinorGroupCode", label: "Code" },
    { key: "subMinorGroupTitle", label: "Title" },
    { key: "subMinorGroupDescription", label: "Description" },
  ];

  const minorGroupFields = [
    { key: "minorGroupCode", label: "Code" },
    { key: "minorGroupTitle", label: "Title" },
    { key: "minorGroupDescription", label: "Description" },
  ];

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
            🎓 NOC Details
          </h1>
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
                fontSize: "18px",
                fontWeight: "bold",
                backgroundColor: theme.colors.primary,
                color: "white",
                padding: "6px 12px",
                borderRadius: "4px",
              }}
            >
              {noc?.code}
            </div>
            <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
              {noc?.unitGroupTitle}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/settings/noc/search")}
          >
            ← Back to Search
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* NOC Information Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Unit Group Information */}
        <NOCSection title="📋 Unit Group" data={noc} fields={unitGroupFields} />

        {/* Elements Section */}
        {noc?.elements && noc.elements.length > 0 && (
          <Card title="🔧 Elements">
            <ElementsDisplay elements={noc.elements} />
          </Card>
        )}

        {/* Classification Hierarchy */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "20px",
          }}
        >
          {/* Broad Category */}
          {noc?.broadCategoryCode && (
            <NOCSection
              title="🏢 Broad Category"
              data={noc}
              fields={broadCategoryFields}
            />
          )}

          {/* Major Group */}
          {noc?.majorGroupCode && (
            <NOCSection
              title="📊 Major Group"
              data={noc}
              fields={majorGroupFields}
            />
          )}

          {/* Sub-Minor Group */}
          {noc?.subMinorGroupCode && (
            <NOCSection
              title="📑 Sub-Minor Group"
              data={noc}
              fields={subMinorGroupFields}
            />
          )}

          {/* Minor Group */}
          {noc?.minorGroupCode && (
            <NOCSection
              title="📝 Minor Group"
              data={noc}
              fields={minorGroupFields}
            />
          )}
        </div>

        {/* NOC Hierarchy Visualization */}
        <Card title="🗂️ Classification Hierarchy">
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}
            >
              This shows the hierarchical structure of this NOC classification:
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              {noc?.broadCategoryCode && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      backgroundColor: theme.colors.primary,
                    }}
                  ></div>
                  <span style={{ fontWeight: "600" }}>Broad Category:</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {noc.broadCategoryCode}
                  </span>
                  <span>{noc.broadCategoryTitle}</span>
                </div>
              )}

              {noc?.majorGroupCode && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingLeft: "30px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      backgroundColor: theme.colors.secondary,
                    }}
                  ></div>
                  <span style={{ fontWeight: "600" }}>Major Group:</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {noc.majorGroupCode}
                  </span>
                  <span>{noc.majorGroupTitle}</span>
                </div>
              )}

              {noc?.subMinorGroupCode && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingLeft: "60px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      backgroundColor: theme.colors.info,
                    }}
                  ></div>
                  <span style={{ fontWeight: "600" }}>Sub-Minor Group:</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {noc.subMinorGroupCode}
                  </span>
                  <span>{noc.subMinorGroupTitle}</span>
                </div>
              )}

              {noc?.minorGroupCode && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    paddingLeft: "90px",
                  }}
                >
                  <div
                    style={{
                      width: "20px",
                      height: "2px",
                      backgroundColor: theme.colors.warning,
                    }}
                  ></div>
                  <span style={{ fontWeight: "600" }}>Minor Group:</span>
                  <span style={{ fontFamily: "monospace" }}>
                    {noc.minorGroupCode}
                  </span>
                  <span>{noc.minorGroupTitle}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  paddingLeft: "120px",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "2px",
                    backgroundColor: theme.colors.success,
                  }}
                ></div>
                <span style={{ fontWeight: "600" }}>Unit Group:</span>
                <span
                  style={{
                    fontFamily: "monospace",
                    backgroundColor: theme.colors.primary,
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "3px",
                  }}
                >
                  {noc?.code}
                </span>
                <span style={{ fontWeight: "600" }}>{noc?.unitGroupTitle}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Reference Information */}
        <Card title="ℹ️ Reference Information">
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <p>
              <strong>About NOC:</strong> The National Occupational
              Classification (NOC) is Canada's national system for describing
              occupations. It organizes over 30,000 job titles into 500 unit
              group categories based on skill level and skill type.
            </p>
            <p>
              <strong>This Classification:</strong> NOC {noc?.code} represents "
              {noc?.unitGroupTitle}" and falls under the {noc?.majorGroupTitle}{" "}
              major group category.
            </p>
            <div
              style={{
                display: "flex",
                gap: "20px",
                marginTop: "15px",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/settings/noc/search")}
              >
                🔍 Search More NOCs
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(
                    `https://noc.esdc.gc.ca/Structure/NocProfile?objectid=${noc?.code}`,
                    "_blank",
                  )
                }
              >
                🌐 View on NOC Website
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SettingNOCDetailPage;
