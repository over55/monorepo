// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartBPage.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep1PartBPage

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  WizardFormStep,
  SearchResultsCard,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";
import {
  PlusCircleIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  UserIcon,
  UserPlusIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration - Order has 4 steps
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Details" },
  { title: "Skills" },
  { title: "Review" },
];

// Status options
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "0", label: "Inactive" },
];

// Type options
const TYPE_OPTIONS = [
  { value: "0", label: "All Types" },
  { value: String(RESIDENTIAL_CUSTOMER_TYPE_OF_ID), label: "Residential" },
  { value: String(COMMERCIAL_CUSTOMER_TYPE_OF_ID), label: "Commercial" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "lexical_name,ASC", label: "Name (A-Z)" },
  { value: "lexical_name,DESC", label: "Name (Z-A)" },
  { value: "created_at,ASC", label: "Date Added (Oldest)" },
  { value: "created_at,DESC", label: "Date Added (Newest)" },
];

// Customer Card Component
const CustomerCard = memo(({ customer, onSelect }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
        return <HomeIcon className="w-6 h-6 text-green-600" />;
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return <BuildingOffice2Icon className="w-6 h-6 text-blue-600" />;
      default:
        return <UserIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onSelect(customer)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-blue-200">
        <div className="font-semibold text-lg sm:text-xl text-gray-900 flex items-center">
          {getTypeIcon(customer.type)}
          <span className="ml-3 break-words">
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
              ? customer.organizationName || `${customer.firstName} ${customer.lastName}`
              : `${customer.firstName} ${customer.lastName}`}
          </span>
        </div>
        <CheckCircleIcon className="w-6 h-6 text-green-500 opacity-0 hover:opacity-100 transition-opacity" />
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(customer);
          }}
          className="inline-flex items-center text-base sm:text-lg font-medium text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Select Customer
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </button>
      </div>
    </div>
  );
});

CustomerCard.displayName = 'CustomerCard';

// Memoized content component
const Step1PartBContent = memo(function Step1PartBContent() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
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
    window.scrollTo(0, 0);
  }, [authManager, navigate]);

  // Memoize onUnauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const filtersMap = new Map();
      filtersMap.set("page_size", pageSize);

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

      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true
      );

      setCustomers(customersData.results || []);
      if (customersData.hasNextPage) {
        setNextCursor(customersData.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    firstName, lastName, email, phone, currentCursor, pageSize,
    sortByValue, status, typeOf, customerManager, onUnauthorized
  ]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    setPreviousCursors((prev) => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
  }, [currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    setPreviousCursors((prev) => {
      const arr = [...prev];
      const previousCursor = arr.pop();
      setCurrentCursor(previousCursor || "");
      return arr;
    });
  }, []);

  // Filter handlers
  const handleStatusChange = useCallback((value) => setStatus(value), []);
  const handleTypeChange = useCallback((value) => setTypeOf(parseInt(value)), []);
  const handleSortChange = useCallback((value) => setSortByValue(value), []);
  const handlePageSizeChange = useCallback((value) => setPageSize(value), []);

  // Select customer and proceed
  const handleSelectCustomer = useCallback((customer) => {
    const orderState = {
      customerId: customer.id,
      customerFirstName: customer.firstName,
      customerLastName: customer.lastName,
      startDate: null,
      isOngoing: null,
      isHomeSupportService: null,
      description: "",
      skillSets: [],
      additionalComment: "",
      tags: [],
    };

    orderCreationStorage.saveOrderCreation(orderState);
    navigate("/admin/orders/add/step-2");
  }, [orderCreationStorage, navigate]);

  // Create new customer
  const handleCreateNewCustomer = useCallback(() => {
    window.open("/admin/customers/add/step-2", "_blank", "noreferrer");
  }, []);

  // Search parameters display
  const searchParamsDisplay = useMemo(() => {
    const params = [];
    if (firstName) params.push({ label: "First Name", value: firstName });
    if (lastName) params.push({ label: "Last Name", value: lastName });
    if (email) params.push({ label: "Email", value: email });
    if (phone) params.push({ label: "Phone", value: phone });
    return params;
  }, [firstName, lastName, email, phone]);

  // Filters component for SearchResultsCard
  const filtersComponent = useMemo(() => (
    <>
      <Select
        label="Status"
        value={status}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
      />
      <Select
        label="Type"
        value={String(typeOf)}
        onChange={handleTypeChange}
        options={TYPE_OPTIONS}
      />
      <Select
        label="Sort by"
        value={sortByValue}
        onChange={handleSortChange}
        options={SORT_OPTIONS}
      />
    </>
  ), [status, typeOf, sortByValue, handleStatusChange, handleTypeChange, handleSortChange]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="New Order"
      wizardIcon={PlusCircleIcon}
      stepTitle="Search Results"
      stepSubtitle={customers.length > 0 ? `${customers.length} customer${customers.length === 1 ? '' : 's'} found - Select a customer to create an order for` : "Select a customer to create an order for"}
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
      showActions={false}
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
          backLink: "/admin/orders/add/step-1-search",
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
          searchAgainLink: "/admin/orders/add/step-1-search",
          createLabel: "Create New Customer",
          onCreate: handleCreateNewCustomer,
          createIcon: UserPlusIcon,
        }}
        backLink="/admin/orders/add/step-1-search"
        backLabel="Back to Search"
      >
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onSelect={handleSelectCustomer}
            />
          ))}
        </div>
      </SearchResultsCard>
    </WizardFormStep>
  );
});

Step1PartBContent.displayName = 'Step1PartBContent';

function AdminOrderAddStep1PartBPage() {
  return (
    <UIXThemeProvider>
      <Step1PartBContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep1PartBPage;
