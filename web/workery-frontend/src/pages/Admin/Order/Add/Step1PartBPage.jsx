// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartBPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useCustomerManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";
import {
  ShoppingCartIcon,
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  WrenchIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

function AdminOrderAddStep1PartBPage() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [authManager, navigate]);

  // Fetch customers based on search parameters
  useEffect(() => {
    fetchCustomers();
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
  ]);

  const fetchCustomers = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Build filters map for the search
      const filtersMap = new Map();

      // Pagination
      filtersMap.set("page_size", pageSize);

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Sorting - split the sortByValue
      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sort_field", sortArray[0]);
        filtersMap.set("sort_order", sortArray[1]);
      }

      // Search parameters - using snake_case as backend expects
      if (firstName) {
        filtersMap.set("first_name", firstName);
      }
      if (lastName) {
        filtersMap.set("last_name", lastName);
      }
      if (email) {
        filtersMap.set("email", email);
      }
      if (phone) {
        filtersMap.set("phone", phone);
      }

      // Additional filters
      if (status) {
        filtersMap.set("status", status);
      }
      if (typeOf && typeOf !== 0) {
        filtersMap.set("type", typeOf);
      }

      console.log("Fetching customers with filters:", filtersMap);

      // Force refresh to bypass cache and get fresh results
      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true, // Force refresh
      );

      console.log("Customers response:", customersData);

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
  };

  const onNextClicked = (e) => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  };

  const onPreviousClicked = (e) => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  };

  const onSelectCustomer = (customer) => {
    console.log(
      "Selected customer:",
      customer.id,
      customer.firstName,
      customer.lastName,
    );

    // Initialize order state with selected customer
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
  };

  const getCustomerTypeIcon = (type) => {
    switch (type) {
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID: // Residential
        return <HomeIcon className="w-5 h-5 inline text-green-600" />;
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID: // Commercial
        return <BuildingOffice2Icon className="w-5 h-5 inline text-blue-600" />;
      default:
        return <UserIcon className="w-5 h-5 inline text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb - Responsive */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-wrap">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <Link
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchIcon className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Orders</span>
                    <span className="sm:hidden">Orders</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ShoppingCartIcon className="w-4 h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Add - Search Results</span>
                  <span className="sm:hidden">Results</span>
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center">
            <ShoppingCartIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3 text-blue-600" />
            <span className="hidden sm:inline">
              Add New Order - Search Results
            </span>
            <span className="sm:hidden">Search Results</span>
          </h1>
        </div>

        {/* Wizard Steps - Responsive with 4 steps for Orders */}
        <div className="mb-6">
          <div className="overflow-x-auto">
            <div className="flex items-center justify-start xl2:justify-center min-w-max px-2">
              <div className="flex items-center">
                {/* Step 1 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm md:text-base">
                      1
                    </span>
                  </div>
                  <div className="ml-2 lg:ml-3">
                    <p className="text-xs lg:text-sm font-medium text-gray-900 whitespace-nowrap">
                      Search
                    </p>
                    <p className="text-xs text-gray-500 hidden lg:block">
                      Select Customer
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 lg:mx-2 w-6 lg:w-8 xl2:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 2 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">
                      2
                    </span>
                  </div>
                  <div className="ml-2 lg:ml-3">
                    <p className="text-xs lg:text-sm font-medium text-gray-500 whitespace-nowrap">
                      Details
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Order Info
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 lg:mx-2 w-6 lg:w-8 xl2:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">
                      3
                    </span>
                  </div>
                  <div className="ml-2 lg:ml-3">
                    <p className="text-xs lg:text-sm font-medium text-gray-500 whitespace-nowrap">
                      Skills
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Requirements
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 lg:mx-2 w-6 lg:w-8 xl2:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm md:text-base">
                      4
                    </span>
                  </div>
                  <div className="ml-2 lg:ml-3">
                    <p className="text-xs lg:text-sm font-medium text-gray-500 whitespace-nowrap">
                      Review
                    </p>
                    <p className="text-xs text-gray-400 hidden lg:block">
                      Confirm
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Scroll hint for mobile */}
          <div className="text-center text-xs text-gray-500 mt-2 lg:hidden">
            Swipe to see all steps →
          </div>
        </div>

        {/* Error Message */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 py-2 md:px-4 md:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm md:text-base">
              <ExclamationCircleIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 flex-shrink-0" />
              <span className="break-words">{errors.message}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div>
          <div>
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
                <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Search Results
                </h2>
              </div>

              {/* Filter Panel - Responsive */}
              <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center mb-3">
                  <FunnelIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Filtering & Sorting
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={typeOf}
                      onChange={(e) => setTypeOf(parseInt(e.target.value))}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>All Types</option>
                      <option value={RESIDENTIAL_CUSTOMER_TYPE_OF_ID}>
                        Residential
                      </option>
                      <option value={COMMERCIAL_CUSTOMER_TYPE_OF_ID}>
                        Commercial
                      </option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className="block text-xs md:text-sm font-medium text-gray-700 mb-1">
                      Sort by
                    </label>
                    <select
                      value={sortByValue}
                      onChange={(e) => setSortByValue(e.target.value)}
                      className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="lexical_name,ASC">Name (A-Z)</option>
                      <option value="lexical_name,DESC">Name (Z-A)</option>
                      <option value="created_at,ASC">
                        Date Added (Oldest)
                      </option>
                      <option value="created_at,DESC">
                        Date Added (Newest)
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Content */}
              {isLoading ? (
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm md:text-base text-gray-600">
                      Searching customers...
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {customers && customers.length > 0 ? (
                    <>
                      <div className="p-4 md:p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                          {customers.map((customer) => (
                            <div
                              key={customer.id}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-2 md:mb-3 pb-2 md:pb-3 border-b border-blue-200">
                                <div className="font-semibold text-sm md:text-base text-gray-900 flex items-center">
                                  {getCustomerTypeIcon(customer.type)}
                                  <span className="ml-2 break-words">
                                    {customer.type ===
                                    COMMERCIAL_CUSTOMER_TYPE_OF_ID
                                      ? customer.organizationName ||
                                        `${customer.firstName} ${customer.lastName}`
                                      : `${customer.firstName} ${customer.lastName}`}
                                  </span>
                                </div>
                              </div>

                              {/* Body */}
                              <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
                                <div className="flex items-start">
                                  <MapPinIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 mt-0.5" />
                                  <div>
                                    {customer.addressLine1 && (
                                      <div>{customer.addressLine1}</div>
                                    )}
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
                                  <PhoneIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                                  {customer.phone ? (
                                    <a
                                      href={`tel:${customer.phone}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {customer.phone}
                                    </a>
                                  ) : (
                                    <span>-</span>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <EnvelopeIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                                  {customer.email ? (
                                    <a
                                      href={`mailto:${customer.email}`}
                                      className="text-blue-600 hover:text-blue-800 truncate"
                                    >
                                      {customer.email}
                                    </a>
                                  ) : (
                                    <span>-</span>
                                  )}
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-blue-200">
                                <button
                                  onClick={() => onSelectCustomer(customer)}
                                  className="inline-flex items-center text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                  Select Customer
                                  <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Controls - Responsive */}
                        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                          <div className="flex items-center">
                            <label className="text-xs md:text-sm text-gray-700 mr-2">
                              Show
                            </label>
                            <select
                              value={pageSize}
                              onChange={(e) =>
                                setPageSize(parseInt(e.target.value))
                              }
                              className="px-2 py-1 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={10}>10</option>
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            <span className="text-xs md:text-sm text-gray-700 ml-2">
                              per page
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {previousCursors.length > 0 && (
                              <button
                                onClick={onPreviousClicked}
                                className="inline-flex items-center px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                <ChevronLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                                Previous
                              </button>
                            )}
                            {nextCursor && (
                              <button
                                onClick={onNextClicked}
                                className="inline-flex items-center px-2 py-1.5 md:px-3 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Next
                                <ChevronRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 md:p-6">
                      <div className="text-center py-6 md:py-8 bg-gray-50 rounded-lg">
                        <ClipboardDocumentListIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">
                          No Customers Found
                        </h3>
                        <p className="text-sm md:text-base text-gray-600 mb-4">
                          No customers found matching your search criteria.
                        </p>
                        <Link
                          to="/admin/orders/add/step-1-search"
                          className="inline-flex items-center text-sm md:text-base text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                          Try a different search
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* OR Divider and Actions */}
                  {!isLoading && (
                    <>
                      <div className="relative px-4 md:px-6 py-3">
                        <div className="absolute inset-0 flex items-center px-4 md:px-6">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-3 md:px-4 bg-white text-xs md:text-sm font-medium text-gray-500">
                            OR
                          </span>
                        </div>
                      </div>

                      <div className="px-4 pb-4 md:px-6 md:pb-5">
                        <div className="text-center mb-4">
                          <p className="text-sm md:text-base text-gray-600">
                            Do you wish to add a new customer?
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                          <Link to="/admin/orders/add/step-1-search">
                            <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                              <MagnifyingGlassIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                              Search Again
                            </button>
                          </Link>
                          <a
                            href="/admin/customers/add/step-2"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-2 text-xs md:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                              <UserPlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                              Create New Customer
                            </button>
                          </a>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 md:mt-6">
          <Link
            to="/admin/orders/add/step-1-search"
            className="inline-flex items-center text-xs md:text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderAddStep1PartBPage;
