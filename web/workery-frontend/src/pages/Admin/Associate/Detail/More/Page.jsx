// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useAssociateManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3; // Commercial type
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2; // Residential type

function AdminAssociateDetailMorePage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState(null);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate details on mount
  useEffect(() => {
    fetchAssociateDetail();
    window.scrollTo(0, 0);
  }, [aid]);

  const fetchAssociateDetail = async () => {
    try {
      setFetching(true);
      const data = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(data);
    } catch (error) {
      console.error("Failed to fetch associate:", error);
      setErrors({ general: "Failed to load associate details" });
    } finally {
      setFetching(false);
    }
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    {
      path: `/admin/associate/${aid}`,
      label: "Detail",
      icon: "📋",
    },
    { label: "More", icon: "⋯" },
  ];

  // Tab items
  const tabs = [
    { path: `/admin/associate/${aid}`, label: "Summary" },
    { path: `/admin/associate/${aid}/detail`, label: "Detail" },
    { path: `/admin/associate/${aid}/orders`, label: "Orders" },
    { path: `/admin/associate/${aid}/comments`, label: "Comments" },
    { path: `/admin/associate/${aid}/attachments`, label: "Attachments" },
    { path: `/admin/associate/${aid}/more`, label: "More...", active: true },
  ];

  // Action card component
  const ActionCard = ({
    title,
    subtitle,
    icon,
    path,
    bgColor,
    disabled = false,
  }) => {
    const cardStyle = {
      padding: "20px",
      borderRadius: "8px",
      backgroundColor: disabled ? "#cccccc" : bgColor,
      color: "white",
      textAlign: "center",
      cursor: disabled ? "not-allowed" : "pointer",
      transition: "transform 0.2s, box-shadow 0.2s",
      minHeight: "150px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      textDecoration: "none",
      opacity: disabled ? 0.6 : 1,
    };

    const content = (
      <div
        style={cardStyle}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>{icon}</div>
        <h3
          style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "5px" }}
        >
          {title}
        </h3>
        <p style={{ fontSize: "14px", opacity: 0.9 }}>{subtitle}</p>
      </div>
    );

    if (disabled) {
      return content;
    }

    return (
      <Link to={path} style={{ textDecoration: "none" }}>
        {content}
      </Link>
    );
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {associate && associate.status === 2 && (
        <Alert type="info">This associate is archived</Alert>
      )}

      <h1>👷 Associate - More Actions</h1>

      <Card title="More Actions ⋯">
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {errors.general && <Alert type="error">{errors.general}</Alert>}

            {associate && (
              <>
                {/* Simple tabs */}
                <div style={{ marginBottom: "30px" }}>
                  <div
                    style={{
                      borderBottom: "2px solid #ddd",
                      display: "flex",
                      gap: "20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {tabs.map((tab) => (
                      <Link
                        key={tab.path}
                        to={tab.path}
                        style={{
                          padding: "10px",
                          textDecoration: "none",
                          color: tab.active ? theme.colors.primary : "#666",
                          borderBottom: tab.active
                            ? `2px solid ${theme.colors.primary}`
                            : "none",
                          fontWeight: tab.active ? "bold" : "normal",
                        }}
                      >
                        {tab.label}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Action Cards Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(250px, 1fr))",
                    gap: "20px",
                    marginBottom: "30px",
                  }}
                >
                  {/* Photo Upload - Only for active associates */}
                  {associate.status === 1 && (
                    <ActionCard
                      title="Photo"
                      subtitle="Upload a photo of the associate"
                      icon="📸"
                      path={`/admin/associate/${aid}/avatar`}
                      bgColor="#dc3545"
                    />
                  )}

                  {/* Archive/Unarchive */}
                  {associate.status === 2 ? (
                    <ActionCard
                      title="Unarchive"
                      subtitle="Make associate visible in list and search results"
                      icon="📦"
                      path={`/admin/associate/${aid}/unarchive`}
                      bgColor="#28a745"
                    />
                  ) : (
                    <ActionCard
                      title="Archive"
                      subtitle="Make associate hidden from list and search results"
                      icon="🗄️"
                      path={`/admin/associate/${aid}/archive`}
                      bgColor="#28a745"
                    />
                  )}

                  {/* Upgrade/Downgrade - Only for active associates */}
                  {associate.status === 1 && (
                    <>
                      {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ||
                      associate.typeOf === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                        <ActionCard
                          title="Downgrade"
                          subtitle="Change associate to become residential associate"
                          icon="🏠"
                          path={`/admin/associate/${aid}/downgrade`}
                          bgColor="#17a2b8"
                        />
                      ) : (
                        <ActionCard
                          title="Upgrade"
                          subtitle="Change associate to become commercial associate"
                          icon="🏢"
                          path={`/admin/associate/${aid}/upgrade`}
                          bgColor="#17a2b8"
                        />
                      )}
                    </>
                  )}

                  {/* Delete - Only for active associates */}
                  {associate.status === 1 && (
                    <ActionCard
                      title="Delete"
                      subtitle="Permanently delete this associate and all data"
                      icon="🗑️"
                      path={`/admin/associate/${aid}/permadelete`}
                      bgColor="#dc3545"
                    />
                  )}

                  {/* Password - Only for active associates */}
                  {associate.status === 1 && (
                    <ActionCard
                      title="Password"
                      subtitle="Change or reset the associate's password"
                      icon="🔑"
                      path={`/admin/associate/${aid}/change-password`}
                      bgColor="#dc3545"
                    />
                  )}

                  {/* 2FA - Only for active associates */}
                  {associate.status === 1 && (
                    <ActionCard
                      title="2FA"
                      subtitle="Enable or disable two-factor authentication"
                      icon="📱"
                      path={`/admin/associate/${aid}/change-2fa`}
                      bgColor="#343a40"
                    />
                  )}

                  {/* Ban/Unban - Only for active associates */}
                  {associate.status === 1 && (
                    <>
                      {associate.isBanned ? (
                        <ActionCard
                          title="Unban"
                          subtitle="Remove ban and restore access"
                          icon="✅"
                          path={`/admin/associate/${aid}/unban`}
                          bgColor="#28a745"
                        />
                      ) : (
                        <ActionCard
                          title="Ban"
                          subtitle="Ban associate from accessing the system"
                          icon="🚫"
                          path={`/admin/associate/${aid}/ban`}
                          bgColor="#dc3545"
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Information Alert */}
                <Alert type="info">
                  <strong>Note:</strong> Some actions are only available for
                  active associates. Archived associates must be unarchived
                  first before performing other actions.
                </Alert>

                {/* Bottom Navigation */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                    marginTop: "30px",
                  }}
                >
                  <Link to="/admin/associates">
                    <Button variant="secondary">← Back to Associates</Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateDetailMorePage;
