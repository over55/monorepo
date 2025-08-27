import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  XMarkIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useStaffManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";

function AdminStaffDetailAttachmentDeletePage() {
  const { aid, atid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const staffManager = useStaffManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isDeleting, setDeleting] = useState(false);
  const [staff, setStaff] = useState(null);
  const [attachment, setAttachment] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  // Constants
  const CONFIRM_PHRASE = "permanently delete";

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch data on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (aid && atid) {
      fetchData();
      window.scrollTo(0, 0);
    }
  }, [aid, atid]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setErrors({});

      // Fetch staff details
      const staffData = await staffManager.getStaffDetail(aid, onUnauthorized);
      setStaff(staffData);

      // Fetch attachment details
      const attachmentData = await attachmentManager.getAttachmentDetail(
        atid,
        onUnauthorized,
      );
      setAttachment(attachmentData);

      // Verify the attachment belongs to this staff
      if (
        attachmentData.staffId !== aid &&
        attachmentData.ownershipId !== aid
      ) {
        setErrors({
          general: "This attachment does not belong to the selected staff",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrors({ general: "Failed to load attachment details" });
    } finally {
      setFetching(false);
    }
  };

  const handleConfirmTextChange = (e) => {
    const text = e.target.value;
    setConfirmText(text);
    setIsConfirmed(text.toLowerCase() === CONFIRM_PHRASE);
  };

  const handleDelete = async () => {
    if (!isConfirmed) {
      setErrors({
        confirmText: `Please type "${CONFIRM_PHRASE}" to confirm deletion`,
      });
      return;
    }

    try {
      setDeleting(true);
      setErrors({});

      // Call delete API
      await attachmentManager.deleteAttachment(atid, onUnauthorized);

      // Show success message
      setAlertMessage("Attachment deleted successfully");
      setAlertType("success");

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/staff/${aid}/attachments`);
      }, 1500);
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setDeleting(false);

      if (error.message) {
        setErrors({ general: error.message });
      } else if (typeof error === "object" && error !== null) {
        setErrors(error);
      } else {
        setErrors({
          general: "Failed to delete attachment. Please try again.",
        });
      }

      setAlertMessage("Failed to delete attachment");
      setAlertType("error");
    }
  };

  const handleCancel = () => {
    navigate(`/admin/staff/${aid}/attachment/${atid}`);
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Get file type icon
  const getFileTypeIcon = (fileType) => {
    if (!fileType)
      return <DocumentTextIcon className="w-8 h-8 text-gray-400" />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return <DocumentTextIcon className="w-8 h-8 text-red-500" />;
    } else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    ) {
      return <DocumentTextIcon className="w-8 h-8 text-blue-500" />;
    } else {
      return <DocumentTextIcon className="w-8 h-8 text-gray-400" />;
    }
  };

  if (!authManager.isAuthenticated()) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isFetching && !attachment) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attachment details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                to="/admin/staffs"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Staffs
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
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
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
                <span className="inline-flex items-center">
                  <PaperClipIcon className="w-4 h-4 mr-2" />
                  Attachments
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}/attachment/${atid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Detail
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">Delete</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <TrashIcon className="w-8 h-8 mr-3 text-red-600" />
          Delete Attachment
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
          Permanently remove this attachment from the system
        </p>
      </div>

      {/* Success/Error Alerts */}
      {alertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center ${
            alertType === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          {alertType === "success" ? (
            <CheckCircleIcon className="w-5 h-5 mr-2" />
          ) : (
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
          )}
          <span>{alertMessage}</span>
        </div>
      )}

      {/* Error Display */}
      {errors.general && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            <span>{errors.general}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Warning Section */}
        <div className="bg-red-50 border-b border-red-200 px-6 py-4">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600 mt-1 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-red-900">
                Warning: This action cannot be undone
              </h2>
              <p className="mt-1 text-sm text-red-700">
                You are about to permanently delete this attachment. The file
                and all associated metadata will be removed from the system and
                cannot be recovered.
              </p>
            </div>
          </div>
        </div>

        {/* Attachment Details */}
        {attachment && (
          <div className="px-6 py-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
              Attachment Details
            </h3>

            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-6">
                {/* File Icon */}
                <div className="flex-shrink-0">
                  {getFileTypeIcon(attachment.fileType || attachment.filetype)}
                </div>

                {/* File Information */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Title
                    </label>
                    <p className="text-sm text-gray-900">
                      {attachment.title || "Untitled"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      File Name
                    </label>
                    <p className="text-sm text-gray-900">
                      {attachment.filename || attachment.fileName || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      File Type
                    </label>
                    <p className="text-sm text-gray-900">
                      {attachment.fileType || attachment.filetype || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      File Size
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatFileSize(attachment.fileSize)}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Uploaded By
                    </label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <UserCircleIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {attachment.createdByUserName || "Unknown"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Upload Date
                    </label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                      {formatDateForDisplay(attachment.createdAt)}
                    </p>
                  </div>

                  {attachment.description && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">
                        Description
                      </label>
                      <p className="text-sm text-gray-900">
                        {attachment.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Staff Information */}
            {staff && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Staff Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-sm text-gray-900">{staff.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">{staff.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Section */}
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Deletion
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                To confirm this action, please type{" "}
                <span className="font-semibold text-gray-900">
                  "{CONFIRM_PHRASE}"
                </span>{" "}
                in the field below:
              </p>

              <div className="max-w-md">
                <input
                  type="text"
                  value={confirmText}
                  onChange={handleConfirmTextChange}
                  placeholder={`Type "${CONFIRM_PHRASE}" to confirm`}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.confirmText
                      ? "border-red-300 focus:ring-red-500"
                      : isConfirmed
                        ? "border-green-300 focus:ring-green-500"
                        : "border-gray-300 focus:ring-blue-500"
                  }`}
                  disabled={isDeleting}
                />
                {errors.confirmText && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmText}
                  </p>
                )}
                {isConfirmed && !errors.confirmText && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <CheckCircleIcon className="w-4 h-4 mr-1" />
                    Deletion confirmed
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                disabled={isDeleting}
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XMarkIcon className="w-5 h-5 mr-2" />
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={!isConfirmed || isDeleting}
                className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                  !isConfirmed || isDeleting
                    ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                    : "border-transparent text-white bg-red-600 hover:bg-red-700"
                }`}
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <TrashIcon className="w-5 h-5 mr-2" />
                    Delete Attachment
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStaffDetailAttachmentDeletePage;
