// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Search/ResultPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Select,
  Table,
} from "../../../../components/UI";
import {
  PAGE_SIZE_OPTIONS,
  DEFAULT_STAFF_LIST_SORT_BY_VALUE,
} from "../../../../constants/FieldOptions";

// Staff type filter options
const STAFF_TYPE_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Executive" },
  { value: 2, label: "Management" },
  { value: 3, label: "Frontline" },
];

// Staff status filter options
const STAFF_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

// Staff sort options
const STAFF_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "join_date,DESC", label: "Join Date (Newest → Oldest)" },
  { value: "join_date,ASC", label: "Join Date (Oldest → Newest)" },
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
];

// Staff type mapping
const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

function AdminStaffSearchResultPage() {
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const [searchParams] = useSearchParams();

  // Extract search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const isActive = searchParams.get("active") === "1";

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
  const [status, setStatus] = useState(isActive ? 1 : 0);
  const [type, setType] = useState(0);

  // UI state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] =
    useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Staff", path: "/admin/staff", icon: "👔" },
    { label: "Search", path: "/admin/staff/search", icon: "🔍" },
    { label: "Results", icon: "📋" },
  ];

  // Fetch staff list based on search criteria
  const fetchStaffList = useCallback(() => {
    console.log("Fetching search results with:", {
      firstName,
      lastName,
      email,
      phone,
      status,
      type,
      sortBy,
      pageSize,
      currentCursor,
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

    // Add search criteria from URL
    if (firstName) filtersMap.set("first_name", firstName);
    if (lastName) filtersMap.set("last_name", lastName);
    if (email) filtersMap.set("email", email);
    if (phone) filtersMap.set("phone", phone);

    // Add filters
    if (status > 0) {
      filtersMap.set("status", status);
    }

    if (type > 0) {
      filtersMap.set("type", type);
    }

    console.log("API call with filters:", Array.from(filtersMap.entries()));

    // Use the manager to fetch staff with force refresh
    staffManager.getStaffWithFiltersMapWithCallbacks(
      filtersMap,
      onFetchSuccess,
      onFetchError,
      onFetchDone,
      onUnauthorized,
      true, // Force refresh to bypass cache
    );
  }, [
    firstName,
    lastName,
    email,
    phone,
    currentCursor,
    pageSize,
    sortBy,
    status,
    type,
  ]);

  const onFetchSuccess = (response) => {
    console.log("Search results fetched successfully:", {
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
    console.error("Error fetching search results:", error);
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
      const newPreviousCursors = [...previousCursors];
      newPreviousCursors.push(currentCursor);
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
    }
  };

  // Filter change handlers
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  const handleStatusChange = (e) => {
    setStatus(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  const handleTypeChange = (e) => {
    setType(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setPreviousCursors([]);
    setCurrentCursor("");
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
    // Refresh the list
    fetchStaffList();
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

  // Build search criteria display
  const getSearchCriteriaDisplay = () => {
    const criteria = [];
    if (firstName) criteria.push(`First Name: "${firstName}"`);
    if (lastName) criteria.push(`Last Name: "${lastName}"`);
    if (email) criteria.push(`Email: "${email}"`);
    if (phone) criteria.push(`Phone: "${phone}"`);
    if (isActive) criteria.push("Active Staff Only");
    return criteria.length > 0 ? criteria.join(", ") : "None";
  };

  // Effect to fetch data when component mounts or filters change
  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  // Render
  if (isLoading && !staffList) {
    return <Loading message="Searching staff..." />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ fontSize: "2rem", marginBottom: "20px" }}>
        🔍 Search Results
      </h1>

      {/* Search Criteria Display */}
      <Card
        title="Search Criteria"
        style={{ marginBottom: "20px", backgroundColor: "#f0f8ff" }}
      >
        <p>
          <strong>Searching for:</strong> {getSearchCriteriaDisplay()}
        </p>
        <div style={{ marginTop: "15px" }}>
          <Link to="/admin/staff/search">
            <Button variant="secondary">🔍 New Search</Button>
          </Link>
        </div>
      </Card>

      {/* Error display */}
      {errors.message && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Filters */}
      {showFilters && (
        <Card title="Additional Filters" style={{ marginBottom: "20px" }}>
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
          </div>
        </Card>
      )}

      {/* Toggle filters button */}
      <div style={{ marginBottom: "20px" }}>
        <Button variant="info" onClick={() => setShowFilters(!showFilters)}>
          {showFilters ? "🔽 Hide" : "▶️ Show"} Additional Filters
        </Button>
      </div>

      {/* Results table */}
      <Card
        title={`Search Results ${staffList && staffList.count ? `(${staffList.count} found)` : ""}`}
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
            <p style={{ fontSize: "1.2rem", marginBottom: "20px" }}>
              No staff members found matching your search criteria.
            </p>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Try adjusting your search terms or filters.
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <Link to="/admin/staff/search">
                <Button variant="primary">🔍 New Search</Button>
              </Link>
              <Link to="/admin/staff">
                <Button variant="secondary">View All Staff</Button>
              </Link>
            </div>
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

export default AdminStaffSearchResultPage;
