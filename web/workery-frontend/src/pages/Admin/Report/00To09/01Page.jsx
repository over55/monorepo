// File Path: src/pages/Admin/Report/00To09/01Page.jsx
// UIX Upgraded - Uses ReportDateRangeStatusView whole page component
// @uix-page: AdminReport01Page

import React, { useMemo, memo } from "react";
import { ReportDateRangeStatusView } from "../../../../components/business/views";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../../constants/FieldOptions";
import { BanknotesIcon } from "@heroicons/react/24/outline";

/**
 * Report 01: Due Service Fees Report
 * Generates a report of outstanding service fees for associates
 * Requires: date range + status filter
 */
function AdminReport01Page() {
  const config = useMemo(
    () => ({
      reportId: 1,
      reportTitle: "Due Service Fees Report",
      reportDescription:
        "Generate a report of outstanding service fees for associates",
      reportBreadcrumbLabel: "Due Service Fees",
      icon: BanknotesIcon,
      infoMessage:
        "This report will generate a CSV file containing all work orders with outstanding service fees within the specified date range. The dates refer to the assignment date of the work orders.",
      filenamePrefix: "due_service_fees_report",
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
    }),
    [],
  );

  return <ReportDateRangeStatusView config={config} />;
}

const AdminReport01PageMemo = memo(AdminReport01Page);
AdminReport01PageMemo.displayName = "AdminReport01Page";

export default AdminReport01PageMemo;
