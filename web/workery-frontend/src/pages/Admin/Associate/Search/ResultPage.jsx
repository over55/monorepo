// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Search/ResultPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Select,
  FormGroup,
} from "../../../../components/UI";

// Constants for associate types and statuses
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
const ASSOCIATE_STATUS_ACTIVE = 1;

// Sort options
const ASSOCIATE_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
];

// Status filter options
const ASSOCIATE_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Type filter options
const ASSOCIATE_TYPE_OF_FILTER_OPTIONS = [
  { value: "0", label: "All" },
  { value: "1", label: "Residential" },
  { value: "2", label: "Commercial" },
];

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

function AdminAssociateSearchResultPage() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Extract search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const organizationName = searchParams.get("on") || "";
  const isActive = searchParams.get("active") === "1";

  // Component states
  const [errors, setErrors] = useState({});
  const [associates, setAssociates] = useState(null);
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] =
    useState(null);
  const [isFetching, setFetching] = useState(false);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("lexical_name,ASC");
  const [status, setStatus] = useState(isActive ? "1" : "");
  const [typeOf, setTypeOf] = useState("0");
  const [createdAtGTE, setCreatedAtGTE] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Fetch associates list
  const fetchList = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Build filters map for API call
      const filtersMap = new Map();
      filtersMap.set("pageSize", pageSize);

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Sort parameters
      const sortArray = sortByValue.split(",");
      filtersMap.set("sortField", sortArray[0]);
      filtersMap.set("sortOrder", sortArray[1]);

      // Search parameters from URL
      if (firstName) filtersMap.set("firstName", firstName);
      if (lastName) filtersMap.set("lastName", lastName);
      if (email) filtersMap.set("email", email);
      if (phone) filtersMap.set("phone", phone);
      if (organizationName)
        filtersMap.set("organizationName", organizationName);

      // Filter parameters
      if (status) filtersMap.set("status", status);
      if (typeOf && typeOf !== "0") filtersMap.set("type", typeOf);
      if (createdAtGTE) {
        const date = new Date(createdAtGTE);
        filtersMap.set("createdAtGte", date.getTime());
      }

      // Call API through manager
      const response = await associateManager.getAssociatesWithFiltersMap(
        filtersMap,
        () => navigate("/login?unauthorized=true"),
      );

      setAssociates(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  // Fetch list when parameters change
  useEffect(() => {
    fetchList();
  }, [currentCursor, pageSize, sortByValue, status, typeOf, createdAtGTE]);

  // Handle pagination
  const onNextClicked = () => {
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Handle associate deletion
  const onDeleteConfirmButtonClick = async () => {
    if (!selectedAssociateForDeletion) return;

    try {
      setFetching(true);
      await associateManager.archiveAssociate(
        selectedAssociateForDeletion.id,
        () => navigate("/login?unauthorized=true"),
      );

      setSuccessMessage("Associate archived successfully");
      setSelectedAssociateForDeletion(null);

      // Refresh the list
      fetchList();

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Failed to archive associate:", error);
      setErrors({ message: "Failed to archive associate" });
    } finally {
      setFetching(false);
    }
  };

  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Search", path: "/admin/associates/search", icon: "🔍" },
    { label: "Results", icon: "📋" },
  ];

  if (isFetching && !associates) {
    return <Loading message="Loading search results..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1 style={{ marginBottom: "10px" }}>👷 Associates</h1>
      <h4 style={{ marginBottom: "30px", color: "#666" }}>🔍 Search Results</h4>
      <hr style={{ marginBottom: "30px" }} />

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}
      {errors.message && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedAssociateForDeletion}
        onClose={() => setSelectedAssociateForDeletion(null)}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => setSelectedAssociateForDeletion(null)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={onDeleteConfirmButtonClick} variant="danger">
              Confirm Archive
            </Button>
          </>
        }
      >
        <p>
          You are about to <strong>archive</strong> this associate. It will no
          longer appear on your dashboard. This action can be undone but you'll
          need to contact the system administrator. Are you sure you would like
          to continue?
        </p>
      </Modal>

      {/* Results Card */}
      <Card title="📋 Search Results">
        {/* Filter Panel */}
        <div
          style={{
            backgroundColor: theme.colors.light,
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h5 style={{ marginBottom: "15px" }}>🔧 Filtering & Sorting</h5>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "15px",
            }}
          >
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={ASSOCIATE_STATUS_FILTER_OPTIONS}
            />

            <Select
              label="Type"
              value={typeOf}
              onChange={(e) => setTypeOf(e.target.value)}
              options={ASSOCIATE_TYPE_OF_FILTER_OPTIONS}
            />

            <FormGroup>
              <label style={globalStyles.label}>Created After</label>
              <input
                type="date"
                value={createdAtGTE}
                onChange={(e) => setCreatedAtGTE(e.target.value)}
                style={globalStyles.input}
              />
            </FormGroup>

            <Select
              label="Sort by"
              value={sortByValue}
              onChange={(e) => setSortByValue(e.target.value)}
              options={ASSOCIATE_SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Search Criteria Summary */}
        <div
          style={{
            backgroundColor: "#f0f9ff",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <strong>Search Criteria:</strong>
          <ul style={{ marginTop: "10px", marginBottom: 0 }}>
            {firstName && <li>First Name: {firstName}</li>}
            {lastName && <li>Last Name: {lastName}</li>}
            {email && <li>Email: {email}</li>}
            {phone && <li>Phone: {phone}</li>}
            {organizationName && <li>Organization: {organizationName}</li>}
            <li>Status: {isActive ? "Active Only" : "All"}</li>
          </ul>
        </div>

        {/* Results Display */}
        {isFetching ? (
          <Loading message="Updating results..." />
        ) : (
          <>
            {associates &&
            associates.results &&
            associates.results.length > 0 ? (
              <>
                {/* Results Grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
                  {associates.results.map((associate) => (
                    <div
                      key={associate.id}
                      style={{
                        ...globalStyles.card,
                        backgroundColor: "#e6f4ff",
                        cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 8px rgba(0,0,0,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      {/* Card Header */}
                      <div style={{ marginBottom: "15px" }}>
                        <Link
                          to={`/admin/associate/${associate.id}`}
                          style={{
                            textDecoration: "none",
                            color: theme.colors.primary,
                            fontWeight: "bold",
                            fontSize: "16px",
                          }}
                        >
                          {associate.type ===
                            COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                            <>
                              🏢{" "}
                              {associate.organizationName ||
                                `${associate.firstName} ${associate.lastName}`}
                            </>
                          )}
                          {associate.type ===
                            RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                            <>
                              🏠 {associate.firstName} {associate.lastName}
                            </>
                          )}
                        </Link>
                      </div>

                      {/* Card Body */}
                      <div style={{ fontSize: "14px", lineHeight: "1.6" }}>
                        {associate.type ===
                          RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                          <div style={{ marginBottom: "5px" }}>
                            <strong>
                              {associate.firstName} {associate.lastName}
                            </strong>
                          </div>
                        )}
                        <div>{associate.addressLine1 || "-"}</div>
                        <div>
                          {associate.city && associate.region
                            ? `${associate.city}, ${associate.region}`
                            : "-"}
                        </div>
                        <div>
                          📞{" "}
                          {associate.phone ? (
                            <a
                              href={`tel:${associate.phone}`}
                              style={{
                                textDecoration: "none",
                                color: theme.colors.primary,
                              }}
                            >
                              {formatPhone(associate.phone)}
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                        <div>
                          ✉️{" "}
                          {associate.email ? (
                            <a
                              href={`mailto:${associate.email}`}
                              style={{
                                textDecoration: "none",
                                color: theme.colors.primary,
                              }}
                            >
                              {associate.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div
                        style={{
                          marginTop: "15px",
                          paddingTop: "15px",
                          borderTop: "1px solid #ccc",
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Link
                          to={`/admin/associate/${associate.id}`}
                          style={{
                            textDecoration: "none",
                            color: theme.colors.primary,
                            fontWeight: "500",
                          }}
                        >
                          View Details →
                        </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAssociateForDeletion(associate);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: theme.colors.danger,
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
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
                    <label style={{ marginRight: "10px" }}>
                      Results per page:
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(parseInt(e.target.value))}
                      style={{
                        padding: "5px 10px",
                        borderRadius: "4px",
                        border: "1px solid #ddd",
                      }}
                    >
                      {PAGE_SIZE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    {previousCursors.length > 0 && (
                      <Button onClick={onPreviousClicked} variant="secondary">
                        ← Previous
                      </Button>
                    )}
                    {associates.hasNextPage && (
                      <Button onClick={onNextClicked} variant="secondary">
                        Next →
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  backgroundColor: theme.colors.light,
                  borderRadius: "8px",
                }}
              >
                <h3>📋 No Associates Found</h3>
                <p style={{ marginTop: "10px", color: "#666" }}>
                  No associates found matching your search criteria.
                </p>
                <Link
                  to="/admin/associates/search"
                  style={{
                    display: "inline-block",
                    marginTop: "20px",
                    color: theme.colors.primary,
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  ← Search Again
                </Link>
              </div>
            )}
          </>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            paddingTop: "20px",
            borderTop: "1px solid #e0e0e0",
          }}
        >
          <Link
            to="/admin/associates/search"
            style={{ textDecoration: "none" }}
          >
            <Button variant="secondary">← Search Again</Button>
          </Link>

          <Link to="/admin/associates" style={{ textDecoration: "none" }}>
            <Button variant="outline">Back to Associates</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default AdminAssociateSearchResultPage;
