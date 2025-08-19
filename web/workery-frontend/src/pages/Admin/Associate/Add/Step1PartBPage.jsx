// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartBPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
        return <HomeIcon className="w-5 h-5 inline text-green-600" />;
      case 3: // Commercial
        return <BuildingOffice2Icon className="w-5 h-5 inline text-blue-600" />;
      default:
        return (
          <WrenchScrewdriverIcon className="w-5 h-5 inline text-gray-600" />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumb */}
        <nav className="flex mb-4" aria-label="Breadcrumb">
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
                  to="/admin/associates"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                    Associates
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Add - Search Results
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-7 h-7 mr-3 text-blue-600" />
            Add New Associate - Search Results
          </h1>
        </div>

        {/* Wizard Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-center overflow-x-auto">
            <div className="flex items-center">
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

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 2 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">2</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Type</p>
                  <p className="text-xs text-gray-400">Select Type</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Contact</p>
                  <p className="text-xs text-gray-400">Basic Info</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">4</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  <p className="text-xs text-gray-400">Location</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">5</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Account</p>
                  <p className="text-xs text-gray-400">Settings</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 6 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">6</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Metrics</p>
                  <p className="text-xs text-gray-400">Performance</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 7 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-gray-300 rounded-full">
                  <span className="text-gray-600 font-semibold">7</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">Comments</p>
                  <p className="text-xs text-gray-400">Notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              {errors.message}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div>
          <div>
            <div className="bg-white shadow-sm rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ClipboardDocumentListIcon className="w-5 h-5 mr-2" />
                  Search Results
                </h2>
              </div>

              {/* Filter Panel */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center mb-3">
                  <FunnelIcon className="w-5 h-5 mr-2 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Filtering & Sorting
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) =>
                        setStatus(parseInt(e.target.value) || "")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="1">Active</option>
                      <option value="2">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <select
                      value={typeOf}
                      onChange={(e) => setTypeOf(parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>All Types</option>
                      <option value={1}>Unassigned</option>
                      <option value={2}>Residential</option>
                      <option value={3}>Commercial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort by
                    </label>
                    <select
                      value={sortByValue}
                      onChange={(e) => setSortByValue(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="last_name,ASC">Name (A-Z)</option>
                      <option value="last_name,DESC">Name (Z-A)</option>
                      <option value="join_date,ASC">Join Date (Oldest)</option>
                      <option value="join_date,DESC">Join Date (Newest)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Results Content */}
              {isLoading ? (
                <div className="p-6">
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">
                      Loading associates...
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  {associates && associates.length > 0 ? (
                    <>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {associates.map((associate) => (
                            <div
                              key={associate.id}
                              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between mb-3 pb-3 border-b border-blue-200">
                                <Link
                                  to={`/admin/associate/${associate.id}`}
                                  className="font-semibold text-gray-900 hover:text-blue-600 flex items-center"
                                >
                                  {getAssociateTypeIcon(associate.type)}
                                  <span className="ml-2">
                                    {associate.type === 3
                                      ? associate.organizationName ||
                                        `${associate.firstName} ${associate.lastName}`
                                      : `${associate.firstName} ${associate.lastName}`}
                                  </span>
                                </Link>
                              </div>

                              {/* Body */}
                              <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-start">
                                  <MapPinIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <div>{associate.addressLine1}</div>
                                    <div>
                                      {associate.city}, {associate.region}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <PhoneIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {associate.phone ? (
                                    <a
                                      href={`tel:${associate.phone}`}
                                      className="text-blue-600 hover:text-blue-800"
                                    >
                                      {associate.phone}
                                    </a>
                                  ) : (
                                    <span>-</span>
                                  )}
                                </div>
                                <div className="flex items-center">
                                  <EnvelopeIcon className="w-4 h-4 mr-2 flex-shrink-0" />
                                  {associate.email ? (
                                    <a
                                      href={`mailto:${associate.email}`}
                                      className="text-blue-600 hover:text-blue-800 truncate"
                                    >
                                      {associate.email}
                                    </a>
                                  ) : (
                                    <span>-</span>
                                  )}
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="mt-4 pt-3 border-t border-blue-200">
                                <Link
                                  to={`/admin/associate/${associate.id}`}
                                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                  Select
                                  <ArrowRightIcon className="w-4 h-4 ml-1" />
                                </Link>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between">
                          <div>
                            <label className="text-sm text-gray-700 mr-2">
                              Show
                            </label>
                            <select
                              value={pageSize}
                              onChange={(e) =>
                                setPageSize(parseInt(e.target.value))
                              }
                              className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value={25}>25</option>
                              <option value={50}>50</option>
                              <option value={100}>100</option>
                            </select>
                            <span className="text-sm text-gray-700 ml-2">
                              per page
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {previousCursors.length > 0 && (
                              <button
                                onClick={onPreviousClicked}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                                Previous
                              </button>
                            )}
                            {nextCursor && (
                              <button
                                onClick={onNextClicked}
                                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Next
                                <ChevronRightIcon className="w-4 h-4 ml-1" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-6">
                      <div className="text-center py-8 bg-gray-50 rounded-lg">
                        <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No Associates Found
                        </h3>
                        <p className="text-gray-600 mb-4">
                          No associates found matching your search criteria.
                        </p>
                        <Link
                          to="/admin/associates/add/step-1-search"
                          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                        >
                          <ArrowLeftIcon className="w-4 h-4 mr-1" />
                          Try a different search
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* OR Divider and Actions */}
                  {!isLoading && (
                    <>
                      <div className="relative px-6 py-3">
                        <div className="absolute inset-0 flex items-center px-6">
                          <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-4 bg-white text-sm font-medium text-gray-500">
                            OR
                          </span>
                        </div>
                      </div>

                      <div className="px-6 pb-5">
                        <div className="flex gap-3 justify-center">
                          <Link to="/admin/associates/add/step-1-search">
                            <button className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                              <MagnifyingGlassIcon className="w-4 h-4 mr-2" />
                              Search Again
                            </button>
                          </Link>
                          <button
                            onClick={onAddAssociateClick}
                            className="inline-flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                          >
                            <UserPlusIcon className="w-4 h-4 mr-2" />
                            Add New Associate
                          </button>
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
        <div className="mt-6">
          <Link
            to="/admin/associates/add/step-1-search"
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedAssociateForDeletion && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Are you sure?
              </h3>
            </div>

            <div className="px-6 py-4">
              <p className="text-sm text-gray-600">
                You are about to <strong>archive</strong> this user; it will no
                longer appear on your dashboard. This action can be undone but
                you'll need to contact the system administrator. Are you sure
                you would like to continue?
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={onDeselectAssociateForDeletion}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onDeleteConfirmButtonClick}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
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
