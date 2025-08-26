// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  PlusCircleIcon,
  TagIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../services/Services";
import { TagsDisplay } from "../../../../components/business/displays";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;

function AdminCustomerDetailLitePage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer data
  const fetchCustomer = async () => {
    if (!cid) return;

    setLoading(true);
    setError(null);

    try {
      const customerData = await customerManager.getCustomerDetail(
        cid,
        onUnauthorized,
      );
      setCustomer(customerData);
    } catch (err) {
      console.error("Failed to fetch customer:", err);
      setError("Failed to load customer details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCustomer();
  }, [cid]);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "-";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Format address for display
  const formatAddress = (customer) => {
    if (!customer) return "-";
    const address =
      customer.fullAddressWithPostalCode ||
      `${customer.addressLine1 || ""} ${customer.city || ""} ${customer.region || ""} ${customer.postalCode || ""}`.trim();

    return address || "-";
  };

  // Extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  };

  // Format customer status display
  const formatStatus = (customer) => {
    if (customer.isBanned) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </span>
      );
    }
    if (customer.status === 1) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading customer details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Responsive Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to="/admin/customers"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Customers
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Customer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              View customer information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {customer && customer.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This customer is archived
        </div>
      )}
      {customer && customer.isBanned && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <NoSymbolIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This customer is banned
        </div>
      )}

      {/* Error Display - Responsive */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
          <div className="flex justify-between items-center">
            <span className="break-words">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="shadow-sm">
        {customer && (
          <div className="bg-gray-700 rounded-lg">
            {/* Header with Actions - Responsive with Dark Background */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-300 flex-shrink-0" />
                  Summary
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    to="/admin/customers"
                    className="flex-1 sm:flex-initial"
                  >
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-[#222222] bg-[#f6f6f6] hover:bg-gray-200 transition-colors">
                      <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Back
                    </button>
                  </Link>
                  <Link
                    to={`/admin/customer/${cid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={customer.status === 2}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        customer.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-600 text-white bg-amber-600 hover:bg-amber-700"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit
                    </button>
                  </Link>
                  <Link
                    to={`/admin/orders/add/step-2-from-launchpad?id=${cid}&fn=${customer.firstName}&ln=${customer.lastName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 sm:flex-initial"
                  >
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-green-600 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm sm:text-base font-medium transition-colors">
                      <PlusCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      <span className="hidden sm:inline">New Order</span>
                      <span className="sm:hidden">Order</span>
                      <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 ml-1" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Responsive with horizontal scroll on mobile */}
            <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg">
              <div className="px-4 sm:px-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                  <div className="border-b-2 border-blue-600 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-blue-600 whitespace-nowrap">
                    Summary
                  </div>
                  <Link
                    to={`/admin/customer/${customer.id}/detail`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/admin/customer/${customer.id}/orders`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Orders
                  </Link>
                  <Link
                    to={`/admin/customer/${customer.id}/comments`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/customer/${customer.id}/attachments`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/customer/${customer.id}/more`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
                  >
                    More
                    <EllipsisHorizontalIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
                  </Link>
                </nav>
              </div>

              {/* Customer Summary Layout - Optimized for Responsiveness */}
              <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                {/* Responsive Layout - Stacked on mobile/tablet, side-by-side on larger screens */}
                <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                  {/* Main Content Container */}
                  <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0">
                    {/* Basic Info Column */}
                    <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                      {/* Name/Organization */}
                      <div className="mb-3 sm:mb-4 lg:mb-5">
                        {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                          <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                            <BuildingOfficeIcon className="w-5 sm:w-6 h-5 sm:h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                            <span className="break-words">
                              {customer.organizationName}
                            </span>
                          </h2>
                        )}
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center justify-center xl:justify-start">
                          {customer.type ===
                            RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                            <HomeIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-7 lg:h-7 mr-2 text-blue-600 flex-shrink-0" />
                          )}
                          <span className="break-words">
                            {customer.firstName} {customer.lastName}
                          </span>
                        </h3>
                      </div>

                      {/* Address */}
                      <div className="flex items-start text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 lg:mb-5 justify-center xl:justify-start">
                        <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <span className="break-words">
                            {formatAddress(customer)}
                          </span>
                          {customer.fullAddressUrl && (
                            <a
                              href={customer.fullAddressUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-700"
                            >
                              <ArrowTopRightOnSquareIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Email & Phone */}
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <EnvelopeIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            {customer.email ? (
                              <a
                                href={`mailto:${customer.email}`}
                                className="text-blue-600 hover:text-blue-700 font-medium break-all"
                              >
                                {customer.email}
                              </a>
                            ) : (
                              <span className="text-gray-500">No email</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            {customer.phone ? (
                              <a
                                href={`tel:${customer.phone}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {formatPhone(customer.phone)}
                              </a>
                            ) : (
                              <span className="text-gray-500">No phone</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Type & Status */}
                      <div className="mt-3 sm:mt-4 lg:mt-5 space-y-2 sm:space-y-3">
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 mr-2">Type:</span>
                          <span className="font-medium">
                            {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                              ? "Commercial"
                              : customer.type ===
                                  RESIDENTIAL_CUSTOMER_TYPE_OF_ID
                                ? "Residential"
                                : "Unassigned"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 mr-2">Status:</span>
                          {formatStatus(customer)}
                        </div>
                      </div>
                    </div>

                    {/* Tags Column */}
                    <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
                      {/* Tags */}
                      <div>
                        <TagsDisplay
                          values={extractIds(customer.tags)}
                          label="Tags"
                          onUnauthorized={onUnauthorized}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!customer && !loading && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full mb-4">
              <UserGroupIcon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Customer Not Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              The customer you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/customers">
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-blue-600 rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Back to Customers
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCustomerDetailLitePage;
