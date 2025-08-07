// File Path: web/workery-frontend/src/pages/Admin/Setting/ServiceFee/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useServiceFeeManager } from "../../../../../services/Services";
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
} from "../../../../../components/UI";

function SettingServiceFeeListPage() {
  const serviceFeeManager = useServiceFeeManager();
  const navigate = useNavigate();

  // Component state
  const [serviceFees, setServiceFees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [statusFilter, setStatusFilter] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchServiceFees = async (page = 1, forceRefresh = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: pageSize,
        search: searchTerm,
        sortBy,
        sortOrder,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await serviceFeeManager.getServiceFees(
        params,
        onUnauthorized,
        forceRefresh,
      );

      setServiceFees(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
      setHasPreviousPage(page > 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch service fees:", err);
      setError(err.message || "Failed to load service fees");
      setServiceFees([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceFees(1);
  }, [pageSize, searchTerm, sortBy, sortOrder, statusFilter]);

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setTempSearchTerm("");
    setSearchTerm("");
    setSortBy("name");
    setSortOrder("ASC");
    setStatusFilter("");
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchServiceFees(currentPage, true);
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      fetchServiceFees(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchServiceFees(currentPage + 1);
    }
  };

  const handleRowClick = (serviceFee) => {
    navigate(`/admin/settings/service-fee/${serviceFee.id}/detail`);
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Service Fees", icon: "💳" },
  ];

  const sortOptions = [
    { value: "name,ASC", label: "Name (A-Z)" },
    { value: "name,DESC", label: "Name (Z-A)" },
    { value: "percentage,ASC", label: "Percentage (Low to High)" },
    { value: "percentage,DESC", label: "Percentage (High to Low)" },
    { value: "created_at,DESC", label: "Newest First" },
    { value: "created_at,ASC", label: "Oldest First" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "1", label: "Active" },
    { value: "2", label: "Inactive" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  const tableColumns = [
    {
      key: "name",
      label: "Name",
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
      key: "percentage",
      label: "Rate",
      render: (value, row) => {
        if (row.percentage && row.percentage > 0) {
          return `${row.percentage}%`;
        }
        if (row.amount && row.amount > 0) {
          return `$${parseFloat(row.amount).toFixed(2)}`;
        }
        return "Not set";
      },
    },
    {
      key: "status",
      label: "Status",
      render: (value) => (
        <span
          style={{
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "bold",
            color: "white",
            backgroundColor:
              value === 1 ? theme.colors.success : theme.colors.secondary,
          }}
        >
          {value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => (
        <div style={{ fontSize: "12px" }}>
          {value ? new Date(value).toLocaleDateString() : "Unknown"}
        </div>
      ),
    },
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
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "bold" }}>
          💳 Service Fees
        </h1>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button variant="outline" onClick={handleRefresh}>
            🔄 Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate("/admin/settings/service-fee/create")}
          >
            ➕ Add Service Fee
          </Button>
        </div>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        {/* Filters Section */}
        <div
          style={{
            padding: "20px",
            backgroundColor: theme.colors.light,
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "15px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <h3 style={{ margin: 0, fontSize: "16px" }}>
              🔍 Filtering & Sorting
            </h3>
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              ✕ Clear Filters
            </Button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
              alignItems: "end",
            }}
          >
            <div>
              <label style={globalStyles.label}>Search</label>
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  value={tempSearchTerm}
                  onChange={(e) => setTempSearchTerm(e.target.value)}
                  placeholder="Search by name..."
                  style={{
                    ...globalStyles.input,
                    margin: 0,
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <Button onClick={handleSearch} size="md">
                  🔍
                </Button>
              </div>
            </div>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />

            <Select
              label="Sort By"
              value={`${sortBy},${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(",");
                setSortBy(field);
                setSortOrder(order);
              }}
              options={sortOptions}
            />

            <Select
              label="Page Size"
              value={pageSize.toString()}
              onChange={(e) => {
                setPageSize(parseInt(e.target.value));
                setCurrentPage(1);
              }}
              options={pageSizeOptions}
            />
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <Loading message="Loading service fees..." />
        ) : serviceFees.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>💳</div>
            <h3 style={{ marginBottom: "10px" }}>No Service Fees Found</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              {searchTerm || statusFilter
                ? "No service fees match your current filters."
                : "You haven't created any service fees yet."}
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/admin/settings/service-fee/create")}
            >
              ➕ Create Your First Service Fee
            </Button>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "10px 0",
                borderBottom: "1px solid #eee",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>
                Showing {serviceFees.length} of {totalCount} service fees
                {searchTerm && ` matching "${searchTerm}"`}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Page {currentPage}
              </div>
            </div>

            {/* Table */}
            <Table
              columns={tableColumns}
              data={serviceFees}
              onRowClick={handleRowClick}
            />

            {/* Pagination */}
            {(hasPreviousPage || hasNextPage) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "30px",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <Button
                  variant="outline"
                  onClick={handlePreviousPage}
                  disabled={!hasPreviousPage}
                >
                  ← Previous
                </Button>
                <span style={{ fontSize: "14px", color: "#666" }}>
                  Page {currentPage}
                </span>
                <Button
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={!hasNextPage}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default SettingServiceFeeListPage;
