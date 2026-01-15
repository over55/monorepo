// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step1PartBPage.jsx
// UIX Upgraded - Uses WizardFormStep whole page component
// @uix-page: AdminStaffAddStep1PartBPage

import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useAuthManager,
  useStaffManager,
  useStaffAddWizardStorage,
} from "../../../../services/Services";
import {
  WizardFormStep,
  Spinner,
  Modal,
  Button,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import {
  COMMERCIAL_STAFF_TYPE_OF_ID,
  RESIDENTIAL_STAFF_TYPE_OF_ID,
} from "../../../../constants/Staff";

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

// Memoized staff card component with theme support
const StaffCard = memo(function StaffCard({ staff, getStaffTypeIcon, themeClasses }) {
  return (
    <div className={`${themeClasses.bgCard} border ${themeClasses.cardBorder} rounded-lg p-3 md:p-4 hover:shadow-md transition-shadow`}>
      <div className={`flex items-start justify-between mb-2 md:mb-3 pb-2 md:pb-3 border-b ${themeClasses.cardBorder}`}>
        <Link
          to={`/admin/staff/${staff.id}`}
          className={`font-semibold text-sm md:text-base ${themeClasses.linkPrimary} flex items-center`}
        >
          {getStaffTypeIcon(staff.type)}
          <span className="ml-2 break-words">
            {staff.type === COMMERCIAL_STAFF_TYPE_OF_ID
              ? staff.organizationName || `${staff.firstName} ${staff.lastName}`
              : `${staff.firstName} ${staff.lastName}`}
          </span>
        </Link>
      </div>
      <div className={`space-y-1.5 md:space-y-2 text-xs md:text-sm ${themeClasses.textSecondary}`}>
        <div className="flex items-start">
          <MapPinIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0 mt-0.5" />
          <div>
            <div>{staff.addressLine1}</div>
            <div>
              {staff.city}, {staff.region}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
          {staff.phone ? (
            <a href={`tel:${staff.phone}`} className={themeClasses.linkPrimary}>
              {staff.phone}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>
        <div className="flex items-center">
          <EnvelopeIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1.5 md:mr-2 flex-shrink-0" />
          {staff.email ? (
            <a href={`mailto:${staff.email}`} className={`${themeClasses.linkPrimary} truncate`}>
              {staff.email}
            </a>
          ) : (
            <span>-</span>
          )}
        </div>
      </div>
      <div className={`mt-3 md:mt-4 pt-2 md:pt-3 border-t ${themeClasses.cardBorder}`}>
        <Link
          to={`/admin/staff/${staff.id}`}
          className={`inline-flex items-center text-xs md:text-sm font-medium ${themeClasses.linkPrimary}`}
        >
          Select
          <ArrowRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
});

// Memoized content component
const Step1PartBContent = memo(function Step1PartBContent() {
  const authManager = useAuthManager();
  const staffManager = useStaffManager();
  const wizardStorage = useStaffAddWizardStorage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getThemeClasses } = useUIXTheme();

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    bgCard: getThemeClasses('bg-card') || 'bg-white dark:bg-gray-900',
    cardBorder: getThemeClasses('card-border') || 'border-gray-200 dark:border-gray-700',
    textPrimary: getThemeClasses('text-primary') || 'text-gray-900 dark:text-gray-100',
    textSecondary: getThemeClasses('text-secondary') || 'text-gray-600 dark:text-gray-400',
    textMuted: getThemeClasses('text-muted') || 'text-gray-500 dark:text-gray-400',
    linkPrimary: getThemeClasses('link-primary') || 'text-blue-600 dark:text-blue-400',
    borderMedium: getThemeClasses('border-medium') || 'border-gray-300 dark:border-gray-600',
    formCardHeaderBg: getThemeClasses('form-card-header-bg') || 'bg-gray-700 dark:bg-gray-800',
    formCardHeaderText: getThemeClasses('form-card-header-text') || 'text-white',
    textSuccess: getThemeClasses('text-success') || 'text-green-600 dark:text-green-400',
    textInfo: getThemeClasses('text-info') || 'text-blue-600 dark:text-blue-400',
  }), [getThemeClasses]);

  // Memoized options for Select components
  const statusOptions = useMemo(() => [
    { value: "", label: "All Statuses" },
    { value: "1", label: "Active" },
    { value: "2", label: "Archived" },
  ], []);

  const typeOptions = useMemo(() => [
    { value: "0", label: "All Types" },
    { value: "1", label: "Unassigned" },
    { value: String(RESIDENTIAL_STAFF_TYPE_OF_ID), label: "Residential" },
    { value: String(COMMERCIAL_STAFF_TYPE_OF_ID), label: "Commercial" },
  ], []);

  const sortOptions = useMemo(() => [
    { value: "last_name,ASC", label: "Name (A-Z)" },
    { value: "last_name,DESC", label: "Name (Z-A)" },
    { value: "join_date,ASC", label: "Join Date (Oldest)" },
    { value: "join_date,DESC", label: "Join Date (Newest)" },
  ], []);

  const pageSizeOptions = useMemo(() => [
    { value: "25", label: "25" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ], []);

  // URL Parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  // Component states
  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] = useState(null);
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
  }, [authManager, navigate]);

  // Fetch staff based on search parameters
  const fetchStaffList = useCallback(async () => {
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

      const staffData = staffManager.getStaffWithFiltersMap
        ? await staffManager.getStaffWithFiltersMap(
            filtersMap,
            () => navigate("/login?unauthorized=true"),
            true
          )
        : await staffManager.getStaff(Object.fromEntries(filtersMap), () =>
            navigate("/login?unauthorized=true")
          );

      setStaffList(staffData.results || []);
      if (staffData.hasNextPage) {
        setNextCursor(staffData.nextCursor);
      } else {
        setNextCursor("");
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  }, [
    firstName,
    lastName,
    email,
    phone,
    currentCursor,
    pageSize,
    sortByValue,
    status,
    typeOf,
    staffManager,
    navigate,
  ]);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  const handleNextPage = useCallback(() => {
    let arr = [...previousCursors];
    arr.push(currentCursor);
    setPreviousCursors(arr);
    setCurrentCursor(nextCursor);
  }, [previousCursors, currentCursor, nextCursor]);

  const handlePreviousPage = useCallback(() => {
    let arr = [...previousCursors];
    const previousCursor = arr.pop();
    setPreviousCursors(arr);
    setCurrentCursor(previousCursor);
  }, [previousCursors]);

  const handleDeselectStaffForDeletion = useCallback(() => {
    setSelectedStaffForDeletion(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedStaffForDeletion) return;

    try {
      await staffManager.deleteStaff(selectedStaffForDeletion.id, () =>
        navigate("/login?unauthorized=true")
      );
      await fetchStaffList();
      setSelectedStaffForDeletion(null);
    } catch (error) {
      console.error("Failed to delete staff:", error);
      setErrors(error);
    }
  }, [selectedStaffForDeletion, staffManager, navigate, fetchStaffList]);

  const handleAddStaffClick = useCallback(() => {
    wizardStorage.resetWizardState();
    navigate("/admin/staff/add/step-2");
  }, [wizardStorage, navigate]);

  const handleStatusChange = useCallback((value) => {
    setStatus(parseInt(value) || "");
  }, []);

  const handleTypeChange = useCallback((value) => {
    setTypeOf(parseInt(value));
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortByValue(value);
  }, []);

  const handlePageSizeChange = useCallback((value) => {
    setPageSize(parseInt(value));
  }, []);

  // Handle cancel
  const handleCancel = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  // Handle back
  const handleBack = useCallback(() => {
    navigate("/admin/staff/add/step-1-search");
  }, [navigate]);

  const getStaffTypeIcon = useCallback((type) => {
    switch (type) {
      case RESIDENTIAL_STAFF_TYPE_OF_ID:
        return <HomeIcon className={`w-5 h-5 inline ${themeClasses.textSuccess}`} />;
      case COMMERCIAL_STAFF_TYPE_OF_ID:
        return <BuildingOffice2Icon className={`w-5 h-5 inline ${themeClasses.textInfo}`} />;
      default:
        return <UsersIcon className={`w-5 h-5 inline ${themeClasses.textMuted}`} />;
    }
  }, [themeClasses.textSuccess, themeClasses.textInfo, themeClasses.textMuted]);

  return (
    <WizardFormStep
      wizardSteps={WIZARD_STEPS}
      currentStep={1}
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Search Results"
      stepSubtitle="Review search results or create new staff"
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      showActions={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
      onCancel={handleCancel}
      onBack={handleBack}
    >
      {/* Main Content with Dark Header */}
      <div className={`${themeClasses.formCardHeaderBg} rounded-lg shadow-sm`}>
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <h2 className={`text-base sm:text-lg font-semibold ${themeClasses.formCardHeaderText} flex items-center`}>
            <ClipboardDocumentListIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${themeClasses.linkPrimary} flex-shrink-0`} />
            <span className="truncate">Search Results</span>
          </h2>
        </div>

        {/* Filter Panel */}
        <div className={`${themeClasses.bgCard} px-4 sm:px-6 py-3 sm:py-4 border-t ${themeClasses.cardBorder}`}>
          <div className="flex items-center mb-3">
            <FunnelIcon className={`w-4 sm:w-5 h-4 sm:h-5 mr-2 ${themeClasses.textMuted}`} />
            <h3 className={`text-sm font-semibold ${themeClasses.textPrimary}`}>Filtering & Sorting</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <Select
              label="Status"
              value={String(status)}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder=""
              size="sm"
            />
            <Select
              label="Type"
              value={String(typeOf)}
              onChange={handleTypeChange}
              options={typeOptions}
              placeholder=""
              size="sm"
            />
            <div className="sm:col-span-2 lg:col-span-1">
              <Select
                label="Sort by"
                value={sortByValue}
                onChange={handleSortChange}
                options={sortOptions}
                placeholder=""
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className={`${themeClasses.bgCard} border-2 border-t-0 ${themeClasses.cardBorder} rounded-b-lg`}>
          {isLoading ? (
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-center py-8">
                <Spinner size="lg" />
                <span className={`ml-3 text-sm md:text-base ${themeClasses.textSecondary}`}>
                  Loading staff...
                </span>
              </div>
            </div>
          ) : (
            <>
              {staffList && staffList.length > 0 ? (
                <div className="p-4 md:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                    {staffList.map((staff) => (
                      <StaffCard
                        key={staff.id}
                        staff={staff}
                        getStaffTypeIcon={getStaffTypeIcon}
                        themeClasses={themeClasses}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  <div className={`mt-4 md:mt-6 pt-3 md:pt-4 border-t ${themeClasses.borderMedium} flex flex-col sm:flex-row items-center justify-between gap-3`}>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs md:text-sm ${themeClasses.textSecondary}`}>Show</span>
                      <Select
                        value={String(pageSize)}
                        onChange={handlePageSizeChange}
                        options={pageSizeOptions}
                        placeholder=""
                        size="sm"
                        className="w-20"
                      />
                      <span className={`text-xs md:text-sm ${themeClasses.textSecondary}`}>per page</span>
                    </div>
                    <div className="flex gap-2">
                      {previousCursors.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePreviousPage}
                          icon={ChevronLeftIcon}
                        >
                          Previous
                        </Button>
                      )}
                      {nextCursor && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextPage}
                        >
                          Next
                          <ChevronRightIcon className="w-3.5 h-3.5 md:w-4 md:h-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 md:p-6">
                  <div className={`text-center py-6 md:py-8 ${themeClasses.bgCard} rounded-lg`}>
                    <ClipboardDocumentListIcon className={`w-10 h-10 md:w-12 md:h-12 mx-auto ${themeClasses.textMuted} mb-3`} />
                    <h3 className={`text-base md:text-lg font-semibold ${themeClasses.textPrimary} mb-2`}>
                      No Staff Found
                    </h3>
                    <p className={`text-sm md:text-base ${themeClasses.textSecondary} mb-4`}>
                      No staff members found matching your search criteria.
                    </p>
                    <Link
                      to="/admin/staff/add/step-1-search"
                      className={`inline-flex items-center text-sm md:text-base ${themeClasses.linkPrimary} font-medium`}
                    >
                      <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
                      Try a different search
                    </Link>
                  </div>
                </div>
              )}

              {/* OR Divider and Actions */}
              <div className="relative px-4 md:px-6 py-3">
                <div className="absolute inset-0 flex items-center px-4 md:px-6">
                  <div className={`w-full border-t ${themeClasses.borderMedium}`}></div>
                </div>
                <div className="relative flex justify-center">
                  <span className={`px-3 md:px-4 ${themeClasses.bgCard} text-xs md:text-sm font-medium ${themeClasses.textMuted}`}>
                    OR
                  </span>
                </div>
              </div>

              <div className="px-4 pb-4 md:px-6 md:pb-5">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Link to="/admin/staff/add/step-1-search">
                    <Button variant="outline" icon={MagnifyingGlassIcon}>
                      Search Again
                    </Button>
                  </Link>
                  <Button
                    variant="success"
                    onClick={handleAddStaffClick}
                    icon={UserPlusIcon}
                  >
                    Add New Staff Member
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Back Link */}
      <div className="mt-4 md:mt-6">
        <Link
          to="/admin/staff/add/step-1-search"
          className={`inline-flex items-center text-xs md:text-sm ${themeClasses.linkPrimary}`}
        >
          <ArrowLeftIcon className="w-3.5 h-3.5 md:w-4 md:h-4 mr-1" />
          Back to Search
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedStaffForDeletion}
        onClose={handleDeselectStaffForDeletion}
        title="Are you sure?"
        icon={ExclamationTriangleIcon}
        iconColor="amber"
        maxWidth="md"
        footer={
          <div className="flex justify-end space-x-2 md:space-x-3">
            <Button variant="outline" onClick={handleDeselectStaffForDeletion}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleDeleteConfirm}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className={`text-xs md:text-sm ${themeClasses.textSecondary}`}>
          You are about to <strong>archive</strong> this staff member; they will no
          longer appear on your dashboard. This action can be undone but you'll need to
          contact the system administrator. Are you sure you would like to continue?
        </p>
      </Modal>
    </WizardFormStep>
  );
});

Step1PartBContent.displayName = "Step1PartBContent";

function AdminStaffAddStep1PartBPage() {
  return (
    <UIXThemeProvider>
      <Step1PartBContent />
    </UIXThemeProvider>
  );
}

export default AdminStaffAddStep1PartBPage;
