// File Path: web/workery-frontend/src/pages/Admin/Dashboard/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
} from "../../../services/Services";
import { theme, globalStyles } from "../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
  TextArea,
  Select,
} from "../../../components/UI";

function AdminDashboardPage() {
  const dashboardManager = useDashboardManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [dashboard, setDashboard] = useState({});

  // Modal states
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [bulletinText, setBulletinText] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchDashboard = async () => {
    setFetching(true);
    setErrors({});

    try {
      const dashboardData = await dashboardManager.getDashboard(onUnauthorized);
      setDashboard(dashboardData);
      console.log("AdminDashboard: Dashboard data loaded successfully");
    } catch (error) {
      console.error("AdminDashboard: Failed to fetch dashboard:", error);
      setErrors({ fetch: error.message || "Failed to load dashboard data" });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateBulletin = async (e) => {
    e.preventDefault();
    if (!bulletinText.trim()) {
      setErrors({ bulletin: "Bulletin text is required" });
      return;
    }

    try {
      console.log("Creating bulletin:", bulletinText);
      setBulletinText("");
      setShowBulletinModal(false);
      await fetchDashboard();
    } catch (error) {
      console.error("Failed to create bulletin:", error);
      setErrors({ bulletin: error.message });
    }
  };

  const handleDeleteBulletin = async () => {
    try {
      console.log("Deleting bulletin:", selectedBulletin.id);
      setShowDeleteModal(false);
      setSelectedBulletin(null);
      await fetchDashboard();
    } catch (error) {
      console.error("Failed to delete bulletin:", error);
      setErrors({ delete: error.message });
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchDashboard();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading message="Loading Dashboard..." />;
  }

  const styles = {
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
      marginBottom: "30px",
    },
    summaryCard: {
      padding: "15px",
      borderRadius: "4px",
      textAlign: "center",
    },
    summaryTitle: {
      margin: "0 0 10px 0",
      fontSize: "16px",
    },
    summaryCount: {
      fontSize: "24px",
      margin: "0 0 10px 0",
      fontWeight: "bold",
    },
    bulletinList: {
      listStyle: "none",
      padding: 0,
      margin: 0,
    },
    bulletinItem: {
      padding: "12px",
      borderBottom: "1px solid #ddd",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    noData: {
      textAlign: "center",
      padding: "20px",
      color: "#666",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={[{ label: "Dashboard", icon: "📊" }]} />

      {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}

      {/* Summary Statistics */}
      <div style={styles.summaryGrid}>
        <div style={{ ...styles.summaryCard, backgroundColor: "#e3f2fd" }}>
          <h3 style={styles.summaryTitle}>👥 Clients</h3>
          <p style={styles.summaryCount}>{dashboard.clientsCount || 0}</p>
          <Link to="/admin/customers" style={{ fontSize: "14px" }}>
            View Clients →
          </Link>
        </div>

        <div style={{ ...styles.summaryCard, backgroundColor: "#ffebee" }}>
          <h3 style={styles.summaryTitle}>👷 Associates</h3>
          <p style={styles.summaryCount}>{dashboard.associatesCount || 0}</p>
          <Link to="/admin/associates" style={{ fontSize: "14px" }}>
            View Associates →
          </Link>
        </div>

        <div style={{ ...styles.summaryCard, backgroundColor: "#e8f5e8" }}>
          <h3 style={styles.summaryTitle}>🔧 Jobs</h3>
          <p style={styles.summaryCount}>{dashboard.jobsCount || 0}</p>
          <Link to="/admin/orders" style={{ fontSize: "14px" }}>
            View Jobs →
          </Link>
        </div>

        <div style={{ ...styles.summaryCard, backgroundColor: "#fff3e0" }}>
          <h3 style={styles.summaryTitle}>📋 Tasks</h3>
          <p style={styles.summaryCount}>{dashboard.tasksCount || 0}</p>
          <Link to="/admin/tasks" style={{ fontSize: "14px" }}>
            View Tasks →
          </Link>
        </div>
      </div>

      {/* Office News Section */}
      <Card
        title="📰 Office News"
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowBulletinModal(true)}
          >
            ➕ Add
          </Button>
        }
      >
        {dashboard.bulletins && dashboard.bulletins.length > 0 ? (
          <ul style={styles.bulletinList}>
            {dashboard.bulletins.map((bulletin, index) => (
              <li key={bulletin.id || index} style={styles.bulletinItem}>
                <span>{bulletin.text}</span>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    setSelectedBulletin(bulletin);
                    setShowDeleteModal(true);
                  }}
                >
                  🗑️
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div style={styles.noData}>
            No bulletins found. Click "Add" to create one.
          </div>
        )}
      </Card>

      {/* Quick Links Section */}
      <Card title="🔗 Quick Links" style={{ marginTop: "30px" }}>
        <div style={styles.summaryGrid}>
          <div style={{ ...styles.summaryCard, backgroundColor: "#e3f2fd" }}>
            <h3 style={styles.summaryTitle}>👤 My Job History</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
              View your personal work order history
            </p>
            <Link to="/admin/job-history/my-job-history">View History →</Link>
          </div>

          <div style={{ ...styles.summaryCard, backgroundColor: "#fff3e0" }}>
            <h3 style={styles.summaryTitle}>👥 Team Job History</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
              View the team's work order history
            </p>
            <Link to="/admin/job-history/team-job-history">
              View Team History →
            </Link>
          </div>

          <div style={{ ...styles.summaryCard, backgroundColor: "#e8f5e8" }}>
            <h3 style={styles.summaryTitle}>💬 Comments</h3>
            <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
              View recent comments in the system
            </p>
            <Link to="/admin/all-comments">View Comments →</Link>
          </div>
        </div>
      </Card>

      {/* Create Bulletin Modal */}
      <Modal
        isOpen={showBulletinModal}
        onClose={() => {
          setShowBulletinModal(false);
          setBulletinText("");
          setErrors({});
        }}
        title="➕ New Bulletin"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowBulletinModal(false);
                setBulletinText("");
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button variant="success" onClick={handleCreateBulletin}>
              Submit
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateBulletin}>
          <TextArea
            label="Text"
            value={bulletinText}
            onChange={(e) => setBulletinText(e.target.value)}
            placeholder="Enter bulletin text..."
            rows={4}
            maxLength={638}
            error={errors.bulletin}
            required
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBulletin(null);
        }}
        title="🗑️ Delete Bulletin"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedBulletin(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteBulletin}>
              Confirm and Delete
            </Button>
          </>
        }
      >
        <p>
          You are about to delete this bulletin. This action cannot be undone.
          Are you sure you want to continue?
        </p>
      </Modal>
    </div>
  );
}

export default AdminDashboardPage;
