// File Path: web/workery-frontend/src/pages/Admin/Setting/Bulletin/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useBulletinManager } from "../../../../../services/Services";
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

function SettingBulletinListPage() {
  const bulletinManager = useBulletinManager();
  const navigate = useNavigate();

  // Component state
  const [bulletins, setBulletins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  // Filter and search state
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalCount, setTotalCount] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load bulletins
  const loadBulletins = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchText,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response = await bulletinManager.getBulletins(
        params,
        onUnauthorized,
        forceRefresh,
      );

      setBulletins(response.results || []);
      setTotalCount(response.count || 0);
      setHasNextPage(response.hasNextPage || false);
    } catch (err) {
      console.error("Failed to load bulletins:", err);
      setError(err.message || "Failed to load bulletins");
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    loadBulletins();
  }, [currentPage, pageSize, searchText, statusFilter, sortBy, sortOrder]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Event handlers
  const handleSearch = () => {
    setCurrentPage(1);
    loadBulletins(true);
  };

  const handleClearFilters = () => {
    setSearchText("");
    setStatusFilter("");
    setSortBy("created_at");
    setSortOrder("DESC");
    setCurrentPage(1);
  };

  const handleViewDetail = (bulletin) => {
    setSelectedBulletin(bulletin);
    setShowDetailModal(true);
  };

  const handleDelete = (bulletin) => {
    setSelectedBulletin(bulletin);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBulletin) return;

    try {
      setIsLoading(true);
      await bulletinManager.deleteBulletin(selectedBulletin.id, onUnauthorized);
      setSuccessMessage("Bulletin deleted successfully");
      setShowDeleteModal(false);
      setSelectedBulletin(null);
      loadBulletins(true);
    } catch (err) {
      console.error("Failed to delete bulletin:", err);
      setError(err.message || "Failed to delete bulletin");
    } finally {
      setIsLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: "text",
      label: "Text",
      render: (text) => (
        <div
          style={{
            maxWidth: "300px",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      key: "createdAt",
      label: "Created At",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (_, bulletin) => (
        <div style={{ display: "flex", gap: "10px" }}>
          <Button
            size="sm"
            variant="info"
            onClick={() => handleViewDetail(bulletin)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant="warning"
            onClick={() =>
              navigate(`/admin/settings/bulletin/${bulletin.id}/update`)
            }
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => handleDelete(bulletin)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  // Status options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "1", label: "Active" },
    { value: "2", label: "Archived" },
  ];

  // Sort options
  const sortOptions = [
    { value: "text,ASC", label: "Text (A-Z)" },
    { value: "text,DESC", label: "Text (Z-A)" },
    { value: "created_at,ASC", label: "Created Date (Oldest)" },
    { value: "created_at,DESC", label: "Created Date (Newest)" },
  ];

  // Pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
          { path: "/admin/settings", label: "Settings", icon: "⚙️" },
          { label: "Bulletins", icon: "📰" },
        ]}
      />

      <Card
        title="📰 Bulletins"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate("/admin/settings/bulletin/create")}
          >
            ➕ New Bulletin
          </Button>
        }
      >
        {/* Success/Error Messages */}
        {successMessage && (
          <Alert type="success" onClose={() => setSuccessMessage("")}>
            {successMessage}
          </Alert>
        )}
        {error && (
          <Alert type="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Filters */}
        <Card title="🔍 Search & Filters" style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <div>
              <label style={globalStyles.label}>Search Text</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Search bulletins..."
                  style={globalStyles.input}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button onClick={handleSearch} variant="primary">
                  🔍
                </Button>
              </div>
            </div>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={statusOptions}
            />

            <Select
              label="Sort By"
              value={`${sortBy},${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split(",");
                setSortBy(field);
                setSortOrder(order);
              }}
              options={sortOptions}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Button variant="secondary" onClick={handleClearFilters}>
              🧹 Clear Filters
            </Button>
            <Button variant="info" onClick={() => loadBulletins(true)}>
              🔄 Refresh
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && <Loading message="Loading bulletins..." />}

        {/* Results */}
        {!isLoading && (
          <>
            {bulletins.length > 0 ? (
              <>
                <div
                  style={{
                    marginBottom: "15px",
                    fontSize: "14px",
                    color: "#666",
                  }}
                >
                  Showing {startRecord}-{endRecord} of {totalCount} bulletins
                </div>

                <Table
                  columns={columns}
                  data={bulletins}
                  onRowClick={handleViewDetail}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <label>Page size:</label>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          setPageSize(parseInt(e.target.value));
                          setCurrentPage(1);
                        }}
                        style={globalStyles.input}
                      >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant="secondary"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(currentPage - 1)}
                      >
                        ← Previous
                      </Button>
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        disabled={!hasNextPage}
                        onClick={() => setCurrentPage(currentPage + 1)}
                      >
                        Next →
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#666",
                }}
              >
                <h3>📰 No Bulletins Found</h3>
                <p>
                  {searchText || statusFilter
                    ? "No bulletins match your current filters."
                    : "No bulletins have been created yet."}
                </p>
                <Button
                  variant="primary"
                  onClick={() => navigate("/admin/settings/bulletin/create")}
                  style={{ marginTop: "15px" }}
                >
                  ➕ Create First Bulletin
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="📰 Bulletin Details"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDetailModal(false)}
            >
              Close
            </Button>
            {selectedBulletin && (
              <>
                <Button
                  variant="warning"
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(
                      `/admin/settings/bulletin/${selectedBulletin.id}/update`,
                    );
                  }}
                >
                  ✏️ Edit
                </Button>
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleDelete(selectedBulletin);
                  }}
                >
                  🗑️ Delete
                </Button>
              </>
            )}
          </>
        }
      >
        {selectedBulletin && (
          <div>
            <div style={{ marginBottom: "15px" }}>
              <strong>Text:</strong>
              <p
                style={{
                  marginTop: "5px",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                {selectedBulletin.text}
              </p>
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
                fontSize: "14px",
              }}
            >
              <div>
                <strong>Created:</strong>
                <br />
                {new Date(selectedBulletin.createdAt).toLocaleString()}
              </div>
              <div>
                <strong>Created By:</strong>
                <br />
                {selectedBulletin.createdByUserName || "System"}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="🗑️ Delete Bulletin"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </>
        }
      >
        <p>
          Are you sure you want to delete this bulletin? This action cannot be
          undone.
        </p>
        {selectedBulletin && (
          <div
            style={{
              marginTop: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "4px",
            }}
          >
            <strong>Text:</strong> {selectedBulletin.text}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default SettingBulletinListPage;
