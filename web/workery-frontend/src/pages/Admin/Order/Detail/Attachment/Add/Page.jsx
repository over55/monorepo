// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/Add/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  DocumentArrowUpIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { ATTACHMENT_TYPES } from "../../../../../../constants/Attachment";

function AdminOrderDetailAttachmentAddPage() {
  const { oid } = useParams();
  const navigate = useNavigate();
  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [order, setOrder] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchOrderDetail();
    window.scrollTo(0, 0);
  }, [oid]);

  const fetchOrderDetail = async () => {
    try {
      setFetching(true);
      const data = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(data);

      // Log for debugging in development
      if (process.env.NODE_ENV === "development") {
        console.log("Order fetched for attachment upload:", {
          publicId: oid,
          mongoId: data.id,
          wjid: data.wjid,
        });
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setErrors({ general: "Failed to load order details" });
    } finally {
      setFetching(false);
    }
  };

  // Event handlers
  const onHandleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setErrors({}); // Clear any file-related errors
  };

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Starting...");
    setFetching(true);
    setErrors({});
    setUploadProgress(0);

    try {
      // Validate inputs
      if (!title.trim()) {
        setErrors({ title: "Title is required" });
        setFetching(false);
        return;
      }

      if (!description.trim()) {
        setErrors({ description: "Description is required" });
        setFetching(false);
        return;
      }

      if (!selectedFile) {
        setErrors({ file: "File is required" });
        setFetching(false);
        return;
      }

      // Ensure we have the order data with MongoDB ID
      if (!order || !order.id) {
        setErrors({
          general: "Order data is not available. Please refresh the page.",
        });
        setFetching(false);
        return;
      }

      // Prepare metadata with BOTH ownership fields AND orderWjid
      const metadata = {
        // These are the REQUIRED fields for the backend
        ownershipWjid: order.wjid, // Use the MongoDB ObjectID from the order
        ownershipId: order.id,
        ownershipType: ATTACHMENT_TYPES.ORDER, // This is 3

        // Keep orderWjid for backward compatibility
        orderWjid: oid,

        // User-provided fields
        title: title.trim(),
        description: description.trim(),
      };

      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Uploading attachment with metadata:", metadata);
      }

      // Upload attachment with progress callback
      await attachmentManager.uploadAttachment(
        selectedFile,
        metadata,
        (progress) => setUploadProgress(progress),
        onUnauthorized,
      );

      // Show success message
      setAlertMessage("Attachment uploaded successfully");
      setAlertStatus("success");

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/attachments`);
      }, 2000);
    } catch (error) {
      console.error("Failed to upload attachment:", error);
      setErrors(error);
      setAlertMessage("Failed to upload attachment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
      setUploadProgress(0);
    }
  };

  if (!authManager.isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
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
                to="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}/attachments`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Detail (Attachments)
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PlusCircleIcon className="w-4 h-4 mr-2" />
                Add
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Work Order - Add Attachment
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Upload documents and files for this work order
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

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
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <DocumentArrowUpIcon className="w-6 h-6 mr-2 text-blue-600" />
            New Attachment
          </h2>
        </div>

        <div className="p-6">
          {isFetching && !order ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Processing...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {errors.general && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 mr-2" />
                    <span>{errors.general}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-6">
                {/* Title Input */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter attachment title"
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.title
                        ? "border-red-300 text-red-900 placeholder-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.title && (
                    <p className="mt-2 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description TextArea */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter attachment description"
                    rows={4}
                    className={`block w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      errors.description
                        ? "border-red-300 text-red-900 placeholder-red-300"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-2 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div>
                  <label
                    htmlFor="file"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    File <span className="text-red-500">*</span>
                  </label>
                  {selectedFile ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 mr-2" />
                          <span>
                            File ready to upload:{" "}
                            <strong>{selectedFile.name}</strong>
                            <span className="ml-2 text-sm">
                              ({(selectedFile.size / (1024 * 1024)).toFixed(2)}{" "}
                              MB)
                            </span>
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedFile(null)}
                          className="ml-4 text-green-600 hover:text-green-800"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file"
                                type="file"
                                onChange={onHandleFileChange}
                                className="sr-only"
                                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            Any file type up to 10MB
                          </p>
                        </div>
                      </div>
                      {errors.file && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.file}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Upload Progress */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Upload Progress
                      </span>
                      <span className="text-sm font-medium text-blue-600">
                        {uploadProgress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <Link to={`/admin/order/${oid}/attachments`}>
                    <button
                      type="button"
                      className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="w-5 h-5 mr-2" />
                      Back to Attachments
                    </button>
                  </Link>
                  <button
                    type="button"
                    onClick={onSubmitClick}
                    disabled={
                      !title.trim() ||
                      !description.trim() ||
                      !selectedFile ||
                      isFetching
                    }
                    className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                      !title.trim() ||
                      !description.trim() ||
                      !selectedFile ||
                      isFetching
                        ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                        : "border-transparent text-white bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {isFetching ? "Uploading..." : "Save"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailAttachmentAddPage;
