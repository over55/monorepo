// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Ban/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Button, Modal, etc.)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
  NoSymbolIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
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

// Banning reason options
const CUSTOMER_BANNING_REASON_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Other (please specify)" },
  { value: 2, label: "Abusive behavior" },
  { value: 3, label: "Fraudulent activity" },
  { value: 4, label: "Violation of terms of service" },
  { value: 5, label: "Non-payment of services" },
  { value: 6, label: "Harassment of staff or associates" },
  { value: 7, label: "Repeated policy violations" },
];

function AdminCustomerDetailMoreBanPage() {
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
  const [banningReason, setBanningReason] = useState("");
  const [banningReasonOther, setBanningReasonOther] = useState("");
  const [isBanning, setIsBanning] = useState(false);

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

  // Handle ban confirmation
  const handleConfirmBan = useCallback(async () => {
    // Validate reason
    if (!banningReason) {
      setErrors({ banningReason: "Please select a banning reason" });
      return;
    }

    if (parseInt(banningReason) === 1 && !banningReasonOther.trim()) {
      setErrors({ banningReasonOther: "Please specify the banning reason" });
      return;
    }

    setShowConfirmModal(false);
    setErrors({});
    setIsBanning(true);

    try {
      const banData = {
        customer_id: cid,
        banning_reason: parseInt(banningReason),
        banning_reason_other: banningReasonOther.trim(),
      };

      await customerManager.banCustomer(banData, onUnauthorized);

      setSuccessMessage("Customer has been successfully banned");

      // Navigate to customer more page after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}/more`);
      }, 2000);
    } catch (error) {
      console.error("Failed to ban customer:", error);
      setErrors(error || { message: "Failed to ban customer" });
      setIsBanning(false);
    }
  }, [cid, banningReason, banningReasonOther, customerManager, onUnauthorized, navigate]);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Check if already banned
  const isAlreadyBanned = customer?.status === 100 || customer?.isBanned;

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Customers", to: "/admin/customers", icon: UserIcon },
    { label: "Detail", to: `/admin/customer/${cid}`, icon: ClipboardDocumentListIcon },
    { label: "More", to: `/admin/customer/${cid}/more`, icon: EllipsisHorizontalIcon },
    { label: "Ban", icon: NoSymbolIcon, isActive: true },
  ], [cid]);

  // Get status badge
  const getStatusBadge = (entity) => {
    if (entity?.status === 100 || entity?.isBanned) {
      return (
        <Badge variant="danger" size="sm">
          <NoSymbolIcon className="w-3 h-3 mr-1 inline" />
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
          <NoSymbolIcon className="w-4 h-4 mr-1" />
          Ban Customer
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
      {(errors.banningReason || errors.banningReasonOther || errors.message) && (
        <Alert type="error" className="mb-4" dismissible onDismiss={() => setErrors({})}>
          {errors.banningReason || errors.banningReasonOther || errors.message}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card>
        {/* Warning Message */}
        <Alert type="error" className="mb-6">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                Ban Customer - Severe Action Warning
              </h3>
              <p className="mb-3">
                You are about to <strong>permanently ban</strong> this customer. This means:
              </p>
              <ul className="space-y-2 ml-4">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  The customer will be <strong>immediately</strong> logged out
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  They will <strong>not</strong> be able to log in again
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  All access to the system will be <strong>permanently revoked</strong>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  The customer will not be able to place or manage any work orders
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  The customer will still appear in search results with a <strong>banned banner displayed</strong>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  This action is <strong>irreversible</strong> without system administrator intervention
                </li>
              </ul>
              <p className="mt-4 font-semibold">
                This action should only be taken for serious violations or security concerns.
              </p>
            </div>
          </div>
        </Alert>

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
                {formatPhone(customer.phone)}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Current Status:</dt>
              <dd className="mt-1">{getStatusBadge(customer)}</dd>
            </div>
          </dl>
        </div>

        {/* Ban Reason Form */}
        {!isAlreadyBanned && (
          <>
            {/* Banning Reason Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="banningReason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Banning Reason <span className="text-red-500">*</span>
              </label>
              <select
                id="banningReason"
                name="banningReason"
                value={banningReason}
                onChange={(e) => {
                  setBanningReason(e.target.value);
                  setErrors({});
                }}
                disabled={isBanning}
                className={`block w-full rounded-lg border ${
                  errors.banningReason ? "border-red-300" : "border-gray-300"
                } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                {CUSTOMER_BANNING_REASON_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Other Reason Text Field */}
            {parseInt(banningReason) === 1 && (
              <div className="mb-6">
                <label
                  htmlFor="banningReasonOther"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Banning Reason (Other) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="banningReasonOther"
                  name="banningReasonOther"
                  rows={5}
                  value={banningReasonOther}
                  onChange={(e) => {
                    setBanningReasonOther(e.target.value);
                    setErrors({});
                  }}
                  disabled={isBanning}
                  className={`block w-full rounded-lg border ${
                    errors.banningReasonOther ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Please provide a detailed reason for banning this customer..."
                  maxLength={500}
                />
                <p className="mt-2 text-sm text-gray-500">
                  This reason will be recorded in the system logs and may be reviewed by administrators.
                </p>
              </div>
            )}
          </>
        )}

        {/* Already Banned Message */}
        {isAlreadyBanned && (
          <Alert type="info" className="mb-6">
            This customer is already banned. No further action is needed.
          </Alert>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-200">
          <Link to={`/admin/customer/${cid}/more`}>
            <Button variant="secondary" disabled={isBanning}>
              Back to More
            </Button>
          </Link>

          {!isAlreadyBanned && (
            <Button
              variant="danger"
              onClick={() => setShowConfirmModal(true)}
              disabled={isBanning || !banningReason}
              loading={isBanning}
              icon={NoSymbolIcon}
            >
              {isBanning ? "Processing..." : "Proceed with Ban"}
            </Button>
          )}
        </div>
      </Card>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Final Ban Confirmation"
        size="md"
      >
        <div>
          <Alert type="error" className="mb-4">
            <strong>THIS ACTION CANNOT BE UNDONE</strong>
          </Alert>

          <p className="text-sm text-gray-500 mb-3">
            You are about to permanently ban:
          </p>

          <p className="text-sm font-semibold text-gray-900 mb-3">
            {customer.firstName} {customer.lastName} ({customer.email})
          </p>

          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <p className="text-sm font-medium text-gray-700 mb-1">Ban Reason:</p>
            <p className="text-sm text-gray-600 font-semibold">
              {CUSTOMER_BANNING_REASON_OPTIONS.find((opt) => opt.value == banningReason)?.label}
            </p>
            {parseInt(banningReason) === 1 && banningReasonOther && (
              <p className="text-sm text-gray-600 italic mt-1">
                Details: {banningReasonOther}
              </p>
            )}
          </div>

          <p className="text-sm text-gray-500 mb-3">
            This will immediately revoke all access and log the customer out of the system.
          </p>

          <p className="text-sm font-semibold text-red-600">
            Are you absolutely certain you want to proceed?
          </p>

          <div className="mt-5 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmModal(false)}
              disabled={isBanning}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleConfirmBan}
              disabled={isBanning}
              loading={isBanning}
            >
              {isBanning ? "Banning..." : "Yes, Ban Customer"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminCustomerDetailMoreBanPageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminCustomerDetailMoreBanPage />
    </UIXThemeProvider>
  );
}

export default AdminCustomerDetailMoreBanPageWithProvider;
