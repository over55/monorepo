// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Incident/List/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchIcon,
  FireIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusCircleIcon,
  EllipsisHorizontalIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../../../../services/Services";
import { ORDER_INCIDENT_SORT_OPTIONS } from "../../../../../../../constants/FieldOptions";

function AdminOrderDetailMoreIncidentListPage() {
  const { oid } = useParams();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [listData, setListData] = useState(null);
  const [sortBy, setSortBy] = useState("created_at,DESC");
  const [pageSize, setPageSize] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch incidents list
  const fetchIncidentsList = async () => {
    setFetching(true);
    setErrors({});

    try {
      const params = {
        orderWjid: oid,
        sortBy: sortBy,
        page: currentPage,
        limit: pageSize,
      };

      const data = await orderIncidentManager.getOrderIncidents(
        params,
        onUnauthorized,
      );
      setListData(data);

      console.log(
        "AdminOrderDetailMoreIncidentListPage: Incidents loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentListPage: Failed to fetch incidents:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchIncidentsList();
    }

    return () => {
      mounted = false;
    };
  }, [oid, sortBy, currentPage, pageSize]);

  const onNextClicked = () => {
    setCurrentPage(currentPage + 1);
  };

  const onPreviousClicked = () => {
    setCurrentPage(Math.max(1, currentPage - 1));
  };

  const onRowClick = (incident) => {
    navigate(`/admin/order/${oid}/more/incident/${incident.id}`);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  // Page size options
  const pageSizeOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  if (isFetching && !listData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading incidents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                to="/admin/orders"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <WrenchIcon className="w-4 h-4 mr-2" />
                  Orders
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Order #{oid}
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/order/${oid}/more`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
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
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <FireIcon className="w-4 h-4 mr-2" />
                Incidents
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <WrenchIcon className="w-8 h-8 mr-3 text-blue-600" />
              Order Management
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <InformationCircleIcon className="w-4 h-4 mr-1" />
              Manage incidents and issues for order #{oid}
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {errors && Object.keys(errors).length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-start">
            <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <strong>There were errors:</strong>
              <ul className="mt-2 ml-4 list-disc">
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Title and New Button */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <FireIcon className="w-7 h-7 mr-2 text-red-600" />
              Incidents
            </h2>
            <Link to={`/admin/order/${oid}/more/incidents/create`}>
              <button className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                Add Incident
              </button>
            </Link>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                {ORDER_INCIDENT_SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isFetching ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading incidents...</p>
              </div>
            </div>
          ) : listData && listData.results && listData.results.length > 0 ? (
            <>
              {/* Incidents Table */}
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg mb-6">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listData.results.map((incident, index) => (
                      <tr
                        key={incident.id || index}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => onRowClick(incident)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/admin/order/${oid}/more/incident/${incident.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {incident.title || "Untitled"}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                            {formatDate(incident.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {incident.closingReason ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <CheckCircleIcon className="w-4 h-4 mr-1" />
                              Closed
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <ClockIcon className="w-4 h-4 mr-1" />
                              Open
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            to={`/admin/order/${oid}/more/incident/${incident.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                              <EyeIcon className="w-4 h-4 mr-1" />
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <span className="text-sm text-gray-700">
                    Total Results: {listData.count || 0}
                  </span>
                  <div className="ml-6 flex items-center">
                    <label className="mr-3 text-sm font-medium text-gray-700">
                      Items per page:
                    </label>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      {pageSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3">
                  {currentPage > 1 && (
                    <button
                      onClick={onPreviousClicked}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                      <ChevronLeftIcon className="w-4 h-4 mr-2" />
                      Previous
                    </button>
                  )}
                  {listData.hasNextPage && (
                    <button
                      onClick={onNextClicked}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                      Next
                      <ChevronRightIcon className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            // No incidents message
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <FireIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Incidents Found
              </h3>
              <p className="text-gray-500 mb-4">
                No incidents have been reported for this order.
              </p>
              <Link to={`/admin/order/${oid}/more/incidents/create`}>
                <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                  Report First Incident
                </button>
              </Link>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Link to={`/admin/order/${oid}/more`}>
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to More
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderDetailMoreIncidentListPage;
