// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/LitePage.jsx
// UIX Upgraded - Uses DetailLiteView whole page component
// @uix-page: AdminAssociateDetailLitePage

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
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
  CalendarIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { useAssociateManager } from "../../../../services/Services";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";
import { DetailLiteView } from "../../../../components/UIX";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_STATUS_ACTIVE = 1;
const ASSOCIATE_STATUS_ARCHIVED = 2;

const ASSOCIATE_TYPE_MAP = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

function AdminAssociateDetailLitePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associate data
  const fetchAssociate = useCallback(async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    try {
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(associateData);
    } catch (err) {
      console.error("Failed to fetch associate:", err);
      setError("Failed to load associate details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [aid, associateManager, onUnauthorized]);

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [fetchAssociate]);

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
  const formatAddress = useCallback((associateData) => {
    if (!associateData) return "-";
    const address =
      associateData.fullAddressWithPostalCode ||
      `${associateData.addressLine1 || ""} ${associateData.city || ""} ${associateData.region || ""} ${associateData.postalCode || ""}`.trim();
    return address || "-";
  }, []);

  // Get Google Maps URL
  const getGoogleMapsUrl = useCallback((associateData) => {
    if (!associateData) return null;
    return associateData.fullAddressUrl || null;
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

  // Memoize header config
  const headerConfig = useMemo(() => ({
    title: "Summary",
    icon: ClipboardDocumentListIcon,
    loadingText: "Loading associate details...",
    notFoundTitle: "Associate Not Found",
    notFoundMessage: "The associate you're looking for doesn't exist or you don't have permission to view it.",
    notFoundAction: {
      label: "Back to Associates",
      icon: ChevronLeftIcon,
      onClick: () => navigate("/admin/associates"),
    },
  }), [navigate]);

  // Memoize tabs
  const tabs = useMemo(() => {
    if (!associate) return [];
    return [
      { label: "Summary", to: `/admin/associate/${associate.id}`, isActive: true },
      { label: "Detail", to: `/admin/associate/${associate.id}/detail` },
      { label: "Orders", to: `/admin/associate/${associate.id}/orders` },
      { label: "Comments", to: `/admin/associate/${associate.id}/comments` },
      { label: "Attachments", to: `/admin/associate/${associate.id}/attachments` },
      { label: "More", to: `/admin/associate/${associate.id}/more`, icon: EllipsisHorizontalIcon },
    ];
  }, [associate]);

  // Memoize action buttons
  const actionButtons = useMemo(() => {
    if (!associate) return [];
    return [
      {
        variant: "outline",
        label: "Back",
        icon: ChevronLeftIcon,
        onClick: () => navigate("/admin/associates"),
      },
      {
        variant: "secondary",
        label: "Edit",
        icon: PencilSquareIcon,
        disabled: associate.status === ASSOCIATE_STATUS_ARCHIVED,
        onClick: () => navigate(`/admin/associate/${aid}/edit`),
      },
    ];
  }, [associate, navigate, aid]);

  // Memoize alerts configuration
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

  // Format status display
  const formatStatus = useCallback((associateData) => {
    if (associateData.isBanned) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </span>
      );
    }
    if (associateData.status === ASSOCIATE_STATUS_ACTIVE) {
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

  // Memoize field sections
  const fieldSections = useMemo(() => {
    if (!associate) return [];

    return [
      // Avatar section
      {
        type: "avatar",
        component: (
          <img
            src={
              associate.avatarObjectUrl && associate.avatarObjectUrl !== ""
                ? associate.avatarObjectUrl
                : "/img/placeholder.png"
            }
            alt={
              associate.avatarObjectUrl
                ? "Profile Picture"
                : "No Profile Picture"
            }
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-2xl object-cover border-2 border-gray-100 shadow-sm mx-auto xl:mx-0"
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
              {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                  <BuildingOfficeIcon className="w-5 sm:w-6 h-5 sm:h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                  <span className="break-words">
                    {associate.organizationName}
                  </span>
                </h2>
              )}
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center justify-center xl:justify-start">
                {associate.type === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                  <HomeIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-7 lg:h-7 mr-2 text-blue-600 flex-shrink-0" />
                )}
                <span className="break-words">
                  {associate.name ||
                    `${associate.firstName} ${associate.lastName}`}
                </span>
              </h3>
              <div className="mt-2 text-sm lg:text-base text-gray-600">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800">
                  {ASSOCIATE_TYPE_MAP[associate.type] || "Unknown"}
                </span>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 lg:mb-5 justify-center xl:justify-start">
              <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
              <div className="min-w-0 flex-1">
                <span className="break-words">
                  {formatAddress(associate)}
                </span>
                {getGoogleMapsUrl(associate) && (
                  <a
                    href={getGoogleMapsUrl(associate)}
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
                  {associate.email ? (
                    <a
                      href={`mailto:${associate.email}`}
                      className="text-blue-600 hover:text-blue-700 font-medium break-all"
                    >
                      {associate.email}
                    </a>
                  ) : (
                    <span className="text-gray-500">No email</span>
                  )}
                </div>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  {associate.phone ? (
                    <a
                      href={`tel:${associate.phone}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {formatPhone(associate.phone)}
                    </a>
                  ) : (
                    <span className="text-gray-500">No phone</span>
                  )}
                </div>
              </div>
            </div>

            {/* Type, Status & Rating */}
            <div className="mt-3 sm:mt-4 lg:mt-5 space-y-2 sm:space-y-3">
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 mr-2">Type:</span>
                <span className="font-medium">
                  {ASSOCIATE_TYPE_MAP[associate.type] || "Unknown"}
                </span>
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 mr-2">Status:</span>
                {formatStatus(associate)}
              </div>
              <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                <StarIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                <span className="text-gray-600 mr-2">Rating:</span>
                <div className="ml-1">
                  {formatScoreRating(associate.score)}
                </div>
              </div>
            </div>
          </div>
        ),
      },
      // Secondary column - Tags and Skills
      {
        column: "secondary",
        component: (
          <div className="space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Tags */}
            <div>
              <TagsDisplay
                values={extractIds(associate.tags)}
                label="Tags"
                onUnauthorized={onUnauthorized}
              />
            </div>

            {/* Skills */}
            <div>
              <SkillSetsDisplay
                values={extractIds(associate.skillSets)}
                label="Skill Sets"
                onUnauthorized={onUnauthorized}
              />
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-xs sm:text-sm lg:text-base text-gray-600">
              {associate.publicId && (
                <div className="flex items-center justify-center xl:justify-start">
                  <IdentificationIcon className="w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 text-gray-400" />
                  <span className="font-medium">Public ID:</span>
                  <span className="ml-2">{associate.publicId}</span>
                </div>
              )}
              {associate.createdAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 text-gray-400" />
                  <span className="font-medium">Created:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(associate.createdAt)}
                  </span>
                </div>
              )}
              {associate.modifiedAt && (
                <div className="flex items-center justify-center xl:justify-start">
                  <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 text-gray-400" />
                  <span className="font-medium">Last Modified:</span>
                  <span className="ml-2">
                    {formatDateForDisplay(associate.modifiedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        ),
      },
    ];
  }, [associate, formatAddress, getGoogleMapsUrl, formatPhone, formatStatus, formatScoreRating, extractIds, onUnauthorized]);

  return (
    <DetailLiteView
      entityData={associate}
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

export default AdminAssociateDetailLitePage;
