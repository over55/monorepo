// File Path: web/workery-frontend/src/pages/Admin/Setting/AssociateAwayLog/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAssociateAwayLogManager } from "../../../../../services/Services";
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

// Constants for the page
const SORT_OPTIONS = [
  { value: "created_at,ASC", label: "Created At ▲" },
  { value: "created_at,DESC", label: "Created At ▼" },
  { value: "start_date,ASC", label: "Start Date ▲" },
  { value: "start_date,DESC", label: "Start Date ▼" },
];

const STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
];

const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Policy check expired",
};

function SettingAssociateAwayLogListPage() {
  const associateAwayLogManager = useAssociateAwayLogManager();
  const navigate = useNavigate();

  // State management
  const [associateAwayLogs, setAssociateAwayLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Filter and pagination state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate away logs
  const fetchAssociateAwayLogs = async (page = 1, forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: page,
        limit: pageSize,
        search: searchText.trim() || undefined,
        status: statusFilter || undefined,
      };

      // Add sorting
      if (sortBy) {
        const [field, order] = sortBy.split(",");
        params.sortBy = field;
        params.sortOrder = order;
      }

      const response = await associateAwayLogManager.getAssociateAwayLogs(
        params,
        onUnauthorized,
        forceRefresh,
      );

      setAssociateAwayLogs(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to fetch associate away logs:", err);
      setError(err.message || "Failed to load associate away logs");
      setAssociateAwayLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchAssociateAwayLogs(1, true);
  };

  // Handle filter changes
  const handleFilterChange = (newStatusFilter) => {
    setStatusFilter(newStatusFilter);
    setCurrentPage(1);
  };

  // Handle sort changes
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  // Handle page size changes
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      fetchAssociateAwayLogs(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      fetchAssociateAwayLogs(currentPage + 1);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setSortBy("created_at,DESC");
    setCurrentPage(1);
  };

  // Handle row click
  const handleRowClick = (associateAwayLog) => {
    navigate(
      `/admin/settings/associate-away-log/${associateAwayLog.id}/detail`,
    );
  };

  // Initial load
  useEffect(() => {
    fetchAssociateAwayLogs(1);
  }, [pageSize, statusFilter, sortBy]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  // Table columns configuration
  const columns = [
    {
      key: "associateName",
      label: "Associate",
      render: (value, row) => (
        <Link
          to={`/admin/associate/${row.associateId}`}
          className="text-blue-600 hover:text-blue-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          {value || `Associate #${row.associateId}`}
        </Link>
      ),
    },
    {
      key: "reason",
      label: "Reason",
      render: (value, row) => {
        if (value === 1) {
          return row.reasonOther || "Other";
        }
        return REASON_MAP[value] || "Unknown";
      },
    },
    {
      key: "startDate",
      label: "Start Date",
      render: (value) => formatDate(value),
    },
    {
      key: "untilDate",
      label: "Until",
      render: (value, row) => {
        if (row.untilFurtherNotice === 1) {
          return "Further Notice";
        }
        return formatDate(value);
      },
    },
    {
      key: "createdAt",
      label: "Created",
      render: (value) => formatDate(value),
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Associate Away Logs", icon: "📅" },
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
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          📅 Associate Away Logs
        </h1>
        <Button
          onClick={() => navigate("/admin/settings/associate-away-log/create")}
          variant="primary"
        >
          ➕ Add Away Log
        </Button>
      </div>

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        {/* Filters */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
            padding: "20px",
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "600",
              }}
            >
              Search
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="Search by associate name..."
                style={{
                  ...globalStyles.input,
                  flex: 1,
                }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} size="sm">
                🔍
              </Button>
            </div>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "600",
              }}
            >
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              style={globalStyles.input}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "600",
              }}
            >
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              style={globalStyles.input}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "end" }}>
            <Button onClick={clearFilters} variant="outline" size="sm">
              🗑️ Clear Filters
            </Button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <Loading message="Loading associate away logs..." />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
                fontSize: "14px",
                color: "#666",
              }}
            >
              <span>
                Showing {associateAwayLogs.length} of {totalCount} away logs
              </span>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <label>Show:</label>
                <select
                  value={pageSize}
                  onChange={(e) =>
                    handlePageSizeChange(parseInt(e.target.value))
                  }
                  style={{
                    ...globalStyles.input,
                    width: "auto",
                    padding: "5px",
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {associateAwayLogs.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  data={associateAwayLogs}
                  onRowClick={handleRowClick}
                />

                {/* Pagination */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                  }}
                >
                  <div style={{ fontSize: "14px", color: "#666" }}>
                    Page {currentPage}
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      onClick={handlePreviousPage}
                      disabled={currentPage <= 1}
                      variant="outline"
                      size="sm"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={handleNextPage}
                      disabled={!hasNextPage}
                      variant="outline"
                      size="sm"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{ textAlign: "center", padding: "40px", color: "#666" }}
              >
                <div style={{ fontSize: "48px", marginBottom: "10px" }}>📅</div>
                <h3>No Associate Away Logs Found</h3>
                <p>
                  {searchText || statusFilter
                    ? "No away logs match your current filters."
                    : "No associate away logs have been created yet."}
                </p>
                {!searchText && !statusFilter && (
                  <Button
                    onClick={() =>
                      navigate("/admin/settings/associate-away-log/create")
                    }
                    variant="primary"
                    style={{ marginTop: "15px" }}
                  >
                    ➕ Create First Away Log
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default SettingAssociateAwayLogListPage;
