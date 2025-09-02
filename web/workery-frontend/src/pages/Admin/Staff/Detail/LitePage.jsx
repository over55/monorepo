// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Detail/LitePage.jsx

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
  CheckCircleIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  UserIcon,
  CalendarIcon,
  IdentificationIcon,
  NoSymbolIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { useStaffManager, useAuthManager } from "../../../../services/Services";
import {
  HowHearAboutUsDisplay,
  TagsDisplay,
} from "../../../../components/business/displays";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Constants
const STAFF_TYPE_EXECUTIVE = 1;
const STAFF_TYPE_MANAGEMENT = 2;
const STAFF_TYPE_FRONTLINE = 3;

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

function AdminStaffDetailLitePage() {
  const { aid } = useParams();
  const staffManager = useStaffManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const onFetchError = (errorResponse) => {
    console.error("Error fetching staff detail:", errorResponse);
    setError(
      errorResponse.message ||
        "Failed to load staff details. Please try again.",
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

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "-";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  // Format address for display
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

  // Get Google Maps URL
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

  // Format staff status display
  const formatStatus = (staff) => {
    if (staff.isBanned) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-red-100 text-red-800">
          <XCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Banned
        </span>
      );
    }
    if (staff.status === 1) {
      return (
        <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs sm:text-sm font-medium bg-gray-100 text-gray-800">
        Archived
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
                  <UserIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
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
              <UserIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Staff Member
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              View staff information
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
      {staff && staff.isBanned && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center text-sm sm:text-base">
          <NoSymbolIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
          This staff member is banned
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
        {staff && (
          <div className="bg-gray-700 rounded-lg">
            {/* Header with Actions - Responsive with Dark Background */}
            <div className="px-4 sm:px-6 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                <h2 className="text-xl sm:text-2xl font-semibold text-white flex items-center">
                  <ClipboardDocumentListIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-300 flex-shrink-0" />
                  Summary
                </h2>
                <div className="flex gap-2 sm:gap-3">
                  <Link to="/admin/staff" className="flex-1 sm:flex-initial">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-[#222222] bg-[#f6f6f6] hover:bg-gray-200 transition-colors">
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
                          : "border-amber-600 text-white bg-amber-600 hover:bg-amber-700"
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
            <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg">
              <div className="px-4 sm:px-6 border-b border-gray-200">
                <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
                  <div className="border-b-2 border-blue-600 py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-blue-600 whitespace-nowrap">
                    Summary
                  </div>
                  <Link
                    to={`/admin/staff/${staff.id}/detail`}
                    className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Detail
                  </Link>
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

              {/* Staff Summary Layout - Optimized for Responsiveness */}
              <div className="py-4 sm:py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
                {/* Responsive Layout - Stacked on mobile/tablet, side-by-side on larger screens */}
                <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                  {/* Avatar - Responsive sizing */}
                  <div className="flex-shrink-0 order-1 xl:order-1">
                    <img
                      src={
                        staff.avatarObjectUrl && staff.avatarObjectUrl !== ""
                          ? staff.avatarObjectUrl
                          : "/img/placeholder.png"
                      }
                      alt={
                        staff.avatarObjectUrl
                          ? "Profile Picture"
                          : "No Profile Picture"
                      }
                      className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-2xl object-cover border-2 border-gray-100 shadow-sm mx-auto xl:mx-0"
                    />
                  </div>

                  {/* Main Content Container */}
                  <div className="flex-1 w-full xl:flex xl:gap-8 space-y-4 sm:space-y-6 xl:space-y-0 order-2 xl:order-2">
                    {/* Basic Info Column */}
                    <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                      {/* Name/Organization */}
                      <div className="mb-3 sm:mb-4 lg:mb-5">
                        {staff.type === STAFF_TYPE_FRONTLINE &&
                          staff.organizationName && (
                            <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                              <span className="break-words">
                                {staff.organizationName}
                              </span>
                            </h2>
                          )}
                        <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center justify-center xl:justify-start">
                          <span className="break-words">
                            {staff.name ||
                              `${staff.firstName} ${staff.lastName}`}
                          </span>
                        </h3>
                        <div className="mt-2 text-sm lg:text-base text-gray-600">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs lg:text-sm font-medium bg-blue-100 text-blue-800">
                            {STAFF_TYPE_MAP[staff.type] || "Unknown"}
                          </span>
                        </div>
                      </div>

                      {/* Address */}
                      <div className="flex items-start text-sm sm:text-base lg:text-lg text-gray-600 mb-3 sm:mb-4 lg:mb-5 justify-center xl:justify-start">
                        <MapPinIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <span className="break-words">
                            {formatAddress(staff)}
                          </span>
                          {getGoogleMapsUrl(staff) && (
                            <a
                              href={getGoogleMapsUrl(staff)}
                              target="_blank"
                              rel="noopener noreferrer"
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
                            {staff.email ? (
                              <a
                                href={`mailto:${staff.email}`}
                                className="text-blue-600 hover:text-blue-700 font-medium break-all"
                              >
                                {staff.email}
                              </a>
                            ) : (
                              <span className="text-gray-500">No email</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <div className="min-w-0 flex-1">
                            {staff.phone ? (
                              <>
                                <a
                                  href={`tel:${staff.phone}`}
                                  className="text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  {formatPhone(staff.phone)}
                                </a>
                                {staff.phoneType && (
                                  <span className="ml-2 text-xs sm:text-sm text-gray-500">
                                    (
                                    {PHONE_TYPE_MAP[staff.phoneType] ||
                                      "Unknown"}
                                    )
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">No phone</span>
                            )}
                          </div>
                        </div>
                        {staff.otherPhone && (
                          <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                            <PhoneIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <a
                                href={`tel:${staff.otherPhone}`}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                              >
                                {formatPhone(staff.otherPhone)}
                              </a>
                              {staff.otherPhoneType && (
                                <span className="ml-2 text-xs sm:text-sm text-gray-500">
                                  (
                                  {PHONE_TYPE_MAP[staff.otherPhoneType] ||
                                    "Unknown"}
                                  )
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Type & Status */}
                      <div className="mt-3 sm:mt-4 lg:mt-5 space-y-2 sm:space-y-3">
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 mr-2">Type:</span>
                          <span className="font-medium">
                            {STAFF_TYPE_MAP[staff.type] || "Unknown"}
                          </span>
                        </div>
                        <div className="flex items-center text-sm sm:text-base lg:text-lg justify-center xl:justify-start">
                          <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 lg:w-6 lg:h-6 mr-2 sm:mr-3 text-gray-400 flex-shrink-0" />
                          <span className="text-gray-600 mr-2">Status:</span>
                          {formatStatus(staff)}
                        </div>
                      </div>
                    </div>

                    {/* Additional Info Column */}
                    <div className="xl:flex-1 xl:min-w-0 space-y-3 sm:space-y-4 lg:space-y-6 text-center xl:text-left">
                      {/* Tags */}
                      <div>
                        <TagsDisplay
                          values={extractIds(staff.tags)}
                          label="Tags"
                          onUnauthorized={onUnauthorized}
                        />
                      </div>

                      {/* How Did You Hear About Us */}
                      {(staff.howDidYouHearAboutUsId ||
                        staff.howDidYouHearAboutUsID) && (
                        <div>
                          {staff.isHowDidYouHearAboutUsOther ? (
                            <div className="text-sm sm:text-base lg:text-lg">
                              <span className="font-medium text-gray-700">
                                How did they discover us:
                              </span>
                              <p className="mt-1 text-gray-600">
                                {staff.howDidYouHearAboutUsOther}
                              </p>
                            </div>
                          ) : (
                            <HowHearAboutUsDisplay
                              value={
                                staff.howDidYouHearAboutUsId ||
                                staff.howDidYouHearAboutUsID
                              }
                              label="How did they discover us?"
                              onUnauthorized={onUnauthorized}
                            />
                          )}
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="space-y-2 text-xs sm:text-sm lg:text-base text-gray-600">
                        {staff.publicId && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <IdentificationIcon className="w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 text-gray-400" />
                            <span className="font-medium">Public ID:</span>
                            <span className="ml-2">{staff.publicId}</span>
                          </div>
                        )}
                        {staff.createdAt && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 text-gray-400" />
                            <span className="font-medium">Created:</span>
                            <span className="ml-2">
                              {formatDateForDisplay(staff.createdAt)}
                            </span>
                          </div>
                        )}
                        {staff.modifiedAt && (
                          <div className="flex items-center justify-center xl:justify-start">
                            <CalendarIcon className="w-3 sm:w-4 h-3 sm:h-4 lg:w-5 lg:h-5 mr-2 text-gray-400" />
                            <span className="font-medium">Last Modified:</span>
                            <span className="ml-2">
                              {formatDateForDisplay(staff.modifiedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!staff && !loading && (
          <div className="px-4 sm:px-6 py-8 sm:py-16 text-center">
            <div className="inline-flex items-center justify-center w-12 sm:w-16 h-12 sm:h-16 bg-gray-100 rounded-full mb-4">
              <UserIcon className="w-6 sm:w-8 h-6 sm:h-8 text-gray-400" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
              Staff Member Not Found
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">
              The staff member you're looking for doesn't exist or you don't
              have permission to view it.
            </p>
            <Link to="/admin/staff">
              <button className="inline-flex items-center px-3 sm:px-4 py-2 border border-blue-600 rounded-lg text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
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

export default AdminStaffDetailLitePage;
