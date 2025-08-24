// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  SkillSetsMultiSelect,
  TagsMultiSelect,
} from "../../../../components/business/selects";
import {
  ClipboardDocumentListIcon,
  ChevronRightIcon,
  XMarkIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  WrenchIcon,
  ExclamationCircleIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";

function AdminOrderAddStep3Page() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state
  const existingOrder = orderCreationStorage.getOrderCreation();

  // Form fields
  const [description, setDescription] = useState(
    existingOrder?.description || "",
  );
  const [skillSets, setSkillSets] = useState(existingOrder?.skillSets || []);
  const [additionalComment, setAdditionalComment] = useState(
    existingOrder?.additionalComment || "",
  );
  const [tags, setTags] = useState(existingOrder?.tags || []);

  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Check if we have order state
    if (!existingOrder || !existingOrder.customerId) {
      // No customer selected, redirect to step 1
      navigate("/admin/orders/add/step-1-search");
      return;
    }

    window.scrollTo(0, 0);
  }, [authManager, navigate, existingOrder]);

  const onSubmitClick = (e) => {
    e.preventDefault();
    setErrors({});

    let newErrors = {};
    let hasErrors = false;

    if (!description || description.trim() === "") {
      newErrors["description"] = "Description is required";
      hasErrors = true;
    }

    if (!skillSets || skillSets.length === 0) {
      newErrors["skillSets"] = "Please select at least one skill set";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Update order state
    const updatedOrder = {
      ...existingOrder,
      description: description,
      skillSets: skillSets,
      additionalComment: additionalComment,
      tags: tags,
    };

    orderCreationStorage.saveOrderCreation(updatedOrder);
    navigate("/admin/orders/add/step-4");
  };

  const handleSkillSetsChange = (value) => {
    setSkillSets(value);
    // Clear error when user selects skill sets
    if (errors.skillSets && value.length > 0) {
      setErrors((prev) => ({ ...prev, skillSets: undefined }));
    }
  };

  const handleTagsChange = (value) => {
    setTags(value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    // Clear error when user starts typing
    if (errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
  };

  const handleCancelClick = () => {
    setShowCancelWarning(true);
  };

  const handleConfirmCancel = () => {
    orderCreationStorage.clearOrderCreation();
    navigate("/admin/orders");
  };

  if (!existingOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

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
                <span className="sm:hidden">Home</span>
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
                    <WrenchIcon className="w-4 h-4 mr-2" />
                    Orders
                  </span>
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 inline-flex items-center">
                  <ClipboardDocumentListIcon className="w-4 h-4 mr-2" />
                  Add
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
            <ClipboardDocumentListIcon className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-blue-600" />
            Add New Order
          </h1>
        </div>

        {/* Wizard Steps - Responsive Version */}
        <div className="mb-6">
          <div className="flex items-center justify-center">
            {/* Mobile/Tablet View */}
            <div className="lg:hidden w-full overflow-x-auto pb-2">
              <div className="flex items-center min-w-max px-2">
                {/* Step 1 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Customer
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Selected
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-green-600"></div>

                {/* Step 2 - Complete */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-green-600 rounded-full flex-shrink-0">
                    <CheckIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Type
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Complete
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 3 - Active */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex-shrink-0">
                    <span className="text-white font-semibold text-sm">3</span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-900">
                      Skills
                    </p>
                    <p className="text-xs text-gray-500 hidden sm:block">
                      Description
                    </p>
                  </div>
                </div>

                {/* Connector */}
                <div className="mx-1 sm:mx-2 w-8 sm:w-12 h-0.5 bg-gray-300"></div>

                {/* Step 4 - Inactive */}
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex-shrink-0">
                    <span className="text-gray-600 font-semibold text-sm">
                      4
                    </span>
                  </div>
                  <div className="ml-2 sm:ml-3">
                    <p className="text-xs sm:text-sm font-medium text-gray-500">
                      Review
                    </p>
                    <p className="text-xs text-gray-400 hidden sm:block">
                      Submit
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop View */}
            <div className="hidden lg:flex items-center">
              {/* Step 1 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Customer</p>
                  <p className="text-xs text-gray-500">Selected</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-green-600"></div>

              {/* Step 2 - Complete */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full">
                  <CheckIcon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">Type</p>
                  <p className="text-xs text-gray-500">Complete</p>
                </div>
              </div>

              {/* Connector */}
              <div className="mx-2 w-12 h-0.5 bg-gray-300"></div>

              {/* Step 3 - Active */}
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    Skills & Description
                  </p>
                  <p className="text-xs text-gray-500">Job Details</p>
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
                  <p className="text-sm font-medium text-gray-500">Review</p>
                  <p className="text-xs text-gray-400">Submit</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Warning Modal */}
        {showCancelWarning && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                  <ExclamationCircleIcon className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-2">
                  Are you sure?
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Your Order record will be cancelled and your work will be
                    lost. This cannot be undone. Do you want to continue?
                  </p>
                </div>
                <div className="flex justify-center gap-4 mt-4">
                  <button
                    onClick={() => setShowCancelWarning(false)}
                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    No, Keep Working
                  </button>
                  <button
                    onClick={handleConfirmCancel}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Yes, Cancel Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.message && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center justify-between">
            <span className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{errors.message}</span>
            </span>
            <button
              onClick={() => setErrors({})}
              className="text-red-600 hover:text-red-800 ml-2"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center">
              <DocumentTextIcon className="w-5 h-5 mr-2" />
              Skills and Description
            </h2>
          </div>

          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Submitting...</span>
              </div>
            ) : (
              <form onSubmit={onSubmitClick} className="max-w-4xl mx-auto">
                <div className="space-y-6">
                  {/* Job Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Describe the Job <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={description}
                        onChange={handleDescriptionChange}
                        placeholder="Describe the work that needs to be done..."
                        rows={4}
                        maxLength={1000}
                        className={`w-full px-3 py-2 border ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none`}
                      />
                    </div>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Please provide a clear description of the work required
                    </p>
                  </div>

                  {/* Skills Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center mb-4">
                      <AcademicCapIcon className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-900">
                        Required Skills
                      </h3>
                    </div>

                    <SkillSetsMultiSelect
                      value={skillSets}
                      onChange={handleSkillSetsChange}
                      error={errors.skillSets}
                      required={true}
                      label="Required Job Skills"
                      placeholder="Select required skill sets..."
                      helperText="Pick at least one skill set that is required for this job"
                      onUnauthorized={() =>
                        navigate("/login?unauthorized=true")
                      }
                    />
                  </div>

                  {/* Metrics Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center mb-4">
                      <TagIcon className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-900">
                        Metrics
                      </h3>
                    </div>

                    <TagsMultiSelect
                      value={tags}
                      onChange={handleTagsChange}
                      error={errors.tags}
                      required={false}
                      label="Tags (Optional)"
                      placeholder="Select tags..."
                      helperText="Pick any tags you would like to associate with this order"
                      onUnauthorized={() =>
                        navigate("/login?unauthorized=true")
                      }
                    />
                  </div>

                  {/* Comments Section */}
                  <div className="border-t pt-6">
                    <div className="flex items-center mb-4">
                      <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2 text-blue-600" />
                      <h3 className="text-base font-semibold text-gray-900">
                        Comments
                      </h3>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Comments (Optional)
                      </label>
                      <textarea
                        value={additionalComment}
                        onChange={(e) => setAdditionalComment(e.target.value)}
                        placeholder="Any additional comments or special instructions..."
                        rows={4}
                        maxLength={1000}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Add any additional information that might be helpful
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-6 border-t">
                  <Link
                    to="/admin/orders/add/step-2"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back
                  </Link>
                  <button
                    type="button"
                    onClick={handleCancelClick}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50"
                  >
                    <XMarkIcon className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Next
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderAddStep3Page;
