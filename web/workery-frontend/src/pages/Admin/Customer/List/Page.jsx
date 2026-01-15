// File Path: web/workery-frontend/src/pages/Admin/Customer/List/Page.jsx
// UIX Upgraded - Uses UniversalListPage whole page component
// @uix-page: AdminCustomerListPage

import React, { useMemo } from "react";
import { Link } from "react-router";
import { useCustomerManager } from "../../../../services/Services";
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
} from "@heroicons/react/24/outline";
import { UniversalListPage, Card, Button, ViewButton } from "../../../../components/UIX";

// Constants for filtering and sorting
const CUSTOMER_STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Archived" },
];

const CUSTOMER_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  { value: "1", label: "Unassigned" },
  { value: "2", label: "Residential" },
  { value: "3", label: "Commercial" },
];

const CUSTOMER_SORT_OPTIONS = [
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

// Customer type constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;

function AdminCustomerListPage() {
  const customerManager = useCustomerManager();

  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(() => ({
    // Entity information
    entityName: "Customer",
    entityNamePlural: "Customers",
    icon: UserGroupIcon,
    title: "Customers Management",
    subtitle: "Manage your customers and their information",

    // Routes
    routes: {
      search: "/admin/customers/search",
      create: "/admin/customers/add/step-1-search",
      detail: "/admin/customer/:id",
    },

    // Action buttons
    createLabel: "Add Customer",
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
        label: "Customers",
        icon: UserGroupIcon,
        isActive: true,
      },
    ],

    // Table columns for tabular view
    columns: [
      {
        key: "name",
        label: "Name",
        render: (customer) => (
          <Link
            to={`/admin/customer/${customer.id}`}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
              <>
                <BuildingOffice2Icon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-lg">
                  {customer.organizationName || `${customer.firstName} ${customer.lastName}`}
                </span>
              </>
            ) : (
              <>
                <HomeIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-lg">
                  {customer.firstName} {customer.lastName}
                </span>
              </>
            )}
          </Link>
        ),
      },
      {
        key: "phone",
        label: "Phone",
        render: (customer) =>
          customer.phone ? (
            <span className="flex items-center text-lg">
              <PhoneIcon className="w-5 h-5 mr-2 text-gray-400" />
              {customer.phone}
            </span>
          ) : (
            <span className="text-gray-400 italic text-lg">—</span>
          ),
      },
      {
        key: "email",
        label: "Email",
        render: (customer) =>
          customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="flex items-center hover:text-blue-600"
              onClick={(e) => e.stopPropagation()}
            >
              <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-400" />
              <span className="text-lg">{customer.email}</span>
            </a>
          ) : (
            <span className="text-gray-400 italic text-lg">—</span>
          ),
      },
      {
        key: "actions",
        label: "Actions",
        align: "center",
        render: (customer) => (
          <ViewButton
            to={`/admin/customer/${customer.id}`}
            text="View"
            icon={EyeIcon}
          />
        ),
      },
    ],

    // Filter options
    statusOptions: CUSTOMER_STATUS_OPTIONS,
    typeOptions: CUSTOMER_TYPE_OPTIONS,
    typeFilterLabel: "Type",
    sortOptions: CUSTOMER_SORT_OPTIONS,
    pageSizeOptions: PAGE_SIZE_OPTIONS,
    searchPlaceholder: "Search customers...",

    // Default values
    defaultStatus: "1", // Active
    defaultType: "",
    defaultSort: "lexical_name",
    defaultSortOrder: "ASC",
    defaultPageSize: 50,
    defaultViewType: "tabular",

    // Empty state
    emptyState: {
      title: "No Customers Found",
      filterDescription: "No customers match your current filters. Try adjusting your search criteria.",
      emptyDescription: "No customers have been added yet.",
      actionLabel: "Add First Customer",
    },

    // Data fetching
    fetchData: async (params, onUnauthorized, forceRefresh) => {
      const response = await customerManager.getCustomersWithFiltersMap(
        params,
        onUnauthorized,
        forceRefresh
      );
      return response;
    },

    // Build API parameters
    buildParams: ({ pageSize, currentCursor, sortBy, sortOrder, status, type, searchQuery }) => {
      const filtersMap = new Map();

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      filtersMap.set("page_size", pageSize.toString());

      if (sortBy) {
        filtersMap.set("sort_field", sortBy);
        filtersMap.set("sort_order", sortOrder === "DESC" ? "DESC" : "ASC");
      }

      if (searchQuery && searchQuery.trim()) {
        filtersMap.set("search", searchQuery.trim());
      }

      if (status) {
        filtersMap.set("status", status);
      }

      if (type) {
        filtersMap.set("type", type);
      }

      return filtersMap;
    },

    // Custom grid item renderer
    renderGridItem: (customer, navigate) => (
      <Card
        className={`hover:shadow-lg transition-shadow cursor-pointer ${
          customer.isBanned ? "border-red-300 bg-red-50" : ""
        }`}
        onClick={() => navigate(`/admin/customer/${customer.id}`)}
      >
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              <Link
                to={`/admin/customer/${customer.id}`}
                onClick={(e) => e.stopPropagation()}
                className="text-blue-600 hover:text-blue-800 flex items-start"
              >
                {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID ? (
                  <>
                    <BuildingOffice2Icon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-xl">
                      {customer.organizationName || `${customer.firstName} ${customer.lastName}`}
                    </span>
                  </>
                ) : (
                  <>
                    <HomeIcon className="w-6 h-6 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-xl">
                      {customer.firstName} {customer.lastName}
                    </span>
                  </>
                )}
              </Link>
            </h3>
          </div>

          <div className="space-y-2 text-base mb-4">
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && customer.organizationName && (
              <div className="text-base">
                <strong>Contact:</strong> {customer.firstName} {customer.lastName}
              </div>
            )}
            {customer.email && (
              <div className="flex items-center text-lg">
                <EnvelopeIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center text-lg">
                <PhoneIcon className="w-5 h-5 mr-2 text-gray-400 flex-shrink-0" />
                {customer.phone}
              </div>
            )}
            {customer.addressLine1 && (
              <div className="text-sm text-gray-600 mt-2">
                {customer.addressLine1}
                {customer.city && `, ${customer.city}`}
                {customer.region && `, ${customer.region}`}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="md"
            className="w-full"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/customer/${customer.id}`);
            }}
          >
            View Details
            <ChevronRightIcon className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    ),
  }), [customerManager]);

  return <UniversalListPage config={config} />;
}

export default AdminCustomerListPage;
