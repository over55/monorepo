// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/FullPage.jsx

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
  UserCircleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager, useAuthManager } from "../../../../services/Services";
import { SkillSetsDisplay } from "../../../../components/Display";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";

// Constants
const STAFF_TYPE_MAP = {
  1: "Executive",
  2: "Management",
  3: "Frontline",
};

const PHONE_TYPE_MAP = {
  1: "Landline",
  2: "Mobile",
  3: "Work",
};

const GENDER_MAP = {
  1: "Other",
  2: "Male",
  3: "Female",
  4: "Prefer not to say",
};

const IDENTIFY_AS_OPTIONS = {
  1: "Indigenous",
  2: "Newcomer",
  3: "Visible minority",
  4: "Women",
  5: "Prefer not to say",
};

const ORGANIZATION_TYPE_MAP = {
  1: "Corporation",
  2: "Partnership",
  3: "Sole Proprietorship",
  4: "Other",
};

function AdminStaffDetailFullPage() {
  const { aid } = useParams();
  const staffManager = useStaffManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch staff data
  const fetchStaff = async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    staffManager.getStaffDetailWithCallbacks(
      aid,
      onFetchSuccess,
      onFetchError,
      onFetchDone,
      onUnauthorized,
    );
  };

  const onFetchSuccess = (response) => {
    console.log("Staff detail fetched successfully:", response);
    setStaff(response);
  };

  const onFetchError = (error) => {
    console.error("Error fetching staff detail:", error);
    setError(
      error.message || "Failed to load staff details. Please try again.",
    );
  };

  const onFetchDone = () => {
    setLoading(false);
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStaff();
  }, [aid]);

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
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      const formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
      return extension ? `${formatted} ext. ${extension}` : formatted;
    }
    return phone;
  };

  const formatMultiSelect = (selectedValues, options) => {
    if (!selectedValues || selectedValues.length === 0) return "-";
    return selectedValues
      .map((value) => options[value] || `Unknown (${value})`)
      .join(", ");
  };

  const formatAddress = (staff) => {
    if (!staff) return "-";
    const parts = [];
    if (staff.addressLine1) parts.push(staff.addressLine1);
    if (staff.addressLine2) parts.push(staff.addressLine2);
    if (staff.city) parts.push(staff.city);
    if (staff.region) parts.push(staff.region);
    if (staff.postalCode) parts.push(staff.postalCode);
    if (staff.country) parts.push(staff.country);
    return parts.length > 0 ? parts.join(", ") : "-";
  };

  const getGoogleMapsUrl = (staff) => {
    if (!staff) return null;
    const address = formatAddress(staff);
    if (address === "-") return null;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  };

  // Extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
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
              Loading staff details...
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
                to="/admin/staff"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <UserCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Staff
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
              <UserCircleIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Staff Member
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              View complete staff information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {staff && staff.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <ArchiveBoxIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This staff member is archived
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
        {staff && (
          <>
            {/* Header with Actions - Responsive */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
                  Full Details
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Link to="/admin/staff" className="flex-1 sm:flex-initial">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Back
                    </button>
                  </Link>
                  <Link
                    to={`/admin/staff/${aid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={staff.status === 2}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        staff.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit
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
                    to={`/admin/staff/${staff.id}`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Summary
                  </Link>
                  <div className="border-b-2 border-blue-600 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-blue-600 whitespace-nowrap">
                    Detail
                  </div>
                  <Link
                    to={`/admin/staff/${staff.id}/comments`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/staff/${staff.id}/attachments`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/staff/${staff.id}/more`}
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
                {/* First Row - Names and Type */}
                <DetailField
                  label="Type"
                  value={STAFF_TYPE_MAP[staff.type] || "-"}
                />
                <DetailField label="First Name" value={staff.firstName} />

                {/* Second Row - Last Name and Date of Birth */}
                <DetailField label="Last Name" value={staff.lastName} />
                <DetailField
                  label="Date of Birth"
                  value={formatDate(staff.birthDate)}
                />

                {/* Third Row - Gender */}
                <DetailField
                  label="Gender"
                  value={
                    staff.gender ? (
                      <>
                        {GENDER_MAP[staff.gender] || "Unknown"}
                        {staff.gender === 1 &&
                          staff.genderOther &&
                          ` - ${staff.genderOther}`}
                      </>
                    ) : (
                      "-"
                    )
                  }
                />

                {/* Fourth Row - Description */}
                <DetailField
                  label="Description"
                  value={staff.description}
                  fullWidth
                />

                {/* Fifth Row - Tags and Skills */}
                <div>
                  <TagsDisplay
                    values={extractIds(staff.tags)}
                    onUnauthorized={onUnauthorized}
                  />
                </div>
                {staff.skillSets && staff.skillSets.length > 0 && (
                  <div>
                    <SkillSetsDisplay
                      values={extractIds(staff.skillSets)}
                      onUnauthorized={onUnauthorized}
                    />
                  </div>
                )}
              </DetailSection>

              {/* Company Information (for Frontline staff type) */}
              {staff.type === 3 && (
                <DetailSection
                  title="Company Information"
                  icon={BuildingOfficeIcon}
                >
                  <DetailField
                    label="Company Name"
                    value={staff.organizationName}
                  />
                  <DetailField
                    label="Company Type"
                    value={ORGANIZATION_TYPE_MAP[staff.organizationType]}
                  />
                </DetailSection>
              )}

              {/* Contact Point */}
              <DetailSection title="Contact Point" icon={PhoneIcon}>
                <DetailField
                  label="Email"
                  value={
                    staff.email ? (
                      <a
                        href={`mailto:${staff.email}`}
                        className="text-blue-600 hover:text-blue-700 break-all"
                      >
                        {staff.email}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetailField
                  label="I agree to receive electronic email"
                  value={
                    staff.isOkToEmail ? (
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
                  value={
                    staff.phone ? (
                      <a
                        href={`tel:${staff.phone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {formatPhone(staff.phone)}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetailField
                  label="Phone Type"
                  value={PHONE_TYPE_MAP[staff.phoneType]}
                />
                {staff.otherPhone && (
                  <>
                    <DetailField
                      label="Other Phone (Optional)"
                      value={
                        <a
                          href={`tel:${staff.otherPhone}`}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          {formatPhone(staff.otherPhone)}
                        </a>
                      }
                    />
                    <DetailField
                      label="Other Phone Type (Optional)"
                      value={PHONE_TYPE_MAP[staff.otherPhoneType]}
                    />
                  </>
                )}
                <DetailField
                  label="I agree to receive texts to my phone"
                  value={
                    staff.isOkToText ? (
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
                    formatAddress(staff) !== "-" ? (
                      <a
                        href={getGoogleMapsUrl(staff)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 break-words"
                      >
                        {formatAddress(staff)}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                  fullWidth
                />
              </DetailSection>

              {/* Account */}
              <DetailSection title="Account" icon={GlobeAltIcon}>
                <DetailField
                  label="Is active"
                  value={
                    <span
                      className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        staff.status === 1
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {staff.status === 1 ? "Active" : "Archived"}
                    </span>
                  }
                />
                <DetailField
                  label="Preferred Language"
                  value={staff.preferredLanguage || "English"}
                />
              </DetailSection>

              {/* Emergency Contact */}
              <DetailSection
                title="Emergency Contact"
                icon={ExclamationTriangleIcon}
              >
                <DetailField label="Name" value={staff.emergencyContactName} />
                <DetailField
                  label="Relationship"
                  value={staff.emergencyContactRelationship}
                />
                <DetailField
                  label="Telephone"
                  value={
                    staff.emergencyContactTelephone ? (
                      <a
                        href={`tel:${staff.emergencyContactTelephone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {formatPhone(staff.emergencyContactTelephone)}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
                <DetailField
                  label="Alternate Telephone"
                  value={
                    staff.emergencyContactAlternativeTelephone ? (
                      <a
                        href={`tel:${staff.emergencyContactAlternativeTelephone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {formatPhone(
                          staff.emergencyContactAlternativeTelephone,
                        )}
                      </a>
                    ) : (
                      "-"
                    )
                  }
                />
              </DetailSection>

              {/* Internal Metrics */}
              <DetailSection title="Internal Metrics" icon={ChartPieIcon}>
                <div>
                  {staff.isHowDidYouHearAboutUsOther ? (
                    <span className="text-sm sm:text-base text-gray-900">
                      {staff.howDidYouHearAboutUsOther}
                    </span>
                  ) : (
                    <HowHearAboutUsDisplay
                      value={
                        staff.howDidYouHearAboutUsId ||
                        staff.howDidYouHearAboutUsID
                      }
                      onUnauthorized={onUnauthorized}
                    />
                  )}
                </div>
                <DetailField
                  label="Join date"
                  value={formatDateTime(staff.joinDate)}
                />
                <DetailField
                  label="Do you identify as belonging to any of the following groups?"
                  value={formatMultiSelect(
                    staff.identifyAs,
                    IDENTIFY_AS_OPTIONS,
                  )}
                  fullWidth
                />
              </DetailSection>

              {/* System */}
              <DetailSection title="System" icon={ComputerDesktopIcon}>
                <DetailField
                  label="ID"
                  value={
                    <span className="font-mono text-xs sm:text-sm bg-gray-100 px-1 sm:px-2 py-0.5 sm:py-1 rounded break-all">
                      {staff.publicId || staff.id || "-"}
                    </span>
                  }
                />
                <DetailField
                  label="Created at"
                  value={formatDateTime(staff.createdAt)}
                />
                <DetailField
                  label="Created by"
                  value={staff.createdByUserName}
                />
                <DetailField
                  label="Created from"
                  value={
                    staff.createdFromIpAddress && (
                      <span className="font-mono text-xs sm:text-sm break-all">
                        {staff.createdFromIpAddress}
                      </span>
                    )
                  }
                />
                <DetailField
                  label="Modified at"
                  value={formatDateTime(staff.modifiedAt)}
                />
                <DetailField
                  label="Modified by"
                  value={staff.modifiedByUserName}
                />
                <DetailField
                  label="Modified from"
                  value={
                    staff.modifiedFromIpAddress && (
                      <span className="font-mono text-xs sm:text-sm break-all">
                        {staff.modifiedFromIpAddress}
                      </span>
                    )
                  }
                />
              </DetailSection>

              {/* Action Buttons - Responsive */}
              <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
                <Link to="/admin/staff" className="order-2 sm:order-1">
                  <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                    <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                    Back to Staff
                  </button>
                </Link>

                <div className="flex gap-2 sm:gap-3 order-1 sm:order-2">
                  <Link
                    to={`/admin/staff/${aid}/edit`}
                    className="flex-1 sm:flex-initial"
                  >
                    <button
                      disabled={staff.status === 2}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border rounded-lg text-sm sm:text-base font-medium transition-colors ${
                        staff.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                      Edit Staff
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {!staff && !loading && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full mb-4">
              <UserCircleIcon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Staff Member Not Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              The staff member you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <Link to="/admin/staff">
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-transparent rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                Back to Staff
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStaffDetailFullPage;
