// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;

function AdminAssociateDetailLitePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate data
  const fetchAssociate = async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    try {
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(associateData);
    } catch (err) {
      console.error("Failed to fetch associate:", err);
      setError("Failed to load associate details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [aid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", icon: "ℹ️" },
  ];

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "-";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Format email for display
  const formatEmail = (email) => {
    if (!email) return "-";
    return (
      <a href={`mailto:${email}`} style={{ color: theme.colors.primary }}>
        {email}
      </a>
    );
  };

  // Format tags for display
  const formatTags = (tags) => {
    if (!tags || tags.length === 0) return "-";
    return tags.map((tag) => tag.text).join(", ");
  };

  // Format skill sets for display
  const formatSkillSets = (skillSets) => {
    if (!skillSets || skillSets.length === 0) return "-";
    return skillSets.map((skill) => skill.subCategory).join(", ");
  };

  // Format address for display
  const formatAddress = (associate) => {
    if (!associate) return "-";
    const address =
      associate.fullAddressWithPostalCode ||
      `${associate.addressLine1 || ""} ${associate.city || ""} ${associate.region || ""} ${associate.postalCode || ""}`.trim();

    if (associate.fullAddressUrl) {
      return (
        <a
          href={associate.fullAddressUrl}
          target="_blank"
          rel="noreferrer"
          style={{ color: theme.colors.primary }}
        >
          {address} 🔗
        </a>
      );
    }
    return address;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Format score rating
  const formatScoreRating = (score) => {
    if (!score) return "-";
    const stars = "⭐".repeat(Math.floor(score));
    return `${stars} (${score}/5)`;
  };

  if (loading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading associate details..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
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
          <h1 style={{ margin: 0 }}>👷 Associate</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <Alert type="info">📁 This associate is archived</Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {/* Header with Actions */}
        {associate && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0 }}>📋 Summary</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link to={`/admin/associate/${aid}/edit`}>
                <Button variant="warning" disabled={associate.status === 2}>
                  ✏️ Edit
                </Button>
              </Link>
            </div>
          </div>
        )}

        {associate && (
          <>
            {/* Tab Navigation */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                marginBottom: "30px",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                Summary
              </div>
              <Link
                to={`/admin/associate/${associate.id}/detail`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Detail
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/orders`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Orders
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/comments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Comments
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/attachments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Attachments
              </Link>
              <Link
                to={`/admin/associate/${associate.id}/more`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                More ⋯
              </Link>
            </div>

            {/* Associate Summary Layout */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  window.innerWidth <= 768 ? "1fr" : "256px 1fr",
                gap: "20px",
                marginBottom: "30px",
              }}
            >
              {/* Avatar Column (Desktop only) */}
              {window.innerWidth > 768 && (
                <div style={{ textAlign: "center" }}>
                  <img
                    src={
                      associate.avatarObjectUrl &&
                      associate.avatarObjectUrl !== ""
                        ? associate.avatarObjectUrl
                        : "/img/placeholder.png"
                    }
                    alt={
                      associate.avatarObjectUrl
                        ? "Profile Picture"
                        : "No Profile Picture"
                    }
                    style={{
                      width: "256px",
                      height: "256px",
                      borderRadius: "25px",
                      objectFit: "cover",
                    }}
                  />
                </div>
              )}

              {/* Associate Information */}
              <Card style={{ backgroundColor: theme.colors.light }}>
                <div style={{ marginBottom: "20px" }}>
                  {/* Mobile Avatar */}
                  {window.innerWidth <= 768 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "15px",
                      }}
                    >
                      <img
                        src={
                          associate.avatarObjectUrl &&
                          associate.avatarObjectUrl !== ""
                            ? associate.avatarObjectUrl
                            : "/img/placeholder.png"
                        }
                        alt={
                          associate.avatarObjectUrl
                            ? "Profile Picture"
                            : "No Profile Picture"
                        }
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "10px",
                          objectFit: "cover",
                          marginRight: "15px",
                        }}
                      />
                    </div>
                  )}

                  {/* Associate Name/Organization */}
                  {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                    <h2 style={{ margin: "0 0 10px 0", fontSize: "28px" }}>
                      🏢 {associate.organizationName}
                    </h2>
                  )}
                  <h3 style={{ margin: "0 0 10px 0", fontSize: "24px" }}>
                    {associate.type === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID &&
                      "🏠 "}
                    {associate.name ||
                      `${associate.firstName} ${associate.lastName}`}
                  </h3>

                  {/* Address */}
                  <p
                    style={{
                      margin: "0 0 20px 0",
                      color: theme.colors.secondary,
                      fontSize: "16px",
                    }}
                  >
                    📍 {formatAddress(associate)}
                  </p>
                </div>

                {/* Contact Information */}
                <div style={{ display: "grid", gap: "15px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>✉️</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Email:
                    </span>
                    <span>{formatEmail(associate.email)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>📞</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Phone:
                    </span>
                    <span>
                      {associate.phone ? (
                        <a
                          href={`tel:${associate.phone}`}
                          style={{ color: theme.colors.primary }}
                        >
                          {formatPhone(associate.phone)}
                        </a>
                      ) : (
                        "-"
                      )}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🏷️</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Tags:
                    </span>
                    <span>{formatTags(associate.tags)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>🎓</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Skills:
                    </span>
                    <span>{formatSkillSets(associate.skillSets)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>⭐</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Rating:
                    </span>
                    <span>{formatScoreRating(associate.score)}</span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>📝</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Notes:
                    </span>
                    <div>
                      {associate.commercialInsuranceExpiryDate && (
                        <div>
                          • Commercial Insurance Expiry:{" "}
                          {formatDate(associate.commercialInsuranceExpiryDate)}
                        </div>
                      )}
                      {associate.wsibInsuranceDate && (
                        <div>
                          • WSIB Expiry:{" "}
                          {formatDate(associate.wsibInsuranceDate)}
                        </div>
                      )}
                      {associate.isJobSeeker ===
                        ASSOCIATE_IS_JOB_SEEKER_YES && (
                        <div>• Job seeker - looking for employment</div>
                      )}
                      {!associate.commercialInsuranceExpiryDate &&
                        !associate.wsibInsuranceDate &&
                        associate.isJobSeeker !==
                          ASSOCIATE_IS_JOB_SEEKER_YES && <span>-</span>}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span style={{ fontSize: "16px" }}>📊</span>
                    <span style={{ fontWeight: "600", minWidth: "80px" }}>
                      Status:
                    </span>
                    <span
                      style={{
                        color:
                          associate.status === 1
                            ? theme.colors.success
                            : theme.colors.secondary,
                        fontWeight: "600",
                      }}
                    >
                      {associate.status === 1 ? "Active" : "Archived"}
                    </span>
                  </div>

                  {associate.publicId && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <span style={{ fontSize: "16px" }}>🆔</span>
                      <span style={{ fontWeight: "600", minWidth: "80px" }}>
                        ID:
                      </span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          backgroundColor: "#f0f0f0",
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        {associate.publicId}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to="/admin/associates">
                <Button variant="outline">← Back to Associates</Button>
              </Link>

              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <Link to={`/admin/associate/${aid}/edit`}>
                  <Button variant="warning" disabled={associate.status === 2}>
                    ✏️ Edit
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!associate && !loading && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h3>Associate Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "30px" }}>
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <Button variant="primary">← Back to Associates</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateDetailLitePage;
