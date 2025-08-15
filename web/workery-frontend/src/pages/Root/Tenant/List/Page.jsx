// File Path: web/workery-frontend/src/pages/Root/Tenant/List/Page.jsx
// Modernized version with Tailwind classes and Heroicons (no emojis)

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useTenantManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
  Select,
  Table,
} from "../../../../components/UI";
import {
  BuildingOfficeIcon,
  HomeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  FunnelIcon,
  InformationCircleIcon,
  PlayIcon,
  TrashIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

function RootTenantListPage() {
  const tenantManager = useTenantManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [tenants, setTenants] = useState(null);
  const [selectedTenantForDeletion, setSelectedTenantForDeletion] =
    useState(null);

  // Pagination
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  // Filtering
  const [showFilter, setShowFilter] = useState(false);
  const [temporarySearchText, setTemporarySearchText] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [createdAtGTE, setCreatedAtGTE] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchTenants = async (
    page = 1,
    limit = 50,
    search = "",
    statusFilter = "",
    createdAfter = null,
  ) => {
    setIsLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: limit,
        search: search,
        sortBy: "created_at",
        sortOrder: "DESC",
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (createdAfter) {
        params.createdAtGTE = new Date(createdAfter).getTime();
      }

      const tenantsData = await tenantManager.getTenants(
        params,
        onUnauthorized,
        true,
      );

      setTenants(tenantsData);
      setHasNextPage(tenantsData.hasNextPage || false);
      setHasPreviousPage(page > 1);

      console.log("RootTenantListPage: Tenants fetched successfully:", {
        count: tenantsData.results ? tenantsData.results.length : 0,
        totalCount: tenantsData.count,
      });
    } catch (error) {
      console.error("RootTenantListPage: Failed to fetch tenants:", error);
      setErrors({ fetch: error.message || "Failed to load tenants" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchTenants(nextPage, pageSize, actualSearchText, status, createdAtGTE);
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchTenants(prevPage, pageSize, actualSearchText, status, createdAtGTE);
  };

  const handleSearch = () => {
    setActualSearchText(temporarySearchText);
    setCurrentPage(1);
    fetchTenants(1, pageSize, temporarySearchText, status, createdAtGTE);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTenantForDeletion) return;

    setIsLoading(true);

    try {
      await tenantManager.archiveTenant(
        selectedTenantForDeletion.id,
        onUnauthorized,
      );

      fetchTenants(
        currentPage,
        pageSize,
        actualSearchText,
        status,
        createdAtGTE,
      );

      setSelectedTenantForDeletion(null);
      console.log("RootTenantListPage: Tenant archived successfully");
    } catch (error) {
      console.error("RootTenantListPage: Failed to archive tenant:", error);
      setErrors({ delete: error.message || "Failed to delete tenant" });
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchTenants();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading && !tenants) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Loading Tenants..." />
      </div>
    );
  }

  // Table columns configuration
  const columns = [
    {
      key: "schemaName",
      label: "Schema",
      align: "left",
    },
    {
      key: "name",
      label: "Name",
      align: "left",
    },
    {
      key: "actions",
      label: "Actions",
      align: "center",
      render: (value, row) => (
        <div className="flex gap-2 justify-center">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(`/root/tenant/${row.id}`)}
            icon={InformationCircleIcon}
          >
            View
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => navigate(`/root/tenant/${row.id}/start`)}
            icon={PlayIcon}
          >
            Start
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setSelectedTenantForDeletion(row)}
            icon={TrashIcon}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const breadcrumbItems = [
    {
      label: "Root Dashboard",
      href: "/root/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Tenants",
      icon: BuildingOffice2Icon,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <BuildingOffice2Icon className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Tenants List
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  fetchTenants(
                    currentPage,
                    pageSize,
                    actualSearchText,
                    status,
                    createdAtGTE,
                  )
                }
                disabled={isLoading}
                icon={ArrowPathIcon}
              >
                Refresh
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilter(!showFilter)}
                icon={FunnelIcon}
              >
                {showFilter ? "Hide Filter" : "Show Filter"}
              </Button>
              <Link to="/root/tenant/add">
                <Button variant="success" size="sm" icon={PlusIcon}>
                  New Tenant
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Card>
          {errors.fetch && (
            <Alert type="error" dismissible onDismiss={() => setErrors({})}>
              {errors.fetch}
            </Alert>
          )}
          {errors.delete && (
            <Alert type="error" dismissible onDismiss={() => setErrors({})}>
              {errors.delete}
            </Alert>
          )}

          {/* Filter Section */}
          {showFilter && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Search by name..."
                      value={temporarySearchText}
                      onChange={(e) => setTemporarySearchText(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Button
                      onClick={handleSearch}
                      size="sm"
                      icon={MagnifyingGlassIcon}
                    >
                      Search
                    </Button>
                  </div>
                </div>

                <div>
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: "", label: "All Statuses" },
                      { value: "1", label: "Active" },
                      { value: "2", label: "Inactive" },
                    ]}
                  />
                </div>

                <div>
                  <Input
                    label="Created After"
                    type="date"
                    value={createdAtGTE}
                    onChange={(e) => setCreatedAtGTE(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-8">
              <Loading size="md" text="Loading..." />
            </div>
          )}

          {/* Table */}
          {!isLoading &&
          tenants &&
          tenants.results &&
          tenants.results.length > 0 ? (
            <>
              <Table columns={columns} data={tenants.results} />

              {/* Pagination */}
              <div className="flex flex-wrap justify-between items-center mt-6 pt-6 border-t border-gray-200 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Page Size:
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newPageSize = parseInt(e.target.value);
                      setPageSize(newPageSize);
                      setCurrentPage(1);
                      fetchTenants(
                        1,
                        newPageSize,
                        actualSearchText,
                        status,
                        createdAtGTE,
                      );
                    }}
                    className="px-3 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {hasPreviousPage && (
                    <Button
                      variant="secondary"
                      onClick={handlePreviousPage}
                      disabled={isLoading}
                    >
                      Previous
                    </Button>
                  )}
                  <span className="px-3 py-2 text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  {hasNextPage && (
                    <Button
                      variant="secondary"
                      onClick={handleNextPage}
                      disabled={isLoading}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : !isLoading &&
            tenants &&
            (!tenants.results || tenants.results.length === 0) ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-lg font-medium text-gray-900">
                No Tenants
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                No tenants found.{" "}
                <Link
                  to="/root/tenant/add"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Click here to add your first tenant →
                </Link>
              </p>
            </div>
          ) : null}
        </Card>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedTenantForDeletion}
        onClose={() => setSelectedTenantForDeletion(null)}
        title="Confirm Deletion"
      >
        <div className="flex items-start space-x-3 mb-6">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the tenant "
            <strong>{selectedTenantForDeletion?.name}</strong>"? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setSelectedTenantForDeletion(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default RootTenantListPage;
