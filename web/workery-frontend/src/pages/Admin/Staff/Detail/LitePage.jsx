// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/LitePage.jsx
// @uix-page: DetailLiteView

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  InformationCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  CalendarIcon,
  NoSymbolIcon,
  XCircleIcon,
  HomeIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../services/Services";
import { TagsDisplay } from "../../../../components/business/displays";
import {
  UIXThemeProvider,
  DetailLiteView,
  EditButton,
  Avatar,
  Badge,
  ContactLink,
  AddressDisplay,
  useUIXTheme,
} from "../../../../components/UIX";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import {
  STAFF_TYPE_MAP,
  STAFF_TYPE_FRONTLINE,
} from "../../../../constants/Staff";

// Extract IDs helper - moved outside component for performance
const extractIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.id || item.value).filter(Boolean);
};

const AdminStaffDetailLitePageContent = memo(function AdminStaffDetailLitePageContent() {
  const { aid } = useParams();
  const staffManager = useStaffManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State management
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup - prevents state updates on unmounted component
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
          console.log("Setting staff data:", response);
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
          console.error("Setting error:", errorResponse);
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
          console.log("Setting loading to false");
        }
        setLoading(false);
      },
      onUnauthorized,
    );
  }, [aid, staffManager, onUnauthorized]);

  // Initial data load with cleanup
  useEffect(() => {
    isMounted.current = true;

    if (import.meta.env.DEV) {
      console.log("Effect running for aid:", aid);
    }
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
  }, [aid, fetchStaff]);

  // Create status badge
  const createStatusBadge = useCallback((staffData) => {
    if (!staffData) return null;
    if (staffData.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (staffData.status === 1) {
      return (
        <Badge variant="primary" size="sm">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" size="sm">
        Archived
      </Badge>
    );
  }, []);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    textMuted: getThemeClasses("text-muted"),
  }), [getThemeClasses]);

  // Configure DetailLiteView props - ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURNS
  const breadcrumbItems = useMemo(() => [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: HomeIcon,
      hideOnMobile: false,
      mobileLabel: "Dash",
    },
    {
      label: "Staff",
      to: "/admin/staff",
      icon: UserGroupIcon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
      isActive: true,
    },
  ], []);

  const headerConfig = useMemo(() => ({
    title: "Staff Member - Summary",
    icon: UserIcon,
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
      isActive: true,
    },
    {
      label: "Detail",
      to: `/admin/staff/${staff?.id}/detail`,
    },
    {
      label: "Comments",
      to: `/admin/staff/${staff?.id}/comments`,
    },
    {
      label: "Attachments",
      to: `/admin/staff/${staff?.id}/attachments`,
    },
    {
      label: "More",
      to: `/admin/staff/${staff?.id}/more`,
      icon: EllipsisHorizontalIcon,
    },
  ], [staff?.id]);

  const fieldSections = useMemo(() => staff
    ? [
        // Avatar section
        {
          type: "avatar",
          component: (
            <Avatar
              src={staff?.avatarObjectUrl}
              alt={
                staff?.avatarObjectUrl
                  ? "Profile Picture"
                  : "No Profile Picture"
              }
              size="lg"
              borderStyle="default"
              showFallbackIcon={true}
            />
          ),
        },
        // Primary column sections
        {
          column: "primary",
          className: "mb-3 sm:mb-4 lg:mb-5",
          component: (
            <div>
              {staff?.type === STAFF_TYPE_FRONTLINE &&
                staff.organizationName && (
                  <h2
                    className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start mb-2`}
                  >
                    <span className="break-words">
                      {staff.organizationName}
                    </span>
                  </h2>
                )}
              <h3
                className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start`}
              >
                <span className="break-words">
                  {staff?.name || `${staff?.firstName} ${staff?.lastName}`}
                </span>
              </h3>
              <div
                className={`mt-2 text-sm lg:text-base ${themeClasses.textSecondary}`}
              >
                <Badge variant="primary" size="md">
                  {STAFF_TYPE_MAP[staff?.type] || "Unknown"}
                </Badge>
              </div>
            </div>
          ),
        },
        {
          column: "primary",
          className: "mb-3 sm:mb-4 lg:mb-5",
          component: (
            <AddressDisplay
              addressData={staff}
              size="md"
              showIcon={true}
              showMapsLink={true}
            />
          ),
        },
        {
          column: "primary",
          className: "space-y-2 sm:space-y-3",
          component: (
            <div className="space-y-2 sm:space-y-3">
              <ContactLink
                type="email"
                value={staff?.email}
                size="md"
                fallbackText="No email"
              />
              <ContactLink
                type="phone"
                value={staff?.phone}
                size="md"
                fallbackText="No phone"
              />
              {staff?.otherPhone && (
                <ContactLink
                  type="phone"
                  value={staff?.otherPhone}
                  size="md"
                  fallbackText="No phone"
                />
              )}
            </div>
          ),
        },
        // Secondary column sections
        {
          column: "secondary",
          component: (
            <TagsDisplay
              values={extractIds(staff?.tags)}
              label="Tags"
              onUnauthorized={onUnauthorized}
            />
          ),
        },
        {
          column: "secondary",
          component: (
            <div
              className={`space-y-2 text-xs sm:text-sm lg:text-base ${themeClasses.textSecondary}`}
            >
              {staff?.createdAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(staff.createdAt)}
                  </span>
                </div>
              )}
              {staff?.modifiedAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Last Modified:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(staff.modifiedAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center xl:justify-start">
                <CheckCircleIcon
                  className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                />
                <span className="font-medium">Status:</span>
                <span className="ml-2">{createStatusBadge(staff)}</span>
              </div>
            </div>
          ),
        },
      ].filter((section) => section.component)
    : [], [staff, themeClasses, onUnauthorized, createStatusBadge]);

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

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <DetailLiteView
        isLoading={loading}
        headerConfig={{
          loadingText: "Loading staff details...",
        }}
      />
    );
  }

  return (
    <DetailLiteView
      entityData={staff}
      breadcrumbItems={breadcrumbItems}
      headerConfig={headerConfig}
      fieldSections={fieldSections}
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

function AdminStaffDetailLitePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailLitePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailLitePage;
