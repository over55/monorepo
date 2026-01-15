// File Path: src/pages/Admin/Report/10To19/12Page.jsx
// UIX Upgraded - Uses ReportSimpleDownloadView whole page component
// @uix-page: AdminReport12Page

import React, { useMemo, memo } from "react";
import { ReportSimpleDownloadView } from "../../../../components/business/views";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

/**
 * Report 12: Skill Sets Report
 * Generates a complete list of all skill sets in the system
 * No parameters required - simple download
 */
function AdminReport12Page() {
  const config = useMemo(
    () => ({
      reportId: 12,
      reportTitle: "Skill Sets Report",
      reportDescription:
        "Generate a complete list of all skill sets in the system",
      reportBreadcrumbLabel: "Skill Sets",
      icon: WrenchScrewdriverIcon,
      infoMessage:
        "This report will generate a CSV file containing all skill sets currently configured in the system. No filters or parameters are needed - simply click the download button to generate the complete list.",
      filenamePrefix: "skill_sets_report",
      tipTitle: "Quick Tip:",
      tipMessage:
        "Review skill sets for completeness and accuracy. Use this report to identify underutilized or redundant skill categories, and for workforce planning and recruitment.",
    }),
    [],
  );

  return <ReportSimpleDownloadView config={config} />;
}

const AdminReport12PageMemo = memo(AdminReport12Page);
AdminReport12PageMemo.displayName = "AdminReport12Page";

export default AdminReport12PageMemo;
