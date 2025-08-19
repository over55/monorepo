// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/Comment/List/Page.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateManager,
  useCommentManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../../../components/UI";
import { DateTime } from "luxon";

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

  // Use refs to prevent infinite loops
  const isMountedRef = useRef(false);
  const fetchInProgressRef = useRef(false);
  const lastFetchParamsRef = useRef(null);

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

  // Fetch associate details - stable function
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

  // Fetch comment list - stable function without circular dependencies
  const fetchCommentList = useCallback(
    async (
      forceRefresh = false,
      cursor = "",
      pageSizeParam = null,
      sortByParam = null,
    ) => {
      // Use passed parameters or current state
      const currentPageSize = pageSizeParam || pageSize;
      const currentSortBy = sortByParam || sortByValue;

      // Create a unique key for this fetch to prevent duplicates
      const fetchKey = `${aid}-${cursor}-${currentPageSize}-${currentSortBy}`;

      // Check if this exact fetch is already in progress or was just completed
      if (fetchInProgressRef.current) {
        console.log("Fetch already in progress, skipping...");
        return;
      }

      // Check if we just fetched with these exact params
      if (!forceRefresh && lastFetchParamsRef.current === fetchKey) {
        console.log("Already fetched with these params, skipping...");
        return;
      }

      try {
        fetchInProgressRef.current = true;
        lastFetchParamsRef.current = fetchKey;

        if (forceRefresh) {
          setRefreshing(true);
          // Clear the cache to force fresh data
          commentManager.clearCommentsCache();
        } else {
          setFetching(true);
        }
        setErrors({});

        // Handle sorting
        const sortArray = currentSortBy.split(",");

        // Build parameters object for the API
        const params = {
          page_size: currentPageSize.toString(),
          associate_id: aid, // CRITICAL: Pass the associate ID to filter
          belongs_to: BELONGS_TO_ASSOCIATE.toString(), // Filter for associate comments
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

        // Fetch comments using the CommentManager with filters map
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

          // Only update nextCursor if it actually changed
          const newNextCursor = data.nextCursor || "";
          if (newNextCursor !== nextCursor) {
            setNextCursor(newNextCursor);
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
        // Add a small delay before clearing the flag to prevent rapid re-fetches
        setTimeout(() => {
          fetchInProgressRef.current = false;
        }, 100);
      }
    },
    [aid, commentManager, onUnauthorized, nextCursor, pageSize, sortByValue],
  );

  // Submit new comment
  const onSubmitClick = useCallback(async () => {
    console.log("onSubmitClick: Beginning...");

    // Validate content
    if (!content || !content.trim()) {
      setErrors({ content: "Comment content is required" });
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      // Call the manager to create comment
      await associateManager.createAssociateComment(
        aid,
        content,
        onUnauthorized,
      );

      // Clear the form
      setContent("");

      // Add a temporary banner message
      setTopAlertMessage("Comment created successfully");
      setTopAlertStatus("success");

      // Reset pagination and refresh the comment list
      setCurrentCursor("");
      setPreviousCursors([]);
      setNextCursor("");
      lastFetchParamsRef.current = null; // Clear the last fetch params
      await fetchCommentList(true, "");

      // Clear message after 3 seconds
      setTimeout(() => {
        setTopAlertMessage("");
        setTopAlertStatus("");
      }, 3000);

      // Scroll to top
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
  }, [aid, content, associateManager, onUnauthorized, fetchCommentList]);

  // Refresh handler
  const handleRefresh = useCallback(() => {
    // Reset pagination
    setCurrentCursor("");
    setPreviousCursors([]);
    setNextCursor("");
    lastFetchParamsRef.current = null; // Clear the last fetch params
    fetchCommentList(true, "");
  }, [fetchCommentList]);

  // Pagination handlers
  const onNextClicked = useCallback(() => {
    console.log("Next Clicked, nextCursor:", nextCursor);
    if (nextCursor) {
      setPreviousCursors((prev) => [...prev, currentCursor]);
      setCurrentCursor(nextCursor);
    }
  }, [nextCursor, currentCursor]);

  const onPreviousClicked = useCallback(() => {
    console.log("Previous Clicked");
    setPreviousCursors((prev) => {
      const arr = [...prev];
      if (arr.length > 0) {
        const previousCursor = arr.pop();
        setCurrentCursor(previousCursor);
        setNextCursor(""); // Reset next cursor when going back
        return arr;
      }
      return prev;
    });
  }, []);

  // Format date/time helper
  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    try {
      return DateTime.fromISO(dateString).toLocaleString(DateTime.DATETIME_MED);
    } catch {
      return dateString;
    }
  };

  // Format time since last fetch
  const formatLastFetchTime = () => {
    if (!lastFetchTime) return null;
    const now = DateTime.now();
    const fetchTime = DateTime.fromJSDate(lastFetchTime);
    const diff = now.diff(fetchTime, ["minutes", "seconds"]);

    if (diff.minutes >= 1) {
      return `Last updated ${Math.floor(diff.minutes)} minute${Math.floor(diff.minutes) !== 1 ? "s" : ""} ago`;
    } else {
      return `Last updated ${Math.floor(diff.seconds)} seconds ago`;
    }
  };

  // Initial load - fetch associate details ONCE
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      window.scrollTo(0, 0);
      fetchAssociateDetail();
      // Clear cache on mount to ensure fresh data
      commentManager.clearCommentsCache();
    }
  }, []); // Empty dependency array - only run once on mount

  // Fetch comments when cursor changes
  useEffect(() => {
    if (aid && isMountedRef.current && !fetchInProgressRef.current) {
      console.log("Fetching with currentCursor:", currentCursor);
      fetchCommentList(false, currentCursor);
    }
  }, [currentCursor, aid]); // Only depend on cursor and aid

  // Handle sort or page size changes separately
  useEffect(() => {
    if (isMountedRef.current && aid && !fetchInProgressRef.current) {
      // Reset pagination and fetch with new params
      setCurrentCursor("");
      setPreviousCursors([]);
      setNextCursor("");
      lastFetchParamsRef.current = null; // Clear the last fetch params
      fetchCommentList(false, "", pageSize, sortByValue);
    }
  }, [pageSize, sortByValue, aid]); // Only depend on these specific values

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", icon: "ℹ️" },
  ];

  if (isFetching && !associate.id) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading associate comments..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>👷 Associate</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ℹ️ Detail
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <Alert type="info">📁 This associate is archived</Alert>
      )}

      {/* Top Alert Message */}
      {topAlertMessage && (
        <Alert
          type={topAlertStatus === "success" ? "success" : "error"}
          onClose={() => {
            setTopAlertMessage("");
            setTopAlertStatus("");
          }}
        >
          {topAlertMessage}
        </Alert>
      )}

      {/* Error Display */}
      {errors &&
        typeof errors === "object" &&
        Object.keys(errors).length > 0 &&
        !topAlertMessage && (
          <Alert type="error" onClose={() => setErrors({})}>
            <strong>Error:</strong>
            <ul
              style={{
                marginTop: "10px",
                paddingLeft: "20px",
                marginBottom: 0,
              }}
            >
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </Alert>
        )}

      {/* Main Content */}
      <Card>
        {/* Header with Title and Refresh Button */}
        {associate && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "30px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <h3 style={{ margin: 0 }}>💬 Comments</h3>
              {lastFetchTime && (
                <span
                  style={{ fontSize: "14px", color: theme.colors.secondary }}
                >
                  {formatLastFetchTime()}
                </span>
              )}
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              disabled={isRefreshing || fetchInProgressRef.current}
            >
              {isRefreshing ? "Refreshing..." : "🔄 Refresh"}
            </Button>
          </div>
        )}

        {associate && (
          <>
            {/* Tab Navigation */}
            <div
              style={{
                borderBottom: "2px solid #e0e0e0",
                marginBottom: "30px",
                display: "flex",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={`/admin/associate/${aid}`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Summary
              </Link>
              <Link
                to={`/admin/associate/${aid}/detail`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Detail
              </Link>
              <Link
                to={`/admin/associate/${aid}/orders`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Orders
              </Link>
              <div
                style={{
                  padding: "10px 0",
                  borderBottom: "3px solid " + theme.colors.primary,
                  fontWeight: "bold",
                }}
              >
                Comments
              </div>
              <Link
                to={`/admin/associate/${aid}/attachments`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                Attachments
              </Link>
              <Link
                to={`/admin/associate/${aid}/more`}
                style={{
                  padding: "10px 0",
                  textDecoration: "none",
                  color: theme.colors.secondary,
                }}
              >
                More ⋯
              </Link>
            </div>

            {/* Sort Controls */}
            <div
              style={{
                display: "flex",
                gap: "15px",
                marginBottom: "20px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontSize: "14px",
                    fontWeight: "600",
                  }}
                >
                  Sort By:
                </label>
                <select
                  value={sortByValue}
                  onChange={(e) => {
                    setSortByValue(e.target.value);
                  }}
                  style={{
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    backgroundColor: "white",
                    fontSize: "14px",
                    minWidth: "200px",
                  }}
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
            </div>

            {/* Add Comment Form (at the top for better UX) */}
            <div
              style={{
                backgroundColor: theme.colors.light,
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "30px",
                border: "1px solid #e0e0e0",
              }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Add New Comment <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                name="content"
                placeholder="Write your comment here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={associate.status === 2 || isSubmitting}
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  border:
                    errors && errors.content
                      ? "2px solid #dc3545"
                      : "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  resize: "vertical",
                  backgroundColor: associate.status === 2 ? "#f5f5f5" : "white",
                  cursor: associate.status === 2 ? "not-allowed" : "text",
                }}
              />
              {errors && errors.content && (
                <div
                  style={{
                    color: "#dc3545",
                    fontSize: "12px",
                    marginTop: "5px",
                  }}
                >
                  {errors.content}
                </div>
              )}
              <Button
                onClick={onSubmitClick}
                disabled={
                  associate.status === 2 || isSubmitting || !content.trim()
                }
                variant="primary"
                style={{ marginTop: "10px" }}
              >
                {isSubmitting ? "Saving..." : "💾 Save Comment"}
              </Button>
            </div>

            {/* Comments List */}
            {isFetching || isRefreshing ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <Loading
                  message={
                    isRefreshing
                      ? "Refreshing comments..."
                      : "Loading comments..."
                  }
                />
              </div>
            ) : commentList.results && commentList.results.length > 0 ? (
              <>
                {/* Comments Display */}
                <div style={{ marginBottom: "30px" }}>
                  <h4 style={{ marginBottom: "20px" }}>
                    Comments for {associate.name || "Associate"} (
                    {commentList.results.length}{" "}
                    {commentList.hasNextPage ? "+" : ""})
                  </h4>
                  {commentList.results.map((comment, index) => (
                    <div
                      key={comment.id || `comment-${index}`}
                      style={{
                        marginBottom: "20px",
                        padding: "15px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "8px",
                        border: "1px solid #e0e0e0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: "10px",
                          flexWrap: "wrap",
                          gap: "10px",
                        }}
                      >
                        <div>
                          <strong style={{ color: theme.colors.primary }}>
                            {comment.createdByUserName || "System"}
                          </strong>
                          {comment.associateName &&
                            comment.associateName !== associate.name && (
                              <span
                                style={{
                                  color: "#666",
                                  fontSize: "12px",
                                  marginLeft: "10px",
                                }}
                              >
                                (Re: {comment.associateName})
                              </span>
                            )}
                        </div>
                        <div style={{ color: "#666", fontSize: "14px" }}>
                          {formatDateTime(comment.createdAt)}
                        </div>
                      </div>
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "white",
                          borderRadius: "4px",
                          lineHeight: "1.6",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                        }}
                      >
                        {comment.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {(previousCursors.length > 0 || commentList.hasNextPage) && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginTop: "30px",
                      borderTop: "1px solid #e0e0e0",
                      paddingTop: "20px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <label
                        style={{
                          marginRight: "10px",
                          fontSize: "14px",
                          fontWeight: "600",
                        }}
                      >
                        Items per page:
                      </label>
                      <select
                        value={pageSize}
                        onChange={(e) => {
                          const newSize = parseInt(e.target.value);
                          setPageSize(newSize);
                        }}
                        style={{
                          padding: "8px 12px",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          backgroundColor: "white",
                          fontSize: "14px",
                        }}
                      >
                        {pageSizeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {previousCursors.length > 0 && (
                        <Button onClick={onPreviousClicked} variant="secondary">
                          ← Previous
                        </Button>
                      )}
                      {commentList.hasNextPage && nextCursor && (
                        <Button onClick={onNextClicked} variant="primary">
                          Next →
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // No comments message
              previousCursors.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "60px 20px",
                    backgroundColor: theme.colors.light,
                    borderRadius: "8px",
                  }}
                >
                  <div style={{ fontSize: "48px", marginBottom: "20px" }}>
                    💭
                  </div>
                  <h3>No Comments Yet</h3>
                  <p
                    style={{
                      color: theme.colors.secondary,
                      marginBottom: "0",
                    }}
                  >
                    Be the first to add a comment about this associate.
                  </p>
                </div>
              )
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "30px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link to="/admin/associates">
                <Button variant="outline">← Back to Associates</Button>
              </Link>
            </div>
          </>
        )}

        {!associate && !isFetching && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "20px" }}>❓</div>
            <h3>Associate Not Found</h3>
            <p style={{ color: theme.colors.secondary, marginBottom: "30px" }}>
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <Button variant="primary">← Back to Associates</Button>
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminAssociateDetailCommentListPage;
