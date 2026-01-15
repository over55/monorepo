// File: src/components/UIX/EntityReportDetail/EntityReportDetail.jsx
// UIX Mobile Optimizations Applied

import React, { memo } from "react";
import {
  Breadcrumb,
  Alert,
  useUIXTheme,
} from "../";
import {
  HomeIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";

/**
 * EntityReportDetail - A reusable whole-page component for report detail pages
 *
 * @param {Object} props - Component props
 * @param {string} props.reportTitle - Title of the report (e.g., "Due Service Fees Report")
 * @param {string} props.reportDescription - Description of the report
 * @param {string} props.reportBreadcrumbLabel - Label for breadcrumb (e.g., "Due Service Fees")
 * @param {React.Component} props.icon - HeroIcon component for the report
 * @param {React.ReactNode} props.children - Form content to render inside the card
 * @param {Array} props.recentDownloads - Array of recent download items
 * @param {boolean} props.showSuccess - Whether to show success message
 * @param {Object} props.errors - Error object for display
 * @param {string} props.infoMessage - Info alert message to display
 * @param {Function} props.onDismissSuccess - Callback when success message is dismissed
 * @param {Function} props.onDismissErrors - Callback when errors are dismissed
 * @param {string} props.reportId - Optional report ID for filtering recent downloads
 * @param {string} props.reportType - Optional report type for filtering recent downloads
 */
const EntityReportDetail = memo(function EntityReportDetail({
  reportTitle,
  reportDescription,
  reportBreadcrumbLabel,
  icon: IconComponent,
  children,
  recentDownloads = [],
  showSuccess = false,
  errors = {},
  infoMessage = "",
  onDismissSuccess,
  onDismissErrors,
  reportId,
  reportType,
}) {
  const { getThemeClasses } = useUIXTheme();

  // Breadcrumb items
  const breadcrumbItems = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      icon: HomeIcon,
    },
    {
      label: "Reports",
      to: "/admin/reports",
      icon: ChartBarIcon,
    },
    {
      label: reportBreadcrumbLabel || reportTitle,
      icon: IconComponent,
      isActive: true,
    },
  ];

  // Filter recent downloads if reportId or reportType provided
  const filteredDownloads = recentDownloads.filter((item) => {
    if (reportId && reportType) {
      return item.reportId === reportId || item.reportType === reportType;
    }
    if (reportId) {
      return item.reportId === reportId;
    }
    if (reportType) {
      return item.reportType === reportType;
    }
    return true;
  }).slice(0, 5);

  return (
    <div className={`min-h-screen ${getThemeClasses("bg-gradient-primary")}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Content */}
        <div className="space-y-6">
          {/* Report Form Card */}
          <div className={`${getThemeClasses("bg-card")} shadow-lg rounded-lg overflow-hidden border ${getThemeClasses("card-border")}`}>
            {/* Card Header */}
            <div className={`px-6 py-4 ${getThemeClasses("bg-gradient-header")} border-b ${getThemeClasses("border-color")}`}>
              <div className="flex items-center">
                <IconComponent className={`w-6 h-6 ${getThemeClasses("text-header-icon")} mr-3`} />
                <div>
                  <h1 className={`text-xl font-semibold ${getThemeClasses("text-header")}`}>
                    {reportTitle}
                  </h1>
                  <p className={`text-sm ${getThemeClasses("text-header-secondary")} mt-1`}>
                    {reportDescription}
                  </p>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6">
              {/* Success Message */}
              {showSuccess && (
                <Alert
                  type="success"
                  message="Report downloaded successfully! Check your downloads folder."
                  className="mb-6"
                  dismissible={!!onDismissSuccess}
                  onDismiss={onDismissSuccess}
                />
              )}

              {/* Error Display */}
              {Object.keys(errors).length > 0 && (
                <div className="mb-6">
                  <Alert
                    type="error"
                    message="There were errors with your submission:"
                    dismissible={!!onDismissErrors}
                    onDismiss={onDismissErrors}
                  />
                  <ul className={`list-disc list-inside mt-2 text-sm ${getThemeClasses("text-error")}`}>
                    {Object.entries(errors).map(([field, message]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {typeof message === "string" ? message : "Invalid value"}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Info Alert */}
              {infoMessage && (
                <Alert
                  type="info"
                  message={infoMessage}
                  className="mb-6"
                />
              )}

              {/* Form Content - Passed as children */}
              {children}
            </div>
          </div>

          {/* Recent Downloads */}
          {filteredDownloads.length > 0 && (
            <div className={`${getThemeClasses("bg-card")} shadow-lg rounded-lg overflow-hidden border ${getThemeClasses("card-border")}`}>
              <div className={`px-6 py-4 ${getThemeClasses("bg-gradient-header")} border-b ${getThemeClasses("border-color")}`}>
                <div className="flex items-center">
                  <ClockIcon className={`w-5 h-5 ${getThemeClasses("text-header")} mr-2`} />
                  <h2 className={`text-lg font-semibold ${getThemeClasses("text-header")}`}>
                    Recent Downloads
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredDownloads.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 ${getThemeClasses("bg-secondary")} rounded-lg hover:shadow-md transition-all duration-200 border ${getThemeClasses("border-color")}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${getThemeClasses("text-primary")} truncate`}>
                            {item.filename}
                          </p>
                          <p className={`text-xs ${getThemeClasses("text-secondary")} mt-1`}>
                            {new Date(item.downloadedAt).toLocaleString()}
                          </p>
                        </div>
                        <DocumentArrowDownIcon className={`w-4 h-4 ${getThemeClasses("text-secondary")} flex-shrink-0 ml-2`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

EntityReportDetail.displayName = "EntityReportDetail";

export default EntityReportDetail;
