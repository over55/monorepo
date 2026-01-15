// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartAPage.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminAssociateAddStep1PartAPage

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  Input,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

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
const Step1PartAContent = memo(function Step1PartAContent() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Component states
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
  }, [authManager, navigate]);

  // Stable onChange handlers
  const handleFirstNameChange = useCallback((value) => setFirstName(value), []);
  const handleLastNameChange = useCallback((value) => setLastName(value), []);
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePhoneChange = useCallback((value) => setPhone(value), []);

  // Handle search submit
  const handleSearch = useCallback(() => {
    if (!firstName && !lastName && !email && !phone) {
      setErrors({ message: "Please enter at least one search value" });
      return;
    }

    setErrors({});

    // Navigate to results page with search parameters
    const searchParams = new URLSearchParams();
    if (firstName) searchParams.append("fn", firstName);
    if (lastName) searchParams.append("ln", lastName);
    if (email) searchParams.append("e", email);
    if (phone) searchParams.append("p", phone);

    navigate(`/admin/associates/add/step-1-results?${searchParams.toString()}`);
  }, [firstName, lastName, email, phone, navigate]);

  // Handle skip search - go directly to add
  const handleSkipSearch = useCallback(() => {
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
    navigate("/admin/associates/add/step-2");
  }, [navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    const hasData = firstName || lastName || email || phone;
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/associates");
    }
  }, [firstName, lastName, email, phone, navigate]);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    navigate("/admin/associates");
  }, [navigate]);

  // Action buttons
  const actions = useMemo(() => [
    {
      label: "Cancel",
      variant: "outline",
      onClick: handleCancel,
    },
    {
      label: "Search",
      variant: "primary",
      onClick: handleSearch,
      icon: MagnifyingGlassIcon,
    },
  ], [handleCancel, handleSearch]);

  return (
    <>
      <WizardFormStep
        wizardSteps={WIZARD_STEPS}
        currentStep={1}
        wizardTitle="Add New Associate"
        wizardIcon={UserPlusIcon}
        stepTitle="Search for Existing Associate"
        stepSubtitle="Search for existing associates before creating a new one"
        stepIcon={MagnifyingGlassIcon}
        showFormCard={false}
        contentMaxWidth="7xl"
        errors={errors}
        isLoading={isLoading}
        actions={actions}
        actionLayout="end"
      >
        <div className="space-y-6">
          {/* Search Form */}
          <FormCard
            title="Search Criteria"
            subtitle="Enter at least one search value to find existing associates"
            icon={MagnifyingGlassIcon}
            maxWidth="7xl"
          >
            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="First Name"
                  type="text"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  placeholder="Enter first name"
                  icon={UserIcon}
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={lastName}
                  onChange={handleLastNameChange}
                  placeholder="Enter last name"
                  icon={UserIcon}
                />
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter email address"
                  icon={EnvelopeIcon}
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  icon={PhoneIcon}
                />
              </div>

              {/* Info Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 flex items-start">
                  <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>
                    Enter at least one search criteria to check for existing associates.
                    This helps prevent duplicate records in the system.
                  </span>
                </p>
              </div>
            </div>
          </FormCard>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gray-50 text-sm font-medium text-gray-500">OR</span>
            </div>
          </div>

          {/* Skip Search Option */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-600 mb-4">
              If you're sure this is a new associate, skip the search and proceed directly to creation
            </p>
            <button
              onClick={handleSkipSearch}
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Add New Associate
            </button>
          </div>

          {/* Back Link */}
          <div className="pt-2">
            <Link
              to="/admin/associates"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Associates List
            </Link>
          </div>
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
              <p className="text-sm text-gray-600">
                Your Associate record will be cancelled and your work will be lost.
                This cannot be undone. Do you want to continue?
              </p>
            </div>
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 rounded-b-lg">
              <button
                onClick={() => setShowCancelWarning(false)}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                No, Keep Working
              </button>
              <button
                onClick={handleConfirmCancel}
                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
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

Step1PartAContent.displayName = 'Step1PartAContent';

function AdminAssociateAddStep1PartAPage() {
  return (
    <UIXThemeProvider>
      <Step1PartAContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep1PartAPage;
