// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/Attachment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PaperClipIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  DocumentTextIcon,
  CalendarIcon,
  ExclamationCircleIcon,
  TrashIcon,
  PencilIcon,
  DocumentChartBarIcon,
  ClipboardDocumentCheckIcon,
  XCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";

function AdminOrderDetailAttachmentListPage() {
  ////
  //// Constants
  ////

  const OrderStatusNew = 1;
  const OrderStatusDeclined = 2;
  const OrderStatusPending = 3;
  const OrderStatusCancelled = 4;
  const OrderStatusOngoing = 5;
  const OrderStatusInProgress = 6;
  const OrderStatusCompletedButUnpaid = 7;
  const OrderStatusCompletedAndPaid = 8;
  const OrderStatusArchived = 9;

  ////
  //// URL Parameters.
  ////

  const { oid } = useParams();
  const navigate = useNavigate();

  ////
  //// Services.
  ////

  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [selectedAttachmentForDeletion, setSelectedAttachmentForDeletion] =
    useState(null);

  // Pagination states
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  ////
  //// Event handling.
  ////

  const fetchAttachmentList = async (
    cur,
    limit,
    orderId,
    forceRefresh = false,
  ) => {
    setFetching(true);
    setErrors({});

    try {
      // Use order_wjid for filtering
      const params = {
        orderWjid: orderId,
        limit: limit,
        cursor: cur || undefined,
      };

      // IMPORTANT: Pass forceRefresh parameter to bypass cache
      const response = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        forceRefresh, // Force refresh to bypass cache
      );

      setAttachments(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch attachment list:", error);
      setErrors(error);
    } finally {
      setFetching(false);
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await orderManager.getOrderDetail(
        orderId,
        onUnauthorized,
      );
      setOrder(response);
    } catch (error) {
      console.error("Failed to fetch order detail:", error);
      setErrors(error);
    }
  };

  const onNextClicked = () => {
    const arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onSelectAttachmentForDeletion = (attachment) => {
    setSelectedAttachmentForDeletion(attachment);
  };

  const onDeselectAttachmentForDeletion = () => {
    setSelectedAttachmentForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedAttachmentForDeletion) return;

    setFetching(true);

    try {
      await attachmentManager.deleteAttachment(
        selectedAttachmentForDeletion.id,
        onUnauthorized,
      );

      // Refresh the list with force refresh
      fetchAttachmentList(currentCursor, pageSize, oid, true);
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setErrors({ general: "Failed to delete attachment" });
    } finally {
      setFetching(false);
      setSelectedAttachmentForDeletion(null);
    }
  };

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onRowClick = (attachment) => {
    navigate(`/admin/order/${oid}/attachment/${attachment.id}`);
  };

  ////
  //// Lifecycle.
  ////

  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (oid) {
      fetchOrderDetail(oid);
      // IMPORTANT: Force refresh on initial load to bypass stale cache
      fetchAttachmentList(currentCursor, pageSize, oid, true);
    }
  }, [oid]); // Only depend on oid, not currentCursor or pageSize

  // Separate effect for pagination changes
  useEffect(() => {
    if (oid && currentCursor !== "") {
      // Don't force refresh for pagination, use cache if available
      fetchAttachmentList(currentCursor, pageSize, oid, false);
    }
  }, [currentCursor, pageSize]);

  ////
  //// Render helpers.
  ////

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Get file type icon
  const getFileTypeIcon = (filename) => {
    if (!filename) return <DocumentIcon className="w-5 h-5 text-gray-400" />;

    const ext = filename.toLowerCase();
    if (ext.includes(".pdf")) {
      return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
    } else if (
      ext.includes(".jpg") ||
      ext.includes(".png") ||
      ext.includes(".jpeg")
    ) {
      return <DocumentIcon className="w-5 h-5 text-blue-500" />;
    } else {
      return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  // Get attachment status badge
  const getAttachmentStatusBadge = (status) => {
    const statusConfig = {
      1: { text: "Active", className: "bg-green-100 text-green-800" },
      2: { text: "Archived", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status] || {
      text: "Unknown",
      className: "bg-gray-100 text-gray-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    );
  };

  // Page size options
  const pageSizeOptions = [
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
    { value: 250, label: "250 per page" },
  ];

  const canAddAttachments =
    order &&
    ![
      OrderStatusDeclined,
      OrderStatusCancelled,
      OrderStatusCompletedAndPaid,
      OrderStatusArchived,
    ].includes(order.status);

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

  if (isFetching && !order.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading attachments...</p>
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
                to={`/admin/order/${oid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PaperClipIcon className="w-4 h-4 mr-2" />
                Attachments
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
              Work Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Manage attachments and documents
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === OrderStatusDeclined && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <XCircleIcon className="w-5 h-5 mr-2" />
          This order has been declined
        </div>
      )}
      {order && order.status === OrderStatusCancelled && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
          <NoSymbolIcon className="w-5 h-5 mr-2" />
          This order is cancelled
        </div>
      )}
      {order && order.status === OrderStatusArchived && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
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

      {/* Delete Confirmation Modal */}
      {selectedAttachmentForDeletion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Are you sure?
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              You are about to <strong>delete</strong> this attachment; it will
              no longer appear on your dashboard and will be permanently
              removed. This action cannot be undone. Are you sure you would like
              to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onDeselectAttachmentForDeletion}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirmButtonClick}
                className="px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Title and New Button */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <PaperClipIcon className="w-7 h-7 mr-2 text-blue-600" />
              Attachments
            </h2>
            {canAddAttachments && (
              <Link to={`/admin/order/${oid}/attachments/add`}>
                <button className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  New
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/order/${oid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/order/${oid}/full`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/order/${oid}/activity-sheets`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Activity Sheets
            </Link>
            <Link
              to={`/admin/order/${oid}/tasks`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Tasks
            </Link>
            <Link
              to={`/admin/order/${oid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
              Attachments
            </div>
            <Link
              to={`/admin/order/${oid}/more`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
            >
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </Link>
          </nav>
        </div>

        <div className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading attachments...</p>
              </div>
            </div>
          ) : attachments &&
            attachments.results &&
            (attachments.results.length > 0 || previousCursors.length > 0) ? (
            <>
              {/* Attachments Table */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        File
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attachments.results.map((attachment, index) => (
                      <tr
                        key={attachment.id || index}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onRowClick(attachment)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {attachment.title || "Untitled"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {getAttachmentStatusBadge(attachment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(attachment.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {getFileTypeIcon(attachment.filename)}
                            <span className="text-gray-700">
                              {attachment.filename || "Unknown file"}
                            </span>
                            {attachment.objectUrl && (
                              <a
                                href={attachment.objectUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4 ml-2" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Link
                              to={`/admin/order/${oid}/attachment/${attachment.id}`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                                <EyeIcon className="w-4 h-4 mr-1" />
                                View
                              </button>
                            </Link>
                            <Link
                              to={`/admin/order/${oid}/attachment/${attachment.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-yellow-600 hover:bg-yellow-700 transition-colors">
                                <PencilIcon className="w-4 h-4 mr-1" />
                                Edit
                              </button>
                            </Link>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectAttachmentForDeletion(attachment);
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
                            >
                              <TrashIcon className="w-4 h-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <label className="mr-3 text-sm font-medium text-gray-700">
                    Items per page:
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(parseInt(e.target.value));
                      setPreviousCursors([]);
                      setCurrentCursor("");
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3">
                  {previousCursors.length > 0 && (
                    <button
                      onClick={onPreviousClicked}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-2" />
                      Previous
                    </button>
                  )}
                  {attachments.hasNextPage && (
                    <button
                      onClick={onNextClicked}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            // No attachments message
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <PaperClipIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Attachments Found
              </h3>
              <p className="text-gray-500 mb-4">
                No attachments have been uploaded for this order.
              </p>
              {canAddAttachments && (
                <Link to={`/admin/order/${oid}/attachments/add`}>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add First Attachment
                  </button>
                </Link>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Link to="/admin/orders">
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Orders
              </button>
            </Link>
            {canAddAttachments && (
              <Link to={`/admin/order/${oid}/attachments/add`}>
                <button className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  New
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailAttachmentListPage;
