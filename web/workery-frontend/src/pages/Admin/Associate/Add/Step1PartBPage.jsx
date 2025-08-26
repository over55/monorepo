// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartBPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
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
  WrenchScrewdriverIcon,
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

function AdminAssociateAddStep1PartBPage() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [associates, setAssociates] = useState([]);
  const [selectedAssociateForDeletion, setSelectedAssociateForDeletion] =
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
  const [sortByValue, setSortByValue] = useState("last_name,ASC");

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
  }, [authManager, navigate]);

  // Fetch associates based on search parameters
  useEffect(() => {
    fetchAssociates();
  }, [
    firstName,
    lastName,
    email,
    phone,
    currentCursor,
    pageSize,
    actualSearchText,
    sortByValue,
    status,
    typeOf,
    createdAtGTE,
  ]);

  const fetchAssociates = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Build filters map like the original implementation
      const filtersMap = new Map();

      // Pagination
      filtersMap.set("pageSize", pageSize);
      filtersMap.set("sortField", "last_name"); // Default sort field

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Sorting - split the sortByValue like original implementation
      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sortField", sortArray[0]);
        filtersMap.set("sortOrder", sortArray[1]);
      }

      // Search parameters - use exact parameter names that API expects
      if (firstName) {
        filtersMap.set("firstName", firstName);
      }
      if (lastName) {
        filtersMap.set("lastName", lastName);
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
        filtersMap.set("createdAtGte", createdAtGTEStr);
      }

      console.log("Fetching associates with filters:", filtersMap);

      // Use getAssociatesWithFiltersMap like the original implementation
      const associatesData = await associateManager.getAssociatesWithFiltersMap(
        filtersMap,
        () => navigate("/login?unauthorized=true"),
        true, // force refresh
      );

      console.log("Associates response:", associatesData);

      setAssociates(associatesData.results || []);
      if (associatesData.hasNextPage) {
        setNextCursor(associatesData.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch associates:", error);
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

  const onSelectAssociateForDeletion = (e, associate) => {
    console.log("onSelectAssociateForDeletion", associate);
    setSelectedAssociateForDeletion(associate);
  };

  const onDeselectAssociateForDeletion = (e) => {
    console.log("onDeselectAssociateForDeletion");
    setSelectedAssociateForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedAssociateForDeletion) return;

    try {
      await associateManager.deleteAssociate(
        selectedAssociateForDeletion.id,
        () => navigate("/login?unauthorized=true"),
      );

      // Refresh the list
      await fetchAssociates();
      setSelectedAssociateForDeletion(null);
    } catch (error) {
      console.error("Failed to delete associate:", error);
      setErrors(error);
    }
  };

  const onAddAssociateClick = () => {
    // Clear any existing associate creation state
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
    navigate("/admin/associates/add/step-2");
  };

  const getAssociateTypeIcon = (type) => {
    switch (type) {
      case 2: // Residential
        return (
          <HomeIcon className="w-4 sm:w-5 h-4 sm:h-5 inline text-green-600 flex-shrink-0" />
        );
      case 3: // Commercial
        return (
          <BuildingOffice2Icon className="w-4 sm:w-5 h-4 sm:h-5 inline text-blue-600 flex-shrink-0" />
        );
      default:
        return (
          <WrenchScrewdriverIcon className="w-4 sm:w-5 h-4 sm:h-5 inline text-gray-600 flex-shrink-0" />
        );
    }
  };

  // Section Component with Dark Header Pattern
  const DetailSection = ({ title, icon: Icon, children, toolbar }) => (
    <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
      <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
          <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
          <span className="truncate">{title}</span>
        </h2>
        {toolbar && <div>{toolbar}</div>}
      </div>
      <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg">
        {children}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <Link
                  to="/admin/associates"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    <span className="hidden sm:inline">Associates</span>
                    <span className="sm:hidden">Assoc</span>
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-400 mx-1 sm:mx-2" />
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden sm:inline">Add - Search Results</span>
                  <span className="sm:hidden">Results</span>
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-7 md:w-8 h-6 sm:h-7 md:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            <span className="hidden sm:inline">
              Add New Associate - Search Results
            </span>
            <span className="sm:hidden">Search Results</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review search results or create a new associate
          </p>
        </div>

        {/* Wizard Steps - Mobile First */}
        <div className="mb-4 sm:mb-6">
          {/* Mobile View */}
          <div className="md:hidden bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold text-sm">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Step 1: Search
                  </p>
                  <p className="text-xs text-gray-500">Review Results</p>
                </div>
              </div>
              <div className="text-xs text-gray-500">1 of 7</div>
            </div>
          </div>

          {/* Desktop View */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Check Existing</p>
                </div>
              </div>

              {/* Other Steps */}
              {[
                { num: 2, title: "Type", subtitle: "Select Type" },
                { num: 3, title: "Contact", subtitle: "Basic Info" },
                { num: 4, title: "Address", subtitle: "Location" },
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
              ].map((step, index) => (
                <React.Fragment key={step.num}>
                  <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                      <span className="text-gray-600 font-semibold">
                        {step.num}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500">
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-400">{step.subtitle}</p>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message - Responsive */}
        {errors.message && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-xs sm:text-sm">
              <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
              <span>{errors.message}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2 flex-shrink-0"
            >
              <XMarkIcon className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        )}

        {/* Filter Panel with Dark Header */}
        <DetailSection title="Search Parameters & Filters" icon={FunnelIcon}>
          <div className="p-4 sm:p-6">
            {/* Display Current Search Parameters */}
            <div className="mb-4 p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                Current Search:
              </p>
              <div className="flex flex-wrap gap-2">
                {firstName && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    First Name: {firstName}
                  </span>
                )}
                {lastName && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Last Name: {lastName}
                  </span>
                )}
                {email && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Email: {email}
                  </span>
                )}
                {phone && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Phone: {phone}
                  </span>
                )}
              </div>
            </div>

            {/* Additional Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(parseInt(e.target.value) || "")}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="">All Statuses</option>
                  <option value="1">Active</option>
                  <option value="2">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={typeOf}
                  onChange={(e) => setTypeOf(parseInt(e.target.value))}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value={0}>All Types</option>
                  <option value={1}>Unassigned</option>
                  <option value={2}>Residential</option>
                  <option value={3}>Commercial</option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  value={sortByValue}
                  onChange={(e) => setSortByValue(e.target.value)}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="last_name,ASC">Name (A-Z)</option>
                  <option value="last_name,DESC">Name (Z-A)</option>
                  <option value="join_date,ASC">Join Date (Oldest)</option>
                  <option value="join_date,DESC">Join Date (Newest)</option>
                </select>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Results Section with Dark Header */}
        <DetailSection
          title="Search Results"
          icon={ClipboardDocumentListIcon}
          toolbar={
            associates.length > 0 && (
              <span className="text-xs sm:text-sm text-gray-300">
                {associates.length}{" "}
                {associates.length === 1 ? "result" : "results"} found
              </span>
            )
          }
        >
          {isLoading ? (
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-sm sm:text-base text-gray-600">
                  Loading associates...
                </span>
              </div>
            </div>
          ) : (
            <>
              {associates && associates.length > 0 ? (
                <>
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      {associates.map((associate) => (
                        <div
                          key={associate.id}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-blue-200">
                            <Link
                              to={`/admin/associate/${associate.id}`}
                              className="font-semibold text-sm sm:text-base text-gray-900 hover:text-blue-600 flex items-center transition-colors"
                            >
                              {getAssociateTypeIcon(associate.type)}
                              <span className="ml-2 break-words">
                                {associate.type === 3
                                  ? associate.organizationName ||
                                    `${associate.firstName} ${associate.lastName}`
                                  : `${associate.firstName} ${associate.lastName}`}
                              </span>
                            </Link>
                          </div>

                          {/* Body */}
                          <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-start">
                              <MapPinIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0 mt-0.5" />
                              <div className="break-words">
                                <div>{associate.addressLine1}</div>
                                <div>
                                  {associate.city}, {associate.region}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <PhoneIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                              {associate.phone ? (
                                <a
                                  href={`tel:${associate.phone}`}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                  {associate.phone}
                                </a>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <EnvelopeIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                              {associate.email ? (
                                <a
                                  href={`mailto:${associate.email}`}
                                  className="text-blue-600 hover:text-blue-800 truncate transition-colors"
                                >
                                  {associate.email}
                                </a>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                          </div>

                          {/* Footer */}
                          <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-blue-200">
                            <Link
                              to={`/admin/associate/${associate.id}`}
                              className="inline-flex items-center text-xs sm:text-sm font-medium text-white bg-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Select
                              <ArrowRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls - Responsive */}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center">
                        <label className="text-xs sm:text-sm text-gray-700 mr-2">
                          Show
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            setPageSize(parseInt(e.target.value))
                          }
                          className="px-2 py-1 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                        <span className="text-xs sm:text-sm text-gray-700 ml-2">
                          per page
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {previousCursors.length > 0 && (
                          <button
                            onClick={onPreviousClicked}
                            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <ChevronLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                            Previous
                          </button>
                        )}
                        {nextCursor && (
                          <button
                            onClick={onNextClicked}
                            className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Next
                            <ChevronRightIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-lg">
                    <ClipboardDocumentListIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-gray-400 mb-3" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      No Associates Found
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4">
                      No associates found matching your search criteria.
                    </p>
                    <Link
                      to="/admin/associates/add/step-1-search"
                      className="inline-flex items-center text-sm sm:text-base text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      <ArrowLeftIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      Try a different search
                    </Link>
                  </div>
                </div>
              )}

              {/* OR Divider and Actions */}
              {!isLoading && (
                <>
                  <div className="relative px-4 sm:px-6 py-3">
                    <div className="absolute inset-0 flex items-center px-4 sm:px-6">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-3 sm:px-4 bg-white text-xs sm:text-sm font-medium text-gray-500">
                        OR
                      </span>
                    </div>
                  </div>

                  <div className="px-4 pb-4 sm:px-6 sm:pb-5">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                      <Link
                        to="/admin/associates/add/step-1-search"
                        className="w-full sm:w-auto"
                      >
                        <button className="w-full inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                          <MagnifyingGlassIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                          Search Again
                        </button>
                      </Link>
                      <button
                        onClick={onAddAssociateClick}
                        className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <UserPlusIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />
                        Add New Associate
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </DetailSection>

        {/* Back Link */}
        <div className="mt-6">
          <Link
            to="/admin/associates/add/step-1-search"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal - Responsive with Dark Header */}
      {selectedAssociateForDeletion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
                <ExclamationCircleIcon className="h-4 sm:h-5 w-4 sm:w-5 mr-2 text-amber-400 flex-shrink-0" />
                <span className="truncate">Are you sure?</span>
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <p className="text-xs sm:text-sm text-gray-600">
                You are about to <strong>archive</strong> this user; it will no
                longer appear on your dashboard. This action can be undone but
                you'll need to contact the system administrator. Are you sure
                you would like to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={onDeselectAssociateForDeletion}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirmButtonClick}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors order-1 sm:order-2"
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

export default AdminAssociateAddStep1PartBPage;
