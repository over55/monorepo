// File Path: web/workery-frontend/src/pages/Admin/Setting/InactiveClient/Update/Page.jsx

import React, { useState, useEffect } from "react";
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
  CheckCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
  HomeIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  UNASSIGNED_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CUSTOMER_STATUS_ACTIVE,
  CUSTOMER_STATUS_INACTIVE,
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
  const [successMessage, setSuccessMessage] = useState("");
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    organizationName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
    description: "",
    deactivationReason: "",
    deactivationReasonOther: "",
  });

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch client details
  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await customerManager.getCustomerDetail(
        id,
        onUnauthorized,
      );

      if (response) {
        setClient(response);
        // Populate form data
        setFormData({
          firstName: response.firstName || "",
          lastName: response.lastName || "",
          email: response.email || "",
          phone: response.phone || "",
          organizationName: response.organizationName || "",
          addressLine1: response.addressLine1 || "",
          addressLine2: response.addressLine2 || "",
          city: response.city || "",
          region: response.region || "",
          postalCode: response.postalCode || "",
          country: response.country || "",
          description: response.description || "",
          deactivationReason: response.deactivationReason || "",
          deactivationReasonOther: response.deactivationReasonOther || "",
        });
      }
    } catch (err) {
      console.error("Failed to fetch client details:", err);
      setError("Failed to load client details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle save changes
  const handleSaveChanges = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setError(null);

      const updateData = {
        ...client,
        ...formData,
      };

      await customerManager.updateCustomer(id, updateData, onUnauthorized);

      setSuccessMessage("Client information updated successfully");
      setTimeout(() => setSuccessMessage(""), 3000);

      // Refresh client data
      await fetchClientDetails();
    } catch (err) {
      console.error("Failed to update client:", err);
      setError("Failed to update client information. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // Handle restore client
  const handleRestoreClient = async () => {
    try {
      setSaving(true);
      setError(null);

      // Update the client to set status back to active (1)
      const updateData = {
        ...client,
        ...formData,
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
  }, [id]);

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
                  Edit Client
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <ArchiveBoxIcon className="w-8 h-8 mr-3 text-gray-600" />
              Edit Inactive Client
            </h1>
            <p className="mt-2 text-gray-600">
              Update client information or restore to active status
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

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {successMessage}
            </span>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-green-600 hover:text-green-800"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

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

        {/* Status Card */}
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start">
            <InformationCircleIcon className="w-5 h-5 text-amber-600 mt-0.5 mr-3" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-amber-800">
                Client Status: Inactive/Archived
              </h3>
              <p className="mt-1 text-sm text-amber-700">
                <strong>Deactivation Reason:</strong>{" "}
                {getDeactivationReasonText(
                  client.deactivationReason,
                  client.deactivationReasonOther,
                )}
              </p>
              <p className="mt-2 text-xs text-amber-600">
                You can restore this client to active status using the "Restore
                to Active" button below.
              </p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSaveChanges}>
          <div className="bg-white shadow-sm rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                Client Information
              </h2>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Client Type Badge */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Type
                </label>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(client.type)}`}
                >
                  {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                    <BuildingOffice2Icon className="w-4 h-4 mr-1" />
                  )}
                  {client.type === RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                    <HomeIcon className="w-4 h-4 mr-1" />
                  )}
                  {getCustomerTypeDisplay(client.type)}
                </span>
              </div>

              {/* Organization Name (for commercial clients) */}
              {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                <div>
                  <label
                    htmlFor="organizationName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Organization Name
                  </label>
                  <input
                    type="text"
                    id="organizationName"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Address</h3>

                <div>
                  <label
                    htmlFor="addressLine1"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="addressLine2"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="region"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Province/State
                    </label>
                    <input
                      type="text"
                      id="region"
                      name="region"
                      value={formData.region}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="postalCode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Postal Code
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Notes/Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Notes/Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Deactivation Reason (Read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deactivation Reason
                </label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700">
                    {getDeactivationReasonText(
                      client.deactivationReason,
                      client.deactivationReasonOther,
                    )}
                  </p>
                  {client.deactivationReasonOther &&
                    client.deactivationReason === 1 && (
                      <p className="mt-1 text-xs text-gray-600">
                        Details: {client.deactivationReasonOther}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/admin/settings/inactive-clients")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowRestoreModal(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                <ArrowPathIcon className="w-4 h-4 mr-2" />
                Restore to Active
              </button>
            </div>
          </div>
        </form>

        {/* Additional Actions Card */}
        <div className="mt-6 bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Additional Actions
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
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

        {/* Restore Confirmation Modal */}
        {showRestoreModal && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ArrowPathIcon className="w-5 h-5 mr-2 text-green-600" />
                  Restore Client to Active Status
                </h3>
              </div>

              <div className="px-6 py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to restore this client to active status?
                  They will be removed from the inactive list and appear in the
                  active clients list.
                </p>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    <strong>Name:</strong>{" "}
                    {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID
                      ? client.organizationName ||
                        `${formData.firstName} ${formData.lastName}`
                      : `${formData.firstName} ${formData.lastName}`}
                  </p>
                  {formData.email && (
                    <p className="text-sm text-gray-600 mt-1">
                      <strong>Email:</strong> {formData.email}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Type:</strong> {getCustomerTypeDisplay(client.type)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Current Status:</strong> Inactive/Archived
                  </p>
                </div>

                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800 flex items-start">
                    <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>
                      <strong>Note:</strong> Any unsaved changes will be saved
                      along with the status change. The client will be able to
                      place orders and interact with the system normally once
                      restored.
                    </span>
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
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
                      Confirm Restore
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SettingInactiveClientUpdatePage;
