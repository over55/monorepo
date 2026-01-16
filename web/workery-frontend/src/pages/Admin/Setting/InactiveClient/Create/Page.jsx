// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Create/Page.jsx
// @uix-page: SettingInactiveClientCreatePage
// UIX Upgraded - Uses UIX primitives (redirect page - inactive clients cannot be created)
// Note: Inactive clients are created by archiving existing customers, not by direct creation.

import React, { useEffect, memo } from "react";
import { useNavigate } from "react-router";
import { UIXThemeProvider, Card, Alert, Button, Breadcrumb } from "../../../../../components/UIX";
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const breadcrumbItems = [
  { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
  { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
  { label: "Inactive Clients", to: "/admin/settings/inactive-clients", icon: ArchiveBoxIcon },
  { label: "Create", icon: ExclamationTriangleIcon, isActive: true },
];

function SettingInactiveClientCreatePage() {
  const navigate = useNavigate();

  // Auto-redirect after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/admin/settings/inactive-clients");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} className="mb-8" />

      <Card>
        <div className="p-6 text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Action Not Available
          </h2>
          <p className="text-gray-600 mb-6">
            Inactive clients cannot be created directly. To make a client inactive,
            please archive them from the Customer management section.
          </p>

          <Alert type="info" className="mb-6 text-left">
            <strong>How to archive a client:</strong>
            <ol className="mt-2 ml-4 list-decimal space-y-1">
              <li>Go to the Customers section</li>
              <li>Find the customer you want to archive</li>
              <li>Click on their profile and select "More" options</li>
              <li>Choose "Archive" to make them inactive</li>
            </ol>
          </Alert>

          <div className="flex justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/settings/inactive-clients")}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Inactive Clients
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate("/admin/customers")}
            >
              Go to Customers
            </Button>
          </div>

          <p className="mt-4 text-sm text-gray-500">
            You will be automatically redirected in 5 seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}

const SettingInactiveClientCreatePageContent = memo(SettingInactiveClientCreatePage);
SettingInactiveClientCreatePageContent.displayName = "SettingInactiveClientCreatePageContent";

function SettingInactiveClientCreatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInactiveClientCreatePageContent />
    </UIXThemeProvider>
  );
}

export default SettingInactiveClientCreatePageWithProvider;
