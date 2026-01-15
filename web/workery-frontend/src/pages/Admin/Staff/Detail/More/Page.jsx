// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Page.jsx
// UIX Upgraded - Uses UIX primitives (ActionCard, Breadcrumb, Alert, Tabs, etc.)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
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
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../services/Services";
import {
  Breadcrumb,
  Alert,
  Tabs,
  Card,
  Spinner,
  ActionCard,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../components/UIX";

// Constants
const STAFF_TYPE_MANAGEMENT = 2; // Management/Business type
const STAFF_TYPE_FRONTLINE = 1; // Frontline/Residential type
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

function AdminStaffDetailMorePageContent() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    iconPrimary: getThemeClasses("icon-primary"),
    borderMedium: getThemeClasses("border-medium"),
  }), [getThemeClasses]);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState(null);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch staff details
  const fetchStaffDetail = useCallback(async () => {
    try {
      setFetching(true);
      const data = await staffManager.getStaffDetail(aid, onUnauthorized);
      setStaff(data);
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setErrors({ general: "Failed to load staff details" });
    } finally {
      setFetching(false);
    }
  }, [aid, staffManager, onUnauthorized]);

  // Fetch on mount
  useEffect(() => {
    fetchStaffDetail();
    window.scrollTo(0, 0);
  }, [fetchStaffDetail]);

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
      to: `/admin/staff/${aid}`,
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
    { label: "Summary", to: `/admin/staff/${aid}` },
    { label: "Detail", to: `/admin/staff/${aid}/detail` },
    { label: "Comments", to: `/admin/staff/${aid}/comments` },
    { label: "Attachments", to: `/admin/staff/${aid}/attachments` },
    { label: "More", to: `/admin/staff/${aid}/more`, icon: EllipsisHorizontalIcon, isActive: true },
  ], [aid]);

  // Memoize action cards
  const actionCards = useMemo(() => {
    if (!staff) return [];

    const cards = [];

    // Photo Upload - Only for active staff
    if (staff.status === STAFF_STATUS_ACTIVE) {
      cards.push({
        title: "Photo",
        subtitle: "Upload a photo of the staff member",
        icon: CameraIcon,
        path: `/admin/staff/${aid}/avatar`,
      });
    }

    // Archive/Unarchive
    if (staff.status === STAFF_STATUS_ARCHIVED) {
      cards.push({
        title: "Unarchive",
        subtitle: "Make staff member visible in list and search results",
        icon: ArchiveBoxXMarkIcon,
        path: `/admin/staff/${aid}/unarchive`,
      });
    } else {
      cards.push({
        title: "Archive",
        subtitle: "Make staff member hidden from list and search results",
        icon: ArchiveBoxIcon,
        path: `/admin/staff/${aid}/archive`,
      });
    }

    // Upgrade/Downgrade - Only for active staff
    if (staff.status === STAFF_STATUS_ACTIVE) {
      if (staff.type === STAFF_TYPE_MANAGEMENT) {
        cards.push({
          title: "Downgrade",
          subtitle: "Change staff member to frontline staff",
          icon: ArrowDownCircleIcon,
          path: `/admin/staff/${aid}/downgrade`,
        });
      } else {
        cards.push({
          title: "Upgrade",
          subtitle: "Change staff member to management staff",
          icon: ArrowUpCircleIcon,
          path: `/admin/staff/${aid}/upgrade`,
        });
      }
    }

    // Delete - Only for active staff
    if (staff.status === STAFF_STATUS_ACTIVE) {
      cards.push({
        title: "Delete",
        subtitle: "Permanently delete this staff member and all data",
        icon: TrashIcon,
        path: `/admin/staff/${aid}/permadelete`,
      });
    }

    // Password - Only for active staff
    if (staff.status === STAFF_STATUS_ACTIVE) {
      cards.push({
        title: "Password",
        subtitle: "Change or reset the staff member's password",
        icon: LockClosedIcon,
        path: `/admin/staff/${aid}/change-password`,
      });
    }

    // 2FA - Only for active staff
    if (staff.status === STAFF_STATUS_ACTIVE) {
      cards.push({
        title: "2FA",
        subtitle: "Enable or disable two-factor authentication",
        icon: DevicePhoneMobileIcon,
        path: `/admin/staff/${aid}/2fa`,
      });
    }

    return cards;
  }, [staff, aid]);

  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner className="mx-auto" />
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Breadcrumb */}
      <div className="mb-4 sm:mb-6">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* Page Title */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
              <UserIcon className={`w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 ${themeClasses.iconPrimary}`} />
              Staff Member
            </h1>
            <p className={`mt-1 text-xs sm:text-sm ${themeClasses.textSecondary} flex items-center`}>
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
              Additional actions and settings
            </p>
          </div>
        </div>
      </div>

        {/* Status Alerts */}
        {staff && staff.status === STAFF_STATUS_ARCHIVED && (
          <Alert type="info" icon={ArchiveBoxIcon} className="mb-4">
            This staff member is archived
          </Alert>
        )}

        {staff && staff.isBanned && (
          <Alert type="warning" icon={NoSymbolIcon} className="mb-4">
            This staff member is banned
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
          <div className={`px-4 sm:px-6 py-4 sm:py-5 border-b ${themeClasses.borderMedium}`}>
            <h2 className={`text-xl sm:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
              <EllipsisHorizontalIcon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.iconPrimary}`} />
              More Actions
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className={`px-4 sm:px-6 border-b ${themeClasses.borderMedium}`}>
            <Tabs items={tabs} />
          </div>

          {staff && (
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
                <strong>Note:</strong> Some actions are only available for active staff members.
                Archived staff members must be unarchived first before performing other actions.
              </Alert>

              {/* Bottom Navigation */}
              <div className={`flex justify-start pt-4 sm:pt-6 border-t ${themeClasses.borderMedium}`}>
                <Link to="/admin/staff">
                  <Button variant="outline">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Staff
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffDetailMorePage() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMorePageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMorePage;
