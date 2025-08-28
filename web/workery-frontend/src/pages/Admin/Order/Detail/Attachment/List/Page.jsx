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
  PencilIcon,
  TrashIcon,
  XCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useAttachmentManager,
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import {
  ATTACHMENT_STATUS,
  ATTACHMENT_TYPES,
  ATTACHMENT_TYPE_NAMES,
} from "../../../../../../constants/Attachment";
import {
  ORDER_STATUS_NEW,
  ORDER_STATUS_DECLINED,
  ORDER_STATUS_PENDING,
  ORDER_STATUS_CANCELLED,
  ORDER_STATUS_ONGOING,
  ORDER_STATUS_IN_PROGRESS,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_ARCHIVED,
} from "../../../../../../constants/Order";

function AdminOrderDetailAttachmentListPage() {
  const { oid } = useParams();
  const navigate = useNavigate();

  // Services
  const attachmentManager = useAttachmentManager();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState(null);
  const [attachments, setAttachments] = useState(null);
  const [selectedAttachmentForDeletion, setSelectedAttachmentForDeletion] =
    useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");

  // Pagination states
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch data on mount and when pagination changes
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (oid) {
      fetchData();
      window.scrollTo(0, 0);
    }
  }, [currentCursor, pageSize, oid]);

  const fetchData = async () => {
    try {
      setFetching(true);
      setErrors({});

      // Fetch order details
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);

      // BUILD PARAMS WITH CORRECT OWNERSHIP FILTERING
      const params = {
        ownershipId: oid,
        ownershipRole: ATTACHMENT_TYPES.ORDER, // This is 3
        page_size: pageSize,
      };

      if (currentCursor) {
        params.cursor = currentCursor;
      }

      // Debug logging for development
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 ATTACHMENT FILTER DEBUG:");
        console.log("  Order ID (oid):", oid);
        console.log("  Request params:", params);
        console.log("  Expected backend params:");
        console.log("    ownership_id:", oid);
        console.log("    ownership_role:", ATTACHMENT_TYPES.ORDER);
      }

      // Force refresh to bypass any stale cache
      const attachmentsData = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        true, // Force refresh
      );

      // LOG THE RESPONSE
      if (process.env.NODE_ENV === "development") {
        console.log("📦 ATTACHMENT RESPONSE:");
        console.log("  Total count:", attachmentsData?.count || 0);
        console.log("  Results count:", attachmentsData?.results?.length || 0);

        // VERIFY FILTERING: Check if all attachments belong to this order
        if (attachmentsData?.results?.length > 0) {
          const allBelongToOrder = attachmentsData.results.every(
            (att) => att.orderId === oid || att.orderID === oid,
          );
          console.log(
            "  ✅ All attachments belong to order?",
            allBelongToOrder,
          );

          // Log any attachments that don't match
          attachmentsData.results.forEach((att, index) => {
            if (att.orderId !== oid && att.orderID !== oid) {
              console.warn(`  ⚠️ Attachment ${index} has different order:`, {
                attachmentId: att.id,
                attachmentOrderId: att.orderId || att.orderID,
                expectedOrderId: oid,
              });
            }
          });
        }
      }

      setAttachments(attachmentsData);

      if (attachmentsData && attachmentsData.hasNextPage) {
        setNextCursor(attachmentsData.nextCursor);
      } else {
        setNextCursor("");
      }
    } catch (error) {
      console.error("❌ Failed to fetch data:", error);
      setErrors({ general: "Failed to load attachments" });
      setAlertMessage("Failed to load attachments");
      setAlertType("error");
    } finally {
      setFetching(false);
    }
  };

  const onNextClicked = () => {
    if (nextCursor) {
      const arr = [...previousCursors];
      arr.push(currentCursor);
      setPreviousCursors(arr);
      setCurrentCursor(nextCursor);
    }
  };

  const onPreviousClicked = () => {
    const arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor || "");
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

      // Show success message
      setAlertMessage("Attachment deleted successfully");
      setAlertType("success");

      // Clear alert after 3 seconds
      setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 3000);

      // Refresh the list
      await fetchData();
    } catch (error) {
      console.error("Failed to delete attachment:", error);
      setErrors({ general: "Failed to delete attachment" });
      setAlertMessage("Failed to delete attachment");
      setAlertType("error");
    } finally {
      setFetching(false);
      setSelectedAttachmentForDeletion(null);
    }
  };

  const onRowClick = (attachment) => {
    navigate(`/admin/order/${oid}/attachment/${attachment.id}`);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    // Check if it's already formatted (contains month name)
    if (/[A-Za-z]/.test(dateString) && !dateString.includes("T")) {
      return dateString;
    }
    return new Date(dateString).toLocaleDateString();
  };

  // Get file type icon
  const getFileTypeIcon = (fileType) => {
    if (!fileType) return <DocumentIcon className="w-5 h-5 text-gray-400" />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
    } else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    ) {
      return <DocumentIcon className="w-5 h-5 text-blue-500" />;
    } else {
      return <DocumentIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  // Check if we can add attachments based on order status
  const canAddAttachments =
    order &&
    ![
      ORDER_STATUS_DECLINED,
      ORDER_STATUS_CANCELLED,
      ORDER_STATUS_COMPLETED_AND_PAID,
      ORDER_STATUS_ARCHIVED,
    ].includes(order.status);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

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

  if (isFetching && !order) {
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
              Manage attachments and documents for{" "}
              {order?.wjid ? `Order #${order.wjid}` : "this order"}
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {order && order.status === ORDER_STATUS_DECLINED && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
          <XCircleIcon className="w-5 h-5 mr-2" />
          This order has been declined
        </div>
      )}
      {order && order.status === ORDER_STATUS_CANCELLED && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg flex items-center">
          <NoSymbolIcon className="w-5 h-5 mr-2" />
          This order is cancelled
        </div>
      )}
      {order && order.status === ORDER_STATUS_ARCHIVED && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This order is archived
        </div>
      )}

      {/* Success/Error Alerts */}
      {alertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg flex items-center ${
            alertType === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <InformationCircleIcon className="w-5 h-5 mr-2" />
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

      {/* Delete Confirmation Modal */}
      {selectedAttachmentForDeletion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={onDeselectAttachmentForDeletion}
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
                        You are about to <strong>delete</strong> this
                        attachment; it will no longer appear on your dashboard
                        and will be permanently removed. This action cannot be
                        undone. Are you sure you would like to continue?
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
                  onClick={onDeselectAttachmentForDeletion}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
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
              {attachments?.count !== undefined && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({attachments.count} total)
                </span>
              )}
            </h2>
            {canAddAttachments && (
              <Link to={`/admin/order/${oid}/attachments/add`}>
                <button className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  New Attachment
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
                          {attachment.status === ATTACHMENT_STATUS.ACTIVE ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Archived
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(attachment.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-2">
                            {getFileTypeIcon(
                              attachment.filetype || attachment.fileType,
                            )}
                            <span className="text-gray-900">
                              {attachment.filename ||
                                attachment.fileName ||
                                "Unknown file"}
                            </span>
                            {attachment.objectUrl && (
                              <a
                                href={attachment.objectUrl}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center text-blue-600 hover:text-blue-700"
                                title="Download file"
                              >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
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
                      setCurrentCursor("");
                      setPreviousCursors([]);
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
                  {attachments.hasNextPage && nextCursor && (
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
                  New Attachment
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
