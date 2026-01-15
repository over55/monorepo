// UIX Upgraded - Uses UIX primitives (Card, Button, Alert, Spinner, Breadcrumb)
// File Path: web/workery-frontend/src/pages/Root/Dashboard/Page.jsx
// Refactored to use RootDashboardPage UIX component

import React, { useMemo } from "react";
import { useAuthManager } from "../../../services/Services";
import { RootDashboardPage } from "../../../components/UIX";
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  HomeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import {
  BuildingOffice2Icon,
  ChartBarIcon as ChartBarSolidIcon,
} from "@heroicons/react/24/solid";

function RootDashboardPageWrapper() {
  const authManager = useAuthManager();

  const config = useMemo(() => ({
    // Services
    authManager,

    // Page configuration
    icon: BuildingOffice2Icon,
    headerIcon: ChartBarSolidIcon,
    title: "Root Dashboard",
    loginPath: "/login",

    // Hero section
    heroTitle: "Organization Management",
    heroDescription: "Manage all the organizations in your system. View, create, edit, and monitor tenant accounts from one centralized dashboard.",

    // Breadcrumb navigation
    breadcrumbItems: [
      {
        label: "Home",
        href: "/",
        icon: HomeIcon,
      },
      {
        label: "Root Dashboard",
        icon: ChartBarIcon,
      },
    ],

    // Primary action buttons
    primaryActions: [
      {
        label: "View Organizations",
        to: "/root/tenants",
        icon: BuildingOfficeIcon,
        variant: "secondary",
      },
      {
        label: "Create Organization",
        to: "/root/tenant/add",
        icon: BuildingOfficeIcon,
        variant: "outline",
      },
    ],

    // System status items
    statusItems: [
      {
        label: "API Status",
        status: "Operational",
        variant: "success",
      },
      {
        label: "Database",
        status: "Connected",
        variant: "success",
      },
    ],
  }), [authManager]);

  return <RootDashboardPage config={config} />;
}

export default RootDashboardPageWrapper;
