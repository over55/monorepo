// File Path: monorepo/web/workery-frontend/src/pages/Admin/Order/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArchiveBoxIcon,
  CalendarIcon,
  AcademicCapIcon,
  ChartPieIcon,
  BriefcaseIcon,
  ClipboardDocumentListIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  useAuthManager,
  useOrderManager,
  useSkillSetManager,
  useTagManager,
} from "../../../../services/Services";

function AdminOrderUpdatePage() {
  // Hooks
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const skillSetManager = useSkillSetManager();
  const tagManager = useTagManager();
  const navigate = useNavigate();
  const { oid } = useParams();

  // State
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [order, setOrder] = useState(null);

  // Form fields
  const [startDate, setStartDate] = useState("");
  const [isOngoing, setIsOngoing] = useState(0);
  const [isHomeSupportService, setIsHomeSupportService] = useState(0);
  const [description, setDescription] = useState("");
  const [skillSets, setSkillSets] = useState([]);
  const [tags, setTags] = useState([]);

  // Options for multi-selects
  const [skillSetOptions, setSkillSetOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrder = async () => {
    setFetching(true);
    setErrors({});

    try {
      const response = await orderManager.getOrderDetail(oid, onUnauthorized);

      console.log("Order details fetched:", response);
      setOrder(response);

      // Populate form fields with existing data
      setStartDate(response.startDate || "");
      setIsOngoing(response.isOngoing ? 1 : 2);
      setIsHomeSupportService(response.isHomeSupportService ? 1 : 2);
      setDescription(response.description || "");

      // Extract skill set IDs
      if (response.skillSets && Array.isArray(response.skillSets)) {
        const skillSetIds = response.skillSets.map((item) =>
          typeof item === "object" ? item.id : item,
        );
        setSkillSets(skillSetIds);
      }

      // Extract tag IDs
      if (response.tags && Array.isArray(response.tags)) {
        const tagIds = response.tags.map((item) =>
          typeof item === "object" ? item.id : item,
        );
        setTags(tagIds);
      }
    } catch (error) {
      console.error("Failed to fetch order:", error);
      setErrors(error);
      setAlert({
        type: "error",
        message: "Failed to load order details. Please try again.",
      });
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Fetch options for skill sets and tags
  const fetchOptions = async () => {
    try {
      // Fetch skill sets
      const skillSetsData =
        await skillSetManager.getSkillSetSelectOptions(onUnauthorized);
      if (skillSetsData) {
        setSkillSetOptions(skillSetsData);
      }

      // Fetch tags
      const tagsData = await tagManager.getTagSelectOptions(onUnauthorized);
      if (tagsData) {
        setTagOptions(tagsData);
      }
    } catch (error) {
      console.error("Failed to fetch options:", error);
    }
  };

  // Handle form submission
  const onSubmitClick = async (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    // Validate
    let newErrors = {};
    let hasErrors = false;

    if (!description || description.trim() === "") {
      newErrors["description"] = "Description is required";
      hasErrors = true;
    }

    if (skillSets.length === 0) {
      newErrors["skillSets"] = "Please select at least one skill set";
      hasErrors = true;
    }

    if (isOngoing === 0) {
      newErrors["isOngoing"] =
        "Please select if this job is one-time or ongoing";
      hasErrors = true;
    }

    if (isHomeSupportService === 0) {
      newErrors["isHomeSupportService"] =
        "Please select if this is a home support service";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Validation errors found");
      setErrors(newErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below before submitting.",
      });
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare payload
      const payload = {
        id: oid,
        isOngoing: isOngoing === 1,
        isHomeSupportService: isHomeSupportService === 1,
        startDate: startDate || null,
        description: description,
        skillSets: skillSets,
        tags: tags,
      };

      console.log("onSubmitClick: payload:", payload);

      // Update the order
      const response = await orderManager.updateOrder(
        oid,
        payload,
        onUnauthorized,
      );

      console.log("Order updated successfully:", response);

      // Show success message
      setAlert({
        type: "success",
        message: "Order updated successfully!",
      });

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/order/${oid}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update order:", error);
      setErrors(error);
      setAlert({
        type: "error",
        message: "Failed to update order. Please check the form and try again.",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle skill set checkbox changes
  const handleSkillSetChange = (skillSetId) => {
    if (skillSets.includes(skillSetId)) {
      setSkillSets(skillSets.filter((id) => id !== skillSetId));
    } else {
      setSkillSets([...skillSets, skillSetId]);
    }
    // Clear error when user makes a change
    if (errors.skillSets) {
      setErrors((prev) => ({ ...prev, skillSets: undefined }));
    }
  };

  // Handle tag checkbox changes
  const handleTagChange = (tagId) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter((id) => id !== tagId));
    } else {
      setTags([...tags, tagId]);
    }
  };

  // Initialize component
  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchOrder();
      fetchOptions();
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  // Render loading state
  if (isFetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading order details...</p>
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
                  <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
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
                  <InformationCircleIcon className="w-4 h-4 mr-2" />#{oid}
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Update
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
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Order
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Update order information
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : alert.type === "info"
                ? "bg-blue-50 border border-blue-200 text-blue-700"
                : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {alert.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : alert.type === "info" ? (
                <InformationCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2" />
              )}
              <span>{alert.message}</span>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Archived banner */}
      {order && order.status === 2 && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
          <div className="flex items-center">
            <ArchiveBoxIcon className="w-5 h-5 mr-2" />
            <span>This order is archived</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <PencilSquareIcon className="w-7 h-7 mr-2 text-blue-600" />
              Update Order #{oid}
            </h2>
            <Link to={`/admin/order/${oid}`}>
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Detail
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/order/${oid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/order/${oid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/order/${oid}/tasks`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Tasks
            </Link>
            <Link
              to={`/admin/order/${oid}/activity`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Activity
            </Link>
            <Link
              to={`/admin/order/${oid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/order/${oid}/attachments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Attachments
            </Link>
            <Link
              to={`/admin/order/${oid}/more`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
            >
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </Link>
          </nav>
        </div>

        {order && (
          <form onSubmit={onSubmitClick} className="p-6">
            {/* General Information Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
                  General Information
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is this job one time or ongoing?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isOngoing"
                          value="2"
                          checked={isOngoing === 2}
                          onChange={(e) => {
                            setIsOngoing(parseInt(e.target.value));
                            if (errors.isOngoing) {
                              setErrors((prev) => ({
                                ...prev,
                                isOngoing: undefined,
                              }));
                            }
                          }}
                          disabled={order.status === 2 || isSubmitting}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">One-Time</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isOngoing"
                          value="1"
                          checked={isOngoing === 1}
                          onChange={(e) => {
                            setIsOngoing(parseInt(e.target.value));
                            if (errors.isOngoing) {
                              setErrors((prev) => ({
                                ...prev,
                                isOngoing: undefined,
                              }));
                            }
                          }}
                          disabled={order.status === 2 || isSubmitting}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Ongoing</span>
                      </label>
                    </div>
                    {errors.isOngoing && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.isOngoing}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Is this job a home support service?{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isHomeSupportService"
                          value="2"
                          checked={isHomeSupportService === 2}
                          onChange={(e) => {
                            setIsHomeSupportService(parseInt(e.target.value));
                            if (errors.isHomeSupportService) {
                              setErrors((prev) => ({
                                ...prev,
                                isHomeSupportService: undefined,
                              }));
                            }
                          }}
                          disabled={order.status === 2 || isSubmitting}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">No</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="isHomeSupportService"
                          value="1"
                          checked={isHomeSupportService === 1}
                          onChange={(e) => {
                            setIsHomeSupportService(parseInt(e.target.value));
                            if (errors.isHomeSupportService) {
                              setErrors((prev) => ({
                                ...prev,
                                isHomeSupportService: undefined,
                              }));
                            }
                          }}
                          disabled={order.status === 2 || isSubmitting}
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Yes</span>
                      </label>
                    </div>
                    {errors.isHomeSupportService && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.isHomeSupportService}
                      </p>
                    )}
                  </div>

                  <div className="max-w-md">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      When should this job start? (Optional)
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={order.status === 2 || isSubmitting}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.startDate ? "border-red-300" : "border-gray-300"
                      }`}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Leave blank if nothing was specified by client.
                    </p>
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.startDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Skill Sets Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Skill Sets & Description
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe the Job <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      placeholder="Describe the work that needs to be done..."
                      value={description}
                      onChange={(e) => {
                        setDescription(e.target.value);
                        if (errors.description) {
                          setErrors((prev) => ({
                            ...prev,
                            description: undefined,
                          }));
                        }
                      }}
                      rows={4}
                      maxLength={1000}
                      disabled={order.status === 2 || isSubmitting}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      {description.length}/1000 characters
                    </p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Please select required job skill(s){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border rounded-lg p-4 max-h-60 overflow-y-auto ${
                        errors.skillSets ? "border-red-300" : "border-gray-300"
                      }`}
                    >
                      {skillSetOptions.length > 0 ? (
                        <div className="space-y-2">
                          {skillSetOptions.map((option) => (
                            <label
                              key={option.value}
                              className="flex items-center"
                            >
                              <input
                                type="checkbox"
                                value={option.value}
                                checked={skillSets.includes(option.value)}
                                onChange={() =>
                                  handleSkillSetChange(option.value)
                                }
                                disabled={order.status === 2 || isSubmitting}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                              />
                              <span className="text-sm text-gray-700">
                                {option.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Loading skill sets...</p>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      Pick at least a single skill set at minimum.
                    </p>
                    {errors.skillSets && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.skillSets}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ChartPieIcon className="w-5 h-5 mr-2 text-blue-600" />
                  Metrics
                </h3>
              </div>
              <div className="p-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {tagOptions.length > 0 ? (
                      <div className="space-y-2">
                        {tagOptions.map((option) => (
                          <label
                            key={option.value}
                            className="flex items-center"
                          >
                            <input
                              type="checkbox"
                              value={option.value}
                              checked={tags.includes(option.value)}
                              onChange={() => handleTagChange(option.value)}
                              disabled={order.status === 2 || isSubmitting}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-2"
                            />
                            <span className="text-sm text-gray-700">
                              {option.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">Loading tags...</p>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Pick the tags you would like to associate with this order.
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <Link to={`/admin/order/${oid}`}>
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeftIcon className="w-5 h-5 mr-2" />
                  Back to Detail
                </button>
              </Link>

              <button
                type="submit"
                disabled={order.status === 2 || isSubmitting}
                className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                  order.status === 2 || isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AdminOrderUpdatePage;
