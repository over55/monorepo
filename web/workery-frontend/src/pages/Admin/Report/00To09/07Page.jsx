// File Path: src/pages/Admin/Report/00To09/07Page.jsx
// UIX Upgraded - Uses ReportStatusFilterView whole page component
// @uix-page: AdminReport07Page

import React, { useMemo, memo } from "react";
import { ReportStatusFilterView } from "../../../../components/business/views";
import { CakeIcon } from "@heroicons/react/24/outline";

/**
 * Report 07: Associate Birthdays Report
 * Generates a report of all associates' birthdays for celebration planning
 * Requires: status filter only (no date range)
 */
function AdminReport07Page() {
  const config = useMemo(
    () => ({
      reportId: 7,
      reportTitle: "Associate Birthdays Report",
      reportDescription:
        "Generate a report of all associates' birthdays for celebration planning",
      reportBreadcrumbLabel: "Associate Birthdays",
      icon: CakeIcon,
      infoMessage:
        "This report will generate a CSV file containing birthday information for associates. Use this report to plan celebrations, send birthday cards, or recognize your team members on their special day. The report includes birth dates sorted by month and day.",
      filenamePrefix: "associate_birthdays_report",
      statusLabel: "Associate Status Filter",
      statusHelperText:
        'Filter the report by associate status. Select "All Associates" to include everyone.',
      statusOptions: [
        { value: "0", label: "All Associates" },
        { value: "1", label: "Active Associates" },
        { value: "2", label: "Archived Associates" },
      ],
      defaultStatus: "0",
      statusParamName: "state",
    }),
    [],
  );

  return <ReportStatusFilterView config={config} />;
}

const AdminReport07PageMemo = memo(AdminReport07Page);
AdminReport07PageMemo.displayName = "AdminReport07Page";

export default AdminReport07PageMemo;
