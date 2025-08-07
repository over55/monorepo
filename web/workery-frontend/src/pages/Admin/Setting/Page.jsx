// File Path: web/workery-frontend/src/pages/Admin/Setting/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAccountManager,
  useTenantManager,
} from "../../../services/Services";
import { theme, globalStyles } from "../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
} from "../../../components/UI";

function SettingDashboardPage() {
  const accountManager = useAccountManager();
  const tenantManager = useTenantManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [showTaxSettingModal, setShowTaxSettingModal] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchCurrentUser = async () => {
    try {
      const userData = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(userData);
      return userData;
    } catch (error) {
      console.error("Settings: Failed to fetch current user:", error);
      setErrors({ user: error.message || "Failed to load user details" });
      throw error;
    }
  };

  const fetchTenantDetail = async (tenantId) => {
    try {
      const tenantData = await tenantManager.getTenantDetail(
        tenantId,
        onUnauthorized,
      );
      setTenant(tenantData);
      console.log("Settings: Tenant detail fetched successfully:", {
        id: tenantData.id,
        name: tenantData.name,
      });
    } catch (error) {
      console.error("Settings: Failed to fetch tenant:", error);
      setErrors({ tenant: error.message || "Failed to load tenant details" });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (!mounted) return;

      setIsLoading(true);
      setErrors({});

      try {
        // First get current user
        const userData = await fetchCurrentUser();

        if (!mounted) return;

        // Then get tenant details using user's tenant ID
        if (userData && userData.tenantId) {
          await fetchTenantDetail(userData.tenantId);
        } else {
          setErrors({ tenant: "User does not have a valid tenant ID" });
        }
      } catch (error) {
        console.error("Settings: Failed to initialize data:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    window.scrollTo(0, 0);
    initializeData();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading) {
    return <Loading message="Loading Settings..." />;
  }

  const styles = {
    settingsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px",
      marginTop: "20px",
    },
    settingCard: {
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      overflow: "hidden",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    cardHeader: {
      backgroundColor: theme.colors.info,
      padding: "40px 20px",
      textAlign: "center",
      color: "white",
    },
    cardIcon: {
      fontSize: "4rem",
      marginBottom: "10px",
      display: "block",
    },
    cardContent: {
      padding: "20px",
    },
    cardTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: "#333",
    },
    cardDescription: {
      color: "#666",
      fontSize: "14px",
      lineHeight: "1.4",
    },
    cardFooter: {
      padding: "0",
      borderTop: "1px solid #eee",
    },
    cardButton: {
      width: "100%",
      padding: "15px",
      backgroundColor: theme.colors.primary,
      color: "white",
      border: "none",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "pointer",
      transition: "background-color 0.2s",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "8px",
    },
  };

  const settingsItems = [
    {
      title: "Office News",
      description: "Modify office news items.",
      icon: "📰",
      path: "/admin/settings/bulletins",
    },
    {
      title: "Skill Sets",
      description: "Modify the skill sets.",
      icon: "🎓",
      path: "/admin/settings/skill-sets",
    },
    {
      title: "Tags",
      description: "Manage system tags and labels.",
      icon: "🏷️",
      path: "/admin/settings/tags",
    },
    {
      title: "Associate News",
      description: "Modify associate news items.",
      icon: "📢",
      path: "/admin/settings/associate-away-logs",
    },
    {
      title: "Insurance Requirements",
      description: "Modify insurance settings.",
      icon: "⚖️",
      path: "/admin/settings/insurance-requirements",
    },
    {
      title: "Service Fees",
      description: "Modify service fee settings.",
      icon: "💳",
      path: "/admin/settings/service-fees",
    },
    {
      title: "Deactivated Clients",
      description: "Modify inactive customers.",
      icon: "😞",
      path: "/admin/settings/inactive-clients",
    },
    {
      title: "Vehicle Types",
      description: "Modify vehicle types for associates.",
      icon: "🚗",
      path: "/admin/settings/vehicle-types",
    },
    {
      title: "How did you hear?",
      description: "List how users discovered us and referral sources.",
      icon: "📞",
      path: "/admin/settings/how-hear-about-us-items",
    },
    {
      title: "Tax Settings",
      description: "Change how tax gets applied system wide.",
      icon: "🏦",
      action: () => setShowTaxSettingModal(true),
    },
    {
      title: "National Occupational Classification",
      description: "Search NOC's in the system.",
      icon: "🏢",
      path: "/admin/settings/noc/search",
    },
    {
      title: "North America Industry Classification System",
      description: "Search NAICS's in the system.",
      icon: "🏭",
      path: "/admin/settings/naics/search",
    },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Settings", icon: "⚙️" },
        ]}
      />

      {errors.user && <Alert type="error">{errors.user}</Alert>}
      {errors.tenant && <Alert type="error">{errors.tenant}</Alert>}

      <Card title="⚙️ Settings">
        <p style={{ marginBottom: "20px", color: "#666" }}>
          Configure and manage your system settings. Click on any option below
          to modify specific settings.
        </p>

        <div style={styles.settingsGrid}>
          {settingsItems.map((item, index) => (
            <div
              key={index}
              style={styles.settingCard}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
              }}
            >
              <div style={styles.cardHeader}>
                <span style={styles.cardIcon}>{item.icon}</span>
              </div>
              <div style={styles.cardContent}>
                <h3 style={styles.cardTitle}>{item.title}</h3>
                <p style={styles.cardDescription}>{item.description}</p>
              </div>
              <div style={styles.cardFooter}>
                {item.path ? (
                  <Link
                    to={item.path}
                    style={styles.cardButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#0056b3";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.colors.primary;
                    }}
                  >
                    View <span>➜</span>
                  </Link>
                ) : (
                  <button
                    onClick={item.action}
                    style={styles.cardButton}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#0056b3";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = theme.colors.primary;
                    }}
                  >
                    View <span>➜</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tax Settings Modal */}
      {tenant && (
        <TaxSettingModal
          currentUser={currentUser}
          tenant={tenant}
          showModal={showTaxSettingModal}
          setShowModal={setShowTaxSettingModal}
          onSuccess={() => {
            console.log("Tax settings updated successfully");
            // Optionally refresh tenant data
            if (currentUser && currentUser.tenantId) {
              fetchTenantDetail(currentUser.tenantId);
            }
          }}
        />
      )}
    </div>
  );
}

// Tax Setting Modal Component
function TaxSettingModal({
  currentUser,
  tenant,
  showModal,
  setShowModal,
  onSuccess,
}) {
  const tenantManager = useTenantManager();
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [taxRate, setTaxRate] = useState(tenant?.taxRate || 0);

  const onUnauthorized = () => {
    window.location.href = "/login?unauthorized=true";
  };

  const handleSave = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const taxRateData = {
        tenantId: currentUser.tenantId,
        taxRate: parseFloat(taxRate),
      };

      await tenantManager.updateTaxRate(taxRateData, onUnauthorized);

      onSuccess();
      setShowModal(false);
    } catch (error) {
      console.error("Failed to update tax rate:", error);
      setErrors({ submit: error.message || "Failed to update tax rate" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setTaxRate(tenant?.taxRate || 0);
    setShowModal(false);
  };

  useEffect(() => {
    if (showModal && tenant) {
      setTaxRate(tenant.taxRate || 0);
    }
  }, [showModal, tenant]);

  return (
    <Modal
      isOpen={showModal}
      onClose={handleClose}
      title="🏦 Tax Settings"
      footer={
        <>
          <Button
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </>
      }
    >
      {errors.submit && <Alert type="error">{errors.submit}</Alert>}

      <div style={{ marginBottom: "20px" }}>
        <label
          style={{ display: "block", marginBottom: "5px", fontWeight: "600" }}
        >
          Tax Rate
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={taxRate}
          onChange={(e) => setTaxRate(e.target.value)}
          placeholder="Enter tax rate"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "14px",
          }}
        />
        <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
          Tax rate applied to every order if the user has a tax account
        </div>
      </div>
    </Modal>
  );
}

export default SettingDashboardPage;
