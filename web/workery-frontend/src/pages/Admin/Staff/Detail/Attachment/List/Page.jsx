// File Path: web/workery-frontend/src/pages/Admin/Staff/Detail/Attachment/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
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
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  useStaffManager,
  useAttachmentManager,
} from "../../../../../../services/Services";
import {
  ATTACHMENT_OWNERSHIP_TYPE,
  ATTACHMENT_STATUS_LABELS,
} from "../../../../../../constants/Attachment";

// Staff status constants
const STAFF_STATUS_ACTIVE = 1;
const STAFF_STATUS_ARCHIVED = 2;

function AdminStaffDetailAttachmentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();
  const attachmentManager = useAttachmentManager();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [staff, setStaff] = useState(null);
  const [attachments, setAttachments] = useState(null);
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
    fetchData();
    window.scrollTo(0, 0);
  }, [aid, currentCursor, pageSize]);

  const fetchData = async () => {
    try {
      setFetching(true);

      // Fetch staff details
      const staffData = await staffManager.getStaffDetail(aid, onUnauthorized);
      setStaff(staffData);

      // Fetch attachments
      const params = {
        entityId: aid,
        entityType: String(ATTACHMENT_OWNERSHIP_TYPE.STAFF),
        limit: pageSize,
        cursor: currentCursor || undefined,
      };

      const attachmentsData = await attachmentManager.getAttachments(
        params,
        onUnauthorized,
        true, // force refresh
      );
      setAttachments(attachmentsData);

      if (attachmentsData.hasNextPage) {
        setNextCursor(attachmentsData.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
      setErrors({ general: "Failed to load attachments" });
    } finally {
      setFetching(false);
    }
  };

  const onNextClicked = () => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = () => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onRowClick = (attachment) => {
    navigate(`/admin/staff/${aid}/attachment/${attachment.id}`);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
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

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  if (isFetching && !staff) {
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
                to="/admin/staff"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserIcon className="w-4 h-4 mr-2" />
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
              <UserIcon className="w-8 h-8 mr-3 text-blue-600" />
              Staff Member
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Manage attachments and documents
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {staff && staff.status === STAFF_STATUS_ARCHIVED && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This staff member is archived
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
        {/* Header with Title and New Button */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <PaperClipIcon className="w-7 h-7 mr-2 text-blue-600" />
              Attachments
            </h2>
            {staff && (
              <Link to={`/admin/staff/${aid}/attachments/add`}>
                <button
                  disabled={staff.status === STAFF_STATUS_ARCHIVED}
                  className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                    staff.status === STAFF_STATUS_ARCHIVED
                      ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "border-transparent text-white bg-green-600 hover:bg-green-700"
                  }`}
                >
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
              to={`/admin/staff/${aid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/staff/${aid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/staff/${aid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
              Attachments
            </div>
            <Link
              to={`/admin/staff/${aid}/more`}
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
            attachments.results.length > 0 ? (
            <>
              {/* Attachments Table - Desktop View */}
              <div className="hidden sm:block overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
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
                          {attachment.title ||
                            attachment.fileName ||
                            "Untitled"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {ATTACHMENT_STATUS_LABELS[attachment.status] ||
                              "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(attachment.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <a
                            href={attachment.objectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                            {attachment.filename || "Download"}
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/staff/${aid}/attachment/${attachment.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Attachments Cards - Mobile View */}
              <div className="sm:hidden space-y-4">
                {attachments.results.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => onRowClick(attachment)}
                  >
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {attachment.title ||
                            attachment.fileName ||
                            "Untitled"}
                        </span>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          {ATTACHMENT_STATUS_LABELS[attachment.status] ||
                            "Active"}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {formatDate(attachment.createdAt)}
                      </div>
                      <div className="flex items-center justify-between">
                        <a
                          href={attachment.objectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                          {attachment.filename || "Download"}
                        </a>
                        <Link
                          to={`/admin/staff/${aid}/attachment/${attachment.id}`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                            <EyeIcon className="w-4 h-4 mr-1" />
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
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
                  {nextCursor && (
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
                No attachments have been uploaded for this staff member.
              </p>
              {staff && staff.status !== STAFF_STATUS_ARCHIVED && (
                <Link to={`/admin/staff/${aid}/attachments/add`}>
                  <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                    <PlusCircleIcon className="w-4 h-4 mr-2" />
                    Add First Attachment
                  </button>
                </Link>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 pt-6 border-t border-gray-200">
            <Link to="/admin/staff">
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Staff
              </button>
            </Link>
            {staff && (
              <Link to={`/admin/staff/${aid}/attachments/add`}>
                <button
                  disabled={staff.status === STAFF_STATUS_ARCHIVED}
                  className={`inline-flex items-center px-5 py-2.5 border rounded-lg text-base font-medium transition-colors ${
                    staff.status === STAFF_STATUS_ARCHIVED
                      ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                      : "border-transparent text-white bg-green-600 hover:bg-green-700"
                  }`}
                >
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

export default AdminStaffDetailAttachmentListPage;
