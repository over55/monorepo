// File Path: web/workery-frontend/src/pages/Admin/Associate/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminAssociateListPage

import React, { useMemo, useState } from "react";
import { Link } from "react-router";
import { useAssociateManager } from "../../../../services/Services";
import {
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  EyeIcon,
  ChartBarIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  HomeIcon,
  BriefcaseIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  PencilSquareIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import {
  UniversalListPage,
  Card,
  Button,
  Modal,
  ViewButton,
} from "../../../../components/UIX";

// Constants for filtering and sorting
const ASSOCIATE_STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Associate type constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

const ASSOCIATE_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: String(RESIDENTIAL_ASSOCIATE_TYPE_OF_ID), label: "Residential" },
  { value: String(COMMERCIAL_ASSOCIATE_TYPE_OF_ID), label: "Commercial" },
];

const ASSOCIATE_SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A → Z)" },
  { value: "lexical_name,DESC", label: "Name (Z → A)" },
  { value: "join_date,DESC", label: "Join Date (Newest → Oldest)" },
  { value: "join_date,ASC", label: "Join Date (Oldest → Newest)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
  { value: 100, label: "100 per page" },
  { value: 250, label: "250 per page" },
];

// Helper: Format associate type for display
const getAssociateTypeDisplay = (type) => {
  switch (type) {
    case COMMERCIAL_ASSOCIATE_TYPE_OF_ID:
      return "Commercial";
    case RESIDENTIAL_ASSOCIATE_TYPE_OF_ID:
      return "Residential";
    default:
      return "Unknown";
  }
};

// Helper: Get badge color for associate type
const getTypeBadgeColor = (associateType) => {
  switch (associateType) {
    case COMMERCIAL_ASSOCIATE_TYPE_OF_ID:
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case RESIDENTIAL_ASSOCIATE_TYPE_OF_ID:
      return "bg-green-100 text-green-800 border border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
  }
};

// Helper: Get badge color for job seeker status
const getJobSeekerBadgeColor = (isJobSeeker) => {
  return isJobSeeker === 1
    ? "bg-purple-100 text-purple-800 border border-purple-200"
    : "bg-gray-100 text-gray-800 border border-gray-200";
};

function AdminAssociateListPage() {
  const associateManager = useAssociateManager();

  // Modal state for detail view
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAssociate, setSelectedAssociate] = useState(null);

  // Modal state for deletion
  const [associateToDelete, setAssociateToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Handle delete confirmation
  const handleDeleteConfirm = async (onUnauthorized) => {
    if (!associateToDelete) return;

    setIsDeleting(true);

    try {
      await associateManager.deleteAssociate(
        associateToDelete.id,
        onUnauthorized
      );
      setAssociateToDelete(null);
      // Trigger refresh
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("AdminAssociateListPage: Failed to archive associate:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity information
    entityName: "Associate",
    entityNamePlural: "Associates",
    icon: WrenchScrewdriverIcon,
    title: "Associates Management",
    subtitle: "Manage your associates and their information",

    // Routes
    routes: {
      search: "/admin/associates/search",
      create: "/admin/associates/add/step-1-search",
      detail: "/admin/associate/:id",
    },

    // Action buttons
    createLabel: "Add Associate",
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
        label: "Associates",
        icon: WrenchScrewdriverIcon,
        isActive: true,
      },
    ],

    // Table columns for tabular view
    // DataList render function signature: (fieldValue, fullItem, rowIndex)
    columns: [
      {
        key: "name",
        label: "Name",
        render: (value, associate) => (
          <Link
            to={`/admin/associate/${associate.id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
              <>
                <BuildingOffice2Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-lg">
                  {associate.organizationName || `${associate.firstName} ${associate.lastName}`}
                </span>
              </>
            ) : (
              <>
                <HomeIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-lg">
                  {associate.firstName} {associate.lastName}
                </span>
              </>
            )}
          </Link>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (value, associate) =>
          associate.phone ? (
            <span className="flex items-center text-lg">
              <PhoneIcon className="w-5 h-5 mr-2 text-gray-400" />
              {associate.phone}
            </span>
          ) : (
            <span className="text-gray-400 italic text-lg">—</span>
          ),
      },
      {
        key: "email",
        label: "Email",
        render: (value, associate) =>
          associate.email ? (
            <a
              href={`mailto:${associate.email}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center hover:text-blue-600"
            >
              <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-lg">{associate.email}</span>
            </a>
          ) : (
            <span className="text-gray-400 italic text-lg">—</span>
          ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (value, associate) => (
          <ViewButton
            to={`/admin/associate/${associate.id}`}
            text="View"
            icon={EyeIcon}
          />
        ),
      },
    ],

    // Filter options
    statusOptions: ASSOCIATE_STATUS_OPTIONS,
    typeOptions: ASSOCIATE_TYPE_OPTIONS,
    typeFilterLabel: "Type",
    sortOptions: ASSOCIATE_SORT_OPTIONS,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchPlaceholder: "Search associates...",

    // Default values
    defaultStatus: "1", // Active
    defaultType: "all",
    defaultSort: "lexical_name",
    defaultSortOrder: "ASC",
    defaultPageSize: 50,
    defaultViewType: "tabular",

    // Empty state
    emptyState: {
      icon: WrenchScrewdriverIcon,
      title: "No Associates Found",
      filterDescription: "No associates match your current filters. Try adjusting your search criteria.",
      emptyDescription: "No associates have been added yet.",
      actionLabel: "Add First Associate",
      actionLink: "/admin/associates/add/step-1-search",
    },

    // Data fetching
    fetchData: async (filtersMap, onUnauthorized, forceRefresh) => {
      const response = await associateManager.getAssociatesWithFiltersMap(
        filtersMap,
        onUnauthorized,
        forceRefresh
      );
      return response;
    },

    // Build API parameters
    buildParams: ({ pageSize, currentCursor, sortBy, sortOrder, status, type, searchQuery, joinDateGte, isJobSeeker, hasTaxId }) => {
      const filtersMap = new Map();

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      filtersMap.set("page_size", pageSize.toString());

      // Add sorting
      if (sortBy) {
        filtersMap.set("sort_field", sortBy);
        // Backend expects 1 for ASC, -1 for DESC
        filtersMap.set("sort_order", sortOrder === "DESC" ? "-1" : "1");
      }

      if (searchQuery && searchQuery.trim()) {
        filtersMap.set("search", searchQuery.trim());
      }

      // Add status filter (only if not "all")
      if (status && status !== "all") {
        filtersMap.set("status", status);
      }

      // Add type filter (only if not "all")
      if (type && type !== "all") {
        filtersMap.set("type", type);
      }

      // Additional filters
      if (joinDateGte) {
        const date = new Date(joinDateGte);
        filtersMap.set("join_date_gte", date.getTime().toString());
      }

      if (isJobSeeker) {
        filtersMap.set("is_job_seeker", "1");
      }

      if (hasTaxId) {
        filtersMap.set("has_tax_id", "1");
      }

      return filtersMap;
    },

    // Additional filters configuration
    additionalFilters: [
      {
        key: "joinDateGte",
        label: "Join Date (From)",
        type: "date",
      },
      {
        key: "isJobSeeker",
        label: "Job Seekers Only",
        type: "checkbox",
      },
      {
        key: "hasTaxId",
        label: "Charges Tax",
        type: "checkbox",
      },
    ],

    // Handle row click for detail modal
    onRowClick: (associate) => {
      setSelectedAssociate(associate);
      setShowDetailModal(true);
    },

    // Custom grid item renderer
    renderGridItem: (associate, navigate) => (
      <Card
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => {
          setSelectedAssociate(associate);
          setShowDetailModal(true);
        }}
      >
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              <Link
                to={`/admin/associate/${associate.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 flex items-start"
              >
                {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                  <>
                    <BuildingOffice2Icon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-xl">
                      {associate.organizationName || `${associate.firstName} ${associate.lastName}`}
                    </span>
                  </>
                ) : (
                  <>
                    <HomeIcon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-xl">
                      {associate.firstName} {associate.lastName}
                    </span>
                  </>
                )}
              </Link>
            </h3>
          </div>

          <div className="space-y-2 text-base mb-4">
            {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID &&
              associate.organizationName && (
                <div className="text-base">
                  <strong>Contact:</strong> {associate.firstName} {associate.lastName}
                </div>
              )}
            {associate.email && (
              <div className="flex items-center text-lg">
                <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{associate.email}</span>
              </div>
            )}
            {associate.phone && (
              <div className="flex items-center text-lg">
                <PhoneIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                {associate.phone}
              </div>
            )}
            {associate.addressLine1 && (
              <div className="text-sm text-gray-600 mt-2">
                {associate.addressLine1}
                {associate.city && `, ${associate.city}`}
                {associate.region && `, ${associate.region}`}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/associate/${associate.id}`);
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
  }), [associateManager, refreshTrigger]);

  return (
    <>
      <UniversalListPage config={config} />

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal && !!selectedAssociate}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedAssociate(null);
        }}
        title="Associate Details"
        size="lg"
      >
        {selectedAssociate && (
          <>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  {selectedAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID
                    ? "Organization Name:"
                    : "Full Name:"}
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-base font-semibold text-black flex items-center">
                  {selectedAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                    <>
                      <BuildingOffice2Icon className="w-5 h-5 mr-2 text-gray-600" />
                      {selectedAssociate.organizationName ||
                        `${selectedAssociate.firstName} ${selectedAssociate.lastName}`}
                    </>
                  ) : (
                    <>
                      <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
                      {selectedAssociate.firstName} {selectedAssociate.lastName}
                    </>
                  )}
                </div>
              </div>

              {selectedAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID &&
                selectedAssociate.organizationName && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">
                      Contact Person:
                    </label>
                    <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                      {selectedAssociate.firstName} {selectedAssociate.lastName}
                    </div>
                  </div>
                )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Email:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                    {selectedAssociate.email ? (
                      <a
                        href={`mailto:${selectedAssociate.email}`}
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <EnvelopeIcon className="w-4 h-4 mr-2" />
                        {selectedAssociate.email}
                      </a>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Phone:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                    {selectedAssociate.phone ? (
                      <span className="flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-2" />
                        {selectedAssociate.phone}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Type:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedAssociate.type)}`}
                    >
                      {selectedAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ? (
                        <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                      ) : (
                        <HomeIcon className="w-4 h-4 mr-1" />
                      )}
                      {getAssociateTypeDisplay(selectedAssociate.type)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Job Seeker:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getJobSeekerBadgeColor(selectedAssociate.isJobSeeker)}`}
                    >
                      <BriefcaseIcon className="w-4 h-4 mr-1" />
                      {selectedAssociate.isJobSeeker === 1 ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {selectedAssociate.addressLine1 && (
                <div>
                  <label className="block text-sm font-medium text-black mb-1">
                    Address:
                  </label>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-black">
                    {selectedAssociate.addressLine1}
                    {selectedAssociate.city && `, ${selectedAssociate.city}`}
                    {selectedAssociate.region && `, ${selectedAssociate.region}`}
                    {selectedAssociate.postalCode && ` ${selectedAssociate.postalCode}`}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAssociate(null);
                }}
              >
                Close
              </Button>
              <Link to={`/admin/associate/${selectedAssociate.id}/edit`}>
                <Button
                  variant="warning"
                  icon={PencilSquareIcon}
                  onClick={() => setShowDetailModal(false)}
                >
                  Edit
                </Button>
              </Link>
              <Link to={`/admin/associate/${selectedAssociate.id}`}>
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
        isOpen={!!associateToDelete}
        onClose={() => setAssociateToDelete(null)}
        title="Archive Associate"
      >
        {associateToDelete && (
          <>
            <p className="text-sm text-black mb-4">
              Are you sure you want to archive this associate? They will no
              longer appear in active lists.
            </p>

            <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 mb-4">
              <p className="text-sm font-medium text-black mb-1">
                <strong>Name:</strong> {associateToDelete.firstName}{" "}
                {associateToDelete.lastName}
              </p>
              {associateToDelete.email && (
                <p className="text-sm text-black mt-1">
                  <strong>Email:</strong> {associateToDelete.email}
                </p>
              )}
              <p className="text-sm text-black mt-1">
                <strong>Type:</strong>{" "}
                {getAssociateTypeDisplay(associateToDelete.type)}
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
              <p className="text-xs text-blue-800 flex items-start">
                <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                <span>
                  <strong>Note:</strong> This action can be undone by a
                  system administrator. The associate's data will be
                  preserved.
                </span>
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setAssociateToDelete(null)}
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
                {isDeleting ? "Archiving..." : "Archive Associate"}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default AdminAssociateListPage;
