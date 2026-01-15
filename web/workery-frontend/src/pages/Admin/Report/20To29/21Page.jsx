// File Path: src/pages/Admin/Report/20To29/21Page.jsx
// UIX Upgraded - Uses ReportSimpleDownloadView whole page component
// @uix-page: AdminReport21Page

import React, { useMemo, memo } from "react";
import { ReportSimpleDownloadView } from "../../../../components/business/views";
import { EnvelopeIcon } from "@heroicons/react/24/outline";

/**
 * Report 21: Marketing Emails Report
 * Exports all users who have opted in to receive marketing emails
 * No parameters required - simple download
 */
function AdminReport21Page() {
  const config = useMemo(
    () => ({
      reportId: 21,
      reportTitle: "Marketing Emails Report",
      reportDescription:
        "Export all users who have opted in to receive marketing emails",
      reportBreadcrumbLabel: "Marketing Emails",
      icon: EnvelopeIcon,
      infoMessage:
        "This report generates a CSV file containing all users who have opted in to receive marketing emails. The export includes email addresses, names, subscription preferences, and signup dates.",
      filenamePrefix: "marketing_emails_report",
      tipTitle: "Quick Tip:",
      tipMessage:
        "Use this report for email campaign management, compliance and GDPR reporting, tracking marketing list growth, and segmenting users for targeted campaigns. The data is current as of the moment you generate the report.",
    }),
    [],
  );

  return <ReportSimpleDownloadView config={config} />;
}

const AdminReport21PageMemo = memo(AdminReport21Page);
AdminReport21PageMemo.displayName = "AdminReport21Page";

export default AdminReport21PageMemo;
