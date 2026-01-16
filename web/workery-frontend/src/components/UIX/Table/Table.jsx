// File: src/components/UI/Table/Table.jsx
// UIX Mobile Optimizations Applied

import React, { memo, useMemo } from "react";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

// Move static default value outside component to prevent recreation
const NO_DATA_MESSAGE = "No data available";
const PLACEHOLDER_VALUE = "-";

/**
 * Table Component - Performance Optimized
 * Data table with configurable columns
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized theme classes to prevent multiple getThemeClasses calls
 * - Memoized className strings
 * - Memoized header row rendering
 * - Memoized table rows rendering
 * - Prevented unnecessary re-renders
 *
 * @param {Array} columns - Column configuration array
 * @param {Array} data - Table data array
 * @param {string} className - Additional CSS classes
 */
const Table = memo(function Table({ columns = [], data = [], className = "" }) {
  const { getThemeClasses } = useUIXTheme();

  // Memoize all theme classes to prevent multiple calls on each render
  const themeClasses = useMemo(
    () => ({
      cardBorder: getThemeClasses('card-border'),
      tableHeaderBg: getThemeClasses('table-header-bg'),
      tableHeaderText: getThemeClasses('table-header-text'),
      bgPrimary: getThemeClasses('bg-primary'),
      textMuted: getThemeClasses('text-muted'),
      textPrimary: getThemeClasses('text-primary'),
      tableRowHover: getThemeClasses('table-row-hover'),
    }),
    [getThemeClasses],
  );

  // Memoize className strings
  const tableClassName = useMemo(() => {
    return `min-w-full divide-y ${themeClasses.cardBorder}`;
  }, [themeClasses.cardBorder]);

  const tbodyClassName = useMemo(() => {
    return `${themeClasses.bgPrimary}`;
  }, [themeClasses.bgPrimary]);

  // Memoize header row rendering
  const headerRow = useMemo(() => {
    return columns.map((column, index) => {
      const alignClass = column.align === "center"
        ? "text-center"
        : column.align === "right"
          ? "text-right"
          : "text-left";

      return (
        <th
          key={index}
          className={`px-6 py-3 text-xs font-medium uppercase tracking-wider ${themeClasses.tableHeaderText} ${alignClass}`}
        >
          {column.header || column.label || column.name || ""}
        </th>
      );
    });
  }, [columns, themeClasses.tableHeaderText]);

  // Memoize table body rows rendering
  const bodyRows = useMemo(() => {
    if (data.length === 0) {
      return (
        <tr>
          <td
            colSpan={columns.length}
            className={`px-6 py-8 text-center text-sm ${themeClasses.textMuted}`}
          >
            {NO_DATA_MESSAGE}
          </td>
        </tr>
      );
    }

    return data.map((row, rowIndex) => {
      // Generate a unique key that handles cases where row.id might be 0, null, or undefined
      const uniqueKey = row.id !== null && row.id !== undefined ? `row-${row.id}` : `index-${rowIndex}`;

      return (
        <tr key={uniqueKey} className={`${themeClasses.tableRowHover} transition-all duration-200`}>
          {columns.map((column, colIndex) => {
            const alignClass = column.align === "center"
              ? "text-center"
              : column.align === "right"
                ? "text-right"
                : "text-left";

            let cellContent;

            // If column has a custom render function, use it
            // Pass full row as first argument for intuitive access
            if (typeof column.render === "function") {
              cellContent = column.render(row, rowIndex);
            } else {
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
              cellContent = value !== null && value !== undefined
                ? value
                : PLACEHOLDER_VALUE;
            }

            return (
              <td
                key={colIndex}
                className={`px-6 py-4 whitespace-nowrap text-lg align-middle ${themeClasses.textPrimary} ${alignClass}`}
              >
                {cellContent}
              </td>
            );
          })}
        </tr>
      );
    });
  }, [data, columns, themeClasses]);

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className={tableClassName}>
        <thead className={themeClasses.tableHeaderBg}>
          <tr>
            {headerRow}
          </tr>
        </thead>
        <tbody className={tbodyClassName}>
          {bodyRows}
        </tbody>
      </table>
    </div>
  );
});

// Set display name for React DevTools
Table.displayName = 'Table';

export default Table;
