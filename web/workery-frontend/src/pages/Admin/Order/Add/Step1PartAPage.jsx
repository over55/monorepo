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

              {/* Search Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleSearch}
                  className="inline-flex items-center px-8 py-4 text-lg sm:text-xl font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <MagnifyingGlassIcon className="w-6 h-6 mr-2" />
                  Search Customers
                </button>
              </div>
            </div>
          </FormCard>

          {/* OR Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-6 bg-gray-50 text-lg sm:text-xl font-medium text-gray-500">OR</span>
            </div>
          </div>

          {/* Create New Customer Section */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-8 text-center">
            <UserPlusIcon className="w-16 h-16 mx-auto text-green-600 mb-4" />
            <p className="text-lg sm:text-xl text-gray-700 mb-3 font-medium">
              Can't find the customer? Create a new one!
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-5">
              This will open in a new window so you won't lose your progress
            </p>
            <button
              onClick={handleCreateNewCustomer}
              className="inline-flex items-center px-8 py-3.5 text-lg sm:text-xl font-medium text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
            >
              <UserPlusIcon className="w-6 h-6 mr-2" />
              Create New Customer
            </button>
          </div>

          {/* Back Link */}
          <div className="pt-4">
            <Link
              to="/admin/orders"
              className="inline-flex items-center text-base sm:text-lg text-blue-600 hover:text-blue-800 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Orders List
            </Link>
          </div>
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
                Your Order record will be cancelled and your work will be lost.
                This cannot be undone. Do you want to continue?
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

Step1PartAContent.displayName = 'Step1PartAContent';

function AdminOrderAddStep1PartAPage() {
  return (
    <UIXThemeProvider>
      <Step1PartAContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderAddStep1PartAPage;
