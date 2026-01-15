// File Path: src/pages/Admin/Report/00To09/05Page.jsx
// UIX Upgraded - Uses ReportSimpleDownloadView whole page component
// @uix-page: AdminReport05Page

import React, { useMemo, memo } from "react";
import { ReportSimpleDownloadView } from "../../../../components/business/views";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";

/**
 * Report 05: Associate Insurance Report
 * Generates a report of all associates' insurance information
 * No parameters required - simple download
 */
function AdminReport05Page() {
  const config = useMemo(
    () => ({
      reportId: 5,
      reportTitle: "Associate Insurance Report",
      reportDescription:
        "Generate a report of all associates' insurance information",
      reportBreadcrumbLabel: "Associate Insurance",
      icon: ShieldCheckIcon,
      infoMessage:
        "This report will generate a CSV file containing current insurance information for all active associates. The report includes insurance policy details, expiration dates, and coverage types.",
      filenamePrefix: "associate_insurance_report",
      tipTitle: "Quick Tip:",
      tipMessage:
        "This report is automatically generated with the most current data. It includes all active associates and their insurance status as of today's date.",
    }),
    [],
  );

  return <ReportSimpleDownloadView config={config} />;
}

const AdminReport05PageMemo = memo(AdminReport05Page);
AdminReport05PageMemo.displayName = "AdminReport05Page";

export default AdminReport05PageMemo;
