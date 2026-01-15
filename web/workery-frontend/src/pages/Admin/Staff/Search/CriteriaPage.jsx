// File Path: web/workery-frontend/src/pages/Admin/Staff/Search/CriteriaPage.jsx
// UIX Upgraded - Uses UIX primitives (FormCard, Input, Checkbox)

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  Alert,
  Spinner,
  Breadcrumb,
  Button,
  FormCard,
  Input,
  Checkbox,
  Card,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  ArrowLeftIcon,
  XMarkIcon,
  LightBulbIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChartBarIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Memoized content component
const CriteriaPageContent = memo(function CriteriaPageContent() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary") || "text-gray-900 dark:text-gray-100",
    textSecondary: getThemeClasses("text-secondary") || "text-gray-600 dark:text-gray-400",
    textMuted: getThemeClasses("text-muted") || "text-gray-500 dark:text-gray-400",
    linkPrimary: getThemeClasses("link-primary") || "text-blue-600 dark:text-blue-400",
    bgPage: getThemeClasses("bg-page") || "bg-gray-50 dark:bg-gray-900",
    iconPrimary: getThemeClasses("icon-primary") || "text-blue-600 dark:text-blue-400",
    iconSuccess: getThemeClasses("icon-success") || "text-green-500 dark:text-green-400",
    iconWarning: getThemeClasses("icon-warning") || "text-yellow-500 dark:text-yellow-400",
    borderMedium: getThemeClasses("border-medium") || "border-gray-200 dark:border-gray-700",
  }), [getThemeClasses]);

  // Memoize breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
    { label: "Staff", to: "/admin/staff", icon: UserGroupIcon },
    { label: "Search", icon: MagnifyingGlassIcon, isActive: true },
  ], []);

  // Form states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Memoized input handlers
  const handleFirstNameChange = useCallback((value) => {
    setFirstName(value);
  }, []);

  const handleLastNameChange = useCallback((value) => {
    setLastName(value);
  }, []);

  const handleEmailChange = useCallback((value) => {
    setEmail(value);
  }, []);

  const handlePhoneChange = useCallback((value) => {
    setPhone(value);
  }, []);

  const handleShowOnlyActiveChange = useCallback((checked) => {
    setShowOnlyActive(checked);
  }, []);

  // Handle form submission
  const onSubmitClick = useCallback((e) => {
    e.preventDefault();

    // Validation
    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "Please enter at least one search criterion",
      });
      return;
    }

    // Clear errors
    setErrors({});

    // Build query parameters
    const queryParams = new URLSearchParams();
    if (firstName) queryParams.append("fn", firstName);
    if (lastName) queryParams.append("ln", lastName);
    if (email) queryParams.append("e", email);
    if (phone) queryParams.append("p", phone);
    queryParams.append("active", showOnlyActive ? "1" : "0");

    // Navigate to results page with query params
    const searchUrl = `/admin/staff/search-result?${queryParams.toString()}`;
    navigate(searchUrl);
  }, [firstName, lastName, email, phone, showOnlyActive, navigate]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff");
  }, [navigate]);

  // Handle clear form
  const handleClearForm = useCallback(() => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setShowOnlyActive(true);
    setErrors({});
  }, []);

  if (isFetching) {
    return (
      <div className={`min-h-screen ${themeClasses.bgPage} flex items-center justify-center`}>
        <div className="text-center">
          <Spinner size="lg" />
          <p className={`mt-4 ${themeClasses.textSecondary}`}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeClasses.bgPage}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-8" />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <UserGroupIcon className={`h-8 w-8 ${themeClasses.iconPrimary} mr-3`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Staff
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Find existing staff members in your database
              </p>
            </div>
            <Button variant="outline" onClick={handleCancel}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Staff
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {errors.message && (
          <Alert type="error" className="mb-6" dismissible onDismiss={() => setErrors({})}>
            {errors.message}
          </Alert>
        )}

        {/* Main Search Form */}
        <form onSubmit={onSubmitClick}>
          <div className="space-y-6">
            {/* Personal Information Section */}
            <FormCard
              title="Personal Information"
              icon={UserIcon}
              maxWidth="4xl"
            >
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
            </FormCard>

            {/* Contact Information Section */}
            <FormCard
              title="Contact Information"
              icon={PhoneIcon}
              maxWidth="4xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter email address"
                  icon={EnvelopeIcon}
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="Enter phone number"
                  icon={PhoneIcon}
                />
              </div>
            </FormCard>

            {/* Filter Options Section */}
            <FormCard
              title="Filter Options"
              icon={FunnelIcon}
              maxWidth="4xl"
            >
              <div className="space-y-4">
                <Checkbox
                  id="showOnlyActive"
                  label="Search active staff only"
                  checked={showOnlyActive}
                  onChange={handleShowOnlyActiveChange}
                />
                <p className={`text-xs ${themeClasses.textMuted} ml-6`}>
                  When checked, only active staff members will be included in
                  search results. Uncheck to search all staff including archived
                  ones.
                </p>
              </div>
            </FormCard>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4">
              <div className="flex space-x-3">
                <Button variant="outline" type="button" onClick={handleCancel}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button variant="outline" type="button" onClick={handleClearForm}>
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>

              <Button
                variant="primary"
                type="submit"
                disabled={isFetching}
                loading={isFetching}
              >
                {isFetching ? "Searching..." : (
                  <>
                    <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Search Tips */}
        <Card className="mt-6">
          <div className={`px-6 py-4 border-b ${themeClasses.borderMedium}`}>
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center`}>
              <LightBulbIcon className={`w-5 h-5 mr-2 ${themeClasses.iconWarning}`} />
              Search Tips
            </h3>
          </div>
          <div className="p-6">
            <ul className={`space-y-3 text-sm ${themeClasses.textSecondary}`}>
              <li className="flex items-start">
                <CheckCircleIcon className={`w-4 h-4 mr-2 ${themeClasses.iconSuccess} flex-shrink-0 mt-0.5`} />
                <span>Enter partial names for broader results</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className={`w-4 h-4 mr-2 ${themeClasses.iconSuccess} flex-shrink-0 mt-0.5`} />
                <span>Use email for exact staff member match</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className={`w-4 h-4 mr-2 ${themeClasses.iconSuccess} flex-shrink-0 mt-0.5`} />
                <span>Phone numbers can be partial</span>
              </li>
              <li className="flex items-start">
                <CheckCircleIcon className={`w-4 h-4 mr-2 ${themeClasses.iconSuccess} flex-shrink-0 mt-0.5`} />
                <span>Combine multiple fields for precise search</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
});

CriteriaPageContent.displayName = 'CriteriaPageContent';

// Wrapper with UIXThemeProvider
function AdminStaffSearchCriteriaPage() {
  return (
    <UIXThemeProvider>
      <CriteriaPageContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffSearchCriteriaPage;
