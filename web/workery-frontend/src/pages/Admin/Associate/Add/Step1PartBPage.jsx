// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartBPage.jsx

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
} from "../../../../components/UI";

function AdminAssociateAddStep1PartBPage() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [associates, setAssociates] = useState([]);
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);
  const [createdAtGTE, setCreatedAtGTE] = useState(null);
  const [sortByValue, setSortByValue] = useState("last_name,ASC");

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [authManager, navigate]);

  // Fetch associates based on search parameters
  useEffect(() => {
    fetchAssociates();
  }, [
    firstName,
    lastName,
    email,
    phone,
    currentCursor,
    pageSize,
    actualSearchText,
    sortByValue,
    status,
    typeOf,
    createdAtGTE,
  ]);

  const fetchAssociates = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Build filters map like the original implementation
      const filtersMap = new Map();

      // Pagination
      filtersMap.set("pageSize", pageSize);
      filtersMap.set("sortField", "last_name"); // Default sort field

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Sorting - split the sortByValue like original implementation
      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sortField", sortArray[0]);
        filtersMap.set("sortOrder", sortArray[1]);
      }

      // Search parameters - use exact parameter names that API expects
      if (firstName) {
        filtersMap.set("firstName", firstName);
      }
      if (lastName) {
        filtersMap.set("lastName", lastName);
      }
      if (email) {
        filtersMap.set("email", email);
      }
      if (phone) {
        filtersMap.set("phone", phone);
      }

      // Additional filters
      if (actualSearchText) {
        filtersMap.set("search", actualSearchText);
      }
      if (status) {
        filtersMap.set("status", status);
      }
      if (typeOf !== 0) {
        filtersMap.set("type", typeOf);
      }
      if (createdAtGTE) {
        const createdAtGTEStr = createdAtGTE.getTime();
        filtersMap.set("createdAtGte", createdAtGTEStr);
      }

      console.log("Fetching associates with filters:", filtersMap);

      // Use getAssociatesWithFiltersMap like the original implementation
      const associatesData = await associateManager.getAssociatesWithFiltersMap(
        filtersMap,
        () => navigate("/login?unauthorized=true"),
        true, // force refresh
      );

      console.log("Associates response:", associatesData);

      setAssociates(associatesData.results || []);
      if (associatesData.hasNextPage) {
        setNextCursor(associatesData.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onNextClicked = (e) => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onSelectAssociateForDeletion = (e, associate) => {
    console.log("onSelectAssociateForDeletion", associate);
    setSelectedAssociateForDeletion(associate);
  };

  const onDeselectAssociateForDeletion = (e) => {
    console.log("onDeselectAssociateForDeletion");
    setSelectedAssociateForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedAssociateForDeletion) return;

    try {
      await associateManager.deleteAssociate(
        selectedAssociateForDeletion.id,
        () => navigate("/login?unauthorized=true"),
      );

      // Refresh the list
      await fetchAssociates();
      setSelectedAssociateForDeletion(null);
    } catch (error) {
      console.error("Failed to delete associate:", error);
      setErrors(error);
    }
  };

  const onAddAssociateClick = () => {
    // Clear any existing associate creation state
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
    navigate("/admin/associates/add/step-2");
  };

  const getAssociateTypeIcon = (type) => {
    switch (type) {
      case 2: // Residential
        return "🏠";
      case 3: // Commercial
        return "🏢";
      default:
        return "👷";
    }
  };

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/associates", label: "Associates", icon: "👷" },
    { label: "New", icon: "➕" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "1", label: "Active" },
    { value: "2", label: "Archived" },
  ];

  const typeOptions = [
    { value: 0, label: "All Types" },
    { value: 1, label: "Unassigned" },
    { value: 2, label: "Residential" },
    { value: 3, label: "Commercial" },
  ];

  const sortOptions = [
    { value: "last_name,ASC", label: "Name (A-Z)" },
    { value: "last_name,DESC", label: "Name (Z-A)" },
    { value: "join_date,ASC", label: "Join Date (Oldest)" },
    { value: "join_date,DESC", label: "Join Date (Newest)" },
  ];

  const pageSizeOptions = [
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div style={globalStyles.section}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
          👷 Associates
        </h1>
        <h2 style={{ fontSize: "1.5rem", color: "#666", marginBottom: "2rem" }}>
          ➕ New Associate
        </h2>
        <hr style={{ marginBottom: "2rem" }} />
      </div>

      {/* Progress Wizard */}
      <Card
        style={{ backgroundColor: theme.colors.light, marginBottom: "2rem" }}
      >
        <h3 style={{ fontSize: "1.25rem", marginBottom: "1rem" }}>
          Step 1 of 7
        </h3>
        <div
          style={{
            width: "100%",
            height: "8px",
            backgroundColor: "#e0e0e0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "14%",
              height: "100%",
              backgroundColor: theme.colors.success,
              transition: "width 0.3s ease",
            }}
          ></div>
        </div>
        <small style={{ color: "#666", marginTop: "0.5rem", display: "block" }}>
          14%
        </small>
      </Card>

      {/* Search Results */}
      <Card style={{ borderRadius: "20px" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
          📋 Search results:
        </h2>

        {/* Filter Panel */}
        <div
          style={{
            backgroundColor: theme.colors.light,
            padding: "1rem",
            borderRadius: "20px",
            marginBottom: "1rem",
          }}
        >
          <h3 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
            🔧 Filtering & Sorting
          </h3>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(parseInt(e.target.value) || "")}
              options={statusOptions}
            />
            <Select
              label="Type"
              value={typeOf}
              onChange={(e) => setTypeOf(parseInt(e.target.value))}
              options={typeOptions}
            />
            <Select
              label="Sort by"
              value={sortByValue}
              onChange={(e) => setSortByValue(e.target.value)}
              options={sortOptions}
            />
          </div>
        </div>

        {/* Results Content */}
        {isLoading ? (
          <Loading message="Loading associates..." />
        ) : (
          <>
            {errors.message && (
              <Alert type="error" style={{ marginBottom: "1rem" }}>
                {errors.message}
              </Alert>
            )}

            {associates && associates.length > 0 ? (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(300px, 1fr))",
                    gap: "1rem",
                    marginBottom: "2rem",
                  }}
                >
                  {associates.map((associate) => (
                    <Card
                      key={associate.id}
                      style={{
                        backgroundColor: theme.colors.infoBg,
                        border: `1px solid ${theme.colors.info}`,
                        cursor: "pointer",
                      }}
                    >
                      {/* Header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "1rem",
                          paddingBottom: "1rem",
                          borderBottom: "1px solid #ddd",
                        }}
                      >
                        <Link
                          to={`/admin/associate/${associate.id}`}
                          style={{
                            textDecoration: "none",
                            color: "inherit",
                            fontWeight: "bold",
                          }}
                        >
                          {getAssociateTypeIcon(associate.type)}&nbsp;
                          {associate.type === 3
                            ? associate.organizationName ||
                              `${associate.firstName} ${associate.lastName}`
                            : `${associate.firstName} ${associate.lastName}`}
                        </Link>
                      </div>

                      {/* Body */}
                      <div style={{ marginBottom: "1rem" }}>
                        <div>{associate.addressLine1}</div>
                        <div>
                          {associate.city}, {associate.region}
                        </div>
                        <div>
                          {associate.phone ? (
                            <a href={`tel:${associate.phone}`}>
                              {associate.phone}
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                        <div>
                          {associate.email ? (
                            <a href={`mailto:${associate.email}`}>
                              {associate.email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: "1rem",
                          borderTop: "1px solid #ddd",
                        }}
                      >
                        <Link
                          to={`/admin/associate/${associate.id}`}
                          style={{
                            textDecoration: "none",
                            color: theme.colors.primary,
                            fontWeight: "bold",
                          }}
                        >
                          Select →
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "1rem",
                    borderTop: "1px solid #ddd",
                  }}
                >
                  <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    options={pageSizeOptions}
                  />
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {previousCursors.length > 0 && (
                      <Button onClick={onPreviousClicked} variant="secondary">
                        Previous
                      </Button>
                    )}
                    {nextCursor && (
                      <Button onClick={onNextClicked} variant="secondary">
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                }}
              >
                <h3 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>
                  📋 No Associates Found
                </h3>
                <p style={{ marginBottom: "1rem" }}>
                  No associates found matching your search criteria.{" "}
                  <Link
                    to="/admin/associates/add/step-1-search"
                    style={{ color: theme.colors.primary, fontWeight: "bold" }}
                  >
                    Click here →
                  </Link>{" "}
                  to search again.
                </p>
              </div>
            )}

            <div
              style={{
                textAlign: "center",
                margin: "2rem 0",
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#666",
              }}
            >
              - OR -
            </div>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Link to="/admin/associates/add/step-1-search">
                <Button variant="secondary">← Search Again</Button>
              </Link>
              <Button onClick={onAddAssociateClick} variant="success">
                ➕ Add associate
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedAssociateForDeletion}
        onClose={onDeselectAssociateForDeletion}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={onDeselectAssociateForDeletion}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={onDeleteConfirmButtonClick} variant="success">
              Confirm
            </Button>
          </>
        }
      >
        <p>
          You are about to <strong>archive</strong> this user; it will no longer
          appear on your dashboard. This action can be undone but you'll need to
          contact the system administrator. Are you sure you would like to
          continue?
        </p>
      </Modal>
    </div>
  );
}

export default AdminAssociateAddStep1PartBPage;
