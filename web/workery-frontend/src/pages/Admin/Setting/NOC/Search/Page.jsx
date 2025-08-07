// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/Search/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
} from "../../../../../components/UI";

function SettingNOCSearchPage() {
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [code, setCode] = useState("");
  const [unitGroupTitle, setUnitGroupTitle] = useState("");

  // Event handling
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (actualSearchText === "" && code === "" && unitGroupTitle === "") {
      setErrors({
        message: "Please enter a value in at least one search field",
      });
      return;
    }

    // Clear errors
    setErrors({});

    // Build search URL with parameters
    const searchParams = new URLSearchParams();
    if (actualSearchText.trim()) {
      searchParams.append("q", actualSearchText.trim());
    }
    if (code.trim()) {
      searchParams.append("c", code.trim());
    }
    if (unitGroupTitle.trim()) {
      searchParams.append("ugt", unitGroupTitle.trim());
    }

    const searchURL = `/admin/settings/noc/search-result?${searchParams.toString()}`;
    navigate(searchURL);
  };

  const handleClearForm = () => {
    setActualSearchText("");
    setCode("");
    setUnitGroupTitle("");
    setErrors({});
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmitClick(e);
    }
  };

  useEffect(() => {
    // Reset loading state on mount
    setIsFetching(false);
  }, []);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "NOC Search", icon: "🎓" },
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
        <div>
          <h1
            style={{
              margin: "0 0 10px 0",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            🎓 National Occupational Classification
          </h1>
          <h4 style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            🔍 Search
          </h4>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/settings")}>
          ← Back to Settings
        </Button>
      </div>

      {/* Error Display */}
      {errors.message && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Search Form */}
      <Card>
        <div style={{ marginBottom: "20px" }}>
          <h2
            style={{
              fontSize: "20px",
              fontWeight: "600",
              marginBottom: "10px",
            }}
          >
            🔍 Search for existing NOCs
          </h2>
          <p style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}>
            Please enter one or more of the following fields to begin searching.
          </p>

          {isFetching ? (
            <Loading message="Submitting..." />
          ) : (
            <form onSubmit={onSubmitClick}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                <Input
                  label="🔍 Search Keywords"
                  name="actualSearchText"
                  placeholder="Search..."
                  value={actualSearchText}
                  onChange={(e) => setActualSearchText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  helpText="Search across all NOC fields"
                />
              </div>

              {isAdvancedFiltering && (
                <>
                  <div
                    style={{
                      textAlign: "center",
                      margin: "20px 0",
                      fontSize: "18px",
                      fontWeight: "500",
                      color: "#666",
                    }}
                  >
                    - OR -
                  </div>
                  <Card
                    title="🔧 Advanced Search"
                    style={{
                      backgroundColor: theme.colors.light,
                      border: `1px solid ${theme.colors.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(300px, 1fr))",
                        gap: "20px",
                      }}
                    >
                      <Input
                        label="📋 Code"
                        name="code"
                        placeholder="Search by NOC code..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        helpText="Enter specific NOC code (e.g., 1234)"
                      />

                      <Input
                        label="📑 Unit Group Title"
                        name="unitGroupTitle"
                        placeholder="Search by unit group title..."
                        value={unitGroupTitle}
                        onChange={(e) => setUnitGroupTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                        helpText="Enter occupation group name"
                      />
                    </div>
                  </Card>
                </>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "30px",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/admin/settings")}
                  >
                    ← Back to Settings
                  </Button>
                  <Button variant="outline" onClick={handleClearForm}>
                    ✕ Clear Form
                  </Button>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Button
                    variant={isAdvancedFiltering ? "primary" : "outline"}
                    onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                  >
                    🔧 {isAdvancedFiltering ? "Hide" : "Show"} Advanced Search
                  </Button>
                  <Button
                    variant="primary"
                    onClick={onSubmitClick}
                    disabled={isFetching}
                  >
                    {isFetching ? "Searching..." : "🔍 Search"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </Card>

      {/* Help Section */}
      <Card style={{ marginTop: "20px" }}>
        <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
          ℹ️ About National Occupational Classification
        </h3>
        <div style={{ color: "#666", lineHeight: "1.6" }}>
          <p>
            The National Occupational Classification (NOC) is Canada's national
            system for describing occupations. It provides a systematic
            classification structure that organizes over 30,000 job titles into
            500 unit group categories.
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            <li>
              <strong>Search Keywords:</strong> Use general terms to find
              relevant occupations
            </li>
            <li>
              <strong>Code:</strong> Search by specific NOC codes (e.g., 1234)
            </li>
            <li>
              <strong>Unit Group Title:</strong> Search by occupation group
              names
            </li>
          </ul>
          <p style={{ marginTop: "15px" }}>
            Use the advanced search for more specific criteria, or try different
            keyword combinations to find the classifications you need.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default SettingNOCSearchPage;
