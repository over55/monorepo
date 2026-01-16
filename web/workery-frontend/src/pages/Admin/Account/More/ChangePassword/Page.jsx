// File Path: web/workery-frontend/src/pages/Admin/Account/More/ChangePassword/Page.jsx
// @uix-page: AccountChangePasswordPage
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  HomeIcon,
  UserCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useAccountManager } from "../../../../../services/Services";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../components/UIX";

/**
 * Change Password Page Component
 * Allows users to change their account password
 */
function AdminChangePasswordPage() {
  const navigate = useNavigate();
  const accountManager = useAccountManager();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Form state
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI state
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Handle unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Handle input changes
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate old password
    if (!formData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    // Validate new password
    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "New password must be at least 8 characters long";
    } else if (formData.newPassword.length > 128) {
      newErrors.newPassword = "New password must be less than 128 characters";
    } else if (!/(?=.*[a-z])/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = "Password must contain at least one number";
    } else if (!/(?=.*[@$!%*?&])/.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must contain at least one special character";
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Password confirmation is required";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if old and new passwords are the same
    if (
      formData.oldPassword &&
      formData.newPassword &&
      formData.oldPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await accountManager.changePassword(formData, onUnauthorized);

      // Show success message
      setShowSuccess(true);

      // Clear form
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/admin/account");
      }, 2000);
    } catch (error) {
      console.error("Failed to change password:", error);

      // Handle specific error messages from API
      if (error.oldPassword) {
        setErrors({ oldPassword: error.oldPassword });
      } else if (error.newPassword) {
        setErrors({ newPassword: error.newPassword });
      } else if (error.message) {
        setErrors({ general: error.message });
      } else if (typeof error === "string") {
        setErrors({ general: error });
      } else {
        setErrors({
          general:
            "Failed to change password. Please check your current password and try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [validateForm, accountManager, formData, onUnauthorized, navigate]);

  // Password strength indicator
  const getPasswordStrength = useCallback((password) => {
    if (!password) return { strength: 0, label: "" };

    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;

    const labels = [
      "",
      "Very Weak",
      "Weak",
      "Fair",
      "Good",
      "Strong",
      "Very Strong",
    ];
    const colors = ["", "red", "orange", "yellow", "blue", "green", "green"];

    return {
      strength,
      label: labels[strength] || "Very Strong",
      color: colors[strength] || "green",
    };
  }, []);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.newPassword), [formData.newPassword, getPasswordStrength]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: HomeIcon },
    { label: "My Profile", to: "/admin/account", icon: UserCircleIcon },
    { label: "More", to: "/admin/account/more", icon: EllipsisHorizontalIcon },
    { label: "Change Password", icon: KeyIcon, isActive: true },
  ], []);

  if (isLoading && !showSuccess) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-2xl mx-auto border-0 shadow-none">
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Changing password...</p>
          </div>
        </Card>
      </Card>
    );
  }

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-2xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Back Link */}
      <Link
        to="/admin/account/more"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2" />
        Back to More Options
      </Link>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <KeyIcon className={`h-7 w-7 mr-3 ${themeClasses.linkPrimary}`} />
          Change Password
        </h1>
        <p className={`mt-2 ${themeClasses.textSecondary}`}>
          Update your account password. Make sure to use a strong password that
          you don't use elsewhere.
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert type="success" className="mb-6" icon={CheckCircleIcon}>
          Password changed successfully! Redirecting to your profile...
        </Alert>
      )}

      {/* Error Alert */}
      {errors.general && (
        <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
          {errors.general}
        </Alert>
      )}

      {/* Change Password Form */}
      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Password Requirements</h2>
          <p className="text-sm text-gray-600 mt-1">
            Your password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Current Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-3 pr-12
                  border rounded-lg
                  transition-all duration-200
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${
                    errors.oldPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  }
                `}
                placeholder="Enter your current password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOldPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.oldPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.oldPassword}
              </p>
            )}
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-3 pr-12
                  border rounded-lg
                  transition-all duration-200
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${
                    errors.newPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  }
                `}
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.newPassword && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">
                    Password Strength
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      passwordStrength.color === 'red' ? 'text-red-600' :
                      passwordStrength.color === 'orange' ? 'text-orange-600' :
                      passwordStrength.color === 'yellow' ? 'text-yellow-600' :
                      passwordStrength.color === 'blue' ? 'text-blue-600' :
                      'text-green-600'
                    }`}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength.color === 'red' ? 'bg-red-500' :
                      passwordStrength.color === 'orange' ? 'bg-orange-500' :
                      passwordStrength.color === 'yellow' ? 'bg-yellow-500' :
                      passwordStrength.color === 'blue' ? 'bg-blue-500' :
                      'bg-green-500'
                    }`}
                    style={{
                      width: `${(passwordStrength.strength / 6) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {errors.newPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm New Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`
                  w-full px-4 py-3 pr-12
                  border rounded-lg
                  transition-all duration-200
                  placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-offset-1
                  ${
                    errors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/20"
                  }
                `}
                placeholder="Re-enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-600">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t">
            <Link to="/admin/account/more">
              <Button variant="secondary" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Tips */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Security Tips
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Use a unique password that you don't use for other accounts
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Consider using a password manager to generate and store strong
              passwords
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Enable two-factor authentication for additional security
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Change your password regularly, especially if you suspect
              unauthorized access
            </li>
            <li className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              Never share your password with anyone, including support staff
            </li>
          </ul>
        </div>
      </Card>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminChangePasswordPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminChangePasswordPage />
    </UIXThemeProvider>
  );
}

export default AdminChangePasswordPageWithProvider;
