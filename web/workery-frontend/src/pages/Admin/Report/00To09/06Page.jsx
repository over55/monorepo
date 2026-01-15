// File Path: src/pages/Admin/Report/00To09/06Page.jsx
// UIX Upgraded - Uses ReportSimpleDownloadView whole page component
// @uix-page: AdminReport06Page

import React, { useMemo, memo } from "react";
import { ReportSimpleDownloadView } from "../../../../components/business/views";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

/**
 * Report 06: Associate Police Check Report
 * Generates a report of all associates' police check status
 * No parameters required - simple download
 */
function AdminReport06Page() {
  const config = useMemo(
    () => ({
      reportId: 6,
      reportTitle: "Associate Police Check Report",
      reportDescription:
        "Generate a report of all associates' police check status",
      reportBreadcrumbLabel: "Associate Police Check",
      icon: ShieldCheckIcon,
      infoMessage:
        "This report will generate a CSV file containing the police check status for all active associates. The report includes police check dates, expiration dates, and compliance status to help ensure all associates meet safety requirements.",
      filenamePrefix: "associate_police_check_report",
      tipTitle: "Quick Tip:",
      tipMessage:
        "This report is automatically generated with the most current data. It includes all active associates and their police check status as of today's date. Use this report for compliance auditing and safety verification.",
    }),
    [],
  );

  return <ReportSimpleDownloadView config={config} />;
}

const AdminReport06PageMemo = memo(AdminReport06Page);
AdminReport06PageMemo.displayName = "AdminReport06Page";

export default AdminReport06PageMemo;
