// File Path: web/workery-frontend/src/pages/Admin/Order/Search/CriteriaPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  XMarkIcon,
  ChevronRightIcon,
  LightBulbIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  FunnelIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

function AdminOrderSearchCriteriaPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Form states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  // Search form state
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);

  // Filter checkboxes
  const [filterByOrder, setFilterByOrder] = useState(false);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByAssociate, setFilterByAssociate] = useState(false);

  // Customer fields
  const [customerOrganizationName, setCustomerOrganizationName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");

  // Associate fields
  const [associateOrganizationName, setAssociateOrganizationName] =
    useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");

  // Order fields
  const [orderWjid, setOrderWjid] = useState("");

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
    }
    setFetching(false);
  }, [authManager, navigate]);

  // Handle form submission
  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    // Clear previous errors
    setErrors({});

    // Validation - ensure at least one field is filled
    if (
      customerOrganizationName === "" &&
      customerFirstName === "" &&
      customerLastName === "" &&
      customerEmail === "" &&
      customerPhone === "" &&
      actualSearchText === "" &&
      associateOrganizationName === "" &&
      associateFirstName === "" &&
      associateLastName === "" &&
      associateEmail === "" &&
      associatePhone === "" &&
      orderWjid === ""
    ) {
      setErrors({
        message: "Please enter a value in at least one field",
      });
      window.scrollTo(0, 0);
      return;
    }

    // Build URL with query parameters (matching the original format)
    const queryParams = new URLSearchParams();

    if (customerFirstName) queryParams.append("cfn", customerFirstName);
    if (customerLastName) queryParams.append("cln", customerLastName);
    if (customerEmail) queryParams.append("ce", customerEmail);
    if (customerPhone)
      queryParams.append("cp", encodeURIComponent(customerPhone));
    if (customerOrganizationName)
      queryParams.append("con", customerOrganizationName);
    if (actualSearchText) queryParams.append("q", actualSearchText);
    if (associateFirstName) queryParams.append("afn", associateFirstName);
    if (associateLastName) queryParams.append("aln", associateLastName);
    if (associateEmail) queryParams.append("ae", associateEmail);
    if (associatePhone)
      queryParams.append("ap", encodeURIComponent(associatePhone));
    if (associateOrganizationName)
      queryParams.append("aon", associateOrganizationName);
    if (orderWjid) queryParams.append("owjid", orderWjid);

    const searchURL = `/admin/orders/search-result?${queryParams.toString()}`;
    navigate(searchURL);
  };

  // Handle cancel
  const onCancelClick = (e) => {
    e.preventDefault();
    navigate("/admin/orders");
  };

  // Handle clear form
  const handleClearForm = () => {
    setActualSearchText("");
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerOrganizationName("");
    setAssociateFirstName("");
    setAssociateLastName("");
    setAssociateEmail("");
    setAssociatePhone("");
    setAssociateOrganizationName("");
    setOrderWjid("");
    setFilterByCustomer(false);
    setFilterByAssociate(false);
    setFilterByOrder(false);
    setErrors({});
  };

  // Handle key press for Enter key submission
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onSubmitClick(e);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <ChartBarIcon className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Orders
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Search
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <WrenchScrewdriverIcon className="h-8 w-8 text-blue-600 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">
                  Search Orders
                </h1>
              </div>
              <p className="mt-2 text-lg text-gray-600 ml-11">
                Find existing orders in your database
              </p>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Orders
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{errors.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setErrors({})}
                  className="inline-flex text-red-400 hover:text-red-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Search Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <MagnifyingGlassIcon className="h-5 w-5 mr-2 text-blue-600" />
              Search Criteria
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Enter keywords or use advanced filters to find orders
            </p>
          </div>

          <form onSubmit={onSubmitClick} className="p-6">
            {/* Basic Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Keywords
              </label>
              <input
                type="text"
                value={actualSearchText}
                onChange={(e) => setActualSearchText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search by any keyword..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Advanced Search Toggle */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
                className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                {isAdvancedFiltering ? "Hide" : "Show"} Advanced Search
              </button>
            </div>

            {/* Advanced Search Section */}
            {isAdvancedFiltering && (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FunnelIcon className="h-4 w-4 mr-2 text-gray-600" />
                    Filter Options
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterByCustomer}
                        onChange={(e) => setFilterByCustomer(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Filter by Customer
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterByAssociate}
                        onChange={(e) => setFilterByAssociate(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Filter by Associate
                      </span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filterByOrder}
                        onChange={(e) => setFilterByOrder(e.target.checked)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Filter by Order
                      </span>
                    </label>
                  </div>
                </div>

                {/* Customer Fields */}
                {filterByCustomer && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-gray-600" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={customerFirstName}
                          onChange={(e) => setCustomerFirstName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter first name"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={customerLastName}
                          onChange={(e) => setCustomerLastName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter last name"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={customerEmail}
                          onChange={(e) => setCustomerEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter email address"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <PhoneIcon className="inline h-4 w-4 mr-1" />
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter phone number"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BuildingOffice2Icon className="inline h-4 w-4 mr-1" />
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={customerOrganizationName}
                        onChange={(e) =>
                          setCustomerOrganizationName(e.target.value)
                        }
                        onKeyPress={handleKeyPress}
                        placeholder="Enter organization name"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Associate Fields */}
                {filterByAssociate && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-600" />
                      Associate Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={associateFirstName}
                          onChange={(e) =>
                            setAssociateFirstName(e.target.value)
                          }
                          onKeyPress={handleKeyPress}
                          placeholder="Enter first name"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={associateLastName}
                          onChange={(e) => setAssociateLastName(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter last name"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <EnvelopeIcon className="inline h-4 w-4 mr-1" />
                          Email
                        </label>
                        <input
                          type="email"
                          value={associateEmail}
                          onChange={(e) => setAssociateEmail(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter email address"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <PhoneIcon className="inline h-4 w-4 mr-1" />
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={associatePhone}
                          onChange={(e) => setAssociatePhone(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Enter phone number"
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <BuildingOffice2Icon className="inline h-4 w-4 mr-1" />
                        Organization Name
                      </label>
                      <input
                        type="text"
                        value={associateOrganizationName}
                        onChange={(e) =>
                          setAssociateOrganizationName(e.target.value)
                        }
                        onKeyPress={handleKeyPress}
                        placeholder="Enter organization name"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Order Fields */}
                {filterByOrder && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-gray-600" />
                      Order Information
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <HashtagIcon className="inline h-4 w-4 mr-1" />
                        Job Number
                      </label>
                      <input
                        type="text"
                        value={orderWjid}
                        onChange={(e) => setOrderWjid(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter job number"
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancelClick}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Clear
                </button>
              </div>

              <button
                type="submit"
                disabled={isFetching}
                className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFetching ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Search Tips */}
        <div className="mt-6 bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Search Tips
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Use keywords to search across all order fields</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>
                  Advanced search allows filtering by customer, associate, or
                  order details
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Enter partial information for broader results</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                <span>Combine multiple filters for more precise searches</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderSearchCriteriaPage;
