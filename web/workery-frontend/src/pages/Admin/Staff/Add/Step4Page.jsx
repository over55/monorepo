// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useStaffAddWizardStorage } from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Input,
  Checkbox,
  Breadcrumb,
  ProgressBar,
} from "../../../../components/UI";
import {
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  MapPinIcon,
  UserIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";

function AdminStaffAddStep4Page() {
  const navigate = useNavigate();
  const wizardStorage = useStaffAddWizardStorage();

  const wizardState = wizardStorage.getWizardState();

  const [errors, setErrors] = useState({});
  const [postalCode, setPostalCode] = useState(wizardState.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(
    wizardState.addressLine1 || "",
  );
  const [addressLine2, setAddressLine2] = useState(
    wizardState.addressLine2 || "",
  );
  const [city, setCity] = useState(wizardState.city || "");
  const [region, setRegion] = useState(wizardState.region || "");
  const [country, setCountry] = useState(wizardState.country || "");
  const [hasShippingAddress, setHasShippingAddress] = useState(
    wizardState.hasShippingAddress || false,
  );
  const [shippingName, setShippingName] = useState(
    wizardState.shippingName || "",
  );
  const [shippingPhone, setShippingPhone] = useState(
    wizardState.shippingPhone || "",
  );
  const [shippingCountry, setShippingCountry] = useState(
    wizardState.shippingCountry || "",
  );
  const [shippingRegion, setShippingRegion] = useState(
    wizardState.shippingRegion || "",
  );
  const [shippingCity, setShippingCity] = useState(
    wizardState.shippingCity || "",
  );
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    wizardState.shippingAddressLine1 || "",
  );
  const [shippingAddressLine2, setShippingAddressLine2] = useState(
    wizardState.shippingAddressLine2 || "",
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    wizardState.shippingPostalCode || "",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onSubmitClick = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!postalCode) {
      newErrors.postalCode = "Postal code is required";
      hasErrors = true;
    }
    if (!addressLine1) {
      newErrors.addressLine1 = "Address is required";
      hasErrors = true;
    }
    if (!city) {
      newErrors.city = "City is required";
      hasErrors = true;
    }
    if (!region) {
      newErrors.region = "Province/Territory is required";
      hasErrors = true;
    }
    if (!country) {
      newErrors.country = "Country is required";
      hasErrors = true;
    }

    if (hasShippingAddress) {
      if (!shippingName) {
        newErrors.shippingName = "Shipping name is required";
        hasErrors = true;
      }
      if (!shippingPhone) {
        newErrors.shippingPhone = "Shipping phone is required";
        hasErrors = true;
      }
      if (!shippingCountry) {
        newErrors.shippingCountry = "Shipping country is required";
        hasErrors = true;
      }
      if (!shippingRegion) {
        newErrors.shippingRegion = "Shipping province/territory is required";
        hasErrors = true;
      }
      if (!shippingCity) {
        newErrors.shippingCity = "Shipping city is required";
        hasErrors = true;
      }
      if (!shippingAddressLine1) {
        newErrors.shippingAddressLine1 = "Shipping address is required";
        hasErrors = true;
      }
      if (!shippingPostalCode) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    wizardStorage.updateWizardState({
      postalCode,
      addressLine1,
      addressLine2,
      city,
      region,
      country,
      hasShippingAddress,
      shippingName,
      shippingPhone,
      shippingCountry,
      shippingRegion,
      shippingCity,
      shippingAddressLine1,
      shippingAddressLine2,
      shippingPostalCode,
    });

    navigate("/admin/staff/add/step-5");
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
      <p className="text-gray-600 mb-4">Step 4 of 7 - Address Information</p>

      <ProgressBar value={57} max={100} color="green" className="mb-6" />

      <Card>
        <div className="flex items-center mb-6">
          <MapPinIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h2 className="text-xl font-semibold">Address Information</h2>
        </div>

        <p className="text-gray-600 mb-6">
          Please fill out all the required fields before submitting this form.
        </p>

        {Object.keys(errors).length > 0 && (
          <Alert type="error">Please correct the errors below.</Alert>
        )}

        <div className="mb-6">
          <Checkbox
            label="Has shipping address different than billing address"
            checked={hasShippingAddress}
            onChange={() => setHasShippingAddress(!hasShippingAddress)}
          />
        </div>

        <div className="space-y-6">
          {hasShippingAddress && (
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Billing Address
            </h3>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              error={errors.country}
              required
            />

            <Input
              label="Province/Territory"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              error={errors.region}
              required
            />

            <Input
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              error={errors.city}
              required
            />

            <Input
              label="Postal Code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              error={errors.postalCode}
              required
            />
          </div>

          <Input
            label="Address Line 1"
            value={addressLine1}
            onChange={(e) => setAddressLine1(e.target.value)}
            error={errors.addressLine1}
            required
          />

          <Input
            label="Address Line 2 (Optional)"
            value={addressLine2}
            onChange={(e) => setAddressLine2(e.target.value)}
          />

          {hasShippingAddress && (
            <>
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-8">
                Shipping Address
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  error={errors.shippingName}
                  helperText="The name to contact for this shipping address"
                  required
                />

                <Input
                  label="Phone"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  error={errors.shippingPhone}
                  helperText="The contact phone number for this shipping address"
                  required
                />

                <Input
                  label="Country"
                  value={shippingCountry}
                  onChange={(e) => setShippingCountry(e.target.value)}
                  error={errors.shippingCountry}
                  required
                />

                <Input
                  label="Province/Territory"
                  value={shippingRegion}
                  onChange={(e) => setShippingRegion(e.target.value)}
                  error={errors.shippingRegion}
                  required
                />

                <Input
                  label="City"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  error={errors.shippingCity}
                  required
                />

                <Input
                  label="Postal Code"
                  value={shippingPostalCode}
                  onChange={(e) => setShippingPostalCode(e.target.value)}
                  error={errors.shippingPostalCode}
                  required
                />
              </div>

              <Input
                label="Address Line 1"
                value={shippingAddressLine1}
                onChange={(e) => setShippingAddressLine1(e.target.value)}
                error={errors.shippingAddressLine1}
                required
              />

              <Input
                label="Address Line 2 (Optional)"
                value={shippingAddressLine2}
                onChange={(e) => setShippingAddressLine2(e.target.value)}
              />
            </>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t">
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/staff/add/step-3")}
            icon={ArrowLeftIcon}
          >
            Back
          </Button>

          <Button
            variant="primary"
            onClick={onSubmitClick}
            icon={ArrowRightIcon}
          >
            Next
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminStaffAddStep4Page;
