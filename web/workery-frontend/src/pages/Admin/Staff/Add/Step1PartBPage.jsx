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
  ProgressBar,
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

  const firstName = searchParams.get("fn") || "";
  const lastName = searchParams.get("ln") || "";
  const email = searchParams.get("e") || "";
  const phone = searchParams.get("p") || "";

  const [errors, setErrors] = useState({});
  const [staffList, setStaffList] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { label: "Staff", href: "/admin/staff", icon: UserIcon },
    { label: "New", icon: PlusIcon },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold mb-2">New Staff Member</h1>
      <p className="text-gray-600 mb-4">Step 1 of 7 - Search Results</p>

      <ProgressBar value={14} max={100} color="green" className="mb-6" />

      <Card>
        <h2 className="text-xl font-semibold mb-4">Search Results</h2>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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

        {isLoading ? (
          <Loading text="Loading staff..." />
        ) : (
          <>
            {errors.message && <Alert type="error">{errors.message}</Alert>}

            {staffList && staffList.results && staffList.results.length > 0 ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {staffList.results.map((staff) => (
                    <Card key={staff.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            {staff.type === COMMERCIAL_STAFF_TYPE_OF_ID ? (
                              <>
                                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-600" />
                                <h3 className="font-semibold">
                                  {staff.organizationName}
                                </h3>
                              </>
                            ) : (
                              <>
                                <HomeIcon className="h-5 w-5 mr-2 text-gray-600" />
                                <h3 className="font-semibold">
                                  {staff.firstName} {staff.lastName}
                                </h3>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {staff.addressLine1}
                          </p>
                          <p className="text-sm text-gray-600">
                            {staff.city}, {staff.region}
                          </p>
                          <p className="text-sm text-gray-600">{staff.phone}</p>
                          <p className="text-sm text-gray-600">{staff.email}</p>
                        </div>
                        <Link
                          to={`/admin/staff/${staff.id}`}
                          className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                          Select
                          <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <Select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    options={PAGE_SIZE_OPTIONS}
                  />

                  <div className="flex gap-2">
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
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No staff found.</p>
                <Link
                  to="/admin/staff/add/step-1-search"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Click here to search again
                </Link>
              </div>
            )}

            <div className="mt-8 pt-8 border-t">
              <p className="text-center text-gray-500 mb-4">- OR -</p>

              <div className="flex gap-3 justify-center">
                <Link
                  to="/admin/staff/add/step-1-search"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Search Again
                </Link>

                <Button variant="success" onClick={onAddStaffClick}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add New Staff Member
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminStaffAddStep1PartBPage;
