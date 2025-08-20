// monorepo/web/workery-frontend/src/pages/Admin/SkillSet/AssociateSearchResultPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { useAssociateManager } from "../../../services/Services";
import {
  ASSOCIATE_STATUS_OPTIONS,
  ASSOCIATE_TYPE_OPTIONS,
  ASSOCIATE_SORT_OPTIONS,
} from "../../../constants/Associate";
import { PAGE_SIZE_OPTIONS } from "../../../constants/FieldOptions";

function AdminSkillSetAssociateSearchResultPage() {
  const [searchParams] = useSearchParams();
  const associateManager = useAssociateManager();

  // Get search parameters from URL
  const skillSetIDsStr = searchParams.get("ssids");
  const targetSkillSetIDs = skillSetIDsStr ? skillSetIDsStr.split(",") : [];
  const searchType = searchParams.get("type");

  // Component states
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  // Filtering and sorting states
  const [status, setStatus] = useState(1); // Active by default
  const [type, setType] = useState(0); // All types
  const [sortBy, setSortBy] = useState("lexical_name,ASC");

  // Pagination states
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Fetch associates data
  const fetchAssociates = async () => {
    setFetching(true);
    setErrors({});

    try {
      // Build params for API call
      const params = {
        pageSize: pageSize,
        cursor: currentCursor,
        status: status,
        type: type,
        sortBy: sortBy,
      };

      // Add skill set filtering based on search type
      if (searchType === "all") {
        params.allSkillSetIds = skillSetIDsStr;
      } else if (searchType === "in") {
        params.inSkillSetIds = skillSetIDsStr;
      }

      // Call API through manager
      const response = await associateManager.getAssociates(params);

      if (response) {
        setAssociates(response);
        setTotalCount(response.count || 0);

        // Handle pagination
        if (response.hasNextPage) {
          setNextCursor(response.nextCursor);
        } else {
          setNextCursor("");
        }
      }
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors({
        general: "Failed to load associates. Please try again.",
      });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Load data when dependencies change
  useEffect(() => {
    if (skillSetIDsStr && searchType) {
      fetchAssociates();
    }
  }, [
    currentCursor,
    pageSize,
    status,
    type,
    sortBy,
    skillSetIDsStr,
    searchType,
  ]);

  // Handle pagination
  const handleNextPage = () => {
    if (nextCursor) {
      setPreviousCursors([...previousCursors, currentCursor]);
      setCurrentCursor(nextCursor);
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (previousCursors.length > 0) {
      const newPreviousCursors = [...previousCursors];
      const previousCursor = newPreviousCursors.pop();
      setPreviousCursors(newPreviousCursors);
      setCurrentCursor(previousCursor);
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle filter reset
  const handleClearFilters = (e) => {
    e.preventDefault();
    setStatus(1);
    setType(0);
    setSortBy("lexical_name,ASC");
    setCurrentCursor("");
    setPreviousCursors([]);
    setCurrentPage(1);
  };

  // Check if a skill set ID is in the target list
  const isTargetSkillSet = (skillSetId) => {
    return targetSkillSetIDs.includes(String(skillSetId));
  };

  // Render loading state
  if (isFetching && !associates) {
    return (
      <div>
        <h1>Loading...</h1>
        <p>Please wait while we load the associates...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumbs">
        <ul>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/skill-sets">Skill Sets</Link>
          </li>
          <li>Results</li>
        </ul>
      </nav>

      {/* Page Title */}
      <h1>Skill Sets</h1>
      <h4>Search Results</h4>
      <hr />

      {/* Results Section */}
      <div>
        <h2>List</h2>

        {/* Filter Panel */}
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "1rem",
            }}
          >
            <h3>Filtering & Sorting</h3>
            <a href="#" onClick={handleClearFilters}>
              Clear Filter
            </a>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "1rem",
            }}
          >
            {/* Status Filter */}
            <div>
              <label htmlFor="status">Status</label>
              <br />
              <select
                id="status"
                value={status}
                onChange={(e) => {
                  setStatus(parseInt(e.target.value));
                  setCurrentCursor("");
                  setPreviousCursors([]);
                  setCurrentPage(1);
                }}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                {ASSOCIATE_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type">Type</label>
              <br />
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(parseInt(e.target.value));
                  setCurrentCursor("");
                  setPreviousCursors([]);
                  setCurrentPage(1);
                }}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                {ASSOCIATE_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label htmlFor="sortBy">Sort by</label>
              <br />
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentCursor("");
                  setPreviousCursors([]);
                  setCurrentPage(1);
                }}
                style={{ width: "100%", padding: "0.5rem" }}
              >
                {ASSOCIATE_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {Object.keys(errors).length > 0 && (
          <div style={{ color: "red", marginBottom: "1rem" }}>
            <h4>Errors:</h4>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Results Table */}
        {associates && associates.results && associates.results.length > 0 ? (
          <>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>
                    First Name
                  </th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>
                    Last Name
                    {sortBy === "lexical_name,ASC" && " ↑"}
                    {sortBy === "lexical_name,DESC" && " ↓"}
                  </th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>
                    Phone
                  </th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>
                    Email
                  </th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>
                    Skill Set(s)
                  </th>
                  <th style={{ padding: "0.5rem", textAlign: "left" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {associates.results.map((associate) => (
                  <tr
                    key={associate.id}
                    style={{ borderBottom: "1px solid #eee" }}
                  >
                    <td style={{ padding: "0.5rem" }}>
                      {associate.firstName || "-"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {associate.lastName || "-"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {associate.phone || "-"}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {associate.email ? (
                        <a href={`mailto:${associate.email}`}>
                          {associate.email}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {associate.skillSets && associate.skillSets.length > 0 ? (
                        <ul style={{ margin: 0, paddingLeft: "1rem" }}>
                          {associate.skillSets.map((skillSet) => (
                            <li
                              key={skillSet.id}
                              style={{
                                fontWeight: isTargetSkillSet(skillSet.id)
                                  ? "bold"
                                  : "normal",
                                color: isTargetSkillSet(skillSet.id)
                                  ? "green"
                                  : "inherit",
                              }}
                            >
                              {skillSet.subCategory} ({skillSet.category})
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      <Link to={`/admin/associate/${associate.id}`}>
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Results Summary */}
            <p style={{ textAlign: "right", marginTop: "1rem" }}>
              Total Results: {totalCount}
            </p>

            {/* Pagination Controls */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "1rem",
              }}
            >
              <div>
                <label htmlFor="pageSize">Results per page: </label>
                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentCursor("");
                    setPreviousCursors([]);
                    setCurrentPage(1);
                  }}
                >
                  {PAGE_SIZE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                {previousCursors.length > 0 && (
                  <button
                    onClick={handlePreviousPage}
                    style={{ marginRight: "0.5rem" }}
                  >
                    Previous
                  </button>
                )}
                {nextCursor && <button onClick={handleNextPage}>Next</button>}
              </div>
            </div>

            {/* Page Info */}
            <p style={{ textAlign: "center", marginTop: "0.5rem" }}>
              Page {currentPage}
            </p>
          </>
        ) : (
          // No Results
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              backgroundColor: "#f9f9f9",
            }}
          >
            <h3>No Associates Found</h3>
            <p>
              No associates match your search criteria.{" "}
              <Link to="/admin/associates/add/step-1-search">
                Click here to add a new associate →
              </Link>
            </p>
          </div>
        )}

        {/* Bottom Navigation */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2rem",
          }}
        >
          <Link to="/admin/skill-sets">← Search Again</Link>
        </div>
      </div>
    </div>
  );
}

export default AdminSkillSetAssociateSearchResultPage;
