// File Path: web/workery-frontend/src/pages/Root/Tenant/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
  Select,
  Table,
} from "../../../../components/UI";

function RootTenantListPage() {
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState(null);
  const [selectedTenantForDeletion, setSelectedTenantForDeletion] =
    useState(null);

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filtering
  const [showFilter, setShowFilter] = useState(false);
  const [temporarySearchText, setTemporarySearchText] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [createdAtGTE, setCreatedAtGTE] = useState("");

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
        params.createdAtGTE = new Date(createdAfter).getTime();
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
      setErrors({ fetch: error.message || "Failed to load tenants" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTenants(nextPage, pageSize, actualSearchText, status, createdAtGTE);
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchTenants(prevPage, pageSize, actualSearchText, status, createdAtGTE);
  };

  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchTenants(1, pageSize, temporarySearchText, status, createdAtGTE);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTenantForDeletion) return;

    setIsLoading(true);

    try {
      await tenantManager.archiveTenant(
        selectedTenantForDeletion.id,
        onUnauthorized,
      );

      fetchTenants(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        createdAtGTE,
      );

      setSelectedTenantForDeletion(null);
      console.log("RootTenantListPage: Tenant archived successfully");
    } catch (error) {
      console.error("RootTenantListPage: Failed to archive tenant:", error);
      setErrors({ delete: error.message || "Failed to delete tenant" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
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

      fetchTenants();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading && !tenants) {
    return <Loading message="Loading Tenants..." />;
  }

  const styles = {
    filterSection: {
      backgroundColor: "#f8f9fa",
      borderRadius: "4px",
      padding: "20px",
      marginBottom: "20px",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "15px",
    },
    searchContainer: {
      display: "flex",
      gap: "5px",
    },
    searchInput: {
      flex: 1,
    },
    actionButtons: {
      display: "flex",
      gap: "5px",
      justifyContent: "center",
    },
    paginationContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "20px",
      flexWrap: "wrap",
      gap: "10px",
    },
    noData: {
      textAlign: "center",
      padding: "40px",
    },
  };

  // Table columns configuration
  const columns = [
    {
      key: "schemaName",
      label: "Schema",
      align: "left",
    },
    {
      key: "name",
      label: "Name",
      align: "left",
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (value, row) => (
        <div style={styles.actionButtons}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/root/tenant/${row.id}`)}
          >
            ℹ️ View
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => navigate(`/root/tenant/${row.id}/start`)}
          >
            ▶️ Start
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedTenantForDeletion(row)}
          >
            🗑️ Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Root Dashboard", path: "/root/dashboard", icon: "📊" },
          { label: "Tenants", icon: "🏢" },
        ]}
      />

      <Card
        title="🏢 Tenants List"
        actions={
          <>
            <Button
              variant="info"
              size="sm"
              onClick={() =>
                fetchTenants(
                  currentPage,
                  pageSize,
                  actualSearchText,
                  status,
                  createdAtGTE,
                )
              }
              disabled={isLoading}
            >
              🔄 Refresh
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilter(!showFilter)}
            >
              🔍 {showFilter ? "Hide Filter" : "Show Filter"}
            </Button>
            <Link to="/root/tenant/add">
              <Button variant="success" size="sm">
                ➕ New Tenant
              </Button>
            </Link>
          </>
        }
      >
        {errors.fetch && <Alert type="error">{errors.fetch}</Alert>}
        {errors.delete && <Alert type="error">{errors.delete}</Alert>}

        {/* Filter Section */}
        {showFilter && (
          <div style={styles.filterSection}>
            <div style={styles.filterGrid}>
              <div>
                <label style={globalStyles.label}>Search:</label>
                <div style={styles.searchContainer}>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={temporarySearchText}
                    onChange={(e) => setTemporarySearchText(e.target.value)}
                    style={{ ...globalStyles.input, ...styles.searchInput }}
                  />
                  <Button onClick={handleSearch} size="sm">
                    🔍
                  </Button>
                </div>
              </div>

              <div>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={[
                    { value: "", label: "All Statuses" },
                    { value: "1", label: "Active" },
                    { value: "2", label: "Inactive" },
                  ]}
                />
              </div>

              <div>
                <Input
                  label="Created After"
                  type="date"
                  value={createdAtGTE}
                  onChange={(e) => setCreatedAtGTE(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>Loading...</p>
          </div>
        )}

        {/* Table */}
        {!isLoading &&
        tenants &&
        tenants.results &&
        tenants.results.length > 0 ? (
          <>
            <Table columns={columns} data={tenants.results} />

            {/* Pagination */}
            <div style={styles.paginationContainer}>
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
                  <Button
                    variant="secondary"
                    onClick={handlePreviousPage}
                    disabled={isLoading}
                  >
                    Previous
                  </Button>
                )}
                <span style={{ padding: "8px" }}>Page {currentPage}</span>
                {hasNextPage && (
                  <Button
                    variant="secondary"
                    onClick={handleNextPage}
                    disabled={isLoading}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </>
        ) : !isLoading &&
          tenants &&
          (!tenants.results || tenants.results.length === 0) ? (
          <div style={styles.noData}>
            <h2>📋 No Tenants</h2>
            <p>
              No tenants found.{" "}
              <Link to="/root/tenant/add" style={{ fontWeight: "bold" }}>
                Click here to add your first tenant →
              </Link>
            </p>
          </div>
        ) : null}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedTenantForDeletion}
        onClose={() => setSelectedTenantForDeletion(null)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelectedTenantForDeletion(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete the tenant "
          {selectedTenantForDeletion?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default RootTenantListPage;
