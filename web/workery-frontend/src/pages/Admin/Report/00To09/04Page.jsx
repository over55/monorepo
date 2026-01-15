// File Path: src/pages/Admin/Report/00To09/04Page.jsx
// UIX Upgraded - Uses ReportDateRangeStatusView whole page component
// @uix-page: AdminReport04Page

import React, { useMemo, memo } from "react";
import { ReportDateRangeStatusView } from "../../../../components/business/views";
import { XCircleIcon } from "@heroicons/react/24/outline";

/**
 * Report 04: Cancelled Jobs Report
 * Generates a report of all cancelled jobs within a date range
 * Requires: date range only (no status filter)
 */
function AdminReport04Page() {
  const config = useMemo(
    () => ({
      reportId: 4,
      reportTitle: "Cancelled Jobs Report",
      reportDescription:
        "Generate a report of all cancelled jobs within a date range",
      reportBreadcrumbLabel: "Cancelled Jobs",
      icon: XCircleIcon,
      infoMessage:
        "This report will generate a CSV file containing all cancelled jobs within the specified date range. The dates refer to the assignment date of the work orders. The report includes cancellation reasons and associated details.",
      filenamePrefix: "cancelled_jobs_report",
      fromDateLabel: "From Date",
      toDateLabel: "To Date",
      fromDateHelperText: "Start date for the report (assignment date)",
      toDateHelperText: "End date for the report (assignment date)",
      defaultDaysBack: 30,
      showStatus: false,
    }),
    [],
  );

  return <ReportDateRangeStatusView config={config} />;
}

const AdminReport04PageMemo = memo(AdminReport04Page);
AdminReport04PageMemo.displayName = "AdminReport04Page";

export default AdminReport04PageMemo;
