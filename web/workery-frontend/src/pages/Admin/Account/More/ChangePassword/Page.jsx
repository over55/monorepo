// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/More/ChangePassword/Page.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ArrowLeftIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { useAccountManager } from "../../../../../services/Services";
import {
  Card,
  Button,
  Input,
  Alert,
  FormSection,
  Loading,
} from "../../../../../components/UI";

/**
 * Change Password Page Component
 * Allows users to change their account password
 */
function AdminChangePasswordPage() {
  const navigate = useNavigate();
  const accountManager = useAccountManager();

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

  // Handle input changes
  const handleInputChange = (e) => {
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
  };

  // Validate form data
  const validateForm = () => {
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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
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
  };

  // Handle unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Password strength indicator
  const getPasswordStrength = (password) => {
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
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  if (isLoading && !showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading size="lg" text="Changing password..." />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li>
            <Link
              to="/admin/dashboard"
              className="text-gray-700 hover:text-blue-600 inline-flex items-center"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/account"
                className="text-gray-700 hover:text-blue-600"
              >
                My Profile
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/account/more"
                className="text-gray-700 hover:text-blue-600"
              >
                More
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500">Change Password</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <Link
          to="/admin/account/more"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to More Options
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <KeyIcon className="h-7 w-7 mr-3 text-blue-600" />
          Change Password
        </h1>
        <p className="text-gray-600 mt-2">
          Update your account password. Make sure to use a strong password that
          you don't use elsewhere.
        </p>
      </div>

      {/* Success Alert */}
      {showSuccess && (
        <Alert type="success" className="mb-6">
          <div className="flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            Password changed successfully! Redirecting to your profile...
          </div>
        </Alert>
      )}

      {/* Error Alert */}
      {errors.general && (
        <Alert type="error" className="mb-6">
          {errors.general}
        </Alert>
      )}

      {/* Change Password Form */}
      <Card className="mb-6">
        <form onSubmit={handleSubmit}>
          <FormSection
            title="Password Requirements"
            description="Your password must be at least 8 characters long and contain uppercase, lowercase, numbers, and special characters."
          >
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
                      className={`text-xs font-medium text-${passwordStrength.color}-600`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 bg-${passwordStrength.color}-500`}
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
          </FormSection>

          {/* Form Actions */}
          <div className="flex justify-between pt-6 border-t">
            <Link
              to="/admin/account/more"
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? "Changing Password..." : "Change Password"}
            </Button>
          </div>
        </form>
      </Card>

      {/* Security Tips */}
      <Card>
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
      </Card>
    </div>
  );
}

export default AdminChangePasswordPage;
