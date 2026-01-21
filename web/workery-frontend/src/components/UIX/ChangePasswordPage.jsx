// File Path: web/frontend/src/components/UIX/ChangePasswordPage.jsx
// UIX Mobile Optimizations Applied

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router";
import PageHeader from "./PageHeader/PageHeader";
import FormCard from "./FormCard/FormCard";
import FormSection from "./Form/FormSection";
import FormRow from "./Form/FormRow";
import Input from "./Input/Input";
import Button from "./Button/Button";
import Alert from "./Alert/Alert";
import Modal from "./Modal/Modal";
import { UIXThemeProvider, useUIXTheme } from "./themes/useUIXTheme.jsx";
import Badge from "./Badge/Badge";
import Breadcrumb from "./Breadcrumb/Breadcrumb";
import Loading from "./Loading/Loading";
import {
  KeyIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// Inner component that uses theme hook
function ChangePasswordPageContent({
  entityId,
  onFetchEntity,
  onChangePassword,
  onUnauthorized,
  isAuthenticated,
  breadcrumbItems,
  backUrl,
  successRedirectUrl,
  pageTitle = "Change Password",
  getEntityName,
  getBadges,
  minPasswordLength = 8,
}) {
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    bgPage: getThemeClasses('bg-page') || 'bg-gray-50',
    borderMedium: getThemeClasses('border-medium') || 'border-gray-200',
    bgMuted: getThemeClasses('bg-muted') || 'bg-gray-50',
    textMuted: getThemeClasses('text-muted') || 'text-gray-600',
  }), [getThemeClasses]);

  // Component state
  const [entity, setEntity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");

  // Fetch entity details
  useEffect(() => {
    const fetchEntity = async () => {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      if (!entityId) {
        setErrors({ general: "Entity ID is required" });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrors({});

        const entityData = await onFetchEntity(
          entityId,
          onUnauthorized,
          true, // forceRefresh
        );

        setEntity(entityData);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch entity:", error);
        }
        setErrors({ general: error.message || "Failed to load information" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEntity();
  }, [entityId, onFetchEntity, isAuthenticated, navigate, onUnauthorized]);

  // Handle form validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < minPasswordLength) {
      newErrors.password = `Password must be at least ${minPasswordLength} characters long`;
    }

    if (!passwordRepeated.trim()) {
      newErrors.passwordRepeated = "Password confirmation is required";
    } else if (password !== passwordRepeated) {
      newErrors.passwordRepeated = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [password, passwordRepeated, minPasswordLength]);

  // Handle password change
  const handleChangePassword = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setErrors({});

      const passwordData = {
        password: password,
        password_repeated: passwordRepeated,
      };

      await onChangePassword(passwordData, onUnauthorized);

      // Success
      setSuccessMessage("Password changed successfully");
      setShowConfirmModal(false);

      // Clear form
      setPassword("");
      setPasswordRepeated("");

      // Show success message briefly then redirect
      setTimeout(() => {
        navigate(successRedirectUrl);
      }, 2000);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to change password:", error);
      }
      setErrors({ general: error.message || "Failed to change password" });
      setShowConfirmModal(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [password, passwordRepeated, onChangePassword, onUnauthorized, navigate, successRedirectUrl]);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();

    if (validateForm()) {
      setShowConfirmModal(true);
    }
  }, [validateForm]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    if (!isSubmitting) {
      setShowConfirmModal(false);
    }
  }, [isSubmitting]);

  // Memoize error message to prevent re-creating on every render
  const errorMessage = useMemo(() => {
    if (Object.keys(errors).length === 0) return null;
    return Object.entries(errors)
      .map(([field, message]) => (field === "general" ? message : `${field}: ${message}`))
      .join(", ");
  }, [errors]);

  return (
      <div
        className={`min-h-dvh ${themeClasses.bgPage}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehaviorY: 'contain',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          {breadcrumbItems && <Breadcrumb items={breadcrumbItems} className="mb-6" />}

          {/* Loading state */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loading message="Loading information..." />
            </div>
          )}

          {/* Error state */}
          {!entity && !isLoading && (
            <div className="space-y-6">
              <Alert type="error" message={errors.general || "Entity not found"} />
              <Button
                variant="outline"
                onClick={() => navigate(backUrl)}
                icon={ArrowLeftIcon}
              >
                Go Back
              </Button>
            </div>
          )}

          {/* Main content */}
          {entity && !isLoading && (
            <>
              {/* Page Header */}
              <div className="mb-8">
                <PageHeader
                  title={pageTitle}
                  subtitle={getEntityName(entity)}
                  icon={KeyIcon}
                >
                  {getBadges && (
                    <div className="flex items-center gap-2">
                      {getBadges(entity)}
                    </div>
                  )}
                </PageHeader>
              </div>

              {/* Success message */}
              {successMessage && (
                <Alert
                  type="success"
                  message={successMessage}
                  icon={CheckCircleIcon}
                  className="mb-6"
                />
              )}

              <FormCard
                title={pageTitle}
                icon={LockClosedIcon}
                description="Update the account password"
                maxWidth="4xl"
              >
                {/* Error display */}
                {errorMessage && (
                  <Alert
                    type="error"
                    message={errorMessage}
                    className="mb-6"
                  />
                )}

                {/* Warning message */}
                <Alert
                  type="warning"
                  icon={ExclamationTriangleIcon}
                  className="mb-6"
                >
                  <div className="space-y-2">
                    <p className="font-semibold">Warning</p>
                    <p className="text-sm">
                      You are about to <strong>change the password</strong> for this
                      account. Please make sure you enter it correctly or the user
                      will be locked out of their account.
                    </p>
                  </div>
                </Alert>

                <form onSubmit={handleSubmit}>
                  <FormSection>
                    <FormRow columns={2}>
                      <Input
                        label="Password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(value) => setPassword(value)}
                        placeholder={`Enter new password (minimum ${minPasswordLength} characters)`}
                        icon={LockClosedIcon}
                        error={errors.password}
                        required
                        autoComplete="new-password"
                      />
                      <Input
                        label="Confirm Password"
                        name="passwordRepeated"
                        type="password"
                        value={passwordRepeated}
                        onChange={(value) => setPasswordRepeated(value)}
                        placeholder="Enter password again"
                        icon={LockClosedIcon}
                        error={errors.passwordRepeated}
                        required
                        autoComplete="new-password"
                      />
                    </FormRow>
                  </FormSection>

                  {/* Action buttons */}
                  <div className={`flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t ${themeClasses.borderMedium}`}>
                    <Button
                      type="button"
                      onClick={() => navigate(backUrl)}
                      variant="outline"
                      icon={ArrowLeftIcon}
                      className="flex-1"
                    >
                      Go Back
                    </Button>
                    <Button
                      type="submit"
                      variant="danger"
                      disabled={isSubmitting}
                      loading={isSubmitting}
                      className="flex-1"
                    >
                      Confirm and Submit
                    </Button>
                  </div>
                </form>
              </FormCard>

              {/* Confirmation Modal */}
              <Modal
                isOpen={showConfirmModal}
                onClose={handleModalClose}
                title="Confirm Password Change"
                icon={ExclamationTriangleIcon}
                iconColor="warning"
              >
                <div className="space-y-4">
                  <p className="text-base">
                    Are you sure you want to <strong>change the password</strong> for
                    this account?
                  </p>

                  <div className={`${themeClasses.bgMuted} rounded-lg p-4`}>
                    <p className="font-semibold text-sm">
                      {getEntityName(entity)}
                    </p>
                  </div>

                  <p className={`text-sm ${themeClasses.textMuted}`}>
                    Make sure the user can access their account with the new
                    password.
                  </p>

                  {/* Show any errors in the modal */}
                  {errors.general && (
                    <Alert type="error" message={errors.general} />
                  )}
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleModalClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleChangePassword}
                    disabled={isSubmitting}
                    loading={isSubmitting}
                  >
                    Change Password
                  </Button>
                </div>
              </Modal>
            </>
          )}
        </div>
      </div>
  );
}

/**
 * Reusable Change Password Page Component
 *
 * @param {Object} props
 * @param {string} props.entityId - The ID of the entity (customer, user, etc.)
 * @param {Function} props.onFetchEntity - Async function to fetch entity details (entityId, onUnauthorized, forceRefresh) => Promise<entity>
 * @param {Function} props.onChangePassword - Async function to change password (passwordData, onUnauthorized) => Promise<void>
 * @param {Function} props.onUnauthorized - Callback when unauthorized
 * @param {Function} props.isAuthenticated - Function to check if user is authenticated
 * @param {Array} props.breadcrumbItems - Array of breadcrumb items
 * @param {string} props.backUrl - URL to navigate back to
 * @param {string} props.successRedirectUrl - URL to redirect after successful password change
 * @param {string} props.pageTitle - Page title (default: "Change Password")
 * @param {Function} props.getEntityName - Function to get entity display name from entity object
 * @param {Function} props.getBadges - Function to get badge components from entity object (optional)
 * @param {number} props.minPasswordLength - Minimum password length (default: 8)
 */
function ChangePasswordPage(props) {
  return (
    <UIXThemeProvider>
      <ChangePasswordPageContent {...props} />
    </UIXThemeProvider>
  );
}

export default ChangePasswordPage;
