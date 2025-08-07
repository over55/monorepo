// File Path: web/workery-frontend/src/pages/Admin/Setting/NOC/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useNOCManager } from "../../../../../services/Services";
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

function SettingNOCListPage() {
  const nocManager = useNOCManager();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL search parameters
  const urlSearchText = searchParams.get("q") || "";
  const urlCode = searchParams.get("c") || "";
  const urlUnitGroupTitle = searchParams.get("ugt") || "";

  // Component state
  const [nocs, setNocs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Search state
  const [searchText, setSearchText] = useState(urlSearchText);
  const [code, setCode] = useState(urlCode);
  const [unitGroupTitle, setUnitGroupTitle] = useState(urlUnitGroupTitle);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState("code");
  const [sortOrder, setSortOrder] = useState("ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const performSearch = async (page = 1) => {
    // Validate that at least one search field is filled
    if (!searchText.trim() && !code.trim() && !unitGroupTitle.trim()) {
      setError("Please enter at least one search criteria");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      };

      // Add search parameters
      if (searchText.trim()) {
        params.search = searchText.trim();
      }
      if (code.trim()) {
        params.code = code.trim();
      }
      if (unitGroupTitle.trim()) {
        params.ugt = unitGroupTitle.trim();
      }

      const response = await nocManager.getNOCs(params, onUnauthorized, true);

      setNocs(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
      setHasPreviousPage(page > 1);
      setCurrentPage(page);

      // Update URL with search parameters
      const newSearchParams = new URLSearchParams();
      if (searchText.trim()) newSearchParams.set("q", searchText.trim());
      if (code.trim()) newSearchParams.set("c", code.trim());
      if (unitGroupTitle.trim())
        newSearchParams.set("ugt", unitGroupTitle.trim());
      setSearchParams(newSearchParams);
    } catch (err) {
      console.error("Failed to search NOCs:", err);
      setError(err.message || "Failed to search NOCs");
      setNocs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(1);
  };

  const handleClearSearch = () => {
    setSearchText("");
    setCode("");
    setUnitGroupTitle("");
    setNocs([]);
    setHasSearched(false);
    setError(null);
    setSearchParams(new URLSearchParams());
  };

  const handlePreviousPage = () => {
    if (hasPreviousPage) {
      performSearch(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      performSearch(currentPage + 1);
    }
  };

  const handleRowClick = (noc) => {
    navigate(`/admin/settings/noc/${noc.id}/detail`);
  };

  // Auto-search if URL parameters are present
  useEffect(() => {
    if (urlSearchText || urlCode || urlUnitGroupTitle) {
      performSearch(1);
    }
  }, []);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "NOC Search", icon: "🎓" },
  ];

  const sortOptions = [
    { value: "code,ASC", label: "Code (A-Z)" },
    { value: "code,DESC", label: "Code (Z-A)" },
    { value: "unit_group_title,ASC", label: "Title (A-Z)" },
    { value: "unit_group_title,DESC", label: "Title (Z-A)" },
  ];

  const pageSizeOptions = [
    { value: "10", label: "10 per page" },
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
  ];

  const tableColumns = [
    {
      key: "code",
      label: "Code",
      render: (value) => (
        <div style={{ fontFamily: "monospace", fontWeight: "bold" }}>
          {value}
        </div>
      ),
    },
    {
      key: "unitGroupTitle",
      label: "Unit Group Title",
      render: (value) => (
        <div>
          <strong>{value}</strong>
        </div>
      ),
    },
    {
      key: "majorGroupTitle",
      label: "Major Group",
      render: (value, row) => (
        <div style={{ fontSize: "12px", color: "#666" }}>
          {row.majorGroupCode
            ? `${row.majorGroupCode} - ${value}`
            : value || "Not specified"}
        </div>
      ),
    },
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
          <p style={{ margin: 0, color: "#666", fontSize: "16px" }}>
            Search and browse the NOC database
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/settings")}>
          ← Back to Settings
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Search Section */}
      <Card title="🔍 Search NOC Database">
        <div style={{ marginBottom: "20px" }}>
          <p style={{ margin: "0 0 15px 0", color: "#666", fontSize: "14px" }}>
            Enter one or more search criteria to find National Occupational
            Classifications.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
              marginBottom: "20px",
            }}
          >
            <Input
              label="🔍 Search Keywords"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search all fields..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            {isAdvancedSearch && (
              <>
                <Input
                  label="📋 Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Search by NOC code..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />

                <Input
                  label="📑 Unit Group Title"
                  value={unitGroupTitle}
                  onChange={(e) => setUnitGroupTitle(e.target.value)}
                  placeholder="Search by unit group title..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
              </>
            )}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <Button
              variant={isAdvancedSearch ? "primary" : "outline"}
              onClick={() => setIsAdvancedSearch(!isAdvancedSearch)}
            >
              🔧 {isAdvancedSearch ? "Hide" : "Show"} Advanced Search
            </Button>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Button
                variant="outline"
                onClick={handleClearSearch}
                disabled={isLoading}
              >
                ✕ Clear
              </Button>
              <Button
                variant="primary"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "🔍 Search"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Section */}
      {hasSearched && (
        <Card style={{ marginTop: "20px" }}>
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
            <h2 style={{ margin: 0, fontSize: "20px" }}>📊 Search Results</h2>
            {nocs.length > 0 && (
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <Select
                  label="Sort by"
                  value={`${sortBy},${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split(",");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  options={sortOptions}
                />
                <Select
                  label="Page size"
                  value={pageSize.toString()}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setCurrentPage(1);
                  }}
                  options={pageSizeOptions}
                />
              </div>
            )}
          </div>

          {isLoading ? (
            <Loading message="Searching NOC database..." />
          ) : nocs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔍</div>
              <h3 style={{ marginBottom: "10px" }}>No NOCs Found</h3>
              <p style={{ color: "#666", marginBottom: "20px" }}>
                No National Occupational Classifications match your search
                criteria. Try adjusting your search terms or using different
                keywords.
              </p>
              <Button variant="outline" onClick={handleClearSearch}>
                ✕ Clear Search
              </Button>
            </div>
          ) : (
            <>
              {/* Results Info */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                  padding: "10px 0",
                  borderBottom: "1px solid #eee",
                  flexWrap: "wrap",
                  gap: "10px",
                }}
              >
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Found {totalCount} NOCs
                  {searchText && ` matching "${searchText}"`}
                </div>
                <div style={{ fontSize: "14px", color: "#666" }}>
                  Page {currentPage}
                </div>
              </div>

              {/* Table */}
              <Table
                columns={tableColumns}
                data={nocs}
                onRowClick={handleRowClick}
              />

              {/* Pagination */}
              {(hasPreviousPage || hasNextPage) && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "30px",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    variant="outline"
                    onClick={handlePreviousPage}
                    disabled={!hasPreviousPage || isLoading}
                  >
                    ← Previous
                  </Button>
                  <span style={{ fontSize: "14px", color: "#666" }}>
                    Page {currentPage}
                  </span>
                  <Button
                    variant="outline"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || isLoading}
                  >
                    Next →
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>
      )}

      {/* Help Section */}
      {!hasSearched && (
        <Card style={{ marginTop: "20px" }}>
          <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
            ℹ️ About National Occupational Classification
          </h3>
          <div style={{ color: "#666", lineHeight: "1.6" }}>
            <p>
              The National Occupational Classification (NOC) is Canada's
              national system for describing occupations. It provides a
              systematic classification structure that organizes over 30,000 job
              titles into 500 unit group categories.
            </p>
            <ul style={{ paddingLeft: "20px" }}>
              <li>
                <strong>Search:</strong> Use keywords to find relevant
                occupations
              </li>
              <li>
                <strong>Code:</strong> Search by specific NOC codes (e.g., 1234)
              </li>
              <li>
                <strong>Unit Group Title:</strong> Search by occupation group
                names
              </li>
            </ul>
            <p>
              Click on any result to view detailed information about the
              occupation including its description, main duties, and
              classification hierarchy.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default SettingNOCListPage;
