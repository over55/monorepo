// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Incident/Detail/Page.jsx
// @uix-page: OrderIncidentDetailPage
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Breadcrumb, Spinner, Modal)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Spinner,
  Modal,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../../components/UIX";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  PlusIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  PaperClipIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  ArchiveBoxIcon,
} from "@heroicons/react/24/outline";

function AdminOrderDetailMoreIncidentDetailPage() {
  const { oid, oiid } = useParams();
  const orderManager = useOrderManager();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [incident, setIncident] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertStatus, setAlertStatus] = useState("");

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch order and incident details
  const fetchData = useCallback(async () => {
    setFetching(true);
    setErrors({});

    try {
      // Fetch both order and incident details
      const [orderData, incidentData] = await Promise.all([
        orderManager.getOrderDetail(oid, onUnauthorized),
        orderIncidentManager.getOrderIncidentDetail(oiid, onUnauthorized),
      ]);

      setOrder(orderData);
      setIncident(incidentData);

      console.log(
        "AdminOrderDetailMoreIncidentDetailPage: Data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentDetailPage: Failed to fetch data:",
        error,
      );
      setErrors({ general: "Failed to load incident details" });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  }, [oid, oiid, orderManager, orderIncidentManager, onUnauthorized]);

  // Handle add comment
  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) {
      setAlertMessage("Please enter a comment");
      setAlertStatus("error");
      return;
    }

    try {
      setFetching(true);
      await orderIncidentManager.createOrderIncidentComment(
        oiid,
        newComment,
        onUnauthorized,
      );
      setNewComment("");
      setShowCommentModal(false);
      setAlertMessage("Comment added successfully");
      setAlertStatus("success");
      // Refresh data
      fetchData();
    } catch (error) {
      console.error("Failed to add comment:", error);
      setAlertMessage("Failed to add comment");
      setAlertStatus("error");
    } finally {
      setFetching(false);
    }
  }, [oiid, newComment, orderIncidentManager, onUnauthorized, fetchData]);

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchData();
    }

    return () => {
      mounted = false;
    };
  }, [oid, oiid, authManager, navigate, fetchData]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { to: "/admin/dashboard", label: "Dashboard", icon: ChartBarIcon },
    { to: "/admin/orders", label: "Orders", icon: WrenchScrewdriverIcon },
    {
      to: `/admin/order/${oid}/more`,
      label: `Order #${oid} (More)`,
      icon: EllipsisHorizontalIcon,
    },
    {
      to: `/admin/order/${oid}/more/incidents`,
      label: "Incidents",
      icon: FireIcon,
    },
    { label: "Detail", icon: InformationCircleIcon, isActive: true },
  ], [oid]);

  // Format initiator label
  const getInitiatorLabel = useCallback((initiator) => {
    switch (initiator) {
      case 1:
        return "Client";
      case 2:
        return "Associate";
      case 3:
        return "Staff";
      default:
        return "Unknown";
    }
  }, []);

  // Data display row component
  const DataRow = useCallback(({ label, value, isLink = false, linkPath = "" }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm font-medium text-gray-600 sm:w-40 mb-1 sm:mb-0">{label}</span>
      {isLink && linkPath ? (
        <Link to={linkPath} className={`${themeClasses.linkPrimary} hover:underline`}>
          {value || "N/A"}
        </Link>
      ) : (
        <span className="text-gray-900">{value || "N/A"}</span>
      )}
    </div>
  ), [themeClasses]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setShowCommentModal(false);
    setNewComment("");
  }, []);

  // Handle alert dismiss
  const handleAlertDismiss = useCallback(() => {
    setAlertMessage("");
    setAlertStatus("");
  }, []);

  // Render loading state
  if (isFetching && !incident) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading incident details...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Archived Banner */}
      {order && order.status === 2 && (
        <Alert type="info" className="mb-4" icon={ArchiveBoxIcon}>
          This order is archived
        </Alert>
      )}

      {/* Alert Messages */}
      {alertMessage && (
        <Alert
          type={alertStatus}
          className="mb-4"
          dismissible
          onDismiss={handleAlertDismiss}
        >
          {alertMessage}
        </Alert>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <WrenchScrewdriverIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Order - Incident Detail
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <InformationCircleIcon className="w-4 h-4 mr-1" />
          View incident details and comments
        </p>
      </div>

      {/* Summary Card */}
      <Card className="mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className={`w-5 h-5 mr-2 ${themeClasses.linkPrimary}`} />
            Summary
          </h2>
          {incident && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowCommentModal(true)}
                disabled={order.status === 2}
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                New Comment
              </Button>
              {!incident.closingReason && (
                <Link to={`/admin/order/${oid}/more/incident/${oiid}/close`}>
                  <Button variant="warning" size="sm">
                    <LockClosedIcon className="w-4 h-4 mr-1" />
                    Close
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="p-6">
          {errors.general && (
            <Alert type="error" className="mb-4">
              {errors.general}
            </Alert>
          )}

          {incident && (
            <div className="space-y-0">
              <DataRow
                label="Client"
                value={order.customerName}
                isLink={true}
                linkPath={`/admin/customer/${order.customerId}`}
              />
              <DataRow
                label="Associate"
                value={
                  order.associateId
                    ? order.associateName || "N/A"
                    : "Not assigned"
                }
                isLink={!!order.associateId}
                linkPath={`/admin/associate/${order.associateId}`}
              />
              <DataRow label="Title" value={incident.title} />
              <DataRow label="Description" value={incident.description} />
              <DataRow
                label="Initiated By"
                value={getInitiatorLabel(incident.initiator)}
              />
              <DataRow label="Start Date" value={incident.startDate} />
              <DataRow
                label="Status"
                value={
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    incident.closingReason
                      ? "bg-gray-100 text-gray-800"
                      : "bg-green-100 text-green-800"
                  }`}>
                    {incident.closingReason ? "Closed" : "Open"}
                  </span>
                }
              />
              {incident.closingReason && (
                <DataRow
                  label="Closing Reason"
                  value={
                    incident.closingReasonLabel || incident.closingReasonOther
                  }
                />
              )}
              <DataRow label="Created At" value={incident.createdAt} />
              <DataRow
                label="Created By"
                value={incident.createdByUserName}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Feed Card */}
      {incident && (
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChatBubbleLeftRightIcon className={`w-5 h-5 mr-2 ${themeClasses.linkPrimary}`} />
              Feed
            </h2>
          </div>

          <div className="p-6">
            {incident.feed && incident.feed.length > 0 ? (
              <div className="space-y-6">
                {incident.feed.map((item, index) => (
                  <div
                    key={index}
                    className={`pb-6 ${
                      index < incident.feed.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700">
                        {item.createdByUserName}
                      </span>
                      <span className="text-xs text-gray-500">{item.createdAt}</span>
                    </div>
                    {item.filetype ? (
                      // Attachment
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <a
                          href={item.objectUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                        >
                          <PaperClipIcon className="w-5 h-5" />
                          {item.filename || "Download Attachment"}
                        </a>
                      </div>
                    ) : (
                      // Comment
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 whitespace-pre-wrap text-gray-700">
                        {item.content}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No comments or attachments yet.</p>
              </div>
            )}

            {/* Action buttons at bottom of feed */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8 pt-6 border-t border-gray-200">
              <Link to={`/admin/order/${oid}/more/incidents`}>
                <Button variant="secondary">
                  <ArrowLeftIcon className="w-4 h-4 mr-2" />
                  Back to Incidents
                </Button>
              </Link>
              <Button
                variant="primary"
                onClick={() => setShowCommentModal(true)}
                disabled={order.status === 2}
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Comment Modal */}
      <Modal
        isOpen={showCommentModal}
        onClose={handleModalClose}
        title="New Comment"
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={handleModalClose} variant="secondary">
              Cancel
            </Button>
            <Button onClick={handleAddComment} variant="success">
              Submit
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-1 block">
              Content <span className="text-red-500">*</span>
            </span>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={7}
              placeholder="Enter your comment here"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </label>
        </div>
      </Modal>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderDetailMoreIncidentDetailPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderDetailMoreIncidentDetailPage />
    </UIXThemeProvider>
  );
}

export default AdminOrderDetailMoreIncidentDetailPageWithProvider;
