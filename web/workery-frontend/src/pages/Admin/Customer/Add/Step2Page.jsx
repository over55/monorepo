// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step2Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminCustomerAddStep2Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import {
  useAuthManager,
  useAccountManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  HomeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";
import {
  WizardFormStep,
  SelectionCard,
  UIXThemeProvider,
} from "../../../../components/UIX";

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Metrics" },
  { title: "Review" },
];

// Memoized content component
const Step2Content = memo(function Step2Content() {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("WORKERY_CUSTOMER_CREATION_STATE");
    return saved ? JSON.parse(saved) : { country: "Canada" };
  });

  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await accountManager.getAccountDetail(() =>
        navigate("/login?unauthorized=true"),
      );
      setCurrentUser(user);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Failed to fetch current user:", error);
      }
    }
  }, [accountManager, navigate]);

  // Check authentication and fetch current user
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchCurrentUser();
  }, [authManager, navigate, fetchCurrentUser]);

  const onSelectType = useCallback((typeId) => {
    const updatedCustomerData = {
      ...customerData,
      type: typeId,
      country: currentUser?.country || "Canada",
    };

    try {
      sessionStorage.setItem(
        "WORKERY_CUSTOMER_CREATION_STATE",
        JSON.stringify(updatedCustomerData),
      );
      setCustomerData(updatedCustomerData);

      if (import.meta.env.DEV) {
        console.log(
          "Selected customer type:",
          typeId,
          "which maps to:",
          typeId === RESIDENTIAL_CUSTOMER_TYPE_OF_ID
            ? "Residential"
            : typeId === COMMERCIAL_CUSTOMER_TYPE_OF_ID
              ? "Commercial"
              : "Unknown",
        );
      }
    } catch (error) {
      console.error("Error saving customer state:", error);
    }

    navigate("/admin/customers/add/step-3");
  }, [currentUser, customerData, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/customers/add/step-1-search");
  }, [navigate]);

  // Confirm cancel
  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    sessionStorage.removeItem("WORKERY_CUSTOMER_CREATION_STATE");
    navigate("/admin/customers/add/step-1-search");
  }, [navigate]);

  // Customer type options
  const customerTypeOptions = useMemo(() => [
    {
      title: "Residential",
      description: "Individual customers for residential properties and home services",
      icon: HomeIcon,
      buttonLabel: "Select Residential",
      onClick: () => onSelectType(RESIDENTIAL_CUSTOMER_TYPE_OF_ID),
      variant: "success",
    },
    {
      title: "Commercial",
      description: "Business organizations or commercial entities requiring services",
      icon: BuildingOffice2Icon,
      buttonLabel: "Select Commercial",
      onClick: () => onSelectType(COMMERCIAL_CUSTOMER_TYPE_OF_ID),
      variant: "primary",
    },
  ], [onSelectType]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={2}
        wizardTitle="Add New Customer"
        wizardIcon={UserPlusIcon}
        stepTitle="Select Customer Type"
        stepSubtitle="Please select the type of customer you are adding"
        stepIcon={UserGroupIcon}
        errors={errors}
        onCancel={handleCancel}
        onBack={handleBack}
        showFormCard={true}
        showActions={false}
        contentMaxWidth="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customerTypeOptions.map((option, index) => (
            <SelectionCard
              key={index}
              title={option.title}
              description={option.description}
              icon={option.icon}
              buttonLabel={option.buttonLabel}
              onClick={option.onClick}
              variant={option.variant}
            />
          ))}
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Are you sure?
              </h3>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Your Customer record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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

function AdminCustomerAddStep2Page() {
  return (
    <UIXThemeProvider>
      <Step2Content />
    </UIXThemeProvider>
  );
}

export default AdminCustomerAddStep2Page;
