// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/FullPage.jsx
// UIX Upgraded - Uses DetailFullView whole page component
// @uix-page: AdminStaffDetailFullPage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
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
  UserIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  UserCircleIcon,
  GlobeAltIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../services/Helpers/DateFormatter";
import { DetailFullView, InfoCard, Badge, UIXThemeProvider, useUIXTheme } from "../../../../components/UIX";

// Constants
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

const GENDER_MAP = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const IDENTIFY_AS_OPTIONS = {
  1: "Indigenous",
  2: "Newcomer",
  3: "Visible minority",
  4: "Women",
  5: "Prefer not to say",
};

const ORGANIZATION_TYPE_MAP = {
  1: "Corporation",
  2: "Partnership",
  3: "Sole Proprietorship",
  4: "Other",
};

// Detail Section Component - themed version
const DetailSection = ({ title, icon: Icon, children, themeClasses }) => (
  <div className={`${themeClasses.sectionHeaderBg} rounded-lg shadow-sm mb-4 sm:mb-6`}>
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className={`text-base sm:text-lg font-semibold ${themeClasses.sectionHeaderText} flex items-center`}>
        <Icon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${themeClasses.sectionHeaderIcon} flex-shrink-0`} />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className={`${themeClasses.bgCard} border-2 border-t-0 ${themeClasses.sectionBorder} rounded-b-lg p-4 sm:p-6`}>
      <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {children}
      </dl>
    </div>
  </div>
);

// Detail Field Component - themed version
const DetailField = ({ label, value, fullWidth = false, themeClasses }) => (
  <div className={fullWidth ? "lg:col-span-2" : ""}>
    <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>
      {label}
    </dt>
    <dd className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary} break-words`}>
      {value || "-"}
    </dd>
  </div>
);

function AdminStaffDetailFullPageContent() {
  const { aid } = useParams();
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
    sectionHeaderBg: getThemeClasses("section-header-bg"),
    sectionHeaderText: getThemeClasses("section-header-text"),
    sectionHeaderIcon: getThemeClasses("section-header-icon"),
    sectionBorder: getThemeClasses("section-border"),
    iconSuccess: getThemeClasses("icon-success"),
    iconDanger: getThemeClasses("icon-danger"),
  }), [getThemeClasses]);

  // State management
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const formatMultiSelect = useCallback((selectedValues, options) => {
    if (!selectedValues || selectedValues.length === 0) return "-";
    return selectedValues
      .map((value) => options[value] || `Unknown (${value})`)
      .join(", ");
  }, []);

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

  const getGoogleMapsUrl = useCallback((staffData) => {
    if (!staffData) return null;
    const address = formatAddress(staffData);
    if (address === "-") return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }, [formatAddress]);

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
      icon: UserCircleIcon,
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
      { label: "Summary", to: `/admin/staff/${staff.id}` },
      { label: "Detail", to: `/admin/staff/${staff.id}/detail`, isActive: true },
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

  // Memoize content sections
  const contentSections = useMemo(() => {
    if (!staff) return [];

    return [
      // Personal Information Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Personal Information" icon={UserIcon} themeClasses={themeClasses}>
            <DetailField
              label="Type"
              value={STAFF_TYPE_MAP[staff.type] || "-"}
              themeClasses={themeClasses}
            />
            <DetailField label="First Name" value={staff.firstName} themeClasses={themeClasses} />
            <DetailField label="Last Name" value={staff.lastName} themeClasses={themeClasses} />
            <DetailField
              label="Date of Birth"
              value={formatDateForDisplay(staff.birthDate)}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Gender"
              value={
                staff.gender ? (
                  <>
                    {GENDER_MAP[staff.gender] || "Unknown"}
                    {staff.gender === 1 &&
                      staff.genderOther &&
                      ` - ${staff.genderOther}`}
                  </>
                ) : (
                  "-"
                )
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Description"
              value={staff.description}
              fullWidth
              themeClasses={themeClasses}
            />
            <div>
              <TagsDisplay
                values={extractIds(staff.tags)}
                onUnauthorized={onUnauthorized}
              />
            </div>
            {staff.skillSets && staff.skillSets.length > 0 && (
              <div>
                <SkillSetsDisplay
                  values={extractIds(staff.skillSets)}
                  onUnauthorized={onUnauthorized}
                />
              </div>
            )}
          </DetailSection>
        ),
      },
      // Company Information (Conditional - for Frontline staff)
      {
        type: "conditional",
        condition: staff.type === 3,
        component: (
          <DetailSection title="Company Information" icon={BuildingOfficeIcon} themeClasses={themeClasses}>
            <DetailField
              label="Company Name"
              value={staff.organizationName}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Company Type"
              value={ORGANIZATION_TYPE_MAP[staff.organizationType]}
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
      // Contact Point Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Contact Point" icon={PhoneIcon} themeClasses={themeClasses}>
            <DetailField
              label="Email"
              value={
                staff.email ? (
                  <a
                    href={`mailto:${staff.email}`}
                    className={`${themeClasses.linkPrimary} break-all`}
                  >
                    {staff.email}
                  </a>
                ) : (
                  "-"
                )
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="I agree to receive electronic email"
              value={
                staff.isOkToEmail ? (
                  <span className={`inline-flex items-center ${themeClasses.iconSuccess}`}>
                    <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className={`inline-flex items-center ${themeClasses.iconDanger}`}>
                    <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    No
                  </span>
                )
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Phone"
              value={
                staff.phone ? (
                  <a
                    href={`tel:${staff.phone}`}
                    className={themeClasses.linkPrimary}
                  >
                    {formatPhone(staff.phone)}
                  </a>
                ) : (
                  "-"
                )
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Phone Type"
              value={PHONE_TYPE_MAP[staff.phoneType]}
              themeClasses={themeClasses}
            />
            {staff.otherPhone && (
              <>
                <DetailField
                  label="Other Phone (Optional)"
                  value={
                    <a
                      href={`tel:${staff.otherPhone}`}
                      className={themeClasses.linkPrimary}
                    >
                      {formatPhone(staff.otherPhone)}
                    </a>
                  }
                  themeClasses={themeClasses}
                />
                <DetailField
                  label="Other Phone Type (Optional)"
                  value={PHONE_TYPE_MAP[staff.otherPhoneType]}
                  themeClasses={themeClasses}
                />
              </>
            )}
            <DetailField
              label="I agree to receive texts to my phone"
              value={
                staff.isOkToText ? (
                  <span className={`inline-flex items-center ${themeClasses.iconSuccess}`}>
                    <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className={`inline-flex items-center ${themeClasses.iconDanger}`}>
                    <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                    No
                  </span>
                )
              }
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
      // Address Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Address" icon={MapPinIcon} themeClasses={themeClasses}>
            <DetailField
              label="Location"
              value={
                formatAddress(staff) !== "-" ? (
                  <a
                    href={getGoogleMapsUrl(staff)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${themeClasses.linkPrimary} break-words`}
                  >
                    {formatAddress(staff)}
                  </a>
                ) : (
                  "-"
                )
              }
              fullWidth
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
      // Account Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Account" icon={GlobeAltIcon} themeClasses={themeClasses}>
            <DetailField
              label="Is active"
              value={
                <Badge variant={staff.status === 1 ? "success" : "secondary"}>
                  {staff.status === 1 ? "Active" : "Archived"}
                </Badge>
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Preferred Language"
              value={staff.preferredLanguage || "English"}
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
      // Emergency Contact Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Emergency Contact" icon={ExclamationTriangleIcon} themeClasses={themeClasses}>
            <DetailField label="Name" value={staff.emergencyContactName} themeClasses={themeClasses} />
            <DetailField
              label="Relationship"
              value={staff.emergencyContactRelationship}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Telephone"
              value={
                staff.emergencyContactTelephone ? (
                  <a
                    href={`tel:${staff.emergencyContactTelephone}`}
                    className={themeClasses.linkPrimary}
                  >
                    {formatPhone(staff.emergencyContactTelephone)}
                  </a>
                ) : (
                  "-"
                )
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Alternate Telephone"
              value={
                staff.emergencyContactAlternativeTelephone ? (
                  <a
                    href={`tel:${staff.emergencyContactAlternativeTelephone}`}
                    className={themeClasses.linkPrimary}
                  >
                    {formatPhone(staff.emergencyContactAlternativeTelephone)}
                  </a>
                ) : (
                  "-"
                )
              }
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
      // Internal Metrics Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="Internal Metrics" icon={ChartPieIcon} themeClasses={themeClasses}>
            <div>
              <dt className={`text-xs sm:text-sm font-semibold ${themeClasses.textSecondary} mb-1`}>
                How did they discover us?
              </dt>
              <dd className={`text-base sm:text-lg font-medium ${themeClasses.textPrimary}`}>
                {staff.isHowDidYouHearAboutUsOther ? (
                  <div>
                    <HowHearAboutUsDisplay
                      value={
                        staff.howDidYouHearAboutUsId ||
                        staff.howDidYouHearAboutUsID
                      }
                      onUnauthorized={onUnauthorized}
                    />
                    {staff.howDidYouHearAboutUsOther && (
                      <div className={`mt-1 text-base sm:text-lg italic ${themeClasses.textMuted}`}>
                        Other: {staff.howDidYouHearAboutUsOther}
                      </div>
                    )}
                  </div>
                ) : (
                  <HowHearAboutUsDisplay
                    value={
                      staff.howDidYouHearAboutUsId ||
                      staff.howDidYouHearAboutUsID
                    }
                    onUnauthorized={onUnauthorized}
                  />
                )}
              </dd>
            </div>
            <DetailField
              label="Join date"
              value={formatDateTime(staff.joinDate)}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Do you identify as belonging to any of the following groups?"
              value={formatMultiSelect(
                staff.identifyAs,
                IDENTIFY_AS_OPTIONS,
              )}
              fullWidth
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
      // System Section
      {
        type: "detailSection",
        component: (
          <DetailSection title="System" icon={ComputerDesktopIcon} themeClasses={themeClasses}>
            <DetailField
              label="ID"
              value={
                <span className={`font-mono text-xs sm:text-sm ${themeClasses.bgMuted} px-1 sm:px-2 py-0.5 sm:py-1 rounded break-all`}>
                  {staff.publicId || staff.id || "-"}
                </span>
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Created at"
              value={formatDateTime(staff.createdAt)}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Created by"
              value={staff.createdByUserName}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Created from"
              value={
                staff.createdFromIpAddress && (
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {staff.createdFromIpAddress}
                  </span>
                )
              }
              themeClasses={themeClasses}
            />
            <DetailField
              label="Modified at"
              value={formatDateTime(staff.modifiedAt)}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Modified by"
              value={staff.modifiedByUserName}
              themeClasses={themeClasses}
            />
            <DetailField
              label="Modified from"
              value={
                staff.modifiedFromIpAddress && (
                  <span className="font-mono text-xs sm:text-sm break-all">
                    {staff.modifiedFromIpAddress}
                  </span>
                )
              }
              themeClasses={themeClasses}
            />
          </DetailSection>
        ),
      },
    ];
  }, [staff, themeClasses, formatAddress, getGoogleMapsUrl, formatPhone, formatMultiSelect, extractIds, onUnauthorized]);

  return (
    <DetailFullView
      entityData={staff}
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

// Wrapper with UIXThemeProvider
function AdminStaffDetailFullPage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailFullPageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailFullPage;
