// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step4Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep4Page

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
  useOrderManager,
} from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import { convertLocalDateToISO } from "../../../../constants/Date";
import {
  PlusCircleIcon,
  CheckCircleIcon,
  UserIcon,
  ClipboardDocumentIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  HomeIcon,
  AcademicCapIcon,
  TagIcon,
  ChatBubbleBottomCenterTextIcon,
} from "@heroicons/react/24/outline";
import {
  TagsDisplay,
  SkillSetsDisplay,
} from "../../../../components/business/displays";
import { formatDateForDisplay } from "../../../../services/Helpers/DateFormatter";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Details" },
  { title: "Skills" },
  { title: "Review" },
];

// Memoized DataField helper component
const DataField = memo(({ label, value, icon: Icon, error }) => (
  <div>
    <span className="text-lg sm:text-xl font-medium text-gray-500 flex items-center">
      {Icon && <Icon className="w-6 h-6 mr-2 text-gray-400" />}
      {label}
    </span>
    <p className="text-xl sm:text-2xl text-gray-900 mt-1.5">{value || "—"}</p>
    {error && <p className="mt-2 text-base sm:text-lg text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
  </div>
));

DataField.displayName = 'DataField';

// Memoized content component
const Step4Content = memo(function Step4Content() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const orderManager = useOrderManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Get existing order state
  const orderData = orderCreationStorage.getOrderCreation();

  // Check authentication and order state
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    if (isSubmitted) {
      return;
    }

    if (!orderData || !orderData.customerId) {
      navigate("/admin/orders/add/step-1-search");
      return;
    }

    window.scrollTo(0, 0);
  }, [authManager, navigate, orderData, isSubmitted]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const payload = {
        customerId: orderData.customerId,
        description: orderData.description,
        skillSets: orderData.skillSets,
        isOngoing: orderData.isOngoing,
        isHomeSupportService: orderData.isHomeSupportService,
        startDate: orderData.startDate ? convertLocalDateToISO(orderData.startDate) : null,
        additionalComment: orderData.additionalComment,
        tags: orderData.tags,
      };

      const response = await orderManager.createOrder(payload, () => {
        navigate("/login?unauthorized=true");
      });

      setIsSubmitted(true);
      orderCreationStorage.clearOrderCreation();

      navigate(`/admin/order/${response.wjid || response.id}`, {
        state: { successMessage: "Order created successfully!" },
      });
    } catch (error) {
      console.error("Failed to create order:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsLoading(false);
    }
  }, [orderData, orderManager, orderCreationStorage, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    orderCreationStorage.clearOrderCreation();
    navigate("/admin/orders");
  }, [orderCreationStorage, navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/orders/add/step-3");
  }, [navigate]);

  // Action buttons
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "outline",
      onClick: handleCancel,
    },
    {
      label: isLoading ? "Submitting..." : "Submit Order",
      variant: "primary",
      onClick: handleSubmit,
      disabled: isLoading,
      loading: isLoading,
    },
  ], [handleCancel, handleSubmit, isLoading]);

  if (!orderData) {
    return (
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={4}
        wizardTitle="New Order"
        wizardIcon={PlusCircleIcon}
        stepTitle="Review & Submit"
        stepSubtitle="Loading..."
        stepIcon={CheckCircleIcon}
        isLoading={true}
      />
    );
  }

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={4}
        wizardTitle="New Order"
        wizardIcon={PlusCircleIcon}
        stepTitle="Review & Submit"
        stepSubtitle="Please review the order details before submitting"
        stepIcon={CheckCircleIcon}
        showFormCard={false}
        contentMaxWidth="7xl"
        errors={errors}
        isLoading={isLoading}
        actions={actions}
        onCancel={handleCancel}
        onBack={handleBack}
        actionLayout="end"
      >
        <div className="space-y-8">
          {/* Customer Information Section */}
          <FormCard
            title="Customer Information"
            subtitle="Selected customer for this order"
            icon={UserIcon}
            maxWidth="7xl"
            headerAction={
              <Link
                to="/admin/orders/add/step-1-search"
                className="inline-flex items-center text-base sm:text-lg text-blue-300 hover:text-white transition-colors"
              >
                <PencilSquareIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                Edit
              </Link>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <span className="text-lg sm:text-xl font-medium text-gray-500">Customer:</span>
                <p className="text-xl sm:text-2xl text-gray-900 mt-1.5">
                  <Link
                    to={`/admin/customer/${orderData.customerId}`}
                    target="_blank"
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {orderData.customerFirstName} {orderData.customerLastName}
                  </Link>
                </p>
              </div>
            </div>
          </FormCard>

          {/* Order Details Section */}
          <FormCard
            title="Order Details"
            subtitle="Job type and scheduling information"
            icon={ClipboardDocumentIcon}
            maxWidth="7xl"
            headerAction={
              <Link
                to="/admin/orders/add/step-2"
                className="inline-flex items-center text-base sm:text-lg text-blue-300 hover:text-white transition-colors"
              >
                <PencilSquareIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                Edit
              </Link>
            }
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <DataField
                  label="Start Date"
                  value={formatDateForDisplay(orderData.startDate)}
                  icon={CalendarIcon}
                />
                <div>
                  <span className="text-lg sm:text-xl font-medium text-gray-500">Is Ongoing:</span>
                  <p className="text-xl mt-1.5">
                    {orderData.isOngoing === 1 ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-base sm:text-lg font-medium bg-green-100 text-green-800">
                        <CheckIcon className="w-5 h-5 mr-2" />
                        Yes - Ongoing
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-base sm:text-lg font-medium bg-gray-100 text-gray-800">
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        No - One Time
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-lg sm:text-xl font-medium text-gray-500">Home Support Service:</span>
                  <p className="text-xl mt-1.5">
                    {orderData.isHomeSupportService === 1 ? (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-base sm:text-lg font-medium bg-green-100 text-green-800">
                        <HomeIcon className="w-5 h-5 mr-2" />
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-4 py-2 rounded-full text-base sm:text-lg font-medium bg-gray-100 text-gray-800">
                        <XMarkIcon className="w-5 h-5 mr-2" />
                        No
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </FormCard>

          {/* Job Description Section */}
          <FormCard
            title="Job Description"
            subtitle="Work requirements and details"
            icon={ClipboardDocumentIcon}
            maxWidth="7xl"
            headerAction={
              <Link
                to="/admin/orders/add/step-3"
                className="inline-flex items-center text-base sm:text-lg text-blue-300 hover:text-white transition-colors"
              >
                <PencilSquareIcon className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
                Edit
              </Link>
            }
          >
            <div className="space-y-6">
              {orderData.description && (
                <div>
                  <span className="text-lg sm:text-xl font-medium text-gray-500 flex items-center mb-3">
                    Description:
                  </span>
                  <div className="text-lg sm:text-xl text-gray-900 bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <p className="whitespace-pre-wrap">{orderData.description}</p>
                  </div>
                </div>
              )}

              {orderData.skillSets && orderData.skillSets.length > 0 && (
                <div>
                  <span className="text-lg sm:text-xl font-medium text-gray-500 flex items-center mb-3">
                    <AcademicCapIcon className="w-6 h-6 mr-2" />
                    Required Skills:
                  </span>
                  <SkillSetsDisplay
                    values={orderData.skillSets}
                    label=""
                    variant="primary"
                    onUnauthorized={() => navigate("/login?unauthorized=true")}
                  />
                </div>
              )}

              {orderData.tags && orderData.tags.length > 0 && (
                <div>
                  <span className="text-lg sm:text-xl font-medium text-gray-500 flex items-center mb-3">
                    <TagIcon className="w-6 h-6 mr-2" />
                    Tags:
                  </span>
                  <TagsDisplay
                    values={orderData.tags}
                    label=""
                    variant="success"
                    onUnauthorized={() => navigate("/login?unauthorized=true")}
                  />
                </div>
              )}

              {orderData.additionalComment && (
                <div>
                  <span className="text-lg sm:text-xl font-medium text-gray-500 flex items-center mb-3">
                    <ChatBubbleBottomCenterTextIcon className="w-6 h-6 mr-2" />
                    Additional Comments:
                  </span>
                  <div className="text-lg sm:text-xl text-gray-900 bg-amber-50 p-5 rounded-xl border border-amber-200">
                    <p className="whitespace-pre-wrap">{orderData.additionalComment}</p>
                  </div>
                </div>
              )}
            </div>
          </FormCard>
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="px-6 sm:px-8 py-5 border-b border-gray-200">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <div className="px-6 sm:px-8 py-5">
              <p className="text-base sm:text-lg text-gray-600">
                Your Order record will be cancelled and your work will be lost. This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-6 sm:px-8 py-5 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-4 rounded-b-xl">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-6 py-3 text-base sm:text-lg font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

Step4Content.displayName = 'Step4Content';

function AdminOrderAddStep4Page() {
  return (
    <UIXThemeProvider>
      <Step4Content />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep4Page;
