// File Path: monorepo/web/workery-frontend/src/pages/Admin/Comment/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Alert,
  Table,
  Breadcrumb,
  Loading,
  Select,
} from "../../../components/UI";
import {
  ChatBubbleLeftRightIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  HomeIcon,
  FunnelIcon,
  XCircleIcon,
  UserCircleIcon,
  WrenchScrewdriverIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { useCommentManager } from "../../../services/Services";
import { formatDateTime } from "../../../services/Helpers/DateFormatter";
import { PAGE_SIZE_OPTIONS } from "../../../constants/FieldOptions";

// Comment Sort Options
const COMMENT_SORT_OPTIONS = [
  { value: "created_at,DESC", label: "Created (Newest → Oldest)" },
  { value: "created_at,ASC", label: "Created (Oldest → Newest)" },
];

// Comment Status Filter Options
const COMMENT_STATUS_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Belongs To Types
const BELONGS_TO_CUSTOMER = 1;
const BELONGS_TO_ASSOCIATE = 2;
const BELONGS_TO_ORDER = 3;

function AdminCommentList() {
  const navigate = useNavigate();
  const commentManager = useCommentManager();

  // State management
  const [commentsData, setCommentsData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Filter and pagination state
  const [status, setStatus] = useState("1"); // Default to active
  const [sortByValue, setSortByValue] = useState("created_at,DESC");
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");

  // Unauthorized callback
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  // Fetch comments function
  const fetchList = (cur, limit, keywords, so, s, t) => {
    setIsLoading(true);
    setErrors({});

    let params = new Map();
    params.set("page_size", limit);

    if (cur !== "") {
      params.set("cursor", cur);
    }

    // Parse sort value
    const sortArray = so.split(",");
    params.set("sort_field", sortArray[0]);
    params.set("sort_order", sortArray[1]);

    // Filtering
    if (keywords !== undefined && keywords !== null && keywords !== "") {
      params.set("search", keywords);
    }
    if (s !== undefined && s !== null && s !== "") {
      params.set("status", s);
    }
    if (t !== undefined && t !== null && t !== "") {
      params.set("type", t);
    }

    // Use the legacy method that matches the old signature
    commentManager.getCommentListAPI(
      params,
      onCommentListSuccess,
      onCommentListError,
      onCommentListDone,
      onUnauthorized,
    );
  };

  // API callbacks
  function onCommentListSuccess(response) {
    console.log("onCommentListSuccess: Starting...");
    if (response.results !== null) {
      // Format dates in the results
      if (response.results && response.results.length > 0) {
        response.results.forEach((item) => {
          if (item.createdAt) {
            // Format the date for display
            item.createdAt = formatDateTime(item.createdAt, "medium");
          }
        });
      }

      setCommentsData(response);
      if (response.hasNextPage) {
        setNextCursor(response.nextCursor);
      }
    }
  }

  function onCommentListError(apiErr) {
    console.log("onCommentListError: Starting...");
    setErrors(apiErr);
    window.scrollTo(0, 0);
  }

  function onCommentListDone() {
    console.log("onCommentListDone: Starting...");
    setIsLoading(false);
  }

  // Event handlers
  const onClearFilterClick = (e) => {
    e.preventDefault();
    setStatus("1");
    setSortByValue("created_at,DESC");
  };

  const onNextClicked = (e) => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  // Load data on mount and when filters change
  useEffect(() => {
    fetchList(currentCursor, pageSize, "", sortByValue, status, "");
    window.scrollTo(0, 0);
  }, [currentCursor, pageSize, sortByValue, status]);

  // Navigate if forceURL is set
  if (forceURL !== "") {
    navigate(forceURL);
    return null;
  }

  // Render belongs to icon and text
  const renderBelongsTo = (belongsTo) => {
    switch (belongsTo) {
      case BELONGS_TO_CUSTOMER:
        return (
          <div className="flex items-center">
            <UserCircleIcon className="h-4 w-4 mr-1" />
            <span>Customer</span>
          </div>
        );
      case BELONGS_TO_ASSOCIATE:
        return (
          <div className="flex items-center">
            <UserIcon className="h-4 w-4 mr-1" />
            <span>Associate</span>
          </div>
        );
      case BELONGS_TO_ORDER:
        return (
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="h-4 w-4 mr-1" />
            <span>Order</span>
          </div>
        );
      default:
        return "Unknown";
    }
  };

  // Render view link based on belongs to type
  const renderViewLink = (row) => {
    if (row.belongsTo === BELONGS_TO_CUSTOMER) {
      if (row.customerId === "000000000000000000000000") {
        return null;
      }
      return (
        <Link
          to={`/admin/client/${row.customerId}/comments`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      );
    } else if (row.belongsTo === BELONGS_TO_ASSOCIATE) {
      if (row.associateId === "000000000000000000000000") {
        return null;
      }
      return (
        <Link
          to={`/admin/associate/${row.associateId}/comments`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      );
    } else if (row.belongsTo === BELONGS_TO_ORDER) {
      return (
        <Link
          to={`/admin/order/${row.orderWjid}/comments`}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          View
          <ChevronRightIcon className="h-4 w-4 ml-1" />
        </Link>
      );
    }
    return null;
  };

  // Prepare table columns
  const columns = [
    {
      header: "Content",
      accessor: "content",
      render: (value) => (
        <div className="max-w-md truncate" title={value}>
          {value}
        </div>
      ),
    },
    {
      header: "Belongs to",
      accessor: "belongsTo",
      render: (value) => renderBelongsTo(value),
    },
    {
      header: "Created At",
      accessor: "createdAt",
    },
    {
      header: "",
      accessor: "actions",
      render: (value, row) => renderViewLink(row),
    },
  ];

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Comments",
      icon: ChatBubbleLeftRightIcon,
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3" />
          Comments
        </h1>
        <hr className="mt-4 border-gray-300" />
      </div>

      {/* Main Content Card */}
      <Card className="p-6">
        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
            List
          </h2>
        </div>

        {/* Filter Panel */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filtering & Sorting
            </h3>
            <button
              onClick={onClearFilterClick}
              className="text-gray-600 hover:text-gray-800 flex items-center"
            >
              <XCircleIcon className="h-5 w-5 mr-1" />
              Clear Filter
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={COMMENT_STATUS_FILTER_OPTIONS}
            />
            <Select
              label="Sort by"
              value={sortByValue}
              onChange={(e) => setSortByValue(e.target.value)}
              options={COMMENT_SORT_OPTIONS}
            />
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <Alert type="error" className="mb-6">
            {errors.general}
          </Alert>
        )}

        {/* Table Contents */}
        {isLoading ? (
          <div className="py-8">
            <Loading size="lg" text="Loading comments..." />
          </div>
        ) : (
          <>
            {commentsData &&
            commentsData.results &&
            (commentsData.results.length > 0 || previousCursors.length > 0) ? (
              <>
                {/* Data Table */}
                <div className="overflow-x-auto mb-6">
                  <Table columns={columns} data={commentsData.results} />
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center">
                  <div>
                    <Select
                      value={pageSize}
                      onChange={(e) => setPageSize(parseInt(e.target.value))}
                      options={PAGE_SIZE_OPTIONS}
                      className="w-32"
                    />
                  </div>
                  <div className="flex gap-2">
                    {previousCursors.length > 0 && (
                      <Button onClick={onPreviousClicked} variant="secondary">
                        Previous
                      </Button>
                    )}
                    {commentsData.hasNextPage && (
                      <Button onClick={onNextClicked} variant="primary">
                        Next
                      </Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Comments
                </h3>
                <p className="text-gray-500">
                  No comments found with the current filters.
                </p>
              </div>
            )}
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 mt-6 border-t">
          <Button
            onClick={() => navigate("/admin/dashboard")}
            variant="secondary"
            className="flex items-center"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminCommentList;
