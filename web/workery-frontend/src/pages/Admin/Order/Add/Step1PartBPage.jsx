// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartBPage.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep1PartBPage

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  Select,
  Spinner,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
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
        return <HomeIcon className="w-4 h-4 text-green-600" />;
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return <BuildingOffice2Icon className="w-4 h-4 text-blue-600" />;
      default:
        return <UserIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div
      className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      onClick={() => onSelect(customer)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 pb-3 border-b border-blue-200">
        <div className="font-semibold text-sm text-gray-900 flex items-center">
          {getTypeIcon(customer.type)}
          <span className="ml-2 break-words">
            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
              ? customer.organizationName || `${customer.firstName} ${customer.lastName}`
              : `${customer.firstName} ${customer.lastName}`}
          </span>
        </div>
        <CheckCircleIcon className="w-5 h-5 text-green-500 opacity-0 hover:opacity-100 transition-opacity" />
      </div>

      {/* Body */}
      <div className="space-y-2 text-xs text-gray-600">
        <div className="flex items-start">
          <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
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
          <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
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
          <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
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
      <div className="mt-4 pt-3 border-t border-blue-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(customer);
          }}
          className="inline-flex items-center text-xs font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Select Customer
          <ArrowRightIcon className="w-4 h-4 ml-1" />
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
  const handlePageSizeChange = useCallback((e) => setPageSize(parseInt(e.target.value)), []);

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

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="New Order"
      wizardIcon={PlusCircleIcon}
      stepTitle="Search Results"
      stepSubtitle="Select a customer to create an order for"
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
      showActions={false}
    >
      <div className="space-y-6">
        {/* Filters Section */}
        <FormCard
          title="Search Parameters & Filters"
          subtitle="Current search and filter options"
          icon={FunnelIcon}
          maxWidth="7xl"
        >
          <div className="space-y-4">
            {/* Current Search Parameters */}
            {searchParamsDisplay.length > 0 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-gray-700 mb-2">Current Search:</p>
                <div className="flex flex-wrap gap-2">
                  {searchParamsDisplay.map((param, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {param.label}: {param.value}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
            </div>
          </div>
        </FormCard>

        {/* Results Section */}
        <FormCard
          title="Search Results"
          subtitle={customers.length > 0 ? `${customers.length} customer${customers.length === 1 ? '' : 's'} found` : undefined}
          icon={ClipboardDocumentListIcon}
          maxWidth="7xl"
        >
          {isLoading ? (
            <Spinner text="Searching customers..." />
          ) : customers.length > 0 ? (
            <div className="space-y-4">
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

              {/* Pagination */}
              <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center">
                  <label className="text-sm text-gray-700 mr-2">Show</label>
                  <select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    className="px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-700 ml-2">per page</span>
                </div>
                <div className="flex gap-2">
                  {previousCursors.length > 0 && (
                    <button
                      onClick={handlePreviousPage}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-1" />
                      Previous
                    </button>
                  )}
                  {nextCursor && (
                    <button
                      onClick={handleNextPage}
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-1" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Customers Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                No customers found matching your search criteria.
              </p>
              <Link
                to="/admin/orders/add/step-1-search"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Try a different search
              </Link>
            </div>
          )}
        </FormCard>

        {/* Actions Section */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="px-4 bg-gray-50 text-sm font-medium text-gray-500">OR</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
          <UserPlusIcon className="w-12 h-12 mx-auto text-green-600 mb-3" />
          <p className="text-sm text-gray-700 mb-4 font-medium">
            Can't find the customer you're looking for?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/admin/orders/add/step-1-search">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                Search Again
              </button>
            </Link>
            <button
              onClick={handleCreateNewCustomer}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlusIcon className="w-4 h-4 mr-2" />
              Create New Customer
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="pt-2">
          <Link
            to="/admin/orders/add/step-1-search"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>
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
