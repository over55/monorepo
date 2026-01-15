// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/More/Downgrade/Page.jsx
// UIX Upgraded - Uses EntityActionUpgradePage whole page component (for downgrade)
// @uix-page: AdminCustomerDetailMoreDowngradePage

import React, { useMemo, useCallback } from "react";
import { useParams } from "react-router";
import {
  ChartBarIcon,
  UserIcon,
  ArrowDownCircleIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useCustomerManager } from "../../../../../../services/Services";
import { EntityActionUpgradePage, Badge } from "../../../../../../components/UIX";

// Constants
const CUSTOMER_TYPE_RESIDENTIAL = 2;
const CUSTOMER_TYPE_COMMERCIAL = 3;

function AdminCustomerDetailMoreDowngradePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();

  // Fetch entity function
  const fetchEntity = useCallback(
    async (entityId, onUnauthorized) => {
      return await customerManager.getCustomerDetail(entityId, onUnauthorized);
    },
    [customerManager],
  );

  // Execute downgrade function
  const executeUpgrade = useCallback(
    async (data, onUnauthorized) => {
      return await customerManager.downgradeCustomer(data, onUnauthorized);
    },
    [customerManager],
  );

  // Check if downgrade is disabled (not business/commercial type)
  const isUpgradeDisabled = useCallback((entity) => {
    return !entity?.organizationName || entity?.type !== CUSTOMER_TYPE_COMMERCIAL;
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

  // Format downgrade data
  const formatUpgradeData = useCallback((entityId, formData) => {
    return {
      customer_id: entityId,
    };
  }, []);

  // Breadcrumb items
  const breadcrumbItems = useCallback((entityId) => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Customers", to: "/admin/customers", icon: UserIcon },
    { label: "Detail", to: `/admin/customer/${entityId}`, icon: InformationCircleIcon },
    { label: "More", to: `/admin/customer/${entityId}/more`, icon: EllipsisHorizontalIcon },
    { label: "Downgrade", icon: ArrowDownCircleIcon, isActive: true },
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
            <span className="text-green-600 font-medium">Commercial/Business</span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">New Type:</dt>
          <dd className="text-sm">
            <span className="text-blue-600 font-medium">Residential</span>
          </dd>
        </div>
        {entity?.organizationName && (
          <div className="sm:col-span-2">
            <dt className="text-sm font-medium text-gray-500">Current Organization:</dt>
            <dd className="text-sm text-gray-900">
              {entity.organizationName}{" "}
              <span className="text-red-600 text-xs font-medium">(will be removed)</span>
            </dd>
          </div>
        )}
      </dl>
    </div>
  ), []);

  // Configuration
  const config = useMemo(() => ({
    entityType: "Customer",
    entityIdParam: "cid",
    entityIcon: UserIcon,
    fetchEntity,
    executeUpgrade,
    isUpgradeDisabled,
    disabledMessage: "This customer is not currently a Business type account. No downgrade is needed.",
    getEntityDisplayName,
    getCurrentTypeLabel,
    getCurrentTypeBadge,
    renderEntityInfo,
    formFields: [],
    formatUpgradeData,
    breadcrumbItems,
    warningConfig: {
      title: "Downgrade Warning",
      description: "You are about to downgrade this customer from Business type to Residential type. This will affect:",
      consequences: [
        "The rates applied to their work orders (will use residential rates)",
        "The types of services they can receive",
        "Tax and billing calculations",
        "Terms and conditions that apply",
        "Organization information will be removed",
        "Associate assignment criteria may change",
      ],
      notice: "Are you sure you want to continue?",
    },
    impactConfig: {
      title: "After Downgrade",
      items: [
        "Residential rates will apply to all future work orders",
        "The customer will be classified as a residential client",
        "Business-specific features will be disabled",
        "Organization information will be permanently removed",
        "Service terms and conditions will be updated",
      ],
    },
    routes: {
      returnPath: `/admin/customer/${cid}/more`,
      successRedirectPath: `/admin/customer/${cid}/more`,
    },
    labels: {
      pageTitle: "Downgrade Customer",
      pageSubtitle: "Downgrade to Residential",
      confirmTitle: "Confirm Downgrade",
      successMessage: "Customer has been successfully downgraded to Residential type",
      actionButtonLabel: "Downgrade to Residential",
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
    formatUpgradeData,
    breadcrumbItems,
  ]);

  return <EntityActionUpgradePage config={config} />;
}

export default AdminCustomerDetailMoreDowngradePage;
