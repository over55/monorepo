// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/ChangePassword/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Modal, Input, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  KeyIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import axios from "axios";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Modal,
  Input,
  Spinner,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminAssociateDetailMoreChangePasswordPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [associate, setAssociate] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Load associate details
  useEffect(() => {
    let mounted = true;

    const fetchAssociate = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await associateManager.getAssociateDetail(aid, onUnauthorized);
        if (mounted) {
          setAssociate(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch associate:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchAssociate();
    }

    return () => {
      mounted = false;
    };
  }, [aid, associateManager, onUnauthorized]);

  // Validate form
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    if (!passwordRepeated) {
      newErrors.passwordRepeated = "Password confirmation is required";
    } else if (password !== passwordRepeated) {
      newErrors.passwordRepeated = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [password, passwordRepeated]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    if (!validateForm()) return;

    setErrors({});
    setIsSubmitting(true);
    setShowConfirmModal(false);

    try {
      const passwordData = {
        associate_id: aid,
        password: password,
        password_repeated: passwordRepeated,
      };

      // Get access token
      let accessToken =
        localStorage.getItem("WORKERY_ACCESS_TOKEN") ||
        localStorage.getItem("WORKERY_TENANT_ACCESS_TOKEN") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

      if (!accessToken) {
        const tokenKey = Object.keys(localStorage).find(
          (key) =>
            key.toLowerCase().includes("token") &&
            !key.toLowerCase().includes("refresh") &&
            !key.toLowerCase().includes("timestamp"),
        );
        if (tokenKey) {
          accessToken = localStorage.getItem(tokenKey);
        }
      }

      if (!accessToken) {
        throw new Error("No access token found. Please login again.");
      }

      const apiBaseUrl =
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000"
          : window.location.origin;

      const endpoint = "/api/v1/associates/operations/change-password";
      const fullUrl = `${apiBaseUrl}${endpoint}`;

      await axios.post(fullUrl, passwordData, {
        headers: {
          Authorization: `JWT ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      setSuccessMessage("Password has been successfully changed");
      setPassword("");
      setPasswordRepeated("");

      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Password change failed:", error);

      let errorMessage = "An unknown error occurred";

      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = "API endpoint not found. Please contact support.";
        } else if (error.response.status === 401) {
          errorMessage = "Unauthorized. Please login again.";
          setTimeout(() => {
            navigate("/login?unauthorized=true");
          }, 2000);
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to change this password.";
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.detail) {
          errorMessage = error.response.data.detail;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || errorMessage;
      }

      setErrors({ message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [aid, password, passwordRepeated, validateForm, isSubmitting, navigate]);

  // Handle confirm button click
  const handleConfirmClick = useCallback(() => {
    if (validateForm()) {
      setShowConfirmModal(true);
    }
  }, [validateForm]);

  // Handle password change
  const handlePasswordChange = useCallback((value) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: undefined }));
  }, []);

  // Handle password repeated change
  const handlePasswordRepeatedChange = useCallback((value) => {
    setPasswordRepeated(value);
    setErrors((prev) => ({ ...prev, passwordRepeated: undefined }));
  }, []);

  // Breadcrumb items
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
      to: `/admin/associate/${aid}/more`,
      icon: Cog6ToothIcon,
    },
    {
      label: "Change Password",
      icon: KeyIcon,
      isActive: true,
    },
  ], [aid]);

  // Render loading state
  if (isFetching && !associate) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading associate details...</p>
          </div>
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
          <UserGroupIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Associate: {associate?.firstName} {associate?.lastName}
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <KeyIcon className="w-4 h-4 mr-1" />
          Change password for this associate
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          <CheckCircleIcon className="w-5 h-5 mr-2 inline" />
          {successMessage}
        </Alert>
      )}

      {/* Error Messages (non-field) */}
      {errors.message && (
        <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Card Header */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <h2 className={`text-xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
            <LockClosedIcon className="w-5 h-5 mr-2 text-blue-600" />
            Change Password
          </h2>
        </div>

        {/* Status Banner */}
        {associate?.status === 2 && (
          <Alert type="info" className="mb-4">
            <ArchiveBoxIcon className="w-5 h-5 mr-2 inline" />
            This associate is archived
          </Alert>
        )}

        {/* Warning Message */}
        <Alert type="warning" className="mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold mb-2">Warning</h4>
              <p className="text-sm">
                You are about to <strong>change the password</strong> for this associate.
                Please make sure you enter it correctly or else the associate will be locked
                out of their account and will require password resetting.
              </p>
              <p className="text-sm mt-2">
                <strong>Note:</strong> The associate will need to use this new password on their next login.
              </p>
            </div>
          </div>
        </Alert>

        {/* Associate Information */}
        {associate && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 text-gray-600" />
              Associate Information
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">Name:</span>
                <span className="text-gray-900">{associate.firstName} {associate.lastName}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">Email:</span>
                <span className="text-gray-900">{associate.email}</span>
              </div>
              <div className="flex">
                <span className="font-medium text-gray-600 w-24">Status:</span>
                <span>
                  {associate.status === 1 ? (
                    <Badge variant="success" size="sm">Active</Badge>
                  ) : associate.status === 2 ? (
                    <Badge variant="warning" size="sm">Archived</Badge>
                  ) : (
                    <Badge variant="secondary" size="sm">Unknown</Badge>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Password Form */}
        <div className="space-y-4">
          <Input
            label="New Password"
            type="password"
            required
            value={password}
            onChange={handlePasswordChange}
            placeholder="Enter new password"
            error={errors.password}
            disabled={isSubmitting}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={passwordRepeated}
            onChange={handlePasswordRepeatedChange}
            placeholder="Enter new password again"
            error={errors.passwordRepeated}
            disabled={isSubmitting}
          />

          <Alert type="info" className="mt-4">
            <p className="text-sm font-medium mb-2">Password Requirements:</p>
            <ul className="text-sm space-y-1 ml-5 list-disc">
              <li>Minimum 8 characters long</li>
              <li>Both password fields must match</li>
              <li>Consider using a mix of letters, numbers, and symbols for better security</li>
            </ul>
          </Alert>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
          <Link to={`/admin/associate/${aid}/more`}>
            <Button variant="secondary" disabled={isSubmitting}>
              Back to More
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={handleConfirmClick}
            disabled={isSubmitting || !password || !passwordRepeated}
            loading={isSubmitting}
            icon={CheckCircleIcon}
          >
            {isSubmitting ? "Processing..." : "Confirm and Submit"}
          </Button>
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !isSubmitting && setShowConfirmModal(false)}
        title="Confirm Password Change"
        size="md"
      >
        <div>
          <p className="text-sm text-gray-500 mb-3">
            Are you sure you want to change the password for:
          </p>
          <p className="font-semibold text-gray-900 mb-3">
            {associate?.firstName} {associate?.lastName} ({associate?.email})
          </p>

          <Alert type="warning" className="mb-4">
            <strong>Important:</strong> The associate will need to use the new password
            immediately. Make sure to securely communicate the new password to them.
          </Alert>

          {errors.message && (
            <Alert type="error" className="mb-4">
              <strong>Error:</strong> {errors.message}
            </Alert>
          )}

          <p className="text-sm text-gray-500">
            Do you want to proceed with changing the password?
          </p>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? "Changing Password..." : "Yes, Change Password"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminAssociateDetailMoreChangePasswordPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminAssociateDetailMoreChangePasswordPage />
    </UIXThemeProvider>
  );
}

export default AdminAssociateDetailMoreChangePasswordPageWithProvider;
