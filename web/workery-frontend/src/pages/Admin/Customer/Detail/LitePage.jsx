// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/LitePage.jsx
// UIX Upgraded - Uses DetailLiteView whole page component
// @uix-page: AdminCustomerDetailLitePage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  NoSymbolIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../services/Services";
import { TagsDisplay } from "../../../../components/business/displays";
import { DetailLiteView } from "../../../../components/UIX";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const CUSTOMER_STATUS_ACTIVE = 1;
const CUSTOMER_STATUS_ARCHIVED = 2;

const CUSTOMER_TYPE_MAP = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

function AdminCustomerDetailLitePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();

  // State management
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch customer data
  const fetchCustomer = useCallback(async () => {
    if (!cid) return;

    setLoading(true);
    setError(null);

    try {
      const customerData = await customerManager.getCustomerDetail(
        cid,
        onUnauthorized,
      );
      setCustomer(customerData);
    } catch (err) {
      console.error("Failed to fetch customer:", err);
      setError("Failed to load customer details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [cid, customerManager, onUnauthorized]);

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCustomer();
  }, [fetchCustomer]);

  // Format phone number for display
  const formatPhone = useCallback((phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }, []);

  // Format address for display
  const formatAddress = useCallback((customerData) => {
    if (!customerData) return "-";
    const address =
      customerData.fullAddressWithPostalCode ||
      `${customerData.addressLine1 || ""} ${customerData.city || ""} ${customerData.region || ""} ${customerData.postalCode || ""}`.trim();
    return address || "-";
  }, []);

  // Get Google Maps URL
  const getGoogleMapsUrl = useCallback((customerData) => {
    if (!customerData) return null;
    return customerData.fullAddressUrl || null;
  }, []);

  // Extract IDs from array of objects
  const extractIds = useCallback((items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  }, []);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: ChartBarIcon,
    },
    {
      label: "Customers",
      to: "/admin/customers",
      icon: UserIcon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
      isActive: true,
    },
  ], []);

  // Memoize header config
  const headerConfig = useMemo(() => ({
    title: "Summary",
    icon: ClipboardDocumentListIcon,
    loadingText: "Loading customer details...",
    notFoundTitle: "Customer Not Found",
    notFoundMessage: "The customer you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Customers",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/customers"),
    },
  }), [navigate]);

  // Memoize tabs
  const tabs = useMemo(() => {
    if (!customer) return [];
    return [
      { label: "Summary", to: `/admin/customer/${customer.id}`, isActive: true },
      { label: "Detail", to: `/admin/customer/${customer.id}/detail` },
      { label: "Orders", to: `/admin/customer/${customer.id}/orders` },
      { label: "Comments", to: `/admin/customer/${customer.id}/comments` },
      { label: "Attachments", to: `/admin/customer/${customer.id}/attachments` },
      { label: "More", to: `/admin/customer/${customer.id}/more`, icon: EllipsisHorizontalIcon },
    ];
  }, [customer]);

  // Memoize action buttons
  const actionButtons = useMemo(() => {
    if (!customer) return [];
    return [
      {
        variant: "outline",
        label: "Back",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/customers"),
      },
      {
        variant: "secondary",
        label: "Edit",
        icon: PencilSquareIcon,
        disabled: customer.status === CUSTOMER_STATUS_ARCHIVED,
        onClick: () => navigate(`/admin/customer/${cid}/edit`),
      },
      {
        variant: "primary",
        label: "New Order",
        icon: PlusCircleIcon,
        external: true,
        onClick: () => window.open(`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`, '_blank'),
      },
    ];
  }, [customer, navigate, cid]);

  // Memoize alerts configuration
  const alerts = useMemo(() => ({
    archived: {
      message: "This customer is archived",
      icon: ArchiveBoxIcon,
    },
    banned: {
      message: "This customer is banned",
      icon: NoSymbolIcon,
    },
  }), []);

  // Format status display
  const formatStatus = useCallback((customerData) => {
    if (customerData.isBanned) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </span>
      );
    }
    if (customerData.status === CUSTOMER_STATUS_ACTIVE) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
        Archived
      </span>
    );
  }, []);

  // Memoize field sections
  const fieldSections = useMemo(() => {
    if (!customer) return [];

    return [
      // Primary column - Basic Info
      {
        column: "primary",
        component: (
          <div>
            {/* Name/Organization */}
            <div className="mb-3 sm:mb-4 lg:mb-5">
              {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                  <BuildingOfficeIcon className="w-5 sm:w-6 h-5 sm:h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="break-words">
                    {customer.organizationName}
                  </span>
                </h2>
              )}
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center justify-center xl:justify-start">
                {customer.type === RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                  <HomeIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-7 lg:h-7 mr-2 text-blue-600 flex-shrink-0" />
                )}
                <span className="break-words">
                  {customer.name ||
                    `${customer.firstName} ${customer.lastName}`}
                </span>
              </h3>
              <div className="mt-2 text-sm lg:text-base text-gray-600">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800">
                  {CUSTOMER_TYPE_MAP[customer.type] || "Unknown"}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 lg:mb-5 justify-center xl:justify-start">
              <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <span className="break-words">
                  {formatAddress(customer)}
                </span>
                {getGoogleMapsUrl(customer) && (
                  <a
                    href={getGoogleMapsUrl(customer)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-700"
                  >
                    <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <EnvelopeIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {customer.email ? (
                    <a
                      href={`mailto:${customer.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {customer.email}
                    </a>
                  ) : (
                    <span className="text-gray-500">No email</span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {customer.phone ? (
                    <a
                      href={`tel:${customer.phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {formatPhone(customer.phone)}
                    </a>
                  ) : (
                    <span className="text-gray-500">No phone</span>
                  )}
                </div>
              </div>
            </div>

            {/* Type & Status */}
            <div className="mt-3 sm:mt-4 lg:mt-5 space-y-2 sm:space-y-3">
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 mr-2">Type:</span>
                <span className="font-medium">
                  {CUSTOMER_TYPE_MAP[customer.type] || "Unknown"}
                </span>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 mr-2">Status:</span>
                {formatStatus(customer)}
              </div>
            </div>
          </div>
        ),
      },
      // Secondary column - Tags
      {
        column: "secondary",
        component: (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Tags */}
            <div>
              <TagsDisplay
                values={extractIds(customer.tags)}
                label="Tags"
                onUnauthorized={onUnauthorized}
              />
            </div>
          </div>
        ),
      },
    ];
  }, [customer, formatAddress, getGoogleMapsUrl, formatPhone, formatStatus, extractIds, onUnauthorized]);

  return (
    <DetailLiteView
      entityData={customer}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      fieldSections={fieldSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
}

export default AdminCustomerDetailLitePage;
