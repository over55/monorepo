// File Path: web/workery-frontend/src/pages/Admin/Dashboard/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
  useBulletinManager,
  useAssociateAwayLogManager,
} from "../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  TextArea,
} from "../../../components/UI";
import {
  ChartBarIcon,
  NewspaperIcon,
  UserGroupIcon,
  UserIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  CalendarDaysIcon,
  CalendarIcon,
  ClockIcon,
  ShieldExclamationIcon,
} from "@heroicons/react/24/outline";

// Constants for associate away log reasons
const REASON_MAP = {
  1: "Other",
  2: "Going on vacation",
  3: "Personal reasons",
  4: "Commercial insurance expired",
  5: "Police check expired",
  6: "Auto Insurance Expired",
  7: "WSIB Expired",
  8: "Dues Date Expired",
};

const REASON_COMMERCIAL_INSURANCE_EXPIRED = 4;
const REASON_POLICE_CHECK_EXPIRED = 5;

function AdminDashboardPage() {
  const dashboardManager = useDashboardManager();
  const bulletinManager = useBulletinManager();
  const associateAwayLogManager = useAssociateAwayLogManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [dashboard, setDashboard] = useState({});

  // Modal states
  const [showBulletinModal, setShowBulletinModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedBulletin, setSelectedBulletin] = useState(null);
  const [bulletinText, setBulletinText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const MAX_BULLETINS_DISPLAY = 10;
  const MAX_AWAY_LOGS_DISPLAY = 10;

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch dashboard data (includes bulletins and associate away logs)
  const fetchDashboard = async () => {
    setErrors({});
    setFetching(true);

    try {
      const dashboardData = await dashboardManager.getDashboard(onUnauthorized);
      setDashboard(dashboardData);
      console.log(
        "AdminDashboard: Dashboard data loaded successfully",
        dashboardData,
      );
    } catch (error) {
      console.error("AdminDashboard: Failed to fetch dashboard:", error);
      setErrors({ fetch: error.message || "Failed to load dashboard data" });
    } finally {
      setFetching(false);
    }
  };

  // Refresh only bulletins after create/delete operations
  const refreshDashboard = async () => {
    try {
      // Force refresh to get updated data
      const dashboardData = await dashboardManager.getDashboard(
        onUnauthorized,
        true,
      );
      setDashboard(dashboardData);
      console.log("AdminDashboard: Dashboard refreshed successfully");
    } catch (error) {
      console.error("AdminDashboard: Failed to refresh dashboard:", error);
    }
  };

  const handleCreateBulletin = async (e) => {
    e.preventDefault();

    // Validation
    if (!bulletinText.trim()) {
      setErrors({ bulletin: "Bulletin text is required" });
      return;
    }

    if (bulletinText.length > 1000) {
      setErrors({
        bulletin: "Bulletin text must be less than 1000 characters",
      });
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Create the bulletin using bulletinManager
      const bulletinData = {
        text: bulletinText.trim(),
        status: 1, // Active status
      };

      await bulletinManager.createBulletin(bulletinData, onUnauthorized);

      console.log("Bulletin created successfully");

      // Clear form and close modal
      setBulletinText("");
      setShowBulletinModal(false);

      // Refresh dashboard to get updated bulletins list
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to create bulletin:", error);
      setErrors({ bulletin: error.message || "Failed to create bulletin" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBulletin = async () => {
    if (!selectedBulletin) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      // Delete the bulletin using bulletinManager
      await bulletinManager.deleteBulletin(selectedBulletin.id, onUnauthorized);

      console.log("Bulletin deleted successfully:", selectedBulletin.id);

      // Close modal and clear selection
      setShowDeleteModal(false);
      setSelectedBulletin(null);

      // Refresh dashboard to get updated bulletins list
      await refreshDashboard();
    } catch (error) {
      console.error("Failed to delete bulletin:", error);
      setErrors({ delete: error.message || "Failed to delete bulletin" });
      // Still close the modal on error
      setShowDeleteModal(false);
      setSelectedBulletin(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Get reason display with icon
  const getReasonDisplay = (awayLog) => {
    const hasExpiredDoc =
      awayLog.reason === REASON_COMMERCIAL_INSURANCE_EXPIRED ||
      awayLog.reason === REASON_POLICE_CHECK_EXPIRED;

    const reasonText =
      awayLog.reason === 1
        ? awayLog.reasonOther || "Other"
        : REASON_MAP[awayLog.reason] || "Unknown";

    return (
      <span className="flex items-center">
        {hasExpiredDoc && (
          <ShieldExclamationIcon className="w-4 h-4 mr-1 text-amber-500 flex-shrink-0" />
        )}
        <span className="truncate">{reasonText}</span>
      </span>
    );
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchDashboard();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading fullScreen message="Loading Dashboard..." />;
  }

  // Extract data from dashboard response
  const bulletins = dashboard.bulletins || [];
  const associateAwayLogs = dashboard.associateAwayLogs || [];

  // Limit display to maximum allowed
  const displayBulletins = bulletins.slice(0, MAX_BULLETINS_DISPLAY);
  const displayAwayLogs = associateAwayLogs.slice(0, MAX_AWAY_LOGS_DISPLAY);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Dashboard", icon: ChartBarIcon }]} />

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <ChartBarIcon className="w-8 h-8 mr-3 text-gray-700" />
            Dashboard
          </h1>
        </div>

        {/* Error Alert */}
        {(errors.fetch || errors.delete) && (
          <Alert type="error" className="mb-6">
            {errors.fetch || errors.delete}
          </Alert>
        )}

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Clients</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.clientsCount || 0}
                </p>
              </div>
              <UserGroupIcon className="w-10 h-10 text-blue-500" />
            </div>
            <Link
              to="/admin/customers"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-4"
            >
              View Clients →
            </Link>
          </div>

          <div className="bg-red-50 rounded-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Associates</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.associatesCount || 0}
                </p>
              </div>
              <UserIcon className="w-10 h-10 text-red-500" />
            </div>
            <Link
              to="/admin/associates"
              className="inline-flex items-center text-sm text-red-600 hover:text-red-800 mt-4"
            >
              View Associates →
            </Link>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.jobsCount || 0}
                </p>
              </div>
              <WrenchScrewdriverIcon className="w-10 h-10 text-green-500" />
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-sm text-green-600 hover:text-green-800 mt-4"
            >
              View Jobs →
            </Link>
          </div>

          <div className="bg-amber-50 rounded-lg p-6 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Tasks</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {dashboard.tasksCount || 0}
                </p>
              </div>
              <ClipboardDocumentListIcon className="w-10 h-10 text-amber-500" />
            </div>
            <Link
              to="/admin/tasks"
              className="inline-flex items-center text-sm text-amber-600 hover:text-amber-800 mt-4"
            >
              View Tasks →
            </Link>
          </div>
        </div>

        {/* Two Column Layout for News and Away Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Office News Section */}
          <Card className="h-fit">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <NewspaperIcon className="w-5 h-5 mr-2" />
                Office News
                {displayBulletins.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    (Latest {displayBulletins.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshDashboard()}
                  title="Refresh dashboard"
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusIcon}
                  onClick={() => {
                    setBulletinText("");
                    setErrors({});
                    setShowBulletinModal(true);
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="p-6">
              {displayBulletins.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {displayBulletins.map((bulletin) => (
                      <div
                        key={bulletin.id}
                        className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="flex-1 mr-4">
                          <p className="text-gray-700 text-sm">
                            {bulletin.text}
                          </p>
                          {bulletin.createdAt && (
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(bulletin.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedBulletin(bulletin);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* View All Bulletins Link - only show if more than displayed */}
                  {bulletins.length > MAX_BULLETINS_DISPLAY && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Link
                        to="/admin/settings/bulletins"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View All Bulletins ({bulletins.length} total)
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <NewspaperIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">
                    No bulletins found. Click "Add" to create one.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Associate Away List Section */}
          <Card className="h-fit">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Associate Away List
                {displayAwayLogs.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500 font-normal">
                    (Active: {displayAwayLogs.length})
                  </span>
                )}
              </h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => refreshDashboard()}
                  title="Refresh dashboard"
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={PlusIcon}
                  onClick={() =>
                    navigate("/admin/settings/associate-away-log/create")
                  }
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="p-6">
              {displayAwayLogs.length > 0 ? (
                <>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {displayAwayLogs.map((awayLog) => (
                      <div
                        key={awayLog.id}
                        className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                        onClick={() =>
                          navigate(
                            `/admin/settings/associate-away-log/${awayLog.id}/detail`,
                          )
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <Link
                              to={`/admin/associate/${awayLog.associateId}`}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <UserIcon className="w-4 h-4 mr-1" />
                              {awayLog.associateName ||
                                `Associate #${awayLog.associateId}`}
                            </Link>
                            <div className="mt-2 text-xs text-gray-600 space-y-1">
                              <div className="flex items-center">
                                <span className="text-gray-500 mr-2">
                                  Reason:
                                </span>
                                {getReasonDisplay(awayLog)}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="flex items-center">
                                  <CalendarIcon className="w-3 h-3 mr-1 text-gray-400" />
                                  From: {formatDate(awayLog.startDate)}
                                </span>
                                {awayLog.untilFurtherNotice === 1 ? (
                                  <span className="text-amber-600 font-medium flex items-center">
                                    <ClockIcon className="w-3 h-3 mr-1" />
                                    Until further notice
                                  </span>
                                ) : (
                                  <span className="flex items-center">
                                    To: {formatDate(awayLog.untilDate)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* View All Away Logs Link - only show if more than displayed */}
                  {associateAwayLogs.length > MAX_AWAY_LOGS_DISPLAY && (
                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <Link
                        to="/admin/settings/associate-away-logs"
                        className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View All Away Logs ({associateAwayLogs.length} total)
                        <ArrowRightIcon className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarDaysIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">
                    No associates currently away. Click "Add" to create an
                    entry.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Links Section */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Quick Links</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/job-history/my-job-history"
                className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-2">
                  My Job History
                </h3>
                <p className="text-sm text-gray-600">
                  View your personal work order history
                </p>
              </Link>

              <Link
                to="/admin/job-history/team-job-history"
                className="p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-2">
                  Team Job History
                </h3>
                <p className="text-sm text-gray-600">
                  View the team's work order history
                </p>
              </Link>

              <Link
                to="/admin/all-comments"
                className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <h3 className="font-medium text-gray-900 mb-2">Comments</h3>
                <p className="text-sm text-gray-600">
                  View recent comments in the system
                </p>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Create Bulletin Modal */}
      <Modal
        isOpen={showBulletinModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowBulletinModal(false);
            setBulletinText("");
            setErrors({});
          }
        }}
        title="New Bulletin"
        size="md"
      >
        <form onSubmit={handleCreateBulletin}>
          <TextArea
            label="Bulletin Text"
            value={bulletinText}
            onChange={(e) => {
              setBulletinText(e.target.value);
              if (errors.bulletin) {
                setErrors({});
              }
            }}
            placeholder="Enter bulletin text..."
            rows={4}
            error={errors.bulletin}
            required
            disabled={isSubmitting}
          />

          <div className="text-right text-sm text-gray-500 mb-4">
            {bulletinText.length}/1000 characters
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!isSubmitting) {
                  setShowBulletinModal(false);
                  setBulletinText("");
                  setErrors({});
                }
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="success"
              disabled={isSubmitting || !bulletinText.trim()}
              loading={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Bulletin"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isSubmitting) {
            setShowDeleteModal(false);
            setSelectedBulletin(null);
          }
        }}
        title="Delete Bulletin"
        size="md"
      >
        <div className="mb-6">
          <div className="flex items-center mb-4 text-red-600">
            <ExclamationTriangleIcon className="w-6 h-6 mr-2" />
            <span className="font-medium">
              Warning: This action cannot be undone
            </span>
          </div>

          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this bulletin?
          </p>

          {selectedBulletin && (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-700">{selectedBulletin.text}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            variant="secondary"
            onClick={() => {
              if (!isSubmitting) {
                setShowDeleteModal(false);
                setSelectedBulletin(null);
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteBulletin}
            disabled={isSubmitting}
            loading={isSubmitting}
          >
            {isSubmitting ? "Deleting..." : "Delete Bulletin"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminDashboardPage;
