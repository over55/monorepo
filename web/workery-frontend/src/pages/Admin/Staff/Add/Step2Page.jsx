// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step2Page.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep2Page

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useAccountManager,
  useAuthManager,
} from "../../../../services/Services";
import {
  UserPlusIcon,
  UsersIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import {
  STAFF_TYPE_FRONTLINE,
  STAFF_TYPE_MANAGEMENT,
} from "../../../../constants/Staff";
import {
  WizardFormStep,
  SelectionCard,
  UIXThemeProvider,
} from "../../../../components/UIX";

// Wizard configuration (static, moved outside component)
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
  const wizardStorage = useStaffAddWizardStorage();
  const navigate = useNavigate();

  // Component states
  const [errors, _setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);

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

  // PERFORMANCE: Check authentication and fetch current user
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }

    // Fetch current user for country info
    fetchCurrentUser();
  }, [authManager, navigate, fetchCurrentUser]);

  const onSelectType = useCallback((staffType) => {
    // Get existing staff creation state or create new one
    const currentState = wizardStorage.getWizardState();
    const updatedState = {
      ...currentState,
      type: staffType,
      country: currentUser?.country || "Canada",
    };

    // Save to wizard storage
    wizardStorage.saveWizardState(updatedState);

    // Navigate to next step
    navigate("/admin/staff/add/step-3");
  }, [currentUser, navigate, wizardStorage]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Staff type options memoized
  const staffTypeOptions = useMemo(() => [
    {
      title: "Frontline Staff",
      description: "Add a Frontline Staff member who works directly with customers and handles day-to-day operations",
      icon: UsersIcon,
      buttonLabel: "Select Frontline Staff",
      onClick: () => onSelectType(STAFF_TYPE_FRONTLINE),
      variant: "primary",
    },
    {
      title: "Management Staff",
      description: "Add a Management Staff member who oversees operations and makes strategic decisions",
      icon: CogIcon,
      buttonLabel: "Select Management Staff",
      onClick: () => onSelectType(STAFF_TYPE_MANAGEMENT),
      variant: "secondary",
    },
  ], [onSelectType]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={2}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Select Staff Type"
      stepSubtitle="Please select the type of staff member you are adding"
      stepIcon={UserPlusIcon}
      errors={errors}
      onCancel={handleCancel}
      onBack={handleBack}
      showFormCard={true}
      showActions={false}
      contentMaxWidth="4xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {staffTypeOptions.map((option, index) => (
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
  );
});

Step2Content.displayName = 'Step2Content';

function AdminStaffAddStep2Page() {
  return (
    <UIXThemeProvider>
      <Step2Content />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep2Page;
