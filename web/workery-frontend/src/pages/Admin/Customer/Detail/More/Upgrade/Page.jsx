// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Upgrade/Page.jsx
// UIX Upgraded - Uses EntityActionUpgradePage whole page component
// @uix-page: AdminCustomerDetailMoreUpgradePage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  ArrowUpCircleIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { EntityActionUpgradePage, Badge } from "../../../../../../components/UIX";

// Constants
const CUSTOMER_TYPE_RESIDENTIAL = 2;
const CUSTOMER_TYPE_COMMERCIAL = 3;

// Organization type options for customers
const CUSTOMER_ORGANIZATION_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "1", label: "Private Corporation" },
  { value: "2", label: "Non-Profit Corporation" },
  { value: "3", label: "Partnership" },
  { value: "4", label: "Sole Proprietorship" },
  { value: "5", label: "Government" },
  { value: "6", label: "Other" },
];

function AdminCustomerDetailMoreUpgradePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onUnauthorized) => {
      return await customerManager.getCustomerDetail(entityId, onUnauthorized);
    },
    [customerManager],
  );

  // Execute upgrade function
  const executeUpgrade = useCallback(
    async (data, onUnauthorized) => {
      return await customerManager.upgradeCustomer(data, onUnauthorized);
    },
    [customerManager],
  );

  // Check if upgrade is disabled (already commercial type)
  const isUpgradeDisabled = useCallback((entity) => {
    return entity?.type === CUSTOMER_TYPE_COMMERCIAL || entity?.organizationName;
  }, []);

  // Get entity display name
  const getEntityDisplayName = useCallback((entity) => {
    return entity ? `${entity.firstName} ${entity.lastName}` : "Unknown";
  }, []);

  // Get current type label
  const getCurrentTypeLabel = useCallback((entity) => {
    if (entity?.type === CUSTOMER_TYPE_COMMERCIAL) {
      return "Commercial/Business Customer";
    }
    return "Residential Customer";
  }, []);

  // Get current type badge
  const getCurrentTypeBadge = useCallback((entity) => {
    if (entity?.type === CUSTOMER_TYPE_COMMERCIAL || entity?.organizationName) {
      return (
        <Badge variant="primary" size="sm">
          Commercial/Business Customer
        </Badge>
      );
    }
    return (
      <Badge variant="success" size="sm">
        Residential Customer
      </Badge>
    );
  }, []);

  // Format upgrade data
  const formatUpgradeData = useCallback((entityId, formData) => {
    return {
      customer_id: entityId,
      organization_name: formData.organizationName?.trim(),
      organization_type: parseInt(formData.organizationType),
    };
  }, []);

  // Validate form data
  const validateFormData = useCallback((formData) => {
    const errors = {};

    if (!formData.organizationName || formData.organizationName.trim().length === 0) {
      errors.organizationName = "Organization name is required";
    } else if (formData.organizationName.trim().length < 2) {
      errors.organizationName = "Organization name must be at least 2 characters";
    }

    if (!formData.organizationType || formData.organizationType === "") {
      errors.organizationType = "Organization type is required";
    }

    return Object.keys(errors).length > 0 ? errors : null;
  }, []);

  // Breadcrumb items
  const breadcrumbItems = useCallback((entityId) => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Customers", to: "/admin/customers", icon: UserIcon },
    { label: "Detail", to: `/admin/customer/${entityId}`, icon: InformationCircleIcon },
    { label: "More", to: `/admin/customer/${entityId}/more`, icon: EllipsisHorizontalIcon },
    { label: "Upgrade", icon: ArrowUpCircleIcon, isActive: true },
  ], []);

  // Render custom entity info
  const renderEntityInfo = useCallback((entity, themeClasses, getCurrentTypeBadgeFn) => (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-medium text-gray-900 mb-3">
        Current Customer Information
      </h4>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
        <div>
          <dt className="text-sm font-medium text-gray-500">Name:</dt>
          <dd className="text-sm text-gray-900">
            {entity?.firstName} {entity?.lastName}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email:</dt>
          <dd className="text-sm text-gray-900">{entity?.email}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Current Type:</dt>
          <dd className="text-sm">
            <span className="text-blue-600 font-medium">Residential</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">New Type:</dt>
          <dd className="text-sm">
            <span className="text-green-600 font-medium">Commercial/Business</span>
          </dd>
        </div>
      </dl>
    </div>
  ), []);

  // Form fields for upgrade
  const formFields = useMemo(() => [
    {
      name: "organizationName",
      label: "Organization Name",
      type: "text",
      required: true,
      placeholder: "Enter the business/organization name",
    },
    {
      name: "organizationType",
      label: "Organization Type",
      type: "select",
      required: true,
      options: CUSTOMER_ORGANIZATION_TYPE_OPTIONS,
    },
  ], []);

  // Configuration
  const config = useMemo(() => ({
    entityType: "Customer",
    entityIdParam: "cid",
    entityIcon: UserIcon,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled,
    disabledMessage: "This customer is already a Business type account. No upgrade is needed.",
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formFields,
    formatUpgradeData,
    validateFormData,
    breadcrumbItems,
    warningConfig: {
      title: "Upgrade Warning",
      description: "You are about to upgrade this customer from Residential type to Business type. This will affect:",
      consequences: [
        "The rates applied to their work orders",
        "The types of services they can request",
        "Tax and billing requirements",
        "Terms and conditions that apply",
      ],
      notice: "Please ensure you have the correct business information before proceeding.",
    },
    impactConfig: {
      title: "After Upgrade",
      items: [
        "Business rates will apply to all future work orders",
        "The customer will be classified as a commercial client",
        "Business documentation may be required",
        "Different terms and conditions will apply",
      ],
    },
    routes: {
      returnPath: `/admin/customer/${cid}/more`,
      successRedirectPath: `/admin/customer/${cid}/more`,
    },
    labels: {
      pageTitle: "Upgrade Customer",
      pageSubtitle: "Upgrade to Business Account",
      confirmTitle: "Confirm Upgrade",
      successMessage: "Customer has been successfully upgraded to Business type",
      actionButtonLabel: "Confirm and Upgrade",
      processingLabel: "Processing...",
    },
  }), [
    cid,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled,
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formFields,
    formatUpgradeData,
    validateFormData,
    breadcrumbItems,
  ]);

  return <EntityActionUpgradePage config={config} />;
}

export default AdminCustomerDetailMoreUpgradePage;
