// File Path: web/workery-frontend/src/pages/Admin/Setting/NAICS/Search/Page.jsx

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

function SettingNAICSSearchPage() {
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [code, setCode] = useState("");
  const [industryTitle, setIndustryTitle] = useState("");

  // Event handling
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (actualSearchText === "" && code === "" && industryTitle === "") {
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
    if (industryTitle.trim()) {
      searchParams.append("it", industryTitle.trim());
    }

    const searchURL = `/admin/settings/naics/search-result?${searchParams.toString()}`;
    navigate(searchURL);
  };

  const handleClearForm = () => {
    setActualSearchText("");
    setCode("");
    setIndustryTitle("");
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
    { label: "NAICS Search", icon: "🏢" },
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
            🏢 North American Industry Classification System
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
            🔍 Search for existing NAICS's
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
                  helpText="Search across all NAICS fields"
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
                        placeholder="Search by NAICS code..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        helpText="Enter specific NAICS code (e.g., 541710)"
                      />

                      <Input
                        label="🏭 Industry Title"
                        name="industryTitle"
                        placeholder="Search by industry title..."
                        value={industryTitle}
                        onChange={(e) => setIndustryTitle(e.target.value)}
                        onKeyPress={handleKeyPress}
                        helpText="Enter industry classification name"
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
          ℹ️ About North American Industry Classification System
        </h3>
        <div style={{ color: "#666", lineHeight: "1.6" }}>
          <p>
            The North American Industry Classification System (NAICS) is the
            standard used by Federal statistical agencies in classifying
            business establishments for the purpose of collecting, analyzing,
            and publishing statistical data related to the U.S. business
            economy.
          </p>
          <ul style={{ paddingLeft: "20px", marginTop: "10px" }}>
            <li>
              <strong>Search Keywords:</strong> Use general terms to find
              relevant industry classifications
            </li>
            <li>
              <strong>Code:</strong> Search by specific NAICS codes (e.g.,
              541710)
            </li>
            <li>
              <strong>Industry Title:</strong> Search by industry classification
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

export default SettingNAICSSearchPage;
