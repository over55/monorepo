// File Path: web/workery-frontend/src/pages/Admin/Setting/NAICS/SearchResult/Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useNAICSManager } from "../../../../../services/Services";
import { theme, globalStyles } from "../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Select,
  Table,
} from "../../../../../components/UI";

function SettingNAICSSearchResultPage() {
  const naicsManager = useNAICSManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL search parameters
  const urlSearchText = searchParams.get("q") || "";
  const urlCode = searchParams.get("c") || "";
  const urlIndustryTitle = searchParams.get("it") || "";

  // Component state
  const [naics, setNaics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Sorting state
  const [sortBy, setSortBy] = useState("code");
  const [sortOrder, setSortOrder] = useState("ASC");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const performSearch = async (page = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
      };

      // Add search parameters
      if (urlSearchText.trim()) {
        params.search = urlSearchText.trim();
      }
      if (urlCode.trim()) {
        params.code = urlCode.trim();
      }
      if (urlIndustryTitle.trim()) {
        params.it = urlIndustryTitle.trim();
      }

      const response = await naicsManager.getNAICS(
        params,
        onUnauthorized,
        true,
      );

      setNaics(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
      setHasPreviousPage(page > 1);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to search NAICS:", err);
      setError(err.message || "Failed to search NAICS");
      setNaics([]);
    } finally {
      setIsLoading(false);
    }
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

  const handleRowClick = (naicsItem) => {
    navigate(`/admin/settings/naics/${naicsItem.id}/detail`);
  };

  const handleSortChange = (e) => {
    const [field, order] = e.target.value.split(",");
    setSortBy(field);
    setSortOrder(order);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1);
  };

  // Auto-search on mount
  useEffect(() => {
    performSearch(1);
  }, [sortBy, sortOrder, pageSize]);

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "NAICS Search", path: "/admin/settings/naics/search", icon: "🏢" },
    { label: "Search Results", icon: "📊" },
  ];

  const sortOptions = [
    { value: "code,ASC", label: "Code (A-Z)" },
    { value: "code,DESC", label: "Code (Z-A)" },
    { value: "industry_title,ASC", label: "Industry Title (A-Z)" },
    { value: "industry_title,DESC", label: "Industry Title (Z-A)" },
  ];

  const pageSizeOptions = [
    { value: "25", label: "25 per page" },
    { value: "50", label: "50 per page" },
    { value: "100", label: "100 per page" },
    { value: "200", label: "200 per page" },
  ];

  const tableColumns = [
    {
      key: "code",
      label: "Code",
      render: (value) => (
        <div
          style={{
            fontFamily: "monospace",
            fontWeight: "bold",
            backgroundColor: theme.colors.primary,
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            display: "inline-block",
          }}
        >
          {value}
        </div>
      ),
    },
    {
      key: "industryTitle",
      label: "Industry Title",
      render: (value) => <strong>{value}</strong>,
    },
    {
      key: "sectorTitle",
      label: "Sector",
      render: (value, row) => (
        <div style={{ fontSize: "14px", color: "#666" }}>
          {row.sectorCode && value
            ? `${row.sectorCode} - ${value}`
            : value || "Not specified"}
        </div>
      ),
    },
  ];

  // Build search criteria display
  const searchCriteria = [];
  if (urlSearchText) searchCriteria.push(`Keywords: "${urlSearchText}"`);
  if (urlCode) searchCriteria.push(`Code: "${urlCode}"`);
  if (urlIndustryTitle) searchCriteria.push(`Industry: "${urlIndustryTitle}"`);

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
            📊 Search Results
          </h4>
          {searchCriteria.length > 0 && (
            <div style={{ marginTop: "10px", fontSize: "14px", color: "#888" }}>
              Search criteria: {searchCriteria.join(", ")}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/settings/naics/search")}
        >
          ← Back to Search
        </Button>
      </div>

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "15px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>📊 Search Results</h2>
          {naics.length > 0 && (
            <div
              style={{
                display: "flex",
                gap: "15px",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Select
                label="Sort by"
                value={`${sortBy},${sortOrder}`}
                onChange={handleSortChange}
                options={sortOptions}
              />
              <Select
                label="Page size"
                value={pageSize.toString()}
                onChange={handlePageSizeChange}
                options={pageSizeOptions}
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <Loading message="Searching NAICS database..." />
        ) : naics.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>🔍</div>
            <h3 style={{ marginBottom: "10px" }}>No NAICS Found</h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              No North American Industry Classifications match your search
              criteria. Try adjusting your search terms or using different
              keywords.
            </p>
            <Button
              variant="outline"
              onClick={() => navigate("/admin/settings/naics/search")}
            >
              ← Try New Search
            </Button>
          </div>
        ) : (
          <>
            {/* Results Summary */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: theme.colors.light,
                borderRadius: "8px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div style={{ fontSize: "14px", color: "#666" }}>
                Found <strong>{totalCount}</strong> NAICS
                {searchCriteria.length > 0 && (
                  <span> matching your search criteria</span>
                )}
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Page <strong>{currentPage}</strong>
                {Math.ceil(totalCount / pageSize) > 1 && (
                  <span> of {Math.ceil(totalCount / pageSize)}</span>
                )}
              </div>
            </div>

            {/* Results Table */}
            <Table
              columns={tableColumns}
              data={naics}
              onRowClick={handleRowClick}
              style={{
                cursor: "pointer",
              }}
            />

            {/* Pagination */}
            {(hasPreviousPage || hasNextPage) && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  marginTop: "30px",
                  gap: "15px",
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
                <span
                  style={{
                    fontSize: "14px",
                    color: "#666",
                    padding: "0 10px",
                  }}
                >
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

      {/* Action Buttons */}
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
        <Button
          variant="outline"
          onClick={() => navigate("/admin/settings/naics/search")}
        >
          ← Back to Search
        </Button>
        <Button variant="outline" onClick={() => navigate("/admin/settings")}>
          Settings Dashboard
        </Button>
      </div>
    </div>
  );
}

export default SettingNAICSSearchResultPage;
