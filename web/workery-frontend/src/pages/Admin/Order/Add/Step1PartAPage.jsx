// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartAPage.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminOrderAddStep1PartAPage

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import {
  WizardFormStep,
  FormCard,
  Input,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  PlusCircleIcon,
  MagnifyingGlassIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  InformationCircleIcon,
  ArrowLeftIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";

// Wizard configuration - Order has 4 steps
const WIZARD_STEPS = [
  { title: "Search" },
  { title: "Details" },
  { title: "Skills" },
  { title: "Review" },
];

// Memoized content component
const Step1PartAContent = memo(function Step1PartAContent() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
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

  // Check authentication and initialize
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }
    window.scrollTo(0, 0);
    // Clear any existing order creation state when starting fresh
    orderCreationStorage.clearOrderCreation();
  }, [authManager, navigate, orderCreationStorage]);

  // Stable onChange handlers
  const handleFirstNameChange = useCallback((value) => setFirstName(value), []);
  const handleLastNameChange = useCallback((value) => setLastName(value), []);
  const handleEmailChange = useCallback((value) => setEmail(value), []);
  const handlePhoneChange = useCallback((value) => setPhone(value), []);

  // Handle search submit
  const handleSearch = useCallback(() => {
    if (!firstName && !lastName && !email && !phone) {
      setErrors({ message: "Please enter at least one search criteria" });
      return;
    }

    setErrors({});

    // Navigate to results page with search parameters
    const params = new URLSearchParams();
    if (firstName) params.append("fn", firstName);
    if (lastName) params.append("ln", lastName);
    if (email) params.append("e", email);
    if (phone) params.append("p", phone);

    navigate(`/admin/orders/add/step-1-results?${params.toString()}`);
  }, [firstName, lastName, email, phone, navigate]);

  // Handle create new customer
  const handleCreateNewCustomer = useCallback(() => {
    // Navigate to customer creation in new tab as per original
    window.open("/admin/customers/add/step-2", "_blank", "noreferrer");
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    const hasData = firstName || lastName || email || phone;
    if (hasData) {
      setShowCancelWarning(true);
    } else {
      navigate("/admin/orders");
    }
  }, [firstName, lastName, email, phone, navigate]);

  const handleConfirmCancel = useCallback(() => {
    setShowCancelWarning(false);
    navigate("/admin/orders");
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
        wizardTitle="New Order"
        wizardIcon={PlusCircleIcon}
        stepTitle="Search for Customer"
        stepSubtitle="Find the customer you want to create an order for"
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
            subtitle="Enter at least one search value to find existing customers"
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
                    Enter at least one search criteria to find existing customers.
                    This helps you select the right customer for the order.
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

          {/* Create New Customer Section */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 text-center">
            <UserPlusIcon className="w-12 h-12 mx-auto text-green-600 mb-3" />
            <p className="text-sm text-gray-700 mb-2 font-medium">
              Can't find the customer? Create a new one!
            </p>
            <p className="text-xs text-gray-600 mb-4">
              This will open in a new window so you won't lose your progress
            </p>
            <button
              onClick={handleCreateNewCustomer}
              className="inline-flex items-center px-6 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
              <UserPlusIcon className="w-5 h-5 mr-2" />
              Create New Customer
            </button>
          </div>

          {/* Back Link */}
          <div className="pt-2">
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Orders List
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
                Your Order record will be cancelled and your work will be lost.
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

function AdminOrderAddStep1PartAPage() {
  return (
    <UIXThemeProvider>
      <Step1PartAContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep1PartAPage;
