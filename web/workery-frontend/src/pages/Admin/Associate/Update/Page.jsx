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
import {
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
  VehicleTypesMultiSelect,
  ServiceFeeSelect,
  TagsMultiSelect,
  HowHearAboutUsSelect,
} from "../../../../components/Form";

// Constants
const RESIDENTIAL_ASSOCIATE_TYPE_OF_ID = 2;
const COMMERCIAL_ASSOCIATE_TYPE_OF_ID = 3;

const ASSOCIATE_TYPE_OPTIONS = [
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

const ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

const PHONE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Landline" },
  { value: 2, label: "Mobile" },
  { value: 3, label: "Work" },
];

const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Transgender" },
  { value: 5, label: "Non-Binary" },
  { value: 6, label: "Two Spirit" },
  { value: 7, label: "Prefer not to say" },
  { value: 8, label: "Do not know" },
];

const JOB_SEEKER_OPTIONS = [
  { value: 1, label: "Yes" },
  { value: 2, label: "No" },
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

const REGION_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "Alberta", label: "Alberta" },
  { value: "British Columbia", label: "British Columbia" },
  { value: "Manitoba", label: "Manitoba" },
  { value: "New Brunswick", label: "New Brunswick" },
  { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
  { value: "Northwest Territories", label: "Northwest Territories" },
  { value: "Nova Scotia", label: "Nova Scotia" },
  { value: "Nunavut", label: "Nunavut" },
  { value: "Ontario", label: "Ontario" },
  { value: "Prince Edward Island", label: "Prince Edward Island" },
  { value: "Quebec", label: "Quebec" },
  { value: "Saskatchewan", label: "Saskatchewan" },
  { value: "Yukon", label: "Yukon" },
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

  // Associate data state - Complete fields based on backend requirements
  const [associateData, setAssociateData] = useState({
    // Basic info
    type: 2,
    organizationName: "",
    organizationType: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    phoneType: 0,
    phoneExtension: "",
    otherPhone: "",
    otherPhoneType: 0,
    otherPhoneExtension: "",
    isOkToText: false,
    isOkToEmail: false,

    // Address
    country: "Canada",
    region: "",
    city: "",
    addressLine1: "",
    addressLine2: "",
    postalCode: "",
    hasShippingAddress: false,
    shippingName: "",
    shippingPhone: "",
    shippingCountry: "Canada",
    shippingRegion: "",
    shippingCity: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingPostalCode: "",

    // Professional info (REQUIRED FIELDS)
    skillSets: [],
    insuranceRequirements: [],
    vehicleTypes: [],
    serviceFeeId: "",
    hourlySalaryDesired: 0,
    limitSpecial: "",
    duesDate: "",
    commercialInsuranceExpiryDate: "",
    autoInsuranceExpiryDate: "",
    wsibNumber: "",
    wsibInsuranceDate: "",
    policeCheck: "",
    taxId: "",
    driversLicenseClass: "",

    // Emergency contact (REQUIRED)
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactTelephone: "",
    emergencyContactAlternativeTelephone: "",

    // Metrics (REQUIRED)
    tags: [],
    howDidYouHearAboutUsID: "",
    isHowDidYouHearAboutUsOther: false,
    howDidYouHearAboutUsOther: "",
    gender: 0,
    genderOther: "",
    birthDate: "",
    joinDate: "",
    additionalComment: "",
    identifyAs: [],

    // Job seeker info
    isJobSeeker: 2,
    statusInCountry: 0,
    statusInCountryOther: "",
    countryOfOrigin: "",
    dateOfEntryIntoCountry: "",
    maritalStatus: 0,
    maritalStatusOther: "",
    accomplishedEducation: 0,
    accomplishedEducationOther: "",

    // System
    description: "",
    preferredLanguage: "English",
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

            // Format dates properly for HTML date inputs
            const formatDateForInput = (dateValue) => {
              if (!dateValue) return "";
              try {
                const date = new Date(dateValue);
                if (isNaN(date.getTime())) return "";
                return date.toISOString().split("T")[0];
              } catch (e) {
                return "";
              }
            };

            // Map the API response to our form state
            setAssociateData({
              type: data.type || 2,
              organizationName: data.organizationName || "",
              organizationType: data.organizationType || 0,
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: data.email || "",
              phone: data.phone || "",
              phoneType: data.phoneType || 0,
              phoneExtension: data.phoneExtension || "",
              otherPhone: data.otherPhone || "",
              otherPhoneType: data.otherPhoneType || 0,
              otherPhoneExtension: data.otherPhoneExtension || "",
              isOkToText: data.isOkToText || false,
              isOkToEmail: data.isOkToEmail || false,

              country: data.country || "Canada",
              region: data.region || "",
              city: data.city || "",
              addressLine1: data.addressLine1 || "",
              addressLine2: data.addressLine2 || "",
              postalCode: data.postalCode || "",
              hasShippingAddress: data.hasShippingAddress || false,
              shippingName: data.shippingName || "",
              shippingPhone: data.shippingPhone || "",
              shippingCountry: data.shippingCountry || "Canada",
              shippingRegion: data.shippingRegion || "",
              shippingCity: data.shippingCity || "",
              shippingAddressLine1: data.shippingAddressLine1 || "",
              shippingAddressLine2: data.shippingAddressLine2 || "",
              shippingPostalCode: data.shippingPostalCode || "",

              // Extract skill set IDs from the array of objects
              skillSets: data.skillSets
                ? data.skillSets.map((ss) => ss.id)
                : [],

              // Extract insurance requirement IDs
              insuranceRequirements: data.insuranceRequirements
                ? data.insuranceRequirements.map((ir) => ir.id)
                : [],

              // Extract vehicle type IDs
              vehicleTypes: data.vehicleTypes
                ? data.vehicleTypes.map((vt) => vt.id)
                : [],

              // Extract tag IDs
              tags: data.tags ? data.tags.map((tag) => tag.id) : [],

              serviceFeeId: data.serviceFeeId || "",
              hourlySalaryDesired: data.hourlySalaryDesired || 0,
              limitSpecial: data.limitSpecial || "",
              duesDate: formatDateForInput(data.duesDate),
              commercialInsuranceExpiryDate: formatDateForInput(
                data.commercialInsuranceExpiryDate,
              ),
              autoInsuranceExpiryDate: formatDateForInput(
                data.autoInsuranceExpiryDate,
              ),
              wsibNumber: data.wsibNumber || "",
              wsibInsuranceDate: formatDateForInput(data.wsibInsuranceDate),
              policeCheck: formatDateForInput(data.policeCheck),
              taxId: data.taxId || "",
              driversLicenseClass: data.driversLicenseClass || "",

              emergencyContactName: data.emergencyContactName || "",
              emergencyContactRelationship:
                data.emergencyContactRelationship || "",
              emergencyContactTelephone: data.emergencyContactTelephone || "",
              emergencyContactAlternativeTelephone:
                data.emergencyContactAlternativeTelephone || "",

              howDidYouHearAboutUsID: data.howDidYouHearAboutUsID || "",
              isHowDidYouHearAboutUsOther:
                data.isHowDidYouHearAboutUsOther || false,
              howDidYouHearAboutUsOther: data.howDidYouHearAboutUsOther || "",
              gender: data.gender || 0,
              genderOther: data.genderOther || "",
              birthDate: formatDateForInput(data.birthDate),
              joinDate: formatDateForInput(data.joinDate),
              additionalComment: data.additionalComment || "",
              identifyAs: data.identifyAs || [],

              isJobSeeker: data.isJobSeeker || 2,
              statusInCountry: data.statusInCountry || 0,
              statusInCountryOther: data.statusInCountryOther || "",
              countryOfOrigin: data.countryOfOrigin || "",
              dateOfEntryIntoCountry: formatDateForInput(
                data.dateOfEntryIntoCountry,
              ),
              maritalStatus: data.maritalStatus || 0,
              maritalStatusOther: data.maritalStatusOther || "",
              accomplishedEducation: data.accomplishedEducation || 0,
              accomplishedEducationOther: data.accomplishedEducationOther || "",

              description: data.description || "",
              preferredLanguage: data.preferredLanguage || "English",
            });

            setIsLoading(false);
          }
        },
        (error) => {
          if (mounted) {
            console.error("Failed to load associate detail:", error);
            setAlert({
              type: "error",
              message: "Failed to load associate details. Please try again.",
            });
            setIsLoading(false);
          }
        },
        () => {},
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

    // Professional fields validation
    if (!associateData.skillSets || associateData.skillSets.length === 0) {
      newErrors.skillSets = "At least one skill set is required";
    }
    if (
      !associateData.insuranceRequirements ||
      associateData.insuranceRequirements.length === 0
    ) {
      newErrors.insuranceRequirements =
        "At least one insurance requirement is required";
    }
    if (!associateData.serviceFeeId) {
      newErrors.serviceFeeId = "Service fee is required";
    }
    if (!associateData.duesDate) {
      newErrors.duesDate = "Member dues date is required";
    }
    if (!associateData.policeCheck) {
      newErrors.policeCheck = "Police check date is required";
    }
    if (!associateData.commercialInsuranceExpiryDate) {
      newErrors.commercialInsuranceExpiryDate =
        "Commercial insurance expiry date is required";
    }

    // Emergency contact validation
    if (!associateData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
    }
    if (!associateData.emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship =
        "Emergency contact relationship is required";
    }
    if (!associateData.emergencyContactTelephone.trim()) {
      newErrors.emergencyContactTelephone =
        "Emergency contact telephone is required";
    }

    // Metrics validation
    if (!associateData.howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID =
        "How did you hear about us is required";
    }
    if (
      associateData.isHowDidYouHearAboutUsOther &&
      !associateData.howDidYouHearAboutUsOther.trim()
    ) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
    }
    if (!associateData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (associateData.gender === 1 && !associateData.genderOther.trim()) {
      newErrors.genderOther = "Please specify other gender";
    }
    if (!associateData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }
    if (!associateData.preferredLanguage) {
      newErrors.preferredLanguage = "Preferred language is required";
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
      window.scrollTo(0, 0);
      return;
    }

    setIsSaving(true);
    setErrors({});

    // Format dates for API submission (convert to ISO strings)
    const formatDateForAPI = (dateValue) => {
      if (!dateValue) return "";
      try {
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return "";
        return date.toISOString();
      } catch (e) {
        return "";
      }
    };

    // Prepare data for submission
    const submitData = {
      id: aid,
      ...associateData,
      // Convert numeric fields
      type: parseInt(associateData.type),
      organizationType: associateData.organizationType
        ? parseInt(associateData.organizationType)
        : 0,
      phoneType: associateData.phoneType
        ? parseInt(associateData.phoneType)
        : 0,
      otherPhoneType: associateData.otherPhoneType
        ? parseInt(associateData.otherPhoneType)
        : 0,
      hourlySalaryDesired: associateData.hourlySalaryDesired
        ? parseInt(associateData.hourlySalaryDesired)
        : 0,
      isJobSeeker: associateData.isJobSeeker
        ? parseInt(associateData.isJobSeeker)
        : 2,
      gender: associateData.gender ? parseInt(associateData.gender) : 0,

      // Format dates for API
      birthDate: formatDateForAPI(associateData.birthDate),
      joinDate: formatDateForAPI(associateData.joinDate),
      duesDate: formatDateForAPI(associateData.duesDate),
      commercialInsuranceExpiryDate: formatDateForAPI(
        associateData.commercialInsuranceExpiryDate,
      ),
      autoInsuranceExpiryDate: formatDateForAPI(
        associateData.autoInsuranceExpiryDate,
      ),
      wsibInsuranceDate: formatDateForAPI(associateData.wsibInsuranceDate),
      policeCheck: formatDateForAPI(associateData.policeCheck),
      dateOfEntryIntoCountry: formatDateForAPI(
        associateData.dateOfEntryIntoCountry,
      ),

      // Ensure arrays are properly formatted (they should already be arrays of IDs)
      skillSets: associateData.skillSets || [],
      insuranceRequirements: associateData.insuranceRequirements || [],
      vehicleTypes: associateData.vehicleTypes || [],
      tags: associateData.tags || [],
      identifyAs: associateData.identifyAs || [],
    };

    // Handle optional numeric fields
    if (associateData.statusInCountry) {
      submitData.statusInCountry = parseInt(associateData.statusInCountry);
    }
    if (associateData.maritalStatus) {
      submitData.maritalStatus = parseInt(associateData.maritalStatus);
    }
    if (associateData.accomplishedEducation) {
      submitData.accomplishedEducation = parseInt(
        associateData.accomplishedEducation,
      );
    }

    console.log("Submitting update data:", submitData);

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
        window.scrollTo(0, 0);
      },
      () => {
        setIsSaving(false);
      },
      onUnauthorized,
    );
  };

  const handleHowHearChange = (value) => {
    handleInputChange("howDidYouHearAboutUsID", value);
  };

  const handleHowHearOtherDetected = (isOther) => {
    handleInputChange("isHowDidYouHearAboutUsOther", isOther);
    if (!isOther) {
      handleInputChange("howDidYouHearAboutUsOther", "");
    }
  };

  const handleServiceFeeChange = (value) => {
    handleInputChange("serviceFeeId", value);
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
              onChange={(e) =>
                handleInputChange("type", parseInt(e.target.value))
              }
              options={ASSOCIATE_TYPE_OPTIONS}
              error={errors.type}
              required
            />
          </div>

          {/* Contact Information Section */}
          <div style={globalStyles.section}>
            <h3>Contact Information</h3>

            {/* Organization fields for commercial associates */}
            {associateData.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
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
                    handleInputChange(
                      "organizationType",
                      parseInt(e.target.value),
                    )
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
                onChange={(e) =>
                  handleInputChange("phoneType", parseInt(e.target.value))
                }
                options={PHONE_TYPE_OPTIONS}
                error={errors.phoneType}
              />
            </div>

            {associateData.phoneType === 3 && (
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
                  handleInputChange("otherPhoneType", parseInt(e.target.value))
                }
                options={PHONE_TYPE_OPTIONS}
                error={errors.otherPhoneType}
              />
            </div>

            {associateData.otherPhoneType === 3 && (
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

                <Select
                  label="Province/Territory"
                  value={associateData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  options={REGION_OPTIONS}
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

                  <Select
                    label="Province/Territory"
                    value={associateData.shippingRegion}
                    onChange={(e) =>
                      handleInputChange("shippingRegion", e.target.value)
                    }
                    options={REGION_OPTIONS}
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

            {/* Skill Sets */}
            <SkillSetsMultiSelect
              value={associateData.skillSets}
              onChange={(value) => handleInputChange("skillSets", value)}
              error={errors.skillSets}
              required={true}
              label="Skill Sets"
              helperText="Select all skill sets that apply to this associate"
              onUnauthorized={onUnauthorized}
            />

            {/* Insurance Requirements */}
            <InsuranceRequirementsMultiSelect
              value={associateData.insuranceRequirements}
              onChange={(value) =>
                handleInputChange("insuranceRequirements", value)
              }
              error={errors.insuranceRequirements}
              required={true}
              label="Insurance Requirements"
              helperText="Select all insurance requirements for this associate"
              onUnauthorized={onUnauthorized}
            />

            {/* Vehicle Types */}
            <VehicleTypesMultiSelect
              value={associateData.vehicleTypes}
              onChange={(value) => handleInputChange("vehicleTypes", value)}
              error={errors.vehicleTypes}
              required={false}
              label="Vehicle Types (Optional)"
              helperText="Select all vehicle types the associate has access to"
              onUnauthorized={onUnauthorized}
            />

            {/* Service Fee */}
            <ServiceFeeSelect
              value={associateData.serviceFeeId}
              onChange={handleServiceFeeChange}
              error={errors.serviceFeeId}
              required={true}
              label="Service Fee"
              helperText="Select the applicable service fee for this associate"
              onUnauthorized={onUnauthorized}
            />

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
              label="Member Dues Date"
              type="date"
              value={associateData.duesDate}
              onChange={(e) => handleInputChange("duesDate", e.target.value)}
              error={errors.duesDate}
              required
            />

            <Input
              label="Police Check Expiry"
              type="date"
              value={associateData.policeCheck}
              onChange={(e) => handleInputChange("policeCheck", e.target.value)}
              error={errors.policeCheck}
              required
            />

            <Input
              label="Commercial Insurance Expiry Date"
              type="date"
              value={associateData.commercialInsuranceExpiryDate}
              onChange={(e) =>
                handleInputChange(
                  "commercialInsuranceExpiryDate",
                  e.target.value,
                )
              }
              error={errors.commercialInsuranceExpiryDate}
              required
            />

            <Input
              label="Auto Insurance Expiry Date (Optional)"
              type="date"
              value={associateData.autoInsuranceExpiryDate}
              onChange={(e) =>
                handleInputChange("autoInsuranceExpiryDate", e.target.value)
              }
              error={errors.autoInsuranceExpiryDate}
            />

            <Input
              label="WSIB # (Optional)"
              value={associateData.wsibNumber}
              onChange={(e) => handleInputChange("wsibNumber", e.target.value)}
              error={errors.wsibNumber}
            />

            <Input
              label="WSIB Insurance Date (Optional)"
              type="date"
              value={associateData.wsibInsuranceDate}
              onChange={(e) =>
                handleInputChange("wsibInsuranceDate", e.target.value)
              }
              error={errors.wsibInsuranceDate}
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
                required
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
                required
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
                required
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
              onChange={(e) =>
                handleInputChange("isJobSeeker", parseInt(e.target.value))
              }
              options={JOB_SEEKER_OPTIONS}
              error={errors.isJobSeeker}
            />

            {associateData.isJobSeeker === 1 && (
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
                  label="Date of Entry into Country"
                  type="date"
                  value={associateData.dateOfEntryIntoCountry}
                  onChange={(e) =>
                    handleInputChange("dateOfEntryIntoCountry", e.target.value)
                  }
                  error={errors.dateOfEntryIntoCountry}
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

          {/* Metrics Section */}
          <div style={globalStyles.section}>
            <h3>Metrics</h3>

            {/* Tags */}
            <TagsMultiSelect
              value={associateData.tags}
              onChange={(value) => handleInputChange("tags", value)}
              error={errors.tags}
              required={false}
              label="Tags (Optional)"
              helperText="Select tags to categorize this associate"
              onUnauthorized={onUnauthorized}
            />

            {/* How Did You Hear About Us */}
            <HowHearAboutUsSelect
              value={associateData.howDidYouHearAboutUsID}
              onChange={handleHowHearChange}
              onOtherDetected={handleHowHearOtherDetected}
              error={errors.howDidYouHearAboutUsID}
              required={true}
              helperText="Tell us how you discovered our organization"
              onUnauthorized={onUnauthorized}
            />

            {associateData.isHowDidYouHearAboutUsOther && (
              <Input
                label="How did you hear about us? (Other)"
                value={associateData.howDidYouHearAboutUsOther}
                onChange={(e) =>
                  handleInputChange("howDidYouHearAboutUsOther", e.target.value)
                }
                error={errors.howDidYouHearAboutUsOther}
                required
              />
            )}

            <Select
              label="Gender"
              value={associateData.gender}
              onChange={(e) =>
                handleInputChange("gender", parseInt(e.target.value))
              }
              options={GENDER_OPTIONS}
              error={errors.gender}
              required
            />

            {associateData.gender === 1 && (
              <Input
                label="Gender (Other)"
                value={associateData.genderOther}
                onChange={(e) =>
                  handleInputChange("genderOther", e.target.value)
                }
                error={errors.genderOther}
                required
              />
            )}

            <Input
              label="Birth Date"
              type="date"
              value={associateData.birthDate}
              onChange={(e) => handleInputChange("birthDate", e.target.value)}
              error={errors.birthDate}
              required
            />

            <Input
              label="Join Date"
              type="date"
              value={associateData.joinDate}
              onChange={(e) => handleInputChange("joinDate", e.target.value)}
              error={errors.joinDate}
            />

            <TextArea
              label="Additional Comment (Optional)"
              value={associateData.additionalComment}
              onChange={(e) =>
                handleInputChange("additionalComment", e.target.value)
              }
              error={errors.additionalComment}
              maxLength={638}
              rows={4}
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
              required
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
