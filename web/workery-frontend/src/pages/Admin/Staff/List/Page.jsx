// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminStaffListPageWithProvider

import React, { useMemo, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { useStaffManager } from "../../../../services/Services";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  EyeIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserCircleIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import {
  UniversalListPage,
  Card,
  Button,
  Modal,
  ViewButton,
  Badge,
  Alert,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_STATUS_FILTER_OPTIONS,
  STAFF_SORT_OPTIONS,
  STAFF_TYPE_MAP,
} from "../../../../constants/Staff";

// Page size options
const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

// Convert filter options for UniversalListPage (use "all" instead of 0 for All option)
const STATUS_OPTIONS = STAFF_STATUS_FILTER_OPTIONS.map(opt => ({
  value: opt.value === 0 ? "all" : String(opt.value),
  label: opt.label,
}));

const TYPE_OPTIONS = STAFF_TYPE_FILTER_OPTIONS.map(opt => ({
  value: opt.value === 0 ? "all" : String(opt.value),
  label: opt.label,
}));

// Helper function to get Badge variant for staff type
const getTypeBadgeVariant = (staffType) => {
  const variantMap = {
    1: "info",      // Executive
    2: "success",   // Management
    3: "primary",   // Frontline
    0: "secondary", // All/Unknown
  };
  return variantMap[staffType] || "secondary";
};

// Helper function to get Badge variant for status
const getStatusBadgeVariant = (statusValue) => {
  return statusValue === 1 ? "success" : "secondary";
};

function AdminStaffListPage() {
  const staffManager = useStaffManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
    linkPrimary: getThemeClasses("link-primary"),
    bgCard: getThemeClasses("bg-card"),
    bgMuted: getThemeClasses("bg-muted"),
    cardBorder: getThemeClasses("card-border"),
    borderMedium: getThemeClasses("border-medium"),
  }), [getThemeClasses]);

  // Modal state for detail view
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Modal state for deletion
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle delete confirmation
  const handleDeleteConfirm = async (onUnauthorized) => {
    if (!selectedStaffForDeletion) return;

    setIsDeleting(true);

    try {
      await new Promise((resolve, reject) => {
        staffManager.archiveStaffWithCallbacks(
          selectedStaffForDeletion.id,
          () => resolve(),
          (error) => reject(error),
          () => {},
          onUnauthorized
        );
      });
      setSelectedStaffForDeletion(null);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("AdminStaffListPage: Failed to archive staff:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity information
    entityName: "Staff",
    entityNamePlural: "Staff",
    icon: UserGroupIcon,
    title: "Staff Management",
    subtitle: "Manage your staff members",

    // Routes
    routes: {
      search: "/admin/staff/search",
      create: "/admin/staff/add/step-1-search",
      detail: "/admin/staff/:id",
    },

    // Action buttons
    createLabel: "Add Staff",
    createIcon: PlusIcon,
    searchIcon: MagnifyingGlassIcon,

    // Breadcrumb
    breadcrumbItems: [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: ChartBarIcon,
      },
      {
        label: "Staff",
        icon: UserGroupIcon,
        isActive: true,
      },
    ],

    // Table columns for tabular view
    // DataList render function signature: (fieldValue, fullItem, rowIndex)
    columns: [
      {
        key: "name",
        label: "Name",
        render: (value, staff) => (
          <Link
            to={`/admin/staff/${staff.id}`}
            onClick={(e) => e.stopPropagation()}
            className={`${themeClasses.linkPrimary} font-medium flex items-center`}
          >
            <UserCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-lg">
              {staff.name || `${staff.firstName} ${staff.lastName}`}
            </span>
          </Link>
        ),
      },
      {
        key: "email",
        label: "Email",
        render: (value, staff) =>
          staff.email ? (
            <a
              href={`mailto:${staff.email}`}
              onClick={(e) => e.stopPropagation()}
              className={`flex items-center ${themeClasses.linkPrimary}`}
            >
              <EnvelopeIcon className={`w-5 h-5 mr-2 ${themeClasses.textMuted}`} />
              <span className="text-lg">{staff.email}</span>
            </a>
          ) : (
            <span className={`${themeClasses.textMuted} italic text-lg`}>—</span>
          ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (value, staff) =>
          staff.phone ? (
            <span className="flex items-center text-lg">
              <PhoneIcon className={`w-5 h-5 mr-2 ${themeClasses.textMuted}`} />
              {staff.phone}
            </span>
          ) : (
            <span className={`${themeClasses.textMuted} italic text-lg`}>—</span>
          ),
      },
      {
        key: "type",
        label: "Type",
        render: (value, staff) => (
          <Badge variant={getTypeBadgeVariant(staff.type)}>
            {STAFF_TYPE_MAP[staff.type] || "Unknown"}
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (value, staff) => (
          <ViewButton
            to={`/admin/staff/${staff.id}`}
            text="View"
            icon={EyeIcon}
          />
        ),
      },
    ],

    // Filter options
    statusOptions: STATUS_OPTIONS,
    typeOptions: TYPE_OPTIONS,
    typeFilterLabel: "Type",
    sortOptions: STAFF_SORT_OPTIONS,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchPlaceholder: "Search staff...",

    // Default values
    defaultStatus: "1", // Active
    defaultType: "all",
    defaultSort: "lexical_name",
    defaultSortOrder: "ASC",
    defaultPageSize: 50,
    defaultViewType: "tabular",

    // Empty state
    emptyState: {
      icon: UserGroupIcon,
      title: "No Staff Members Found",
      filterDescription: "No staff members match your current filters. Try adjusting your search criteria.",
      emptyDescription: "No staff members have been added yet.",
      actionLabel: "Add First Staff Member",
      actionLink: "/admin/staff/add/step-1-search",
    },

    // Data fetching - wrap the callback-based API in a Promise
    fetchData: async (filtersMap, onUnauthorized, forceRefresh) => {
      return new Promise((resolve, reject) => {
        staffManager.getStaffWithFiltersMapWithCallbacks(
          filtersMap,
          (response) => resolve(response),
          (error) => reject(error),
          () => {}, // onDone callback
          onUnauthorized,
          forceRefresh
        );
      });
    },

    // Build API parameters
    buildParams: ({ pageSize, currentCursor, sortBy, sortOrder, status, type, searchQuery }) => {
      const filtersMap = new Map();

      filtersMap.set("pageSize", pageSize);

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Add sorting
      if (sortBy) {
        filtersMap.set("sortField", sortBy);
        filtersMap.set("sortOrder", sortOrder === "DESC" ? "DESC" : "ASC");
      }

      // Add status filter (only if not "all")
      if (status && status !== "all") {
        filtersMap.set("status", parseInt(status, 10));
      }

      // Add type filter (only if not "all")
      if (type && type !== "all") {
        filtersMap.set("type", parseInt(type, 10));
      }

      if (searchQuery && searchQuery.trim()) {
        filtersMap.set("search", searchQuery.trim());
      }

      return filtersMap;
    },

    // Handle row click for detail modal
    onRowClick: (staff) => {
      setSelectedStaff(staff);
      setShowDetailModal(true);
    },

    // Custom grid item renderer
    renderGridItem: (staff, navigate) => (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => {
          setSelectedStaff(staff);
          setShowDetailModal(true);
        }}
      >
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              <Link
                to={`/admin/staff/${staff.id}`}
                onClick={(e) => e.stopPropagation()}
                className={`${themeClasses.linkPrimary} flex items-start`}
              >
                <UserCircleIcon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-xl">
                  {staff.name || `${staff.firstName} ${staff.lastName}`}
                </span>
              </Link>
            </h3>
          </div>

          <div className="space-y-2 text-base mb-4">
            {staff.email && (
              <div className="flex items-center text-lg">
                <EnvelopeIcon className={`w-5 h-5 mr-2 ${themeClasses.textMuted} flex-shrink-0`} />
                <span className="truncate">{staff.email}</span>
              </div>
            )}
            {staff.phone && (
              <div className="flex items-center text-lg">
                <PhoneIcon className={`w-5 h-5 mr-2 ${themeClasses.textMuted} flex-shrink-0`} />
                {staff.phone}
              </div>
            )}
            {staff.addressLine1 && (
              <div className={`text-sm ${themeClasses.textSecondary} mt-2`}>
                {staff.addressLine1}
                {staff.city && `, ${staff.city}`}
                {staff.region && `, ${staff.region}`}
              </div>
            )}
          </div>

          <div className="mb-4">
            <Badge variant={getTypeBadgeVariant(staff.type)}>
              {STAFF_TYPE_MAP[staff.type] || "Unknown"}
            </Badge>
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/staff/${staff.id}`);
            }}
          >
            View Details
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    ),

    // Refresh trigger for external updates
    refreshTrigger,
  }), [staffManager, refreshTrigger]);

  return (
    <>
      <UniversalListPage config={config} />

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal && !!selectedStaff}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedStaff(null);
        }}
        title="Staff Details"
        size="lg"
      >
        {selectedStaff && (
          <>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                  Full Name:
                </label>
                <div className={`p-3 ${themeClasses.bgMuted} rounded-lg text-base font-semibold ${themeClasses.textPrimary} flex items-center`}>
                  <UserIcon className={`w-5 h-5 mr-2 ${themeClasses.textSecondary}`} />
                  {selectedStaff.name || `${selectedStaff.firstName} ${selectedStaff.lastName}`}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Email:
                  </label>
                  <div className={`p-3 ${themeClasses.bgMuted} rounded-lg text-sm ${themeClasses.textPrimary}`}>
                    {selectedStaff.email ? (
                      <a
                        href={`mailto:${selectedStaff.email}`}
                        className={`flex items-center ${themeClasses.linkPrimary}`}
                      >
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        {selectedStaff.email}
                      </a>
                    ) : (
                      <span className={`${themeClasses.textMuted} italic`}>Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Phone:
                  </label>
                  <div className={`p-3 ${themeClasses.bgMuted} rounded-lg text-sm ${themeClasses.textPrimary}`}>
                    {selectedStaff.phone ? (
                      <span className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {selectedStaff.phone}
                      </span>
                    ) : (
                      <span className={`${themeClasses.textMuted} italic`}>Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Type:
                  </label>
                  <div className={`p-3 ${themeClasses.bgMuted} rounded-lg`}>
                    <Badge variant={getTypeBadgeVariant(selectedStaff.type)} icon={BriefcaseIcon}>
                      {STAFF_TYPE_MAP[selectedStaff.type] || "Unknown"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Status:
                  </label>
                  <div className={`p-3 ${themeClasses.bgMuted} rounded-lg`}>
                    <Badge
                      variant={getStatusBadgeVariant(selectedStaff.status)}
                      icon={selectedStaff.status === 1 ? CheckCircleIcon : ArchiveBoxIcon}
                    >
                      {selectedStaff.status === 1 ? "Active" : "Archived"}
                    </Badge>
                  </div>
                </div>
              </div>

              {selectedStaff.addressLine1 && (
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textPrimary} mb-1`}>
                    Address:
                  </label>
                  <div className={`p-3 ${themeClasses.bgMuted} rounded-lg text-sm ${themeClasses.textPrimary}`}>
                    {selectedStaff.addressLine1}
                    {selectedStaff.city && `, ${selectedStaff.city}`}
                    {selectedStaff.region && `, ${selectedStaff.region}`}
                    {selectedStaff.postalCode && ` ${selectedStaff.postalCode}`}
                  </div>
                </div>
              )}
            </div>

            <div className={`flex justify-end space-x-3 mt-6 pt-4 border-t ${themeClasses.borderMedium}`}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedStaff(null);
                }}
              >
                Close
              </Button>
              <Link to={`/admin/staff/${selectedStaff.id}/edit`}>
                <Button
                  variant="warning"
                  icon={PencilSquareIcon}
                  onClick={() => setShowDetailModal(false)}
                >
                  Edit
                </Button>
              </Link>
              <Link to={`/admin/staff/${selectedStaff.id}`}>
                <Button
                  variant="primary"
                  icon={EyeIcon}
                  onClick={() => setShowDetailModal(false)}
                >
                  View Full Details
                </Button>
              </Link>
            </div>
          </>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedStaffForDeletion}
        onClose={() => setSelectedStaffForDeletion(null)}
        title="Archive Staff Member"
      >
        {selectedStaffForDeletion && (
          <>
            <p className={`text-sm ${themeClasses.textPrimary} mb-4`}>
              Are you sure you want to archive this staff member? They will
              no longer appear in active lists.
            </p>

            <Alert type="warning" className="mb-4">
              <p className="text-sm font-medium mb-1">
                <strong>Name:</strong>{" "}
                {selectedStaffForDeletion.name ||
                  `${selectedStaffForDeletion.firstName} ${selectedStaffForDeletion.lastName}`}
              </p>
              {selectedStaffForDeletion.email && (
                <p className="text-sm mt-1">
                  <strong>Email:</strong> {selectedStaffForDeletion.email}
                </p>
              )}
              <p className="text-sm mt-1">
                <strong>Type:</strong>{" "}
                {STAFF_TYPE_MAP[selectedStaffForDeletion.type] || "Unknown"}
              </p>
            </Alert>

            <Alert type="info" icon={InformationCircleIcon} className="mb-6">
              <span className="text-xs">
                <strong>Note:</strong> This action can be undone by a
                system administrator. The staff member's data will be
                preserved.
              </span>
            </Alert>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setSelectedStaffForDeletion(null)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteConfirm(() => {})}
                disabled={isDeleting}
                icon={ArchiveBoxIcon}
                className="w-full sm:w-auto"
              >
                {isDeleting ? "Archiving..." : "Archive Staff Member"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffListPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffListPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffListPageWithProvider;
