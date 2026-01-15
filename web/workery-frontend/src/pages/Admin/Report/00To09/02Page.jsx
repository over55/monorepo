// File Path: src/pages/Admin/Report/00To09/02Page.jsx
// UIX Upgraded - Uses ReportEntityDateRangeStatusView whole page component
// @uix-page: AdminReport02Page

import React, { useMemo, memo } from "react";
import { ReportEntityDateRangeStatusView } from "../../../../components/business/views";
import { AssociateSelect } from "../../../../components/business/selects";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../../constants/FieldOptions";
import { UserIcon } from "@heroicons/react/24/outline";

/**
 * Report 02: Associate Jobs Report
 * Generates a report of jobs assigned to a specific associate
 * Requires: associate selection + date range + status filter
 */
function AdminReport02Page() {
  const config = useMemo(
    () => ({
      reportId: 2,
      reportTitle: "Associate Jobs Report",
      reportDescription:
        "Generate a report of jobs assigned to a specific associate",
      reportBreadcrumbLabel: "Associate Jobs",
      icon: UserIcon,
      infoMessage:
        "This report will generate a CSV file containing all work orders assigned to the selected associate within the specified date range. The dates refer to the assignment date of the work orders.",
      filenamePrefix: "associate_jobs_report",
      EntitySelectComponent: AssociateSelect,
      entityLabel: "Select Associate",
      entityHelperText: "Start typing to search for an associate by name",
      entityPlaceholder: "Please select an associate",
      entityParamName: "associate_id",
      entityStatusFilter: 1,
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

  return <ReportEntityDateRangeStatusView config={config} />;
}

const AdminReport02PageMemo = memo(AdminReport02Page);
AdminReport02PageMemo.displayName = "AdminReport02Page";

export default AdminReport02PageMemo;
