// File Path: web/workery-frontend/src/pages/Admin/Setting/VehicleType/Delete/Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useVehicleTypeManager } from "../../../../../services/Services";
import {
  TruckIcon,
  ChevronRightIcon,
  XMarkIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ClipboardDocumentIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  LockClosedIcon,
  ShieldExclamationIcon,
  ClockIcon,
  UserIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

function SettingVehicleTypeDeletePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const vehicleTypeManager = useVehicleTypeManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [vehicleType, setVehicleType] = useState(null);
  const [confirmText, setConfirmText] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch vehicle type details
  const fetchVehicleTypeDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const vehicleTypeData = await vehicleTypeManager.getVehicleTypeDetail(
        id,
        onUnauthorized,
      );

      setVehicleType(vehicleTypeData);

      console.log(
        "VehicleTypeDeletePage: Vehicle type detail loaded for deletion:",
        {
          id: vehicleTypeData.id,
          name: vehicleTypeData.name,
        },
      );
    } catch (err) {
      console.error(
        "VehicleTypeDeletePage: Failed to fetch vehicle type detail:",
        err,
      );
      setError(err.message || "Failed to load vehicle type details");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete confirmation
  const handleDelete = async () => {
    if (!vehicleType) return;

    // Validate confirmation text
    if (confirmText !== vehicleType.name) {
      setError(`Please type "${vehicleType.name}" exactly to confirm`);
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);

      await vehicleTypeManager.deleteVehicleType(id, onUnauthorized);

      console.log("VehicleTypeDeletePage: Vehicle type deleted successfully");

      // Navigate back to list with success message
      navigate("/admin/settings/vehicle-types", {
        state: { successMessage: "Vehicle type deleted successfully" },
      });
    } catch (err) {
      console.error(
        "VehicleTypeDeletePage: Failed to delete vehicle type:",
        err,
      );
      setError(err.message || "Failed to delete vehicle type");
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(`/admin/settings/vehicle-type/${id}/detail`);
  };

  // Load data on component mount
  useEffect(() => {
    if (id && typeof id === "string" && id.trim() !== "") {
      fetchVehicleTypeDetail();
    } else {
      setError("Invalid vehicle type ID");
      setIsLoading(false);
    }
  }, [id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading vehicle type details...</p>
        </div>
      </div>
    );
  }

  // Error state (no data loaded)
  if (error && !vehicleType) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              {error}
            </div>
          </div>
          <Link
            to="/admin/settings/vehicle-types"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Vehicle Types
          </Link>
        </div>
      </div>
    );
  }

  // Not found state
  if (!vehicleType) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg mb-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Vehicle type not found
            </div>
          </div>
          <Link
            to="/admin/settings/vehicle-types"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Vehicle Types
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  <span className="inline-flex items-center">
                    <Cog6ToothIcon className="w-4 h-4 mr-2" />
                    Settings
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to="/admin/settings/vehicle-types"
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Vehicle Types
                  </span>
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <Link
                  to={`/admin/settings/vehicle-type/${id}/detail`}
                  className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
                >
                  <span className="inline-flex items-center">
                    <ClipboardDocumentIcon className="w-4 h-4 mr-2" />
                    {vehicleType?.name || "Detail"}
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Delete
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Warning Alert */}
        <div className="mb-6 bg-red-50 border-2 border-red-300 text-red-800 px-4 py-4 rounded-lg flex items-start">
          <ShieldExclamationIcon className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-lg">Permanent Deletion Warning</p>
            <p className="text-sm mt-1">
              You are about to permanently delete this vehicle type. This action
              cannot be undone.
            </p>
          </div>
        </div>

        {/* Main Delete Card */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrashIcon className="w-6 h-6 mr-2 text-red-600" />
              Delete Vehicle Type
            </h1>
          </div>

          <div className="p-6">
            {/* Error Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
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

            {/* Item Details Section */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-red-600 mb-4">
                Vehicle type to be deleted:
              </h3>

              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name:
                    </label>
                    <div className="p-3 bg-white rounded border border-gray-300 font-semibold text-lg">
                      {vehicleType.name}
                    </div>
                  </div>

                  {vehicleType.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description:
                      </label>
                      <div className="p-3 bg-white rounded border border-gray-300 text-gray-700">
                        {vehicleType.description}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm pt-2 border-t border-red-200">
                    <div>
                      <span className="font-medium text-gray-600">ID:</span>{" "}
                      <span className="text-gray-900">{vehicleType.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>{" "}
                      <span className="text-gray-900">
                        {vehicleType.status === 1 ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">
                        Created:
                      </span>{" "}
                      <span className="text-gray-900">
                        {vehicleType.createdAt
                          ? new Date(vehicleType.createdAt).toLocaleDateString()
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Warning */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <h4 className="text-base font-medium text-amber-800 mb-3 flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                This deletion will affect:
              </h4>
              <ul className="text-sm text-amber-700 space-y-1 ml-7">
                <li className="flex items-start">
                  <TruckIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Any associates currently assigned to this vehicle type
                  </span>
                </li>
                <li className="flex items-start">
                  <DocumentTextIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Historical records referencing this vehicle type will still
                    exist but may show as "Deleted"
                  </span>
                </li>
                <li className="flex items-start">
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Vehicle records and service histories that use this type
                  </span>
                </li>
              </ul>
              <div className="mt-3 pt-3 border-t border-amber-200">
                <p className="text-sm font-medium text-amber-900">
                  <strong>Alternative:</strong> Consider marking the vehicle
                  type as inactive instead of deleting it to preserve historical
                  data.
                </p>
              </div>
            </div>

            {/* Confirmation Section */}
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
              <h4 className="text-base font-medium text-red-700 mb-3 flex items-center">
                <LockClosedIcon className="w-5 h-5 mr-2" />
                Confirmation Required
              </h4>

              <p className="text-sm text-gray-700 mb-3">
                This action will permanently remove the vehicle type from the
                system. All associated data will be lost and cannot be
                recovered.
              </p>

              <p className="text-sm font-medium text-gray-900 mb-3">
                To confirm deletion, please type{" "}
                <code className="px-2 py-1 bg-gray-200 rounded text-red-600 font-mono">
                  {vehicleType.name}
                </code>{" "}
                in the box below:
              </p>

              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${vehicleType.name}" to confirm`}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:outline-none ${
                  confirmText === vehicleType.name
                    ? "border-green-500 bg-green-50 focus:ring-green-500"
                    : "border-red-300 bg-red-50 focus:ring-red-500"
                }`}
                disabled={isDeleting}
                autoFocus
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
              <Link
                to={`/admin/settings/vehicle-type/${id}/detail`}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Detail
              </Link>

              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>

                <Link
                  to={`/admin/settings/vehicle-type/${id}/update`}
                  className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 ${
                    isDeleting ? "opacity-50 pointer-events-none" : ""
                  }`}
                >
                  <PencilSquareIcon className="w-4 h-4 mr-2" />
                  Edit Instead
                </Link>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting || confirmText !== vehicleType.name}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
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
                      Deleting...
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* System Information Card */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <InformationCircleIcon className="w-5 h-5 mr-2" />
              System Information
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="font-medium text-gray-500 mb-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Created At:
                </p>
                <p className="text-gray-900 ml-5">
                  {vehicleType.createdAt
                    ? new Date(vehicleType.createdAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1 flex items-center">
                  <UserIcon className="w-4 h-4 mr-1" />
                  Created By:
                </p>
                <p className="text-gray-900 ml-5">
                  {vehicleType.createdByUserName || "Not available"}
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-500 mb-1 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Last Modified:
                </p>
                <p className="text-gray-900 ml-5">
                  {vehicleType.modifiedAt
                    ? new Date(vehicleType.modifiedAt).toLocaleString()
                    : "Not available"}
                </p>
              </div>
              {vehicleType.modifiedByUserName && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    Modified By:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {vehicleType.modifiedByUserName}
                  </p>
                </div>
              )}
              {vehicleType.createdFromIpAddress && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-1" />
                    Created From IP:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {vehicleType.createdFromIpAddress}
                  </p>
                </div>
              )}
              {vehicleType.modifiedFromIpAddress && (
                <div>
                  <p className="font-medium text-gray-500 mb-1 flex items-center">
                    <GlobeAltIcon className="w-4 h-4 mr-1" />
                    Modified From IP:
                  </p>
                  <p className="text-gray-900 ml-5">
                    {vehicleType.modifiedFromIpAddress}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isDeleting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl border-2 border-red-500">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Deleting Vehicle Type...
                  </p>
                  <p className="text-sm text-gray-500">
                    Please wait while we remove this item from the system.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingVehicleTypeDeletePage;
