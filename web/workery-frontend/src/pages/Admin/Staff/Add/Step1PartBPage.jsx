// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step1PartBPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useStaffManager,
  useStaffAddWizardStorage,
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
  UsersIcon,
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
  COMMERCIAL_STAFF_TYPE_OF_ID,
  RESIDENTIAL_STAFF_TYPE_OF_ID,
  STAFF_STATUS_FILTER_OPTIONS,
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_SORT_OPTIONS,
} from "../../../../constants/Staff";

function AdminStaffAddStep1PartBPage() {
  const authManager = useAuthManager();
  const staffManager = useStaffManager();
  const wizardStorage = useStaffAddWizardStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] =
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

  // Fetch staff based on search parameters
  useEffect(() => {
    fetchStaffList();
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

  const fetchStaffList = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      // Build filters map similar to associates
      const filtersMap = new Map();

      // Pagination
      filtersMap.set("pageSize", pageSize);
      filtersMap.set("sortField", "last_name");

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      // Sorting
      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sortField", sortArray[0]);
        filtersMap.set("sortOrder", sortArray[1]);
      }

      // Search parameters
      if (firstName) filtersMap.set("firstName", firstName);
      if (lastName) filtersMap.set("lastName", lastName);
      if (email) filtersMap.set("email", email);
      if (phone) filtersMap.set("phone", phone);

      // Additional filters
      if (actualSearchText) filtersMap.set("search", actualSearchText);
      if (status) filtersMap.set("status", status);
      if (typeOf !== 0) filtersMap.set("type", typeOf);
      if (createdAtGTE) {
        const createdAtGTEStr = createdAtGTE.getTime();
        filtersMap.set("createdAtGte", createdAtGTEStr);
      }

      console.log("Fetching staff with filters:", filtersMap);

      // Use getStaffWithFiltersMap if available
      const staffData = (await staffManager.getStaffWithFiltersMap)
        ? await staffManager.getStaffWithFiltersMap(
            filtersMap,
            () => navigate("/login?unauthorized=true"),
            true,
          )
        : await staffManager.getStaff(Object.fromEntries(filtersMap), () =>
            navigate("/login?unauthorized=true"),
          );

      console.log("Staff response:", staffData);

      setStaffList(staffData.results || []);
      if (staffData.hasNextPage) {
        setNextCursor(staffData.nextCursor);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
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

  const onSelectStaffForDeletion = (e, staff) => {
    console.log("onSelectStaffForDeletion", staff);
    setSelectedStaffForDeletion(staff);
  };

  const onDeselectStaffForDeletion = (e) => {
    console.log("onDeselectStaffForDeletion");
    setSelectedStaffForDeletion(null);
  };

  const onDeleteConfirmButtonClick = async () => {
    if (!selectedStaffForDeletion) return;

    try {
      await staffManager.deleteStaff(selectedStaffForDeletion.id, () =>
        navigate("/login?unauthorized=true"),
      );

      // Refresh the list
      await fetchStaffList();
      setSelectedStaffForDeletion(null);
    } catch (error) {
      console.error("Failed to delete staff:", error);
      setErrors(error);
    }
  };

  const onAddStaffClick = () => {
    // Clear any existing staff creation state
    wizardStorage.resetWizardState();
    navigate("/admin/staff/add/step-2");
  };

  const getStaffTypeIcon = (type) => {
    switch (type) {
      case RESIDENTIAL_STAFF_TYPE_OF_ID:
        return <HomeIcon className="w-5 h-5 inline text-green-600" />;
      case COMMERCIAL_STAFF_TYPE_OF_ID:
        return <BuildingOffice2Icon className="w-5 h-5 inline text-blue-600" />;
      default:
        return <UsersIcon className="w-5 h-5 inline text-gray-600" />;
    }
  };

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
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <Link
                  to="/admin/staff"
                  className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
                >
                  <span className="inline-flex items-center">
                    <UsersIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                    Staff
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <span className="mx-1 sm:mx-2 text-gray-400">/</span>
                <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                  <UserPlusIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Search Results
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title - Responsive */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <UserPlusIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
            <span>Add New Staff - Results</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
            <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
            Review search results or create new staff
          </p>
        </div>

        {/* Wizard Steps - Mobile Simplified */}
        <div className="mb-4 sm:mb-6">
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

          {/* Desktop Wizard Steps */}
          <div className="hidden md:flex items-center justify-center overflow-x-auto pb-2">
            <div className="flex items-center min-w-max">
              {/* Step 1 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">1</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Search</p>
                  <p className="text-xs text-gray-500">Review Results</p>
                </div>
              </div>

              {[
                { num: 2, title: "Type", subtitle: "Select Type" },
                { num: 3, title: "Contact", subtitle: "Basic Info" },
                { num: 4, title: "Address", subtitle: "Location" },
                { num: 5, title: "Account", subtitle: "Settings" },
                { num: 6, title: "Metrics", subtitle: "Performance" },
                { num: 7, title: "Comments", subtitle: "Notes" },
              ].map((step) => (
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
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base">
            <div className="flex justify-between items-center">
              <span className="flex items-center break-words">
                <ExclamationCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0" />
                {errors.message}
              </span>
              <button
                onClick={() => setErrors({})}
                className="text-red-700 hover:text-red-900 ml-2 flex-shrink-0"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Main Content with Dark Header */}
        <div className="bg-gray-700 rounded-lg shadow-sm">
          <div className="px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-base sm:text-lg font-semibold text-white flex items-center">
              <ClipboardDocumentListIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
              <span className="truncate">Search Results</span>
            </h2>
          </div>

          {/* Filter Panel with Dark Sub-Header */}
          <div className="bg-gray-600 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-800">
            <div className="flex items-center mb-3">
              <FunnelIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-gray-300" />
              <h3 className="text-sm font-semibold text-white">
                Filtering & Sorting
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-200 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(parseInt(e.target.value) || "")}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-500 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="1">Active</option>
                  <option value="2">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-gray-200 mb-1">
                  Type
                </label>
                <select
                  value={typeOf}
                  onChange={(e) => setTypeOf(parseInt(e.target.value))}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-500 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={0}>All Types</option>
                  <option value={1}>Unassigned</option>
                  <option value={RESIDENTIAL_STAFF_TYPE_OF_ID}>
                    Residential
                  </option>
                  <option value={COMMERCIAL_STAFF_TYPE_OF_ID}>
                    Commercial
                  </option>
                </select>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs md:text-sm font-medium text-gray-200 mb-1">
                  Sort by
                </label>
                <select
                  value={sortByValue}
                  onChange={(e) => setSortByValue(e.target.value)}
                  className="w-full px-2 py-1.5 md:px-3 md:py-2 text-sm md:text-base border border-gray-500 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="last_name,ASC">Name (A-Z)</option>
                  <option value="last_name,DESC">Name (Z-A)</option>
                  <option value="join_date,ASC">Join Date (Oldest)</option>
                  <option value="join_date,DESC">Join Date (Newest)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg">
            {/* Results Content */}
            {isLoading ? (
              <div className="p-4 md:p-6">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 md:h-12 md:w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-sm md:text-base text-gray-600">
                    Loading staff...
                  </span>
                </div>
              </div>
            ) : (
              <>
                {staffList && staffList.length > 0 ? (
                  <>
                    <div className="p-4 md:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                        {staffList.map((staff) => (
                          <div
                            key={staff.id}
                            className="bg-blue-50 border border-blue-200 rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow"
                          >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-2 md:mb-3 pb-2 md:pb-3 border-b border-blue-200">
                              <Link
                                to={`/admin/staff/${staff.id}`}
                                className="font-semibold text-sm md:text-base text-gray-900 hover:text-blue-600 flex items-center"
                              >
                                {getStaffTypeIcon(staff.type)}
                                <span className="ml-2 break-words">
                                  {staff.type === COMMERCIAL_STAFF_TYPE_OF_ID
                                    ? staff.organizationName ||
                                      `${staff.firstName} ${staff.lastName}`
                                    : `${staff.firstName} ${staff.lastName}`}
                                </span>
                              </Link>
                            </div>

                            {/* Body */}
                            <div className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-gray-600">
                              <div className="flex items-start">
                                <MapPinIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                  <div>{staff.addressLine1}</div>
                                  <div>
                                    {staff.city}, {staff.region}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <PhoneIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                                {staff.phone ? (
                                  <a
                                    href={`tel:${staff.phone}`}
                                    className="text-blue-600 hover:text-blue-800"
                                  >
                                    {staff.phone}
                                  </a>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <EnvelopeIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
                                {staff.email ? (
                                  <a
                                    href={`mailto:${staff.email}`}
                                    className="text-blue-600 hover:text-blue-800 truncate"
                                  >
                                    {staff.email}
                                  </a>
                                ) : (
                                  <span>-</span>
                                )}
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-blue-200">
                              <Link
                                to={`/admin/staff/${staff.id}`}
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
                        No Staff Found
                      </h3>
                      <p className="text-sm md:text-base text-gray-600 mb-4">
                        No staff members found matching your search criteria.
                      </p>
                      <Link
                        to="/admin/staff/add/step-1-search"
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
                        <Link to="/admin/staff/add/step-1-search">
                          <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                            <MagnifyingGlassIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                            Search Again
                          </button>
                        </Link>
                        <button
                          onClick={onAddStaffClick}
                          className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2 md:px-6 md:py-2 text-xs md:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                        >
                          <UserPlusIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                          Add New Staff Member
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
            to="/admin/staff/add/step-1-search"
            className="inline-flex items-center text-xs md:text-sm text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
            Back to Search
          </Link>
        </div>
      </div>

      {/* Delete Confirmation Modal - Responsive */}
      {selectedStaffForDeletion && (
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
                You are about to <strong>archive</strong> this staff member;
                they will no longer appear on your dashboard. This action can be
                undone but you'll need to contact the system administrator. Are
                you sure you would like to continue?
              </p>
            </div>

            <div className="px-4 py-3 md:px-6 md:py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2 md:space-x-3">
              <button
                onClick={onDeselectStaffForDeletion}
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

export default AdminStaffAddStep1PartBPage;
