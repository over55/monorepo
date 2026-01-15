// File Path: web/workery-frontend/src/pages/Admin/Report/Page.jsx
// UIX Upgraded - Uses CardGridDashboardView whole page component
// @uix-page: AdminReportPage

import React, { useMemo, memo } from "react";
import { CardGridDashboardView } from "../../../components/business/views";
import {
  HomeIcon,
  ChartBarIcon,
  BanknotesIcon,
  UserIcon,
  CreditCardIcon,
  XCircleIcon,
  ShieldCheckIcon,
  CakeIcon,
  WrenchIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  TagIcon,
  CalendarDaysIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

// Define all available reports
const REPORTS = [
  {
    id: 1,
    title: "Due Service Fees",
    description: "List due service fees for associates.",
    path: "/admin/report/1",
    category: "Financial",
    icon: BanknotesIcon,
  },
  {
    id: 2,
    title: "Associate Jobs",
    description: "List jobs by Associate.",
    path: "/admin/report/2",
    category: "Associates",
    icon: UserIcon,
  },
  {
    id: 3,
    title: "Service Fees by Types",
    description: "List revenue by service fee types.",
    path: "/admin/report/3",
    category: "Financial",
    icon: CreditCardIcon,
  },
  {
    id: 4,
    title: "Cancelled Jobs",
    description: "List all cancelled jobs.",
    path: "/admin/report/4",
    category: "Orders",
    icon: XCircleIcon,
  },
  {
    id: 5,
    title: "Associate Insurance",
    description: "List insurance due dates.",
    path: "/admin/report/5",
    category: "Associates",
    icon: ShieldCheckIcon,
  },
  {
    id: 6,
    title: "Associate Police Check",
    description: "List police check due dates.",
    path: "/admin/report/6",
    category: "Associates",
    icon: ShieldCheckIcon,
  },
  {
    id: 7,
    title: "Associate Birthdays",
    description: "List associates by birthdate.",
    path: "/admin/report/7",
    category: "Associates",
    icon: CakeIcon,
  },
  {
    id: 8,
    title: "Associate Skill Set",
    description: "List associate skill sets.",
    path: "/admin/report/8",
    category: "Associates",
    icon: WrenchIcon,
  },
  {
    id: 9,
    title: "Client Addresses",
    description: "List client addresses.",
    path: "/admin/report/9",
    category: "Clients",
    icon: UserGroupIcon,
  },
  {
    id: 10,
    title: "Residential Jobs",
    description: "List all residential jobs.",
    path: "/admin/report/10",
    category: "Orders",
    icon: HomeIcon,
  },
  {
    id: 11,
    title: "Commercial Jobs",
    description: "List only commercial jobs.",
    path: "/admin/report/11",
    category: "Orders",
    icon: BuildingOfficeIcon,
  },
  {
    id: 12,
    title: "Skill Sets",
    description: "List of all skill sets.",
    path: "/admin/report/12",
    category: "System",
    icon: BriefcaseIcon,
  },
  {
    id: 13,
    title: "Leads by Skill",
    description: "List of jobs by skill set.",
    path: "/admin/report/13",
    category: "Orders",
    icon: TagIcon,
  },
  {
    id: 15,
    title: "Associate Expiry Dates",
    description: "List upcoming expiry dates.",
    path: "/admin/report/15",
    category: "Associates",
    icon: CalendarDaysIcon,
  },
  {
    id: 16,
    title: "How Users Find Us (long)",
    description: "List how users discovered us.",
    path: "/admin/report/16",
    category: "Marketing",
    icon: GlobeAltIcon,
  },
  {
    id: 17,
    title: "How Users Find Us (short)",
    description: "List how users discovered us and referral sources.",
    path: "/admin/report/17",
    category: "Marketing",
    icon: GlobeAltIcon,
  },
  {
    id: 19,
    title: "Job Tags by Assignment Dates",
    description: "List jobs by tags using assignment dates as a filter.",
    path: "/admin/report/19",
    category: "Orders",
    icon: CalendarIcon,
  },
  {
    id: 22,
    title: "Job Tags by Completion Dates",
    description: "List jobs by tags using completion dates as a filter.",
    path: "/admin/report/22",
    category: "Orders",
    icon: CalendarIcon,
  },
  {
    id: 20,
    title: "Payments",
    description: "List all payments and related information.",
    path: "/admin/report/20",
    category: "Financial",
    icon: CreditCardIcon,
  },
  {
    id: 21,
    title: "Marketing Emails",
    description: "List all emails of consenting user's email addresses.",
    path: "/admin/report/21",
    category: "Marketing",
    icon: EnvelopeIcon,
  },
];

// Breadcrumb items
const BREADCRUMB_ITEMS = [
  {
    label: "Dashboard",
    to: "/admin/dashboard",
    icon: HomeIcon,
  },
  {
    label: "Reports",
    icon: ChartBarIcon,
    isActive: true,
  },
];

// Quick access items
const QUICK_ACCESS_ITEMS = [
  {
    title: "Due Service Fees",
    description: "View outstanding service fees",
    path: "/admin/report/1",
    bgColor: "bg-green-50",
  },
  {
    title: "Associate Jobs",
    description: "Track jobs by associate",
    path: "/admin/report/2",
    bgColor: "bg-blue-50",
  },
  {
    title: "Payments",
    description: "View all payment transactions",
    path: "/admin/report/20",
    bgColor: "bg-amber-50",
  },
];

// Statistics builder function
const buildStatistics = (filteredItems, allItems, itemsByCategory, _categories) => [
  {
    value: allItems.length,
    label: "Total Reports",
    color: "text-gray-900",
  },
  {
    value: filteredItems.length,
    label: "Filtered",
    color: "text-blue-600",
  },
  {
    value: Object.keys(itemsByCategory).length,
    label: "Categories",
    color: "text-gray-900",
  },
  {
    value: itemsByCategory["Financial"]?.length || 0,
    label: "Financial",
    color: "text-green-600",
  },
];

function AdminReportPage() {
  // Memoize the config to prevent unnecessary re-renders
  const config = useMemo(
    () => ({
      breadcrumbItems: BREADCRUMB_ITEMS,
      title: "Reports",
      subtitle: "Generate and view system reports",
      titleIcon: ChartBarIcon,
      items: REPORTS,
      itemLinkText: "View Report",
      showSearch: true,
      showCategoryFilter: true,
      showStatistics: true,
      buildStatistics,
      quickAccessItems: QUICK_ACCESS_ITEMS,
    }),
    [],
  );

  return <CardGridDashboardView config={config} />;
}

const AdminReportPageContent = memo(AdminReportPage);
AdminReportPageContent.displayName = "AdminReportPageContent";

export default AdminReportPageContent;
