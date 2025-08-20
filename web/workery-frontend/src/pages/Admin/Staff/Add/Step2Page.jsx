// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  useStaffAddWizardStorage,
  useAccountManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Breadcrumb,
  Modal,
  ProgressBar,
} from "../../../../components/UI";
import {
  PlusIcon,
  UsersIcon,
  CogIcon,
  ArrowRightIcon,
  XCircleIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import {
  STAFF_TYPE_FRONTLINE,
  STAFF_TYPE_MANAGEMENT,
} from "../../../../constants/Staff";

function AdminStaffAddStep2Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();
  const accountManager = useAccountManager();

  const [errors, setErrors] = useState({});
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const profile = await accountManager.getAccountDetail(onUnauthorized);
      setCurrentUser(profile);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  const onSelectType = (staffType) => {
    const currentState = wizardStorage.getWizardState();
    const updatedState = {
      ...currentState,
      type: staffType,
      country: currentUser?.country || "Canada",
    };
    wizardStorage.saveWizardState(updatedState);
    navigate("/admin/staff/add/step-3");
  };

  const breadcrumbItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { label: "Staff", href: "/admin/staff", icon: UserIcon },
    { label: "New", icon: PlusIcon },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold mb-2">New Staff Member</h1>
      <p className="text-gray-600 mb-4">Step 2 of 7 - Select Staff Type</p>

      <ProgressBar value={29} max={100} color="green" className="mb-6" />

      <Card>
        <h2 className="text-xl font-semibold mb-4">Select Staff Type:</h2>
        <p className="text-gray-600 mb-6">
          Please select the type of staff member you are adding.
        </p>

        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <div className="space-y-4">
          <Card
            className="p-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectType(STAFF_TYPE_FRONTLINE)}
          >
            <div className="flex items-start">
              <UsersIcon className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Frontline Staff</h3>
                <p className="text-gray-600 mb-4">
                  Add a Frontline Staff member who works directly with customers
                  and handles day-to-day operations.
                </p>
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectType(STAFF_TYPE_FRONTLINE);
                  }}
                  icon={ArrowRightIcon}
                >
                  Select Frontline Staff
                </Button>
              </div>
            </div>
          </Card>

          <Card
            className="p-6 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSelectType(STAFF_TYPE_MANAGEMENT)}
          >
            <div className="flex items-start">
              <CogIcon className="h-8 w-8 text-blue-600 mr-4 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Management Staff</h3>
                <p className="text-gray-600 mb-4">
                  Add a Management Staff member who oversees operations and
                  makes strategic decisions.
                </p>
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectType(STAFF_TYPE_MANAGEMENT);
                  }}
                  icon={ArrowRightIcon}
                >
                  Select Management Staff
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 pt-8 border-t">
          <Button
            variant="secondary"
            onClick={() => setShowCancelWarning(true)}
            icon={XCircleIcon}
          >
            Cancel
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
      >
        <p className="mb-4">
          Your staff record will be cancelled and your work will be lost. This
          cannot be undone. Do you want to continue?
        </p>
        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={() => setShowCancelWarning(false)}
          >
            No
          </Button>
          <Button
            variant="success"
            onClick={() => navigate("/admin/staff/add/step-1-search")}
          >
            Yes
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminStaffAddStep2Page;
