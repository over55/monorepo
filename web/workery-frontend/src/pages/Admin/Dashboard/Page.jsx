// File Path: monorepo/web/workery-frontend/src/pages/Admin/Dashboard/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useDashboardManager,
  useAuthManager,
  useBulletinManager,
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
} from "@heroicons/react/24/outline";

function AdminDashboardPage() {
  const dashboardManager = useDashboardManager();
  const bulletinManager = useBulletinManager();
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

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const fetchDashboard = async () => {
    setFetching(true);
    setErrors({});

    try {
      const dashboardData = await dashboardManager.getDashboard(onUnauthorized);
      setDashboard(dashboardData);
      console.log("AdminDashboard: Dashboard data loaded successfully");
    } catch (error) {
      console.error("AdminDashboard: Failed to fetch dashboard:", error);
      setErrors({ fetch: error.message || "Failed to load dashboard data" });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
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

      // Refresh dashboard to show new bulletin
      await fetchDashboard();
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

      // Refresh dashboard to reflect deletion
      await fetchDashboard();
    } catch (error) {
      console.error("Failed to delete bulletin:", error);
      setErrors({ delete: error.message || "Failed to delete bulletin" });
      setShowDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
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

        {/* Office News Section */}
        <Card className="mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <NewspaperIcon className="w-5 h-5 mr-2" />
              Office News
            </h2>
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
              Add Bulletin
            </Button>
          </div>

          <div className="p-6">
            {dashboard.bulletins && dashboard.bulletins.length > 0 ? (
              <div className="space-y-3">
                {dashboard.bulletins.map((bulletin, index) => (
                  <div
                    key={bulletin.id || index}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <p className="text-gray-700 flex-1 mr-4">{bulletin.text}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBulletin(bulletin);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <NewspaperIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>No bulletins found. Click "Add Bulletin" to create one.</p>
              </div>
            )}
          </div>
        </Card>

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
