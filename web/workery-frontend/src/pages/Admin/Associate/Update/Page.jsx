// File Path: monorepo/web/workery-frontend/src/pages/Admin/Associate/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAssociateManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
  FormGroup,
} from "../../../../components/UI";

// Constants (these would typically be imported from constants files)
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

const ASSOCIATE_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: RESIDENTIAL_ASSOCIATE_TYPE_OF_ID, label: "Residential" },
  { value: COMMERCIAL_ASSOCIATE_TYPE_OF_ID, label: "Business" },
];

const ORGANIZATION_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Private Corporation" },
  { value: 2, label: "Non-Profit Corporation" },
  { value: 3, label: "Partnership" },
  { value: 4, label: "Sole Proprietorship" },
  { value: 5, label: "Other" },
];

const PHONE_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Work" },
  { value: 2, label: "Home" },
  { value: 3, label: "Mobile" },
  { value: 4, label: "Other" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Prefer not to say" },
];

const JOB_SEEKER_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

const LANGUAGE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

function AdminAssociateUpdatePage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const associateManager = useAssociateManager();
  const authManager = useAuthManager();

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  // Associate data state
  const [associateData, setAssociateData] = useState({
    // Basic info
    type: "",
    organizationName: "",
    organizationType: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneType: "",
    phoneExtension: "",
    otherPhone: "",
    otherPhoneType: "",
    otherPhoneExtension: "",
    isOkToText: false,
    isOkToEmail: false,

    // Address
    country: "CA",
    region: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    hasShippingAddress: false,
    shippingName: "",
    shippingPhone: "",
    shippingCountry: "CA",
    shippingRegion: "",
    shippingCity: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingPostalCode: "",

    // Professional info
    skillSets: [],
    insuranceRequirements: [],
    hourlySalaryDesired: "",
    limitSpecial: "",
    duesDate: "",
    commercialInsuranceExpiryDate: "",
    autoInsuranceExpiryDate: "",
    wsibNumber: "",
    wsibInsuranceDate: "",
    policeCheck: "",
    taxId: "",
    driversLicenseClass: "",
    vehicleTypes: [],
    serviceFeeId: "",
    isServiceFeeOther: false,

    // Emergency contact
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactTelephone: "",
    emergencyContactAlternativeTelephone: "",

    // Job seeker info
    isJobSeeker: "",
    statusInCountry: "",
    statusInCountryOther: "",
    countryOfOrigin: "",
    dateOfEntryIntoCountry: "",
    maritalStatus: "",
    maritalStatusOther: "",
    accomplishedEducation: "",
    accomplishedEducationOther: "",

    // Metrics
    tags: [],
    howDidYouHearAboutUsID: "",
    isHowDidYouHearAboutUsOther: false,
    howDidYouHearAboutUsOther: "",
    gender: "",
    genderOther: "",
    birthDate: "",
    joinDate: "",
    identifyAs: [],

    // System
    description: "",
    preferredLanguage: "",
  });

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchAssociateDetail = () => {
      if (!aid) {
        setAlert({ type: "error", message: "Invalid associate ID" });
        setIsLoading(false);
        return;
      }

      associateManager.getAssociateDetailWithCallbacks(
        aid,
        (data) => {
          if (mounted) {
            console.log("Associate detail loaded:", data);

            // Map the API response to our form state
            setAssociateData((prevData) => ({
              ...prevData,
              type: data.type || "",
              organizationName: data.organizationName || "",
              organizationType: data.organizationType || "",
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              phoneType: data.phoneType || "",
              phoneExtension: data.phoneExtension || "",
              otherPhone: data.otherPhone || "",
              otherPhoneType: data.otherPhoneType || "",
              otherPhoneExtension: data.otherPhoneExtension || "",
              isOkToText: data.isOkToText || false,
              isOkToEmail: data.isOkToEmail || false,

              country: data.country || "CA",
              region: data.region || "",
              city: data.city || "",
              addressLine1: data.addressLine1 || "",
              addressLine2: data.addressLine2 || "",
              postalCode: data.postalCode || "",
              hasShippingAddress: data.hasShippingAddress || false,
              shippingName: data.shippingName || "",
              shippingPhone: data.shippingPhone || "",
              shippingCountry: data.shippingCountry || "CA",
              shippingRegion: data.shippingRegion || "",
              shippingCity: data.shippingCity || "",
              shippingAddressLine1: data.shippingAddressLine1 || "",
              shippingAddressLine2: data.shippingAddressLine2 || "",
              shippingPostalCode: data.shippingPostalCode || "",

              hourlySalaryDesired: data.hourlySalaryDesired || "",
              limitSpecial: data.limitSpecial || "",
              duesDate: data.duesDate || "",
              commercialInsuranceExpiryDate:
                data.commercialInsuranceExpiryDate || "",
              autoInsuranceExpiryDate: data.autoInsuranceExpiryDate || "",
              wsibNumber: data.wsibNumber || "",
              wsibInsuranceDate: data.wsibInsuranceDate || "",
              policeCheck: data.policeCheck || "",
              taxId: data.taxId || "",
              driversLicenseClass: data.driversLicenseClass || "",
              serviceFeeId: data.serviceFeeId || "",
              isServiceFeeOther: data.isServiceFeeOther || false,

              emergencyContactName: data.emergencyContactName || "",
              emergencyContactRelationship:
                data.emergencyContactRelationship || "",
              emergencyContactTelephone: data.emergencyContactTelephone || "",
              emergencyContactAlternativeTelephone:
                data.emergencyContactAlternativeTelephone || "",

              isJobSeeker: data.isJobSeeker || "",
              statusInCountry: data.statusInCountry || "",
              statusInCountryOther: data.statusInCountryOther || "",
              countryOfOrigin: data.countryOfOrigin || "",
              dateOfEntryIntoCountry: data.dateOfEntryIntoCountry || "",
              maritalStatus: data.maritalStatus || "",
              maritalStatusOther: data.maritalStatusOther || "",
              accomplishedEducation: data.accomplishedEducation || "",
              accomplishedEducationOther: data.accomplishedEducationOther || "",

              howDidYouHearAboutUsID: data.howDidYouHearAboutUsID || "",
              isHowDidYouHearAboutUsOther:
                data.isHowDidYouHearAboutUsOther || false,
              howDidYouHearAboutUsOther: data.howDidYouHearAboutUsOther || "",
              gender: data.gender || "",
              genderOther: data.genderOther || "",
              birthDate: data.birthDate || "",
              joinDate: data.joinDate || "",

              description: data.description || "",
              preferredLanguage: data.preferredLanguage || "",
            }));
          }
        },
        (error) => {
          if (mounted) {
            console.error("Failed to load associate detail:", error);
            setAlert({
              type: "error",
              message: "Failed to load associate details. Please try again.",
            });
          }
        },
        () => {
          if (mounted) {
            setIsLoading(false);
          }
        },
        onUnauthorized,
      );
    };

    fetchAssociateDetail();

    return () => {
      mounted = false;
    };
  }, [aid, associateManager, navigate]);

  const handleInputChange = (field, value) => {
    setAssociateData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleCheckboxChange = (field) => {
    setAssociateData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!associateData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!associateData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!associateData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(associateData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!associateData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    if (!associateData.type) {
      newErrors.type = "Associate type is required";
    }

    // Commercial associate validation
    if (associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      if (!associateData.organizationName.trim()) {
        newErrors.organizationName =
          "Organization name is required for business associates";
      }
      if (!associateData.organizationType) {
        newErrors.organizationType =
          "Organization type is required for business associates";
      }
    }

    // Address validation
    if (!associateData.country) {
      newErrors.country = "Country is required";
    }

    if (!associateData.region.trim()) {
      newErrors.region = "Province/Territory is required";
    }

    if (!associateData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!associateData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }

    if (!associateData.postalCode.trim()) {
      newErrors.postalCode = "Postal code is required";
    }

    // Shipping address validation if enabled
    if (associateData.hasShippingAddress) {
      if (!associateData.shippingName.trim()) {
        newErrors.shippingName = "Shipping name is required";
      }
      if (!associateData.shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
      }
      if (!associateData.shippingCountry) {
        newErrors.shippingCountry = "Shipping country is required";
      }
      if (!associateData.shippingRegion.trim()) {
        newErrors.shippingRegion = "Shipping province/territory is required";
      }
      if (!associateData.shippingCity.trim()) {
        newErrors.shippingCity = "Shipping city is required";
      }
      if (!associateData.shippingAddressLine1.trim()) {
        newErrors.shippingAddressLine1 = "Shipping address line 1 is required";
      }
      if (!associateData.shippingPostalCode.trim()) {
        newErrors.shippingPostalCode = "Shipping postal code is required";
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setAlert({
        type: "error",
        message: "Please correct the errors below before submitting.",
      });
      return;
    }

    setIsSaving(true);
    setErrors({});

    // Prepare data for submission
    const submitData = {
      id: aid,
      ...associateData,
      // Convert string numbers to integers where needed
      type: parseInt(associateData.type),
      organizationType: associateData.organizationType
        ? parseInt(associateData.organizationType)
        : undefined,
      phoneType: associateData.phoneType
        ? parseInt(associateData.phoneType)
        : undefined,
      otherPhoneType: associateData.otherPhoneType
        ? parseInt(associateData.otherPhoneType)
        : undefined,
      hourlySalaryDesired: associateData.hourlySalaryDesired
        ? parseInt(associateData.hourlySalaryDesired)
        : undefined,
      isJobSeeker: associateData.isJobSeeker
        ? parseInt(associateData.isJobSeeker)
        : undefined,
      statusInCountry: associateData.statusInCountry
        ? parseInt(associateData.statusInCountry)
        : undefined,
      maritalStatus: associateData.maritalStatus
        ? parseInt(associateData.maritalStatus)
        : undefined,
      accomplishedEducation: associateData.accomplishedEducation
        ? parseInt(associateData.accomplishedEducation)
        : undefined,
      gender: associateData.gender ? parseInt(associateData.gender) : undefined,
    };

    associateManager.updateAssociateWithCallbacks(
      aid,
      submitData,
      (data) => {
        console.log("Associate updated successfully:", data);
        setAlert({
          type: "success",
          message: "Associate updated successfully!",
        });

        // Redirect to detail page after a short delay
        setTimeout(() => {
          navigate(`/admin/associate/${aid}`);
        }, 2000);
      },
      (error) => {
        console.error("Failed to update associate:", error);
        setErrors(error || {});
        setAlert({
          type: "error",
          message:
            "Failed to update associate. Please check the form and try again.",
        });
      },
      () => {
        setIsSaving(false);
      },
      onUnauthorized,
    );
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Associates", path: "/admin/associates", icon: "👷" },
    { label: "Detail", path: `/admin/associate/${aid}`, icon: "ℹ️" },
    { label: "Update", icon: "✏️" },
  ];

  if (isLoading) {
    return <Loading message="Loading associate details..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <Card
        title="Update Associate"
        actions={
          <Link to={`/admin/associate/${aid}`}>
            <Button variant="outline">← Back to Detail</Button>
          </Link>
        }
      >
        {alert && (
          <Alert type={alert.type} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Associate Type Section */}
          <div style={globalStyles.section}>
            <h3>Settings</h3>
            <Select
              label="Associate Type"
              value={associateData.type}
              onChange={(e) => handleInputChange("type", e.target.value)}
              options={ASSOCIATE_TYPE_OPTIONS}
              error={errors.type}
              required
            />
          </div>

          {/* Contact Information Section */}
          <div style={globalStyles.section}>
            <h3>Contact Information</h3>

            {/* Organization fields for commercial associates */}
            {associateData.type == COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
              <FormGroup>
                <Input
                  label="Organization Name"
                  value={associateData.organizationName}
                  onChange={(e) =>
                    handleInputChange("organizationName", e.target.value)
                  }
                  error={errors.organizationName}
                  required
                />

                <Select
                  label="Organization Type"
                  value={associateData.organizationType}
                  onChange={(e) =>
                    handleInputChange("organizationType", e.target.value)
                  }
                  options={ORGANIZATION_TYPE_OPTIONS}
                  error={errors.organizationType}
                  required
                />
              </FormGroup>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="First Name"
                value={associateData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                value={associateData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={associateData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
              required
            />

            <FormGroup>
              <label style={globalStyles.label}>
                <input
                  type="checkbox"
                  checked={associateData.isOkToEmail}
                  onChange={() => handleCheckboxChange("isOkToEmail")}
                  style={{ marginRight: "8px" }}
                />
                I agree to receive electronic email
              </label>
            </FormGroup>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Phone"
                value={associateData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                required
              />

              <Select
                label="Phone Type"
                value={associateData.phoneType}
                onChange={(e) => handleInputChange("phoneType", e.target.value)}
                options={PHONE_TYPE_OPTIONS}
                error={errors.phoneType}
              />
            </div>

            {associateData.phoneType == 1 && (
              <Input
                label="Phone Extension"
                value={associateData.phoneExtension}
                onChange={(e) =>
                  handleInputChange("phoneExtension", e.target.value)
                }
                error={errors.phoneExtension}
              />
            )}

            <FormGroup>
              <label style={globalStyles.label}>
                <input
                  type="checkbox"
                  checked={associateData.isOkToText}
                  onChange={() => handleCheckboxChange("isOkToText")}
                  style={{ marginRight: "8px" }}
                />
                I agree to receive texts to my phone
              </label>
            </FormGroup>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Other Phone (Optional)"
                value={associateData.otherPhone}
                onChange={(e) =>
                  handleInputChange("otherPhone", e.target.value)
                }
                error={errors.otherPhone}
              />

              <Select
                label="Other Phone Type"
                value={associateData.otherPhoneType}
                onChange={(e) =>
                  handleInputChange("otherPhoneType", e.target.value)
                }
                options={PHONE_TYPE_OPTIONS}
                error={errors.otherPhoneType}
              />
            </div>

            {associateData.otherPhoneType == 1 && (
              <Input
                label="Other Phone Extension"
                value={associateData.otherPhoneExtension}
                onChange={(e) =>
                  handleInputChange("otherPhoneExtension", e.target.value)
                }
                error={errors.otherPhoneExtension}
              />
            )}
          </div>

          {/* Address Section */}
          <div style={globalStyles.section}>
            <h3>Address</h3>

            <FormGroup>
              <label style={globalStyles.label}>
                <input
                  type="checkbox"
                  checked={associateData.hasShippingAddress}
                  onChange={() => handleCheckboxChange("hasShippingAddress")}
                  style={{ marginRight: "8px" }}
                />
                Has shipping address different than billing address
              </label>
            </FormGroup>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: associateData.hasShippingAddress
                  ? "1fr 1fr"
                  : "1fr",
                gap: "40px",
              }}
            >
              {/* Billing Address */}
              <div>
                {associateData.hasShippingAddress && <h4>Billing Address</h4>}

                <Input
                  label="Country"
                  value={associateData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  error={errors.country}
                  required
                />

                <Input
                  label="Province/Territory"
                  value={associateData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  error={errors.region}
                  required
                />

                <Input
                  label="City"
                  value={associateData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  error={errors.city}
                  required
                />

                <Input
                  label="Address Line 1"
                  value={associateData.addressLine1}
                  onChange={(e) =>
                    handleInputChange("addressLine1", e.target.value)
                  }
                  error={errors.addressLine1}
                  required
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={associateData.addressLine2}
                  onChange={(e) =>
                    handleInputChange("addressLine2", e.target.value)
                  }
                  error={errors.addressLine2}
                />

                <Input
                  label="Postal Code"
                  value={associateData.postalCode}
                  onChange={(e) =>
                    handleInputChange("postalCode", e.target.value)
                  }
                  error={errors.postalCode}
                  required
                />
              </div>

              {/* Shipping Address */}
              {associateData.hasShippingAddress && (
                <div>
                  <h4>Shipping Address</h4>

                  <Input
                    label="Name"
                    value={associateData.shippingName}
                    onChange={(e) =>
                      handleInputChange("shippingName", e.target.value)
                    }
                    error={errors.shippingName}
                    required
                  />

                  <Input
                    label="Phone"
                    value={associateData.shippingPhone}
                    onChange={(e) =>
                      handleInputChange("shippingPhone", e.target.value)
                    }
                    error={errors.shippingPhone}
                    required
                  />

                  <Input
                    label="Country"
                    value={associateData.shippingCountry}
                    onChange={(e) =>
                      handleInputChange("shippingCountry", e.target.value)
                    }
                    error={errors.shippingCountry}
                    required
                  />

                  <Input
                    label="Province/Territory"
                    value={associateData.shippingRegion}
                    onChange={(e) =>
                      handleInputChange("shippingRegion", e.target.value)
                    }
                    error={errors.shippingRegion}
                    required
                  />

                  <Input
                    label="City"
                    value={associateData.shippingCity}
                    onChange={(e) =>
                      handleInputChange("shippingCity", e.target.value)
                    }
                    error={errors.shippingCity}
                    required
                  />

                  <Input
                    label="Address Line 1"
                    value={associateData.shippingAddressLine1}
                    onChange={(e) =>
                      handleInputChange("shippingAddressLine1", e.target.value)
                    }
                    error={errors.shippingAddressLine1}
                    required
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={associateData.shippingAddressLine2}
                    onChange={(e) =>
                      handleInputChange("shippingAddressLine2", e.target.value)
                    }
                    error={errors.shippingAddressLine2}
                  />

                  <Input
                    label="Postal Code"
                    value={associateData.shippingPostalCode}
                    onChange={(e) =>
                      handleInputChange("shippingPostalCode", e.target.value)
                    }
                    error={errors.shippingPostalCode}
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Professional Information Section */}
          <div style={globalStyles.section}>
            <h3>Professional Information</h3>

            <Input
              label="Hourly Rate (Optional)"
              type="number"
              value={associateData.hourlySalaryDesired}
              onChange={(e) =>
                handleInputChange("hourlySalaryDesired", e.target.value)
              }
              error={errors.hourlySalaryDesired}
            />

            <TextArea
              label="Limitation or Special Consideration (Optional)"
              value={associateData.limitSpecial}
              onChange={(e) =>
                handleInputChange("limitSpecial", e.target.value)
              }
              error={errors.limitSpecial}
              maxLength={638}
              rows={4}
            />

            <Input
              label="WSIB # (Optional)"
              value={associateData.wsibNumber}
              onChange={(e) => handleInputChange("wsibNumber", e.target.value)}
              error={errors.wsibNumber}
            />

            <Input
              label="HST # (Optional)"
              value={associateData.taxId}
              onChange={(e) => handleInputChange("taxId", e.target.value)}
              error={errors.taxId}
            />

            <Input
              label="Drivers License Class (Optional)"
              value={associateData.driversLicenseClass}
              onChange={(e) =>
                handleInputChange("driversLicenseClass", e.target.value)
              }
              error={errors.driversLicenseClass}
            />
          </div>

          {/* Emergency Contact Section */}
          <div style={globalStyles.section}>
            <h3>Emergency Contact</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Contact Name"
                value={associateData.emergencyContactName}
                onChange={(e) =>
                  handleInputChange("emergencyContactName", e.target.value)
                }
                error={errors.emergencyContactName}
              />

              <Input
                label="Contact Relationship"
                value={associateData.emergencyContactRelationship}
                onChange={(e) =>
                  handleInputChange(
                    "emergencyContactRelationship",
                    e.target.value,
                  )
                }
                error={errors.emergencyContactRelationship}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Contact Telephone"
                value={associateData.emergencyContactTelephone}
                onChange={(e) =>
                  handleInputChange("emergencyContactTelephone", e.target.value)
                }
                error={errors.emergencyContactTelephone}
              />

              <Input
                label="Alternative Telephone (Optional)"
                value={associateData.emergencyContactAlternativeTelephone}
                onChange={(e) =>
                  handleInputChange(
                    "emergencyContactAlternativeTelephone",
                    e.target.value,
                  )
                }
                error={errors.emergencyContactAlternativeTelephone}
              />
            </div>
          </div>

          {/* Job Seeker Section */}
          <div style={globalStyles.section}>
            <h3>Job Seeker Information</h3>

            <Select
              label="Is this Associate also a Job Seeker?"
              value={associateData.isJobSeeker}
              onChange={(e) => handleInputChange("isJobSeeker", e.target.value)}
              options={JOB_SEEKER_OPTIONS}
              error={errors.isJobSeeker}
            />

            {associateData.isJobSeeker == 1 && (
              <div>
                <Input
                  label="Status in Country (Other)"
                  value={associateData.statusInCountryOther}
                  onChange={(e) =>
                    handleInputChange("statusInCountryOther", e.target.value)
                  }
                  error={errors.statusInCountryOther}
                />

                <Input
                  label="Country of Origin"
                  value={associateData.countryOfOrigin}
                  onChange={(e) =>
                    handleInputChange("countryOfOrigin", e.target.value)
                  }
                  error={errors.countryOfOrigin}
                />

                <Input
                  label="Marital Status (Other)"
                  value={associateData.maritalStatusOther}
                  onChange={(e) =>
                    handleInputChange("maritalStatusOther", e.target.value)
                  }
                  error={errors.maritalStatusOther}
                />

                <Input
                  label="Accomplished Education (Other)"
                  value={associateData.accomplishedEducationOther}
                  onChange={(e) =>
                    handleInputChange(
                      "accomplishedEducationOther",
                      e.target.value,
                    )
                  }
                  error={errors.accomplishedEducationOther}
                />
              </div>
            )}
          </div>

          {/* Personal Information Section */}
          <div style={globalStyles.section}>
            <h3>Personal Information</h3>

            <Select
              label="Gender"
              value={associateData.gender}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              options={GENDER_OPTIONS}
              error={errors.gender}
            />

            {associateData.gender == 1 && (
              <Input
                label="Gender (Other)"
                value={associateData.genderOther}
                onChange={(e) =>
                  handleInputChange("genderOther", e.target.value)
                }
                error={errors.genderOther}
              />
            )}

            <Input
              label="Birth Date (Optional)"
              type="date"
              value={associateData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              error={errors.birthDate}
            />
          </div>

          {/* System Information Section */}
          <div style={globalStyles.section}>
            <h3>System Information</h3>

            <TextArea
              label="Description (Optional)"
              value={associateData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              error={errors.description}
              maxLength={638}
              rows={4}
            />

            <Select
              label="Preferred Language"
              value={associateData.preferredLanguage}
              onChange={(e) =>
                handleInputChange("preferredLanguage", e.target.value)
              }
              options={LANGUAGE_OPTIONS}
              error={errors.preferredLanguage}
            />
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid #ddd",
            }}
          >
            <Link to={`/admin/associate/${aid}`}>
              <Button variant="outline" type="button">
                ← Back to Detail
              </Button>
            </Link>

            <Button type="submit" variant="success" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminAssociateUpdatePage;
