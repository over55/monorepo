// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
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
  Modal,
} from "../../../../../components/UI";

function SettingInactiveClientListPage() {
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [inactiveClients, setInactiveClients] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("lexical_name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch inactive clients (customers with status=2)
  const fetchInactiveClients = async (params = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create filters map for inactive clients (status=2 = archived)
      const filtersMap = new Map();
      filtersMap.set("pageSize", pageSize);
      filtersMap.set("sortField", sortBy);
      filtersMap.set("sortOrder", sortOrder);
      filtersMap.set("status", 2); // Only archived/inactive clients

      if (currentPage > 1) {
        // For pagination, we'd need cursor handling - simplified for now
        filtersMap.set("page", currentPage);
      }

      if (searchTerm) {
        filtersMap.set("search", searchTerm);
      }

      // Override with any additional params
      Object.keys(params).forEach((key) => {
        filtersMap.set(key, params[key]);
      });

      const response = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        false,
      );

      setInactiveClients(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
    } catch (err) {
      console.error("Failed to fetch inactive clients:", err);
      setError(err.message || "Failed to load inactive clients");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("ASC");
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Handle view details
  const handleViewDetails = async (client) => {
    try {
      // Fetch full client details
      const clientDetails = await customerManager.getCustomerDetail(
        client.id,
        onUnauthorized,
      );
      setSelectedClient(clientDetails);
      setShowDetailModal(true);
    } catch (err) {
      console.error("Failed to fetch client details:", err);
      setError(err.message || "Failed to load client details");
    }
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setTempSearchTerm("");
    setSortBy("lexical_name");
    setSortOrder("ASC");
    setCurrentPage(1);
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchInactiveClients();
  }, [currentPage, pageSize, searchTerm, sortBy, sortOrder]);

  // Handle URL state (success message from other pages)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get("success");
    if (message) {
      setSuccessMessage(message);
      // Clear the URL parameter
      window.history.replaceState({}, "", window.location.pathname);
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  }, []);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Settings", path: "/admin/settings", icon: "⚙️" },
    { label: "Inactive Clients", icon: "👤❌" },
  ];

  // Table columns configuration
  const tableColumns = [
    {
      key: "firstName",
      label: "First Name",
      render: (value, item) => (
        <button
          onClick={() => handleViewDetails(item)}
          style={{
            background: "none",
            border: "none",
            color: theme.colors.primary,
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {value}
        </button>
      ),
    },
    {
      key: "lastName",
      label: "Last Name",
      render: (value) => value || "—",
    },
    {
      key: "phone",
      label: "Phone",
      render: (value) => value || "—",
    },
    {
      key: "email",
      label: "Email",
      render: (value) => value || "—",
    },
    {
      key: "joinDate",
      label: "Join Date",
      render: (value) => {
        if (!value) return "—";
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, item) => (
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleViewDetails(item)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() =>
              navigate(`/admin/settings/inactive-client/${item.id}/update`)
            }
          >
            Edit
          </Button>
        </div>
      ),
    },
  ];

  const sortOptions = [
    { value: "lexical_name", label: "Name" },
    { value: "created_at", label: "Join Date" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ];

  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  // Format deactivation reason for display
  const getDeactivationReasonText = (reason, reasonOther) => {
    const reasonMap = {
      1: reasonOther || "Other",
      2: "Blacklisted",
      3: "Moved",
      4: "Deceased",
      5: "Do not contact",
      6: "Duplicate",
      7: "Other",
    };
    return reasonMap[reason] || "Not specified";
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "24px", fontWeight: "600" }}>
          👤❌ Inactive Clients
        </h1>
      </div>

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

      <Card title="Filter & Search">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "15px",
            marginBottom: "15px",
          }}
        >
          <div>
            <label style={globalStyles.label}>Search</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={tempSearchTerm}
                onChange={(e) => setTempSearchTerm(e.target.value)}
                style={{ ...globalStyles.input, flex: 1 }}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch}>🔍</Button>
            </div>
          </div>

          <Select
            label="Sort By"
            value={`${sortBy},${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split(",");
              setSortBy(field);
              setSortOrder(order);
              setCurrentPage(1);
            }}
            options={sortOptions.flatMap((option) => [
              { value: `${option.value},ASC`, label: `${option.label} (A-Z)` },
              { value: `${option.value},DESC`, label: `${option.label} (Z-A)` },
            ])}
          />

          <Select
            label="Items per page"
            value={pageSize}
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              setCurrentPage(1);
            }}
            options={pageSizeOptions}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <Button variant="outline" onClick={clearFilters}>
            🗑️ Clear Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchInactiveClients({ forceRefresh: true })}
          >
            🔄 Refresh
          </Button>
        </div>
      </Card>

      <Card>
        {isLoading ? (
          <Loading message="Loading inactive clients..." />
        ) : inactiveClients.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <h3>No Inactive Clients Found</h3>
            {searchTerm ? (
              <p>No inactive clients match your search criteria.</p>
            ) : (
              <p>No clients have been archived yet.</p>
            )}
            <div style={{ marginTop: "15px" }}>
              <Button
                variant="outline"
                onClick={() => navigate("/admin/customers")}
              >
                📋 View Active Clients
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div
              style={{ marginBottom: "15px", fontSize: "14px", color: "#666" }}
            >
              Showing {inactiveClients.length} of {totalCount} inactive clients
            </div>

            <Table
              columns={tableColumns}
              data={inactiveClients}
              onRowClick={(item) => handleViewDetails(item)}
            />

            {/* Pagination */}
            {totalCount > pageSize && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  ← Previous
                </Button>
                <span style={{ padding: "0 15px" }}>
                  Page {currentPage} of {Math.ceil(totalCount / pageSize)}
                </span>
                <Button
                  variant="outline"
                  disabled={!hasNextPage}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedClient(null);
        }}
        title="Inactive Client Details"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                setShowDetailModal(false);
                setSelectedClient(null);
              }}
            >
              Close
            </Button>
            {selectedClient && (
              <>
                <Button
                  variant="warning"
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/settings/inactive-client/${selectedClient.id}/update`,
                    );
                  }}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="info"
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/customer/${selectedClient.id}`);
                  }}
                >
                  👁️ View Full Profile
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedClient && (
          <div style={{ display: "grid", gap: "15px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label style={globalStyles.label}>First Name</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  {selectedClient.firstName || "—"}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Last Name</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  {selectedClient.lastName || "—"}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label style={globalStyles.label}>Email</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  {selectedClient.email || "—"}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Phone</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  {selectedClient.phone || "—"}
                </div>
              </div>
            </div>

            <div>
              <label style={globalStyles.label}>Deactivation Reason</label>
              <div
                style={{
                  padding: "8px",
                  background: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                {getDeactivationReasonText(
                  selectedClient.deactivationReason,
                  selectedClient.deactivationReasonOther,
                )}
              </div>
            </div>

            {selectedClient.description && (
              <div>
                <label style={globalStyles.label}>Description</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                    minHeight: "60px",
                  }}
                >
                  {selectedClient.description}
                </div>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "15px",
              }}
            >
              <div>
                <label style={globalStyles.label}>Join Date</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  {selectedClient.joinDate
                    ? new Date(selectedClient.joinDate).toLocaleDateString()
                    : "—"}
                </div>
              </div>
              <div>
                <label style={globalStyles.label}>Created Date</label>
                <div
                  style={{
                    padding: "8px",
                    background: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  {selectedClient.createdAt || "—"}
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SettingInactiveClientListPage;
