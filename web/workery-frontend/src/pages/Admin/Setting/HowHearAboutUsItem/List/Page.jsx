// File Path: web/workery-frontend/src/pages/Admin/Setting/HowHearAboutUsItem/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useHowHearAboutUsItemManager } from "../../../../../services/Services";
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

function SettingHowHearAboutUsItemListPage() {
  const navigate = useNavigate();
  const howHearAboutUsItemManager = useHowHearAboutUsItemManager();

  // Component state
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filter and search state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortBy, setSortBy] = useState("sort_number,ASC");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  // API parameters
  const [apiParams, setApiParams] = useState({
    page: 1,
    pageSize: 25,
    sortField: "sort_number",
    sortOrder: "ASC",
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch data
  const fetchData = async (params = apiParams, showLoading = true) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      setError(null);

      const result = await howHearAboutUsItemManager.getList(
        params,
        onUnauthorized,
        true, // Force refresh
      );

      setData(result);
    } catch (err) {
      console.error("Failed to fetch How Hear About Us Items:", err);
      setError(err.message || "Failed to load data");
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  };

  // Handle search
  const handleSearch = () => {
    const newParams = {
      ...apiParams,
      page: 1,
      search: searchText.trim() || undefined,
      status: statusFilter || undefined,
      isForAssociate: roleFilter === "associate" ? true : undefined,
      isForCustomer: roleFilter === "customer" ? true : undefined,
      isForStaff: roleFilter === "staff" ? true : undefined,
    };

    const [sortField, sortOrder] = sortBy.split(",");
    newParams.sortField = sortField;
    newParams.sortOrder = sortOrder;

    setApiParams(newParams);
    setCurrentPage(1);
    fetchData(newParams);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setRoleFilter("");
    setSortBy("sort_number,ASC");
    setCurrentPage(1);

    const newParams = {
      page: 1,
      pageSize: pageSize,
      sortField: "sort_number",
      sortOrder: "ASC",
    };

    setApiParams(newParams);
    fetchData(newParams);
  };

  // Handle page size change
  const handlePageSizeChange = (newPageSize) => {
    setPageSize(newPageSize);
    const newParams = {
      ...apiParams,
      pageSize: newPageSize,
      page: 1,
    };
    setApiParams(newParams);
    setCurrentPage(1);
    fetchData(newParams);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const newParams = {
      ...apiParams,
      page: newPage,
    };
    setApiParams(newParams);
    fetchData(newParams, false);
  };

  // Handle item click
  const handleItemClick = (item) => {
    navigate(`/admin/settings/how-hear-about-us-item/${item.id}/detail`);
  };

  // Handle delete
  const handleDelete = async (item) => {
    if (item.text === "Other") {
      setError("Cannot delete the 'Other' item as it is locked.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${item.text}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await howHearAboutUsItemManager.delete(item.id, onUnauthorized);
      setSuccessMessage("How Hear About Us Item deleted successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchData(apiParams, false);
    } catch (err) {
      console.error("Failed to delete item:", err);
      setError(err.message || "Failed to delete item");
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-clear error and success messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Get filter options
  const sortOptions = howHearAboutUsItemManager.getDefaultSortOptions();
  const statusOptions = howHearAboutUsItemManager.getStatusFilterOptions();
  const roleOptions = howHearAboutUsItemManager.getRoleFilterOptions();

  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  // Table columns
  const columns = [
    {
      key: "sortNumber",
      label: "Sort #",
      align: "center",
      render: (value) => value || "-",
    },
    {
      key: "text",
      label: "Text",
      render: (value) => value || "-",
    },
    {
      key: "roles",
      label: "Roles",
      render: (_, item) => {
        const roles = [];
        if (item.isForAssociate) roles.push("Associate");
        if (item.isForCustomer) roles.push("Customer");
        if (item.isForStaff) roles.push("Staff");
        return roles.length > 0 ? roles.join(", ") : "None";
      },
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: (value) => (
        <span
          style={{
            color: value === 1 ? theme.colors.success : theme.colors.danger,
            fontWeight: "bold",
          }}
        >
          {value === 1 ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (_, item) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleItemClick(item)}
          >
            View
          </Button>
          {item.text !== "Other" && (
            <>
              <Button
                size="sm"
                variant="warning"
                onClick={() =>
                  navigate(
                    `/admin/settings/how-hear-about-us-item/${item.id}/update`,
                  )
                }
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => handleDelete(item)}
              >
                Delete
              </Button>
            </>
          )}
          {item.text === "Other" && (
            <span style={{ color: theme.colors.secondary, fontSize: "12px" }}>
              🔒 Locked
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          { label: "How Hear About Us Items", icon: "📞" },
        ]}
      />

      {/* Page Header */}
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
        <div>
          <h1 style={{ margin: 0, fontSize: "28px", color: theme.colors.dark }}>
            📞 How Hear About Us Items
          </h1>
          <p style={{ margin: "8px 0 0 0", color: theme.colors.secondary }}>
            Manage the options for how customers and associates heard about your
            organization
          </p>
        </div>
        <Button
          onClick={() =>
            navigate("/admin/settings/how-hear-about-us-item/create")
          }
        >
          ➕ Create New Item
        </Button>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {successMessage && (
        <Alert type="success" onClose={() => setSuccessMessage("")}>
          {successMessage}
        </Alert>
      )}

      {/* Filters Card */}
      <Card title="🔍 Search & Filter">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px",
            marginBottom: "20px",
          }}
        >
          <Input
            label="Search by Text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Enter search text..."
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={statusOptions}
          />
          <Select
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={roleOptions}
          />
          <Select
            label="Sort By"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
          />
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Button onClick={handleSearch}>🔍 Apply Filters</Button>
          <Button variant="secondary" onClick={handleClearFilters}>
            🗑️ Clear Filters
          </Button>
        </div>
      </Card>

      {/* Main Content */}
      {isLoading ? (
        <Loading message="Loading How Hear About Us Items..." />
      ) : (
        <Card
          title={`📋 Items List ${data?.count ? `(${data.count} total)` : ""}`}
          actions={[
            <Select
              key="pageSize"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(parseInt(e.target.value))}
              options={pageSizeOptions}
              style={{ minWidth: "150px" }}
            />,
          ]}
        >
          {data?.results?.length > 0 ? (
            <>
              <Table
                columns={columns}
                data={data.results}
                onRowClick={handleItemClick}
              />

              {/* Pagination */}
              {data.count > pageSize && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "20px",
                    padding: "15px 0",
                    borderTop: "1px solid #dee2e6",
                  }}
                >
                  <div
                    style={{ fontSize: "14px", color: theme.colors.secondary }}
                  >
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, data.count)} of{" "}
                    {data.count} items
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      ⬅️ Previous
                    </Button>
                    <span
                      style={{
                        padding: "6px 12px",
                        backgroundColor: theme.colors.light,
                        borderRadius: "4px",
                        fontSize: "14px",
                      }}
                    >
                      Page {currentPage} of {Math.ceil(data.count / pageSize)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={currentPage >= Math.ceil(data.count / pageSize)}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next ➡️
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <h3>📂 No Items Found</h3>
              <p
                style={{ color: theme.colors.secondary, marginBottom: "20px" }}
              >
                {searchText || statusFilter || roleFilter
                  ? "No items match your current filters. Try adjusting your search criteria."
                  : "No How Hear About Us Items have been created yet."}
              </p>
              <Button
                onClick={() =>
                  navigate("/admin/settings/how-hear-about-us-item/create")
                }
              >
                ➕ Create Your First Item
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Back to Settings */}
      <div style={{ marginTop: "30px", textAlign: "center" }}>
        <Link
          to="/admin/settings"
          style={{
            textDecoration: "none",
            color: theme.colors.primary,
            fontSize: "16px",
          }}
        >
          ← Back to Settings
        </Link>
      </div>
    </div>
  );
}

export default SettingHowHearAboutUsItemListPage;
