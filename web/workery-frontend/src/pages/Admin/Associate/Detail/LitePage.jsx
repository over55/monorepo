// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Detail/LitePage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  EnvelopeIcon,
  PhoneIcon,
  StarIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  HomeIcon,
  CheckCircleIcon,
  ArchiveBoxIcon,
  ArrowTopRightOnSquareIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import { TagsDisplay, SkillSetsDisplay } from "../../../../components/Display";

// Constants
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const ASSOCIATE_IS_JOB_SEEKER_YES = 1;

function AdminAssociateDetailLitePage() {
  const { aid } = useParams();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // State management
  const [associate, setAssociate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch associate data
  const fetchAssociate = async () => {
    if (!aid) return;

    setLoading(true);
    setError(null);

    try {
      const associateData = await associateManager.getAssociateDetail(
        aid,
        onUnauthorized,
      );
      setAssociate(associateData);
    } catch (err) {
      console.error("Failed to fetch associate:", err);
      setError("Failed to load associate details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchAssociate();
  }, [aid]);

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return "-";
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
  };

  // Format address for display
  const formatAddress = (associate) => {
    if (!associate) return "-";
    const address =
      associate.fullAddressWithPostalCode ||
      `${associate.addressLine1 || ""} ${associate.city || ""} ${associate.region || ""} ${associate.postalCode || ""}`.trim();

    return address || "-";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Format score rating
  const formatScoreRating = (score) => {
    if (!score)
      return (
        <span className="text-gray-500 text-base lg:text-lg">No rating</span>
      );
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`w-4 h-4 lg:w-6 lg:h-6 ${
              i < Math.floor(score) ? "text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-base lg:text-lg text-gray-600 font-medium">
          ({score}/5)
        </span>
      </div>
    );
  };

  // Extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items.map((item) => item.id || item.value).filter(Boolean);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading associate details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
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
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/associates"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Associates
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-2" />
                Detail
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-6 h-6 md:w-8 md:h-8 mr-3 text-blue-600" />
              Associate
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              View associate information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {associate && associate.status === 2 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center">
          <ArchiveBoxIcon className="w-5 h-5 mr-2" />
          This associate is archived
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {associate && (
          <>
            {/* Header with Actions */}
            <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-6 h-6 md:w-7 md:h-7 mr-2 text-blue-600" />
                  Summary
                </h2>
                <div className="flex gap-3 w-full sm:w-auto">
                  <Link to="/admin/associates" className="flex-1 sm:flex-none">
                    <button className="w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border border-gray-300 rounded-lg text-sm md:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                      <ChevronLeftIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Back
                    </button>
                  </Link>
                  <Link
                    to={`/admin/associate/${aid}/edit`}
                    className="flex-1 sm:flex-none"
                  >
                    <button
                      disabled={associate.status === 2}
                      className={`w-full sm:w-auto inline-flex items-center justify-center px-4 md:px-5 py-2 md:py-2.5 border rounded-lg text-sm md:text-base font-medium transition-colors ${
                        associate.status === 2
                          ? "border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed"
                          : "border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100"
                      }`}
                    >
                      <PencilSquareIcon className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-4 sm:px-6 border-b border-gray-200">
              <div className="overflow-x-auto lg:overflow-visible">
                <nav className="-mb-px flex space-x-8 justify-center lg:justify-start min-w-max lg:min-w-0">
                  <div className="border-b-2 border-blue-600 py-4 px-1 text-base font-medium text-blue-600 whitespace-nowrap">
                    Summary
                  </div>
                  <Link
                    to={`/admin/associate/${associate.id}/detail`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Detail
                  </Link>
                  <Link
                    to={`/admin/associate/${associate.id}/orders`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Orders
                  </Link>
                  <Link
                    to={`/admin/associate/${associate.id}/comments`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Comments
                  </Link>
                  <Link
                    to={`/admin/associate/${associate.id}/attachments`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
                  >
                    Attachments
                  </Link>
                  <Link
                    to={`/admin/associate/${associate.id}/more`}
                    className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
                  >
                    More
                    <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
                  </Link>
                </nav>
              </div>
            </div>

            {/* Associate Summary Layout - Optimized for Responsiveness */}
            <div className="py-6 md:py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
              {/* Responsive Layout - Stacked on mobile/tablet, side-by-side on larger screens */}
              <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 xl:gap-12 items-center xl:items-start justify-center max-w-6xl mx-auto">
                {/* Avatar - Responsive sizing */}
                <div className="flex-shrink-0 order-1 xl:order-1">
                  <img
                    src={
                      associate.avatarObjectUrl &&
                      associate.avatarObjectUrl !== ""
                        ? associate.avatarObjectUrl
                        : "/img/placeholder.png"
                    }
                    alt={
                      associate.avatarObjectUrl
                        ? "Profile Picture"
                        : "No Profile Picture"
                    }
                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 xl:w-44 xl:h-44 rounded-2xl object-cover border-2 border-gray-100 shadow-sm mx-auto xl:mx-0"
                  />
                </div>

                {/* Main Content Container */}
                <div className="flex-1 w-full xl:flex xl:gap-8 space-y-6 xl:space-y-0 order-2 xl:order-2">
                  {/* Basic Info Column */}
                  <div className="xl:flex-1 xl:min-w-0 text-center xl:text-left">
                    {/* Name/Organization */}
                    <div className="mb-4 lg:mb-5">
                      {associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center justify-center xl:justify-start mb-2">
                          <BuildingOfficeIcon className="w-6 h-6 lg:w-8 lg:h-8 mr-2 lg:mr-3 text-blue-600 flex-shrink-0" />
                          <span className="break-words">
                            {associate.organizationName}
                          </span>
                        </h2>
                      )}
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800 flex items-center justify-center xl:justify-start">
                        {associate.type ===
                          RESIDENTIAL_ASSOCIATE_TYPE_OF_ID && (
                          <HomeIcon className="w-5 h-5 lg:w-7 lg:h-7 mr-2 text-blue-600 flex-shrink-0" />
                        )}
                        <span className="break-words">
                          {associate.name ||
                            `${associate.firstName} ${associate.lastName}`}
                        </span>
                      </h3>
                    </div>

                    {/* Address */}
                    <div className="flex items-start text-base lg:text-lg text-gray-600 mb-4 lg:mb-5 justify-center xl:justify-start">
                      <MapPinIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-2 mt-0.5 flex-shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <span className="break-words">
                          {formatAddress(associate)}
                        </span>
                        {associate.fullAddressUrl && (
                          <a
                            href={associate.fullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 inline-flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="space-y-3">
                      <div className="flex items-center text-base lg:text-lg justify-center xl:justify-start">
                        <EnvelopeIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          {associate.email ? (
                            <a
                              href={`mailto:${associate.email}`}
                              className="text-blue-600 hover:text-blue-700 font-medium break-all"
                            >
                              {associate.email}
                            </a>
                          ) : (
                            <span className="text-gray-500">No email</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center text-base lg:text-lg justify-center xl:justify-start">
                        <PhoneIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-gray-400 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          {associate.phone ? (
                            <a
                              href={`tel:${associate.phone}`}
                              className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                              {formatPhone(associate.phone)}
                            </a>
                          ) : (
                            <span className="text-gray-500">No phone</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center text-base lg:text-lg mt-4 lg:mt-5 justify-center xl:justify-start">
                      <StarIcon className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-gray-400 flex-shrink-0" />
                      <div>{formatScoreRating(associate.score)}</div>
                    </div>
                  </div>

                  {/* Tags and Skills Column */}
                  <div className="xl:flex-1 xl:min-w-0 space-y-4 lg:space-y-6 text-center xl:text-left">
                    {/* Tags */}
                    <div>
                      <TagsDisplay
                        values={extractIds(associate.tags)}
                        label="Tags"
                        onUnauthorized={onUnauthorized}
                      />
                    </div>

                    {/* Skills */}
                    <div>
                      <SkillSetsDisplay
                        values={extractIds(associate.skillSets)}
                        label="Skill Sets"
                        onUnauthorized={onUnauthorized}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!associate && !loading && (
          <div className="px-6 py-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <UserGroupIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Associate Not Found
            </h3>
            <p className="text-gray-500 mb-6">
              The associate you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
            <Link to="/admin/associates">
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                <ChevronLeftIcon className="w-4 h-4 mr-2" />
                Back to Associates
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminAssociateDetailLitePage;
