// File Path: web/workery-frontend/src/pages/Root/Tenant/List/Page.jsx
// Optimized responsive version with enhanced mobile/tablet/desktop support

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
  EllipsisVerticalIcon,
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
  const [openActionMenuId, setOpenActionMenuId] = useState(null);

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

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setOpenActionMenuId(null);
    };

    if (openActionMenuId) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openActionMenuId]);

  if (isLoading && !tenants) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Loading size="lg" text="Loading Tenants..." />
      </div>
    );
  }

  // Mobile action menu for table rows
  const MobileActionMenu = ({ row }) => (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpenActionMenuId(openActionMenuId === row.id ? null : row.id);
        }}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <EllipsisVerticalIcon className="h-5 w-5 text-gray-600" />
      </button>

      {openActionMenuId === row.id && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="py-1">
            <button
              onClick={() => {
                navigate(`/root/tenant/${row.id}`);
                setOpenActionMenuId(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <InformationCircleIcon className="mr-3 h-5 w-5" />
              View Details
            </button>
            <button
              onClick={() => {
                navigate(`/root/tenant/${row.id}/start`);
                setOpenActionMenuId(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <PlayIcon className="mr-3 h-5 w-5 text-green-600" />
              Start Tenant
            </button>
            <button
              onClick={() => {
                setSelectedTenantForDeletion(row);
                setOpenActionMenuId(null);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <TrashIcon className="mr-3 h-5 w-5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Desktop table columns
  const desktopColumns = [
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
      {/* Header - Responsive */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            {/* Title Section */}
            <div className="flex items-center space-x-3">
              <BuildingOffice2Icon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Tenants List
              </h1>
            </div>

            {/* Actions Section - Responsive */}
            <div className="flex flex-wrap gap-2">
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
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilter(!showFilter)}
                icon={FunnelIcon}
                className="flex-1 sm:flex-none"
              >
                <span className="hidden sm:inline">
                  {showFilter ? "Hide Filter" : "Show Filter"}
                </span>
                <span className="sm:hidden">Filter</span>
              </Button>
              <Link to="/root/tenant/add" className="flex-1 sm:flex-none">
                <Button
                  variant="success"
                  size="sm"
                  icon={PlusIcon}
                  className="w-full sm:w-auto"
                >
                  <span className="hidden sm:inline">New Tenant</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive padding */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6 overflow-x-auto">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        <Card className="overflow-hidden">
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

          {/* Filter Section - Responsive Grid */}
          {showFilter && (
            <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Search Field */}
                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search:
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
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
                      className="w-full sm:w-auto"
                    >
                      Search
                    </Button>
                  </div>
                </div>

                {/* Status Field */}
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

                {/* Date Field */}
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

          {/* Table/List View - Responsive */}
          {!isLoading &&
          tenants &&
          tenants.results &&
          tenants.results.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table columns={desktopColumns} data={tenants.results} />
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden space-y-3">
                {tenants.results.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {tenant.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Schema: {tenant.schemaName}
                        </p>
                      </div>
                      <MobileActionMenu row={tenant} />
                    </div>

                    {/* Mobile Action Buttons - Visible on small screens only */}
                    <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/root/tenant/${tenant.id}`)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() =>
                          navigate(`/root/tenant/${tenant.id}/start`)
                        }
                        className="flex-1"
                      >
                        Start
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setSelectedTenantForDeletion(tenant)}
                        className="flex-1"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 pt-6 border-t border-gray-200 gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
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

                {/* Page Navigation */}
                <div className="flex items-center justify-center sm:justify-end gap-2">
                  {hasPreviousPage && (
                    <Button
                      variant="secondary"
                      onClick={handlePreviousPage}
                      disabled={isLoading}
                      size="sm"
                      className="px-3 py-1.5"
                    >
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </Button>
                  )}
                  <span className="px-3 py-2 text-sm text-gray-700 font-medium">
                    Page {currentPage}
                  </span>
                  {hasNextPage && (
                    <Button
                      variant="secondary"
                      onClick={handleNextPage}
                      disabled={isLoading}
                      size="sm"
                      className="px-3 py-1.5"
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
            <div className="text-center py-8 sm:py-12 px-4">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h2 className="mt-4 text-base sm:text-lg font-medium text-gray-900">
                No Tenants
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                No tenants found.{" "}
                <Link
                  to="/root/tenant/add"
                  className="font-medium text-blue-600 hover:text-blue-500 inline-block mt-2 sm:mt-0"
                >
                  Click here to add your first tenant →
                </Link>
              </p>
            </div>
          ) : null}
        </Card>
      </main>

      {/* Delete Confirmation Modal - Responsive */}
      <Modal
        isOpen={!!selectedTenantForDeletion}
        onClose={() => setSelectedTenantForDeletion(null)}
        title="Confirm Deletion"
        className="sm:max-w-lg"
      >
        <div className="flex items-start space-x-3 mb-6">
          <ExclamationTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the tenant "
            <strong className="break-all">
              {selectedTenantForDeletion?.name}
            </strong>
            "? This action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => setSelectedTenantForDeletion(null)}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default RootTenantListPage;
