// File Path: web/workery-frontend/src/pages/Admin/Order/Search/CriteriaPage.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Spinner, Breadcrumb, Button, FormCard, Input, Checkbox)
// @uix-page: CustomSearchCriteriaPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import {
  Card,
  Alert,
  Spinner,
  Breadcrumb,
  Button,
  FormCard,
  Input,
  Checkbox,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  ArrowLeftIcon,
  XMarkIcon,
  LightBulbIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CheckCircleIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  FunnelIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

// Static breadcrumb items
const BREADCRUMB_ITEMS = Object.freeze([
  { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
  { label: "Orders", to: "/admin/orders", icon: WrenchScrewdriverIcon },
  { label: "Search", icon: MagnifyingGlassIcon, isActive: true },
]);

// Static search tips
const SEARCH_TIPS = Object.freeze([
  "Use keywords to search across all order fields",
  "Advanced search allows filtering by customer, associate, or order details",
  "Enter partial information for broader results",
  "Combine multiple filters for more precise searches",
]);

// Main content component
const CriteriaPageContent = memo(function CriteriaPageContent() {
  const authManager = useAuthManager();
  const navigate = useNavigate();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
  }), [getThemeClasses]);

  // Form states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  // Search form state
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);

  // Filter checkboxes
  const [filterByOrder, setFilterByOrder] = useState(false);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByAssociate, setFilterByAssociate] = useState(false);

  // Customer fields
  const [customerOrganizationName, setCustomerOrganizationName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");

  // Associate fields
  const [associateOrganizationName, setAssociateOrganizationName] = useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");

  // Order fields
  const [orderWjid, setOrderWjid] = useState("");

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
    }
    setFetching(false);
  }, [authManager, navigate]);

  // Handle form submission
  const onSubmitClick = useCallback((e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validation - ensure at least one field is filled
    if (
      customerOrganizationName === "" &&
      customerFirstName === "" &&
      customerLastName === "" &&
      customerEmail === "" &&
      customerPhone === "" &&
      actualSearchText === "" &&
      associateOrganizationName === "" &&
      associateFirstName === "" &&
      associateLastName === "" &&
      associateEmail === "" &&
      associatePhone === "" &&
      orderWjid === ""
    ) {
      setErrors({
        message: "Please enter a value in at least one field",
      });
      window.scrollTo(0, 0);
      return;
    }

    // Build URL with query parameters
    const queryParams = new URLSearchParams();

    if (customerFirstName) queryParams.append("cfn", customerFirstName);
    if (customerLastName) queryParams.append("cln", customerLastName);
    if (customerEmail) queryParams.append("ce", customerEmail);
    if (customerPhone) queryParams.append("cp", encodeURIComponent(customerPhone));
    if (customerOrganizationName) queryParams.append("con", customerOrganizationName);
    if (actualSearchText) queryParams.append("q", actualSearchText);
    if (associateFirstName) queryParams.append("afn", associateFirstName);
    if (associateLastName) queryParams.append("aln", associateLastName);
    if (associateEmail) queryParams.append("ae", associateEmail);
    if (associatePhone) queryParams.append("ap", encodeURIComponent(associatePhone));
    if (associateOrganizationName) queryParams.append("aon", associateOrganizationName);
    if (orderWjid) queryParams.append("owjid", orderWjid);

    const searchURL = `/admin/orders/search-result?${queryParams.toString()}`;
    navigate(searchURL);
  }, [
    customerOrganizationName, customerFirstName, customerLastName, customerEmail, customerPhone,
    actualSearchText, associateOrganizationName, associateFirstName, associateLastName,
    associateEmail, associatePhone, orderWjid, navigate
  ]);

  // Handle cancel
  const onCancelClick = useCallback((e) => {
    e.preventDefault();
    navigate("/admin/orders");
  }, [navigate]);

  // Handle clear form
  const handleClearForm = useCallback(() => {
    setActualSearchText("");
    setCustomerFirstName("");
    setCustomerLastName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setCustomerOrganizationName("");
    setAssociateFirstName("");
    setAssociateLastName("");
    setAssociateEmail("");
    setAssociatePhone("");
    setAssociateOrganizationName("");
    setOrderWjid("");
    setFilterByCustomer(false);
    setFilterByAssociate(false);
    setFilterByOrder(false);
    setErrors({});
  }, []);

  // Handle key press for Enter key submission
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter") {
      onSubmitClick(e);
    }
  }, [onSubmitClick]);

  // Toggle handlers
  const handleAdvancedToggle = useCallback(() => {
    setIsAdvancedFiltering(prev => !prev);
  }, []);

  const handleFilterByCustomerChange = useCallback((checked) => {
    setFilterByCustomer(checked);
  }, []);

  const handleFilterByAssociateChange = useCallback((checked) => {
    setFilterByAssociate(checked);
  }, []);

  const handleFilterByOrderChange = useCallback((checked) => {
    setFilterByOrder(checked);
  }, []);

  if (isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={BREADCRUMB_ITEMS} className="mb-8" />

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center">
                <WrenchScrewdriverIcon className={`h-8 w-8 mr-3 ${themeClasses.linkPrimary}`} />
                <h1 className={`text-3xl font-bold ${themeClasses.textPrimary}`}>
                  Search Orders
                </h1>
              </div>
              <p className={`mt-2 text-lg ${themeClasses.textSecondary} ml-11`}>
                Find existing orders in your database
              </p>
            </div>
            <Button variant="outline" onClick={onCancelClick} icon={ArrowLeftIcon}>
              Back to Orders
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
        <FormCard
          title="Search Criteria"
          icon={MagnifyingGlassIcon}
          description="Enter keywords or use advanced filters to find orders"
          maxWidth="4xl"
        >
          <form onSubmit={onSubmitClick}>
            {/* Basic Search */}
            <div className="mb-6">
              <Input
                label="Search Keywords"
                type="text"
                value={actualSearchText}
                onChange={setActualSearchText}
                onKeyPress={handleKeyPress}
                placeholder="Search by any keyword..."
                icon={MagnifyingGlassIcon}
              />
            </div>

            {/* Advanced Search Toggle */}
            <div className="mb-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleAdvancedToggle}
                icon={FunnelIcon}
              >
                {isAdvancedFiltering ? "Hide" : "Show"} Advanced Search
              </Button>
            </div>

            {/* Advanced Search Section */}
            {isAdvancedFiltering && (
              <>
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <FunnelIcon className="h-4 w-4 mr-2 text-gray-600" />
                    Filter Options
                  </h3>
                  <div className="space-y-2">
                    <Checkbox
                      id="filterByCustomer"
                      label="Filter by Customer"
                      checked={filterByCustomer}
                      onChange={handleFilterByCustomerChange}
                    />
                    <Checkbox
                      id="filterByAssociate"
                      label="Filter by Associate"
                      checked={filterByAssociate}
                      onChange={handleFilterByAssociateChange}
                    />
                    <Checkbox
                      id="filterByOrder"
                      label="Filter by Order"
                      checked={filterByOrder}
                      onChange={handleFilterByOrderChange}
                    />
                  </div>
                </div>

                {/* Customer Fields */}
                {filterByCustomer && (
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-blue-600" />
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        label="First Name"
                        type="text"
                        value={customerFirstName}
                        onChange={setCustomerFirstName}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter first name"
                        icon={UserIcon}
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        value={customerLastName}
                        onChange={setCustomerLastName}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter last name"
                        icon={UserIcon}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={customerEmail}
                        onChange={setCustomerEmail}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter email address"
                        icon={EnvelopeIcon}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={customerPhone}
                        onChange={setCustomerPhone}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter phone number"
                        icon={PhoneIcon}
                      />
                    </div>
                    <Input
                      label="Organization Name"
                      type="text"
                      value={customerOrganizationName}
                      onChange={setCustomerOrganizationName}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter organization name"
                      icon={BuildingOffice2Icon}
                    />
                  </div>
                )}

                {/* Associate Fields */}
                {filterByAssociate && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-green-600" />
                      Associate Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <Input
                        label="First Name"
                        type="text"
                        value={associateFirstName}
                        onChange={setAssociateFirstName}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter first name"
                        icon={UserIcon}
                      />
                      <Input
                        label="Last Name"
                        type="text"
                        value={associateLastName}
                        onChange={setAssociateLastName}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter last name"
                        icon={UserIcon}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={associateEmail}
                        onChange={setAssociateEmail}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter email address"
                        icon={EnvelopeIcon}
                      />
                      <Input
                        label="Phone"
                        type="tel"
                        value={associatePhone}
                        onChange={setAssociatePhone}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter phone number"
                        icon={PhoneIcon}
                      />
                    </div>
                    <Input
                      label="Organization Name"
                      type="text"
                      value={associateOrganizationName}
                      onChange={setAssociateOrganizationName}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter organization name"
                      icon={BuildingOffice2Icon}
                    />
                  </div>
                )}

                {/* Order Fields */}
                {filterByOrder && (
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <ClipboardDocumentListIcon className="h-4 w-4 mr-2 text-purple-600" />
                      Order Information
                    </h3>
                    <Input
                      label="Job Number"
                      type="text"
                      value={orderWjid}
                      onChange={setOrderWjid}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter job number"
                      icon={HashtagIcon}
                    />
                  </div>
                )}
              </>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex space-x-3">
                <Button variant="outline" type="button" onClick={onCancelClick} icon={ArrowLeftIcon}>
                  Back
                </Button>
                <Button variant="outline" type="button" onClick={handleClearForm} icon={XMarkIcon}>
                  Clear
                </Button>
              </div>

              <Button
                variant="primary"
                type="submit"
                disabled={isFetching}
                loading={isFetching}
                icon={MagnifyingGlassIcon}
              >
                {isFetching ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </FormCard>

        {/* Search Tips */}
        <Card className="mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className={`text-lg font-semibold ${themeClasses.textPrimary} flex items-center`}>
              <LightBulbIcon className="w-5 h-5 mr-2 text-yellow-500" />
              Search Tips
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-3 text-sm text-gray-600">
              {SEARCH_TIPS.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
});

// Wrapper with UIXThemeProvider
function AdminOrderSearchCriteriaPage() {
  return (
    <UIXThemeProvider>
      <CriteriaPageContent />
    </UIXThemeProvider>
  );
}

export default AdminOrderSearchCriteriaPage;
