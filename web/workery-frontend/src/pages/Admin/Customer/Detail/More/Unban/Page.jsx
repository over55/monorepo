// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Unban/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Modal, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldExclamationIcon,
  EnvelopeIcon,
  PhoneIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import {
  Card,
  Alert,
  Button,
  Breadcrumb,
  Modal,
  Spinner,
  Badge,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../../../components/UIX";

function AdminCustomerDetailMoreUnbanPage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(true);
  const [customer, setCustomer] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUnbanning, setIsUnbanning] = useState(false);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Unauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Load customer details
  useEffect(() => {
    let mounted = true;

    const fetchCustomer = async () => {
      setFetching(true);
      setErrors({});

      try {
        const data = await customerManager.getCustomerDetail(cid, onUnauthorized);
        if (mounted) {
          setCustomer(data);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch customer:", error);
          setErrors(error || { message: "Failed to load customer details" });
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    if (cid) {
      fetchCustomer();
    } else {
      setErrors({ message: "No customer ID provided" });
      setFetching(false);
    }

    return () => {
      mounted = false;
    };
  }, [cid, customerManager, onUnauthorized]);

  // Handle unban confirmation
  const handleConfirmUnban = useCallback(async () => {
    setShowConfirmModal(false);
    setErrors({});
    setIsUnbanning(true);

    try {
      const unbanData = {
        customer_id: cid,
      };

      await customerManager.unbanCustomer(unbanData, onUnauthorized);

      setSuccessMessage("Customer has been successfully unbanned and can now access the system");

      // Navigate back to customer more after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to unban customer:", error);
      setErrors(error || { message: "Failed to unban customer" });
      setIsUnbanning(false);
    }
  }, [cid, customerManager, onUnauthorized, navigate]);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Check if banned
  const isBanned = customer?.isBanned === true;

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Customers", to: "/admin/customers", icon: UserIcon },
    { label: "Detail", to: `/admin/customer/${cid}`, icon: ClipboardDocumentListIcon },
    { label: "More", to: `/admin/customer/${cid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Unban", icon: CheckCircleIcon, isActive: true },
  ], [cid]);

  // Get status badge
  const getStatusBadge = (entity) => {
    if (entity?.isBanned) {
      return (
        <Badge variant="danger" size="sm">
          <ShieldExclamationIcon className="w-3 h-3 mr-1 inline" />
          Banned
        </Badge>
      );
    } else if (entity?.status === 1) {
      return <Badge variant="success" size="sm">Active</Badge>;
    } else if (entity?.status === 2) {
      return <Badge variant="warning" size="sm">Archived</Badge>;
    }
    return <Badge variant="secondary" size="sm">Unknown</Badge>;
  };

  // Render loading state
  if (isFetching) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading customer details...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // Render error state
  if (!customer && Object.keys(errors).length > 0) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Alert type="error" className="mb-6">
          {errors.message || errors.detail || "Failed to load customer details. Please try again."}
        </Alert>
        <Link to={`/admin/customer/${cid}/more`}>
          <Button variant="secondary">Back to More</Button>
        </Link>
      </Card>
    );
  }

  if (!customer) return null;

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-7xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Title */}
      <div className="mb-6">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <UserIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Customer: {customer.firstName} {customer.lastName}
        </h1>
        <p className={`mt-1 text-sm ${themeClasses.textSecondary} flex items-center`}>
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Restore customer access to the system
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-4">
          <CheckCircleIcon className="w-5 h-5 mr-2 inline" />
          {successMessage}
        </Alert>
      )}

      {/* Error Messages */}
      {errors.message && (
        <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Status alerts */}
      {customer?.status === 2 && (
        <Alert type="warning" className="mb-4">
          Customer is archived
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Info Message */}
        {isBanned ? (
          <Alert type="success" className="mb-6">
            <div className="flex items-start">
              <CheckCircleIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">
                  Restore Customer Access
                </h3>
                <p className="mb-3">
                  You are about to <strong>unban</strong> this customer. This means:
                </p>
                <ul className="space-y-1 ml-4">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Ban status will be removed
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Warning banner will no longer display
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Customer will regain full access to services
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    Previous ban reason will be cleared
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    The customer can be banned again if necessary
                  </li>
                </ul>
                <p className="mt-3">
                  Please ensure this decision has been properly reviewed and approved.
                </p>
              </div>
            </div>
          </Alert>
        ) : (
          <Alert type="info" className="mb-6">
            This customer is not currently banned. No unban action is needed.
          </Alert>
        )}

        {/* Customer Information */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-gray-600" />
            Customer Information
          </h4>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Name:</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {customer.firstName} {customer.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email:</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                {customer.email}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Phone:</dt>
              <dd className="mt-1 text-sm text-gray-900 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                {formatPhone(customer.phone) || "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Status:</dt>
              <dd className="mt-1">{getStatusBadge(customer)}</dd>
            </div>
            {customer.banningReason && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Ban Reason:</dt>
                <dd className="mt-1 text-sm text-gray-900 italic">{customer.banningReason}</dd>
              </div>
            )}
            {customer.banningReasonOther && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Additional Details:</dt>
                <dd className="mt-1 text-sm text-gray-900 italic">{customer.banningReasonOther}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
          <Link to={`/admin/customer/${cid}/more`}>
            <Button variant="secondary" disabled={isUnbanning}>
              Back to More
            </Button>
          </Link>

          {isBanned && (
            <Button
              variant="success"
              onClick={() => setShowConfirmModal(true)}
              disabled={isUnbanning}
              loading={isUnbanning}
              icon={CheckCircleIcon}
            >
              {isUnbanning ? "Processing..." : "Proceed with Unban"}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Unban"
        size="md"
      >
        <div>
          <p className="text-sm text-gray-500 mb-3">
            You are about to restore access for:
          </p>

          <p className="text-sm font-semibold text-gray-900 mb-3">
            {customer.firstName} {customer.lastName} ({customer.email})
          </p>

          <Alert type="info" className="mb-3">
            <strong>Actions that will occur:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Ban status will be removed</li>
              <li>• Warning banner will no longer display</li>
              <li>• Customer will regain full access to services</li>
              <li>• Previous ban reason will be cleared</li>
            </ul>
          </Alert>

          <p className="text-sm text-gray-500">
            Are you sure you want to proceed with unbanning this customer?
          </p>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isUnbanning}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleConfirmUnban}
              disabled={isUnbanning}
              loading={isUnbanning}
            >
              {isUnbanning ? "Unbanning..." : "Yes, Unban Customer"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminCustomerDetailMoreUnbanPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreUnbanPage />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreUnbanPageWithProvider;
