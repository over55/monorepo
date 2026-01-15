// File Path: monorepo/web/frontend/src/components/business/views/AccountChangePasswordView.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  UIXThemeProvider,
  useUIXTheme,
  Breadcrumb,
  Avatar,
  Button,
  Alert,
} from "../../UIX";
import { Loading, FormGroup } from "../../UIX";
import {
  UserCircleIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronLeftIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { ACCOUNT_PATHS } from "../../../constants/Account";

function AccountChangePasswordView({
  // User type configuration
  userType, // 'admin', 'customer', 'facilitator', 'jobseeker', 'root'

  // Services
  accountManager,
  authManager,

  // Display configuration
  title,
  subtitle,
  showTabs = true,

  // Validation configuration
  minPasswordLength = 8,
  requireSpecialChar = true,
  requireUpperCase = true,
  requireLowerCase = true,
  requireNumber = true,

  // Custom validation
  customPasswordValidation,

  // Callbacks
  onPasswordChangeSuccess,
  onPasswordChangeError,
  onDataLoad,
  onError,
}) {
  return (
    <UIXThemeProvider>
      <AccountChangePasswordViewContent
        userType={userType}
        accountManager={accountManager}
        authManager={authManager}
        title={title}
        subtitle={subtitle}
        showTabs={showTabs}
        minPasswordLength={minPasswordLength}
        requireSpecialChar={requireSpecialChar}
        requireUpperCase={requireUpperCase}
        requireLowerCase={requireLowerCase}
        requireNumber={requireNumber}
        customPasswordValidation={customPasswordValidation}
        onPasswordChangeSuccess={onPasswordChangeSuccess}
        onPasswordChangeError={onPasswordChangeError}
        onDataLoad={onDataLoad}
        onError={onError}
      />
    </UIXThemeProvider>
  );
}

function AccountChangePasswordViewContent({
  userType,
  accountManager,
  authManager,
  title,
  // eslint-disable-next-line no-unused-vars
  subtitle,
  // eslint-disable-next-line no-unused-vars
  showTabs,
  minPasswordLength,
  requireSpecialChar,
  requireUpperCase,
  requireLowerCase,
  requireNumber,
  customPasswordValidation,
  onPasswordChangeSuccess,
  onPasswordChangeError,
  onDataLoad,
  onError,
}) {
  const { getThemeClasses } = useUIXTheme();
  const navigate = useNavigate();

  // Get paths
  const paths = useMemo(
    () => ACCOUNT_PATHS[userType] || ACCOUNT_PATHS.admin,
    [userType],
  );

  // Component states
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFetching, setFetching] = useState(false);
  const [account, setAccount] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [navigate, authManager]);

  // Fetch account details
  // eslint-disable-next-line no-unused-vars
  const fetchAccountDetails = useCallback(async () => {
    setFetching(true);
    setErrors({});

    try {
      const accountData = await accountManager.getAccountDetail(onUnauthorized);
      setAccount(accountData);

      // Call onDataLoad callback if provided
      if (onDataLoad) {
        onDataLoad(accountData);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to fetch account:", error);
      }
      const errorMessage = error.message || "Failed to load account details";
      setErrors({ general: errorMessage });

      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    } finally {
      setFetching(false);
    }
  }, [accountManager, onUnauthorized, onDataLoad, onError]);

  // Initial load
  useEffect(() => {
    let mounted = true;

    const loadAccountDetails = async () => {
      setFetching(true);
      setErrors({});

      try {
        const accountData =
          await accountManager.getAccountDetail(onUnauthorized);
        if (mounted) {
          setAccount(accountData);

          // Call onDataLoad callback if provided
          if (onDataLoad) {
            onDataLoad(accountData);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to fetch account:", error);
        }
        if (mounted) {
          const errorMessage =
            error.message || "Failed to load account details";
          setErrors({ general: errorMessage });

          // Call onError callback if provided
          if (onError) {
            onError(error);
          }
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    loadAccountDetails();

    return () => {
      mounted = false;
    };
  }, [accountManager, onUnauthorized, onDataLoad, onError]);

  // Clear success message after timeout
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Handle input changes
  const handleInputChange = useCallback(
    (name, value) => {
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
    },
    [errors],
  );

  // Password validation
  const validatePassword = useCallback(
    (password) => {
      const errors = [];

      if (!password) {
        return ["Password is required"];
      }

      if (password.length < minPasswordLength) {
        errors.push(
          `Password must be at least ${minPasswordLength} characters long`,
        );
      }

      if (requireUpperCase && !/[A-Z]/.test(password)) {
        errors.push("Password must contain at least one uppercase letter");
      }

      if (requireLowerCase && !/[a-z]/.test(password)) {
        errors.push("Password must contain at least one lowercase letter");
      }

      if (requireNumber && !/\d/.test(password)) {
        errors.push("Password must contain at least one number");
      }

      if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push("Password must contain at least one special character");
      }

      // Apply custom validation if provided
      if (customPasswordValidation) {
        const customErrors = customPasswordValidation(password);
        if (customErrors && customErrors.length > 0) {
          errors.push(...customErrors);
        }
      }

      return errors;
    },
    [
      minPasswordLength,
      requireUpperCase,
      requireLowerCase,
      requireNumber,
      requireSpecialChar,
      customPasswordValidation,
    ],
  );

  // Validate form data
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Validate old password
    if (!formData.oldPassword) {
      newErrors.oldPassword = "Current password is required";
    }

    // Validate new password
    const passwordErrors = validatePassword(formData.newPassword);
    if (passwordErrors.length > 0) {
      newErrors.newPassword = passwordErrors.join(". ");
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Check if new password is different from old password
    if (
      formData.oldPassword &&
      formData.newPassword &&
      formData.oldPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from current password";
    }

    return newErrors;
  }, [formData, validatePassword]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Clear previous messages
      setErrors({});
      setSuccessMsg("");

      // Validate form
      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setIsProcessing(true);

      try {
        // Call the password change API
        await accountManager.changePassword(
          {
            oldPassword: formData.oldPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
          },
          onUnauthorized,
        );

        // Success
        const successMessage = "Password changed successfully!";
        setSuccessMsg(successMessage);

        // Clear form
        setFormData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });

        // Call success callback if provided
        if (onPasswordChangeSuccess) {
          onPasswordChangeSuccess(formData);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to change password:", error);
        }
        const errorData = error || { general: "Failed to change password" };
        setErrors(errorData);

        // Call error callback if provided
        if (onPasswordChangeError) {
          onPasswordChangeError(error);
        }
      } finally {
        setIsProcessing(false);
      }
    },
    [
      formData,
      validateForm,
      accountManager,
      onUnauthorized,
      onPasswordChangeSuccess,
      onPasswordChangeError,
    ],
  );

  // Tab items configuration
  // eslint-disable-next-line no-unused-vars
  const tabItems = useMemo(
    () => [
      {
        label: "Detail",
        href: paths.detail,
        isActive: false,
        icon: InformationCircleIcon,
      },
      {
        label: "More",
        href: paths.more,
        isActive: true,
        icon: EllipsisHorizontalIcon,
      },
    ],
    [paths],
  );

  // Breadcrumb items
  const breadcrumbItems = useMemo(
    () => [
      {
        label: "Dashboard",
        to: paths.dashboard,
        icon: HomeIcon,
      },
      {
        label: "My Profile",
        to: paths.detail,
        icon: UserCircleIcon,
      },
      {
        label: "More",
        to: paths.more,
        icon: EllipsisHorizontalIcon,
      },
      {
        label: "Change Password",
        icon: KeyIcon,
      },
    ],
    [paths],
  );

  // Password strength indicator
  const getPasswordStrength = useCallback(
    (password) => {
      if (!password) return { strength: 0, label: "", color: "" };

      const errors = validatePassword(password);
      const strength = Math.max(0, 5 - errors.length);

      let label = "";
      let color = "";

      switch (strength) {
        case 0:
        case 1:
          label = "Very Weak";
          color = "text-red-600";
          break;
        case 2:
          label = "Weak";
          color = "text-orange-600";
          break;
        case 3:
          label = "Fair";
          color = "text-yellow-600";
          break;
        case 4:
          label = "Good";
          color = "text-blue-600";
          break;
        case 5:
          label = "Strong";
          color = "text-green-600";
          break;
        default:
          label = "Unknown";
          color = getThemeClasses("text-secondary");
      }

      return { strength, label, color };
    },
    [validatePassword, getThemeClasses],
  );

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.newPassword),
    [formData.newPassword, getPasswordStrength],
  );

  // Loading state
  if (isFetching) {
    return <Loading fullScreen message="Loading account details..." />;
  }

  return (
    <div className={`min-h-screen ${getThemeClasses("page-bg")}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Content */}
        <div className="shadow-sm">
          <div
            className={`rounded-lg ${getThemeClasses("bg-gradient-secondary")}`}
          >
            {/* Header */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center">
                  <KeyIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-white/80 flex-shrink-0" />
                  {title || "Change Password"}
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate(paths.more)}
                    icon={ChevronLeftIcon}
                  >
                    Back to More
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Container */}
            <div
              className={`${getThemeClasses("bg-card")} border-2 border-t-0 rounded-b-lg ${getThemeClasses("card-border")}`}
            >
              <div className="px-4 sm:px-6 py-6">
                {/* Error Messages */}
                {errors.general && (
                  <Alert type="error" className="mb-6">
                    <XCircleIcon className="h-5 w-5" />
                    {errors.general}
                  </Alert>
                )}

                {/* Success Messages */}
                {successMsg && (
                  <Alert type="success" className="mb-6">
                    <CheckCircleIcon className="h-5 w-5" />
                    {successMsg}
                  </Alert>
                )}

                {/* Account Info Header */}
                {account && (
                  <div className={`mb-8 p-4 rounded-lg ${getThemeClasses("bg-disabled")} ${getThemeClasses("border-secondary")} border`}>
                    <div className="flex items-center space-x-4">
                      <Avatar
                        size="lg"
                        name={
                          `${account.firstName || ""} ${account.lastName || ""}`.trim() ||
                          "User"
                        }
                        className="flex-shrink-0"
                      />
                      <div>
                        <h3 className={`text-lg font-semibold ${getThemeClasses("text-primary")}`}>
                          {`${account.firstName || ""} ${account.lastName || ""}`.trim() ||
                            "User"}
                        </h3>
                        <p className={`text-sm ${getThemeClasses("text-secondary")}`}>{account.email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Password Change Form */}
                <div
                  className={`rounded-lg shadow-sm ${getThemeClasses("bg-gradient-secondary")}`}
                >
                  <div className="px-4 sm:px-6 py-3 sm:py-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                      <ShieldCheckIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-white/80 flex-shrink-0" />
                      <span className="truncate">Password Security</span>
                    </h3>
                  </div>
                  <div
                    className={`${getThemeClasses("bg-card")} border-2 border-t-0 rounded-b-lg p-4 sm:p-6 ${getThemeClasses("card-border")}`}
                  >
                    {/* Security Notice */}
                    <Alert type="info" className="mb-6">
                      <InformationCircleIcon className="h-5 w-5" />
                      For your security, please enter your current password to
                      make changes.
                    </Alert>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Current Password */}
                      <FormGroup>
                        <label
                          className={`block text-sm sm:text-base font-semibold mb-3 ${getThemeClasses("text-primary")}`}
                        >
                          Current Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? "text" : "password"}
                            value={formData.oldPassword}
                            onChange={(e) =>
                              handleInputChange("oldPassword", e.target.value)
                            }
                            className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                              errors.oldPassword
                                ? "border-red-500 bg-red-50"
                                : `${getThemeClasses("border-secondary")} ${getThemeClasses("input-border")}`
                            } focus:ring-2 ${getThemeClasses("input-focus-ring")} focus:border-transparent transition-all duration-200`}
                            placeholder="Enter your current password"
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                          >
                            {showOldPassword ? (
                              <EyeSlashIcon className={`h-5 w-5 ${getThemeClasses("text-muted")}`} />
                            ) : (
                              <EyeIcon className={`h-5 w-5 ${getThemeClasses("text-muted")}`} />
                            )}
                          </button>
                        </div>
                        {errors.oldPassword && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.oldPassword}
                          </p>
                        )}
                      </FormGroup>

                      {/* New Password */}
                      <FormGroup>
                        <label
                          className={`block text-sm sm:text-base font-semibold mb-3 ${getThemeClasses("text-primary")}`}
                        >
                          New Password <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={formData.newPassword}
                            onChange={(e) =>
                              handleInputChange("newPassword", e.target.value)
                            }
                            className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                              errors.newPassword
                                ? "border-red-500 bg-red-50"
                                : `${getThemeClasses("border-secondary")} ${getThemeClasses("input-border")}`
                            } focus:ring-2 ${getThemeClasses("input-focus-ring")} focus:border-transparent transition-all duration-200`}
                            placeholder="Enter your new password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? (
                              <EyeSlashIcon className={`h-5 w-5 ${getThemeClasses("text-muted")}`} />
                            ) : (
                              <EyeIcon className={`h-5 w-5 ${getThemeClasses("text-muted")}`} />
                            )}
                          </button>
                        </div>

                        {/* Password Strength Indicator */}
                        {formData.newPassword && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-sm ${getThemeClasses("text-secondary")}`}>
                                Password Strength:
                              </span>
                              <span
                                className={`text-sm font-medium ${passwordStrength.color}`}
                              >
                                {passwordStrength.label}
                              </span>
                            </div>
                            <div className={`w-full ${getThemeClasses("bg-disabled")} rounded-full h-2`}>
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  passwordStrength.strength <= 1
                                    ? "bg-red-500"
                                    : passwordStrength.strength === 2
                                      ? "bg-orange-500"
                                      : passwordStrength.strength === 3
                                        ? "bg-yellow-500"
                                        : passwordStrength.strength === 4
                                          ? "bg-blue-500"
                                          : "bg-green-500"
                                }`}
                                style={{
                                  width: `${(passwordStrength.strength / 5) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {errors.newPassword && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.newPassword}
                          </p>
                        )}

                        {/* Password Requirements */}
                        <div className={`mt-3 text-sm ${getThemeClasses("text-secondary")}`}>
                          <p className="font-medium mb-2">
                            Password must contain:
                          </p>
                          <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>At least {minPasswordLength} characters</li>
                            {requireUpperCase && (
                              <li>At least one uppercase letter</li>
                            )}
                            {requireLowerCase && (
                              <li>At least one lowercase letter</li>
                            )}
                            {requireNumber && <li>At least one number</li>}
                            {requireSpecialChar && (
                              <li>At least one special character</li>
                            )}
                          </ul>
                        </div>
                      </FormGroup>

                      {/* Confirm Password */}
                      <FormGroup>
                        <label
                          className={`block text-sm sm:text-base font-semibold mb-3 ${getThemeClasses("text-primary")}`}
                        >
                          Confirm New Password{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmPassword}
                            onChange={(e) =>
                              handleInputChange(
                                "confirmPassword",
                                e.target.value,
                              )
                            }
                            className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                              errors.confirmPassword
                                ? "border-red-500 bg-red-50"
                                : `${getThemeClasses("border-secondary")} ${getThemeClasses("input-border")}`
                            } focus:ring-2 ${getThemeClasses("input-focus-ring")} focus:border-transparent transition-all duration-200`}
                            placeholder="Confirm your new password"
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          >
                            {showConfirmPassword ? (
                              <EyeSlashIcon className={`h-5 w-5 ${getThemeClasses("text-muted")}`} />
                            ) : (
                              <EyeIcon className={`h-5 w-5 ${getThemeClasses("text-muted")}`} />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-2 text-sm text-red-600">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </FormGroup>

                      {/* Submit Button */}
                      <div className="flex justify-end pt-4">
                        <Button
                          type="submit"
                          variant="success"
                          disabled={isProcessing}
                          className="flex items-center"
                        >
                          {isProcessing ? (
                            <>
                              <svg
                                className="animate-spin h-4 w-4 mr-2"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                  fill="none"
                                />
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                              </svg>
                              Updating Password...
                            </>
                          ) : (
                            <>
                              <KeyIcon className="h-4 w-4 mr-2" />
                              Update Password
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountChangePasswordView;
