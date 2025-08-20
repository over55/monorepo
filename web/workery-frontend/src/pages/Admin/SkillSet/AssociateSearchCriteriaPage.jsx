// monorepo/web/workery-frontend/src/pages/Admin/SkillSet/AssociateSearchCriteriaPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { SkillSetsMultiSelect } from "../../../components/Form";
import { Card, Alert, Button, Radio } from "../../../components/UI";

function AdminSkillSetAssociateSearchCriteriaPage() {
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [selectedSkillSetIds, setSelectedSkillSetIds] = useState([]);
  const [searchType, setSearchType] = useState("");
  const [alert, setAlert] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Handle skill set change
  const handleSkillSetChange = (value) => {
    setSelectedSkillSetIds(value);
    // Clear skill set error when user selects something
    if (value && value.length > 0 && errors.skillSets) {
      setErrors((prev) => ({ ...prev, skillSets: undefined }));
    }
  };

  // Handle search type change
  const handleSearchTypeChange = (value) => {
    setSearchType(value);
    // Clear search type error when user selects something
    if (value && errors.searchType) {
      setErrors((prev) => ({ ...prev, searchType: undefined }));
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    let hasErrors = false;

    if (!selectedSkillSetIds || selectedSkillSetIds.length === 0) {
      newErrors.skillSets = "Please select at least one skill set";
      hasErrors = true;
    }

    if (!searchType) {
      newErrors.searchType = "Please select a search type";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below before searching.",
      });
      window.scrollTo(0, 0);
      return;
    }

    // Clear any previous errors
    setErrors({});
    setAlert(null);

    // Navigate to results page with search parameters
    const skillSetIdsStr = selectedSkillSetIds.join(",");
    navigate(
      `/admin/skill-sets/search-results?ssids=${skillSetIdsStr}&type=${searchType}`,
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />
                Skill Sets
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <WrenchScrewdriverIcon className="w-8 h-8 mr-3 text-blue-600" />
              Skill Sets
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <MagnifyingGlassIcon className="w-4 h-4 mr-1" />
              Search for associates by skill sets
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {alert && (
        <Alert
          type={alert.type}
          dismissible
          onDismiss={() => setAlert(null)}
          className="mb-6"
        >
          {alert.message}
        </Alert>
      )}

      {/* Main Content Card */}
      <Card className="shadow-lg">
        {/* Card Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-center">
            <MagnifyingGlassIcon className="w-6 h-6 mr-2 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Search Criteria
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Select one or more skill sets and choose how to search for
            associates
          </p>
        </div>

        {/* Card Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Information Alert */}
            <Alert type="info">
              <div className="flex">
                <InformationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium">How to use this search:</p>
                  <ul className="mt-2 list-disc list-inside text-sm">
                    <li>Select one or more skill sets from the dropdown</li>
                    <li>
                      Choose whether associates must have ALL selected skills or
                      ANY of them
                    </li>
                    <li>Click Search to find matching associates</li>
                  </ul>
                </div>
              </div>
            </Alert>

            {/* Skill Set Selection */}
            <div>
              <SkillSetsMultiSelect
                value={selectedSkillSetIds}
                onChange={handleSkillSetChange}
                error={errors.skillSets}
                required={true}
                label="Select Skill Sets"
                placeholder="Choose skill sets to search for..."
                helperText="Select all skill sets you want to search associates by"
                onUnauthorized={onUnauthorized}
              />
            </div>

            {/* Search Type Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Search Type <span className="text-red-500">*</span>
              </label>

              <div className="space-y-3">
                <label className="flex items-start cursor-pointer hover:bg-white rounded-lg p-3 transition-colors">
                  <input
                    type="radio"
                    name="searchType"
                    value="all"
                    checked={searchType === "all"}
                    onChange={(e) => handleSearchTypeChange(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Match ALL skill sets
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">
                      Associates must have every selected skill set
                    </span>
                  </div>
                </label>

                <label className="flex items-start cursor-pointer hover:bg-white rounded-lg p-3 transition-colors">
                  <input
                    type="radio"
                    name="searchType"
                    value="in"
                    checked={searchType === "in"}
                    onChange={(e) => handleSearchTypeChange(e.target.value)}
                    className="mt-1 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      Match ANY skill set
                    </span>
                    <span className="block text-sm text-gray-500 mt-1">
                      Associates must have at least one of the selected skill
                      sets
                    </span>
                  </div>
                </label>
              </div>

              {errors.searchType && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  {errors.searchType}
                </p>
              )}
            </div>

            {/* Selected Skills Summary */}
            {selectedSkillSetIds.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-900 mb-2">
                  Search Summary:
                </p>
                <p className="text-sm text-blue-700">
                  Finding associates who have{" "}
                  <strong>{searchType === "all" ? "ALL" : "ANY"}</strong> of the{" "}
                  {selectedSkillSetIds.length} selected skill
                  {selectedSkillSetIds.length === 1 ? " set" : " sets"}
                </p>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
            <Link to="/admin/dashboard">
              <Button type="button" variant="outline" icon={ChevronLeftIcon}>
                Back to Dashboard
              </Button>
            </Link>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setSelectedSkillSetIds([]);
                  setSearchType("");
                  setErrors({});
                  setAlert(null);
                }}
              >
                Clear
              </Button>

              <Button
                type="submit"
                variant="primary"
                icon={MagnifyingGlassIcon}
              >
                Search Associates
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Help Section */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Need help?</h3>
        <p className="text-sm text-gray-600">
          This search tool helps you find associates based on their skill sets.
          You can search for associates who have specific combinations of
          skills, making it easier to find the right person for a job.
        </p>
        <div className="mt-3">
          <Link
            to="/admin/associates"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Browse all associates →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminSkillSetAssociateSearchCriteriaPage;
