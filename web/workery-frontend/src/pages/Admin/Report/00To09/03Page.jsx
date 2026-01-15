// File Path: src/pages/Admin/Report/00To09/03Page.jsx
// UIX Upgraded - Uses ReportDateRangeStatusView whole page component
// @uix-page: AdminReport03Page

import React, { useMemo, memo } from "react";
import { ReportDateRangeStatusView } from "../../../../components/business/views";
import { CreditCardIcon } from "@heroicons/react/24/outline";

/**
 * Report 03: Service Fees by Types Report
 * Generates a breakdown of revenue by service fee types
 * Requires: date range only (no status filter)
 */
function AdminReport03Page() {
  const config = useMemo(
    () => ({
      reportId: 3,
      reportTitle: "Service Fees by Types Report",
      reportDescription: "Generate a breakdown of revenue by service fee types",
      reportBreadcrumbLabel: "Service Fees by Types",
      icon: CreditCardIcon,
      infoMessage:
        "This report will generate a CSV file containing a breakdown of all service fees collected within the specified date range, grouped by service fee type. The dates refer to the invoice service fee payment date.",
      filenamePrefix: "service_fees_by_types_report",
      fromDateLabel: "From Date",
      toDateLabel: "To Date",
      fromDateHelperText: "Start date for invoice service fee payments",
      toDateHelperText: "End date for invoice service fee payments",
      defaultDaysBack: 30,
      showStatus: false,
    }),
    [],
  );

  return <ReportDateRangeStatusView config={config} />;
}

const AdminReport03PageMemo = memo(AdminReport03Page);
AdminReport03PageMemo.displayName = "AdminReport03Page";

export default AdminReport03PageMemo;
