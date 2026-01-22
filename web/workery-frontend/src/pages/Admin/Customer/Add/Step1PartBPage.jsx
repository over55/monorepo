// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step1PartBPage.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminCustomerAddStep1PartBPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
} from "../../../../services/Services";
import {
  WizardFormStep,
  SearchResultsCard,
  Modal,
  Button,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Metrics" },
  { title: "Review" },
];

// Memoized customer card component with theme support and larger text sizes
const CustomerCard = memo(function CustomerCard({ customer, getCustomerTypeIcon }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-blue-200">
        <Link
          to={`/admin/customer/${customer.id}`}
          className="font-semibold text-lg sm:text-xl text-gray-900 flex items-center"
        >
          {getCustomerTypeIcon(customer.type)}
          <span className="ml-3 break-words">
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
              ? customer.organizationName || `${customer.firstName} ${customer.lastName}`
              : `${customer.firstName} ${customer.lastName}`}
          </span>
        </Link>
      </div>
      {/* Body */}
      <div className="space-y-3 text-base sm:text-lg text-gray-600">
        <div className="flex items-start">
          <MapPinIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div className="break-words">
            {customer.addressLine1 && <div>{customer.addressLine1}</div>}
            {(customer.city || customer.region) && (
              <div>
                {customer.city && customer.region
                  ? `${customer.city}, ${customer.region}`
                  : customer.city || customer.region}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          {customer.phone ? (
            <a
              href={`tel:${customer.phone}`}
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.phone}
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
        <div className="flex items-center">
          <EnvelopeIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          {customer.email ? (
            <a
              href={`mailto:${customer.email}`}
              className="text-blue-600 hover:text-blue-800 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {customer.email}
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-blue-200">
        <Link
          to={`/admin/customer/${customer.id}`}
          className="inline-flex items-center text-base sm:text-lg font-medium text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Select Customer
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
});

// Memoized content component
const Step1PartBContent = memo(function Step1PartBContent() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    bgCard: getThemeClasses('bg-card') || 'bg-white dark:bg-gray-900',
    cardBorder: getThemeClasses('card-border') || 'border-gray-200 dark:border-gray-700',
    textPrimary: getThemeClasses('text-primary') || 'text-gray-900 dark:text-gray-100',
    textSecondary: getThemeClasses('text-secondary') || 'text-gray-600 dark:text-gray-400',
    textMuted: getThemeClasses('text-muted') || 'text-gray-500 dark:text-gray-400',
    linkPrimary: getThemeClasses('link-primary') || 'text-blue-600 dark:text-blue-400',
    borderMedium: getThemeClasses('border-medium') || 'border-gray-300 dark:border-gray-600',
    formCardHeaderBg: getThemeClasses('form-card-header-bg') || 'bg-gray-700 dark:bg-gray-800',
    formCardHeaderText: getThemeClasses('form-card-header-text') || 'text-white',
    textSuccess: getThemeClasses('text-success') || 'text-green-600 dark:text-green-400',
    textInfo: getThemeClasses('text-info') || 'text-blue-600 dark:text-blue-400',
  }), [getThemeClasses]);

  // Memoized options for Select components
  const statusOptions = useMemo(() => [
    { value: "", label: "All Statuses" },
    { value: "1", label: "Active" },
    { value: "2", label: "Archived" },
  ], []);

  const typeOptions = useMemo(() => [
    { value: "0", label: "All Types" },
    { value: String(RESIDENTIAL_CUSTOMER_TYPE_OF_ID), label: "Residential" },
    { value: String(COMMERCIAL_CUSTOMER_TYPE_OF_ID), label: "Commercial" },
  ], []);

  const sortOptions = useMemo(() => [
    { value: "lexical_name,ASC", label: "Name (A-Z)" },
    { value: "lexical_name,DESC", label: "Name (Z-A)" },
    { value: "join_date,ASC", label: "Join Date (Oldest)" },
    { value: "join_date,DESC", label: "Join Date (Newest)" },
  ], []);

  const pageSizeOptions = useMemo(() => [
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
    { value: "250", label: "250" },
  ], []);

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerForDeletion, setSelectedCustomerForDeletion] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);
  const [sortByValue, setSortByValue] = useState("lexical_name,ASC");

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [authManager, navigate]);

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch customers based on search parameters
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const filtersMap = new Map();
      filtersMap.set("page_size", pageSize);
      filtersMap.set("sort_field", "lexical_name");

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sort_field", sortArray[0]);
        filtersMap.set("sort_order", sortArray[1]);
      }

      if (firstName) filtersMap.set("first_name", firstName);
      if (lastName) filtersMap.set("last_name", lastName);
      if (email) filtersMap.set("email", email);
      if (phone) filtersMap.set("phone", phone);

      if (status) filtersMap.set("status", status);
      if (typeOf !== 0) filtersMap.set("type", typeOf);

      if (import.meta.env.DEV) {
        console.log("Fetching customers with filters:", filtersMap);
      }

      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true,
      );

      if (import.meta.env.DEV) {
        console.log("Customers response:", customersData);
      }

      setCustomers(customersData.results || []);
      if (customersData.hasNextPage) {
        setNextCursor(customersData.nextCursor);
      } else {
        setNextCursor("");
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors({ message: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  }, [
    firstName,
    lastName,
    email,
    phone,
    currentCursor,
    pageSize,
    sortByValue,
    status,
    typeOf,
    customerManager,
    onUnauthorized,
  ]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleNextPage = useCallback(() => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  }, [previousCursors, currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  }, [previousCursors]);

  const handleDeselectCustomerForDeletion = useCallback(() => {
    setSelectedCustomerForDeletion(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedCustomerForDeletion) return;

    try {
      await customerManager.deleteCustomer(selectedCustomerForDeletion.id, onUnauthorized);
      await fetchCustomers();
      setSelectedCustomerForDeletion(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setErrors({ message: error.message || "Failed to archive customer." });
    }
  }, [selectedCustomerForDeletion, customerManager, onUnauthorized, fetchCustomers]);

  const handleAddCustomerClick = useCallback(() => {
    sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");
    navigate("/admin/customers/add/step-2");
  }, [navigate]);

  const handleStatusChange = useCallback((value) => {
    setStatus(parseInt(value) || "");
  }, []);

  const handleTypeChange = useCallback((value) => {
    setTypeOf(parseInt(value));
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortByValue(value);
  }, []);

  const handlePageSizeChange = useCallback((value) => {
    setPageSize(parseInt(value));
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/customers/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/customers/add/step-1-search");
  }, [navigate]);

  const getCustomerTypeIcon = useCallback((type) => {
    switch (type) {
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
        return <HomeIcon className="w-6 h-6 text-green-600" />;
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return <BuildingOffice2Icon className="w-6 h-6 text-blue-600" />;
      default:
        return <UserGroupIcon className="w-6 h-6 text-gray-600" />;
    }
  }, []);

  // Filters component for SearchResultsCard
  const filtersComponent = useMemo(() => (
    <>
      <Select
        label="Status"
        value={String(status)}
        onChange={handleStatusChange}
        options={statusOptions}
      />
      <Select
        label="Type"
        value={String(typeOf)}
        onChange={handleTypeChange}
        options={typeOptions}
      />
      <Select
        label="Sort by"
        value={sortByValue}
        onChange={handleSortChange}
        options={sortOptions}
      />
    </>
  ), [status, typeOf, sortByValue, statusOptions, typeOptions, sortOptions, handleStatusChange, handleTypeChange, handleSortChange]);

  // Search parameters display
  const searchParamsDisplay = useMemo(() => {
    const params = [];
    if (firstName) params.push({ label: "First Name", value: firstName });
    if (lastName) params.push({ label: "Last Name", value: lastName });
    if (email) params.push({ label: "Email", value: email });
    if (phone) params.push({ label: "Phone", value: phone });
    return params;
  }, [firstName, lastName, email, phone]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Add New Customer"
      wizardIcon={UserPlusIcon}
      stepTitle="Search Results"
      stepSubtitle={customers.length > 0 ? `${customers.length} customer${customers.length === 1 ? '' : 's'} found - Review existing customers before creating new` : "Review existing customers before creating new"}
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      showActions={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
      onCancel={handleCancel}
      onBack={handleBack}
    >
      <SearchResultsCard
        searchParams={searchParamsDisplay}
        filters={filtersComponent}
        isLoading={isLoading}
        isEmpty={customers.length === 0}
        emptyState={{
          icon: ClipboardDocumentListIcon,
          title: "No Customers Found",
          message: "No customers found matching your search criteria.",
          backLink: "/admin/customers/add/step-1-search",
        }}
        pagination={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          onNext: handleNextPage,
          onPrevious: handlePreviousPage,
          hasNext: !!nextCursor,
          hasPrevious: previousCursors.length > 0,
        }}
        alternativeAction={{
          searchAgainLink: "/admin/customers/add/step-1-search",
          createLabel: "Add New Customer",
          onCreate: handleAddCustomerClick,
          createIcon: UserPlusIcon,
        }}
        backLink="/admin/customers/add/step-1-search"
        backLabel="Back to Search"
      >
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              getCustomerTypeIcon={getCustomerTypeIcon}
            />
          ))}
        </div>
      </SearchResultsCard>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedCustomerForDeletion}
        onClose={handleDeselectCustomerForDeletion}
        title="Are you sure?"
        icon={ExclamationTriangleIcon}
        iconColor="amber"
        maxWidth="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleDeselectCustomerForDeletion}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleDeleteConfirm}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-base sm:text-lg text-gray-600">
          You are about to <strong>archive</strong> this customer; they will no
          longer appear on your dashboard. This action can be undone but you'll need to
          contact the system administrator. Are you sure you would like to continue?
        </p>
      </Modal>
    </WizardFormStep>
  );
});

Step1PartBContent.displayName = "Step1PartBContent";

function AdminCustomerAddStep1PartBPage() {
  return (
    <UIXThemeProvider>
      <Step1PartBContent />
    </UIXThemeProvider>
  );
}

export default AdminCustomerAddStep1PartBPage;
