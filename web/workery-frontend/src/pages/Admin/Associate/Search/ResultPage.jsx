// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Search/ResultPage.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { DateTime } from "luxon";
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

// Constants for associate types and statuses - matching old implementation
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_STATUS_ACTIVE = 1;

// Sort options - matching backend expectations
const ASSOCIATE_SORT_OPTIONS = [
  { value: "last_name,ASC", label: "Last Name (A-Z)" },
  { value: "last_name,DESC", label: "Last Name (Z-A)" },
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,DESC", label: "Newest First" },
  { value: "join_date,ASC", label: "Oldest First" },
];

// Status filter options - matching backend expectations
const ASSOCIATE_STATUS_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Active" },
  { value: 2, label: "Archived" },
];

// Type filter options - matching backend expectations
const ASSOCIATE_TYPE_OF_FILTER_OPTIONS = [
  { value: 0, label: "All" },
  { value: 1, label: "Residential" },
  { value: 2, label: "Commercial" },
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
  const [sortByValue, setSortByValue] = useState("last_name,ASC"); // Default sort by last name
  const [status, setStatus] = useState(isActive ? 1 : 0); // 1 for active only, 0 for all
  const [typeOf, setTypeOf] = useState(0); // 0 for all types
  const [createdAtGTE, setCreatedAtGTE] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // API callback handlers
  const onAssociateListSuccess = (response) => {
    console.log("onAssociateListSuccess: Starting...", response);
    if (response.results !== null) {
      setAssociates(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } else {
      setAssociates({ results: [] });
    }
  };

  const onAssociateListError = (apiErr) => {
    console.log("onAssociateListError: Starting...", apiErr);
    setErrors(apiErr);
    window.scrollTo(0, 0);
  };

  const onAssociateListDone = () => {
    console.log("onAssociateListDone: Starting...");
    setFetching(false);
  };

  // Fetch associates list
  const fetchList = () => {
    setFetching(true);
    setErrors({});

    console.log("fetchList: Starting with params:", {
      firstName,
      lastName,
      email,
      phone,
      organizationName,
      status,
      typeOf,
      createdAtGTE,
      sortByValue,
      pageSize,
      currentCursor,
    });

    // Build filters map for API call - using exact same format as old code
    const params = new Map();
    params.set("page_size", pageSize);
    params.set("sort_field", "last_name"); // Default sort field

    if (currentCursor !== "") {
      params.set("cursor", currentCursor);
    }

    // Sort parameters - matching old implementation
    const sortArray = sortByValue.split(",");
    params.set("sort_field", sortArray[0]);
    params.set("sort_order", sortArray[1]);

    // Search parameters from URL - using snake_case as backend expects
    if (firstName !== undefined && firstName !== null && firstName !== "") {
      params.set("first_name", firstName);
    }
    if (lastName !== undefined && lastName !== null && lastName !== "") {
      params.set("last_name", lastName);
    }
    if (email !== undefined && email !== null && email !== "") {
      params.set("email", email);
    }
    if (phone !== undefined && phone !== null && phone !== "") {
      params.set("phone", phone);
    }
    if (
      organizationName !== undefined &&
      organizationName !== null &&
      organizationName !== ""
    ) {
      params.set("organization_name", organizationName);
    }

    // Filter parameters
    if (status !== undefined && status !== null && status !== 0) {
      params.set("status", status);
    }
    if (typeOf !== undefined && typeOf !== null && typeOf !== 0) {
      params.set("type", typeOf);
    }
    if (
      createdAtGTE !== undefined &&
      createdAtGTE !== null &&
      createdAtGTE !== ""
    ) {
      const date = new Date(createdAtGTE);
      const jStr = date.getTime();
      params.set("created_at_gte", jStr);
    }

    console.log(
      "fetchList: Calling API with params Map:",
      Array.from(params.entries()),
    );

    // Call API through manager using callback pattern
    associateManager.getAssociatesWithFiltersMapWithCallbacks(
      params,
      onAssociateListSuccess,
      onAssociateListError,
      onAssociateListDone,
      () => navigate("/login?unauthorized=true"),
      true, // Force refresh to bypass cache
    );
  };

  // Fetch list when parameters change
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      fetchList();
    }

    return () => {
      mounted = false;
    };
  }, [
    currentCursor,
    pageSize,
    sortByValue,
    status,
    typeOf,
    createdAtGTE,
    firstName,
    lastName,
    email,
    phone,
    organizationName,
  ]);

  // Handle pagination
  const onNextClicked = (e) => {
    console.log("onNextClicked: Going to next page");
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    console.log("onPreviousClicked: Going to previous page");
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Archive callback handlers
  const onAssociateDeleteSuccess = (response) => {
    console.log("onAssociateDeleteSuccess: Starting...");

    // Update notification
    setSuccessMessage("Associate archived successfully");
    setTimeout(() => {
      setSuccessMessage("");
    }, 2000);

    // Fetch again an updated list
    fetchList();
  };

  const onAssociateDeleteError = (apiErr) => {
    console.log("onAssociateDeleteError: Starting...", apiErr);
    setErrors(apiErr);

    // Update notification
    setErrors({ message: "Failed archiving associate" });
    setTimeout(() => {
      setErrors({});
    }, 2000);

    window.scrollTo(0, 0);
  };

  const onAssociateDeleteDone = () => {
    console.log("onAssociateDeleteDone: Starting...");
    setFetching(false);
    setSelectedAssociateForDeletion(null);
  };

  // Handle associate deletion/archiving
  const onDeleteConfirmButtonClick = () => {
    if (!selectedAssociateForDeletion) return;

    console.log(
      "onDeleteConfirmButtonClick: Archiving associate",
      selectedAssociateForDeletion.id,
    );
    setFetching(true);

    // Call archive API through manager using callback pattern
    associateManager.archiveAssociateWithCallbacks(
      selectedAssociateForDeletion.id,
      onAssociateDeleteSuccess,
      onAssociateDeleteError,
      onAssociateDeleteDone,
      () => navigate("/login?unauthorized=true"),
    );
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
              onChange={(e) => setStatus(parseInt(e.target.value))}
              options={ASSOCIATE_STATUS_FILTER_OPTIONS}
            />

            <Select
              label="Type"
              value={typeOf}
              onChange={(e) => setTypeOf(parseInt(e.target.value))}
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
                      onChange={(e) => {
                        console.log("Page size changed to:", e.target.value);
                        setPageSize(parseInt(e.target.value));
                      }}
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
