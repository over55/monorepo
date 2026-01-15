// File Path: src/pages/Admin/Report/20To29/20Page.jsx
// UIX Upgraded - Uses ReportDateRangeStatusView whole page component
// @uix-page: AdminReport20Page

import React, { useMemo, memo } from "react";
import { ReportDateRangeStatusView } from "../../../../components/business/views";
import { CreditCardIcon } from "@heroicons/react/24/outline";

/**
 * Report 20: Payments Report
 * Generates a comprehensive report of all payments received
 * Requires: date range (no status filter)
 */
function AdminReport20Page() {
  const config = useMemo(
    () => ({
      reportId: 20,
      reportTitle: "Payments Report",
      reportDescription:
        "Generate a comprehensive report of all payments received",
      reportBreadcrumbLabel: "Payments",
      icon: CreditCardIcon,
      infoMessage:
        "This report generates a detailed CSV file containing all payment transactions within the specified date range. It includes invoice details, payment amounts, service fees, customer information, and payment status. The dates refer to the invoice service fee payment date.",
      filenamePrefix: "payments_report",
      fromDateLabel: "From Date",
      toDateLabel: "To Date",
      fromDateHelperText: "Start date for the report (payment date)",
      toDateHelperText: "End date for the report (payment date)",
      defaultDaysBack: 30,
      showStatus: false,
      showDateRangeWarning: true,
      tipTitle: "Quick Tip:",
      tipMessage:
        "Use this report for monthly accounting reconciliation, quarterly financial reporting, tracking payment trends, and analyzing service fee collection rates.",
    }),
    [],
  );

  return <ReportDateRangeStatusView config={config} />;
}

const AdminReport20PageMemo = memo(AdminReport20Page);
AdminReport20PageMemo.displayName = "AdminReport20Page";

export default AdminReport20PageMemo;
