// File Path: monorepo/web/workery-frontend/src/pages/Root/Tenant/List/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";

function RootTenantListPage() {
  ////
  //// Services.
  ////

  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState(null);
  const [selectedTenantForDeletion, setSelectedTenantForDeletion] =
    useState("");

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filtering + Searching
  const [showFilter, setShowFilter] = useState(false);
  const [temporarySearchText, setTemporarySearchText] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [createdAtGTE, setCreatedAtGTE] = useState(null);

  ////
  //// Event handling.
  ////

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenants = async (
    page = 1,
    limit = 50,
    search = "",
    statusFilter = "",
    createdAfter = null,
  ) => {
    setIsLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: limit,
        search: search,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (createdAfter) {
        params.createdAtGTE = createdAfter.getTime();
      }

      const tenantsData = await tenantManager.getTenants(
        params,
        onUnauthorized,
        true,
      );

      setTenants(tenantsData);
      setHasNextPage(tenantsData.hasNextPage || false);
      setHasPreviousPage(page > 1);

      console.log("RootTenantListPage: Tenants fetched successfully:", {
        count: tenantsData.results ? tenantsData.results.length : 0,
        totalCount: tenantsData.count,
      });
    } catch (error) {
      console.error("RootTenantListPage: Failed to fetch tenants:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const onNextClicked = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTenants(nextPage, pageSize, actualSearchText, status, createdAtGTE);
  };

  const onPreviousClicked = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchTenants(prevPage, pageSize, actualSearchText, status, createdAtGTE);
  };

  const onSearchButtonClick = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchTenants(1, pageSize, temporarySearchText, status, createdAtGTE);
  };

  const onSelectTenantForDeletion = (tenant) => {
    setSelectedTenantForDeletion(tenant);
  };

  const onDeselectTenantForDeletion = () => {
    setSelectedTenantForDeletion("");
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedTenantForDeletion) return;

    setIsLoading(true);

    try {
      await tenantManager.archiveTenant(
        selectedTenantForDeletion.id,
        onUnauthorized,
      );

      // Refresh the list
      fetchTenants(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        createdAtGTE,
      );

      setSelectedTenantForDeletion("");

      console.log("RootTenantListPage: Tenant archived successfully");
    } catch (error) {
      console.error("RootTenantListPage: Failed to archive tenant:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authManager.logout();
      navigate("/login");
    } catch (error) {
      console.error("RootTenantListPage: Logout failed:", error);
      navigate("/login");
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

      // Fetch initial data
      fetchTenants();
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// Component rendering.
  ////

  if (isLoading && !tenants) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h1>Loading Tenants...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <section>
        {/* Desktop Breadcrumbs */}
        <nav
          aria-label="breadcrumbs"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
            display: window.innerWidth > 768 ? "block" : "none",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link to="/root/dashboard" style={{ textDecoration: "none" }}>
                📊 Root Dashboard
              </Link>
              {" > "}
              <span>🏢 Tenants</span>
            </li>
          </ul>
        </nav>

        {/* Mobile Breadcrumbs */}
        <nav
          aria-label="breadcrumbs"
          style={{
            backgroundColor: "#f5f5f5",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
            display: window.innerWidth <= 768 ? "block" : "none",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li>
              <Link to="/root/dashboard" style={{ textDecoration: "none" }}>
                ← Back to Dashboard
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "20px",
            backgroundColor: "white",
          }}
        >
          {/* Page Title + Options */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1 style={{ margin: 0, fontSize: "24px" }}>🏢 Tenants List</h1>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() =>
                  fetchTenants(
                    currentPage,
                    pageSize,
                    actualSearchText,
                    status,
                    createdAtGTE,
                  )
                }
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
                disabled={isLoading}
              >
                🔄 Refresh
              </button>
              <button
                onClick={() => setShowFilter(!showFilter)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                🔍 {showFilter ? "Hide Filter" : "Show Filter"}
              </button>
              <Link
                to="/root/tenant/add"
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#28a745",
                  color: "white",
                  textDecoration: "none",
                  borderRadius: "4px",
                  display: "inline-block",
                }}
              >
                ➕ New Tenant
              </Link>
            </div>
          </div>

          {/* Filter Section */}
          {showFilter && (
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                padding: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                <div style={{ flex: "1", minWidth: "200px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Search:
                  </label>
                  <div style={{ display: "flex", gap: "5px" }}>
                    <input
                      type="text"
                      placeholder="Search by name"
                      value={temporarySearchText}
                      onChange={(e) => setTemporarySearchText(e.target.value)}
                      style={{
                        flex: "1",
                        padding: "8px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      onClick={onSearchButtonClick}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      🔍
                    </button>
                  </div>
                </div>
                <div style={{ minWidth: "150px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Status:
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value="">All Statuses</option>
                    <option value="1">Active</option>
                    <option value="2">Inactive</option>
                  </select>
                </div>
                <div style={{ minWidth: "150px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "5px",
                      fontWeight: "bold",
                    }}
                  >
                    Created After:
                  </label>
                  <input
                    type="date"
                    value={
                      createdAtGTE
                        ? createdAtGTE.toISOString().split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setCreatedAtGTE(
                        e.target.value ? new Date(e.target.value) : null,
                      )
                    }
                    style={{
                      width: "100%",
                      padding: "8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

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

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <p>Loading...</p>
            </div>
          )}

          {/* Main Content */}
          {!isLoading &&
          tenants &&
          tenants.results &&
          tenants.results.length > 0 ? (
            <div>
              {/* Desktop Table */}
              <div
                style={{ display: window.innerWidth > 768 ? "block" : "none" }}
              >
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa" }}>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Schema
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "left",
                          border: "1px solid #ddd",
                        }}
                      >
                        Name
                      </th>
                      <th
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          border: "1px solid #ddd",
                        }}
                      >
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenants.results.map((tenant) => (
                      <tr
                        key={tenant.id}
                        style={{ borderBottom: "1px solid #ddd" }}
                      >
                        <td
                          style={{ padding: "12px", border: "1px solid #ddd" }}
                        >
                          {tenant.schemaName}
                        </td>
                        <td
                          style={{ padding: "12px", border: "1px solid #ddd" }}
                        >
                          {tenant.name}
                        </td>
                        <td
                          style={{
                            padding: "12px",
                            textAlign: "center",
                            border: "1px solid #ddd",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "5px",
                              justifyContent: "center",
                            }}
                          >
                            <Link
                              to={`/root/tenant/${tenant.id}`}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#007bff",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}
                            >
                              ℹ️ View
                            </Link>
                            <Link
                              to={`/root/tenant/${tenant.id}/start`}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#28a745",
                                color: "white",
                                textDecoration: "none",
                                borderRadius: "4px",
                                fontSize: "12px",
                              }}
                            >
                              ▶️ Start
                            </Link>
                            <button
                              onClick={() => onSelectTenantForDeletion(tenant)}
                              style={{
                                padding: "4px 8px",
                                backgroundColor: "#dc3545",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "12px",
                              }}
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div
                style={{ display: window.innerWidth <= 768 ? "block" : "none" }}
              >
                {tenants.results.map((tenant, index) => (
                  <div key={tenant.id}>
                    {index > 0 && <hr style={{ margin: "20px 0" }} />}
                    <div style={{ marginBottom: "20px" }}>
                      <p>
                        <strong>Schema:</strong> {tenant.schemaName}
                      </p>
                      <p>
                        <strong>Name:</strong> {tenant.name}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Link
                          to={`/root/tenant/${tenant.id}`}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#007bff",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            flex: "1",
                            textAlign: "center",
                          }}
                        >
                          ℹ️ View
                        </Link>
                        <Link
                          to={`/root/tenant/${tenant.id}/start`}
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#28a745",
                            color: "white",
                            textDecoration: "none",
                            borderRadius: "4px",
                            fontSize: "14px",
                            flex: "1",
                            textAlign: "center",
                          }}
                        >
                          ▶️ Start
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "20px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div>
                  <label style={{ marginRight: "10px" }}>Page Size:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                      fetchTenants(
                        1,
                        newPageSize,
                        actualSearchText,
                        status,
                        createdAtGTE,
                      );
                    }}
                    style={{
                      padding: "4px 8px",
                      border: "1px solid #ccc",
                      borderRadius: "4px",
                    }}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  {hasPreviousPage && (
                    <button
                      onClick={onPreviousClicked}
                      disabled={isLoading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Previous
                    </button>
                  )}
                  {hasNextPage && (
                    <button
                      onClick={onNextClicked}
                      disabled={isLoading}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#6c757d",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : !isLoading &&
            tenants &&
            (!tenants.results || tenants.results.length === 0) ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <h2>📋 No Tenants</h2>
              <p>
                No tenants found.{" "}
                <Link to="/root/tenant/add" style={{ fontWeight: "bold" }}>
                  Click here to add your first tenant →
                </Link>
              </p>
            </div>
          ) : null}

          {/* Delete Confirmation Modal */}
          {selectedTenantForDeletion && (
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
                <h3>Confirm Deletion</h3>
                <p>
                  Are you sure you want to delete the tenant "
                  {selectedTenantForDeletion.name}"? This action cannot be
                  undone.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={onDeselectTenantForDeletion}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#6c757d",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onDeleteConfirmButtonClick}
                    disabled={isLoading}
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {isLoading ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Page Logout Link */}
        <div style={{ textAlign: "right", color: "#666", marginTop: "20px" }}>
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
              <li>Current Page: {currentPage}</li>
              <li>Page Size: {pageSize}</li>
              <li>Has Next: {hasNextPage ? "Yes" : "No"}</li>
              <li>Has Previous: {hasPreviousPage ? "Yes" : "No"}</li>
              <li>Search Text: {actualSearchText || "(none)"}</li>
              <li>Status Filter: {status || "(none)"}</li>
              <li>Total Tenants: {tenants ? tenants.count : "Unknown"}</li>
              <li>Loading: {isLoading ? "Yes" : "No"}</li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}

export default RootTenantListPage;
