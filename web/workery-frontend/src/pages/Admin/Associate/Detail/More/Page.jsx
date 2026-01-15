// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/Page.jsx
// UIX Upgraded - Uses UIX primitives (ActionCard, Breadcrumb, Alert, Tabs, etc.)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  CameraIcon,
  ArchiveBoxXMarkIcon,
  TrashIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  NoSymbolIcon,
  CheckCircleIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../services/Services";
import {
  Breadcrumb,
  Alert,
  Tabs,
  Card,
  Spinner,
  ActionCard,
  UIXThemeProvider,
} from "../../../../../components/UIX";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3; // Commercial type
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2; // Residential type
const ASSOCIATE_STATUS_ACTIVE = 1;
const ASSOCIATE_STATUS_ARCHIVED = 2;

function AdminAssociateDetailMorePage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState(null);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associate details
  const fetchAssociateDetail = useCallback(async () => {
    try {
      setFetching(true);
      const data = await associateManager.getAssociateDetail(aid, onUnauthorized);
      setAssociate(data);
    } catch (error) {
      console.error("Failed to fetch associate:", error);
      setErrors({ general: "Failed to load associate details" });
    } finally {
      setFetching(false);
    }
  }, [aid, associateManager, onUnauthorized]);

  // Fetch on mount
  useEffect(() => {
    fetchAssociateDetail();
    window.scrollTo(0, 0);
  }, [fetchAssociateDetail]);

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
      to: `/admin/associate/${aid}`,
      icon: ClipboardDocumentListIcon,
    },
    {
      label: "More",
      icon: EllipsisHorizontalIcon,
      isActive: true,
    },
  ], [aid]);

  // Memoize tabs
  const tabs = useMemo(() => [
    { label: "Summary", to: `/admin/associate/${aid}` },
    { label: "Detail", to: `/admin/associate/${aid}/detail` },
    { label: "Orders", to: `/admin/associate/${aid}/orders` },
    { label: "Comments", to: `/admin/associate/${aid}/comments` },
    { label: "Attachments", to: `/admin/associate/${aid}/attachments` },
    { label: "More", to: `/admin/associate/${aid}/more`, icon: EllipsisHorizontalIcon, isActive: true },
  ], [aid]);

  // Memoize action cards
  const actionCards = useMemo(() => {
    if (!associate) return [];

    const cards = [];

    // Photo Upload - Only for active associates
    if (associate.status === ASSOCIATE_STATUS_ACTIVE) {
      cards.push({
        title: "Photo",
        subtitle: "Upload a photo of the associate",
        icon: CameraIcon,
        path: `/admin/associate/${aid}/avatar`,
      });
    }

    // Archive/Unarchive
    if (associate.status === ASSOCIATE_STATUS_ARCHIVED) {
      cards.push({
        title: "Unarchive",
        subtitle: "Make associate visible in list and search results",
        icon: ArchiveBoxXMarkIcon,
        path: `/admin/associate/${aid}/unarchive`,
      });
    } else {
      cards.push({
        title: "Archive",
        subtitle: "Make associate hidden from list and search results",
        icon: ArchiveBoxIcon,
        path: `/admin/associate/${aid}/archive`,
      });
    }

    // Upgrade/Downgrade - Only for active associates
    if (associate.status === ASSOCIATE_STATUS_ACTIVE) {
      if (associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID ||
          associate.typeOf === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
        cards.push({
          title: "Downgrade",
          subtitle: "Change associate to become residential associate",
          icon: ArrowDownCircleIcon,
          path: `/admin/associate/${aid}/downgrade`,
        });
      } else {
        cards.push({
          title: "Upgrade",
          subtitle: "Change associate to become commercial associate",
          icon: ArrowUpCircleIcon,
          path: `/admin/associate/${aid}/upgrade`,
        });
      }
    }

    // Delete - Only for active associates
    if (associate.status === ASSOCIATE_STATUS_ACTIVE) {
      cards.push({
        title: "Delete",
        subtitle: "Permanently delete this associate and all data",
        icon: TrashIcon,
        path: `/admin/associate/${aid}/permadelete`,
      });
    }

    // Password - Only for active associates
    if (associate.status === ASSOCIATE_STATUS_ACTIVE) {
      cards.push({
        title: "Password",
        subtitle: "Change or reset the associate's password",
        icon: LockClosedIcon,
        path: `/admin/associate/${aid}/change-password`,
      });
    }

    // 2FA - Only for active associates
    if (associate.status === ASSOCIATE_STATUS_ACTIVE) {
      cards.push({
        title: "2FA",
        subtitle: "Enable or disable two-factor authentication",
        icon: DevicePhoneMobileIcon,
        path: `/admin/associate/${aid}/change-2fa`,
      });
    }

    // Ban/Unban - Only for active associates
    if (associate.status === ASSOCIATE_STATUS_ACTIVE) {
      if (associate.isBanned) {
        cards.push({
          title: "Unban",
          subtitle: "Remove ban and restore access",
          icon: CheckCircleIcon,
          path: `/admin/associate/${aid}/unban`,
        });
      } else {
        cards.push({
          title: "Ban",
          subtitle: "Ban associate from accessing the system",
          icon: NoSymbolIcon,
          path: `/admin/associate/${aid}/ban`,
        });
      }
    }

    return cards;
  }, [associate, aid]);

  if (isFetching) {
    return (
      <UIXThemeProvider>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Spinner className="mx-auto" />
              <p className="mt-4 text-gray-600">Loading associate details...</p>
            </div>
          </div>
        </div>
      </UIXThemeProvider>
    );
  }

  return (
    <UIXThemeProvider>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <div className="mb-4 sm:mb-6">
          <Breadcrumb items={breadcrumbItems} />
        </div>

        {/* Page Title */}
        <div className="mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <UserGroupIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600" />
                Associate
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                Additional actions and settings
              </p>
            </div>
          </div>
        </div>

        {/* Status Alerts */}
        {associate && associate.status === ASSOCIATE_STATUS_ARCHIVED && (
          <Alert type="info" icon={ArchiveBoxIcon} className="mb-4">
            This associate is archived
          </Alert>
        )}

        {associate && associate.isBanned && (
          <Alert type="warning" icon={NoSymbolIcon} className="mb-4">
            This associate is banned
          </Alert>
        )}

        {/* Error Display */}
        {errors.general && (
          <Alert
            type="error"
            dismissible
            onDismiss={() => setErrors({})}
            className="mb-4"
          >
            {errors.general}
          </Alert>
        )}

        {/* Main Content */}
        <Card className="shadow-sm rounded-lg">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <EllipsisHorizontalIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600" />
              More Actions
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="px-4 sm:px-6 border-b border-gray-200">
            <Tabs items={tabs} />
          </div>

          {associate && (
            <div className="p-4 sm:p-6">
              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {actionCards.map((card, index) => (
                  <ActionCard
                    key={index}
                    title={card.title}
                    subtitle={card.subtitle}
                    icon={card.icon}
                    path={card.path}
                    disabled={card.disabled}
                  />
                ))}
              </div>

              {/* Information Alert */}
              <Alert type="info" icon={InformationCircleIcon} className="mb-6 sm:mb-8">
                <strong>Note:</strong> Some actions are only available for active associates.
                Archived associates must be unarchived first before performing other actions.
              </Alert>

              {/* Bottom Navigation */}
              <div className="flex justify-start pt-4 sm:pt-6 border-t border-gray-200">
                <Link to="/admin/associates">
                  <button className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Associates
                  </button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMorePage;
