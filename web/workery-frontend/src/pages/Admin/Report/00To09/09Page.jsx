// File Path: src/pages/Admin/Report/00To09/09Page.jsx
// UIX Upgraded - Uses ReportSimpleDownloadView whole page component
// @uix-page: AdminReport09Page

import React, { useMemo, memo } from "react";
import { ReportSimpleDownloadView } from "../../../../components/business/views";
import { MapPinIcon } from "@heroicons/react/24/outline";

/**
 * Report 09: Client Addresses Report
 * Generates a comprehensive report of all client addresses and contact information
 * No parameters required - simple download
 */
function AdminReport09Page() {
  const config = useMemo(
    () => ({
      reportId: 9,
      reportTitle: "Client Addresses Report",
      reportDescription:
        "Generate a comprehensive report of all client addresses and contact information",
      reportBreadcrumbLabel: "Client Addresses",
      icon: MapPinIcon,
      infoMessage:
        "This report will generate a CSV file containing all client addresses and contact information. The report includes mailing addresses, phone numbers, email addresses, and geographic distribution data.",
      filenamePrefix: "client_addresses_report",
      tipTitle: "Quick Tip:",
      tipMessage:
        "This report automatically includes all active clients in your system. The data is current as of the moment you generate the report. You can import the CSV file into mapping software or mailing services.",
    }),
    [],
  );

  return <ReportSimpleDownloadView config={config} />;
}

const AdminReport09PageMemo = memo(AdminReport09Page);
AdminReport09PageMemo.displayName = "AdminReport09Page";

export default AdminReport09PageMemo;
