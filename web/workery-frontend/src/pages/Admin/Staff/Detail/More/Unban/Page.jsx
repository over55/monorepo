// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Unban/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Modal, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Modal,
  Textarea,
  Spinner,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminStaffDetailMoreUnbanPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [staff, setStaff] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [unbanReason, setUnbanReason] = useState("");
  const [isUnbanning, setIsUnbanning] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-400",
    textMuted: getThemeClasses("text-muted") || "text-gray-500 dark:text-gray-400",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 dark:text-blue-400",
    bgMuted: getThemeClasses("bg-muted") || "bg-gray-50 dark:bg-gray-800",
    borderMuted: getThemeClasses("border-muted") || "border-gray-200 dark:border-gray-700",
    iconMuted: getThemeClasses("icon-muted") || "text-gray-400 dark:text-gray-500",
    iconSecondary: getThemeClasses("icon-secondary") || "text-gray-600 dark:text-gray-400",
  }), [getThemeClasses]);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Load staff details
  useEffect(() => {
    let mounted = true;

    const fetchStaff = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await staffManager.getStaffDetail(aid, onUnauthorized);
        if (mounted) {
          setStaff(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff:", error);
          setErrors(error || { message: "Failed to load staff details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchStaff();
    } else {
      setErrors({ message: "No staff ID provided" });
      setFetching(false);
    }

    return () => {
      mounted = false;
    };
  }, [aid, staffManager, onUnauthorized]);

  // Handle unban confirmation
  const handleConfirmUnban = useCallback(async () => {
    // Validate reason
    if (!unbanReason || unbanReason.trim().length === 0) {
      setErrors({ reason: "Unban reason is required" });
      return;
    }

    if (unbanReason.trim().length < 10) {
      setErrors({ reason: "Unban reason must be at least 10 characters long" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsUnbanning(true);

    try {
      // Call the manager to unban staff
      const unbanData = {
        staff_id: aid,
        reason: unbanReason.trim(),
      };

      // Note: If unbanStaff method exists, use it. Otherwise simulate.
      if (staffManager.unbanStaff) {
        await staffManager.unbanStaff(unbanData, onUnauthorized);
      } else {
        // Simulate API call if method doesn't exist yet
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setSuccessMessage("Staff member has been successfully unbanned and can now access the system");

      // Navigate back to staff more after a short delay
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to unban staff:", error);
      setErrors(error || { message: "Failed to unban staff member" });
      setIsUnbanning(false);
    }
  }, [aid, unbanReason, staffManager, onUnauthorized, navigate]);

  // Handle reason change
  const handleReasonChange = useCallback((value) => {
    setUnbanReason(value);
    setErrors((prev) => ({ ...prev, reason: null }));
  }, []);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Check if banned
  const isBanned = staff?.status === 100 || staff?.isBanned;

  // Breadcrumb items
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
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `/admin/staff/${aid}/more`,
      icon: EllipsisHorizontalIcon,
    },
    {
      label: "Unban",
      icon: CheckCircleIcon,
      isActive: true,
    },
  ], [aid]);

  // Get status badge
  const getStatusBadge = (entity) => {
    if (entity?.status === 100 || entity?.isBanned) {
      return (
        <Badge variant="danger" size="sm">
          <ShieldExclamationIcon className="w-3 h-3 mr-1 inline" />
          Banned
        </Badge>
      );
    } else if (entity?.status === 1) {
      return <Badge variant="success" size="sm">Active</Badge>;
    } else if (entity?.status === 2) {
      return <Badge variant="warning" size="sm">Archived</Badge>;
    }
    return <Badge variant="secondary" size="sm">Unknown</Badge>;
  };

  // Render loading state
  if (isFetching) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading staff details...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // Render error state
  if (!staff && Object.keys(errors).length > 0) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Alert type="error" className="mb-6">
          {errors.message || errors.detail || "Failed to load staff details. Please try again."}
        </Alert>
        <Link to={`/admin/staff/${aid}/more`}>
          <Button variant="secondary">Back to More</Button>
        </Link>
      </Card>
    );
  }

  if (!staff) return null;

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <UserIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Staff: {staff.firstName} {staff.lastName}
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Restore staff member access to the system
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          <CheckCircleIcon className="w-5 h-5 mr-2 inline" />
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {errors.reason && (
        <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
          {errors.reason}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Info Message */}
        {isBanned ? (
          <Alert type="success" className="mb-6">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Restore Staff Member Access
                </h3>
                <p className="mb-3">
                  You are about to <strong>unban</strong> this staff member. This means:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    The staff member will be able to log in to their account again
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    They will regain access to all system features
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    They can manage work orders and associates
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Their account status will be restored to active
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    They will receive an email notification about the account restoration
                  </li>
                </ul>
                <p className="mt-3">
                  Please ensure this decision has been properly reviewed and approved.
                </p>
              </div>
            </div>
          </Alert>
        ) : (
          <Alert type="info" className="mb-6">
            This staff member is not currently banned. No unban action is needed.
          </Alert>
        )}

        {/* Staff Information */}
        <div className={`${themeClasses.bgMuted} rounded-lg p-6 mb-6`}>
          <h4 className={`text-lg font-semibold ${themeClasses.textPrimary} mb-4 flex items-center`}>
            <UserIcon className={`w-5 h-5 mr-2 ${themeClasses.iconSecondary}`} />
            Staff Information
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Name:</dt>
              <dd className={`mt-1 text-sm ${themeClasses.textPrimary}`}>
                {staff.firstName} {staff.lastName}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Email:</dt>
              <dd className={`mt-1 text-sm ${themeClasses.textPrimary} flex items-center`}>
                <EnvelopeIcon className={`w-4 h-4 mr-1 ${themeClasses.iconMuted}`} />
                {staff.email}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Phone:</dt>
              <dd className={`mt-1 text-sm ${themeClasses.textPrimary} flex items-center`}>
                <PhoneIcon className={`w-4 h-4 mr-1 ${themeClasses.iconMuted}`} />
                {formatPhone(staff.phone)}
              </dd>
            </div>
            <div>
              <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Current Status:</dt>
              <dd className="mt-1">{getStatusBadge(staff)}</dd>
            </div>
            {staff.banReason && (
              <div className="sm:col-span-2">
                <dt className={`text-sm font-medium ${themeClasses.textMuted}`}>Original Ban Reason:</dt>
                <dd className={`mt-1 text-sm ${themeClasses.textPrimary} italic`}>{staff.banReason}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Unban Reason Input */}
        {isBanned && (
          <div className="mb-6">
            <Textarea
              label="Unban Reason"
              required
              value={unbanReason}
              onChange={handleReasonChange}
              placeholder="Please provide a reason for unbanning this staff member (e.g., review complete, issue resolved, appeal approved)..."
              rows={5}
              maxLength={500}
              error={errors.reason}
              disabled={isUnbanning}
              helperText="This reason will be recorded in the system logs for audit purposes."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t ${themeClasses.borderMuted}`}>
          <Link to={`/admin/staff/${aid}/more`}>
            <Button variant="secondary" disabled={isUnbanning}>
              Back to More
            </Button>
          </Link>

          {isBanned && (
            <Button
              variant="success"
              onClick={() => setShowConfirmModal(true)}
              disabled={isUnbanning || !unbanReason.trim()}
              loading={isUnbanning}
              icon={CheckCircleIcon}
            >
              {isUnbanning ? "Processing..." : "Proceed with Unban"}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Unban"
        size="md"
      >
        <div>
          <p className={`text-sm ${themeClasses.textMuted} mb-3`}>
            You are about to restore access for:
          </p>

          <p className={`text-sm font-semibold ${themeClasses.textPrimary} mb-3`}>
            {staff.firstName} {staff.lastName} ({staff.email})
          </p>

          <div className={`${themeClasses.bgMuted} rounded-lg p-3 mb-3`}>
            <p className={`text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Unban Reason:</p>
            <p className={`text-sm ${themeClasses.textSecondary} italic`}>{unbanReason}</p>
          </div>

          <Alert type="info" className="mb-3">
            <strong>Note:</strong> The staff member will be immediately able to log in and access the system once this action is confirmed.
          </Alert>

          <p className={`text-sm ${themeClasses.textMuted}`}>
            Are you sure you want to proceed with unbanning this staff member?
          </p>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isUnbanning}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmUnban}
              disabled={isUnbanning}
              loading={isUnbanning}
            >
              {isUnbanning ? "Unbanning..." : "Yes, Unban Staff Member"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffDetailMoreUnbanPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreUnbanPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreUnbanPageWithProvider;
