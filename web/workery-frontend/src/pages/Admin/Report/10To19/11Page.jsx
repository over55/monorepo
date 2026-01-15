// File Path: src/pages/Admin/Report/10To19/11Page.jsx
// UIX Upgraded - Uses ReportDateRangeStatusView whole page component
// @uix-page: AdminReport11Page

import React, { useMemo, memo } from "react";
import { ReportDateRangeStatusView } from "../../../../components/business/views";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../../constants/FieldOptions";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";

/**
 * Report 11: Commercial Jobs Report
 * Generates a detailed report of commercial work orders within a date range
 * Requires: date range + status filter
 */
function AdminReport11Page() {
  const config = useMemo(
    () => ({
      reportId: 11,
      reportTitle: "Commercial Jobs Report",
      reportDescription:
        "Generate a detailed report of commercial work orders within a date range",
      reportBreadcrumbLabel: "Commercial Jobs",
      icon: BuildingOfficeIcon,
      infoMessage:
        "This report will generate a CSV file containing all commercial jobs within the specified date range. The dates refer to the assignment date of the work orders. The report includes business details, job descriptions, assigned associates, and completion status.",
      filenamePrefix: "commercial_jobs_report",
      fromDateLabel: "From Date",
      toDateLabel: "To Date",
      fromDateHelperText: "Start date for the report (assignment date)",
      toDateHelperText: "End date for the report (assignment date)",
      statusLabel: "Job Status Filter",
      statusHelperText:
        "Filter the report by specific job status or select 'All' for all statuses",
      statusOptions: ORDER_STATUS_FILTER_OPTIONS,
      defaultStatus: "0",
      defaultDaysBack: 30,
      showStatus: true,
      showDateRangeWarning: true,
    }),
    [],
  );

  return <ReportDateRangeStatusView config={config} />;
}

const AdminReport11PageMemo = memo(AdminReport11Page);
AdminReport11PageMemo.displayName = "AdminReport11Page";

export default AdminReport11PageMemo;
