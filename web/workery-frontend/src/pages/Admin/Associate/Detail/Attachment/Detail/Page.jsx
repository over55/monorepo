// File Path: web/workery-frontend/src/pages/Admin/Associate/Detail/Attachment/Detail/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  CalendarIcon,
  UserCircleIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useAssociateManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { formatDateForDisplay } from "../../../../../../services/Helpers/DateFormatter";

function AdminAssociateDetailAttachmentDetailPage() {
  const { aid, atid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [associate, setAssociate] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

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

    if (atid && aid) {
      fetchData();
    }
    window.scrollTo(0, 0);
  }, [atid, aid]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setErrors({});

      // Fetch both associate and attachment details
      const [associateData, attachmentData] = await Promise.all([
        associateManager.getAssociateDetail(aid, onUnauthorized),
        attachmentManager.getAttachmentDetail(atid, onUnauthorized),
      ]);

      setAssociate(associateData);
      setAttachment(attachmentData);

      // Verify the attachment belongs to this associate
      if (
        attachmentData.associateId !== aid &&
        attachmentData.ownershipId !== aid
      ) {
        setErrors({
          general: "This attachment does not belong to the selected associate",
        });
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrors({ general: "Failed to load attachment details" });
    } finally {
      setFetching(false);
    }
  };

  // Delete handlers
  const onSelectAttachmentForDeletion = () => {
    setShowDeleteModal(true);
  };

  const onDeleteConfirmButtonClick = async () => {
    try {
      setFetching(true);
      setShowDeleteModal(false);

      await attachmentManager.deleteAttachment(atid, onUnauthorized);

      setAlertMessage("Attachment deleted successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/associate/${aid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to delete attachment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
    }
  };

  // Download handler - FIXED to use presigned URL
  const onDownloadClick = async () => {
    try {
      // Check if we have the attachment data with the presigned URL
      if (!attachment) {
        setAlertMessage("Attachment data not loaded");
        setAlertStatus("error");
        return;
      }

      // Use the presigned URL from the attachment object
      if (attachment.objectUrl || attachment.objectURL) {
        const downloadUrl = attachment.objectUrl || attachment.objectURL;

        // Method 1: Create a temporary anchor element to trigger download
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download =
          attachment.filename || attachment.fileName || "download";
        link.target = "_blank"; // Open in new tab to avoid navigation issues
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Alternative Method 2: Open in new window (if Method 1 doesn't work)
        // window.open(downloadUrl, '_blank');
      } else {
        // If no presigned URL, we need to refresh the attachment data
        console.log("No presigned URL found, refreshing attachment data...");
        await fetchAttachmentDetail(atid);

        // After refresh, try again
        if (attachment && (attachment.objectUrl || attachment.objectURL)) {
          const downloadUrl = attachment.objectUrl || attachment.objectURL;
          const link = document.createElement("a");
          link.href = downloadUrl;
          link.download =
            attachment.filename || attachment.fileName || "download";
          link.target = "_blank";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          setAlertMessage("Unable to get download URL for attachment");
          setAlertStatus("error");
        }
      }
    } catch (error) {
      console.error("Failed to download attachment:", error);
      setAlertMessage("Failed to download attachment");
      setAlertStatus("error");
    }
  };

  const fetchAttachmentDetail = async (attachmentId) => {
    try {
      const response = await attachmentManager.getAttachmentDetail(
        attachmentId,
        onUnauthorized,
      );
      setAttachment(response);
      return response;
    } catch (error) {
      console.error("Failed to fetch attachment detail:", error);
      throw error;
    }
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
    if (!fileType) return <DocumentIcon className="w-8 h-8 text-gray-400" />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return <DocumentTextIcon className="w-8 h-8 text-red-500" />;
    } else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    ) {
      return <DocumentIcon className="w-8 h-8 text-blue-500" />;
    } else {
      return <DocumentIcon className="w-8 h-8 text-gray-400" />;
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
                to={`/admin/associate/${aid}/attachments`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <PaperClipIcon className="w-4 h-4 mr-2" />
                  Attachments
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500">
                <DocumentTextIcon className="w-4 h-4 inline mr-2" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
          Associate - Attachment Detail
        </h1>
        <p className="mt-1 text-sm text-gray-600 flex items-center">
          <InformationCircleIcon className="w-4 h-4 mr-1" />
          View and manage attachment information
        </p>
      </div>

      {/* Alert Messages */}
      {alertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between ${
            alertStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center">
            {alertStatus === "success" ? (
              <CheckCircleIcon className="w-5 h-5 mr-2" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            )}
            <span>{alertMessage}</span>
          </div>
          <button
            onClick={() => {
              setAlertMessage("");
              setAlertStatus("");
            }}
            className="ml-4 hover:bg-white hover:bg-opacity-20 rounded p-1"
          >
            <span className="text-xl">&times;</span>
          </button>
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

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-6 h-6 mr-2 text-blue-600" />
              Attachment Information
            </h2>
            {attachment && (
              <div className="flex gap-2">
                <Link to={`/admin/associate/${aid}/attachment/${atid}/edit`}>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                </Link>
                <button
                  onClick={onSelectAttachmentForDeletion}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {attachment ? (
          <div className="p-6">
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

                  {attachment.updatedAt && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Last Updated
                      </label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <CalendarIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {formatDateForDisplay(attachment.updatedAt)}
                      </p>
                    </div>
                  )}

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

                  {/* Download Button */}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">
                      File
                    </label>
                    <button
                      onClick={onDownloadClick}
                      className="mt-1 inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                      Download{" "}
                      {attachment.filename || attachment.fileName || "File"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Associate Information */}
            {associate && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <UserGroupIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Associate Information
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Name
                      </label>
                      <p className="text-sm text-gray-900">{associate.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Email
                      </label>
                      <p className="text-sm text-gray-900">{associate.email}</p>
                    </div>
                    {associate.phone && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Phone
                        </label>
                        <p className="text-sm text-gray-900">
                          {associate.phone}
                        </p>
                      </div>
                    )}
                    {associate.typeOf && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Type
                        </label>
                        <p className="text-sm text-gray-900">
                          {associate.typeOf === 1
                            ? "Residential"
                            : "Commercial"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Debug info - remove in production */}
            {process.env.NODE_ENV === "development" && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                <strong className="text-sm">Debug Info:</strong>
                <div className="mt-2 text-xs text-gray-600">
                  Presigned URL Available:{" "}
                  {attachment.objectUrl || attachment.objectURL ? "Yes" : "No"}
                  {(attachment.objectUrl || attachment.objectURL) && (
                    <div className="mt-1 break-all">
                      URL:{" "}
                      {(attachment.objectUrl || attachment.objectURL).substring(
                        0,
                        100,
                      )}
                      ...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 flex justify-between items-center pt-6 border-t border-gray-200">
              <Link to={`/admin/associate/${aid}/attachments`}>
                <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Attachments
                </button>
              </Link>
              <Link to={`/admin/associate/${aid}/attachment/${atid}/edit`}>
                <button className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="text-center py-12">
              <ExclamationCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attachment data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteModal(false)}
            ></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationCircleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Are you sure?
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You are about to <strong>permanently delete</strong>{" "}
                        this attachment. This action cannot be undone. Are you
                        sure you would like to continue?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={onDeleteConfirmButtonClick}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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

export default AdminAssociateDetailAttachmentDetailPage;
