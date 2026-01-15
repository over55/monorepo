// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/LitePage.jsx
// UIX Upgraded - Uses DetailLiteView whole page component
// @uix-page: AdminStaffDetailLitePage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  CalendarIcon,
  IdentificationIcon,
  NoSymbolIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import {
  DetailLiteView,
  UIXThemeProvider,
  StatusBadge,
  TypeBadge,
  IconText,
  ContactLink,
  useUIXTheme,
} from "../../../../components/UIX";

// Constants
const STAFF_TYPE_FRONTLINE = 3;

const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

const PHONE_TYPE_MAP = {
  1: "Landline",
  2: "Mobile",
  3: "Work",
};

function AdminStaffDetailLitePageContent() {
  const { aid } = useParams();
  const staffManager = useStaffManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State management
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized theme classes for field sections
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-300",
    textMuted: getThemeClasses("text-muted") || "text-gray-400 dark:text-gray-500",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
    borderLight: getThemeClasses("border-light") || "border-gray-100 dark:border-gray-700",
  }), [getThemeClasses]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch staff data
  const fetchStaff = useCallback(() => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    staffManager.getStaffDetailWithCallbacks(
      aid,
      (response) => {
        console.log("Staff detail fetched successfully:", response);
        setStaff(response);
      },
      (errorResponse) => {
        console.error("Error fetching staff detail:", errorResponse);
        setError(
          errorResponse.message ||
            "Failed to load staff details. Please try again.",
        );
      },
      () => {
        setLoading(false);
      },
      onUnauthorized,
    );
  }, [aid, staffManager, onUnauthorized]);

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStaff();
  }, [fetchStaff]);

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
  const formatAddress = useCallback((staffData) => {
    if (!staffData) return "-";
    const parts = [];
    if (staffData.addressLine1) parts.push(staffData.addressLine1);
    if (staffData.addressLine2) parts.push(staffData.addressLine2);
    if (staffData.city) parts.push(staffData.city);
    if (staffData.region) parts.push(staffData.region);
    if (staffData.postalCode) parts.push(staffData.postalCode);
    if (staffData.country) parts.push(staffData.country);
    return parts.length > 0 ? parts.join(", ") : "-";
  }, []);

  // Get Google Maps URL
  const getGoogleMapsUrl = useCallback((staffData) => {
    if (!staffData) return null;
    const address = formatAddress(staffData);
    if (address === "-") return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }, [formatAddress]);

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
      label: "Staff",
      to: "/admin/staff",
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
    loadingText: "Loading staff details...",
    notFoundTitle: "Staff Member Not Found",
    notFoundMessage: "The staff member you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Staff",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/staff"),
    },
  }), [navigate]);

  // Memoize tabs
  const tabs = useMemo(() => {
    if (!staff) return [];
    return [
      { label: "Summary", to: `/admin/staff/${staff.id}`, isActive: true },
      { label: "Detail", to: `/admin/staff/${staff.id}/detail` },
      { label: "Comments", to: `/admin/staff/${staff.id}/comments` },
      { label: "Attachments", to: `/admin/staff/${staff.id}/attachments` },
      { label: "More", to: `/admin/staff/${staff.id}/more`, icon: EllipsisHorizontalIcon },
    ];
  }, [staff]);

  // Memoize action buttons
  const actionButtons = useMemo(() => {
    if (!staff) return [];
    return [
      {
        variant: "outline",
        label: "Back",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/staff"),
      },
      {
        variant: "secondary",
        label: "Edit",
        icon: PencilSquareIcon,
        disabled: staff.status === 2,
        onClick: () => navigate(`/admin/staff/${aid}/edit`),
      },
    ];
  }, [staff, navigate, aid]);

  // Memoize alerts configuration
  const alerts = useMemo(() => ({
    archived: {
      message: "This staff member is archived",
      icon: ArchiveBoxIcon,
    },
    banned: {
      message: "This staff member is banned",
      icon: NoSymbolIcon,
    },
  }), []);

  // Format status display using StatusBadge component
  const formatStatus = useCallback((staffData) => {
    return (
      <StatusBadge
        status={staffData.status}
        isBanned={staffData.isBanned}
      />
    );
  }, []);

  // Memoize field sections
  const fieldSections = useMemo(() => {
    if (!staff) return [];

    return [
      // Avatar section
      {
        type: "avatar",
        component: (
          <img
            src={
              staff.avatarObjectUrl && staff.avatarObjectUrl !== ""
                ? staff.avatarObjectUrl
                : "/img/placeholder.png"
            }
            alt={
              staff.avatarObjectUrl
                ? "Profile Picture"
                : "No Profile Picture"
            }
            className={`w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-2xl object-cover border-2 ${themeClasses.borderLight} shadow-sm mx-auto xl:mx-0`}
          />
        ),
      },
      // Primary column - Basic Info
      {
        column: "primary",
        component: (
          <div>
            {/* Name/Organization */}
            <div className="mb-3 sm:mb-4 lg:mb-5">
              {staff.type === STAFF_TYPE_FRONTLINE &&
                staff.organizationName && (
                  <h2 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start mb-2`}>
                    <span className="break-words">
                      {staff.organizationName}
                    </span>
                  </h2>
                )}
              <h3 className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start`}>
                <span className="break-words">
                  {staff.name ||
                    `${staff.firstName} ${staff.lastName}`}
                </span>
              </h3>
              <div className="mt-2 text-sm lg:text-base">
                <TypeBadge label={STAFF_TYPE_MAP[staff.type] || "Unknown"} variant="info" />
              </div>
            </div>

            {/* Address */}
            <div className={`flex items-start text-sm sm:text-base lg:text-lg ${themeClasses.textSecondary} mb-3 sm:mb-4 lg:mb-5 justify-center xl:justify-start`}>
              <MapPinIcon className={`w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 mt-0.5 flex-shrink-0 ${themeClasses.textMuted}`} />
              <div className="min-w-0 flex-1">
                <span className="break-words">
                  {formatAddress(staff)}
                </span>
                {getGoogleMapsUrl(staff) && (
                  <a
                    href={getGoogleMapsUrl(staff)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`ml-2 inline-flex items-center ${themeClasses.linkPrimary}`}
                  >
                    <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Email & Phone */}
            <div className="space-y-2 sm:space-y-3">
              <ContactLink
                type="email"
                value={staff.email}
                fallbackText="No email"
              />
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <PhoneIcon className={`w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 ${themeClasses.textMuted} flex-shrink-0`} />
                <div className="min-w-0 flex-1">
                  {staff.phone ? (
                    <>
                      <a
                        href={`tel:${staff.phone}`}
                        className={`${themeClasses.linkPrimary} font-medium`}
                      >
                        {formatPhone(staff.phone)}
                      </a>
                      {staff.phoneType && (
                        <span className={`ml-2 text-xs sm:text-sm ${themeClasses.textMuted}`}>
                          ({PHONE_TYPE_MAP[staff.phoneType] || "Unknown"})
                        </span>
                      )}
                    </>
                  ) : (
                    <span className={themeClasses.textMuted}>No phone</span>
                  )}
                </div>
              </div>
              {staff.otherPhone && (
                <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                  <PhoneIcon className={`w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 ${themeClasses.textMuted} flex-shrink-0`} />
                  <div className="min-w-0 flex-1">
                    <a
                      href={`tel:${staff.otherPhone}`}
                      className={`${themeClasses.linkPrimary} font-medium`}
                    >
                      {formatPhone(staff.otherPhone)}
                    </a>
                    {staff.otherPhoneType && (
                      <span className={`ml-2 text-xs sm:text-sm ${themeClasses.textMuted}`}>
                        ({PHONE_TYPE_MAP[staff.otherPhoneType] || "Unknown"})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Type & Status */}
            <div className="mt-3 sm:mt-4 lg:mt-5 space-y-2 sm:space-y-3">
              <IconText
                icon={ClipboardDocumentListIcon}
                label="Type"
                value={STAFF_TYPE_MAP[staff.type] || "Unknown"}
              />
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <CheckCircleIcon className={`w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 ${themeClasses.textMuted} flex-shrink-0`} />
                <span className={`${themeClasses.textSecondary} mr-2`}>Status:</span>
                {formatStatus(staff)}
              </div>
            </div>
          </div>
        ),
      },
      // Secondary column - Additional Info
      {
        column: "secondary",
        component: (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Tags */}
            <div>
              <TagsDisplay
                values={extractIds(staff.tags)}
                label="Tags"
                onUnauthorized={onUnauthorized}
              />
            </div>

            {/* How Did You Hear About Us */}
            {(staff.howDidYouHearAboutUsId ||
              staff.howDidYouHearAboutUsID) && (
              <div>
                {staff.isHowDidYouHearAboutUsOther ? (
                  <div className="text-sm sm:text-base lg:text-lg">
                    <span className={`font-medium ${themeClasses.textSecondary}`}>
                      How did they discover us:
                    </span>
                    <p className={`mt-1 ${themeClasses.textSecondary}`}>
                      {staff.howDidYouHearAboutUsOther}
                    </p>
                  </div>
                ) : (
                  <HowHearAboutUsDisplay
                    value={
                      staff.howDidYouHearAboutUsId ||
                      staff.howDidYouHearAboutUsID
                    }
                    label="How did they discover us?"
                    onUnauthorized={onUnauthorized}
                  />
                )}
              </div>
            )}

            {/* Metadata */}
            <div className={`space-y-2 text-xs sm:text-sm lg:text-base ${themeClasses.textSecondary}`}>
              {staff.publicId && (
                <IconText
                  icon={IdentificationIcon}
                  label="Public ID"
                  value={staff.publicId}
                  size="sm"
                />
              )}
              {staff.createdAt && (
                <IconText
                  icon={CalendarIcon}
                  label="Created"
                  value={formatDateForDisplay(staff.createdAt)}
                  size="sm"
                />
              )}
              {staff.modifiedAt && (
                <IconText
                  icon={CalendarIcon}
                  label="Last Modified"
                  value={formatDateForDisplay(staff.modifiedAt)}
                  size="sm"
                />
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [staff, formatAddress, getGoogleMapsUrl, formatPhone, formatStatus, extractIds, onUnauthorized, themeClasses]);

  return (
    <DetailLiteView
      entityData={staff}
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

// Wrapper component with UIXThemeProvider
function AdminStaffDetailLitePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailLitePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailLitePage;
