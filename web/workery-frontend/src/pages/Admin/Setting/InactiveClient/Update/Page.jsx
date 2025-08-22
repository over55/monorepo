// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Update/Page.jsx

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCustomerManager } from "../../../../../services/Services";
import {
  UserIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  HomeIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import {
  UNASSIGNED_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_DEACTIVATION_REASON_MAP,
} from "../../../../../constants/Customer";

function SettingInactiveClientUpdatePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // State management
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch client details
  const fetchClientDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerManager.getCustomerDetail(
        id,
        onUnauthorized,
      );

      if (response) {
        setClient(response);
      } else {
        setClient(null);
      }
    } catch (err) {
      console.error("Failed to fetch client details:", err);
      setError("Failed to load client details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, customerManager, onUnauthorized]);

  // Handle restore client
  const handleRestoreClient = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update the client to set status back to active (1)
      const updateData = {
        ...client,
        status: 1, // Set to active
        deactivationReason: null,
        deactivationReasonOther: null,
      };

      await customerManager.updateCustomer(id, updateData, onUnauthorized);

      // Navigate back to inactive clients list with success message
      navigate("/admin/settings/inactive-clients", {
        state: {
          successMessage: "Client restored to active status successfully",
        },
      });
    } catch (err) {
      console.error("Failed to restore client:", err);
      setError("Failed to restore client. Please try again.");
      setSaving(false);
    }
  };

  // Load client data on mount
  useEffect(() => {
    if (id) {
      fetchClientDetails();
    }
  }, [id, fetchClientDetails]);

  // Format customer type for display
  const getCustomerTypeDisplay = (type) => {
    switch (type) {
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return "Commercial";
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
        return "Residential";
      case UNASSIGNED_CUSTOMER_TYPE_OF_ID:
        return "Unassigned";
      default:
        return "Unknown";
    }
  };

  // Get badge color for customer type
  const getTypeBadgeColor = (customerType) => {
    switch (customerType) {
      case COMMERCIAL_CUSTOMER_TYPE_OF_ID:
        return "bg-blue-100 text-blue-800";
      case RESIDENTIAL_CUSTOMER_TYPE_OF_ID:
        return "bg-green-100 text-green-800";
      case UNASSIGNED_CUSTOMER_TYPE_OF_ID:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get deactivation reason text
  const getDeactivationReasonText = (reason, reasonOther) => {
    if (reason === 1 && reasonOther) {
      return reasonOther;
    }
    return CUSTOMER_DEACTIVATION_REASON_MAP[reason] || "Not specified";
  };

  const getClientName = () => {
    if (!client) return "";
    if (
      client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID &&
      client.organizationName
    ) {
      return client.organizationName;
    }
    return `${client.firstName || ""} ${client.lastName || ""}`.trim();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading client details...</span>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              Client Not Found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The client you're looking for could not be found.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/admin/settings/inactive-clients")}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Back to Inactive Clients
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
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
                  to="/admin/settings"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2 inline" />
                  Settings
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings/inactive-clients"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <ArchiveBoxIcon className="w-4 h-4 mr-2 inline" />
                  Inactive Clients
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                  Restore Client
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ArrowPathIcon className="w-8 h-8 mr-3 text-green-600" />
              Restore Inactive Client
            </h1>
            <p className="mt-2 text-gray-600">
              Confirm restoring this client to active status.
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/settings/inactive-clients")}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to List
          </button>
        </div>

        {/* Error Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between max-w-3xl mx-auto">
            <span className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Restore Card */}
        <div className="bg-white shadow-sm rounded-lg max-w-3xl mx-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Restore Client Confirmation
            </h2>
          </div>

          <div className="px-6 py-6 space-y-4">
            <p className="text-gray-700">
              Are you sure you want to restore the following client to active
              status? They will be removed from the inactive list and will be
              able to use the system again.
            </p>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
              <h3 className="text-base font-medium text-gray-800">
                Client to be Restored
              </h3>
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-600 shrink-0">
                    Name
                  </dt>
                  <dd className="text-gray-800">{getClientName()}</dd>
                </div>
                {client.email && (
                  <div className="flex">
                    <dt className="w-32 font-medium text-gray-600 shrink-0">
                      Email
                    </dt>
                    <dd className="text-gray-800">{client.email}</dd>
                  </div>
                )}
                <div className="flex items-center">
                  <dt className="w-32 font-medium text-gray-600 shrink-0">
                    Type
                  </dt>
                  <dd>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(client.type)}`}
                    >
                      {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                        <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                      )}
                      {client.type === RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                        <HomeIcon className="w-4 h-4 mr-1" />
                      )}
                      {getCustomerTypeDisplay(client.type)}
                    </span>
                  </dd>
                </div>
                <div className="flex">
                  <dt className="w-32 font-medium text-gray-600 shrink-0">
                    Deactivation Reason
                  </dt>
                  <dd className="text-gray-800">
                    {getDeactivationReasonText(
                      client.deactivationReason,
                      client.deactivationReasonOther,
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-800 flex items-start">
                <InformationCircleIcon className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0" />
                <span>
                  The client's status will be set to 'Active', and they will no
                  longer appear in the inactive client list.
                </span>
              </p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/settings/inactive-clients")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleRestoreClient}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Restoring...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Confirm and Restore
                </>
              )}
            </button>
          </div>
        </div>

        {/* Additional Actions Card */}
        <div className="mt-6 bg-white shadow-sm rounded-lg max-w-3xl mx-auto">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Need More Information?
            </h2>
          </div>
          <div className="px-6 py-4">
            <p className="text-sm text-gray-600 mb-4">
              If you need to review the client's full history or details before
              restoring, you can view their complete profile.
            </p>
            <button
              onClick={() => navigate(`/admin/customer/${id}`)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              View Full Client Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingInactiveClientUpdatePage;
