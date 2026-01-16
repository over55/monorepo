// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/LitePage.jsx
// @uix-page: DetailLiteView

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate, useParams } from "react-router";
import {
  InformationCircleIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  UserGroupIcon,
  CalendarIcon,
  NoSymbolIcon,
  XCircleIcon,
  HomeIcon,
  BuildingOfficeIcon,
  StarIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useAssociateManager } from "../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
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
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
  ASSOCIATE_STATUS_ACTIVE,
  ASSOCIATE_STATUS_ARCHIVED,
  ASSOCIATE_TYPE_MAP,
} from "../../../../constants/Associate";

// Extract IDs helper - moved outside component for performance
const extractIds = (items) => {
  if (!items || !Array.isArray(items)) return [];
  return items.map((item) => item.id || item.value).filter(Boolean);
};

const AdminAssociateDetailLitePageContent = memo(function AdminAssociateDetailLitePageContent() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs for cleanup - prevents state updates on unmounted component
  const isMounted = useRef(true);
  const abortControllerRef = useRef(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associate data with proper cleanup
  const fetchAssociate = useCallback(() => {
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

    associateManager.getAssociateDetailWithCallbacks(
      aid,
      (response) => {
        // Check if this request was aborted or component unmounted
        if (currentAbortController.signal.aborted || !isMounted.current) {
          return;
        }
        if (import.meta.env.DEV) {
          console.log("Setting associate data:", response);
        }
        setAssociate(response);
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
            "Failed to load associate details. Please try again.",
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
  }, [aid, associateManager, onUnauthorized]);

  // Initial data load with cleanup
  useEffect(() => {
    isMounted.current = true;

    if (import.meta.env.DEV) {
      console.log("Effect running for aid:", aid);
    }
    window.scrollTo(0, 0);
    fetchAssociate();

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
  }, [aid, fetchAssociate]);

  // Create status badge
  const createStatusBadge = useCallback((associateData) => {
    if (!associateData) return null;
    if (associateData.isBanned) {
      return (
        <Badge variant="error" size="sm">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </Badge>
      );
    }
    if (associateData.status === ASSOCIATE_STATUS_ACTIVE) {
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

  // Format score rating
  const formatScoreRating = useCallback((score) => {
    if (!score) {
      return (
        <span className="text-gray-500 text-sm sm:text-base lg:text-lg">
          No rating
        </span>
      );
    }
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 ${
              i < Math.floor(score) ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
          ({score}/5)
        </span>
      </div>
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
      label: "Associates",
      to: "/admin/associates",
      icon: UserGroupIcon,
    },
    {
      label: "Detail",
      icon: InformationCircleIcon,
      isActive: true,
    },
  ], []);

  const headerConfig = useMemo(() => ({
    title: "Associate - Summary",
    icon: UserGroupIcon,
    loadingText: "Loading associate details...",
    notFoundTitle: "Associate Not Found",
    notFoundMessage:
      "The associate you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Associates",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/associates"),
    },
  }), [navigate]);

  const actionButtons = useMemo(() => [
    {
      variant: "outline",
      onClick: () => navigate("/admin/associates"),
      icon: ChevronLeftIcon,
      label: "Back",
    },
    {
      component: (
        <EditButton
          onClick={() => navigate(`/admin/associate/${aid}/edit`)}
          disabled={associate?.status === ASSOCIATE_STATUS_ARCHIVED}
          variant="primary"
          className="flex-1 sm:flex-initial"
        />
      ),
    },
  ], [navigate, aid, associate?.status]);

  const tabs = useMemo(() => [
    {
      label: "Summary",
      isActive: true,
    },
    {
      label: "Detail",
      to: `/admin/associate/${associate?.id}/detail`,
    },
    {
      label: "Orders",
      to: `/admin/associate/${associate?.id}/orders`,
    },
    {
      label: "Comments",
      to: `/admin/associate/${associate?.id}/comments`,
    },
    {
      label: "Attachments",
      to: `/admin/associate/${associate?.id}/attachments`,
    },
    {
      label: "More",
      to: `/admin/associate/${associate?.id}/more`,
      icon: EllipsisHorizontalIcon,
    },
  ], [associate?.id]);

  const fieldSections = useMemo(() => associate
    ? [
        // Avatar section
        {
          type: "avatar",
          component: (
            <Avatar
              src={associate?.avatarObjectUrl}
              alt={
                associate?.avatarObjectUrl
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
              {associate?.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID &&
                associate.organizationName && (
                  <h2
                    className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start mb-2`}
                  >
                    <BuildingOfficeIcon className="w-5 sm:w-6 h-5 sm:h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                    <span className="break-words">
                      {associate.organizationName}
                    </span>
                  </h2>
                )}
              <h3
                className={`text-base sm:text-lg md:text-xl lg:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center justify-center xl:justify-start`}
              >
                {associate?.type === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                  <HomeIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-7 lg:h-7 mr-2 text-blue-600 flex-shrink-0" />
                )}
                <span className="break-words">
                  {associate?.name || `${associate?.firstName} ${associate?.lastName}`}
                </span>
              </h3>
              <div
                className={`mt-2 text-sm lg:text-base ${themeClasses.textSecondary}`}
              >
                <Badge variant="primary" size="md">
                  {ASSOCIATE_TYPE_MAP[associate?.type] || "Unknown"}
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
              addressData={associate}
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
                value={associate?.email}
                size="md"
                fallbackText="No email"
              />
              <ContactLink
                type="phone"
                value={associate?.phone}
                size="md"
                fallbackText="No phone"
              />
              {associate?.otherPhone && (
                <ContactLink
                  type="phone"
                  value={associate?.otherPhone}
                  size="md"
                  fallbackText="No phone"
                />
              )}
            </div>
          ),
        },
        {
          column: "primary",
          className: "mt-3 sm:mt-4 lg:mt-5",
          component: (
            <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
              <StarIcon className={`w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 ${themeClasses.textMuted} flex-shrink-0`} />
              <span className={`${themeClasses.textSecondary} mr-2`}>Rating:</span>
              <div className="ml-1">
                {formatScoreRating(associate?.score)}
              </div>
            </div>
          ),
        },
        // Secondary column sections
        {
          column: "secondary",
          component: (
            <TagsDisplay
              values={extractIds(associate?.tags)}
              label="Tags"
              onUnauthorized={onUnauthorized}
            />
          ),
        },
        {
          column: "secondary",
          component: (
            <SkillSetsDisplay
              values={extractIds(associate?.skillSets)}
              label="Skill Sets"
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
              {associate?.publicId && (
                <div className="flex items-center justify-center xl:justify-start">
                  <IdentificationIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Public ID:</span>
                  <span className="ml-2">{associate.publicId}</span>
                </div>
              )}
              {associate?.createdAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(associate.createdAt)}
                  </span>
                </div>
              )}
              {associate?.modifiedAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon
                    className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                  />
                  <span className="font-medium">Last Modified:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(associate.modifiedAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-center xl:justify-start">
                <CheckCircleIcon
                  className={`w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 ${themeClasses.textMuted}`}
                />
                <span className="font-medium">Status:</span>
                <span className="ml-2">{createStatusBadge(associate)}</span>
              </div>
            </div>
          ),
        },
      ].filter((section) => section.component)
    : [], [associate, themeClasses, onUnauthorized, createStatusBadge, formatScoreRating]);

  const alerts = useMemo(() => ({
    archived: {
      message: "This associate is archived",
      icon: ArchiveBoxIcon,
    },
    banned: {
      message: "This associate is banned",
      icon: NoSymbolIcon,
    },
  }), []);

  // Show loading state AFTER all hooks have been called
  if (loading) {
    return (
      <DetailLiteView
        isLoading={loading}
        headerConfig={{
          loadingText: "Loading associate details...",
        }}
      />
    );
  }

  return (
    <DetailLiteView
      entityData={associate}
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

function AdminAssociateDetailLitePage() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailLitePageContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailLitePage;
