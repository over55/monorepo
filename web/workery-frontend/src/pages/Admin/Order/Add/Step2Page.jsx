// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step2Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep2Page

import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import { useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  DatePicker,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  PlusCircleIcon,
  ClockIcon,
  HomeModernIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Details" },
  { title: "Skills" },
  { title: "Review" },
];

// Memoized content component
const Step2Content = memo(function Step2Content() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Get existing order state - use ref to avoid re-fetching on every render
  const existingOrderRef = useRef(orderCreationStorage.getOrderCreation());
  const existingOrder = existingOrderRef.current;

  // Form fields
  const [startDate, setStartDate] = useState(existingOrder?.startDate || "");
  const [isOngoing, setIsOngoing] = useState(existingOrder?.isOngoing || 0);
  const [isHomeSupportService, setIsHomeSupportService] = useState(
    existingOrder?.isHomeSupportService || 0
  );

  // Check authentication and order state - only on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    if (!existingOrder || !existingOrder.customerId) {
      navigate("/admin/orders/add/step-1-search");
      return;
    }

    window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Handle form submission
  const handleNext = useCallback(() => {
    let newErrors = {};
    let hasErrors = false;

    if (isOngoing === 0) {
      newErrors.isOngoing = "Please select if this job is one-time or ongoing";
      hasErrors = true;
    }

    if (isHomeSupportService === 0) {
      newErrors.isHomeSupportService = "Please select if this is a home support service";
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
      startDate: startDate,
      isOngoing: isOngoing,
      isHomeSupportService: isHomeSupportService,
    };

    orderCreationStorage.saveOrderCreation(updatedOrder);
    navigate("/admin/orders/add/step-3");
  }, [isOngoing, isHomeSupportService, existingOrder, startDate, orderCreationStorage, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    orderCreationStorage.clearOrderCreation();
    navigate("/admin/orders/add/step-1-search");
  }, [orderCreationStorage, navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/orders/add/step-1-search");
  }, [navigate]);

  // Handle date change - use functional update to avoid dependency on errors
  const handleStartDateChange = useCallback((value) => {
    setStartDate(value);
    setErrors((prev) => {
      if (prev.startDate) {
        const newErrors = { ...prev };
        delete newErrors.startDate;
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Handle ongoing change - use functional update to avoid dependency on errors
  const handleOngoingChange = useCallback((value) => {
    setIsOngoing(value);
    setErrors((prev) => {
      if (prev.isOngoing) {
        const newErrors = { ...prev };
        delete newErrors.isOngoing;
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Handle home support service change - use functional update to avoid dependency on errors
  const handleHomeSupportChange = useCallback((value) => {
    setIsHomeSupportService(value);
    setErrors((prev) => {
      if (prev.isHomeSupportService) {
        const newErrors = { ...prev };
        delete newErrors.isHomeSupportService;
        return newErrors;
      }
      return prev;
    });
  }, []);

  // Action buttons
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "outline",
      onClick: handleCancel,
    },
    {
      label: isLoading ? "Saving..." : "Continue",
      variant: "primary",
      onClick: handleNext,
      disabled: isLoading,
      loading: isLoading,
    },
  ], [handleCancel, handleNext, isLoading]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={2}
        wizardTitle="New Order"
        wizardIcon={PlusCircleIcon}
        stepTitle="Job Type Configuration"
        stepSubtitle="Please fill out all the required fields before submitting this form"
        stepIcon={ClockIcon}
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
          {/* Job Duration Section */}
          <FormCard
            title="Job Duration"
            subtitle="Specify if this is a one-time job or ongoing service"
            icon={ClockIcon}
            maxWidth="7xl"
          >
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                Is this job one time or ongoing?
                <span className="text-red-500 ml-1">*</span>
              </label>
              {errors.isOngoing && (
                <p className="text-red-600 text-base sm:text-lg mb-4">{errors.isOngoing}</p>
              )}
              <div className="space-y-4">
                <label className={`flex items-center p-5 sm:p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all ${isOngoing === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="isOngoing"
                    value="2"
                    checked={isOngoing === 2}
                    onChange={() => handleOngoingChange(2)}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-5">
                    <span className="block text-lg sm:text-xl font-medium text-gray-900">
                      One-Time Job
                    </span>
                    <span className="block text-base sm:text-lg text-gray-500 mt-1">
                      Single service visit with defined completion
                    </span>
                  </div>
                </label>
                <label className={`flex items-center p-5 sm:p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all ${isOngoing === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="isOngoing"
                    value="1"
                    checked={isOngoing === 1}
                    onChange={() => handleOngoingChange(1)}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-5">
                    <span className="block text-lg sm:text-xl font-medium text-gray-900">
                      Ongoing Service
                    </span>
                    <span className="block text-base sm:text-lg text-gray-500 mt-1">
                      Recurring or continuous service arrangement
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </FormCard>

          {/* Home Support Service Section */}
          <FormCard
            title="Service Category"
            subtitle="Identify if this qualifies as a home support service"
            icon={HomeModernIcon}
            maxWidth="7xl"
          >
            <div>
              <label className="block text-xl font-semibold text-gray-700 mb-4">
                Is this job a home support service?
                <span className="text-red-500 ml-1">*</span>
              </label>
              {errors.isHomeSupportService && (
                <p className="text-red-600 text-base sm:text-lg mb-4">{errors.isHomeSupportService}</p>
              )}
              <div className="space-y-4">
                <label className={`flex items-center p-5 sm:p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all ${isHomeSupportService === 2 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="isHomeSupportService"
                    value="2"
                    checked={isHomeSupportService === 2}
                    onChange={() => handleHomeSupportChange(2)}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-5">
                    <span className="block text-lg sm:text-xl font-medium text-gray-900">
                      No - Regular Service
                    </span>
                    <span className="block text-base sm:text-lg text-gray-500 mt-1">
                      Standard maintenance or repair service
                    </span>
                  </div>
                </label>
                <label className={`flex items-center p-5 sm:p-6 border-2 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-blue-300 transition-all ${isHomeSupportService === 1 ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                  <input
                    type="radio"
                    name="isHomeSupportService"
                    value="1"
                    checked={isHomeSupportService === 1}
                    onChange={() => handleHomeSupportChange(1)}
                    className="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="ml-5">
                    <span className="block text-lg sm:text-xl font-medium text-gray-900">
                      Yes - Home Support Service
                    </span>
                    <span className="block text-base sm:text-lg text-gray-500 mt-1">
                      Qualifies for home support service category
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </FormCard>

          {/* Start Date Section */}
          <FormCard
            title="Schedule Information"
            subtitle="Optional scheduling details for the job"
            icon={CalendarIcon}
            maxWidth="7xl"
          >
            <div className="max-w-xs">
              <DatePicker
                label="When should this job start? (Optional)"
                value={startDate}
                onChange={handleStartDateChange}
                error={errors.startDate}
                helperText="Leave blank if nothing was specified by the client"
                placeholder="Select a date"
                minDate={new Date().toISOString().split("T")[0]}
              />
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

Step2Content.displayName = 'Step2Content';

function AdminOrderAddStep2Page() {
  return (
    <UIXThemeProvider>
      <Step2Content />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep2Page;
