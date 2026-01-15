// File: monorepo/web/frontend/src/components/business/views/AttachmentsView.jsx

import React from "react";
import { Link } from "react-router";
import {
  PaperClipIcon,
  PlusCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  DocumentIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { formatDateForDisplay } from "../../../services/Helpers/DateFormatter";
import DetailView from "./DetailView.jsx";
import {
  ViewButton,
  EditButton,
  DeleteButton,
  CreateButton,
  CreateFirstButton,
  useUIXTheme,
} from "../../UIX";

/**
 * Reusable AttachmentsView component for displaying and managing attachments
 * Used for staff, customer, and other entity attachment pages
 *
 * @param {object} item - The main entity (staff, customer, etc.)
 * @param {string} itemType - Type of item (e.g., "Staff Member", "Customer")
 * @param {React.Component} itemIcon - Icon component for the item type
 * @param {string} basePath - Base path for navigation (e.g., "/admin/staff")
 * @param {string} itemId - ID of the item for routing
 * @param {Array} tabItems - Array of tab navigation items
 * @param {Array} breadcrumbs - Breadcrumb navigation items
 * @param {boolean} loading - Loading state
 * @param {string} error - Error message if any
 * @param {function} onErrorClear - Function to clear error
 * @param {object} attachments - Attachments data object with results array
 * @param {function} onRowClick - Function to handle attachment row click
 * @param {function} onAddClick - Function to handle add attachment click
 * @param {boolean} canAdd - Whether user can add attachments
 * @param {string} addPath - Path for adding new attachment
 * @param {string} viewPath - Path template for viewing attachment (use {id} placeholder)
 * @param {string} editPath - Path template for editing attachment (use {id} placeholder)
 * @param {string} deletePath - Path template for deleting attachment (use {id} placeholder)
 * @param {number} pageSize - Current page size
 * @param {function} onPageSizeChange - Function to handle page size change
 * @param {Array} previousCursors - Array of previous cursors for pagination
 * @param {string} nextCursor - Next cursor for pagination
 * @param {function} onNextClick - Function to handle next page click
 * @param {function} onPreviousClick - Function to handle previous page click
 * @param {React.Node} additionalActions - Additional action buttons
 * @param {string} alertMessage - Alert message to display
 * @param {string} alertType - Alert type (success/error)
 * @param {function} onAlertClear - Function to clear alert
 */
function AttachmentsView({
  item = null,
  itemType = "Item",
  itemIcon,
  basePath = "/admin",
  itemId,
  tabItems = [],
  breadcrumbs = [],
  loading = false,
  error = null,
  onErrorClear = null,
  attachments = null,
  onRowClick,
  // eslint-disable-next-line no-unused-vars
  onAddClick,
  canAdd = true,
  addPath = "",
  viewPath = "",
  editPath = "",
  // eslint-disable-next-line no-unused-vars
  deletePath = "",
  pageSize = 50,
  onPageSizeChange,
  previousCursors = [],
  // eslint-disable-next-line no-unused-vars
  nextCursor = "",
  onNextClick,
  onPreviousClick,
  additionalActions = null,
  alertMessage = "",
  alertType = "",
  onAlertClear = null,
  onSelectForDeletion = null,
}) {
  const { getThemeClasses } = useUIXTheme();
  // Get file type icon
  // eslint-disable-next-line no-unused-vars
  const getFileTypeIcon = (fileType) => {
    if (!fileType) return <DocumentIcon className={`w-5 h-5 ${getThemeClasses("text-muted")}`} />;

    const type = fileType.toLowerCase();
    if (type.includes("pdf")) {
      return <DocumentTextIcon className="w-5 h-5 text-red-500" />;
    } else if (
      type.includes("image") ||
      type.includes("jpg") ||
      type.includes("png")
    ) {
      return <DocumentIcon className={`w-5 h-5 ${getThemeClasses('link-primary')}`} />;
    } else {
      return <DocumentIcon className={`w-5 h-5 ${getThemeClasses("text-muted")}`} />;
    }
  };

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  // Header actions for the DetailView
  const headerActions = (
    <>
      {canAdd && addPath && (
        <Link to={addPath}>
          <CreateButton
            disabled={!canAdd}
            size="lg"
          >
            New
          </CreateButton>
        </Link>
      )}
    </>
  );

  // Footer actions
  const footerActions = (
    <>
      {canAdd && addPath && (
        <Link to={addPath}>
          <CreateButton
            disabled={!canAdd}
            size="lg"
          >
            New
          </CreateButton>
        </Link>
      )}
      {additionalActions}
    </>
  );

  return (
    <>

      <DetailView
        item={item}
        itemType={itemType}
        itemIcon={itemIcon}
        detailType="Attachments"
        detailIcon={PaperClipIcon}
        basePath={basePath}
        itemId={itemId}
        tabItems={tabItems}
        activeTab="Attachments"
        breadcrumbs={breadcrumbs}
        loading={loading}
        error={error}
        onErrorClear={onErrorClear}
        showEditButton={false}
        backPath={basePath || undefined}
        backLabel={basePath ? `Back to ${itemType}` : undefined}
        headerActions={headerActions}
        footerActions={basePath ? footerActions : undefined}
      >
        {/* Success/Error Alerts */}
        {alertMessage && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg flex items-center ${
              alertType === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <ExclamationCircleIcon className="w-5 h-5 mr-2" />
            <span>{alertMessage}</span>
            {onAlertClear && (
              <button
                onClick={onAlertClear}
                className="ml-auto text-current hover:opacity-70"
              >
                ×
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
              <p className={`mt-4 ${getThemeClasses("text-secondary")}`}>Loading attachments...</p>
            </div>
          </div>
        ) : attachments &&
          attachments.results &&
          (attachments.results.length > 0 || previousCursors.length > 0) ? (
          <>
            {/* Attachments Table */}
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className={getThemeClasses('table-header-bg')}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses('table-header-text')}`}>
                      Title
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses('table-header-text')}`}>
                      Status
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses('table-header-text')}`}>
                      Created
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${getThemeClasses('table-header-text')}`}>
                      File
                    </th>
                    <th className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${getThemeClasses('table-header-text')}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`${getThemeClasses('bg-card')} divide-y ${getThemeClasses('border-secondary')}`}>
                  {attachments.results.map((attachment, index) => (
                    <tr
                      key={attachment.id || index}
                      className={`${getThemeClasses('table-row-hover')} cursor-pointer transition-colors`}
                      onClick={() => onRowClick && onRowClick(attachment)}
                    >
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getThemeClasses("text-primary")}`}>
                        {attachment.title || "Untitled"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {attachment.status === 1 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getThemeClasses('badge-default')}`}>
                            Archived
                          </span>
                        )}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm ${getThemeClasses("text-muted")}`}>
                        <div className="flex items-center">
                          <CalendarIcon className={`w-4 h-4 mr-2 ${getThemeClasses("text-muted")}`} />
                          {formatDateForDisplay(attachment.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <span className={getThemeClasses("text-primary")}>
                            {attachment.filename ||
                              attachment.fileName ||
                              "Unknown file"}
                          </span>
                          {attachment.objectUrl && (
                            <a
                              href={attachment.objectUrl}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className={`inline-flex items-center ${getThemeClasses('link-primary')}`}
                            >
                              <ArrowDownTrayIcon className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {viewPath && (
                            <ViewButton
                              to={viewPath.replace("{id}", attachment.id)}
                              onClick={(e) => e.stopPropagation()}
                              size="sm"
                            />
                          )}
                          {editPath && (
                            <EditButton
                              to={editPath.replace("{id}", attachment.id)}
                              onClick={(e) => e.stopPropagation()}
                              size="sm"
                            />
                          )}
                          {onSelectForDeletion && (
                            <DeleteButton
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectForDeletion(attachment);
                              }}
                              size="sm"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <label className={`mr-3 text-sm font-medium ${getThemeClasses("text-secondary")}`}>
                  Items per page:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange && onPageSizeChange(parseInt(e.target.value))}
                  className={`px-3 py-2 border ${getThemeClasses("border-secondary")} rounded-lg focus:ring-blue-500 focus:border-blue-500`}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3">
                {previousCursors.length > 0 && onPreviousClick && (
                  <button
                    onClick={onPreviousClick}
                    className={`inline-flex items-center px-4 py-2 border ${getThemeClasses("border-secondary")} rounded-lg text-sm font-medium ${getThemeClasses("text-secondary")} ${getThemeClasses("bg-card")} hover:${getThemeClasses("bg-disabled")} transition-colors`}
                  >
                    <ChevronLeftIcon className="w-4 h-4 mr-2" />
                    Previous
                  </button>
                )}
                {attachments.hasNextPage && onNextClick && (
                  <button
                    onClick={onNextClick}
                    className={`inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium transition-colors ${getThemeClasses('button-primary')}`}
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          // No attachments message
          <div className={`text-center py-16 ${getThemeClasses("bg-disabled")} rounded-lg`}>
            <PaperClipIcon className={`w-12 h-12 ${getThemeClasses('link-secondary')} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${getThemeClasses("text-primary")} mb-2`}>
              No Attachments Found
            </h3>
            <p className={`${getThemeClasses("text-muted")} mb-4`}>
              No attachments have been uploaded for this {itemType.toLowerCase()}.
            </p>
            {canAdd && addPath && (
              <Link to={addPath}>
                <CreateFirstButton
                  size="md"
                >
                  Add First Attachment
                </CreateFirstButton>
              </Link>
            )}
          </div>
        )}
      </DetailView>
    </>
  );
}

export default AttachmentsView;