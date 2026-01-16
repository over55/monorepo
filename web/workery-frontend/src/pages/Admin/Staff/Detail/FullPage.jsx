// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/FullPage.jsx
// @uix-page: DetailFullView

import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  UserCircleIcon,
  GlobeAltIcon,
  NoSymbolIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  HeartIcon,
  ServerIcon,
  CogIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
import {
  DetailSection,
  DetailField,
} from "../../../../components/business/views";
import {
  UIXThemeProvider,
  DetailFullView,
  EditButton,
  Avatar,
  Badge,
  ContactLink,
  AddressDisplay,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  formatDateForDisplay,
  formatDateTime,
} from "../../../../services/Helpers/DateFormatter";
import {
  STAFF_TYPE_MAP,
  STAFF_GENDER_MAP,
  STAFF_IDENTIFY_AS_OPTIONS,
  STAFF_ORGANIZATION_TYPE_MAP,
  STAFF_TYPE_FRONTLINE,
} from "../../../../constants/Staff";

// Utility functions moved outside component for performance
const _formatPhone = (phoneNumber) => {
  if (!phoneNumber) return "-";
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phoneNumber;
};

const _formatMultiSelect = (values, options) => {
  if (!values || values.length === 0) return "-";
  return values.map((value) => options[value] || value).join(", ");
};

// Extract IDs from array of objects
const extractIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.id || item.value).filter(Boolean);
};

const AdminStaffDetailFullPageContent = memo(function AdminStaffDetailFullPageContent() {
  const { aid } = useParams();
  const staffManager = useStaffManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State management
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch staff data with proper cleanup
  const fetchStaff = useCallback(() => {
    if (!aid) {
      if (import.meta.env.DEV) {
        console.log("No aid provided, returning");
      }
      return;
    }

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const currentAbortController = abortControllerRef.current;

    if (import.meta.env.DEV) {
      console.log("Starting fetch for aid:", aid);
    }
    setLoading(true);
    setError(null);

    staffManager.getStaffDetailWithCallbacks(
      aid,
      (response) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Staff detail fetched successfully:", response);
        }
        setStaff(response);
        setLoading(false);
      },
      (errorResponse) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.error("Error fetching staff detail:", errorResponse);
        }
        setError(
          errorResponse?.message ||
            "Failed to load staff details. Please try again.",
        );
        setLoading(false);
      },
      () => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Staff detail fetch done");
        }
        setLoading(false);
      },
      onUnauthorized,
    );
  }, [aid, staffManager, onUnauthorized]);

  // Initial data load with cleanup
  useEffect(() => {
    isMounted.current = true;
    window.scrollTo(0, 0);

    fetchStaff();

    // Cleanup function - only cancel requests, don't set state
    return () => {
      isMounted.current = false;

      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      // Note: Don't set state here - component is unmounting
      // The isMounted check in callbacks prevents state updates
    };
  }, [fetchStaff]);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    primaryText: getThemeClasses("primary-text"),
    accentText: getThemeClasses("accent-text"),
    successText: getThemeClasses("success-text"),
    errorText: getThemeClasses("error-text"),
  }), [getThemeClasses]);

  // Configure DetailFullView props
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

  const headerConfig = useMemo(() => ({
    title: "Staff Member - Full Details",
    icon: UserCircleIcon,
    loadingText: "Loading staff details...",
    notFoundTitle: "Staff Member Not Found",
    notFoundMessage:
      "The staff member you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Staff",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/staff"),
    },
  }), [navigate]);

  const actionButtons = useMemo(() => [
    {
      variant: "outline",
      onClick: () => navigate("/admin/staff"),
      icon: ChevronLeftIcon,
      label: "Back",
    },
    {
      component: (
        <EditButton
          onClick={() => navigate(`/admin/staff/${aid}/edit`)}
          disabled={staff?.status === 2}
          variant="primary"
          className="flex-1 sm:flex-initial"
        />
      ),
    },
  ], [navigate, aid, staff?.status]);

  const tabs = useMemo(() => [
    {
      label: "Summary",
      to: `/admin/staff/${aid}`,
      isActive: false,
    },
    {
      label: "Detail",
      to: `/admin/staff/${aid}/detail`,
      isActive: true,
    },
    {
      label: "Comments",
      to: `/admin/staff/${aid}/comments`,
      isActive: false,
    },
    {
      label: "Attachments",
      to: `/admin/staff/${aid}/attachments`,
      isActive: false,
    },
    {
      label: "More",
      to: `/admin/staff/${aid}/more`,
      icon: EllipsisHorizontalIcon,
      isActive: false,
    },
  ], [aid]);

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

  // Main InfoCard configuration - Memoized for performance
  const mainInfoCard = useMemo(() => staff
    ? {
        title: "Staff Member Details",
        icon: UserIcon,
        avatar: (
          <Avatar
            src={staff.avatarObjectUrl}
            alt={
              staff.avatarObjectUrl ? "Profile Picture" : "No Profile Picture"
            }
            size="lg"
            borderStyle="default"
            showFallbackIcon={true}
          />
        ),
        primarySections: [
          // Staff Name and Type
          {
            className: "mb-4 sm:mb-6",
            component: (
              <div>
                {staff.type === STAFF_TYPE_FRONTLINE && staff.organizationName && (
                  <h2
                    className={`text-2xl sm:text-3xl md:text-4xl font-bold ${themeClasses.primaryText} flex items-center justify-center xl:justify-start mb-3`}
                  >
                    <BuildingOfficeIcon
                      className={`w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 mr-2 ${themeClasses.accentText} flex-shrink-0`}
                    />
                    <span className="break-words">
                      {staff.organizationName}
                    </span>
                  </h2>
                )}
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                  <UserCircleIcon className="w-5 sm:w-6 md:w-7 h-5 sm:h-6 md:h-7 mr-2 text-gray-600 flex-shrink-0" />
                  <span className="break-words">
                    {staff.firstName} {staff.lastName}
                  </span>
                </h3>
                <div className="mt-2 text-base lg:text-lg text-gray-600">
                  <Badge variant="primary" size="md">
                    {STAFF_TYPE_MAP[staff.type] || "Unknown"}
                  </Badge>
                </div>
              </div>
            ),
          },
          // Address
          {
            className: "mb-4 sm:mb-6",
            component: (
              <AddressDisplay
                addressData={staff}
                size="md"
                showIcon={true}
                showMapsLink={true}
              />
            ),
          },
          // Contact Information
          {
            className: "space-y-3",
            component: (
              <div className="space-y-3">
                <ContactLink
                  type="email"
                  value={staff.email}
                  size="md"
                  fallbackText="No email"
                />
                <ContactLink
                  type="phone"
                  value={staff.phone}
                  size="md"
                  fallbackText="No phone"
                />
                {staff.otherPhone && (
                  <ContactLink
                    type="phone"
                    value={staff.otherPhone}
                    size="md"
                    fallbackText="No other phone"
                  />
                )}
                <div className="flex items-center justify-center xl:justify-start text-base lg:text-lg text-gray-700">
                  <span className="font-semibold">Email Consent:</span>
                  <span className="ml-2">
                    {staff.isOkToEmail ? (
                      <span
                        className={`inline-flex items-center ${themeClasses.successText} font-medium`}
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center ${themeClasses.errorText} font-medium`}
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        No
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ),
          },
        ],
        secondarySections: [
          // Personal Details
          {
            component: (
              <div className="space-y-4">
                <h4 className="text-xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-3">
                  <IdentificationIcon
                    className={`w-5 h-5 mr-2 ${themeClasses.accentText}`}
                  />
                  Personal Information
                </h4>
                <div className="space-y-2 text-base text-gray-600">
                  {staff.birthDate && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <span className="font-medium w-20">Birth Date:</span>
                      <span className="ml-2">
                        {formatDateForDisplay(staff.birthDate)}
                      </span>
                    </div>
                  )}
                  {staff.gender && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <span className="font-medium w-20">Gender:</span>
                      <span className="ml-2">
                        {STAFF_GENDER_MAP[staff.gender] || "Unknown"}
                        {staff.gender === 1 &&
                          staff.genderOther &&
                          ` - ${staff.genderOther}`}
                      </span>
                    </div>
                  )}
                  {staff.description && (
                    <div className="flex flex-col xl:flex-row xl:items-start justify-center xl:justify-start">
                      <span className="font-medium w-20 xl:flex-shrink-0">
                        Description:
                      </span>
                      <span className="xl:ml-2 break-words">
                        {staff.description}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ),
          },
          // Tags and Skills
          {
            component: (
              <div className="space-y-4">
                <TagsDisplay
                  values={extractIds(staff.tags)}
                  label="Tags"
                  onUnauthorized={onUnauthorized}
                />
                {staff.skillSets && staff.skillSets.length > 0 && (
                  <SkillSetsDisplay
                    values={extractIds(staff.skillSets)}
                    label="Skills"
                    onUnauthorized={onUnauthorized}
                  />
                )}
              </div>
            ),
          },
        ],
      }
    : null, [staff, themeClasses, onUnauthorized]);

  // Additional content sections - Memoized for performance
  const contentSections = useMemo(() => staff
    ? [
        // Company Information (conditional)
        {
          type: "conditional",
          condition:
            staff.type === STAFF_TYPE_FRONTLINE &&
            (staff.organizationName || staff.organizationType),
          component: (
            <DetailSection
              title="Company Information"
              icon={BuildingOfficeIcon}
            >
              {staff.organizationName && (
                <DetailField
                  label="Company Name"
                  value={staff.organizationName}
                />
              )}
              {staff.organizationType && (
                <DetailField
                  label="Company Type"
                  value={
                    STAFF_ORGANIZATION_TYPE_MAP[staff.organizationType] ||
                    "Unknown"
                  }
                />
              )}
            </DetailSection>
          ),
        },
        // Emergency Contact Information
        {
          type: "infoCard",
          title: "Emergency Contact",
          icon: HeartIcon,
          showAvatar: false,
          twoColumn: false,
          condition:
            staff.emergencyContactName || staff.emergencyContactTelephone,
          primarySections: [
            {
              className: "space-y-4",
              component: (
                <div className="space-y-4 text-base lg:text-lg">
                  {staff.emergencyContactName && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Name:
                      </span>
                      <span className="ml-3 text-gray-900 font-semibold">
                        {staff.emergencyContactName}
                      </span>
                    </div>
                  )}
                  {staff.emergencyContactRelationship && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <HeartIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Relationship:
                      </span>
                      <span className="ml-3 text-gray-900">
                        {staff.emergencyContactRelationship}
                      </span>
                    </div>
                  )}
                  {staff.emergencyContactTelephone && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <PhoneIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Phone:
                      </span>
                      <span className="ml-3 text-gray-900">
                        <ContactLink
                          type="phone"
                          value={staff.emergencyContactTelephone}
                          size="md"
                          fallbackText="No phone"
                        />
                      </span>
                    </div>
                  )}
                  {staff.emergencyContactAlternativeTelephone && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <DevicePhoneMobileIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Alt. Phone:
                      </span>
                      <span className="ml-3 text-gray-900">
                        <ContactLink
                          type="phone"
                          value={staff.emergencyContactAlternativeTelephone}
                          size="md"
                          fallbackText="No phone"
                        />
                      </span>
                    </div>
                  )}
                </div>
              ),
            },
          ],
        },
        // Internal Metrics Section
        {
          type: "detailSection",
          component: (
            <DetailSection title="Internal Metrics" icon={ChartPieIcon}>
              <DetailField
                label="How did they discover us?"
                value={
                  staff.isHowDidYouHearAboutUsOther ? (
                    <div>
                      <HowHearAboutUsDisplay
                        value={
                          staff.howDidYouHearAboutUsId ||
                          staff.howDidYouHearAboutUsID
                        }
                        onUnauthorized={onUnauthorized}
                      />
                      {staff.howDidYouHearAboutUsOther && (
                        <div className="mt-1 text-base sm:text-lg italic text-gray-500">
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
                  )
                }
              />
              <DetailField
                label="Join date"
                value={formatDateTime(staff.joinDate)}
              />
              <DetailField
                label="Do you identify as belonging to any of the following groups?"
                value={_formatMultiSelect(
                  staff.identifyAs,
                  STAFF_IDENTIFY_AS_OPTIONS,
                )}
                fullWidth
              />
            </DetailSection>
          ),
        },
        // System Information InfoCard
        {
          type: "infoCard",
          title: "System Info",
          icon: ServerIcon,
          showAvatar: false,
          twoColumn: true,
          primarySections: [
            {
              className: "space-y-4 text-base lg:text-lg",
              component: (
                <div className="space-y-4">
                  <div className="flex items-center justify-center xl:justify-start">
                    <CogIcon className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="font-medium text-gray-700 w-28">
                      Status:
                    </span>
                    <div className="ml-3">
                      {staff.isBanned ? (
                        <Badge variant="error" size="sm">
                          <NoSymbolIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Banned
                        </Badge>
                      ) : staff.status === 1 ? (
                        <Badge variant="primary" size="sm">
                          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" size="sm">
                          <ArchiveBoxIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                          Archived
                        </Badge>
                      )}
                    </div>
                  </div>
                  {staff.createdAt && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Created At:
                      </span>
                      <span className="ml-3 text-gray-900">
                        {formatDateTime(staff.createdAt)}
                      </span>
                    </div>
                  )}
                  {staff.createdByUserName && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Created By:
                      </span>
                      <span className="ml-3 text-gray-900">
                        {staff.createdByUserName}
                      </span>
                    </div>
                  )}
                </div>
              ),
            },
          ],
          secondarySections: [
            {
              className: "space-y-4 text-base lg:text-lg",
              component: (
                <div className="space-y-4">
                  {staff.modifiedAt && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <CalendarDaysIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Modified At:
                      </span>
                      <span className="ml-3 text-gray-900">
                        {formatDateTime(staff.modifiedAt)}
                      </span>
                    </div>
                  )}
                  {staff.modifiedByUserName && (
                    <div className="flex items-center justify-center xl:justify-start">
                      <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
                      <span className="font-medium text-gray-700 w-28">
                        Modified By:
                      </span>
                      <span className="ml-3 text-gray-900">
                        {staff.modifiedByUserName}
                      </span>
                    </div>
                  )}
                </div>
              ),
            },
          ],
        },
      ].filter((section) => section.condition !== false)
    : [], [staff, onUnauthorized]);

  return (
    <DetailFullView
      entityData={staff}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      mainInfoCard={mainInfoCard}
      contentSections={contentSections}
      actionButtons={actionButtons}
      tabs={tabs}
      alerts={alerts}
      onUnauthorized={onUnauthorized}
      isLoading={loading}
      error={error}
      onErrorClose={() => setError(null)}
    />
  );
});

// Main component export with UIXThemeProvider wrapper
function AdminStaffDetailFullPage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailFullPageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailFullPage;
