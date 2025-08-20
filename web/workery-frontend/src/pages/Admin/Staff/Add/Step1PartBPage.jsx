// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step1PartBPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import {
  useStaffManager,
  useStaffAddWizardStorage,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Select,
  Table,
} from "../../../../components/UI";
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  UserIcon,
  HomeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import { PAGE_SIZE_OPTIONS } from "../../../../constants/FieldOptions";
import {
  COMMERCIAL_STAFF_TYPE_OF_ID,
  RESIDENTIAL_STAFF_TYPE_OF_ID,
  STAFF_STATUS_FILTER_OPTIONS,
  STAFF_TYPE_FILTER_OPTIONS,
  STAFF_SORT_OPTIONS,
} from "../../../../constants/Staff";

function AdminStaffAddStep1PartBPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const staffManager = useStaffManager();
  const wizardStorage = useStaffAddWizardStorage();

  // Get search parameters
  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStaffForDeletion, setSelectedStaffForDeletion] =
    useState(null);

  // Pagination and filters
  const [pageSize, setPageSize] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("lexical_name,ASC");
  const [status, setStatus] = useState("");
  const [typeOf, setTypeOf] = useState(0);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    fetchStaffList();
  }, [currentPage, pageSize, sortBy, status, typeOf]);

  const fetchStaffList = async () => {
    setIsLoading(true);
    setErrors({});

    try {
      const params = {
        page: currentPage,
        limit: pageSize,
        sortBy: sortBy.split(",")[0],
        sortOrder: sortBy.split(",")[1],
        status: status,
        type: typeOf,
        first_name: firstName,
        last_name: lastName,
        email: email,
        phone: phone,
      };

      const data = await staffManager.getStaff(params, onUnauthorized);
      setStaffList(data);
    } catch (error) {
      console.error("Error fetching staff:", error);
      setErrors(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onAddStaffClick = () => {
    wizardStorage.resetWizardState();
    navigate("/admin/staff/add/step-2");
  };

  const onDeleteConfirmClick = async () => {
    try {
      await staffManager.deleteStaff(
        selectedStaffForDeletion.id,
        onUnauthorized,
      );
      setSelectedStaffForDeletion(null);
      fetchStaffList();
    } catch (error) {
      console.error("Error deleting staff:", error);
      setErrors(error);
    }
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { label: "Staff", href: "/admin/staff", icon: UserIcon },
    { label: "New", icon: PlusIcon },
  ];

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>New Staff Member</h1>
      <p>Step 1 of 7 - Search Results</p>

      {/* Progress Bar */}
      <ProgressBar value={14} max={100} color="green" />

      {/* Main Content */}
      <Card>
        <h2>Search Results</h2>

        {/* Filters */}
        <div>
          <h3>Filtering & Sorting</h3>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={STAFF_STATUS_FILTER_OPTIONS}
          />

          <Select
            label="Type"
            value={typeOf}
            onChange={(e) => setTypeOf(parseInt(e.target.value))}
            options={STAFF_TYPE_FILTER_OPTIONS}
          />

          <Select
            label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={STAFF_SORT_OPTIONS}
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <Loading text="Loading staff..." />
        ) : (
          <>
            {errors.message && <Alert type="error">{errors.message}</Alert>}

            {staffList && staffList.results && staffList.results.length > 0 ? (
              <div>
                {/* Staff Cards Grid */}
                <div>
                  {staffList.results.map((staff) => (
                    <div key={staff.id}>
                      <Card>
                        <h3>
                          {staff.type === COMMERCIAL_STAFF_TYPE_OF_ID && (
                            <>
                              <BuildingOfficeIcon />
                              {staff.organizationName}
                            </>
                          )}
                          {staff.type === RESIDENTIAL_STAFF_TYPE_OF_ID && (
                            <>
                              <HomeIcon />
                              {staff.firstName} {staff.lastName}
                            </>
                          )}
                        </h3>
                        <p>{staff.addressLine1}</p>
                        <p>
                          {staff.city}, {staff.region}
                        </p>
                        <p>{staff.phone}</p>
                        <p>{staff.email}</p>
                        <Link to={`/admin/staff/${staff.id}`}>
                          Select <ArrowRightIcon />
                        </Link>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div>
                  <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    options={PAGE_SIZE_OPTIONS}
                  />

                  {currentPage > 1 && (
                    <Button onClick={() => setCurrentPage(currentPage - 1)}>
                      Previous
                    </Button>
                  )}

                  {staffList.hasNextPage && (
                    <Button onClick={() => setCurrentPage(currentPage + 1)}>
                      Next
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p>No staff found.</p>
                <Link to="/admin/staff/add/step-1-search">
                  Click here to search again
                </Link>
              </div>
            )}

            <div>
              <p>- OR -</p>

              <Link to="/admin/staff/add/step-1-search">
                <ArrowLeftIcon /> Search Again
              </Link>

              <Button variant="success" onClick={onAddStaffClick}>
                <PlusIcon /> Add New Staff Member
              </Button>
            </div>
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!selectedStaffForDeletion}
        onClose={() => setSelectedStaffForDeletion(null)}
        title="Are you sure?"
      >
        <p>
          You are about to archive this staff member. This action can be undone
          but you'll need to contact the system administrator. Are you sure?
        </p>
        <Button variant="success" onClick={onDeleteConfirmClick}>
          Confirm
        </Button>
        <Button
          variant="secondary"
          onClick={() => setSelectedStaffForDeletion(null)}
        >
          Cancel
        </Button>
      </Modal>
    </div>
  );
}

export default AdminStaffAddStep1PartBPage;
