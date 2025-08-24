// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/More/ChangePassword/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  KeyIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  LockClosedIcon,
  ArchiveBoxIcon,
  Cog6ToothIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { useAssociateManager } from "../../../../../../services/Services";
import axios from "axios";

function AdminAssociateDetailMoreChangePasswordPage() {
  // URL Parameters
  const { aid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const associateManager = useAssociateManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [associate, setAssociate] = useState(null);
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [modalJustOpened, setModalJustOpened] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load associate details
  useEffect(() => {
    let mounted = true;

    const fetchAssociate = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await associateManager.getAssociateDetail(
          aid,
          onUnauthorized,
        );
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
  }, [aid]);

  // Validate form
  const validateForm = () => {
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
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Don't proceed if already submitting
    if (isSubmitting) {
      return;
    }

    // Validate the form
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Prepare password data
      const passwordData = {
        associate_id: aid,
        password: password,
        password_repeated: passwordRepeated,
      };

      // Get access token - try common keys
      let accessToken =
        localStorage.getItem("WORKERY_ACCESS_TOKEN") ||
        localStorage.getItem("WORKERY_TENANT_ACCESS_TOKEN") ||
        localStorage.getItem("access_token") ||
        localStorage.getItem("accessToken");

      if (!accessToken) {
        // Try to find any key containing 'token'
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

      // Build the API URL
      const apiBaseUrl =
        process.env.NODE_ENV === "development"
          ? "http://127.0.0.1:8000"
          : window.location.origin;

      const endpoint = "/api/v1/associates/operations/change-password";
      const fullUrl = `${apiBaseUrl}${endpoint}`;

      // Make the API call
      const response = await axios.post(fullUrl, passwordData, {
        headers: {
          Authorization: `JWT ${accessToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      // Close modal after successful submission
      setShowConfirmModal(false);

      // Set success message
      setSuccessMessage("Password has been successfully changed");

      // Clear form
      setPassword("");
      setPasswordRepeated("");

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Password change failed:", error);

      // Handle different error types
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

      // Set error to display in modal
      setErrors({ message: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle confirm button click
  const handleConfirmClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (validateForm()) {
      setModalJustOpened(true);
      setShowConfirmModal(true);
      // Clear the flag after a short delay
      setTimeout(() => {
        setModalJustOpened(false);
      }, 500);
    }
  };

  // Handle modal background click
  const handleBackgroundClick = (e) => {
    // Don't close if modal just opened or if submitting
    if (modalJustOpened || isSubmitting) {
      return;
    }
    setShowConfirmModal(false);
  };

  // Handle modal cancel
  const handleModalCancel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isSubmitting) {
      setShowConfirmModal(false);
    }
  };

  // Render loading state
  if (isFetching && !associate) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/associates"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Associates
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/associate/${aid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Detail
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/associate/${aid}/more`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  More
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <KeyIcon className="w-4 h-4 mr-2" />
                Change Password
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Associate: {associate?.firstName} {associate?.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <KeyIcon className="w-4 h-4 mr-1" />
              Change password for this associate
            </p>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Messages */}
      {errors &&
        Object.keys(errors).length > 0 &&
        !errors.password &&
        !errors.passwordRepeated && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            {errors.message ||
              errors.detail ||
              "An error occurred. Please try again."}
          </div>
        )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <LockClosedIcon className="w-5 h-5 mr-2 text-blue-600" />
            Change Password
          </h2>
        </div>

        <div className="px-4 sm:px-6 py-5">
          {/* Status Banner */}
          {associate?.status === 2 && (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
              <ArchiveBoxIcon className="w-5 h-5 mr-2" />
              This associate is archived
            </div>
          )}

          {/* Warning Message */}
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold mb-2">Warning</h4>
                <p className="text-sm">
                  You are about to <strong>change the password</strong> for this
                  associate. Please make sure you enter it correctly or else the
                  associate will be locked out of their account and will require
                  password resetting.
                </p>
                <p className="text-sm mt-2">
                  <strong>Note:</strong> The associate will need to use this new
                  password on their next login.
                </p>
              </div>
            </div>
          </div>

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
                  <span className="text-gray-900">
                    {associate.firstName} {associate.lastName}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-24">Email:</span>
                  <span className="text-gray-900">{associate.email}</span>
                </div>
                <div className="flex">
                  <span className="font-medium text-gray-600 w-24">
                    Status:
                  </span>
                  <span>
                    {associate.status === 1 ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : associate.status === 2 ? (
                      <span className="text-amber-600 font-medium">
                        Archived
                      </span>
                    ) : (
                      <span className="text-gray-500">Unknown</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Password Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors({ ...errors, password: undefined });
                  }
                }}
                className={`block w-full px-3 py-2 border ${
                  errors.password ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Enter new password"
                disabled={isSubmitting}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="passwordRepeated"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                id="passwordRepeated"
                value={passwordRepeated}
                onChange={(e) => {
                  setPasswordRepeated(e.target.value);
                  if (errors.passwordRepeated) {
                    setErrors({ ...errors, passwordRepeated: undefined });
                  }
                }}
                className={`block w-full px-3 py-2 border ${
                  errors.passwordRepeated ? "border-red-300" : "border-gray-300"
                } rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Enter new password again"
                disabled={isSubmitting}
              />
              {errors.passwordRepeated && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.passwordRepeated}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm font-medium text-blue-900 mb-2">
                Password Requirements:
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-5 list-disc">
                <li>Minimum 8 characters long</li>
                <li>Both password fields must match</li>
                <li>
                  Consider using a mix of letters, numbers, and symbols for
                  better security
                </li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
            <Link to={`/admin/associate/${aid}/more`}>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleConfirmClick(e);
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !password || !passwordRepeated}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 mr-2" />
                  Confirm and Submit
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleBackgroundClick}
              aria-hidden="true"
            />

            {/* Modal panel */}
            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Confirm Password Change
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to change the password for:
                      </p>
                      <p className="font-semibold text-gray-900 my-2">
                        {associate?.firstName} {associate?.lastName} (
                        {associate?.email})
                      </p>

                      <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-sm text-amber-800">
                          <strong>Important:</strong> The associate will need to
                          use the new password immediately. Make sure to
                          securely communicate the new password to them.
                        </p>
                      </div>

                      <p className="mt-3 text-sm text-gray-500">
                        Do you want to proceed with changing the password?
                      </p>

                      {/* Show any errors in the modal */}
                      {errors && (errors.message || errors.detail) && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-sm text-red-700">
                            <strong>Error:</strong>{" "}
                            {errors.message ||
                              errors.detail ||
                              "Failed to change password"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Changing Password...
                    </>
                  ) : (
                    "Yes, Change Password"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleModalCancel}
                  disabled={isSubmitting}
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminAssociateDetailMoreChangePasswordPage;
