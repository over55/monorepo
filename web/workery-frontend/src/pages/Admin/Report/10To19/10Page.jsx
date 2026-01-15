// File Path: src/pages/Admin/Report/10To19/10Page.jsx
// UIX Upgraded - Uses ReportDateRangeStatusView whole page component
// @uix-page: AdminReport10Page

import React, { useMemo, memo } from "react";
import { ReportDateRangeStatusView } from "../../../../components/business/views";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../../constants/FieldOptions";
import { HomeModernIcon } from "@heroicons/react/24/outline";

/**
 * Report 10: Residential Jobs Report
 * Generates a detailed report of residential work orders within a date range
 * Requires: date range + status filter
 */
function AdminReport10Page() {
  const config = useMemo(
    () => ({
      reportId: 10,
      reportTitle: "Residential Jobs Report",
      reportDescription:
        "Generate a detailed report of residential work orders within a date range",
      reportBreadcrumbLabel: "Residential Jobs",
      icon: HomeModernIcon,
      infoMessage:
        "This report will generate a CSV file containing all residential jobs within the specified date range. The dates refer to the assignment date of the work orders. The report includes customer details, job descriptions, assigned associates, and completion status.",
      filenamePrefix: "residential_jobs_report",
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

const AdminReport10PageMemo = memo(AdminReport10Page);
AdminReport10PageMemo.displayName = "AdminReport10Page";

export default AdminReport10PageMemo;
