// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useStaffManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../components/UI";
import { STAFF_TYPE_MANAGEMENT } from "../../../../../constants/Staff";

function AdminStaffDetailMorePage() {
  const navigate = useNavigate();
  const { aid } = useParams();
  const staffManager = useStaffManager();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState({});

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchStaffDetail = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const response = await staffManager.getStaffDetail(aid, onUnauthorized);
        if (mounted) {
          setStaff(response);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff detail:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchStaffDetail();

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Detail", path: `/admin/staff/${aid}`, icon: "ℹ️" },
    { label: "More", icon: "⋯" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banner for archived staff */}
      {staff && staff.status === 2 && <Alert type="info">Archived</Alert>}

      {/* Page Title */}
      <h1>Staff - More Actions</h1>

      {/* Page Content */}
      <Card>
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {/* Error display */}
            {errors && Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.keys(errors).map((key) => (
                  <div key={key}>{errors[key]}</div>
                ))}
              </Alert>
            )}

            {staff && (
              <div>
                {/* Tab Navigation */}
                <div style={{ marginBottom: "20px" }}>
                  <Link to={`/admin/staff/${staff.id}`}>Summary</Link> |
                  <Link to={`/admin/staff/${staff.id}/detail`}> Detail</Link> |
                  <Link to={`/admin/staff/${staff.id}/comments`}>
                    {" "}
                    Comments
                  </Link>{" "}
                  |
                  <Link to={`/admin/staff/${staff.id}/attachments`}>
                    {" "}
                    Attachments
                  </Link>{" "}
                  |<strong> More</strong>
                </div>

                {/* Page Menu Options */}
                <div style={{ marginTop: "30px" }}>
                  <h2>Available Actions</h2>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "20px",
                      marginTop: "20px",
                    }}
                  >
                    {/* Photo option - only for active staff */}
                    {staff.status === 1 && (
                      <Link to={`/admin/staff/${aid}/avatar`}>
                        <Card>
                          <div style={{ textAlign: "center", padding: "20px" }}>
                            <div
                              style={{ fontSize: "30px", marginBottom: "10px" }}
                            >
                              📷
                            </div>
                            <h3>Photo</h3>
                            <p>Upload a photo of the staff</p>
                          </div>
                        </Card>
                      </Link>
                    )}

                    {/* Archive/Unarchive option */}
                    {staff.status === 2 ? (
                      <Link to={`/admin/staff/${aid}/unarchive`}>
                        <Card>
                          <div style={{ textAlign: "center", padding: "20px" }}>
                            <div
                              style={{ fontSize: "30px", marginBottom: "10px" }}
                            >
                              📦
                            </div>
                            <h3>Unarchive</h3>
                            <p>Make staff visible in list and search results</p>
                          </div>
                        </Card>
                      </Link>
                    ) : (
                      <Link to={`/admin/staff/${aid}/archive`}>
                        <Card>
                          <div style={{ textAlign: "center", padding: "20px" }}>
                            <div
                              style={{ fontSize: "30px", marginBottom: "10px" }}
                            >
                              📁
                            </div>
                            <h3>Archive</h3>
                            <p>
                              Make staff hidden from list and search results
                            </p>
                          </div>
                        </Card>
                      </Link>
                    )}

                    {/* Upgrade/Downgrade option - only for active staff */}
                    {staff.status === 1 && (
                      <>
                        {staff.type === STAFF_TYPE_MANAGEMENT ? (
                          <Link to={`/admin/staff/${aid}/downgrade`}>
                            <Card>
                              <div
                                style={{ textAlign: "center", padding: "20px" }}
                              >
                                <div
                                  style={{
                                    fontSize: "30px",
                                    marginBottom: "10px",
                                  }}
                                >
                                  🏠
                                </div>
                                <h3>Downgrade</h3>
                                <p>Change staff to become residential staff</p>
                              </div>
                            </Card>
                          </Link>
                        ) : (
                          <Link to={`/admin/staff/${aid}/upgrade`}>
                            <Card>
                              <div
                                style={{ textAlign: "center", padding: "20px" }}
                              >
                                <div
                                  style={{
                                    fontSize: "30px",
                                    marginBottom: "10px",
                                  }}
                                >
                                  🏢
                                </div>
                                <h3>Upgrade</h3>
                                <p>Change staff to become business staff</p>
                              </div>
                            </Card>
                          </Link>
                        )}
                      </>
                    )}

                    {/* Active staff only options */}
                    {staff.status === 1 && (
                      <>
                        {/* Delete option */}
                        <Link to={`/admin/staff/${aid}/permadelete`}>
                          <Card>
                            <div
                              style={{ textAlign: "center", padding: "20px" }}
                            >
                              <div
                                style={{
                                  fontSize: "30px",
                                  marginBottom: "10px",
                                }}
                              >
                                🗑️
                              </div>
                              <h3>Delete</h3>
                              <p>
                                Permanently delete this staff and all staffed
                                data
                              </p>
                            </div>
                          </Card>
                        </Link>

                        {/* Password option */}
                        <Link to={`/admin/staff/${aid}/change-password`}>
                          <Card>
                            <div
                              style={{ textAlign: "center", padding: "20px" }}
                            >
                              <div
                                style={{
                                  fontSize: "30px",
                                  marginBottom: "10px",
                                }}
                              >
                                🔑
                              </div>
                              <h3>Password</h3>
                              <p>
                                Change or reset the staff password for their
                                account
                              </p>
                            </div>
                          </Card>
                        </Link>

                        {/* 2FA option */}
                        <Link to={`/admin/staff/${aid}/2fa`}>
                          <Card>
                            <div
                              style={{ textAlign: "center", padding: "20px" }}
                            >
                              <div
                                style={{
                                  fontSize: "30px",
                                  marginBottom: "10px",
                                }}
                              >
                                📱
                              </div>
                              <h3>2FA</h3>
                              <p>Enable or disable two-factor authentication</p>
                            </div>
                          </Card>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Bottom Navigation */}
                <div
                  style={{
                    marginTop: "40px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <Link to="/admin/staff">
                    <Button variant="secondary">← Back to Staff</Button>
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffDetailMorePage;
