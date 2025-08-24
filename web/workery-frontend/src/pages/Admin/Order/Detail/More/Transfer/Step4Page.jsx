// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import {
  ChartBarIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  CheckIcon,
  BuildingOfficeIcon,
  HomeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 1;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 2;

function AdminOrderDetailMoreTransferStep4Page() {
  const { oid } = useParams();
  const [searchParams] = useSearchParams();
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // Get search parameters from URL
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";
  const actualSearchText = searchParams.get("q") || "";

  // State management
  const [associates, setAssociates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [sortBy, setSortBy] = useState("last_name");
  const [sortOrder, setSortOrder] = useState("ASC");

  // Fetch associates
  const fetchAssociates = async () => {
    setLoading(true);
    setErrors({});

    try {
      const params = {
        page: page,
        limit: pageSize,
        sortBy: sortBy,
        sortOrder: sortOrder,
      };

      // Add search parameters
      if (actualSearchText) params.search = actualSearchText;
      if (firstName) params.firstName = firstName;
      if (lastName) params.lastName = lastName;
      if (email) params.email = email;
      if (phone) params.phone = phone;

      const data = await associateManager.getAssociates(params, () =>
        navigate("/login?unauthorized=true"),
      );

      setAssociates(data);
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors({ fetch: "Failed to load associates. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    fetchAssociates();
  }, [page, pageSize, sortBy, sortOrder]);

  // Helper function to get associate display name
  const getAssociateDisplayName = (associate) => {
    if (associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      return (
        associate.organizationName ||
        `${associate.firstName || ""} ${associate.lastName || ""}`.trim()
      );
    }
    return `${associate.firstName || ""} ${associate.lastName || ""}`.trim();
  };

  const handleSelectAssociate = (associateId, associate) => {
    // Construct the proper display name
    const associateName = getAssociateDisplayName(associate);

    const transferOp = transferOperationStorage.getTransferOperation();
    transferOp.pickedAssociateID = associateId;
    transferOp.pickedAssociateName = associateName;
    transferOperationStorage.saveTransferOperation(transferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-5`);
  };

  const handleSkip = () => {
    navigate(`/admin/order/${oid}/more/transfer/step-5`);
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
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Dash</span>
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/orders"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                    Orders
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  Order #{oid}
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/order/${oid}/more`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <EllipsisHorizontalIcon className="w-4 h-4 mr-2" />
                    More
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ArrowsRightLeftIcon className="w-4 h-4 mr-2" />
                  Transfer
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ArrowsRightLeftIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
            Transfer Order
          </h1>
        </div>

        {/* Wizard Steps - Responsive */}
        <div className="mb-6 relative">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center min-w-max lg:justify-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Start
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Reason
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-green-600"></div>

              {/* Step 3 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                  <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Search
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Complete
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 4 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    4
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-900">
                    Select
                  </p>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Associate
                  </p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-1 sm:mx-2 w-8 sm:w-10 lg:w-12 h-0.5 bg-gray-300"></div>

              {/* Step 5 - Inactive */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                  <span className="text-gray-600 font-semibold text-sm sm:text-base">
                    5
                  </span>
                </div>
                <div className="ml-2 sm:ml-3">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">
                    Confirm
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">
                    Transfer
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator for mobile/tablet */}
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none lg:hidden"></div>
        </div>

        {/* Error Message */}
        {errors.fetch && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-3 sm:px-4 py-2 sm:py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center text-sm sm:text-base">
              <ExclamationCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {errors.fetch}
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <UserGroupIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Search Results
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">
                  Loading associates...
                </span>
              </div>
            ) : (
              <>
                {associates &&
                associates.results &&
                associates.results.length > 0 ? (
                  <>
                    {/* Associates Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                      {associates.results.map((associate) => {
                        const displayName = getAssociateDisplayName(associate);
                        const isCommercial =
                          associate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID;

                        return (
                          <div
                            key={associate.id}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start mb-3">
                              {isCommercial ? (
                                <BuildingOfficeIcon className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                              ) : (
                                <HomeIcon className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                              )}
                              <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                                {displayName}
                              </h4>
                            </div>

                            <div className="space-y-1 mb-3">
                              <p className="text-xs text-gray-600 flex items-start">
                                <MapPinIcon className="w-3 h-3 mr-1 flex-shrink-0 mt-0.5" />
                                <span>
                                  {associate.addressLine1}
                                  <br />
                                  {associate.city}, {associate.region}
                                </span>
                              </p>

                              {associate.phone && (
                                <p className="text-xs text-gray-600 flex items-center">
                                  <PhoneIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                  {associate.phone}
                                </p>
                              )}

                              {associate.email && (
                                <p className="text-xs text-gray-600 flex items-center">
                                  <EnvelopeIcon className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">
                                    {associate.email}
                                  </span>
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() =>
                                handleSelectAssociate(associate.id, associate)
                              }
                              className="w-full px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                              Select
                              <ArrowRightIcon className="w-3 h-3 ml-1 inline" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center">
                        <label className="text-sm text-gray-700 mr-2">
                          Show:
                        </label>
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            setPageSize(parseInt(e.target.value))
                          }
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={10}>10 per page</option>
                          <option value={25}>25 per page</option>
                          <option value={50}>50 per page</option>
                          <option value={100}>100 per page</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        {page > 1 && (
                          <button
                            onClick={() => setPage(page - 1)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Previous
                          </button>
                        )}

                        <span className="text-sm text-gray-700">
                          Page {page}
                        </span>

                        {associates.hasNextPage && (
                          <button
                            onClick={() => setPage(page + 1)}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Next
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg">
                    <div className="flex items-center">
                      <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        No associates found.
                        <Link
                          to={`/admin/order/${oid}/more/transfer/step-3`}
                          className="ml-1 font-medium text-blue-700 hover:text-blue-900 underline"
                        >
                          Click here to search again
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Form Actions */}
                <div className="mt-6 flex gap-2 sm:gap-3">
                  <Link
                    to={`/admin/order/${oid}/more/transfer/step-3`}
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    Back
                  </Link>
                  <button
                    onClick={handleSkip}
                    className="flex-1 inline-flex items-center justify-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Skip
                    <ArrowRightIcon className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep4Page;
