// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step1PartAPage.jsx
// UIX Upgraded - Uses WizardAddOrSearchStep whole page component
// @uix-page: AdminStaffAddStep1PartAPage

import React, { useState, useEffect, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  UserPlusIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import {
  WizardAddOrSearchStep,
  UIXThemeProvider,
} from "../../../../components/UIX";

// Configuration for wizard steps (static, moved outside component)
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Type" },
  { title: "Contact" },
  { title: "Address" },
  { title: "Account" },
  { title: "Metrics" },
  { title: "Comments" },
];

// Field configuration for search form (static, moved outside component)
const SEARCH_FIELDS = [
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    placeholder: "Enter first name",
    section: "personal",
    icon: UserIcon,
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    placeholder: "Enter last name",
    section: "personal",
    icon: UserIcon,
  },
  {
    name: "email",
    label: "Email Address",
    type: "email",
    placeholder: "Enter email address",
    section: "contact",
    icon: EnvelopeIcon,
  },
  {
    name: "phone",
    label: "Phone Number",
    type: "tel",
    placeholder: "Enter phone number",
    section: "contact",
    icon: PhoneIcon,
  },
];

// Memoized content component
const Step1PartAContent = memo(function Step1PartAContent() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, _setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // Scroll to top on mount (don't clear wizard state here - only clear when user explicitly starts new wizard)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Event handlers wrapped with useCallback
  const handleSearch = useCallback((data) => {
    if (import.meta.env.DEV) {
      console.log("handleSearch: Beginning...", data);
    }

    const { firstName, lastName, email, phone } = data;
    if (!firstName && !lastName && !email && !phone) {
      setErrors({
        message: "Please enter at least one search value",
      });
      return;
    }

    // Clear any previous errors
    setErrors({});

    // Navigate to results page with search parameters
    const searchParams = new URLSearchParams();
    if (firstName) searchParams.append("fn", firstName);
    if (lastName) searchParams.append("ln", lastName);
    if (email) searchParams.append("e", email);
    if (phone) searchParams.append("p", phone);

    navigate(`/admin/staff/add/step-1-results?${searchParams.toString()}`);
  }, [navigate]);

  const handleSkipSearch = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log("Creating new staff member - skipping search");
    }

    // Reset wizard state
    wizardStorage.resetWizardState();

    // Navigate directly to step 2
    navigate("/admin/staff/add/step-2");
  }, [navigate, wizardStorage]);

  const handleCancel = useCallback(() => {
    navigate("/admin/staff");
  }, [navigate]);

  return (
    <WizardAddOrSearchStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      formData={formData}
      onFormDataChange={setFormData}
      searchFields={SEARCH_FIELDS}
      errors={errors}
      onSearch={handleSearch}
      onCancel={handleCancel}
      onSkipSearch={handleSkipSearch}
      entityName="staff member"
      isLoading={isLoading}
      addIcon={UserPlusIcon}
    />
  );
});

Step1PartAContent.displayName = 'Step1PartAContent';

function AdminStaffAddStep1PartAPage() {
  return (
    <UIXThemeProvider>
      <Step1PartAContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep1PartAPage;
