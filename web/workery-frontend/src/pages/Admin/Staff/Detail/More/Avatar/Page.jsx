// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/More/Avatar/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChevronLeftIcon,
  CameraIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  Cog6ToothIcon,
  EllipsisHorizontalIcon,
  BriefcaseIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager } from "../../../../../../services/Services";

function AdminStaffDetailMoreAvatarPage() {
  // URL Parameters
  const { aid } = useParams();

  // Navigation
  const navigate = useNavigate();

  // Services
  const staffManager = useStaffManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

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
  }, [aid]);

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    // Validate file
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
        event.target.value = null; // Reset file input
        return;
      }

      // Check file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        setErrors({
          file: "File is too large. The maximum size is 10 MB.",
        });
        setSelectedFile(null);
        event.target.value = null; // Reset file input
        return;
      }

      // File is valid
      setErrors({});
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedFile) {
      setErrors({ file: "Please select a file to upload" });
      return;
    }

    setErrors({});
    setIsUploading(true);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append("staff_id", aid);
      formData.append("file", selectedFile);

      // Upload avatar
      await staffManager.uploadStaffAvatar(formData, onUnauthorized);

      // Set success message
      setSuccessMessage("Photo has been successfully updated");

      // Navigate back after a short delay
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      setErrors(error);
      setIsUploading(false);
    }
  };

  // Handle file removal
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setErrors({});
    // Reset the file input
    const fileInput = document.getElementById("avatar-file-input");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  // Render loading state
  if (isFetching && !staff) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff details...</p>
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
                to="/admin/staff"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <BriefcaseIcon className="w-4 h-4 mr-2" />
                  Staff
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}/more`}
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
                <CameraIcon className="w-4 h-4 mr-2" />
                Avatar
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
              <BriefcaseIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Staff: {staff?.firstName} {staff?.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <CameraIcon className="w-4 h-4 mr-1" />
              Change Photo
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
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>
              {errors.file ||
                errors.message ||
                errors.detail ||
                "An error occurred. Please try again."}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-700 hover:text-red-900"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center">
            <ArrowUpTrayIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-600" />
            Upload Photo
          </h2>
        </div>

        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-start">
            <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <strong>Warning:</strong> Uploading a new photo will replace the
              existing one. The previous photo cannot be recovered.
            </div>
          </div>

          {/* File Upload Section */}
          <div className="mb-6">
            {selectedFile ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center text-green-700 mb-2">
                      <CheckCircleIcon className="w-5 h-5 mr-2" />
                      <span className="font-medium">File ready to upload</span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <span className="font-medium">File name:</span>{" "}
                        {selectedFile.name}
                      </p>
                      <p>
                        <span className="font-medium">File size:</span>{" "}
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveFile}
                    disabled={isUploading}
                    className={`inline-flex items-center px-3 py-1.5 border rounded-lg text-sm font-medium transition-colors ${
                      isUploading
                        ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                        : "border-red-300 text-red-700 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    <TrashIcon className="w-4 h-4 mr-1" />
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Accepted formats: JPEG, PNG, GIF. Maximum size: 10 MB.
                </p>
              </div>
            )}
          </div>

          {/* Staff Information */}
          {staff && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Current Staff Information
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Name:</span>{" "}
                  <span className="text-gray-900">
                    {staff.firstName} {staff.lastName}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Email:</span>{" "}
                  <span className="text-gray-900">{staff.email}</span>
                </div>
                {staff.avatarObjectUrl && (
                  <div>
                    <span className="font-medium text-gray-700">
                      Current Photo:
                    </span>{" "}
                    <span className="text-gray-900">
                      Photo exists (will be replaced)
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link to={`/admin/staff/${aid}/more`}>
              <button
                disabled={isUploading}
                className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                  isUploading
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
              >
                <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Back to More
              </button>
            </Link>

            <button
              onClick={handleSubmit}
              disabled={!selectedFile || isUploading}
              className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                !selectedFile || isUploading
                  ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "border-green-600 text-white bg-green-600 hover:bg-green-700"
              }`}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Save Photo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStaffDetailMoreAvatarPage;
