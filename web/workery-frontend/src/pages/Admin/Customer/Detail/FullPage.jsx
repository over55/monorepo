// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/FullPage.jsx
// UIX Upgraded - Uses DetailFullView whole page component
// @uix-page: AdminCustomerDetailFullPage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  NoSymbolIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../services/Helpers/DateFormatter";
import { DetailFullView } from "../../../../components/UIX";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const CUSTOMER_PHONE_TYPE_WORK = 2;
const CUSTOMER_STATUS_ARCHIVED = 2;

// Option mappings for display
const CUSTOMER_TYPE_OPTIONS = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

const CUSTOMER_ORGANIZATION_TYPE_OPTIONS = {
  1: "Private",
  2: "Non-profit",
  3: "Government",
};

const GENDER_OPTIONS = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const PHONE_TYPE_OPTIONS = {
  1: "Mobile",
  2: "Work",
  3: "Home",
};

// Detail Section Component
const DetailSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {children}
      </dl>
    </div>
  </div>
);

// Detail Field Component
const DetailField = ({ label, value, fullWidth = false }) => (
  <div className={fullWidth ? "lg:col-span-2" : ""}>
    <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
      {label}
    </dt>
    <dd className="text-base sm:text-lg font-medium text-gray-900 break-words">
      {value || "-"}
    </dd>
  </div>
);

function AdminCustomerDetailFullPage() {
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

  // Helper functions
  const formatPhone = useCallback((phone, extension = null) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      const formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      return extension ? `${formatted} ext. ${extension}` : formatted;
    }
    return phone;
  }, []);

  const formatAddress = useCallback((customerData) => {
    if (!customerData) return "-";
    const address =
      customerData.fullAddressWithPostalCode ||
      `${customerData.addressLine1 || ""} ${customerData.city || ""} ${customerData.region || ""} ${customerData.postalCode || ""}`.trim();
    return address || "-";
  }, []);

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
    title: "Full Details",
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
      { label: "Summary", to: `/admin/customer/${customer.id}` },
      { label: "Detail", to: `/admin/customer/${customer.id}/detail`, isActive: true },
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

  // Memoize content sections
  const contentSections = useMemo(() => {
    if (!customer) return [];

    return [
      // Personal Information Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Personal Information" icon={UserIcon}>
            <DetailField label="First Name" value={customer.firstName} />
            <DetailField label="Last Name" value={customer.lastName} />
            <div>
              <TagsDisplay
                values={extractIds(customer.tags)}
                onUnauthorized={onUnauthorized}
              />
            </div>
            <DetailField
              label="Type"
              value={CUSTOMER_TYPE_OPTIONS[customer.type] || "Unknown"}
            />
            <DetailField
              label="Description"
              value={customer.description}
              fullWidth
            />
            <DetailField
              label="Gender"
              value={
                customer.gender ? (
                  <>
                    {GENDER_OPTIONS[customer.gender] || "Unknown"}
                    {customer.gender === 1 &&
                      customer.genderOther &&
                      ` - ${customer.genderOther}`}
                  </>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="Date of Birth"
              value={formatDateForDisplay(customer.birthDate)}
            />
          </DetailSection>
        ),
      },
      // Company Information (Conditional - for Commercial customers)
      {
        type: "conditional",
        condition: customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID,
        component: (
          <DetailSection title="Company Information" icon={BuildingOfficeIcon}>
            <DetailField
              label="Company Name"
              value={customer.organizationName}
            />
            <DetailField
              label="Company Type"
              value={CUSTOMER_ORGANIZATION_TYPE_OPTIONS[customer.organizationType]}
            />
          </DetailSection>
        ),
      },
      // Contact Point Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Contact Point" icon={PhoneIcon}>
            <DetailField
              label="Email"
              value={
                customer.email ? (
                  <a
                    href={`mailto:${customer.email}`}
                    className="text-blue-600 hover:text-blue-700 break-all"
                  >
                    {customer.email}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <DetailField
              label="I agree to receive electronic email"
              value={
                customer.isOkToEmail ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    No
                  </span>
                )
              }
            />
            <DetailField
              label="Phone"
              value={formatPhone(
                customer.phone,
                customer.phoneType === CUSTOMER_PHONE_TYPE_WORK
                  ? customer.phoneExtension
                  : null,
              )}
            />
            <DetailField
              label="Phone Type"
              value={PHONE_TYPE_OPTIONS[customer.phoneType]}
            />
            {customer.otherPhone && (
              <>
                <DetailField
                  label="Other Phone (Optional)"
                  value={formatPhone(
                    customer.otherPhone,
                    customer.otherPhoneType === CUSTOMER_PHONE_TYPE_WORK
                      ? customer.otherPhoneExtension
                      : null,
                  )}
                />
                <DetailField
                  label="Other Phone Type (Optional)"
                  value={PHONE_TYPE_OPTIONS[customer.otherPhoneType]}
                />
              </>
            )}
            <DetailField
              label="I agree to receive texts to my phone"
              value={
                customer.isOkToText ? (
                  <span className="inline-flex items-center text-green-700">
                    <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-red-700">
                    <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    No
                  </span>
                )
              }
            />
          </DetailSection>
        ),
      },
      // Address Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Address" icon={MapPinIcon}>
            <DetailField
              label="Location"
              value={
                customer.fullAddressUrl ? (
                  <a
                    href={customer.fullAddressUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:text-blue-700 break-words"
                  >
                    {formatAddress(customer)}
                  </a>
                ) : (
                  formatAddress(customer)
                )
              }
              fullWidth
            />
          </DetailSection>
        ),
      },
      // Internal Metrics Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Internal Metrics" icon={ChartPieIcon}>
            <div>
              <dt className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                How did they discover us?
              </dt>
              <dd className="text-base sm:text-lg font-medium text-gray-900">
                {customer.isHowDidYouHearAboutUsOther ? (
                  <div>
                    <HowHearAboutUsDisplay
                      value={customer.howDidYouHearAboutUsID}
                      onUnauthorized={onUnauthorized}
                    />
                    {customer.howDidYouHearAboutUsOther && (
                      <div className="mt-1 text-base sm:text-lg italic text-gray-600">
                        Other: {customer.howDidYouHearAboutUsOther}
                      </div>
                    )}
                  </div>
                ) : (
                  <HowHearAboutUsDisplay
                    value={customer.howDidYouHearAboutUsID}
                    onUnauthorized={onUnauthorized}
                  />
                )}
              </dd>
            </div>
            <DetailField
              label="Join date"
              value={formatDateTime(customer.joinDate)}
            />
            <DetailField
              label="Preferred Language"
              value={customer.preferredLanguage || "English"}
            />
          </DetailSection>
        ),
      },
      // System Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="System" icon={ComputerDesktopIcon}>
            <DetailField
              label="ID"
              value={
                <span className="font-mono text-xs sm:text-sm bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded break-all">
                  {customer.publicId || customer.id || "-"}
                </span>
              }
            />
            <DetailField
              label="Created at"
              value={formatDateTime(customer.createdAt)}
            />
            <DetailField
              label="Created by"
              value={customer.createdByUserName}
            />
            <DetailField
              label="Created from"
              value={
                customer.createdFromIpAddress && (
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {customer.createdFromIpAddress}
                  </span>
                )
              }
            />
            <DetailField
              label="Modified at"
              value={formatDateTime(customer.modifiedAt)}
            />
            <DetailField
              label="Modified by"
              value={customer.modifiedByUserName}
            />
            <DetailField
              label="Modified from"
              value={
                customer.modifiedFromIpAddress && (
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {customer.modifiedFromIpAddress}
                  </span>
                )
              }
            />
          </DetailSection>
        ),
      },
    ];
  }, [customer, formatAddress, formatPhone, extractIds, onUnauthorized]);

  return (
    <DetailFullView
      entityData={customer}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      contentSections={contentSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
}

export default AdminCustomerDetailFullPage;
