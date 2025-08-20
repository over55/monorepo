// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/List/Page.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Select,
  Input,
  Table,
} from "../../../../components/UI";
import {
  PAGE_SIZE_OPTIONS,
  DEFAULT_STAFF_LIST_SORT_BY_VALUE,
} from "../../../../constants/FieldOptions";
import {
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_STATUS_FILTER_OPTIONS,
  STAFF_SORT_OPTIONS,
  STAFF_TYPE_MAP,
} from "../../../../constants/Staff";

function AdminStaffListPage() {
  const navigate = useNavigate();
  const staffManager = useStaffManager();

  // List state
  const [staffList, setStaffList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Pagination state
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Filter state
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [status, setStatus] = useState(1); // Default to active
  const [type, setType] = useState(0); // All types
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] =
    useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Force refresh counter to bypass cache
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", icon: "👔" },
  ];

  // Fetch staff list with useCallback to prevent infinite loops
  const fetchStaffList = useCallback(
    (forceRefresh = false) => {
      console.log("fetchStaffList called with:", {
        forceRefresh,
        currentCursor,
        pageSize,
        sortBy,
        status,
        type,
        searchQuery,
      });

      setIsLoading(true);
      setErrors({});

      // Build filters map for the API
      const filtersMap = new Map();
      filtersMap.set("pageSize", pageSize);

      // Add cursor for pagination
      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Add sorting
      const [sortField, sortOrder] = sortBy.split(",");
      filtersMap.set("sortField", sortField);
      filtersMap.set("sortOrder", sortOrder);

      // Add filters
      if (status > 0) {
        filtersMap.set("status", status);
      }

      if (type > 0) {
        filtersMap.set("type", type);
      }

      if (searchQuery && searchQuery.trim()) {
        filtersMap.set("search", searchQuery.trim());
      }

      console.log("API call with filters:", Array.from(filtersMap.entries()));

      // Use the manager to fetch staff with force refresh flag
      staffManager.getStaffWithFiltersMapWithCallbacks(
        filtersMap,
        onFetchSuccess,
        onFetchError,
        onFetchDone,
        onUnauthorized,
        forceRefresh, // Pass the force refresh flag
      );
    },
    [currentCursor, pageSize, sortBy, status, type, searchQuery],
  );

  const onFetchSuccess = (response) => {
    console.log("Staff list fetched successfully:", {
      resultCount: response.results?.length || 0,
      totalCount: response.count,
      hasNextPage: response.hasNextPage,
    });
    setStaffList(response);

    // Update pagination state
    if (response.hasNextPage) {
      setNextCursor(response.nextCursor);
    } else {
      setNextCursor("");
    }
  };

  const onFetchError = (error) => {
    console.error("Error fetching staff list:", error);
    setErrors(error);
  };

  const onFetchDone = () => {
    setIsLoading(false);
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (nextCursor) {
      console.log("Going to next page with cursor:", nextCursor);
      const newPreviousCursors = [...previousCursors];
      newPreviousCursors.push(currentCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      console.log("Going to previous page");
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
    }
  };

  // Search handler
  const handleSearch = () => {
    console.log("Search triggered with query:", tempSearchQuery);
    setSearchQuery(tempSearchQuery);
    // Reset pagination when search changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filter change handlers
  const handleSortByChange = (e) => {
    const newSortBy = e.target.value;
    console.log("Sort by changed from", sortBy, "to:", newSortBy);
    setSortBy(newSortBy);
    // Reset pagination when sort changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handleStatusChange = (e) => {
    const newStatus = parseInt(e.target.value);
    console.log("Status changed from", status, "to:", newStatus);
    setStatus(newStatus);
    // Reset pagination when status changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handleTypeChange = (e) => {
    const newType = parseInt(e.target.value);
    console.log("Type changed from", type, "to:", newType);
    setType(newType);
    // Reset pagination when type changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value);
    console.log("Page size changed from", pageSize, "to:", newPageSize);
    setPageSize(newPageSize);
    // Reset pagination when page size changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  // Clear filters
  const handleClearFilters = () => {
    console.log("Clearing all filters");
    setSortBy("lexical_name,ASC");
    setStatus(1);
    setType(0);
    setSearchQuery("");
    setTempSearchQuery("");
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("");
    // Force refresh
    setRefreshCounter((prev) => prev + 1);
  };

  // Delete handlers
  const handleSelectForDeletion = (staff) => {
    setSelectedStaffForDeletion(staff);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStaffForDeletion) {
      setIsLoading(true);

      staffManager.archiveStaffWithCallbacks(
        selectedStaffForDeletion.id,
        onDeleteSuccess,
        onDeleteError,
        onDeleteDone,
        onUnauthorized,
      );
    }
  };

  const onDeleteSuccess = () => {
    console.log("Staff archived successfully");
    setShowDeleteModal(false);
    setSelectedStaffForDeletion(null);

    // Force refresh the list
    setRefreshCounter((prev) => prev + 1);
  };

  const onDeleteError = (error) => {
    console.error("Error archiving staff:", error);
    setErrors(error);
    setShowDeleteModal(false);
  };

  const onDeleteDone = () => {
    setIsLoading(false);
  };

  // Table columns configuration
  const tableColumns = [
    {
      key: "name",
      label: "Name",
      render: (_, row) => (
        <Link
          to={`/admin/staff/${row.id}`}
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          {row.name || `${row.firstName} ${row.lastName}`}
        </Link>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) =>
        value ? <a href={`mailto:${value}`}>{value}</a> : "-",
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => value || "-",
    },
    {
      key: "type",
      label: "Type",
      render: (value) => STAFF_TYPE_MAP[value] || "-",
    },
    {
      key: "status",
      label: "Status",
      render: (value) => {
        const statusMap = { 1: "Active", 2: "Archived" };
        const statusColors = { 1: "green", 2: "gray" };
        return (
          <span style={{ color: statusColors[value] || "black" }}>
            {statusMap[value] || "Unknown"}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Link to={`/admin/staff/${row.id}`}>
            <Button size="sm" variant="primary">
              View
            </Button>
          </Link>
          <Link to={`/admin/staff/${row.id}/edit`}>
            <Button size="sm" variant="secondary">
              Edit
            </Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleSelectForDeletion(row)}
          >
            Archive
          </Button>
        </div>
      ),
    },
  ];

  // Initial load effect
  useEffect(() => {
    console.log("Initial load effect triggered");
    fetchStaffList(true); // Force refresh on initial load
  }, []); // Empty dependency array for initial load only

  // Effect for filter changes and pagination
  useEffect(() => {
    console.log("Filter/pagination effect triggered", {
      currentCursor,
      pageSize,
      sortBy,
      status,
      type,
      searchQuery,
      refreshCounter,
    });

    // Only fetch if we have initialized (not on initial mount)
    if (refreshCounter > 0 || currentCursor) {
      fetchStaffList(true); // Always force refresh to bypass cache
    }
  }, [
    currentCursor,
    pageSize,
    sortBy,
    status,
    type,
    searchQuery,
    refreshCounter,
    fetchStaffList,
  ]);

  // Render
  if (isLoading && !staffList) {
    return <Loading message="Loading staff..." />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        👔 Staff Management
      </h1>

      {/* Action buttons */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <Link to="/admin/staff/add/step-1-search">
          <Button variant="primary">➕ Add Staff</Button>
        </Link>
        <Link to="/admin/staff/search">
          <Button variant="secondary">🔍 Search Staff</Button>
        </Link>
        <Button variant="info" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "🔽" : "▶️"} Filters
        </Button>
      </div>

      {/* Error display */}
      {errors.message && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Filters */}
      {showFilters && (
        <Card title="Filters" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <Select
              label="Sort By"
              value={sortBy}
              onChange={handleSortByChange}
              options={STAFF_SORT_OPTIONS}
            />

            <Select
              label="Status"
              value={status}
              onChange={handleStatusChange}
              options={STAFF_STATUS_FILTER_OPTIONS}
            />

            <Select
              label="Type"
              value={type}
              onChange={handleTypeChange}
              options={STAFF_TYPE_FILTER_OPTIONS}
            />

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
              <div style={{ display: "flex", gap: "5px" }}>
                <input
                  type="text"
                  value={tempSearchQuery}
                  onChange={(e) => setTempSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  placeholder="Search by name, email..."
                  style={{
                    flex: 1,
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
                <Button onClick={handleSearch} variant="primary">
                  Search
                </Button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "15px" }}>
            <Button onClick={handleClearFilters} variant="secondary">
              Clear Filters
            </Button>
          </div>
        </Card>
      )}

      {/* Staff list table */}
      <Card
        title={`Staff List ${staffList && staffList.count ? `(${staffList.count} total)` : ""}`}
      >
        {staffList && staffList.results && staffList.results.length > 0 ? (
          <>
            <Table columns={tableColumns} data={staffList.results} />

            {/* Pagination controls */}
            <div
              style={{
                marginTop: "20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <span>Show:</span>
                <Select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  options={PAGE_SIZE_OPTIONS}
                />
                <span>
                  Showing {staffList.results.length} of {staffList.count || 0}
                </span>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button
                  onClick={handlePreviousPage}
                  disabled={previousCursors.length === 0}
                  variant="secondary"
                >
                  ← Previous
                </Button>
                <Button
                  onClick={handleNextPage}
                  disabled={!staffList.hasNextPage}
                  variant="secondary"
                >
                  Next →
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p>No staff members found.</p>
            {(status !== 1 || type !== 0 || searchQuery) && (
              <p style={{ marginTop: "10px" }}>
                Try adjusting your filters or clearing them to see more results.
              </p>
            )}
            <Link to="/admin/staff/add/step-1-search">
              <Button variant="primary" style={{ marginTop: "20px" }}>
                Add First Staff Member
              </Button>
            </Link>
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStaffForDeletion(null);
        }}
        title="Archive Staff Member?"
        footer={
          <>
            <Button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedStaffForDeletion(null);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              variant="danger"
              disabled={isLoading}
            >
              {isLoading ? "Archiving..." : "Archive"}
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to archive{" "}
          <strong>
            {selectedStaffForDeletion
              ? `${selectedStaffForDeletion.firstName} ${selectedStaffForDeletion.lastName}`
              : "this staff member"}
          </strong>
          ?
        </p>
        <p style={{ marginTop: "10px" }}>
          This staff member will no longer appear in active lists. This action
          can be undone by a system administrator.
        </p>
      </Modal>
    </div>
  );
}

export default AdminStaffListPage;
