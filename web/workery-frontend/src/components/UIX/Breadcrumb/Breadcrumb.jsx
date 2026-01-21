// File: src/components/UIX/Breadcrumb/Breadcrumb.jsx
// UIX Mobile Optimizations Applied
/* eslint-disable react-refresh/only-export-components */

import React, { memo, useMemo, useCallback } from "react";
import { Link } from "react-router";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { useUIXTheme } from "../themes/useUIXTheme.jsx";

/**
 * Breadcrumb Component - FULLY OPTIMIZED VERSION
 *
 * Performance optimizations included:
 * - Component memoization to prevent unnecessary re-renders
 * - Static configurations moved outside component
 * - Memoized class computations
 * - Optimized theme class retrieval (single call per render)
 * - Separated BreadcrumbItem component for better performance
 * - Accessibility improvements
 * - Keyboard navigation support
 *
 * Modern navigation aid with rounded design and blue theme
 * Follows the admin style guide standards
 *
 * @param {Array} items - Array of breadcrumb items:
 *   - label: Display text (required)
 *   - to: React Router path (optional - for Link components)
 *   - href: External URL (optional - for anchor tags)
 *   - onClick: Click handler (optional)
 *   - icon: Heroicon component (optional)
 *   - isActive: Boolean to mark current page (optional)
 *   - disabled: Boolean to disable interaction (optional)
 * @param {string} className - Additional CSS classes for container
 * @param {string} separator - Custom separator element (optional)
 * @param {string} ariaLabel - Custom aria label (optional)
 * @param {Object} ...props - Additional props to pass to nav element
 */

// ============================================
// STATIC CONFIGURATIONS
// Move outside component to prevent recreation on each render
// ============================================

// Shadow styles (created once, reused)
// Uses black with alpha transparency for consistent shadow appearance
const SHADOW_STYLE = Object.freeze({
  boxShadow:
    "0 10px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)",
});

// Base classes that never change
const NAV_BASE_CLASSES = "flex mb-6 sm:mb-8 lg:mb-10";
const LIST_BASE_CLASSES =
  "inline-flex items-center space-x-1 md:space-x-3 whitespace-nowrap rounded-full px-6 py-3 shadow-xl border-2";
const ITEM_BASE_CLASSES = "inline-flex items-center";
const LINK_BASE_CLASSES =
  "text-sm sm:text-base font-medium transition-all duration-200 px-3 py-1 rounded-full inline-flex items-center min-h-[44px] touch-manipulation select-none";
const ACTIVE_BASE_CLASSES =
  "ml-1 text-sm sm:text-base font-semibold px-3 py-1 md:ml-2 inline-flex items-center";
const ICON_BASE_CLASSES = "w-4 h-4 mr-2 flex-shrink-0";
const SEPARATOR_BASE_CLASSES = "w-5 h-5 mx-1 flex-shrink-0";

// ============================================
// BREADCRUMB ITEM COMPONENT
// Separated for better performance and memoization
// ============================================

const BreadcrumbItem = memo(function BreadcrumbItem({
  item,
  index,
  isLast,
  separator,
  themeClasses,
}) {
  const isActive = item.isActive || isLast;
  const isDisabled = item.disabled || false;

  // ============================================
  // CLICK HANDLER WITH SAFETY CHECKS
  // ============================================

  const itemOnClick = item.onClick;

  const handleClick = useCallback(
    (event) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      if (itemOnClick && typeof itemOnClick === "function") {
        itemOnClick(event);
      }
    },
    [itemOnClick, isDisabled],
  );

  // ============================================
  // KEYBOARD HANDLER
  // ============================================

  const handleKeyDown = useCallback(
    (event) => {
      if (isDisabled) return;

      // Handle Enter and Space for clickable items
      if ((event.key === "Enter" || event.key === " ") && itemOnClick) {
        event.preventDefault();
        handleClick(event);
      }
    },
    [handleClick, itemOnClick, isDisabled],
  );

  // ============================================
  // MEMOIZED CLASSES
  // ============================================

  const linkClasses = useMemo(() => {
    const classes = [
      LINK_BASE_CLASSES,
      themeClasses.inactive,
      isDisabled && "opacity-50 cursor-not-allowed",
    ]
      .filter(Boolean)
      .join(" ");

    return classes;
  }, [themeClasses.inactive, isDisabled]);

  const activeClasses = useMemo(() => {
    return `${ACTIVE_BASE_CLASSES} ${themeClasses.active}`;
  }, [themeClasses.active]);

  // ============================================
  // RENDER SEPARATOR
  // ============================================

  const renderSeparator = () => {
    if (index === 0) return null;

    if (separator && typeof separator === "function") {
      return separator();
    }

    if (separator) {
      return (
        <span className={`${SEPARATOR_BASE_CLASSES} ${themeClasses.separator}`}>
          {separator}
        </span>
      );
    }

    return (
      <ChevronRightIcon
        className={`${SEPARATOR_BASE_CLASSES} ${themeClasses.separator}`}
      />
    );
  };

  // ============================================
  // RENDER ICON
  // ============================================

  const renderIcon = () => {
    if (!item.icon) return null;

    const Icon = item.icon;
    return <Icon className={ICON_BASE_CLASSES} aria-hidden="true" />;
  };

  // ============================================
  // RENDER CONTENT
  // On mobile, hide label text when icon is present to save space
  // ============================================

  const content = (
    <>
      {renderIcon()}
      <span className={item.icon ? "hidden sm:inline" : ""}>{item.label}</span>
    </>
  );

  // ============================================
  // RENDER LINK/SPAN BASED ON STATE
  // ============================================

  const renderItem = () => {
    // Active/Last item - non-interactive
    if (isActive) {
      return (
        <span className={activeClasses} aria-current="page">
          {content}
        </span>
      );
    }

    // React Router Link
    if (item.to && !isDisabled) {
      return (
        <Link
          to={item.to}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={linkClasses}
          aria-disabled={isDisabled}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {content}
        </Link>
      );
    }

    // External Link
    if (item.href && !isDisabled) {
      return (
        <a
          href={item.href}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={linkClasses}
          target={item.target}
          rel={item.target === "_blank" ? "noopener noreferrer" : undefined}
          aria-disabled={isDisabled}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {content}
        </a>
      );
    }

    // Clickable span (for custom onClick without navigation)
    if (item.onClick && !isDisabled) {
      return (
        <button
          type="button"
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={linkClasses}
          disabled={isDisabled}
          aria-disabled={isDisabled}
          style={{ WebkitTapHighlightColor: 'transparent' }}
        >
          {content}
        </button>
      );
    }

    // Plain text (no interaction)
    return <span className={linkClasses}>{content}</span>;
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <li className={ITEM_BASE_CLASSES}>
      {renderSeparator()}
      {renderItem()}
    </li>
  );
});

BreadcrumbItem.displayName = "BreadcrumbItem";

// ============================================
// MAIN BREADCRUMB COMPONENT
// ============================================

const Breadcrumb = memo(function Breadcrumb({
  items = [],
  className = "",
  separator,
  ariaLabel = "Breadcrumb",
  ...props
}) {
  const { getThemeClasses } = useUIXTheme();

  // ============================================
  // MEMOIZED THEME CLASSES
  // Single call to getThemeClasses per theme key
  // ============================================

  const themeClasses = useMemo(
    () => ({
      bgCard: getThemeClasses("bg-card") || "bg-white dark:bg-gray-800",
      cardBorder: getThemeClasses("card-border") || "border-gray-200 dark:border-gray-700",
      inactive:
        getThemeClasses("breadcrumb-inactive") ||
        "text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-700",
      active: getThemeClasses("breadcrumb-active") || "text-gray-900 dark:text-gray-100",
      separator: getThemeClasses("text-muted") || "text-gray-600 dark:text-gray-400",
    }),
    [getThemeClasses],
  );

  // ============================================
  // MEMOIZED CONTAINER CLASSES
  // ============================================

  const containerClasses = useMemo(() => {
    return [NAV_BASE_CLASSES, className].filter(Boolean).join(" ");
  }, [className]);

  const listClasses = useMemo(() => {
    return [LIST_BASE_CLASSES, themeClasses.bgCard, themeClasses.cardBorder]
      .filter(Boolean)
      .join(" ");
  }, [themeClasses.bgCard, themeClasses.cardBorder]);

  // ============================================
  // EARLY RETURN FOR EMPTY ITEMS
  // ============================================

  if (!items || items.length === 0) {
    return null;
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className={containerClasses}>
      <nav aria-label={ariaLabel} {...props}>
        <ol className={listClasses} style={SHADOW_STYLE}>
          {items.map((item, index) => (
            <BreadcrumbItem
              key={item.key || item.label || index}
              item={item}
              index={index}
              isLast={index === items.length - 1}
              separator={separator}
              themeClasses={themeClasses}
            />
          ))}
        </ol>
      </nav>
    </div>
  );
});

// ============================================
// DISPLAY NAME FOR DEBUGGING
// ============================================

Breadcrumb.displayName = "Breadcrumb";

// ============================================
// PROP TYPES (Optional but recommended)
// ============================================

if (process.env.NODE_ENV !== "production") {
  try {
    // eslint-disable-next-line no-undef
    const PropTypes = require("prop-types");

    Breadcrumb.propTypes = {
      items: PropTypes.arrayOf(
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          to: PropTypes.string,
          href: PropTypes.string,
          onClick: PropTypes.func,
          icon: PropTypes.elementType,
          isActive: PropTypes.bool,
          disabled: PropTypes.bool,
          target: PropTypes.string,
          key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        }),
      ),
      className: PropTypes.string,
      separator: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      ariaLabel: PropTypes.string,
    };

    BreadcrumbItem.propTypes = {
      item: PropTypes.object.isRequired,
      index: PropTypes.number.isRequired,
      isLast: PropTypes.bool.isRequired,
      separator: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
      themeClasses: PropTypes.object.isRequired,
    };
  } catch {
    // PropTypes not installed
  }
}

// ============================================
// HELPER HOOK FOR BREADCRUMB GENERATION
// ============================================

export const useBreadcrumbItems = (pathname, routeConfig = {}) => {
  return useMemo(() => {
    const paths = pathname.split("/").filter(Boolean);
    const items = [];

    // Always add home
    items.push({
      label: "Home",
      to: "/",
      key: "home",
    });

    // Build path progressively
    let currentPath = "";
    paths.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === paths.length - 1;

      // Get label from config or format segment
      const label =
        routeConfig[currentPath] ||
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

      items.push({
        label,
        to: isLast ? undefined : currentPath,
        key: currentPath,
        isActive: isLast,
      });
    });

    return items;
  }, [pathname, routeConfig]);
};

// ============================================
// EXPORTS
// ============================================

export default Breadcrumb;

// Named exports for convenience
export { BreadcrumbItem };

// ============================================
// USAGE EXAMPLES (in comments for documentation)
// ============================================

/*
// Basic usage:
const items = [
  { label: 'Home', to: '/' },
  { label: 'Products', to: '/products' },
  { label: 'Electronics', to: '/products/electronics' },
  { label: 'Laptops' } // Current page (no 'to')
];
<Breadcrumb items={items} />

// With icons:
import { HomeIcon, FolderIcon } from '@heroicons/react/24/outline';
const items = [
  { label: 'Home', to: '/', icon: HomeIcon },
  { label: 'Documents', to: '/docs', icon: FolderIcon },
  { label: 'Report.pdf' }
];
<Breadcrumb items={items} />

// With click handlers:
const items = [
  { label: 'Home', onClick: () => console.log('Home clicked') },
  { label: 'Settings', onClick: () => console.log('Settings clicked') },
  { label: 'Profile' }
];
<Breadcrumb items={items} />

// External links:
const items = [
  { label: 'Home', to: '/' },
  { label: 'External', href: 'https://example.com', target: '_blank' },
  { label: 'Current' }
];
<Breadcrumb items={items} />

// Custom separator:
<Breadcrumb items={items} separator="/" />
<Breadcrumb items={items} separator="â†’" />
<Breadcrumb items={items} separator={() => <span className="mx-2">â€¢</span>} />

// Using the helper hook:
import { useLocation } from 'react-router';
import { useBreadcrumbItems } from './Breadcrumb';

function MyPage() {
  const location = useLocation();
  const items = useBreadcrumbItems(location.pathname, {
    '/': 'Dashboard',
    '/users': 'User Management',
    '/users/edit': 'Edit User'
  });

  return <Breadcrumb items={items} />;
}

// Disabled items:
const items = [
  { label: 'Home', to: '/' },
  { label: 'Restricted', to: '/admin', disabled: true },
  { label: 'Current' }
];
<Breadcrumb items={items} />

// Custom styling:
<Breadcrumb
  items={items}
  className="mb-4"
  ariaLabel="Main navigation"
/>
*/

// ============================================
// PERFORMANCE TIPS
// ============================================

/*
PERFORMANCE OPTIMIZATION TIPS:

1. Use stable item arrays:
   âŒ BAD:  items={[{ label: 'Home', to: '/' }, ...]}
   âœ… GOOD: const items = useMemo(() => [...], [deps]);

2. Provide keys for items when in dynamic lists:
   items.map(item => ({ ...item, key: item.id }))

3. Use the useBreadcrumbItems hook for automatic generation

4. Avoid inline functions:
   âŒ BAD:  onClick={() => navigate('/home')}
   âœ… GOOD: const handleClick = useCallback(() => navigate('/home'), [navigate]);

5. Monitor performance:
   - Use React DevTools Profiler
   - Check re-render frequency
   - Verify memo is working

6. For large breadcrumb trails (>10 items), consider:
   - Collapsing middle items with ellipsis
   - Virtual scrolling for horizontal overflow
   - Lazy loading icons

7. Theme optimization:
   - Ensure useUIXTheme is properly memoized
   - Consider caching theme classes if they change frequently
*/
