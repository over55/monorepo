// File Path: web/workery-frontend/src/pages/Admin/Associate/Add/Step1PartBPage.jsx
// UIX Upgraded - Uses WizardFormStep and SearchResultsCard components
// @uix-page: AdminAssociateAddStep1PartBPage

import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useAssociateManager,
} from "../../../../services/Services";
import {
  WizardFormStep,
  SearchResultsCard,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  WrenchScrewdriverIcon,
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

// Status options
const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "1", label: "Active" },
  { value: "2", label: "Archived" },
];

// Type options
const TYPE_OPTIONS = [
  { value: "0", label: "All Types" },
  { value: "1", label: "Unassigned" },
  { value: "2", label: "Residential" },
  { value: "3", label: "Commercial" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "last_name,ASC", label: "Name (A-Z)" },
  { value: "last_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,ASC", label: "Join Date (Oldest)" },
  { value: "join_date,DESC", label: "Join Date (Newest)" },
];

// Associate Card Component with larger text sizes
const AssociateCard = memo(({ associate }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 2:
        return <HomeIcon className="w-6 h-6 text-green-600" />;
      case 3:
        return <BuildingOffice2Icon className="w-6 h-6 text-blue-600" />;
      default:
        return <WrenchScrewdriverIcon className="w-6 h-6 text-gray-600" />;
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-blue-200">
        <Link
          to={`/admin/associate/${associate.id}`}
          className="font-semibold text-lg sm:text-xl text-gray-900 hover:text-blue-600 flex items-center transition-colors"
        >
          {getTypeIcon(associate.type)}
          <span className="ml-3 break-words">
            {associate.type === 3
              ? associate.organizationName || `${associate.firstName} ${associate.lastName}`
              : `${associate.firstName} ${associate.lastName}`}
          </span>
        </Link>
      </div>

      {/* Body */}
      <div className="space-y-3 text-base sm:text-lg text-gray-600">
        <div className="flex items-start">
          <MapPinIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div className="break-words">
            {associate.addressLine1 && <div>{associate.addressLine1}</div>}
            {(associate.city || associate.region) && (
              <div>
                {associate.city && associate.region
                  ? `${associate.city}, ${associate.region}`
                  : associate.city || associate.region}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          {associate.phone ? (
            <a
              href={`tel:${associate.phone}`}
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {associate.phone}
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
        <div className="flex items-center">
          <EnvelopeIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          {associate.email ? (
            <a
              href={`mailto:${associate.email}`}
              className="text-blue-600 hover:text-blue-800 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {associate.email}
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-blue-200">
        <Link
          to={`/admin/associate/${associate.id}`}
          className="inline-flex items-center text-base sm:text-lg font-medium text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Select Associate
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Link>
      </div>
    </div>
  );
});

AssociateCard.displayName = 'AssociateCard';

// Memoized content component
const Step1PartBContent = memo(function Step1PartBContent() {
  const authManager = useAuthManager();
  const associateManager = useAssociateManager();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [associates, setAssociates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState(50);
  const [previousCursors, setPreviousCursors] = useState([]);
  const [nextCursor, setNextCursor] = useState("");
  const [currentCursor, setCurrentCursor] = useState("");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);
  const [sortByValue, setSortByValue] = useState("last_name,ASC");

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
      return;
    }
    window.scrollTo(0, 0);
  }, [authManager, navigate]);

  // Memoize onUnauthorized callback
  const onUnauthorized = useCallback(() => {
    navigate("/login?unauthorized=true");
  }, [navigate]);

  // Fetch associates
  const fetchAssociates = useCallback(async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const filtersMap = new Map();
      filtersMap.set("pageSize", pageSize);
      filtersMap.set("sortField", "last_name");

      if (currentCursor) {
        filtersMap.set("cursor", currentCursor);
      }

      if (sortByValue) {
        const sortArray = sortByValue.split(",");
        filtersMap.set("sortField", sortArray[0]);
        filtersMap.set("sortOrder", sortArray[1]);
      }

      if (firstName) filtersMap.set("firstName", firstName);
      if (lastName) filtersMap.set("lastName", lastName);
      if (email) filtersMap.set("email", email);
      if (phone) filtersMap.set("phone", phone);
      if (status) filtersMap.set("status", status);
      if (typeOf !== 0) filtersMap.set("type", typeOf);

      const associatesData = await associateManager.getAssociatesWithFiltersMap(
        filtersMap,
        onUnauthorized,
        true
      );

      setAssociates(associatesData.results || []);
      if (associatesData.hasNextPage) {
        setNextCursor(associatesData.nextCursor);
      } else {
        setNextCursor("");
      }
    } catch (error) {
      console.error("Failed to fetch associates:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    firstName, lastName, email, phone, currentCursor, pageSize,
    sortByValue, status, typeOf, associateManager, onUnauthorized
  ]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchAssociates();
  }, [fetchAssociates]);

  // Pagination handlers
  const handleNextPage = useCallback(() => {
    setPreviousCursors((prev) => [...prev, currentCursor]);
    setCurrentCursor(nextCursor);
  }, [currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    setPreviousCursors((prev) => {
      const arr = [...prev];
      const previousCursor = arr.pop();
      setCurrentCursor(previousCursor || "");
      return arr;
    });
  }, []);

  // Filter handlers
  const handleStatusChange = useCallback((value) => setStatus(value), []);
  const handleTypeChange = useCallback((value) => setTypeOf(parseInt(value)), []);
  const handleSortChange = useCallback((value) => setSortByValue(value), []);
  const handlePageSizeChange = useCallback((value) => setPageSize(value), []);

  // Add new associate
  const handleAddAssociate = useCallback(() => {
    sessionStorage.removeItem("WORKERY_ASSOCIATE_CREATION_STATE");
    navigate("/admin/associates/add/step-2");
  }, [navigate]);

  // Search parameters display
  const searchParamsDisplay = useMemo(() => {
    const params = [];
    if (firstName) params.push({ label: "First Name", value: firstName });
    if (lastName) params.push({ label: "Last Name", value: lastName });
    if (email) params.push({ label: "Email", value: email });
    if (phone) params.push({ label: "Phone", value: phone });
    return params;
  }, [firstName, lastName, email, phone]);

  // Filters component for SearchResultsCard
  const filtersComponent = useMemo(() => (
    <>
      <Select
        label="Status"
        value={status}
        onChange={handleStatusChange}
        options={STATUS_OPTIONS}
      />
      <Select
        label="Type"
        value={String(typeOf)}
        onChange={handleTypeChange}
        options={TYPE_OPTIONS}
      />
      <Select
        label="Sort by"
        value={sortByValue}
        onChange={handleSortChange}
        options={SORT_OPTIONS}
      />
    </>
  ), [status, typeOf, sortByValue, handleStatusChange, handleTypeChange, handleSortChange]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Add New Associate"
      wizardIcon={UserPlusIcon}
      stepTitle="Search Results"
      stepSubtitle={associates.length > 0 ? `${associates.length} associate${associates.length === 1 ? '' : 's'} found - Review search results or create a new associate` : "Review search results or create a new associate"}
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
      showActions={false}
    >
      <SearchResultsCard
        searchParams={searchParamsDisplay}
        filters={filtersComponent}
        isLoading={isLoading}
        isEmpty={associates.length === 0}
        emptyState={{
          icon: ClipboardDocumentListIcon,
          title: "No Associates Found",
          message: "No associates found matching your search criteria.",
          backLink: "/admin/associates/add/step-1-search",
        }}
        pagination={{
          pageSize,
          onPageSizeChange: handlePageSizeChange,
          onNext: handleNextPage,
          onPrevious: handlePreviousPage,
          hasNext: !!nextCursor,
          hasPrevious: previousCursors.length > 0,
        }}
        alternativeAction={{
          searchAgainLink: "/admin/associates/add/step-1-search",
          createLabel: "Add New Associate",
          onCreate: handleAddAssociate,
          createIcon: UserPlusIcon,
        }}
        backLink="/admin/associates/add/step-1-search"
        backLabel="Back to Search"
      >
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {associates.map((associate) => (
            <AssociateCard key={associate.id} associate={associate} />
          ))}
        </div>
      </SearchResultsCard>
    </WizardFormStep>
  );
});

Step1PartBContent.displayName = 'Step1PartBContent';

function AdminAssociateAddStep1PartBPage() {
  return (
    <UIXThemeProvider>
      <Step1PartBContent />
    </UIXThemeProvider>
  );
}

export default AdminAssociateAddStep1PartBPage;
