// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step1PartAPage.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Input,
  Breadcrumb,
  Modal,
  ProgressBar,
} from "../../../../components/UI";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

function AdminStaffAddStep1PartAPage() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  const [errors, setErrors] = useState({});
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    wizardStorage.clearWizardState();
  }, []);

  const onAddStaffClick = () => {
    wizardStorage.resetWizardState();
    navigate("/admin/staff/add/step-2");
  };

  const onSubmitClick = () => {
    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "Please enter at least one search criterion",
      });
      return;
    }

    const params = new URLSearchParams();
    if (firstName) params.append("fn", firstName);
    if (lastName) params.append("ln", lastName);
    if (email) params.append("e", email);
    if (phone) params.append("p", phone);

    navigate(`/admin/staff/add/step-1-results?${params.toString()}`);
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
      <p className="text-gray-600 mb-4">
        Step 1 of 7 - Search for Existing Staff
      </p>

      <ProgressBar value={14} max={100} color="green" className="mb-6" />

      <Card>
        <h2 className="text-xl font-semibold mb-4">
          Search for existing staff:
        </h2>
        <p className="text-gray-600 mb-6">
          Search the database to check if this staff member already exists
          before creating a new record.
        </p>

        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <div className="space-y-4">
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />

          <div className="flex gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowCancelWarning(true)}
              icon={XCircleIcon}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={onSubmitClick}
              icon={MagnifyingGlassIcon}
            >
              Search
            </Button>
          </div>

          <div className="text-center py-4">
            <p className="text-gray-500">- OR -</p>
          </div>

          <div className="text-center">
            <Button variant="success" onClick={onAddStaffClick} icon={PlusIcon}>
              Add New Staff Member
            </Button>
          </div>
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
          <Button variant="success" onClick={() => navigate("/admin/staff")}>
            Yes
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminStaffAddStep1PartAPage;
