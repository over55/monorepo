// File Path: web/frontend/src/components/business/views/EntityOrderListView.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
  CheckCircleIcon,
  XCircleIcon,
  HomeIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  ClockIcon,
  PlusIcon,
  NoSymbolIcon,
  QuestionMarkCircleIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  ChevronRightIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { DateTime } from "luxon";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Badge,
  Button,
  Alert,
  Tabs,
  Avatar,
  ContactLink,
  AddressDisplay,
} from "../../UIX";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";

// Order status mappings with badge variants
const ORDER_STATUS_OPTIONS = {
  1: { label: "New", variant: "primary", colorClass: "text-blue-600" },
  2: { label: "Declined", variant: "error", colorClass: "text-red-600" },
  3: { label: "Pending", variant: "warning", colorClass: "text-yellow-600" },
  4: { label: "Cancelled", variant: "secondary", colorClass: "text-gray-600" },
  5: { label: "Ongoing", variant: "primary", colorClass: "text-blue-600" },
  6: { label: "In Progress", variant: "primary", colorClass: "text-blue-600" },
  7: { label: "Completed (Unpaid)", variant: "warning", colorClass: "text-yellow-600" },
  8: { label: "Completed (Paid)", variant: "success", colorClass: "text-green-600" },
  9: { label: "Archived", variant: "secondary", colorClass: "text-gray-600" },
};

// Order type mappings with icons
const ORDER_TYPE_OPTIONS = {
  0: { label: "-", icon: null },
  1: { label: "Residential", icon: HomeIcon },
  2: { label: "Commercial", icon: BuildingOfficeIcon },
  3: { label: "Unassigned", icon: QuestionMarkCircleIcon },
};

// Filter options for the search filter component
const ORDER_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "1", label: "New" },
  { value: "2", label: "Declined" },
  { value: "3", label: "Pending" },
  { value: "4", label: "Cancelled" },
  { value: "5", label: "Ongoing" },
  { value: "6", label: "In Progress" },
  { value: "7", label: "Completed (Unpaid)" },
  { value: "8", label: "Completed (Paid)" },
  { value: "9", label: "Archived" },
];

const ORDER_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Created Date (Newest)" },
  { value: "created_at,ASC", label: "Created Date (Oldest)" },
  { value: "wjid,ASC", label: "Work Order ID (A-Z)" },
  { value: "wjid,DESC", label: "Work Order ID (Z-A)" },
  { value: "status,ASC", label: "Status (A-Z)" },
  { value: "status,DESC", label: "Status (Z-A)" },
];

const PAGE_SIZE_OPTIONS = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: 250, label: "250" },
];

function EntityOrderListView({
  entityType,
  entityTypePlural,
  entityIcon,
  entityManager,
  entityTypeMap,
  entityStatusActive,
  entityStatusInactive,
  entityStatusArchived,
  basePath,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [entity, setEntity] = useState({});
  const [orders, setOrders] = useState([]);

  // Pagination state
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [currentCursor, setCurrentCursor] = useState("");
  const [nextCursor, setNextCursor] = useState("");

  // Search and filter state
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [statusFilter, setStatusFilter] = useState("");

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Initial load
  useEffect(() => {
    if (!hasInitialLoad.current) {
      window.scrollTo(0, 0);

      const loadData = async () => {
        try {
          setFetching(true);
          setErrors({});

          // Fetch entity details
          const entityData = await entityManager.getEntityDetail(id, onUnauthorized);
          setEntity(entityData);

          // For now, we'll use mock data for orders since the actual API integration would depend on the specific entity type
          const mockOrders = [
            {
              id: "order-1",
              wjid: "WO-2024-001",
              eventTitle: "Safety Training Session",
              eventDate: "2024-01-15",
              customerName: "John Smith Construction",
              status: 1,
              createdAt: "2024-01-10T10:00:00Z",
            },
            {
              id: "order-2",
              wjid: "WO-2024-002",
              eventTitle: "Equipment Maintenance",
              eventDate: "2024-01-20",
              customerName: "ABC Manufacturing",
              status: 5,
              createdAt: "2024-01-12T14:30:00Z",
            },
            {
              id: "order-3",
              wjid: "WO-2024-003",
              eventTitle: "Fire Safety Drill",
              eventDate: "2024-01-25",
              customerName: "XYZ Corporation",
              status: 8,
              createdAt: "2024-01-14T09:15:00Z",
            },
          ];

          setOrders(mockOrders);
          setNextCursor("next-page-cursor");

        } catch (error) {
          setErrors(error);
        } finally {
          setFetching(false);
        }
      };

      loadData();
      hasInitialLoad.current = true;
    }
  }, [id, entityManager, onUnauthorized]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    try {
      setFetching(true);
      setErrors({});

      // Fetch entity details
      const entityData = await entityManager.getEntityDetail(id, onUnauthorized);
      setEntity(entityData);

      // Refresh orders (mock data for now)
      const mockOrders = [
        {
          id: "order-1",
          wjid: "WO-2024-001",
          eventTitle: "Safety Training Session",
          eventDate: "2024-01-15",
          customerName: "John Smith Construction",
          status: 1,
          createdAt: "2024-01-10T10:00:00Z",
        },
        {
          id: "order-2",
          wjid: "WO-2024-002",
          eventTitle: "Equipment Maintenance",
          eventDate: "2024-01-20",
          customerName: "ABC Manufacturing",
          status: 5,
          createdAt: "2024-01-12T14:30:00Z",
        },
        {
          id: "order-3",
          wjid: "WO-2024-003",
          eventTitle: "Fire Safety Drill",
          eventDate: "2024-01-25",
          customerName: "XYZ Corporation",
          status: 8,
          createdAt: "2024-01-14T09:15:00Z",
        },
      ];

      setOrders(mockOrders);

    } catch (error) {
      setErrors(error);
    } finally {
      setFetching(false);
    }
  }, [id, entityManager, onUnauthorized]);

  // Search handlers
  const handleSearchSubmit = useCallback(() => {
    setAppliedSearchTerm(tempSearchTerm);
    // Reset pagination when searching
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("filtered-next-cursor");
  }, [tempSearchTerm]);

  const handleSort = useCallback(() => {
    // Reset pagination when sorting
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("sorted-next-cursor");
  }, []);

  const handleStatusFilter = useCallback(() => {
    // Reset pagination when filtering
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("status-filtered-next-cursor");
  }, []);

  const handlePageSizeChange = useCallback(() => {
    // Reset pagination when page size changes
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("page-size-changed-cursor");
  }, []);

  const handleClearFilters = useCallback(() => {
    setTempSearchTerm("");
    setAppliedSearchTerm("");
    setSortBy("created_at,DESC");
    setStatusFilter("");
    // Reset pagination
    setPreviousCursors([]);
    setCurrentCursor("");
    setNextCursor("clear-filters-cursor");
  }, []);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    if (nextCursor) {
      setPreviousCursors(prev => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
      setNextCursor("next-page-cursor-" + Date.now());
    }
  }, [currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    setPreviousCursors(prev => {
      if (prev.length > 0) {
        const arr = [...prev];
        const previousCursor = arr.pop();
        setCurrentCursor(previousCursor);
        setNextCursor("previous-page-cursor-" + Date.now());
        return arr;
      }
      return prev;
    });
  }, []);

  // Order row click handler
  const handleOrderClick = useCallback((order) => {
    window.open(`/admin/order/${order.wjid}`, '_blank');
  }, []);

  // Add new order handler
  const handleAddClick = useCallback(() => {
    const entityName = entity[`${entityType}Name`] || entity.name;
    window.open(`/admin/orders/add/step-2?oid=${id}&oname=${encodeURIComponent(entityName || entityType)}`, '_blank');
  }, [id, entity, entityType]);

  // Create status badge component (theme-aware)
  const createStatusBadge = (entity) => {
    if (!entity) return null;
    if (entity.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (entity.status === entityStatusActive) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    if (entityStatusInactive && entity.status === entityStatusInactive) {
      return (
        <Badge variant="warning" size="sm">
          <ClockIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Inactive
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        <ArchiveBoxIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
        Archived
      </Badge>
    );
  };

  // Get primary contact from entity
  const getPrimaryContact = (entity) => {
    if (
      !entity ||
      !entity.contacts ||
      entity.contacts.length === 0
    ) {
      return null;
    }
    return (
      entity.contacts.find((c) => c.isPrimary) || entity.contacts[0]
    );
  };

  // Tab configuration for the entity
  const tabItems = entity ? [
    {
      label: "Summary",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}`,
      isActive: false,
    },
    {
      label: "Details",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/full`,
      isActive: false,
    },
    {
      label: "Events",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/events`,
      isActive: false,
    },
    {
      label: "Orders",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/orders`,
      isActive: true,
    },
    {
      label: "Comments",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/comments`,
      isActive: false,
    },
    {
      label: "Attachments",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/attachments`,
      isActive: false,
    },
    {
      label: "More",
      to: `${basePath.replace('/admin', '/admin')}/${entityType}/${entity.id}/more`,
      isActive: false,
      icon: EllipsisHorizontalIcon,
    },
  ] : [];

  // Build status alerts
  const statusAlerts = [];
  if (entity && entity.status === entityStatusArchived) {
    statusAlerts.push({
      type: "info",
      message: `This ${entityType} is archived`,
      icon: ArchiveBoxIcon
    });
  }
  if (entity && entity.isBanned) {
    statusAlerts.push({
      type: "error",
      message: `This ${entityType} is banned`,
      icon: NoSymbolIcon
    });
  }

  // Breadcrumb configuration
  const breadcrumbItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon
    },
    {
      label: entityTypePlural,
      to: basePath,
      icon: entityIcon
    },
    {
      label: entity[`${entityType}Name`] || entity.name || `${entityType} Detail`,
      isActive: true
    }
  ];

  return (
    <UIXThemeProvider>
      <div className={`min-h-screen ${getThemeClasses('background.primary')}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

          {/* Breadcrumb */}
          <div className="mb-4 sm:mb-6">
            <Breadcrumb items={breadcrumbItems} />
          </div>

          {/* Status Alerts */}
          {statusAlerts.map((alert, index) => (
            <Alert
              key={index}
              type={alert.type}
              message={alert.message}
              icon={alert.icon}
              className="mb-4"
            />
          ))}

          {/* Error Display */}
          {errors && Object.keys(errors).length > 0 && (
            <Alert
              type="error"
              message="Failed to load data. Please try again."
              className="mb-4"
              onClose={() => setErrors({})}
            />
          )}

          {/* Header Section */}
          <div className={`${getThemeClasses('background.card')} rounded-lg shadow-sm border ${getThemeClasses('border.primary')} mb-6`}>
            <div className="p-4 sm:p-6">
              <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start gap-4 mb-6">

                {/* Entity Info Section */}
                <div className="flex flex-col xl:flex-row xl:items-start gap-4 xl:gap-6 flex-1">

                  {/* Avatar */}
                  <div className="flex justify-center xl:justify-start">
                    <Avatar
                      src={entity?.logoUrl}
                      alt={entity?.logoUrl ? `${entityType} Logo` : "No Logo"}
                      size="lg"
                      borderStyle="default"
                      showFallbackIcon={true}
                      fallbackIcon={entityIcon}
                    />
                  </div>

                  {/* Primary Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-center xl:text-left mb-4">
                      <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${getThemeClasses('text.primary')} mb-2`}>
                        {entity[`${entityType}Name`] || entity.name || `${entityType} Detail`}
                      </h1>
                      {entity[`${entityType}ShortName`] && (
                        <p className={`text-sm sm:text-base ${getThemeClasses('text.secondary')} mb-2`}>
                          ({entity[`${entityType}ShortName`]})
                        </p>
                      )}
                      <div className={`${getThemeClasses('text.secondary')} text-sm lg:text-base`}>
                        <Badge variant="primary" size="md">
                          {entityTypeMap[entity[`${entityType}Type`]] || "Unknown"}
                        </Badge>
                      </div>
                    </div>

                    {/* Primary Contact */}
                    {getPrimaryContact(entity) && (
                      <div className="mb-4 text-center xl:text-left">
                        <h3 className={`text-base sm:text-lg font-semibold ${getThemeClasses('text.primary')} mb-2`}>
                          Primary Contact
                        </h3>
                        <p className={`text-sm sm:text-base ${getThemeClasses('text.secondary')}`}>
                          {getPrimaryContact(entity).firstName}{" "}
                          {getPrimaryContact(entity).lastName}
                          {getPrimaryContact(entity).title && (
                            <span className={getThemeClasses('text.muted')}>
                              {" "}
                              - {getPrimaryContact(entity).title}
                            </span>
                          )}
                        </p>
                      </div>
                    )}

                    {/* Address */}
                    <AddressDisplay
                      addressData={entity}
                      size="md"
                      showIcon={true}
                      showMapsLink={true}
                      className="mb-4"
                    />

                    {/* Contact Links */}
                    <div className="space-y-2 sm:space-y-3">
                      <ContactLink
                        type="email"
                        value={getPrimaryContact(entity)?.email || entity?.contactEmail}
                        size="md"
                        fallbackText="No email"
                      />
                      <ContactLink
                        type="phone"
                        value={getPrimaryContact(entity)?.phone || entity?.contactPhone}
                        size="md"
                        fallbackText="No phone"
                      />
                      {entity?.website && (
                        <ContactLink
                          type="website"
                          value={entity.website}
                          size="md"
                          fallbackText="No website"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Status and Actions */}
                <div className={`xl:w-80 xl:pl-6 xl:border-l ${getThemeClasses('border.primary')}`}>
                  <div className={`space-y-2 text-xs sm:text-sm lg:text-base ${getThemeClasses('text.secondary')} mb-4`}>
                    {entity?.createdAt && (
                      <div className="flex items-center justify-center xl:justify-start">
                        <ClockIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text.muted')}`} />
                        <span className="font-medium">Created:</span>
                        <span className="ml-2">
                          {formatDateForDisplay(entity.createdAt)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-center xl:justify-start">
                      <CheckCircleIcon className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${getThemeClasses('text.muted')}`} />
                      <span className="font-medium">Status:</span>
                      <span className="ml-2">
                        {createStatusBadge(entity)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row xl:flex-col gap-2">
                    <Button
                      variant="outline"
                      onClick={() => navigate(basePath)}
                      icon={ChevronLeftIcon}
                      className="flex-1 sm:flex-initial"
                    >
                      Back
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleAddClick}
                      icon={PlusIcon}
                      className="flex-1 sm:flex-initial"
                    >
                      Add Order
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <Tabs items={tabItems} />
            </div>
          </div>

          {/* Orders List Section */}
          <div className={`${getThemeClasses('background.card')} rounded-lg shadow-sm border ${getThemeClasses('border.primary')}`}>
            <div className="p-4 sm:p-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                  <h2 className={`text-lg sm:text-xl font-semibold ${getThemeClasses('text.primary')} mb-1`}>
                    Orders
                  </h2>
                  <p className={`text-sm ${getThemeClasses('text.secondary')}`}>
                    Manage orders for this {entityType}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRefresh}
                    icon={ArrowPathIcon}
                    disabled={isFetching}
                    size="sm"
                  >
                    Refresh
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddClick}
                    icon={PlusIcon}
                    size="sm"
                  >
                    Add Order
                  </Button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-1`}>
                    Search
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={tempSearchTerm}
                      onChange={(e) => setTempSearchTerm(e.target.value)}
                      placeholder="Search orders..."
                      className={`flex-1 px-3 py-2 border ${getThemeClasses('border.primary')} rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    />
                    <Button
                      variant="primary"
                      onClick={handleSearchSubmit}
                      className="rounded-l-none"
                      size="sm"
                    >
                      Search
                    </Button>
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-1`}>
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      handleStatusFilter();
                    }}
                    className={`w-full px-3 py-2 border ${getThemeClasses('border.primary')} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    {ORDER_STATUS_FILTER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-1`}>
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      handleSort();
                    }}
                    className={`w-full px-3 py-2 border ${getThemeClasses('border.primary')} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    {ORDER_SORT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium ${getThemeClasses('text.primary')} mb-1`}>
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      handlePageSizeChange();
                    }}
                    className={`w-full px-3 py-2 border ${getThemeClasses('border.primary')} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                  >
                    {PAGE_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {(appliedSearchTerm || statusFilter || sortBy !== "created_at,DESC") && (
                <div className="flex justify-between items-center mb-4">
                  <div className={`text-sm ${getThemeClasses('text.secondary')}`}>
                    {appliedSearchTerm && <span>Search: "{appliedSearchTerm}" </span>}
                    {statusFilter && <span>Status: {ORDER_STATUS_FILTER_OPTIONS.find(o => o.value === statusFilter)?.label} </span>}
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleClearFilters}
                    size="sm"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}

              {/* Orders Table */}
              {isFetching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : orders && orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className={`border-b ${getThemeClasses('border.primary')}`}>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Event Title
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Event Date
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Customer Name
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Status
                        </th>
                        <th className={`text-left py-3 px-4 font-medium ${getThemeClasses('text.primary')}`}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order) => (
                        <tr
                          key={order.id}
                          className={`border-b ${getThemeClasses('border.primary')} hover:${getThemeClasses('background.hover')} cursor-pointer`}
                          onClick={() => handleOrderClick(order)}
                        >
                          <td className={`py-3 px-4 ${getThemeClasses('text.primary')}`}>
                            <div className="font-medium">{order.eventTitle}</div>
                            <div className={`text-sm ${getThemeClasses('text.muted')}`}>{order.wjid}</div>
                          </td>
                          <td className={`py-3 px-4 ${getThemeClasses('text.secondary')}`}>
                            {formatDateForDisplay(order.eventDate)}
                          </td>
                          <td className={`py-3 px-4 ${getThemeClasses('text.secondary')}`}>
                            {order.customerName}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={ORDER_STATUS_OPTIONS[order.status]?.variant || "secondary"}
                              size="sm"
                            >
                              {ORDER_STATUS_OPTIONS[order.status]?.label || "Unknown"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Button
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOrderClick(order);
                              }}
                              icon={ArrowTopRightOnSquareIcon}
                              size="sm"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <WrenchScrewdriverIcon className={`mx-auto h-12 w-12 ${getThemeClasses('text.muted')} mb-4`} />
                  <h3 className={`text-lg font-medium ${getThemeClasses('text.primary')} mb-2`}>
                    No orders found
                  </h3>
                  <p className={`text-sm ${getThemeClasses('text.secondary')} mb-4`}>
                    Get started by adding a new order for this {entityType}.
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleAddClick}
                    icon={PlusIcon}
                  >
                    Add First Order
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {orders && orders.length > 0 && (
                <div className={`flex justify-between items-center pt-6 border-t ${getThemeClasses('border.primary')}`}>
                  <div className={`text-sm ${getThemeClasses('text.secondary')}`}>
                    Showing {orders.length} orders
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousPage}
                      disabled={previousCursors.length === 0}
                      size="sm"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleNextPage}
                      disabled={!nextCursor}
                      size="sm"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </UIXThemeProvider>
  );
}

export default EntityOrderListView;