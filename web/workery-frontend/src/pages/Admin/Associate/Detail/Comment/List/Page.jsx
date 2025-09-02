// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/Comment/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  ChatBubbleLeftRightIcon,
  ChevronLeftIcon,
  ArrowPathIcon,
  PlusCircleIcon,
  ClockIcon,
  ArchiveBoxIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  PaperClipIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  useAssociateManager,
  useCommentManager,
} from "../../../../../../services/Services";
import { DateTime } from "luxon";
import { formatDateTime } from "../../../../../../services/Helpers/DateFormatter";

// Constants for comment belonging types (from backend)
const BELONGS_TO_CUSTOMER = 1;
const BELONGS_TO_ASSOCIATE = 2;
const BELONGS_TO_ORDER = 3;
const BELONGS_TO_STAFF = 4;

function AdminAssociateDetailCommentListPage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();
  const commentManager = useCommentManager();

  // Use refs to track if initial load has happened
  const hasInitialLoad = useRef(false);
  const lastFetchParams = useRef(null);

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isRefreshing, setRefreshing] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [associate, setAssociate] = useState({});
  const [commentList, setCommentList] = useState({
    results: [],
    nextCursor: "",
    hasNextPage: false,
  });
  const [pageSize, setPageSize] = useState(25);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [content, setContent] = useState("");
  const [topAlertMessage, setTopAlertMessage] = useState("");
  const [topAlertStatus, setTopAlertStatus] = useState("");

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associate details
  const fetchAssociateDetail = useCallback(async () => {
    try {
      const data = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(data);
    } catch (error) {
      console.error("Failed to fetch associate detail:", error);
      setErrors(error);
    }
  }, [aid, associateManager, onUnauthorized]);

  // Core fetch function
  const doFetchComments = useCallback(
    async (cursor = "", forceRefresh = false) => {
      // Create a unique key for this fetch to prevent duplicates
      const fetchKey = `${cursor}-${pageSize}-${sortByValue}`;

      // Check if we're already fetching with these exact params
      if (lastFetchParams.current === fetchKey && !forceRefresh) {
        console.log("Skipping duplicate fetch with same params:", fetchKey);
        return;
      }

      try {
        if (forceRefresh) {
          setRefreshing(true);
          // Clear only the specific cache for these parameters
          const sortArray = sortByValue.split(",");
          const filtersMap = new Map();
          filtersMap.set("page_size", pageSize.toString());
          filtersMap.set("associate_id", aid);
          filtersMap.set("belongs_to", BELONGS_TO_ASSOCIATE.toString());
          filtersMap.set("sort_field", sortArray[0]);
          filtersMap.set("sort_order", sortArray[1]);
          if (cursor) {
            filtersMap.set("cursor", cursor);
          }
          commentManager.clearSpecificCache(filtersMap);
        } else {
          setFetching(true);
        }
        setErrors({});

        // Handle sorting
        const sortArray = sortByValue.split(",");

        // Build parameters object for the API
        const params = {
          page_size: pageSize.toString(),
          associate_id: aid,
          belongs_to: BELONGS_TO_ASSOCIATE.toString(),
          sort_field: sortArray[0],
          sort_order: sortArray[1],
        };

        // Add cursor if provided
        if (cursor && cursor !== "") {
          params.cursor = cursor;
        }

        console.log("Fetching comments with params:", params);

        // Build filters map
        const filtersMap = new Map();
        Object.entries(params).forEach(([key, value]) => {
          filtersMap.set(key, value);
        });

        // Update last fetch params
        lastFetchParams.current = fetchKey;

        // Fetch comments
        const data = await commentManager.getCommentsWithFiltersMap(
          filtersMap,
          onUnauthorized,
          forceRefresh,
        );

        console.log("Received comment data:", {
          resultsCount: data?.results?.length || 0,
          hasNextPage: data?.hasNextPage,
          nextCursor: data?.nextCursor,
        });

        if (data) {
          setCommentList({
            results: data.results || [],
            nextCursor: data.nextCursor || "",
            hasNextPage: data.hasNextPage || false,
          });

          // Update next cursor for pagination
          if (data.hasNextPage && data.nextCursor) {
            setNextCursor(data.nextCursor);
          } else {
            setNextCursor("");
          }
        }

        setLastFetchTime(new Date());
      } catch (error) {
        console.error("Failed to fetch comment list:", error);
        setErrors(error);
        setCommentList({
          results: [],
          nextCursor: "",
          hasNextPage: false,
        });
      } finally {
        setFetching(false);
        setRefreshing(false);
      }
    },
    [aid, pageSize, sortByValue, commentManager, onUnauthorized],
  );

  // Submit new comment
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");

    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      await associateManager.createAssociateComment(
        aid,
        content,
        onUnauthorized,
      );

      setContent("");
      setTopAlertMessage("Comment created successfully");
      setTopAlertStatus("success");

      // Clear all cache and reset pagination
      commentManager.clearCommentsCache();
      lastFetchParams.current = null;

      // Reset pagination state
      setCurrentCursor("");
      setPreviousCursors([]);
      setNextCursor("");

      // Force refresh
      await doFetchComments("", true);

      setTimeout(() => {
        setTopAlertMessage("");
        setTopAlertStatus("");
      }, 3000);

      window.scrollTo(0, 0);
    } catch (error) {
      console.error("Error creating comment:", error);
      setErrors(error);
      setTopAlertMessage("Failed to create comment");
      setTopAlertStatus("error");
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Refresh handler
  const handleRefresh = () => {
    lastFetchParams.current = null;
    doFetchComments(currentCursor, true);
  };

  // Pagination handlers
  const onNextClicked = () => {
    console.log("Next Clicked, nextCursor:", nextCursor);
    if (nextCursor) {
      setPreviousCursors((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
    }
  };

  const onPreviousClicked = () => {
    console.log("Previous Clicked");
    setPreviousCursors((prev) => {
      const arr = [...prev];
      if (arr.length > 0) {
        const previousCursor = arr.pop();
        setCurrentCursor(previousCursor);
        return arr;
      }
      return prev;
    });
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    console.log("Page size changed to:", newSize);
    setPageSize(newSize);
    // Reset pagination when page size changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    lastFetchParams.current = null;
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    console.log("Sort changed to:", newSort);
    setSortByValue(newSort);
    // Reset pagination when sort changes
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    lastFetchParams.current = null;
  };

  const formatLastFetchTime = () => {
    if (!lastFetchTime) return null;
    const now = DateTime.now();
    const fetchTime = DateTime.fromJSDate(lastFetchTime);
    const diff = now.diff(fetchTime, ["minutes", "seconds"]);

    if (diff.minutes >= 1) {
      return `Last updated ${Math.floor(diff.minutes)} minute${
        Math.floor(diff.minutes) !== 1 ? "s" : ""
      } ago`;
    } else {
      return `Last updated ${Math.floor(diff.seconds)} seconds ago`;
    }
  };

  // Initial load - only clear cache once on mount
  useEffect(() => {
    if (!hasInitialLoad.current) {
      window.scrollTo(0, 0);
      fetchAssociateDetail();
      // Clear all comment cache on initial mount
      commentManager.clearCommentsCache();
      hasInitialLoad.current = true;
    }
  }, [fetchAssociateDetail, commentManager]);

  // Fetch comments when parameters change
  useEffect(() => {
    if (aid && hasInitialLoad.current) {
      console.log("Parameters changed, fetching with cursor:", currentCursor);
      doFetchComments(currentCursor, false);
    }
  }, [aid, currentCursor, pageSize, sortByValue, doFetchComments]);

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  if (isFetching && !associate.id) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate comments...</p>
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
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detail
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
              <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
              Associate
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View and manage comments
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This associate is archived
        </div>
      )}

      {/* Top Alert Message */}
      {topAlertMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            topAlertStatus === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {topAlertStatus === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2" />
              )}
              <span>{topAlertMessage}</span>
            </div>
            <button
              onClick={() => {
                setTopAlertMessage("");
                setTopAlertStatus("");
              }}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 &&
        !topAlertMessage && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2 mt-0.5" />
              <div className="flex-1">
                <strong>Error:</strong>
                <ul className="mt-2 list-disc list-inside">
                  {Object.entries(errors).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-3"
              >
                ×
              </button>
            </div>
          </div>
        )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {associate && (
          <>
            {/* Header with Title and Refresh Button */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                    <ChatBubbleLeftRightIcon className="w-7 h-7 mr-2 text-blue-600" />
                    Comments
                  </h2>
                  {lastFetchTime && (
                    <span className="text-sm text-gray-500 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {formatLastFetchTime()}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  <ArrowPathIcon
                    className={`w-5 h-5 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <Link
                  to={`/admin/associate/${aid}`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Summary
                </Link>
                <Link
                  to={`/admin/associate/${aid}/detail`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Detail
                </Link>
                <Link
                  to={`/admin/associate/${aid}/orders`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Orders
                </Link>
                <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600">
                  Comments
                </div>
                <Link
                  to={`/admin/associate/${aid}/attachments`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  Attachments
                </Link>
                <Link
                  to={`/admin/associate/${aid}/more`}
                  className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
                >
                  More
                  <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
                </Link>
              </nav>
            </div>

            <div className="p-6">
              {/* Sort Controls */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By:
                </label>
                <select
                  value={sortByValue}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="block w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="created_at,DESC">Created Date (Newest)</option>
                  <option value="created_at,ASC">Created Date (Oldest)</option>
                  <option value="modified_at,DESC">
                    Modified Date (Newest)
                  </option>
                  <option value="modified_at,ASC">
                    Modified Date (Oldest)
                  </option>
                </select>
              </div>

              {/* Add Comment Form */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add New Comment <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  placeholder="Write your comment here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={associate.status === 2 || isSubmitting}
                  className={`block w-full px-4 py-3 border rounded-lg focus:ring-blue-500 focus:border-blue-500 resize-y ${
                    errors && errors.content
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300"
                  } ${
                    associate.status === 2
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white"
                  }`}
                  rows="4"
                />
                {errors && errors.content && (
                  <p className="mt-2 text-sm text-red-600">{errors.content}</p>
                )}
                <button
                  onClick={onSubmitClick}
                  disabled={
                    associate.status === 2 || isSubmitting || !content.trim()
                  }
                  className={`mt-4 inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                    associate.status === 2 || isSubmitting || !content.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  <PlusCircleIcon className="w-5 h-5 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Comment"}
                </button>
              </div>

              {/* Comments List */}
              {isFetching || isRefreshing ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">
                      {isRefreshing
                        ? "Refreshing comments..."
                        : "Loading comments..."}
                    </p>
                  </div>
                </div>
              ) : commentList.results && commentList.results.length > 0 ? (
                <>
                  {/* Comments Display */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Comments for {associate.name || "Associate"} (
                      {commentList.results.length}
                      {commentList.hasNextPage ? "+" : ""})
                    </h3>
                    <div className="space-y-4">
                      {commentList.results.map((comment, index) => (
                        <div
                          key={comment.id || `comment-${index}`}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex items-center">
                              <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                              <strong className="text-blue-600">
                                {comment.createdByUserName || "System"}
                              </strong>
                              {comment.associateName &&
                                comment.associateName !== associate.name && (
                                  <span className="ml-3 text-xs text-gray-500">
                                    (Re: {comment.associateName})
                                  </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              {formatDateTime(comment.createdAt)}
                            </div>
                          </div>
                          <div className="bg-white rounded-md p-4 border border-gray-100">
                            <p className="text-gray-900 whitespace-pre-wrap break-words">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pagination Controls */}
                  {(previousCursors.length > 0 || commentList.hasNextPage) && (
                    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                      <div className="flex items-center">
                        <label className="mr-3 text-sm font-medium text-gray-700">
                          Items per page:
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            handlePageSizeChange(parseInt(e.target.value))
                          }
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
                        {commentList.hasNextPage && nextCursor && (
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
                  )}
                </>
              ) : (
                // No comments message
                previousCursors.length === 0 && (
                  <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Comments Yet
                    </h3>
                    <p className="text-gray-500">
                      Be the first to add a comment about this associate.
                    </p>
                  </div>
                )
              )}

              {/* Action Buttons */}
              <div className="flex justify-start mt-8 pt-6 border-t border-gray-200">
                <Link to="/admin/associates">
                  <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-5 h-5 mr-2" />
                    Back to Associates
                  </button>
                </Link>
              </div>
            </div>
          </>
        )}

        {!associate && !isFetching && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Associate Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Associates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateDetailCommentListPage;
