// File Path: monorepo/web/workery-frontend/src/pages/Admin/Dashboard/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
} from "../../../services/Services";

function AdminDashboardPage() {
  ////
  //// Services.
  ////

  const dashboardManager = useDashboardManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [dashboard, setDashboard] = useState({});

  // Modal states for bulletins
  const [showDeleteModalForBulletinID, setShowDeleteModalForBulletinID] =
    useState("");
  const [showBulletinCreateModal, setShowBulletinCreateModal] = useState(false);

  // Modal states for associate away logs
  const [
    showAssociateAwayLogDeleteModalForAssociateAwayLogID,
    setShowAssociateAwayLogDeleteModalForAssociateAwayLogID,
  ] = useState("");
  const [showAssociateAwayLogCreateModal, setShowAssociateAwayLogCreateModal] =
    useState(false);
  const [
    showUpdateModalForAssociateAwayLogID,
    setShowUpdateModalForAssociateAwayLogID,
  ] = useState("");
  const [
    showDeleteModalForAssociateAwayLogID,
    setShowDeleteModalForAssociateAwayLogID,
  ] = useState("");

  // Form states
  const [bulletinText, setBulletinText] = useState("");
  const [associateAwayLogForm, setAssociateAwayLogForm] = useState({
    associateID: "",
    reason: 0,
    reasonOther: "",
    untilFurtherNotice: 0,
    untilDate: "",
    startDate: "",
  });

  ////
  //// Event handling.
  ////

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
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authManager.logout();
      navigate("/login");
    } catch (error) {
      console.error("AdminDashboard: Logout failed:", error);
      navigate("/login");
    }
  };

  // Bulletin handlers
  const handleCreateBulletin = async (e) => {
    e.preventDefault();
    if (!bulletinText.trim()) {
      setErrors({ text: "Bulletin text is required" });
      return;
    }

    try {
      // TODO: Implement bulletin creation API when available
      console.log("Creating bulletin:", bulletinText);
      setBulletinText("");
      setShowBulletinCreateModal(false);
      await fetchDashboard(); // Refresh data
    } catch (error) {
      console.error("Failed to create bulletin:", error);
      setErrors(error);
    }
  };

  const handleDeleteBulletin = async (bulletinId) => {
    try {
      // TODO: Implement bulletin deletion API when available
      console.log("Deleting bulletin:", bulletinId);
      setShowDeleteModalForBulletinID("");
      await fetchDashboard(); // Refresh data
    } catch (error) {
      console.error("Failed to delete bulletin:", error);
      setErrors(error);
    }
  };

  // Associate Away Log handlers
  const handleCreateAssociateAwayLog = async (e) => {
    e.preventDefault();

    try {
      // TODO: Implement associate away log creation API when available
      console.log("Creating associate away log:", associateAwayLogForm);
      setAssociateAwayLogForm({
        associateID: "",
        reason: 0,
        reasonOther: "",
        untilFurtherNotice: 0,
        untilDate: "",
        startDate: "",
      });
      setShowAssociateAwayLogCreateModal(false);
      await fetchDashboard(); // Refresh data
    } catch (error) {
      console.error("Failed to create associate away log:", error);
      setErrors(error);
    }
  };

  const handleDeleteAssociateAwayLog = async (awayLogId) => {
    try {
      // TODO: Implement associate away log deletion API when available
      console.log("Deleting associate away log:", awayLogId);
      setShowDeleteModalForAssociateAwayLogID("");
      await fetchDashboard(); // Refresh data
    } catch (error) {
      console.error("Failed to delete associate away log:", error);
      setErrors(error);
    }
  };

  const handleUpdateAssociateAwayLog = async (awayLogId) => {
    try {
      // TODO: Implement associate away log update API when available
      console.log(
        "Updating associate away log:",
        awayLogId,
        associateAwayLogForm,
      );
      setShowUpdateModalForAssociateAwayLogID("");
      await fetchDashboard(); // Refresh data
    } catch (error) {
      console.error("Failed to update associate away log:", error);
      setErrors(error);
    }
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      // Check authentication
      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Fetch dashboard data
      fetchDashboard();
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// Component rendering.
  ////

  if (isFetching) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Loading Dashboard...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <section>
        {/* Breadcrumbs */}
        <nav
          aria-label="breadcrumbs"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link
                to="/admin/dashboard"
                aria-current="page"
                style={{ textDecoration: "none" }}
              >
                📊 Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page Title */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>📊 Dashboard</h1>
          <hr />
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div
            style={{
              color: "red",
              border: "1px solid red",
              padding: "10px",
              marginBottom: "20px",
              borderRadius: "4px",
              backgroundColor: "#ffebee",
            }}
          >
            <strong>Error occurred:</strong>
            {Object.entries(errors).map(([key, value]) => (
              <div key={key}>
                <strong>{key}:</strong>{" "}
                {typeof value === "string" ? value : JSON.stringify(value)}
              </div>
            ))}
          </div>
        )}

        {/* Dashboard Content */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "20px",
            backgroundColor: "white",
            marginBottom: "20px",
          }}
        >
          {/* Summary Statistics */}
          <div style={{ marginBottom: "30px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>
              📈 System Summary
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>👥 Clients</h3>
                <p style={{ fontSize: "24px", margin: 0, fontWeight: "bold" }}>
                  {dashboard.clientsCount || 0}
                </p>
                <Link to="/admin/clients" style={{ fontSize: "14px" }}>
                  View Clients →
                </Link>
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#ffebee",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>👷 Associates</h3>
                <p style={{ fontSize: "24px", margin: 0, fontWeight: "bold" }}>
                  {dashboard.associatesCount || 0}
                </p>
                <Link to="/admin/associates" style={{ fontSize: "14px" }}>
                  View Associates →
                </Link>
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#e8f5e8",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>🔧 Jobs</h3>
                <p style={{ fontSize: "24px", margin: 0, fontWeight: "bold" }}>
                  {dashboard.jobsCount || 0}
                </p>
                <Link to="/admin/orders" style={{ fontSize: "14px" }}>
                  View Jobs →
                </Link>
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "4px",
                  textAlign: "center",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>📋 Tasks</h3>
                <p style={{ fontSize: "24px", margin: 0, fontWeight: "bold" }}>
                  {dashboard.tasksCount || 0}
                </p>
                <Link to="/admin/tasks" style={{ fontSize: "14px" }}>
                  View Tasks →
                </Link>
              </div>
            </div>
          </div>

          {/* Office News Section */}
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h2 style={{ fontSize: "18px", margin: 0 }}>📰 Office News</h2>
              <button
                onClick={() => setShowBulletinCreateModal(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ➕ Add
              </button>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Messages
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "1px solid #ddd",
                        width: "100px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.bulletins && dashboard.bulletins.length > 0 ? (
                    dashboard.bulletins.map((bulletin, index) => (
                      <tr key={bulletin.id || index}>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {bulletin.text}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <button
                            onClick={() =>
                              setShowDeleteModalForBulletinID(bulletin.id)
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="2"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No bulletins found. Click "Add" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Associate News Section */}
          <div style={{ marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <h2 style={{ fontSize: "18px", margin: 0 }}>📢 Associate News</h2>
              <button
                onClick={() => setShowAssociateAwayLogCreateModal(true)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ➕ Add
              </button>
            </div>
            <div style={{ border: "1px solid #ddd", borderRadius: "4px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Associate
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Reason
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Start
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #ddd",
                      }}
                    >
                      Away until
                    </th>
                    <th
                      style={{
                        padding: "12px",
                        textAlign: "center",
                        borderBottom: "1px solid #ddd",
                        width: "120px",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.associateAwayLogs &&
                  dashboard.associateAwayLogs.length > 0 ? (
                    dashboard.associateAwayLogs.map((awayLog, index) => (
                      <tr key={awayLog.id || index}>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <Link
                            to={`/admin/associate/${awayLog.associateId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {awayLog.associateName}
                          </Link>
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {awayLog.reason === 1
                            ? awayLog.reasonOther
                            : `Reason ${awayLog.reason}`}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {awayLog.startDate
                            ? new Date(awayLog.startDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          {awayLog.untilFurtherNotice === 1
                            ? "Further notice"
                            : awayLog.untilDate
                              ? new Date(awayLog.untilDate).toLocaleDateString()
                              : "N/A"}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <button
                            onClick={() =>
                              setShowUpdateModalForAssociateAwayLogID(
                                awayLog.id,
                              )
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#ffc107",
                              color: "black",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              marginRight: "5px",
                            }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() =>
                              setShowDeleteModalForAssociateAwayLogID(
                                awayLog.id,
                              )
                            }
                            style={{
                              padding: "4px 8px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="5"
                        style={{
                          padding: "20px",
                          textAlign: "center",
                          color: "#666",
                        }}
                      >
                        No associate away logs found. Click "Add" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Links Section */}
          <div style={{ marginBottom: "30px" }}>
            <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>
              🔗 Quick Links
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
              }}
            >
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#e3f2fd",
                  borderRadius: "4px",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>👤 My Job History</h3>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                  View your personal work order history
                </p>
                <Link to="/admin/job-history/my-job-history">
                  View History →
                </Link>
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#fff3e0",
                  borderRadius: "4px",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>👥 Team Job History</h3>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                  View the team's work order history
                </p>
                <Link to="/admin/job-history/team-job-history">
                  View Team History →
                </Link>
              </div>
              <div
                style={{
                  padding: "15px",
                  backgroundColor: "#e8f5e8",
                  borderRadius: "4px",
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>💬 Comments</h3>
                <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                  View recent comments in the system
                </p>
                <Link to="/admin/all-comments">View Comments →</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bulletin Create Modal */}
        {showBulletinCreateModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "500px",
                width: "90%",
              }}
            >
              <h3>➕ New Bulletin</h3>
              <form onSubmit={handleCreateBulletin}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Text:
                  </label>
                  <textarea
                    value={bulletinText}
                    onChange={(e) => setBulletinText(e.target.value)}
                    placeholder="Enter bulletin text..."
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                      resize: "vertical",
                    }}
                    required
                  />
                  <small style={{ color: "#666" }}>Max 638 characters</small>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowBulletinCreateModal(false);
                      setBulletinText("");
                      setErrors({});
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bulletin Delete Modal */}
        {showDeleteModalForBulletinID && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <h3>🗑️ Delete Bulletin</h3>
              <p>
                You are about to delete this bulletin. This action cannot be
                undone. Are you sure you want to continue?
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowDeleteModalForBulletinID("")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={() =>
                    handleDeleteBulletin(showDeleteModalForBulletinID)
                  }
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ✅ Confirm and Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Associate Away Log Create Modal */}
        {showAssociateAwayLogCreateModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "600px",
                width: "90%",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
            >
              <h3>➕ New Associate News</h3>
              <form onSubmit={handleCreateAssociateAwayLog}>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Associate ID:
                  </label>
                  <input
                    type="text"
                    value={associateAwayLogForm.associateID}
                    onChange={(e) =>
                      setAssociateAwayLogForm({
                        ...associateAwayLogForm,
                        associateID: e.target.value,
                      })
                    }
                    placeholder="Enter associate ID..."
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    required
                  />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Reason:
                  </label>
                  <select
                    value={associateAwayLogForm.reason}
                    onChange={(e) =>
                      setAssociateAwayLogForm({
                        ...associateAwayLogForm,
                        reason: parseInt(e.target.value),
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value={0}>Select reason...</option>
                    <option value={1}>Other</option>
                    <option value={2}>Vacation</option>
                    <option value={3}>Sick Leave</option>
                    <option value={4}>Personal</option>
                  </select>
                </div>
                {associateAwayLogForm.reason === 1 && (
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Reason (Other):
                    </label>
                    <input
                      type="text"
                      value={associateAwayLogForm.reasonOther}
                      onChange={(e) =>
                        setAssociateAwayLogForm({
                          ...associateAwayLogForm,
                          reasonOther: e.target.value,
                        })
                      }
                      placeholder="Enter other reason..."
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                      required
                    />
                  </div>
                )}
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Until Further Notice?
                  </label>
                  <div>
                    <label style={{ marginRight: "15px" }}>
                      <input
                        type="radio"
                        value={1}
                        checked={associateAwayLogForm.untilFurtherNotice === 1}
                        onChange={(e) =>
                          setAssociateAwayLogForm({
                            ...associateAwayLogForm,
                            untilFurtherNotice: parseInt(e.target.value),
                          })
                        }
                        style={{ marginRight: "5px" }}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        value={2}
                        checked={associateAwayLogForm.untilFurtherNotice === 2}
                        onChange={(e) =>
                          setAssociateAwayLogForm({
                            ...associateAwayLogForm,
                            untilFurtherNotice: parseInt(e.target.value),
                          })
                        }
                        style={{ marginRight: "5px" }}
                      />
                      No
                    </label>
                  </div>
                </div>
                {associateAwayLogForm.untilFurtherNotice === 2 && (
                  <div style={{ marginBottom: "15px" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "5px",
                        fontWeight: "bold",
                      }}
                    >
                      Until Date:
                    </label>
                    <input
                      type="date"
                      value={associateAwayLogForm.untilDate}
                      onChange={(e) =>
                        setAssociateAwayLogForm({
                          ...associateAwayLogForm,
                          untilDate: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                      required
                    />
                  </div>
                )}
                <div style={{ marginBottom: "15px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Start Date:
                  </label>
                  <input
                    type="date"
                    value={associateAwayLogForm.startDate}
                    onChange={(e) =>
                      setAssociateAwayLogForm({
                        ...associateAwayLogForm,
                        startDate: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                    required
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssociateAwayLogCreateModal(false);
                      setAssociateAwayLogForm({
                        associateID: "",
                        reason: 0,
                        reasonOther: "",
                        untilFurtherNotice: 0,
                        untilDate: "",
                        startDate: "",
                      });
                      setErrors({});
                    }}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ❌ Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    ✅ Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Associate Away Log Delete Modal */}
        {showDeleteModalForAssociateAwayLogID && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "20px",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              <h3>🗑️ Delete Associate News</h3>
              <p>
                You are about to delete this associate news. This action cannot
                be undone. Are you sure you want to continue?
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowDeleteModalForAssociateAwayLogID("")}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ❌ Cancel
                </button>
                <button
                  onClick={() =>
                    handleDeleteAssociateAwayLog(
                      showDeleteModalForAssociateAwayLogID,
                    )
                  }
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ✅ Confirm and Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Page Actions */}
        <div style={{ textAlign: "right", color: "#666", marginTop: "20px" }}>
          <button
            onClick={() => window.scrollTo(0, 0)}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
              marginRight: "15px",
            }}
          >
            Back to Top ↑
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              color: "#666",
              textDecoration: "underline",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Logout →
          </button>
        </div>

        {/* Debug info in development */}
        {import.meta.env.DEV && (
          <div
            style={{
              marginTop: "40px",
              padding: "20px",
              backgroundColor: "#f5f5f5",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            <h4>Debug Info (Development Only):</h4>
            <ul>
              <li>
                Authenticated: {authManager.isAuthenticated() ? "Yes" : "No"}
              </li>
              <li>Loading: {isFetching ? "Yes" : "No"}</li>
              <li>
                Has Dashboard Data:{" "}
                {Object.keys(dashboard).length > 0 ? "Yes" : "No"}
              </li>
              <li>
                Has Errors: {Object.keys(errors).length > 0 ? "Yes" : "No"}
              </li>
              <li>Current URL: {window.location.pathname}</li>
            </ul>

            <h5>Dashboard Data Summary:</h5>
            <pre
              style={{
                fontSize: "10px",
                backgroundColor: "#fff",
                padding: "10px",
                borderRadius: "4px",
                overflow: "auto",
              }}
            >
              {JSON.stringify(
                {
                  clientsCount: dashboard.clientsCount,
                  associatesCount: dashboard.associatesCount,
                  jobsCount: dashboard.jobsCount,
                  tasksCount: dashboard.tasksCount,
                  bulletinsCount: dashboard.bulletins
                    ? dashboard.bulletins.length
                    : 0,
                  associateAwayLogsCount: dashboard.associateAwayLogs
                    ? dashboard.associateAwayLogs.length
                    : 0,
                },
                null,
                2,
              )}
            </pre>

            {Object.keys(errors).length > 0 && (
              <div>
                <h5>Current Errors:</h5>
                <pre
                  style={{
                    fontSize: "10px",
                    backgroundColor: "#fff",
                    padding: "10px",
                    borderRadius: "4px",
                  }}
                >
                  {JSON.stringify(errors, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default AdminDashboardPage;
