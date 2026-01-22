// File Path: monorepo/web/workery-frontend/src/pages/Admin/Order/Update/Page.jsx
// UIX Upgraded - Uses EntityUpdatePage whole page component
// @uix-page: AdminOrderUpdatePage

import React, { useMemo } from "react";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { useOrderManager } from "../../../../services/Services";
import { EntityUpdatePage, UIXThemeProvider } from "../../../../components/UIX";
import {
  OrderGeneralInfoSection,
  OrderSkillSetsSection,
  OrderMetricsSection,
} from "../../../../components/UIX/EntityUpdatePage/examples/OrderFormSections";
import { ORDER_STATUS_ARCHIVED } from "../../../../constants/Order";

// Static configuration constants
const ENTITY_NAME = "Order";
const ENTITY_TYPE = "order";
const ID_PARAM = "oid";
const ARCHIVED_STATUS = ORDER_STATUS_ARCHIVED;

// Static initial form data template
const INITIAL_FORM_DATA = Object.freeze({
  startDate: "",
  isOngoing: 0,
  isHomeSupportService: 0,
  description: "",
  skillSets: [],
  tags: [],
});

// Static form sections array
const FORM_SECTIONS = Object.freeze([
  OrderGeneralInfoSection,
  OrderSkillSetsSection,
  OrderMetricsSection,
]);

// Static breadcrumb items
const BREADCRUMB_ITEMS = Object.freeze([
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: ChartBarIcon,
    hideOnMobile: false,
    mobileLabel: "Dash",
  },
  {
    label: "Orders",
    to: "/admin/orders",
    icon: WrenchScrewdriverIcon,
  },
  {
    label: "Detail",
    to: "/admin/order/{oid}",
    icon: InformationCircleIcon,
  },
  {
    label: "Update",
    icon: PencilSquareIcon,
    isActive: true,
  },
]);

// Static tab items
const TAB_ITEMS = Object.freeze([
  {
    label: "Summary",
    to: `/admin/order/{oid}`,
  },
  {
    label: "Detail",
    to: `/admin/order/{oid}/detail`,
  },
  {
    label: "Tasks",
    to: `/admin/order/{oid}/tasks`,
  },
  {
    label: "Activity",
    to: `/admin/order/{oid}/activity`,
  },
  {
    label: "Comments",
    to: `/admin/order/{oid}/comments`,
  },
  {
    label: "Attachments",
    to: `/admin/order/{oid}/attachments`,
  },
  {
    label: "More",
    to: `/admin/order/{oid}/more`,
    icon: EllipsisHorizontalIcon,
  },
]);

// Helper function for date formatting
const formatDateForInput = (dateValue) => {
  if (!dateValue) return "";
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

// Validation function
const validateForm = (formData) => {
  const newErrors = {};

  if (!formData.description || formData.description.trim() === "") {
    newErrors.description = "Description is required";
  }

  if (!formData.skillSets || formData.skillSets.length === 0) {
    newErrors.skillSets = "Please select at least one skill set";
  }

  if (formData.isOngoing === 0) {
    newErrors.isOngoing = "Please select if this job is one-time or ongoing";
  }

  if (formData.isHomeSupportService === 0) {
    newErrors.isHomeSupportService = "Please select if this is a home support service";
  }

  return newErrors;
};

// Format response data function
const formatDataFromResponse = (response) => {
  // Helper function to safely map array fields
  const mapArrayField = (field, mapFn = (item) => item.id || item) => {
    return field && Array.isArray(field) ? field.map(mapFn) : [];
  };

  return {
    startDate: formatDateForInput(response.startDate),
    isOngoing: response.isOngoing ? 1 : 2,
    isHomeSupportService: response.isHomeSupportService ? 1 : 2,
    description: response.description || "",
    skillSets: mapArrayField(response.skillSets),
    tags: mapArrayField(response.tags),
  };
};

// Format submit data function
const formatDataForSubmit = (formData, entityId) => {
  return {
    id: entityId,
    isOngoing: formData.isOngoing === 1,
    isHomeSupportService: formData.isHomeSupportService === 1,
    startDate: formData.startDate || null,
    description: formData.description,
    skillSets: formData.skillSets || [],
    tags: formData.tags || [],
  };
};

function AdminOrderUpdatePage() {
  const orderManager = useOrderManager();

  // Memoize the manager object with its methods
  const manager = useMemo(
    () => ({
      getDetail: (id, onUnauthorized, options) =>
        orderManager.getOrderDetail(id, onUnauthorized, options),
      update: (id, data, onUnauthorized) =>
        orderManager.updateOrder(id, data, onUnauthorized),
    }),
    [orderManager],
  );

  // Memoize the entire configuration object
  const config = useMemo(
    () => ({
      // Basic entity information
      entityName: ENTITY_NAME,
      entityType: ENTITY_TYPE,
      idParam: ID_PARAM,
      archivedStatus: ARCHIVED_STATUS,

      // Icons
      icon: WrenchScrewdriverIcon,
      dashboardIcon: ChartBarIcon,
      detailIcon: InformationCircleIcon,
      updateIcon: PencilSquareIcon,

      // Manager with CRUD operations
      manager,

      // Initial form data structure - create new object from frozen template
      initialFormData: { ...INITIAL_FORM_DATA },

      // Form sections to render
      formSections: FORM_SECTIONS,

      // Validation, formatting functions
      validateForm,
      formatDataFromResponse,
      formatDataForSubmit,

      // Custom breadcrumb items
      breadcrumbItems: BREADCRUMB_ITEMS,

      // Custom tab items
      tabItems: TAB_ITEMS,
    }),
    [manager],
  );

  return (
    <UIXThemeProvider>
      <EntityUpdatePage config={config} />
    </UIXThemeProvider>
  );
}

export default AdminOrderUpdatePage;
