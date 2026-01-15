// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step2Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminAssociateAddStep2Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import {
  useAuthManager,
  useAccountManager,
} from "../../../../services/Services";
import {
  WizardFormStep,
  SelectionCard,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  HomeIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

// Wizard configuration
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
];

// Memoized content component
const Step2Content = memo(function Step2Content() {
  const authManager = useAuthManager();
  const accountManager = useAccountManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  // Memoize onUnauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
    fetchCurrentUser();
  }, [authManager, navigate]);

  const fetchCurrentUser = async () => {
    try {
      const user = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(user);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const onSelectType = useCallback((typeId) => {
    // Set visual selection state
    setSelectedType(typeId);

    // Animate the selection before navigating
    setTimeout(() => {
      // Get existing associate creation state or create new one
      let associateState = {};
      try {
        const existing = sessionStorage.getItem(
          "WORKERY_ASSOCIATE_CREATION_STATE",
        );
        if (existing) {
          associateState = JSON.parse(existing);
        }
      } catch (error) {
        console.error("Error parsing associate state:", error);
      }

      // Set the type
      associateState.type = typeId;

      // Set default country based on current user's country
      if (currentUser?.country) {
        associateState.country = currentUser.country;
      } else {
        associateState.country = "Canada"; // Default fallback
      }

      // Save to session storage
      try {
        sessionStorage.setItem(
          "WORKERY_ASSOCIATE_CREATION_STATE",
          JSON.stringify(associateState),
        );
      } catch (error) {
        console.error("Error saving associate state:", error);
      }

      // Navigate to next step
      navigate("/admin/associates/add/step-3");
    }, 300);
  }, [currentUser, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setShowCancelWarning(true);
  }, []);

  // Confirm cancel
  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    navigate("/admin/associates/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/associates/add/step-1-search");
  }, [navigate]);

  // Associate type selection options
  const associateTypeOptions = useMemo(() => [
    {
      title: "Individual",
      description: "For individual contractors and service providers",
      icon: HomeIcon,
      buttonLabel: "Select Individual",
      onClick: () => onSelectType(RESIDENTIAL_ASSOCIATE_TYPE_OF_ID),
      variant: "success",
      selected: selectedType === RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
    },
    {
      title: "Commercial",
      description: "For businesses and commercial providers",
      icon: BuildingOffice2Icon,
      buttonLabel: "Select Commercial",
      onClick: () => onSelectType(COMMERCIAL_ASSOCIATE_TYPE_OF_ID),
      variant: "primary",
      selected: selectedType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
    },
  ], [onSelectType, selectedType]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={2}
        wizardTitle="Add New Associate"
        wizardIcon={UserPlusIcon}
        stepTitle="Select Associate Type"
        stepSubtitle="Choose the appropriate category for this associate"
        stepIcon={UserGroupIcon}
        showFormCard={true}
        showActions={false}
        contentMaxWidth="4xl"
        errors={errors}
        onCancel={handleCancel}
        onBack={handleBack}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {associateTypeOptions.map((option, index) => (
            <SelectionCard
              key={index}
              title={option.title}
              description={option.description}
              icon={option.icon}
              buttonLabel={option.buttonLabel}
              onClick={option.onClick}
              variant={option.variant}
              selected={option.selected}
            />
          ))}
        </div>
      </WizardFormStep>

      {/* Cancel Confirmation Modal */}
      {showCancelWarning && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full shadow-xl">
            <div className="bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 rounded-t-lg">
              <h3 className="text-base sm:text-lg font-semibold text-white">
                Are you sure?
              </h3>
            </div>

            <div className="px-4 sm:px-6 py-4 sm:py-6">
              <p className="text-sm sm:text-base text-gray-600">
                Your Associate record will be cancelled and your work will be
                lost. This cannot be undone. Do you want to continue?
              </p>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-lg flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors order-2 sm:order-1"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors order-1 sm:order-2"
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

function AdminAssociateAddStep2Page() {
  return (
    <UIXThemeProvider>
      <Step2Content />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep2Page;
