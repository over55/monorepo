// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
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

    // Set the type and country
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
    <div>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>New Staff Member</h1>
      <p>Step 2 of 7 - Select Staff Type</p>

      {/* Progress Bar */}
      <ProgressBar value={29} max={100} color="green" />

      {/* Main Content */}
      <Card>
        <h2>Select Staff Type:</h2>
        <p>Please select the type of staff member you are adding.</p>

        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <div>
          {/* Frontline Staff Card */}
          <Card>
            <div>
              <UsersIcon />
              <h3>Frontline Staff</h3>
              <p>
                Add a Frontline Staff member who works directly with customers
                and handles day-to-day operations.
              </p>
              <Button
                variant="primary"
                onClick={() => onSelectType(STAFF_TYPE_FRONTLINE)}
                icon={ArrowRightIcon}
              >
                Select Frontline Staff
              </Button>
            </div>
          </Card>

          {/* Management Staff Card */}
          <Card>
            <div>
              <CogIcon />
              <h3>Management Staff</h3>
              <p>
                Add a Management Staff member who oversees operations and makes
                strategic decisions.
              </p>
              <Button
                variant="primary"
                onClick={() => onSelectType(STAFF_TYPE_MANAGEMENT)}
                icon={ArrowRightIcon}
              >
                Select Management Staff
              </Button>
            </div>
          </Card>
        </div>

        <div>
          <Button
            variant="secondary"
            onClick={() => setShowCancelWarning(true)}
            icon={XCircleIcon}
          >
            Cancel
          </Button>
        </div>
      </Card>

      {/* Cancel Warning Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
      >
        <p>
          Your staff record will be cancelled and your work will be lost. This
          cannot be undone. Do you want to continue?
        </p>
        <Button
          variant="success"
          onClick={() => navigate("/admin/staff/add/step-1-search")}
        >
          Yes
        </Button>
        <Button variant="secondary" onClick={() => setShowCancelWarning(false)}>
          No
        </Button>
      </Modal>
    </div>
  );
}

export default AdminStaffAddStep2Page;
