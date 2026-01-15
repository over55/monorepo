// File Path: web/frontend/src/components/UIX/StaffWizardSearchResults/StaffWizardSearchResults.jsx
// UIX Mobile Optimizations Applied
// Reusable StaffWizardSearchResults component for staff wizard search results pages

import React, { memo, useMemo } from "react";
import {
  StepWizard,
  DataList,
} from "../";
import Button from "../Button/Button";
import {
  MagnifyingGlassIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

// Move static default values outside component to prevent recreation
const DEFAULT_WIZARD_TITLE = "Add New Item";
const DEFAULT_CURRENT_STEP = 1;
const DEFAULT_ENTITY_NAME = "item";
const DEFAULT_SEARCH_AGAIN_LABEL = "Search Again";

/**
 * Reusable StaffWizardSearchResults Component - Performance Optimized
 * A complete staff wizard search results page that combines StepWizard navigation with DataList results
 * Perfect for displaying search results in staff add/create wizards
 *
 * Performance optimizations:
 * - Component memoization with React.memo
 * - Static default values moved outside component
 * - Memoized label generation computations
 * - Memoized enhanced empty state
 * - Memoized header configuration
 * - Prevented unnecessary re-renders
 *
 * Features:
 * - Complete wizard navigation with step progress (no breadcrumbs)
 * - Integrated DataList with search, filters, and pagination
 * - Search results table with configurable columns
 * - Header integration with action buttons inside white card
 * - Action buttons: Search Again (secondary), Add New Item (success)
 * - Red gradient theme integration matching step-1-search
 * - Responsive design with mobile optimization
 * - Error handling, loading states, and empty state management
 * - URL parameter support for search criteria
 * - Cursor-based pagination for large datasets
 *
 * @param {Object} props
 * @param {Array} props.wizardSteps - Array of wizard step configurations
 * @param {number} props.currentStep - Current active step (default: 1)
 * @param {string} props.wizardTitle - Main wizard title
 * @param {React.Component} props.wizardIcon - Icon component for wizard header
 * @param {Array} props.data - Array of search result items
 * @param {Array} props.columns - Column configuration for DataList
 * @param {boolean} props.isLoading - Loading state
 * @param {Object} props.errors - Error state object
 * @param {string} props.successMessage - Success message to display
 * @param {function} props.onSuccessMessageClose - Success message close handler
 * @param {Object} props.searchFilter - Search filter configuration
 * @param {Object} props.pagination - Pagination configuration
 * @param {Object} props.emptyState - Empty state configuration
 * @param {function} props.onSearchAgain - Handler for "Search Again" button
 * @param {function} props.onAddNew - Handler for "Add New" button
 * @param {string} props.searchAgainLabel - Label for search again button (optional)
 * @param {string} props.addNewLabel - Label for add new button (optional)
 * @param {string} props.entityName - Name of entity being searched (e.g., "staff member", "organization")
 * @param {string} props.resultsTitle - Custom title for results section (optional)
 * @param {Object} props.searchFilterConfig - Complete search filter configuration object
 * @param {string} props.className - Additional CSS classes
 *
 * @example
 * // Basic usage for staff search results
 * <StaffWizardSearchResults
 *   wizardSteps={wizardSteps}
 *   wizardTitle="Add New Staff Member"
 *   wizardIcon={UserPlusIcon}
 *   data={staffList?.results || []}
 *   columns={columns}
 *   searchFilter={searchFilterConfig}
 *   pagination={paginationConfig}
 *   entityName="staff member"
 *   onSearchAgain={() => navigate('/admin/staff/add/step-1-search')}
 *   onAddNew={() => navigate('/admin/staff/add/step-2')}
 * />
 */
const StaffWizardSearchResults = memo(function StaffWizardSearchResults({
  // Wizard props
  wizardSteps = [],
  currentStep = DEFAULT_CURRENT_STEP,
  wizardTitle = DEFAULT_WIZARD_TITLE,
  wizardIcon,

  // DataList props
  data = [],
  columns = [],
  isLoading = false,
  errors = {},
  successMessage = "",
  onSuccessMessageClose = () => {},
  searchFilter = {},
  pagination = {},
  emptyState = {},

  // Action handlers
  onSearchAgain = () => {},
  onAddNew = () => {},

  // Content customization
  searchAgainLabel,
  addNewLabel,
  entityName = DEFAULT_ENTITY_NAME,
  resultsTitle,

  // Style props
  className = "",
}) {
  // Memoize capitalized entity name
  const capitalizedEntityName = useMemo(() => {
    return entityName.charAt(0).toUpperCase() + entityName.slice(1);
  }, [entityName]);

  // Memoize content labels to prevent unnecessary recalculations
  const { defaultSearchAgainLabel, defaultAddNewLabel, defaultResultsTitle } = useMemo(() => {
    return {
      defaultSearchAgainLabel: searchAgainLabel || DEFAULT_SEARCH_AGAIN_LABEL,
      defaultAddNewLabel: addNewLabel || `Add New ${capitalizedEntityName}`,
      defaultResultsTitle: resultsTitle || `${capitalizedEntityName} Search Results`
    };
  }, [searchAgainLabel, addNewLabel, resultsTitle, capitalizedEntityName]);

  // Memoize enhanced empty state for search results
  const enhancedEmptyState = useMemo(() => {
    return {
      icon: emptyState.icon || MagnifyingGlassIcon,
      title: emptyState.title || `No ${capitalizedEntityName} Found`,
      description: emptyState.description || `No ${entityName} match your search criteria. Try adjusting your search terms or create a new ${entityName}.`,
      actionLabel: defaultAddNewLabel,
      onActionClick: onAddNew,
      showAction: true,
      ...emptyState
    };
  }, [emptyState, entityName, capitalizedEntityName, defaultAddNewLabel, onAddNew]);

  // Memoize header configuration to prevent unnecessary re-renders
  const headerConfig = useMemo(() => ({
    icon: wizardIcon,
    title: defaultResultsTitle,
    showHeader: true,
    actions: [
      <Button
        key="search-again"
        variant="secondary"
        size="md"
        onClick={onSearchAgain}
        icon={MagnifyingGlassIcon}
      >
        {defaultSearchAgainLabel}
      </Button>,
      <Button
        key="add-new"
        variant="success"
        size="lg"
        onClick={onAddNew}
        icon={PlusIcon}
      >
        {defaultAddNewLabel}
      </Button>
    ]
  }), [wizardIcon, defaultResultsTitle, defaultSearchAgainLabel, defaultAddNewLabel, onSearchAgain, onAddNew]);

  return (
    <div className={className}>
      <StepWizard
        steps={wizardSteps}
        currentStep={currentStep}
        title={wizardTitle}
        icon={wizardIcon}
      >
        <DataList
          data={data}
          columns={columns}
          isLoading={isLoading}
          errors={errors}
          successMessage={successMessage}
          onSuccessMessageClose={onSuccessMessageClose}
          searchFilter={searchFilter}
          pagination={pagination}
          emptyState={enhancedEmptyState}
          header={headerConfig}
        />
      </StepWizard>
    </div>
  );
});

// Set display name for React DevTools
StaffWizardSearchResults.displayName = 'StaffWizardSearchResults';

export default StaffWizardSearchResults;