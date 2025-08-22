// File: src/components/UI/Table/Table.jsx

import React from "react";

/**
 * Table Component
 * Data table with configurable columns
 *
 * @param {Array} columns - Column configuration array
 * @param {Array} data - Table data array
 * @param {string} className - Additional CSS classes
 */
function Table({ columns = [], data = [], className = "" }) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.align === "center"
                    ? "text-center"
                    : column.align === "right"
                      ? "text-right"
                      : "text-left"
                }`}
              >
                {column.header || column.label || column.name || ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-8 text-center text-sm text-gray-500"
              >
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                          ? "text-right"
                          : "text-left"
                    }`}
                  >
                    {(() => {
                      // If column has a custom render function, use it
                      if (typeof column.render === "function") {
                        return column.render(
                          row[column.key || column.accessor],
                          row,
                        );
                      }

                      // Get the value using various possible keys
                      let value = null;
                      if (column.accessor) {
                        value = row[column.accessor];
                      } else if (column.key) {
                        value = row[column.key];
                      } else if (column.field) {
                        value = row[column.field];
                      } else if (column.dataIndex) {
                        value = row[column.dataIndex];
                      }

                      // Return the value or a placeholder
                      return value !== null && value !== undefined
                        ? value
                        : "-";
                    })()}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
