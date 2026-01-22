// File Path: web/workery-frontend/src/pages/Admin/Staff/Add/Step1PartBPage.jsx
// UIX Upgraded - Uses WizardFormStep and SearchResultsCard components
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
  SearchResultsCard,
  Modal,
  Button,
  Select,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserPlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  UsersIcon,
  ExclamationTriangleIcon,
  HomeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  ArrowRightIcon,
  ClipboardDocumentListIcon,
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
  { value: String(RESIDENTIAL_STAFF_TYPE_OF_ID), label: "Residential" },
  { value: String(COMMERCIAL_STAFF_TYPE_OF_ID), label: "Commercial" },
];

// Sort options
const SORT_OPTIONS = [
  { value: "last_name,ASC", label: "Name (A-Z)" },
  { value: "last_name,DESC", label: "Name (Z-A)" },
  { value: "join_date,ASC", label: "Join Date (Oldest)" },
  { value: "join_date,DESC", label: "Join Date (Newest)" },
];

// Staff Card Component with larger text sizes
const StaffCard = memo(function StaffCard({ staff, getStaffTypeIcon }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 hover:scale-[1.02] cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between mb-4 pb-4 border-b border-blue-200">
        <Link
          to={`/admin/staff/${staff.id}`}
          className="font-semibold text-lg sm:text-xl text-gray-900 hover:text-blue-600 flex items-center transition-colors"
        >
          {getStaffTypeIcon(staff.type)}
          <span className="ml-3 break-words">
            {staff.type === COMMERCIAL_STAFF_TYPE_OF_ID
              ? staff.organizationName || `${staff.firstName} ${staff.lastName}`
              : `${staff.firstName} ${staff.lastName}`}
          </span>
        </Link>
      </div>
      {/* Body */}
      <div className="space-y-3 text-base sm:text-lg text-gray-600">
        <div className="flex items-start">
          <MapPinIcon className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <div className="break-words">
            {staff.addressLine1 && <div>{staff.addressLine1}</div>}
            {(staff.city || staff.region) && (
              <div>
                {staff.city && staff.region
                  ? `${staff.city}, ${staff.region}`
                  : staff.city || staff.region}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <PhoneIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          {staff.phone ? (
            <a
              href={`tel:${staff.phone}`}
              className="text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              {staff.phone}
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
        <div className="flex items-center">
          <EnvelopeIcon className="w-5 h-5 mr-3 flex-shrink-0" />
          {staff.email ? (
            <a
              href={`mailto:${staff.email}`}
              className="text-blue-600 hover:text-blue-800 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              {staff.email}
            </a>
          ) : (
            <span>—</span>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-blue-200">
        <Link
          to={`/admin/staff/${staff.id}`}
          className="inline-flex items-center text-base sm:text-lg font-medium text-white bg-blue-600 px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Select Staff
          <ArrowRightIcon className="w-5 h-5 ml-2" />
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
    window.scrollTo(0, 0);
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
    setPageSize(value);
  }, []);

  const getStaffTypeIcon = useCallback((type) => {
    switch (type) {
      case RESIDENTIAL_STAFF_TYPE_OF_ID:
        return <HomeIcon className="w-6 h-6 text-green-600" />;
      case COMMERCIAL_STAFF_TYPE_OF_ID:
        return <BuildingOffice2Icon className="w-6 h-6 text-blue-600" />;
      default:
        return <UsersIcon className="w-6 h-6 text-gray-600" />;
    }
  }, []);

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
        value={String(status)}
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
      wizardTitle="Add New Staff Member"
      wizardIcon={UserPlusIcon}
      stepTitle="Search Results"
      stepSubtitle={staffList.length > 0 ? `${staffList.length} staff member${staffList.length === 1 ? '' : 's'} found - Review search results or create new staff` : "Review search results or create new staff"}
      stepIcon={ClipboardDocumentListIcon}
      showFormCard={false}
      showActions={false}
      contentMaxWidth="7xl"
      errors={errors}
      isLoading={false}
    >
      <SearchResultsCard
        searchParams={searchParamsDisplay}
        filters={filtersComponent}
        isLoading={isLoading}
        isEmpty={staffList.length === 0}
        emptyState={{
          icon: ClipboardDocumentListIcon,
          title: "No Staff Found",
          message: "No staff members found matching your search criteria.",
          backLink: "/admin/staff/add/step-1-search",
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
          searchAgainLink: "/admin/staff/add/step-1-search",
          createLabel: "Add New Staff Member",
          onCreate: handleAddStaffClick,
          createIcon: UserPlusIcon,
        }}
        backLink="/admin/staff/add/step-1-search"
        backLabel="Back to Search"
      >
        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staffList.map((staff) => (
            <StaffCard
              key={staff.id}
              staff={staff}
              getStaffTypeIcon={getStaffTypeIcon}
            />
          ))}
        </div>
      </SearchResultsCard>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedStaffForDeletion}
        onClose={handleDeselectStaffForDeletion}
        title="Are you sure?"
        icon={ExclamationTriangleIcon}
        iconColor="amber"
        maxWidth="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleDeselectStaffForDeletion}>
              Cancel
            </Button>
            <Button variant="success" onClick={handleDeleteConfirm}>
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-base sm:text-lg text-gray-600">
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
