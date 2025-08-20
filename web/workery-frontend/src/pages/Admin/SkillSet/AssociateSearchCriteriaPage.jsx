// monorepo/web/workery-frontend/src/pages/Admin/SkillSet/AssociateSearchCriteriaPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useSkillSetManager } from "../../../services/Services";

function AdminSkillSetAssociateSearchCriteriaPage() {
  const navigate = useNavigate();
  const skillSetManager = useSkillSetManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [selectedSkillSetIds, setSelectedSkillSetIds] = useState([]);
  const [searchType, setSearchType] = useState("");
  const [skillSetOptions, setSkillSetOptions] = useState([]);

  // Load skill set options on mount
  useEffect(() => {
    let mounted = true;

    const loadSkillSetOptions = async () => {
      setFetching(true);
      try {
        const options = await skillSetManager.getSkillSetSelectOptions();
        if (mounted && options) {
          setSkillSetOptions(Array.isArray(options) ? options : []);
        }
      } catch (error) {
        console.error("Failed to load skill set options:", error);
        if (mounted) {
          setErrors({
            general: "Failed to load skill sets. Please try again.",
          });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    loadSkillSetOptions();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle skill set selection change
  const handleSkillSetChange = (e) => {
    const selectedOptions = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );
    setSelectedSkillSetIds(selectedOptions);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    let hasErrors = false;

    if (!selectedSkillSetIds || selectedSkillSetIds.length === 0) {
      newErrors.skillSets = "Please select at least one skill set";
      hasErrors = true;
    }

    if (!searchType) {
      newErrors.searchType = "Please select a search type";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Navigate to results page with search parameters
    const skillSetIdsStr = selectedSkillSetIds.join(",");
    navigate(
      `/admin/skill-sets/search-results?ssids=${skillSetIdsStr}&type=${searchType}`,
    );
  };

  if (isFetching) {
    return (
      <div>
        <h1>Loading...</h1>
        <p>Please wait while we load the skill sets...</p>
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
          <li>Skill Sets</li>
        </ul>
      </nav>

      {/* Page Title */}
      <h1>Skill Sets</h1>
      <h4>Search Criteria</h4>
      <hr />

      {/* Search Form */}
      <div>
        <h3>Search for existing associate:</h3>
        <p>
          Please enter one or more of the following fields to begin searching.
        </p>

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

        <form onSubmit={handleSubmit}>
          {/* Skill Set Selection */}
          <div style={{ marginBottom: "1rem" }}>
            <label htmlFor="skillSets">
              Skill Set(s) <span style={{ color: "red" }}>*</span>
            </label>
            <br />
            <select
              id="skillSets"
              name="skillSets"
              multiple
              size="8"
              value={selectedSkillSetIds}
              onChange={handleSkillSetChange}
              style={{
                width: "100%",
                padding: "0.5rem",
                border: errors.skillSets ? "1px solid red" : "1px solid #ccc",
              }}
            >
              {skillSetOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.skillSets && (
              <small style={{ color: "red" }}>{errors.skillSets}</small>
            )}
            <small>Pick the skill sets you want to search associates by.</small>
          </div>

          {/* Search Type */}
          <div style={{ marginBottom: "1rem" }}>
            <label>
              Search Type <span style={{ color: "red" }}>*</span>
            </label>
            <br />
            <div>
              <label>
                <input
                  type="radio"
                  name="searchType"
                  value="all"
                  checked={searchType === "all"}
                  onChange={(e) => setSearchType(e.target.value)}
                />{" "}
                Must contain all of the above skill sets
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  name="searchType"
                  value="in"
                  checked={searchType === "in"}
                  onChange={(e) => setSearchType(e.target.value)}
                />{" "}
                Can contain any one of the above skill sets
              </label>
            </div>
            {errors.searchType && (
              <small style={{ color: "red" }}>{errors.searchType}</small>
            )}
          </div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "2rem",
            }}
          >
            <Link to="/admin/dashboard">← Back to Dashboard</Link>
            <button type="submit">Search →</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminSkillSetAssociateSearchCriteriaPage;
