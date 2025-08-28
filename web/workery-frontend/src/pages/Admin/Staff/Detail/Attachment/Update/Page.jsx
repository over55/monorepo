// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  PaperClipIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";

function AdminStaffAttachmentUpdatePage() {
  const { aid, atid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const authManager = useAuthManager();

  // State
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    file: null,
  });

  // File input state
  const [selectedFileName, setSelectedFileName] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Fetch attachment details
  useEffect(() => {
    let mounted = true;

    const fetchAttachmentDetail = async () => {
      if (!atid) {
        setAlert({ type: "error", message: "Invalid attachment ID" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const attachmentData = await attachmentManager.getAttachmentDetail(
          atid,
          onUnauthorized,
        );

        if (mounted) {
          setAttachment(attachmentData);
          setFormData({
            title: attachmentData.title || "",
            description: attachmentData.description || "",
            file: null,
          });
          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch attachment details:", error);
          setAlert({
            type: "error",
            message: "Failed to load attachment details. Please try again.",
          });
          setIsLoading(false);
        }
      }
    };

    fetchAttachmentDetail();

    return () => {
      mounted = false;
    };
  }, [atid, attachmentManager, navigate]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field error when user types
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
      setSelectedFileName(file.name);

      // Clear file error
      if (errors.file) {
        setErrors((prev) => ({
          ...prev,
          file: undefined,
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length > 255) {
      newErrors.title = "Title must be less than 255 characters";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Description must be less than 1000 characters";
    }

    // Validate file if provided
    if (formData.file) {
      const maxFileSize = 50 * 1024 * 1024; // 50MB
      if (formData.file.size > maxFileSize) {
        newErrors.file = `File size must be less than 50MB`;
      }

      // Check file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "text/csv",
      ];

      if (!allowedTypes.includes(formData.file.type)) {
        newErrors.file = "File type not allowed";
      }
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous alerts
    setAlert(null);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below",
      });
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setUploadProgress(0);

    try {
      // Prepare update data
      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
      };

      // Add file if user selected a new one
      if (formData.file) {
        updateData.file = formData.file;
      }

      // Update attachment
      const updatedAttachment = await attachmentManager.updateAttachment(
        atid,
        updateData,
        onUnauthorized,
        formData.file ? (progress) => setUploadProgress(progress) : null,
      );

      setAlert({
        type: "success",
        message: "Attachment updated successfully!",
      });

      // Redirect back to attachments list after a short delay
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/attachments`);
      }, 1500);
    } catch (error) {
      console.error("Failed to update attachment:", error);

      // Handle errors
      if (error && typeof error === "object") {
        // Field-specific errors
        const hasFieldErrors = Object.keys(error).some(
          (key) => key !== "message" && key !== "general",
        );

        if (hasFieldErrors) {
          setErrors(error);
          setAlert({
            type: "error",
            message:
              error.general ||
              error.message ||
              "Please correct the errors below",
          });
        } else {
          setAlert({
            type: "error",
            message:
              error.message || "Failed to update attachment. Please try again.",
          });
        }
      } else {
        setAlert({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
      setUploadProgress(0);
    }
  };

  // Check authentication before rendering
  if (!authManager.isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading attachment details...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!attachment) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Attachment not found</p>
          <Link
            to={`/admin/staff/${aid}/attachments`}
            className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Attachments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
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
                <UserGroupIcon className="w-4 h-4 inline mr-2" />
                Staff
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
                Detail
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}/attachments`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <PaperClipIcon className="w-4 h-4 inline mr-2" />
                Attachments
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">
                <PencilSquareIcon className="w-4 h-4 inline mr-2" />
                Update
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Update Attachment</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update the attachment information and optionally replace the file
        </p>
      </div>

      {/* Alert Messages */}
      {alert && (
        <div
          className={`mb-6 rounded-lg px-4 py-3 ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {alert.type === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{alert.message}</span>
          </div>
        </div>
      )}

      {/* Current File Info */}
      <div className="mb-6 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Current File</h3>
        <div className="flex items-center text-sm text-gray-600">
          <DocumentIcon className="w-5 h-5 mr-2" />
          <span className="font-medium">
            {attachment.filename || "Unknown file"}
          </span>
          {attachment.fileType && (
            <span className="ml-2 text-gray-500">({attachment.fileType})</span>
          )}
        </div>
        {attachment.createdAt && (
          <p className="text-xs text-gray-500 mt-1">
            Uploaded on {formatDateForDisplay(attachment.createdAt)}
          </p>
        )}
      </div>

      {/* Update Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-sm rounded-lg p-6"
      >
        <div className="space-y-6">
          {/* Title Field */}
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.title
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } sm:text-sm`}
              maxLength={255}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                errors.description
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              } sm:text-sm`}
              maxLength={1000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Replace File Field (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Replace File (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload a new file</span>
                    <input
                      id="file"
                      name="file"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, PDF, DOC, XLS up to 50MB
                </p>
                {selectedFileName && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-900">
                      Selected: {selectedFileName}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, file: null }));
                        setSelectedFileName("");
                      }}
                      className="mt-1 text-sm text-red-600 hover:text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>
            {errors.file && (
              <p className="mt-1 text-sm text-red-600">{errors.file}</p>
            )}
          </div>

          {/* Upload Progress */}
          {isSaving && formData.file && uploadProgress > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-between">
          <Link
            to={`/admin/staff/${aid}/attachments`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Cancel
          </Link>

          <button
            type="submit"
            disabled={isSaving}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              isSaving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            }`}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {formData.file ? "Uploading..." : "Saving..."}
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Update Attachment
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminStaffAttachmentUpdatePage;
