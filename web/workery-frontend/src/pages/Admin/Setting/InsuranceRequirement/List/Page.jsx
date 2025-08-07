// File Path: web/workery-frontend/src/pages/Admin/Setting/InsuranceRequirement/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useInsuranceRequirementManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Select,
  Table,
  Modal,
} from "../../../../../components/UI";

function SettingInsuranceRequirementListPage() {
  const navigate = useNavigate();
  const insuranceRequirementManager = useInsuranceRequirementManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [insuranceRequirements, setInsuranceRequirements] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch insurance requirements
  const fetchInsuranceRequirements = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        limit: pageSize,
        sortBy,
        sortOrder,
        search: searchTerm,
        ...params,
      };

      const response =
        await insuranceRequirementManager.getInsuranceRequirements(
          queryParams,
          onUnauthorized,
          false, // Don't force refresh by default
        );

      setInsuranceRequirements(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
    } catch (err) {
      console.error("Failed to fetch insurance requirements:", err);
      setError(err.message || "Failed to load insurance requirements");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      await insuranceRequirementManager.deleteInsuranceRequirement(
        selectedItem.id,
        onUnauthorized,
      );

      setSuccessMessage("Insurance requirement deleted successfully");
      setShowDeleteModal(false);
      setSelectedItem(null);

      // Refresh the list
      await fetchInsuranceRequirements();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete insurance requirement:", err);
      setError(err.message || "Failed to delete insurance requirement");
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setTempSearchTerm("");
    setSortBy("name");
    setSortOrder("ASC");
    setCurrentPage(1);
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchInsuranceRequirements();
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Insurance Requirements", icon: "🛡️" },
  ];

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "Name",
      render: (value, item) => (
        <Link
          to={`/admin/settings/insurance-requirement/${item.id}/detail`}
          style={{ color: theme.colors.primary, textDecoration: "none" }}
        >
          {value}
        </Link>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <div
          style={{
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || "—"}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (value) => value || "—",
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, item) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(
                `/admin/settings/insurance-requirement/${item.id}/detail`,
              )
            }
          >
            View
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() =>
              navigate(
                `/admin/settings/insurance-requirement/${item.id}/update`,
              )
            }
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              setSelectedItem(item);
              setShowDeleteModal(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const sortOptions = [
    { value: "name", label: "Name" },
    { value: "created_at", label: "Created Date" },
    { value: "updated_at", label: "Updated Date" },
  ];

  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          🛡️ Insurance Requirements
        </h1>
        <Button
          onClick={() =>
            navigate("/admin/settings/insurance-requirement/create")
          }
        >
          ➕ New Insurance Requirement
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      <Card title="Filter & Search">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label style={globalStyles.label}>Search</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Search by name..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                style={{ ...globalStyles.input, flex: 1 }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>🔍</Button>
            </div>
          </div>

          <Select
            label="Sort By"
            value={`${sortBy},${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(",");
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            options={sortOptions.flatMap((option) => [
              { value: `${option.value},ASC`, label: `${option.label} (A-Z)` },
              { value: `${option.value},DESC`, label: `${option.label} (Z-A)` },
            ])}
          />

          <Select
            label="Items per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            options={pageSizeOptions}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outline" onClick={clearFilters}>
            🗑️ Clear Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchInsuranceRequirements({ forceRefresh: true })}
          >
            🔄 Refresh
          </Button>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Loading message="Loading insurance requirements..." />
        ) : insuranceRequirements.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>No Insurance Requirements Found</h3>
            {searchTerm ? (
              <p>No insurance requirements match your search criteria.</p>
            ) : (
              <p>No insurance requirements have been created yet.</p>
            )}
            <Button
              onClick={() =>
                navigate("/admin/settings/insurance-requirement/create")
              }
              style={{ marginTop: "15px" }}
            >
              ➕ Create First Insurance Requirement
            </Button>
          </div>
        ) : (
          <>
            <div
              style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}
            >
              Showing {insuranceRequirements.length} of {totalCount} insurance
              requirements
            </div>

            <Table
              columns={tableColumns}
              data={insuranceRequirements}
              onRowClick={(item) =>
                navigate(
                  `/admin/settings/insurance-requirement/${item.id}/detail`,
                )
              }
            />

            {/* Pagination */}
            {totalCount > pageSize && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ← Previous
                </Button>
                <span style={{ padding: "0 15px" }}>
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  variant="outline"
                  disabled={!hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false);
            setSelectedItem(null);
          }
        }}
        title="Delete Insurance Requirement"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedItem(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </>
        }
      >
        {selectedItem && (
          <div>
            <p>Are you sure you want to delete this insurance requirement?</p>
            <div
              style={{
                background: "#f8f9fa",
                padding: "15px",
                borderRadius: "4px",
                margin: "15px 0",
              }}
            >
              <strong>Name:</strong> {selectedItem.name}
              <br />
              {selectedItem.description && (
                <>
                  <strong>Description:</strong> {selectedItem.description}
                </>
              )}
            </div>
            <p style={{ color: theme.colors.danger, fontSize: "14px" }}>
              <strong>Warning:</strong> This action cannot be undone.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SettingInsuranceRequirementListPage;
