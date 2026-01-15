// File: monorepo/web/frontend/src/components/business/views/DetailView.jsx

import React from "react";
import { Link } from "react-router";
import {
  ChartBarIcon,
  ChevronLeftIcon,
  PencilSquareIcon,
  ArchiveBoxIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { Breadcrumb, useUIXTheme } from "../../UIX";

/**
 * Reusable DetailView component for displaying detailed information
 * Used across staff pages (detail full, comments, attachments, more)
 *
 * @param {object} item - The main data object to display
 * @param {string} itemType - Type of item (e.g., "Staff Member", "Customer")
 * @param {string} itemIcon - Icon component for the item type
 * @param {string} detailType - Type of detail view (e.g., "Detail", "Comments")
 * @param {string} detailIcon - Icon component for the detail type
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} itemId - ID of the item for routing
 * @param {Array} tabItems - Array of tab navigation items
 * @param {string} activeTab - Currently active tab
 * @param {Array} breadcrumbs - Breadcrumb navigation items
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message if any
 * @param {function} onErrorClear - Function to clear error
 * @param {boolean} showEditButton - Whether to show edit button
 * @param {boolean} canEdit - Whether editing is allowed
 * @param {string} editPath - Path for edit functionality
 * @param {string} backPath - Path for back navigation
 * @param {string} backLabel - Label for back button
 * @param {React.Node} children - Main content to display
 * @param {React.Node} headerActions - Additional header actions
 * @param {React.Node} footerActions - Additional footer actions
 */
function DetailView({
  item = null,
  itemType = "Item",
  // eslint-disable-next-line no-unused-vars
  itemIcon: ItemIcon = InformationCircleIcon,
  detailType = "Detail",
  // eslint-disable-next-line no-unused-vars
  detailIcon: DetailIcon = InformationCircleIcon,
  // eslint-disable-next-line no-unused-vars
  basePath = "/admin",
  // eslint-disable-next-line no-unused-vars
  itemId,
  tabItems = [],
  // eslint-disable-next-line no-unused-vars
  activeTab = "",
  breadcrumbs = [],
  loading = false,
  error = null,
  onErrorClear = null,
  showEditButton = true,
  canEdit = true,
  editPath = "",
  backPath = "",
  backLabel = "Back",
  children,
  headerActions = null,
  footerActions = null,
}) {
  const { getThemeClasses } = useUIXTheme();
  // Loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${getThemeClasses('border-primary')} mx-auto`}></div>
            <p className={`mt-4 text-sm sm:text-base ${getThemeClasses('text-secondary')}`}>
              Loading {itemType.toLowerCase()} details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* UIX Breadcrumb */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb items={breadcrumbs} />
      )}

      {/* Page Title - Responsive */}
      {itemType && itemType.trim() && (
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className={`text-2xl sm:text-3xl font-bold ${getThemeClasses('text-primary')} flex items-center`}>
                <ItemIcon className={`w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 ${getThemeClasses('link-primary')} flex-shrink-0`} />
                {itemType}
              </h1>
              <p className={`mt-1 text-xs sm:text-sm ${getThemeClasses('text-secondary')} flex items-center`}>
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
                View {detailType.toLowerCase()} information
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Status Alerts - Responsive */}
      {item && item.status === 2 && (
        <div className={`mb-4 ${getThemeClasses('alert-info-bg')} border ${getThemeClasses('alert-info-border')} ${getThemeClasses('alert-info-text')} px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base`}>
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This {itemType.toLowerCase()} is archived
        </div>
      )}

      {/* Error Display - Responsive */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="break-words">{error}</span>
            {onErrorClear && (
              <button
                onClick={onErrorClear}
                className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
              >
                ×
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${getThemeClasses('bg-card')} shadow-sm rounded-lg`}>
        {item && (
          <>
            {/* Header with Actions - Responsive */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className={`text-xl sm:text-2xl font-semibold ${getThemeClasses('text-primary')} flex items-center`}>
                  <DetailIcon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${getThemeClasses('link-primary')} flex-shrink-0`} />
                  {detailType}
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  {backPath && (
                    <Link to={backPath} className="flex-1 sm:flex-initial">
                      <button className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white ${getThemeClasses('bg-secondary')} hover:${getThemeClasses('bg-primary')} transition-colors`}>
                        <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        {backLabel}
                      </button>
                    </Link>
                  )}
                  {showEditButton && editPath && (
                    <Link to={editPath} className="flex-1 sm:flex-initial">
                      <button
                        disabled={!canEdit}
                        className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium transition-colors ${
                          !canEdit
                            ? `${getThemeClasses('text-muted')} ${getThemeClasses('bg-disabled')} cursor-not-allowed`
                            : "text-white bg-amber-600 hover:bg-amber-700"
                        }`}
                      >
                        <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        Edit
                      </button>
                    </Link>
                  )}
                  {headerActions}
                </div>
              </div>
            </div>

            {/* Tab Navigation - Responsive with horizontal scroll on mobile */}
            {tabItems.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="px-4 sm:px-6">
                  <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                    {tabItems.map((tab, index) => (
                      <React.Fragment key={index}>
                        {tab.isActive ? (
                          <div className={`border-b-2 ${getThemeClasses('border-primary')} py-3 sm:py-4 px-1 text-sm sm:text-base font-medium ${getThemeClasses('link-primary')} whitespace-nowrap flex items-center`}>
                            {tab.label}
                            {tab.icon && (
                              <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                            )}
                          </div>
                        ) : (
                          <Link
                            to={tab.href}
                            className={`border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium ${getThemeClasses('text-muted')} hover:${getThemeClasses('text-secondary')} hover:${getThemeClasses('border-secondary')} whitespace-nowrap flex items-center`}
                          >
                            {tab.label}
                            {tab.icon && (
                              <tab.icon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                            )}
                          </Link>
                        )}
                      </React.Fragment>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Main Content Area - Responsive */}
            <div className="p-4 sm:p-6">
              {children}

              {/* Footer Actions - Responsive */}
              {(backPath || footerActions) && (
                <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                  {backPath && (
                    <Link to={backPath} className="order-2 sm:order-1">
                      <button className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white ${getThemeClasses('bg-secondary')} hover:${getThemeClasses('bg-primary')} transition-colors`}>
                        <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                        {backLabel}
                      </button>
                    </Link>
                  )}

                  {footerActions && (
                    <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                      {footerActions}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {!item && !loading && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className={`inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 ${getThemeClasses('bg-disabled')} rounded-full mb-4`}>
              <ItemIcon className={`w-6 sm:w-8 h-6 sm:h-8 ${getThemeClasses('text-muted')}`} />
            </div>
            <h3 className={`text-base sm:text-lg font-medium ${getThemeClasses('text-primary')} mb-2`}>
              {itemType} Not Found
            </h3>
            <p className={`text-sm sm:text-base ${getThemeClasses('text-muted')} mb-4 sm:mb-6`}>
              The {itemType.toLowerCase()} you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            {backPath && (
              <Link to={backPath}>
                <button className={`inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium transition-colors ${getThemeClasses('button-primary')}`}>
                  <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                  {backLabel}
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default DetailView;