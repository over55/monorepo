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
  Spinner,
  Modal,
  Button,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
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

// Memoized customer card component with theme support
const CustomerCard = memo(function CustomerCard({ customer, getCustomerTypeIcon, themeClasses }) {
  return (
    <div className={`${themeClasses.bgCard} border ${themeClasses.cardBorder} rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow`}>
      <div className={`flex items-start justify-between mb-2 md:mb-3 pb-2 md:pb-3 border-b ${themeClasses.cardBorder}`}>
        <Link
          to={`/admin/customer/${customer.id}`}
          className={`font-semibold text-sm md:text-base ${themeClasses.linkPrimary} flex items-center`}
        >
          {getCustomerTypeIcon(customer.type)}
          <span className="ml-2 break-words">
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
              ? customer.organizationName || `${customer.firstName} ${customer.lastName}`
              : `${customer.firstName} ${customer.lastName}`}
          </span>
        </Link>
      </div>
      <div className={`space-y-1.5 md:space-y-2 text-xs md:text-sm ${themeClasses.textSecondary}`}>
        <div className="flex items-start">
          <MapPinIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <div>{customer.addressLine1}</div>
            <div>
              {customer.city}, {customer.region}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
          {customer.phone ? (
            <a href={`tel:${customer.phone}`} className={themeClasses.linkPrimary}>
              {customer.phone}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>
        <div className="flex items-center">
          <EnvelopeIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
          {customer.email ? (
            <a href={`mailto:${customer.email}`} className={`${themeClasses.linkPrimary} truncate`}>
              {customer.email}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
      <div className={`mt-3 md:mt-4 pt-2 md:pt-3 border-t ${themeClasses.cardBorder}`}>
        <Link
          to={`/admin/customer/${customer.id}`}
          className={`inline-flex items-center text-xs md:text-sm font-medium ${themeClasses.linkPrimary}`}
        >
          Select
          <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
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
        return <HomeIcon className={`w-5 h-5 inline ${themeClasses.textSuccess}`} />;
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return <BuildingOffice2Icon className={`w-5 h-5 inline ${themeClasses.textInfo}`} />;
      default:
        return <UserGroupIcon className={`w-5 h-5 inline ${themeClasses.textMuted}`} />;
    }
  }, [themeClasses.textSuccess, themeClasses.textInfo, themeClasses.textMuted]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Add New Customer"
      wizardIcon={UserPlusIcon}
      stepTitle="Search Results"
      stepSubtitle="Review existing customers before creating new"
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      showActions={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
      onCancel={handleCancel}
      onBack={handleBack}
    >
      {/* Main Content with Dark Header */}
      <div className={`${themeClasses.formCardHeaderBg} rounded-lg shadow-sm`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <h2 className={`text-base sm:text-lg font-semibold ${themeClasses.formCardHeaderText} flex items-center`}>
            <ClipboardDocumentListIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${themeClasses.linkPrimary} flex-shrink-0`} />
            <span className="truncate">Search Results</span>
          </h2>
        </div>

        {/* Filter Panel */}
        <div className={`${themeClasses.bgCard} px-4 sm:px-6 py-3 sm:py-4 border-t ${themeClasses.cardBorder}`}>
          <div className="flex items-center mb-3">
            <FunnelIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${themeClasses.textMuted}`} />
            <h3 className={`text-sm font-semibold ${themeClasses.textPrimary}`}>Filtering & Sorting</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <Select
              label="Status"
              value={String(status)}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder=""
              size="sm"
            />
            <Select
              label="Type"
              value={String(typeOf)}
              onChange={handleTypeChange}
              options={typeOptions}
              placeholder=""
              size="sm"
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <Select
                label="Sort by"
                value={sortByValue}
                onChange={handleSortChange}
                options={sortOptions}
                placeholder=""
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className={`${themeClasses.bgCard} border-2 border-t-0 ${themeClasses.cardBorder} rounded-b-lg`}>
          {isLoading ? (
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
                <span className={`ml-3 text-sm md:text-base ${themeClasses.textSecondary}`}>
                  Loading customers...
                </span>
              </div>
            </div>
          ) : (
            <>
              {customers && customers.length > 0 ? (
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                    {customers.map((customer) => (
                      <CustomerCard
                        key={customer.id}
                        customer={customer}
                        getCustomerTypeIcon={getCustomerTypeIcon}
                        themeClasses={themeClasses}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className={`mt-4 md:mt-6 pt-3 md:pt-4 border-t ${themeClasses.borderMedium} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs md:text-sm ${themeClasses.textSecondary}`}>Show</span>
                      <Select
                        value={String(pageSize)}
                        onChange={handlePageSizeChange}
                        options={pageSizeOptions}
                        placeholder=""
                        size="sm"
                        className="w-20"
                      />
                      <span className={`text-xs md:text-sm ${themeClasses.textSecondary}`}>per page</span>
                    </div>
                    <div className="flex gap-2">
                      {previousCursors.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          icon={ChevronLeftIcon}
                        >
                          Previous
                        </Button>
                      )}
                      {nextCursor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                        >
                          Next
                          <ChevronRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  <div className={`text-center py-6 md:py-8 ${themeClasses.bgCard} rounded-lg`}>
                    <ClipboardDocumentListIcon className={`w-10 h-10 md:w-12 md:h-12 mx-auto ${themeClasses.textMuted} mb-3`} />
                    <h3 className={`text-base md:text-lg font-semibold ${themeClasses.textPrimary} mb-2`}>
                      No Customers Found
                    </h3>
                    <p className={`text-sm md:text-base ${themeClasses.textSecondary} mb-4`}>
                      No customers found matching your search criteria.
                    </p>
                    <Link
                      to="/admin/customers/add/step-1-search"
                      className={`inline-flex items-center text-sm md:text-base ${themeClasses.linkPrimary} font-medium`}
                    >
                      <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                      Try a different search
                    </Link>
                  </div>
                </div>
              )}

              {/* OR Divider and Actions */}
              <div className="relative px-4 md:px-6 py-3">
                <div className="absolute inset-0 flex items-center px-4 md:px-6">
                  <div className={`w-full border-t ${themeClasses.borderMedium}`}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className={`px-3 md:px-4 ${themeClasses.bgCard} text-xs md:text-sm font-medium ${themeClasses.textMuted}`}>
                    OR
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4 md:px-6 md:pb-5">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Link to="/admin/customers/add/step-1-search">
                    <Button variant="outline" icon={MagnifyingGlassIcon}>
                      Search Again
                    </Button>
                  </Link>
                  <Button
                    variant="success"
                    onClick={handleAddCustomerClick}
                    icon={UserPlusIcon}
                  >
                    Add New Customer
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-4 md:mt-6">
        <Link
          to="/admin/customers/add/step-1-search"
          className={`inline-flex items-center text-xs md:text-sm ${themeClasses.linkPrimary}`}
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
          Back to Search
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedCustomerForDeletion}
        onClose={handleDeselectCustomerForDeletion}
        title="Are you sure?"
        icon={ExclamationTriangleIcon}
        iconColor="amber"
        maxWidth="md"
        footer={
          <div className="flex justify-end space-x-2 md:space-x-3">
            <Button variant="outline" onClick={handleDeselectCustomerForDeletion}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleDeleteConfirm}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className={`text-xs md:text-sm ${themeClasses.textSecondary}`}>
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
