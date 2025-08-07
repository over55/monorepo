// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
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
} from "../../../../../components/UI";

function SettingVehicleTypeListPage() {
  const vehicleTypeManager = useVehicleTypeManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [vehicleTypes, setVehicleTypes] = useState(null);
  const [selectedVehicleTypeForDeletion, setSelectedVehicleTypeForDeletion] =
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
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchVehicleTypes = async (
    page = 1,
    limit = 50,
    search = "",
    statusFilter = "",
    sortField = "name",
    sortDirection = "ASC",
  ) => {
    setIsLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: limit,
        sortBy: sortField,
        sortOrder: sortDirection,
      };

      if (search) {
        params.search = search;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const vehicleTypesData = await vehicleTypeManager.getVehicleTypes(
        params,
        onUnauthorized,
        true,
      );

      setVehicleTypes(vehicleTypesData);
      setHasNextPage(vehicleTypesData.hasNextPage || false);
      setHasPreviousPage(page > 1);

      console.log("VehicleTypeListPage: Vehicle types fetched successfully:", {
        count: vehicleTypesData.results ? vehicleTypesData.results.length : 0,
        totalCount: vehicleTypesData.count,
      });
    } catch (error) {
      console.error(
        "VehicleTypeListPage: Failed to fetch vehicle types:",
        error,
      );
      setErrors({ fetch: error.message || "Failed to load vehicle types" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchVehicleTypes(
      nextPage,
      pageSize,
      actualSearchText,
      status,
      sortBy,
      sortOrder,
    );
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchVehicleTypes(
      prevPage,
      pageSize,
      actualSearchText,
      status,
      sortBy,
      sortOrder,
    );
  };

  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchVehicleTypes(
      1,
      pageSize,
      temporarySearchText,
      status,
      sortBy,
      sortOrder,
    );
  };

  const handleSortChange = (field) => {
    const newSortOrder =
      sortBy === field && sortOrder === "ASC" ? "DESC" : "ASC";
    setSortBy(field);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
    fetchVehicleTypes(
      1,
      pageSize,
      actualSearchText,
      status,
      field,
      newSortOrder,
    );
  };

  const handleDeleteConfirm = async () => {
    if (!selectedVehicleTypeForDeletion) return;

    setIsLoading(true);

    try {
      await vehicleTypeManager.deleteVehicleType(
        selectedVehicleTypeForDeletion.id,
        onUnauthorized,
      );

      fetchVehicleTypes(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        sortBy,
        sortOrder,
      );
      setSelectedVehicleTypeForDeletion(null);
      console.log("VehicleTypeListPage: Vehicle type deleted successfully");
    } catch (error) {
      console.error(
        "VehicleTypeListPage: Failed to delete vehicle type:",
        error,
      );
      setErrors({ delete: error.message || "Failed to delete vehicle type" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearFilter = () => {
    setStatus("");
    setSortBy("name");
    setSortOrder("ASC");
    setActualSearchText("");
    setTemporarySearchText("");
    setCurrentPage(1);
    fetchVehicleTypes(1, pageSize, "", "", "name", "ASC");
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);
      fetchVehicleTypes();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading && !vehicleTypes) {
    return <Loading message="Loading Vehicle Types..." />;
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
    sortableHeader: {
      cursor: "pointer",
      userSelect: "none",
    },
  };

  // Table columns configuration
  const columns = [
    {
      key: "name",
      label: "Name",
      align: "left",
      sortable: true,
      render: (value, row) => (
        <div>
          <strong>{value}</strong>
          {row.description && (
            <div style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}>
              {row.description.length > 50
                ? `${row.description.substring(0, 50)}...`
                : row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      align: "left",
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (value, row) => (
        <div style={styles.actionButtons}>
          <Button
            variant="info"
            size="sm"
            onClick={() =>
              navigate(`/admin/settings/vehicle-type/${row.id}/detail`)
            }
          >
            ℹ️ View
          </Button>
          <Button
            variant="warning"
            size="sm"
            onClick={() =>
              navigate(`/admin/settings/vehicle-type/${row.id}/update`)
            }
          >
            ✏️ Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedVehicleTypeForDeletion(row)}
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
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Settings", path: "/admin/settings", icon: "⚙️" },
          { label: "Vehicle Types", icon: "🚗" },
        ]}
      />

      <Card
        title="🚗 Vehicle Types"
        actions={
          <>
            <Button
              variant="info"
              size="sm"
              onClick={() =>
                fetchVehicleTypes(
                  currentPage,
                  pageSize,
                  actualSearchText,
                  status,
                  sortBy,
                  sortOrder,
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
            <Link to="/admin/settings/vehicle-type/create">
              <Button variant="success" size="sm">
                ➕ New Vehicle Type
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
                <Select
                  label="Sort By"
                  value={`${sortBy},${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split(",");
                    setSortBy(field);
                    setSortOrder(order);
                    setCurrentPage(1);
                    fetchVehicleTypes(
                      1,
                      pageSize,
                      actualSearchText,
                      status,
                      field,
                      order,
                    );
                  }}
                  options={[
                    { value: "name,ASC", label: "Name (A-Z)" },
                    { value: "name,DESC", label: "Name (Z-A)" },
                    { value: "created_at,ASC", label: "Created (Oldest)" },
                    { value: "created_at,DESC", label: "Created (Newest)" },
                  ]}
                />
              </div>

              <div>
                <Button
                  variant="secondary"
                  onClick={handleClearFilter}
                  size="sm"
                >
                  🗑️ Clear Filter
                </Button>
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
        vehicleTypes &&
        vehicleTypes.results &&
        vehicleTypes.results.length > 0 ? (
          <>
            <Table
              columns={columns}
              data={vehicleTypes.results}
              onRowClick={(row) =>
                navigate(`/admin/settings/vehicle-type/${row.id}/detail`)
              }
            />

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
                    fetchVehicleTypes(
                      1,
                      newPageSize,
                      actualSearchText,
                      status,
                      sortBy,
                      sortOrder,
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

            <div style={{ textAlign: "right", marginTop: "10px" }}>
              <strong>Total Results: {vehicleTypes.count}</strong>
            </div>
          </>
        ) : !isLoading &&
          vehicleTypes &&
          (!vehicleTypes.results || vehicleTypes.results.length === 0) ? (
          <div style={styles.noData}>
            <h2>📋 No Vehicle Types</h2>
            <p>
              No vehicle types found.{" "}
              <Link
                to="/admin/settings/vehicle-type/create"
                style={{ fontWeight: "bold" }}
              >
                Click here to add your first vehicle type →
              </Link>
            </p>
          </div>
        ) : null}

        {/* Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
          }}
        >
          <Link to="/admin/settings">
            <Button variant="secondary">← Back to Settings</Button>
          </Link>
          <Link to="/admin/settings/vehicle-type/create">
            <Button variant="success">➕ New Vehicle Type</Button>
          </Link>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedVehicleTypeForDeletion}
        onClose={() => setSelectedVehicleTypeForDeletion(null)}
        title="Confirm Deletion"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setSelectedVehicleTypeForDeletion(null)}
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
          Are you sure you want to delete the vehicle type "
          {selectedVehicleTypeForDeletion?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

export default SettingVehicleTypeListPage;
