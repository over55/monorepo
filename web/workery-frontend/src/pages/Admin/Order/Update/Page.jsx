// File Path: monorepo/web/workery-frontend/src/pages/Admin/Order/Update/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Spinner, Breadcrumb, Tabs, Button)

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  Card,
  Alert,
  Spinner,
  Breadcrumb,
  Tabs,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
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
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  useAuthManager,
  useOrderManager,
  useSkillSetManager,
  useTagManager,
} from "../../../../services/Services";

// Section Component with Dark Header - Matching Customer Update style
const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminOrderUpdatePage() {
  // Hooks
  const authManager = useAuthManager();
  const orderManager = useOrderManager();
  const skillSetManager = useSkillSetManager();
  const tagManager = useTagManager();
  const navigate = useNavigate();
  const { oid } = useParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
    { label: `#${oid}`, to: `/admin/order/${oid}`, icon: InformationCircleIcon },
    { label: "Update", icon: PencilSquareIcon, isActive: true },
  ], [oid]);

  // Tab items
  const tabItems = useMemo(() => [
    { label: "Summary", to: `/admin/order/${oid}` },
    { label: "Detail", to: `/admin/order/${oid}/detail` },
    { label: "Tasks", to: `/admin/order/${oid}/tasks` },
    { label: "Activity", to: `/admin/order/${oid}/activity` },
    { label: "Comments", to: `/admin/order/${oid}/comments` },
    { label: "Attachments", to: `/admin/order/${oid}/attachments` },
    { label: "More", to: `/admin/order/${oid}/more`, icon: EllipsisHorizontalIcon },
  ], [oid]);

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

  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading order details...
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Responsive Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-4 sm:mb-6" />

      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
              <WrenchScrewdriverIcon className={`w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 ${themeClasses.linkPrimary} flex-shrink-0`} />
              Order
            </h1>
            <p className={`mt-1 text-xs sm:text-sm ${themeClasses.textSecondary} flex items-center`}>
              <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              Update order information
            </p>
          </div>
        </div>
      </div>

      {/* Status Alerts - Responsive */}
      {order && order.status === 2 && (
        <Alert type="warning" className="mb-4" icon={ArchiveBoxIcon}>
          This order is archived
        </Alert>
      )}

      {/* Alert Messages - Responsive */}
      {alert && (
        <Alert
          type={alert.type}
          className="mb-4"
          dismissible
          onDismiss={() => setAlert(null)}
        >
          {alert.message}
        </Alert>
      )}

      {/* Main Content */}
      <Card>
        {/* Header with Actions - Responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h2 className={`text-xl sm:text-2xl font-semibold ${themeClasses.textPrimary} flex items-center`}>
              <PencilSquareIcon className={`w-5 sm:w-7 h-5 sm:h-7 mr-2 ${themeClasses.linkPrimary} flex-shrink-0`} />
              Update Order #{oid}
            </h2>
            <Link to={`/admin/order/${oid}`} className="flex-shrink-0">
              <Button variant="outline">
                <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                Back to Detail
              </Button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation - Responsive with horizontal scroll */}
        <Tabs items={tabItems} className="px-4 sm:px-6" />

        {order && (
          <form onSubmit={onSubmitClick} className="p-4 sm:p-6">
            {/* General Information Section with Dark Header */}
            <FormSection title="General Information" icon={BriefcaseIcon}>
              <div className="space-y-4 sm:space-y-6">
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
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Leave blank if nothing was specified by client.
                  </p>
                  {errors.startDate && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.startDate}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Skill Sets & Description Section with Dark Header */}
            <FormSection
              title="Skill Sets & Description"
              icon={AcademicCapIcon}
            >
              <div className="space-y-4 sm:space-y-6">
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
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base ${
                      errors.description ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
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
                    className={`border rounded-lg p-3 sm:p-4 max-h-60 overflow-y-auto ${
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
                      <p className="text-gray-500 text-sm">
                        Loading skill sets...
                      </p>
                    )}
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">
                    Pick at least a single skill set at minimum.
                  </p>
                  {errors.skillSets && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.skillSets}
                    </p>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Metrics Section with Dark Header */}
            <FormSection title="Metrics" icon={ChartPieIcon}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (Optional)
                </label>
                <div className="border border-gray-300 rounded-lg p-3 sm:p-4 max-h-60 overflow-y-auto">
                  {tagOptions.length > 0 ? (
                    <div className="space-y-2">
                      {tagOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
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
                    <p className="text-gray-500 text-sm">Loading tags...</p>
                  )}
                </div>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Pick the tags you would like to associate with this order.
                </p>
              </div>
            </FormSection>

            {/* Form Actions - Responsive */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
              <Link to={`/admin/order/${oid}`} className="order-2 sm:order-1">
                <Button variant="outline" type="button">
                  <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                  Back to Detail
                </Button>
              </Link>

              <Button
                variant="success"
                type="submit"
                disabled={order.status === 2 || isSubmitting}
                loading={isSubmitting}
              >
                <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

// Wrapper with UIXThemeProvider
function AdminOrderUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminOrderUpdatePage />
    </UIXThemeProvider>
  );
}

export default AdminOrderUpdatePageWithProvider;
