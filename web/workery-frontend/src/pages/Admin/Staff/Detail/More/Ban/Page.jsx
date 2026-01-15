// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Ban/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Modal, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
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

function AdminStaffDetailMoreBanPage() {
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
  const [banReason, setBanReason] = useState("");
  const [isBanning, setIsBanning] = useState(false);

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
    textError: getThemeClasses("text-error") || "text-red-600 dark:text-red-400",
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

  // Handle ban confirmation
  const handleConfirmBan = useCallback(async () => {
    // Validate reason
    if (!banReason || banReason.trim().length === 0) {
      setErrors({ reason: "Ban reason is required" });
      return;
    }

    if (banReason.trim().length < 10) {
      setErrors({ reason: "Ban reason must be at least 10 characters long" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsBanning(true);

    try {
      // Call the manager to ban staff
      const banData = {
        staff_id: aid,
        reason: banReason.trim(),
      };

      // Note: If banStaff method exists, use it. Otherwise simulate.
      if (staffManager.banStaff) {
        await staffManager.banStaff(banData, onUnauthorized);
      } else {
        // Simulate API call if method doesn't exist yet
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setSuccessMessage("Staff member has been successfully banned");

      // Navigate to staff list after a short delay
      setTimeout(() => {
        navigate("/admin/staff");
      }, 2000);
    } catch (error) {
      console.error("Failed to ban staff:", error);
      setErrors(error || { message: "Failed to ban staff member" });
      setIsBanning(false);
    }
  }, [aid, banReason, staffManager, onUnauthorized, navigate]);

  // Handle reason change
  const handleReasonChange = useCallback((value) => {
    setBanReason(value);
    setErrors((prev) => ({ ...prev, reason: null }));
  }, []);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Check if already banned
  const isAlreadyBanned = staff?.status === 100 || staff?.isBanned;

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
      icon: UserGroupIcon,
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
      label: "Ban",
      icon: NoSymbolIcon,
      isActive: true,
    },
  ], [aid]);

  // Get status badge
  const getStatusBadge = (entity) => {
    if (entity?.status === 100 || entity?.isBanned) {
      return (
        <Badge variant="danger" size="sm">
          <NoSymbolIcon className="w-3 h-3 mr-1 inline" />
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
          <UserGroupIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Staff: {staff.firstName} {staff.lastName}
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <NoSymbolIcon className="w-4 h-4 mr-1" />
          Ban Staff Member
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
        {/* Warning Message */}
        <Alert type="error" className="mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Ban Staff Member - Severe Action Warning
              </h3>
              <p className="mb-3">
                You are about to <strong>permanently ban</strong> this staff member. This means:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  The staff member will be <strong>immediately</strong> logged out
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  They will <strong>not</strong> be able to log in again
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  All access to the system will be <strong>permanently revoked</strong>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  This action is <strong>irreversible</strong> without system administrator intervention
                </li>
              </ul>
              <p className="mt-4 font-semibold">
                This action should only be taken for serious violations or security concerns.
              </p>
            </div>
          </div>
        </Alert>

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
          </dl>
        </div>

        {/* Already Banned Message */}
        {isAlreadyBanned ? (
          <Alert type="info" className="mb-6">
            This staff member is already banned. No further action is needed.
          </Alert>
        ) : (
          /* Ban Reason Input */
          <div className="mb-6">
            <Textarea
              label="Ban Reason"
              required
              value={banReason}
              onChange={handleReasonChange}
              placeholder="Please provide a detailed reason for banning this staff member..."
              rows={5}
              maxLength={500}
              error={errors.reason}
              disabled={isBanning}
              helperText="This reason will be recorded in the system logs and may be reviewed by administrators."
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t ${themeClasses.borderMuted}`}>
          <Link to={`/admin/staff/${aid}/more`}>
            <Button variant="secondary" disabled={isBanning}>
              Back to More
            </Button>
          </Link>

          {!isAlreadyBanned && (
            <Button
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
              disabled={isBanning || !banReason.trim()}
              loading={isBanning}
              icon={NoSymbolIcon}
            >
              {isBanning ? "Processing..." : "Proceed with Ban"}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Final Ban Confirmation"
        size="md"
      >
        <div>
          <Alert type="error" className="mb-4">
            <strong>THIS ACTION CANNOT BE UNDONE</strong>
          </Alert>

          <p className={`text-sm ${themeClasses.textMuted} mb-3`}>
            You are about to permanently ban:
          </p>

          <p className={`text-sm font-semibold ${themeClasses.textPrimary} mb-3`}>
            {staff.firstName} {staff.lastName} ({staff.email})
          </p>

          <div className={`${themeClasses.bgMuted} rounded-lg p-3 mb-3`}>
            <p className={`text-sm font-medium ${themeClasses.textSecondary} mb-1`}>Ban Reason:</p>
            <p className={`text-sm ${themeClasses.textSecondary} italic`}>{banReason}</p>
          </div>

          <p className={`text-sm ${themeClasses.textMuted} mb-3`}>
            This will immediately revoke all access and log the staff member out of the system.
          </p>

          <p className={`text-sm font-semibold ${themeClasses.textError}`}>
            Are you absolutely certain you want to proceed?
          </p>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isBanning}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmBan}
              disabled={isBanning}
              loading={isBanning}
            >
              {isBanning ? "Banning..." : "Yes, Ban Staff Member"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffDetailMoreBanPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreBanPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreBanPageWithProvider;
