// File Path: web/workery-frontend/src/pages/Admin/Customer/Detail/FullPage.jsx

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
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  ExclamationTriangleIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  CalendarIcon,
  GlobeAltIcon,
  PlusCircleIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import {
  useCustomerManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";

// Constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const RESIDENTIAL_CUSTOMER_TYPE_OF_ID = 2;
const CLIENT_PHONE_TYPE_WORK = 2;

// Option mappings for display
const CLIENT_TYPE_OPTIONS = {
  1: "Unassigned",
  2: "Residential",
  3: "Commercial",
};

const CLIENT_ORGANIZATION_TYPE_OPTIONS = {
  1: "Private",
  2: "Non-profit",
  3: "Government",
};

const GENDER_OPTIONS = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const PHONE_TYPE_OPTIONS = {
  1: "Mobile",
  2: "Work",
  3: "Home",
};

function AdminCustomerDetailFullPage() {
  const { cid } = useParams();
  const customerManager = useCustomerManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Helper functions for formatting
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const formatPhone = (phone, extension = null) => {
    if (!phone) return "-";
    const formatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    return extension ? `${formatted} ext. ${extension}` : formatted;
  };

  const formatAddress = (customer) => {
    if (!customer) return "-";
    const address =
      customer.fullAddressWithPostalCode ||
      `${customer.addressLine1 || ""} ${customer.city || ""} ${customer.region || ""} ${customer.postalCode || ""}`.trim();

    return address || "-";
  };

  // Extract tag IDs from tag objects if necessary
  const getTagIds = (tags) => {
    if (!tags || tags.length === 0) return [];

    // If tags are already IDs (numbers or strings of numbers)
    if (typeof tags[0] === "number" || typeof tags[0] === "string") {
      return tags;
    }

    // If tags are objects with id property
    if (tags[0].id !== undefined) {
      return tags.map((tag) => tag.id);
    }

    // If tags are objects with value property
    if (tags[0].value !== undefined) {
      return tags.map((tag) => tag.value);
    }

    return [];
  };

  // Section Component - Improved for responsiveness
  const DetailSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-600 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h3>
      </div>
      <div className="p-4 sm:p-6">
        <dl className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {children}
        </dl>
      </div>
    </div>
  );

  // Detail Field Component - Improved for responsiveness
  const DetailField = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "lg:col-span-2" : ""}>
      <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
        {label}
      </dt>
      <dd className="text-sm sm:text-base text-gray-900 break-words">
        {value || "-"}
      </dd>
    </div>
  );

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
              View complete customer information
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
      <div className="bg-white shadow-sm rounded-lg">
        {customer && (
          <>
            {/* Header with Actions - Responsive */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                  Full Details
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Link
                    to="/admin/customers"
                    className="flex-1 sm:flex-initial"
                  >
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
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
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
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
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-sm sm:text-base font-medium transition-colors">
                      <PlusCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      New Order
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation - Responsive with horizontal scroll on mobile */}
            <div className="border-b border-gray-200">
              <div className="px-4 sm:px-6">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                  <Link
                    to={`/admin/customer/${customer.id}`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Summary
                  </Link>
                  <div className="border-b-2 border-blue-600 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-blue-600 whitespace-nowrap">
                    Detail
                  </div>
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
            </div>

            {/* Detail Sections - Responsive */}
            <div className="p-4 sm:p-6">
              {/* Personal Information */}
              <DetailSection title="Personal Information" icon={UserIcon}>
                {/* First Row - Names */}
                <DetailField label="First Name" value={customer.firstName} />
                <DetailField label="Last Name" value={customer.lastName} />

                {/* Second Row - Tags */}
                <div>
                  <TagsDisplay
                    values={getTagIds(customer.tags)}
                    onUnauthorized={onUnauthorized}
                  />
                </div>
                <DetailField
                  label="Type"
                  value={CLIENT_TYPE_OPTIONS[customer.type] || "Unknown"}
                />

                {/* Third Row - Description */}
                <DetailField
                  label="Description"
                  value={customer.description}
                  fullWidth
                />

                {/* Fourth Row - Gender and Date of Birth */}
                <DetailField
                  label="Gender"
                  value={
                    customer.gender ? (
                      <>
                        {GENDER_OPTIONS[customer.gender] || "Unknown"}
                        {customer.gender === 1 &&
                          customer.genderOther &&
                          ` - ${customer.genderOther}`}
                      </>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetailField
                  label="Date of Birth"
                  value={formatDate(customer.birthDate)}
                />
              </DetailSection>

              {/* Company Information (for Commercial customers) */}
              {customer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                <DetailSection
                  title="Company Information"
                  icon={BuildingOfficeIcon}
                >
                  <DetailField
                    label="Company Name"
                    value={customer.organizationName}
                  />
                  <DetailField
                    label="Company Type"
                    value={
                      CLIENT_ORGANIZATION_TYPE_OPTIONS[
                        customer.organizationType
                      ]
                    }
                  />
                </DetailSection>
              )}

              {/* Contact Point */}
              <DetailSection title="Contact Point" icon={PhoneIcon}>
                <DetailField
                  label="Email"
                  value={
                    customer.email ? (
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-blue-600 hover:text-blue-700 break-all"
                      >
                        {customer.email}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetailField
                  label="I agree to receive electronic email"
                  value={
                    customer.isOkToEmail ? (
                      <span className="inline-flex items-center text-green-700">
                        <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        No
                      </span>
                    )
                  }
                />
                <DetailField
                  label="Phone"
                  value={formatPhone(
                    customer.phone,
                    customer.phoneType === CLIENT_PHONE_TYPE_WORK
                      ? customer.phoneExtension
                      : null,
                  )}
                />
                <DetailField
                  label="Phone Type"
                  value={PHONE_TYPE_OPTIONS[customer.phoneType]}
                />
                {customer.otherPhone && (
                  <>
                    <DetailField
                      label="Other Phone (Optional)"
                      value={formatPhone(
                        customer.otherPhone,
                        customer.otherPhoneType === CLIENT_PHONE_TYPE_WORK
                          ? customer.otherPhoneExtension
                          : null,
                      )}
                    />
                    <DetailField
                      label="Other Phone Type (Optional)"
                      value={PHONE_TYPE_OPTIONS[customer.otherPhoneType]}
                    />
                  </>
                )}
                <DetailField
                  label="I agree to receive texts to my phone"
                  value={
                    customer.isOkToText ? (
                      <span className="inline-flex items-center text-green-700">
                        <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-red-700">
                        <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
                        No
                      </span>
                    )
                  }
                />
              </DetailSection>

              {/* Address */}
              <DetailSection title="Address" icon={MapPinIcon}>
                <DetailField
                  label="Location"
                  value={
                    customer.fullAddressUrl ? (
                      <a
                        href={customer.fullAddressUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:text-blue-700 break-words"
                      >
                        {formatAddress(customer)}
                      </a>
                    ) : (
                      formatAddress(customer)
                    )
                  }
                  fullWidth
                />
              </DetailSection>

              {/* Internal Metrics */}
              <DetailSection title="Internal Metrics" icon={ChartPieIcon}>
                <div>
                  <dt className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                    How did they discover us?
                  </dt>
                  <dd className="text-sm sm:text-base text-gray-900">
                    {customer.isHowDidYouHearAboutUsOther ? (
                      <div>
                        <HowHearAboutUsDisplay
                          value={customer.howDidYouHearAboutUsID}
                          onUnauthorized={onUnauthorized}
                        />
                        {customer.howDidYouHearAboutUsOther && (
                          <div className="mt-1 text-sm italic text-gray-600">
                            Other: {customer.howDidYouHearAboutUsOther}
                          </div>
                        )}
                      </div>
                    ) : (
                      <HowHearAboutUsDisplay
                        value={customer.howDidYouHearAboutUsID}
                        onUnauthorized={onUnauthorized}
                      />
                    )}
                  </dd>
                </div>
                <DetailField
                  label="Join date"
                  value={formatDateTime(customer.joinDate)}
                />
                <DetailField
                  label="Preferred Language"
                  value={customer.preferredLanguage || "English"}
                />
              </DetailSection>

              {/* System */}
              <DetailSection title="System" icon={ComputerDesktopIcon}>
                <DetailField
                  label="ID"
                  value={
                    <span className="font-mono text-xs sm:text-sm bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded break-all">
                      {customer.publicId || customer.id || "-"}
                    </span>
                  }
                />
                <DetailField
                  label="Created at"
                  value={formatDateTime(customer.createdAt)}
                />
                <DetailField
                  label="Created by"
                  value={customer.createdByUserName}
                />
                <DetailField
                  label="Created from"
                  value={
                    customer.createdFromIpAddress && (
                      <span className="font-mono text-xs sm:text-sm break-all">
                        {customer.createdFromIpAddress}
                      </span>
                    )
                  }
                />
                <DetailField
                  label="Modified at"
                  value={formatDateTime(customer.modifiedAt)}
                />
                <DetailField
                  label="Modified by"
                  value={customer.modifiedByUserName}
                />
                <DetailField
                  label="Modified from"
                  value={
                    customer.modifiedFromIpAddress && (
                      <span className="font-mono text-xs sm:text-sm break-all">
                        {customer.modifiedFromIpAddress}
                      </span>
                    )
                  }
                />
              </DetailSection>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                <Link to="/admin/customers" className="order-2 sm:order-1">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Customers
                  </button>
                </Link>

                <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                  <Link
                    to={`/admin/customer/${cid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={customer.status === 2}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        customer.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
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
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-green-300 text-green-700 bg-green-50 hover:bg-green-100 rounded-lg text-sm sm:text-base font-medium transition-colors">
                      <PlusCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      New Order
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
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
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
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

export default AdminCustomerDetailFullPage;
