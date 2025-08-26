// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step1PartBPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  ChevronRightIcon,
  XMarkIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
} from "@heroicons/react/24/outline";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";

function AdminCustomerAddStep1PartBPage() {
  const authManager = useAuthManager();
  const customerManager = useCustomerManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component state
  const [errors, setErrors] = useState({});
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerForDeletion, setSelectedCustomerForDeletion] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);
  const [createdAtGTE, setCreatedAtGTE] = useState(null);
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
      // Build filters map for the search
      const filtersMap = new Map();

      // Pagination
      filtersMap.set("page_size", pageSize);
      filtersMap.set("sort_field", "lexical_name"); // Default sort field

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Sorting - split the sortByValue
      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sort_field", sortArray[0]);
        filtersMap.set("sort_order", sortArray[1]);
      }

      // Search parameters - using snake_case as the backend expects
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
      if (actualSearchText) {
        filtersMap.set("search", actualSearchText);
      }
      if (status) {
        filtersMap.set("status", status);
      }
      if (typeOf !== 0) {
        filtersMap.set("type", typeOf);
      }
      if (createdAtGTE) {
        const createdAtGTEStr = createdAtGTE.getTime();
        filtersMap.set("created_at_gte", createdAtGTEStr);
      }

      console.log("Fetching customers with filters:", filtersMap);

      // Use getCustomersWithFiltersMap
      const customersData = await customerManager.getCustomersWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true, // force refresh
      );

      console.log("Customers response:", customersData);

      setCustomers(customersData.results || []);
      if (customersData.hasNextPage) {
        setNextCursor(customersData.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
      setErrors({ message: error.message || "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  }, [
    customerManager,
    pageSize,
    firstName,
    lastName,
    email,
    phone,
    status,
    typeOf,
    currentCursor,
    actualSearchText,
    sortByValue,
    createdAtGTE,
    onUnauthorized,
  ]);

  // Fetch customers on mount and when filters/pagination change
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

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

  const onSelectCustomerForDeletion = (e, customer) => {
    console.log("onSelectCustomerForDeletion", customer);
    setSelectedCustomerForDeletion(customer);
  };

  const onDeselectCustomerForDeletion = (e) => {
    console.log("onDeselectCustomerForDeletion");
    setSelectedCustomerForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedCustomerForDeletion) return;

    try {
      await customerManager.deleteCustomer(
        selectedCustomerForDeletion.id,
        onUnauthorized,
      );

      // Refresh the list
      await fetchCustomers();
      setSelectedCustomerForDeletion(null);
    } catch (error) {
      console.error("Failed to delete customer:", error);
      setErrors({ message: error.message || "Failed to archive customer." });
    }
  };

  const onAddClientClick = () => {
    // Clear any existing customer creation state
    sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");
    navigate("/admin/customers/add/step-2");
  };

  const getCustomerTypeIcon = (type) => {
    switch (type) {
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID: // Residential
        return <HomeIcon className="w-5 h-5 inline text-green-600" />;
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID: // Commercial
        return <BuildingOffice2Icon className="w-5 h-5 inline text-blue-600" />;
      default:
        return <UserGroupIcon className="w-5 h-5 inline text-gray-600" />;
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
                  to="/admin/customers"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <UserGroupIcon className="w-4 h-4 mr-1 md:mr-2" />
                    <span className="hidden sm:inline">Customers</span>
                    <span className="sm:hidden">Cust</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-1 md:mr-2" />
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
            <UserPlusIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 md:mr-3 text-blue-600" />
            <span className="hidden sm:inline">
              Add New Customer - Search Results
            </span>
            <span className="sm:hidden">Search Results</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <MagnifyingGlassIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review existing customers before creating new
          </p>
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
        <div className="bg-white shadow-sm rounded-lg">
          {/* Dark Header Section */}
          <div className="bg-gray-700 rounded-t-lg">
            <div className="px-4 py-3 md:px-6 md:py-4">
              <h2 className="text-base md:text-lg font-semibold text-white flex items-center">
                <ClipboardDocumentListIcon className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-300" />
                Search Results
              </h2>
            </div>
          </div>

          {/* Filter Panel - With Border */}
          <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50 border-x-2 border-gray-700">
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
                  onChange={(e) => setStatus(parseInt(e.target.value) || "")}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="1">Active</option>
                  <option value="2">Archived</option>
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
                  <option value="join_date,ASC">Join Date (Oldest)</option>
                  <option value="join_date,DESC">Join Date (Newest)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Content with Border */}
          <div className="border-x-2 border-b-2 border-gray-700 rounded-b-lg">
            {isLoading ? (
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm md:text-base text-gray-600">
                    Loading customers...
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
                              <Link
                                to={`/admin/customer/${customer.id}`}
                                className="font-semibold text-sm md:text-base text-gray-900 hover:text-blue-600 flex items-center"
                              >
                                {getCustomerTypeIcon(customer.type)}
                                <span className="ml-2 break-words">
                                  {customer.type ===
                                  COMMERCIAL_CUSTOMER_TYPE_OF_ID
                                    ? customer.organizationName ||
                                      `${customer.firstName} ${customer.lastName}`
                                    : `${customer.firstName} ${customer.lastName}`}
                                </span>
                              </Link>
                            </div>

                            {/* Body */}
                            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
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
                              <Link
                                to={`/admin/customer/${customer.id}`}
                                className="inline-flex items-center text-xs md:text-sm font-medium text-blue-600 hover:text-blue-800"
                              >
                                Select
                                <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
                              </Link>
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
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                            <option value={250}>250</option>
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
                        to="/admin/customers/add/step-1-search"
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
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                        <Link to="/admin/customers/add/step-1-search">
                          <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                            Search Again
                          </button>
                        </Link>
                        <button
                          onClick={onAddClientClick}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-2 text-xs md:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <UserPlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                          Add New Customer
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-4 md:mt-6">
          <Link
            to="/admin/customers/add/step-1-search"
            className="inline-flex items-center text-xs md:text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal - Responsive */}
      {selectedCustomerForDeletion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-4 w-4 md:h-5 md:w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-4 py-3 md:px-6 md:py-4">
              <p className="text-xs md:text-sm text-gray-600">
                You are about to <strong>archive</strong> this user; it will no
                longer appear on your dashboard. This action can be undone but
                you'll need to contact the system administrator. Are you sure
                you would like to continue?
              </p>
            </div>

            <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 md:space-x-3">
              <button
                onClick={onDeselectCustomerForDeletion}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirmButtonClick}
                className="px-3 py-1.5 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomerAddStep1PartBPage;
