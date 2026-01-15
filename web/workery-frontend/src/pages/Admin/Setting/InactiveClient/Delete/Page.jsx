// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Delete/Page.jsx
// UIX Upgraded - Uses UIX primitives (redirect page - inactive clients cannot be deleted from here)
// Note: Permanent deletion of client records should be done through Customer management, not from this settings page.

import React, { useEffect, memo } from "react";
import { useNavigate, useParams } from "react-router";
import { UIXThemeProvider, Card, Alert, Button, Breadcrumb } from "../../../../../components/UIX";
import {
  ArchiveBoxIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

function SettingInactiveClientDeletePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const breadcrumbItems = [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Settings", to: "/admin/settings", icon: Cog6ToothIcon },
    { label: "Inactive Clients", to: "/admin/settings/inactive-clients", icon: ArchiveBoxIcon },
    { label: "Delete", icon: TrashIcon, isActive: true },
  ];

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
            Inactive clients cannot be permanently deleted from this settings page.
            This is to protect important historical data.
          </p>

          <Alert type="warning" className="mb-6 text-left">
            <strong>Why can't I delete inactive clients?</strong>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li>Inactive clients are archived customer records that may contain important historical data</li>
              <li>Work order history, financial records, and communications may reference these clients</li>
              <li>For compliance and audit purposes, this data should generally be preserved</li>
            </ul>
          </Alert>

          <Alert type="info" className="mb-6 text-left">
            <strong>Available actions:</strong>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li><strong>Restore:</strong> Return the client to active status</li>
              <li><strong>View Full Profile:</strong> See complete client history and details</li>
            </ul>
          </Alert>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="secondary"
              onClick={() => navigate("/admin/settings/inactive-clients")}
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Inactive Clients
            </Button>
            {id && (
              <Button
                variant="success"
                onClick={() => navigate(`/admin/settings/inactive-client/${id}/update`)}
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Restore This Client
              </Button>
            )}
          </div>

          <p className="mt-4 text-sm text-gray-500">
            You will be automatically redirected in 5 seconds...
          </p>
        </div>
      </Card>
    </div>
  );
}

const SettingInactiveClientDeletePageContent = memo(SettingInactiveClientDeletePage);
SettingInactiveClientDeletePageContent.displayName = "SettingInactiveClientDeletePageContent";

function SettingInactiveClientDeletePageWithProvider() {
  return (
    <UIXThemeProvider>
      <SettingInactiveClientDeletePageContent />
    </UIXThemeProvider>
  );
}

export default SettingInactiveClientDeletePageWithProvider;
