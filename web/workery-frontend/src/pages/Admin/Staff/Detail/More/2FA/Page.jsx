// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/2FA/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Modal, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockClosedIcon,
  LockOpenIcon,
  ArchiveBoxIcon,
  CogIcon,
  DevicePhoneMobileIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Modal,
  Spinner,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminStaffDetailMore2FAPage() {
  // Note: This page uses 'sid' param for backwards compatibility
  const { sid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [staff, setStaff] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-400",
    textMuted: getThemeClasses("text-muted") || "text-gray-500 dark:text-gray-400",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 dark:text-blue-400",
    bgMuted: getThemeClasses("bg-muted") || "bg-gray-50 dark:bg-gray-800",
    borderMuted: getThemeClasses("border-muted") || "border-gray-200 dark:border-gray-700",
    bgError: getThemeClasses("bg-error-muted") || "bg-red-100 dark:bg-red-900/30",
    textError: getThemeClasses("text-error") || "text-red-600 dark:text-red-400",
    bgSuccess: getThemeClasses("bg-success-muted") || "bg-green-100 dark:bg-green-900/30",
    textSuccess: getThemeClasses("text-success") || "text-green-600 dark:text-green-400",
    bgWarning: getThemeClasses("bg-warning-muted") || "bg-amber-100 dark:bg-amber-900/30",
    textWarning: getThemeClasses("text-warning") || "text-amber-600 dark:text-amber-400",
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
        const data = await staffManager.getStaffDetail(sid, onUnauthorized);
        if (mounted) {
          setStaff(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (sid) {
      fetchStaff();
    }

    return () => {
      mounted = false;
    };
  }, [sid, staffManager, onUnauthorized]);

  // Handle 2FA toggle confirmation
  const handleConfirmToggle = useCallback(async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsProcessing(true);

    try {
      const twoFactorData = {
        staff_id: sid,
        otp_enabled: !staff.otpEnabled,
      };

      await staffManager.changeStaffTwoFactorAuth(twoFactorData, onUnauthorized);

      const message = staff.otpEnabled
        ? "2FA has been disabled for this staff member"
        : "2FA has been enabled for this staff member";
      setSuccessMessage(message);

      setTimeout(() => {
        navigate(`/admin/staff/${sid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to change 2FA settings:", error);
      setErrors(error);
      setIsProcessing(false);
    }
  }, [sid, staff, staffManager, onUnauthorized, navigate]);

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
      to: `/admin/staff/${sid}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `/admin/staff/${sid}/more`,
      icon: CogIcon,
    },
    {
      label: "Two-Factor Authentication",
      icon: DevicePhoneMobileIcon,
      isActive: true,
    },
  ], [sid]);

  // Render loading state
  if (isFetching && !staff) {
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

  // Render error state (no staff loaded)
  if (!staff && !isFetching) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="text-center py-16">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${themeClasses.bgError} rounded-full mb-4`}>
            <ExclamationTriangleIcon className={`w-8 h-8 ${themeClasses.textError}`} />
          </div>
          <h3 className={`text-lg font-medium ${themeClasses.textPrimary} mb-2`}>
            Failed to Load Staff Member
          </h3>
          <p className={`${themeClasses.textMuted} mb-6`}>
            Unable to load staff details. Please try again.
          </p>
          <Link to={`/admin/staff/${sid}/more`}>
            <Button variant="secondary">Back to More</Button>
          </Link>
        </Card>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <UserIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Staff: {staff?.firstName} {staff?.lastName}
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <ShieldCheckIcon className="w-4 h-4 mr-1" />
          Two-Factor Authentication Settings
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
      {errors && Object.keys(errors).length > 0 && (
        <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
          {errors.message || errors.detail || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Status Banner */}
        {staff?.status === 2 && (
          <Alert type="info" className="mb-4">
            <ArchiveBoxIcon className="w-5 h-5 mr-2 inline" />
            This staff member is archived.
          </Alert>
        )}

        {staff && (
          <>
            {/* 2FA Status Info */}
            {!staff.otpEnabled ? (
              <Alert type="success" className="mb-6">
                <div className="flex items-start">
                  <LockClosedIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Enable Two-Factor Authentication
                    </h3>
                    <p className="mb-3">
                      You are about to <strong>enable 2FA</strong> for this staff member.
                      This operation will force the staff member on their next successful login
                      to be taken through a <strong>3-step wizard</strong> to setup 2FA.
                      Afterwards, every time the staff member logs in, they will be asked
                      to carry out a 2FA process.
                    </p>
                    <p>Are you sure you want to continue?</p>
                  </div>
                </div>
              </Alert>
            ) : (
              <Alert type="warning" className="mb-6">
                <div className="flex items-start">
                  <LockOpenIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Remove Two-Factor Authentication
                    </h3>
                    <p className="mb-3">
                      You are about to <strong>remove 2FA</strong> for this staff member.
                      This operation will remove previous 2FA setup codes and disable 2FA
                      on login for this staff. This is recommended if the user lost their
                      2FA codes from their device.
                    </p>
                    <p>Are you sure you want to continue?</p>
                  </div>
                </div>
              </Alert>
            )}

            {/* Current Status */}
            <div className={`${themeClasses.bgMuted} border ${themeClasses.borderMuted} rounded-lg p-4 mb-6`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${themeClasses.textSecondary}`}>
                  Current 2FA Status:
                </span>
                {staff.otpEnabled ? (
                  <Badge variant="success" size="sm">
                    <CheckCircleIcon className="w-4 h-4 mr-1 inline" />
                    Enabled
                  </Badge>
                ) : (
                  <Badge variant="secondary" size="sm">
                    <XCircleIcon className="w-4 h-4 mr-1 inline" />
                    Disabled
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t ${themeClasses.borderMuted}`}>
              <Link to={`/admin/staff/${sid}/more`}>
                <Button variant="secondary" disabled={isProcessing}>
                  Back to More
                </Button>
              </Link>

              <Button
                variant={!staff.otpEnabled ? "success" : "warning"}
                onClick={() => setShowConfirmModal(true)}
                disabled={isProcessing}
                loading={isProcessing}
                icon={!staff.otpEnabled ? LockClosedIcon : LockOpenIcon}
              >
                {isProcessing
                  ? "Processing..."
                  : !staff.otpEnabled
                    ? "Enable 2FA"
                    : "Disable 2FA"
                }
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isProcessing && setShowConfirmModal(false)}
        title="Confirm 2FA Change"
        size="md"
      >
        <div>
          <div className={`mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full mb-4 ${
            !staff?.otpEnabled ? themeClasses.bgSuccess : themeClasses.bgWarning
          }`}>
            {!staff?.otpEnabled ? (
              <LockClosedIcon className={`h-6 w-6 ${themeClasses.textSuccess}`} />
            ) : (
              <ExclamationTriangleIcon className={`h-6 w-6 ${themeClasses.textWarning}`} />
            )}
          </div>

          <p className={`text-sm ${themeClasses.textMuted} mb-3`}>
            Are you sure you want to {!staff?.otpEnabled ? "enable" : "disable"} Two-Factor
            Authentication for this staff member?
          </p>

          {!staff?.otpEnabled ? (
            <p className={`text-sm ${themeClasses.textMuted} mb-3`}>
              The staff member will be required to set up 2FA on their next login.
            </p>
          ) : (
            <p className={`text-sm ${themeClasses.textMuted} mb-3`}>
              This will remove all 2FA settings for this staff member.
              They will be able to login without 2FA verification.
            </p>
          )}

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={!staff?.otpEnabled ? "success" : "warning"}
              onClick={handleConfirmToggle}
              disabled={isProcessing}
              loading={isProcessing}
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffDetailMore2FAPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMore2FAPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMore2FAPageWithProvider;
