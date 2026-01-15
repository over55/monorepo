// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Avatar/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  InformationCircleIcon,
  CameraIcon,
  CheckCircleIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  BriefcaseIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminStaffDetailMoreAvatarPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [staff, setStaff] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-400",
    textMuted: getThemeClasses("text-muted") || "text-gray-500 dark:text-gray-400",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 dark:text-blue-400",
    bgMuted: getThemeClasses("bg-muted") || "bg-gray-50 dark:bg-gray-800",
    borderMuted: getThemeClasses("border-muted") || "border-gray-200 dark:border-gray-700",
    bgSuccess: getThemeClasses("bg-success") || "bg-green-50 dark:bg-green-900/20",
    borderSuccess: getThemeClasses("border-success") || "border-green-200 dark:border-green-800",
    textSuccess: getThemeClasses("text-success") || "text-green-700 dark:text-green-400",
    inputBg: getThemeClasses("input-bg") || "bg-white dark:bg-gray-800",
    inputBorder: getThemeClasses("input-border") || "border-gray-300 dark:border-gray-600",
    inputText: getThemeClasses("input-text") || "text-gray-900 dark:text-gray-100",
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
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (aid) {
      fetchStaff();
    }

    return () => {
      mounted = false;
    };
  }, [aid, staffManager, onUnauthorized]);

  // Handle file selection
  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];

    if (file) {
      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors({
          file: "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors({
          file: "File is too large. The maximum size is 10 MB.",
        });
        setSelectedFile(null);
        event.target.value = null;
        return;
      }

      setErrors({});
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    setErrors({});
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("staff_id", aid);
      formData.append("file", selectedFile);

      await staffManager.uploadStaffAvatar(formData, onUnauthorized);

      setSuccessMessage("Photo has been successfully updated");

      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setErrors(error);
      setIsUploading(false);
    }
  }, [aid, selectedFile, staffManager, onUnauthorized, navigate]);

  // Handle file removal
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setErrors({});
    const fileInput = document.getElementById("avatar-file-input");
    if (fileInput) {
      fileInput.value = null;
    }
  }, []);

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
      icon: BriefcaseIcon,
    },
    {
      label: "Detail",
      to: `/admin/staff/${aid}`,
      icon: InformationCircleIcon,
    },
    {
      label: "More",
      to: `/admin/staff/${aid}/more`,
      icon: Cog6ToothIcon,
    },
    {
      label: "Avatar",
      icon: CameraIcon,
      isActive: true,
    },
  ], [aid]);

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

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <BriefcaseIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Staff: {staff?.firstName} {staff?.lastName}
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <CameraIcon className="w-4 h-4 mr-1" />
          Change Photo
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
          {errors.file || errors.message || errors.detail || "An error occurred. Please try again."}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Card Header */}
        <div className={`mb-6 pb-4 border-b ${themeClasses.borderMuted}`}>
          <h2 className={`text-xl md:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
            <ArrowUpTrayIcon className={`w-6 h-6 md:w-7 md:h-7 mr-2 ${themeClasses.linkPrimary}`} />
            Upload Photo
          </h2>
        </div>

        {/* Warning Message */}
        <Alert type="warning" className="mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Warning:</strong> Uploading a new photo will replace the existing one.
              The previous photo cannot be recovered.
            </div>
          </div>
        </Alert>

        {/* File Upload Section */}
        <div className="mb-6">
          {selectedFile ? (
            <div className={`${themeClasses.bgSuccess} border ${themeClasses.borderSuccess} rounded-lg p-4`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className={`flex items-center ${themeClasses.textSuccess} mb-2`}>
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    <span className="font-medium">File ready to upload</span>
                  </div>
                  <div className={`text-sm ${themeClasses.textSecondary} space-y-1`}>
                    <p>
                      <span className="font-medium">File name:</span> {selectedFile.name}
                    </p>
                    <p>
                      <span className="font-medium">File size:</span>{" "}
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleRemoveFile}
                  disabled={isUploading}
                  icon={TrashIcon}
                >
                  Remove
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>
                Select Photo File
              </label>
              <div className="relative">
                <input
                  id="avatar-file-input"
                  name="file"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className={`block w-full text-sm ${themeClasses.inputText} border ${themeClasses.inputBorder} rounded-lg cursor-pointer ${themeClasses.inputBg} focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900/70`}
                />
              </div>
              <p className={`mt-2 text-xs ${themeClasses.textMuted}`}>
                Accepted formats: JPEG, PNG, GIF. Maximum size: 10 MB.
              </p>
            </div>
          )}
        </div>

        {/* Staff Information */}
        {staff && (
          <div className={`${themeClasses.bgMuted} rounded-lg p-4 mb-6`}>
            <h3 className={`text-sm font-medium ${themeClasses.textPrimary} mb-3 flex items-center`}>
              <InformationCircleIcon className="w-4 h-4 mr-2" />
              Current Staff Information
            </h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className={`font-medium ${themeClasses.textSecondary}`}>Name:</span>{" "}
                <span className={themeClasses.textPrimary}>{staff.firstName} {staff.lastName}</span>
              </div>
              <div>
                <span className={`font-medium ${themeClasses.textSecondary}`}>Email:</span>{" "}
                <span className={themeClasses.textPrimary}>{staff.email}</span>
              </div>
              {staff.avatarObjectUrl && (
                <div>
                  <span className={`font-medium ${themeClasses.textSecondary}`}>Current Photo:</span>{" "}
                  <span className={themeClasses.textPrimary}>Photo exists (will be replaced)</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t ${themeClasses.borderMuted}`}>
          <Link to={`/admin/staff/${aid}/more`}>
            <Button variant="secondary" disabled={isUploading}>
              Back to More
            </Button>
          </Link>

          <Button
            variant="success"
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            loading={isUploading}
            icon={CheckCircleIcon}
          >
            {isUploading ? "Uploading..." : "Save Photo"}
          </Button>
        </div>
      </Card>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminStaffDetailMoreAvatarPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminStaffDetailMoreAvatarPage />
    </UIXThemeProvider>
  );
}

export default AdminStaffDetailMoreAvatarPageWithProvider;
