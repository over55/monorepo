// File Path: web/workery-frontend/src/pages/Admin/Associate/Search/CriteriaPage.jsx
// UIX Upgraded - Uses SearchCriteriaPageComponent whole page component
// @uix-page: SearchCriteriaPageComponent

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import { SearchCriteriaPageComponent } from "../../../../components/UIX";
import {
  MagnifyingGlassIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOffice2Icon,
} from "@heroicons/react/24/outline";

// Static configuration constants
const PAGE_TITLE = "Search Associates";
const PAGE_SUBTITLE = "Find existing associates in your database";
const FORM_TITLE = "Search Criteria";
const FORM_SUBTITLE = "Enter one or more search criteria to find associates";

// Static initial form data
const INITIAL_FORM_DATA = Object.freeze({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  organizationName: "",
  showOnlyActive: true,
});

// Static breadcrumb items
const BREADCRUMB_ITEMS = Object.freeze([
  { label: "Dashboard", to: "/admin/dashboard", icon: ChartBarIcon },
  { label: "Associates", to: "/admin/associates", icon: WrenchScrewdriverIcon },
  { label: "Search", icon: MagnifyingGlassIcon, isActive: true },
]);

// Static form sections configuration
const FORM_SECTIONS = Object.freeze([
  {
    title: "Personal Information",
    columns: 2,
    fields: [
      {
        name: "firstName",
        label: "First Name",
        type: "text",
        placeholder: "Enter first name",
        icon: UserIcon,
      },
      {
        name: "lastName",
        label: "Last Name",
        type: "text",
        placeholder: "Enter last name",
        icon: UserIcon,
      },
    ],
  },
  {
    title: "Contact Information",
    columns: 2,
    fields: [
      {
        name: "email",
        label: "Email",
        type: "email",
        placeholder: "Enter email address",
        icon: EnvelopeIcon,
      },
      {
        name: "phone",
        label: "Phone",
        type: "tel",
        placeholder: "Enter phone number",
        icon: PhoneIcon,
      },
    ],
  },
  {
    title: "Organization",
    columns: 1,
    fields: [
      {
        name: "organizationName",
        label: "Organization Name",
        type: "text",
        placeholder: "Enter organization name",
        icon: BuildingOffice2Icon,
        helperText: "For commercial associates",
      },
    ],
  },
]);

// Static checkbox options
const CHECKBOX_OPTIONS = Object.freeze([
  {
    name: "showOnlyActive",
    label: "Search active associates only",
    helperText:
      "When checked, only active associates will be included in search results.",
  },
]);

function AdminAssociateSearchCriteriaPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({ ...INITIAL_FORM_DATA });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Memoized unauthorized handler
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Check authentication on mount
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Handle form data change
  const handleFormDataChange = useCallback((newFormData) => {
    setFormData(newFormData);
    // Clear errors when user makes changes
    if (Object.keys(errors).length > 0) {
      setErrors({});
    }
  }, [errors]);

  // Handle form submission
  const handleSubmit = useCallback(
    (data) => {
      // Validation - at least one search field required
      if (
        !data.firstName &&
        !data.lastName &&
        !data.email &&
        !data.phone &&
        !data.organizationName
      ) {
        setErrors({
          message: "Please enter at least one search field",
        });
        return;
      }

      // Clear errors and build query parameters
      setErrors({});

      const queryParams = new URLSearchParams();
      if (data.firstName) queryParams.append("fn", data.firstName);
      if (data.lastName) queryParams.append("ln", data.lastName);
      if (data.email) queryParams.append("e", data.email);
      if (data.phone) queryParams.append("p", data.phone);
      if (data.organizationName) queryParams.append("on", data.organizationName);
      queryParams.append("active", data.showOnlyActive ? "1" : "0");

      // Navigate to results page
      navigate(`/admin/associates/search-result?${queryParams.toString()}`);
    },
    [navigate],
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/associates");
  }, [navigate]);

  // Handle clear form
  const handleClear = useCallback(() => {
    setFormData({ ...INITIAL_FORM_DATA });
    setErrors({});
  }, []);

  return (
    <SearchCriteriaPageComponent
      breadcrumbItems={BREADCRUMB_ITEMS}
      pageTitle={PAGE_TITLE}
      pageSubtitle={PAGE_SUBTITLE}
      pageIcon={WrenchScrewdriverIcon}
      formTitle={FORM_TITLE}
      formSubtitle={FORM_SUBTITLE}
      formIcon={MagnifyingGlassIcon}
      formData={formData}
      onFormDataChange={handleFormDataChange}
      formSections={FORM_SECTIONS}
      checkboxOptions={CHECKBOX_OPTIONS}
      errors={errors}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      onClear={handleClear}
      onUnauthorized={onUnauthorized}
      isLoading={isLoading}
      showPageSubtitle={true}
    />
  );
}

export default AdminAssociateSearchCriteriaPage;
