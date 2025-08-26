// File Path: web/workery-frontend/src/pages/Admin/Staff/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  ExclamationCircleIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import {
  useStaffManager,
  useHowHearAboutUsItemManager,
} from "../../../../services/Services";
import {
  TagsMultiSelect,
  VehicleTypesMultiSelect,
  HowHearAboutUsSelect,
  SkillSetsMultiSelect,
  InsuranceRequirementsMultiSelect,
} from "../../../../components/business/selects";
import {
  STAFF_TYPE_EXECUTIVE,
  STAFF_TYPE_MANAGEMENT,
  STAFF_TYPE_FRONTLINE,
  STAFF_PHONE_TYPE_OF_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";
import {
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import { DateInput, Input, Select, Checkbox } from "../../../../components/UI";

const STAFF_TYPE_OPTIONS = [
  { value: STAFF_TYPE_EXECUTIVE, label: "Executive" },
  { value: STAFF_TYPE_MANAGEMENT, label: "Management" },
  { value: STAFF_TYPE_FRONTLINE, label: "Frontline" },
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

// Helper function to format errors for display
const formatErrorsForAlert = (errors) => {
  if (!errors || typeof errors !== "object") {
    return null;
  }

  const errorList = [];
  for (const [field, message] of Object.entries(errors)) {
    if (message && field !== "general") {
      const fieldName = field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase())
        .trim();
      errorList.push(`• ${fieldName}: ${message}`);
    }
  }

  return errorList.length > 0 ? errorList : null;
};

// Section Component with Dark Header - Matching Customer Update style
const FormSection = ({ title, icon: Icon, children }) => (
  <div className="bg-gray-700 rounded-lg shadow-sm mb-4 sm:mb-6">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
      <h3 className="text-base sm:text-lg font-semibold text-white flex items-center">
        <Icon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 text-blue-300 flex-shrink-0" />
        <span className="truncate">{title}</span>
      </h3>
    </div>
    <div className="bg-white border-2 border-t-0 border-gray-700 rounded-b-lg p-4 sm:p-6">
      {children}
    </div>
  </div>
);

function AdminStaffUpdatePage() {
  const { aid } = useParams();
  const navigate = useNavigate();
  const staffManager = useStaffManager();

  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffMember, setStaffMember] = useState(null);

  // Form state
  const [staffData, setStaffData] = useState({
    type: STAFF_TYPE_FRONTLINE,
    email: "",
    phone: "",
    phoneType: 0,
    phoneExtension: "",
    firstName: "",
    lastName: "",
    otherPhone: "",
    otherPhoneType: 0,
    otherPhoneExtension: "",
    isOkToText: false,
    isOkToEmail: false,
    postalCode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    region: "",
    country: "Canada",
    hasShippingAddress: false,
    shippingName: "",
    shippingPhone: "",
    shippingCountry: "Canada",
    shippingRegion: "",
    shippingCity: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingPostalCode: "",
    limitSpecial: "",
    policeCheck: "",
    driversLicenseClass: "",
    vehicleTypes: [],
    skillSets: [],
    insuranceRequirements: [],
    emergencyContactName: "",
    emergencyContactRelationship: "",
    emergencyContactTelephone: "",
    emergencyContactAlternativeTelephone: "",
    description: "",
    preferredLanguage: "English",
    tags: [],
    howDidYouHearAboutUsID: "",
    isHowDidYouHearAboutUsOther: false,
    howDidYouHearAboutUsOther: "",
    birthDate: "",
    joinDate: "",
    gender: 0,
    genderOther: "",
    identifyAs: [],
  });

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load staff detail on mount
  useEffect(() => {
    let mounted = true;

    const fetchStaffDetail = async () => {
      if (!aid) {
        setAlert({ type: "error", message: "Invalid staff ID" });
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrors({});

      try {
        const response = await staffManager.getStaffDetail(aid, onUnauthorized);

        if (mounted) {
          setStaffMember(response);

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

          setStaffData({
            type: response.type || STAFF_TYPE_FRONTLINE,
            email: response.email || "",
            phone: response.phone || "",
            phoneType: response.phoneType || 0,
            phoneExtension: response.phoneExtension || "",
            firstName: response.firstName || "",
            lastName: response.lastName || "",
            otherPhone: response.otherPhone || "",
            otherPhoneType: response.otherPhoneType || 0,
            otherPhoneExtension: response.otherPhoneExtension || "",
            isOkToText: response.isOkToText || false,
            isOkToEmail: response.isOkToEmail || false,
            postalCode: response.postalCode || "",
            addressLine1: response.addressLine1 || "",
            addressLine2: response.addressLine2 || "",
            city: response.city || "",
            region: response.region || "",
            country: response.country || "Canada",
            hasShippingAddress: response.hasShippingAddress || false,
            shippingName: response.shippingName || "",
            shippingPhone: response.shippingPhone || "",
            shippingCountry: response.shippingCountry || "Canada",
            shippingRegion: response.shippingRegion || "",
            shippingCity: response.shippingCity || "",
            shippingAddressLine1: response.shippingAddressLine1 || "",
            shippingAddressLine2: response.shippingAddressLine2 || "",
            shippingPostalCode: response.shippingPostalCode || "",
            limitSpecial: response.limitSpecial || "",
            policeCheck: formatDateForInput(response.policeCheck),
            driversLicenseClass: response.driversLicenseClass || "",
            vehicleTypes: response.vehicleTypes
              ? response.vehicleTypes.map((vt) => vt.id || vt)
              : [],
            skillSets: response.skillSets
              ? response.skillSets.map((ss) => ss.id || ss)
              : [],
            insuranceRequirements: response.insuranceRequirements
              ? response.insuranceRequirements.map((ir) => ir.id || ir)
              : [],
            emergencyContactName: response.emergencyContactName || "",
            emergencyContactRelationship:
              response.emergencyContactRelationship || "",
            emergencyContactTelephone: response.emergencyContactTelephone || "",
            emergencyContactAlternativeTelephone:
              response.emergencyContactAlternativeTelephone || "",
            description: response.description || "",
            preferredLanguage: response.preferredLanguage || "English",
            tags: response.tags
              ? response.tags.map((tag) => tag.id || tag)
              : [],
            howDidYouHearAboutUsID: response.howDidYouHearAboutUsID || "",
            isHowDidYouHearAboutUsOther:
              response.isHowDidYouHearAboutUsOther || false,
            howDidYouHearAboutUsOther: response.howDidYouHearAboutUsOther || "",
            birthDate: formatDateForInput(response.birthDate),
            joinDate: formatDateForInput(response.joinDate),
            gender: response.gender || 0,
            genderOther: response.genderOther || "",
            identifyAs: response.identifyAs || [],
          });

          setIsLoading(false);
        }
      } catch (error) {
        if (mounted) {
          console.error("Failed to fetch staff details:", error);
          setAlert({
            type: "error",
            message: "Failed to load staff details. Please try again.",
          });
          setIsLoading(false);
        }
      }
    };

    fetchStaffDetail();

    return () => {
      mounted = false;
    };
  }, [aid, staffManager, navigate]);

  const handleInputChange = (field, value) => {
    setStaffData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleCheckboxChange = (field) => {
    setStaffData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!staffData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!staffData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!staffData.email.trim()) {
      newErrors.email = "Email is required";
    }
    if (!staffData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!staffData.emergencyContactName.trim()) {
      newErrors.emergencyContactName = "Emergency contact name is required";
    }
    if (!staffData.emergencyContactRelationship.trim()) {
      newErrors.emergencyContactRelationship =
        "Emergency contact relationship is required";
    }
    if (!staffData.emergencyContactTelephone.trim()) {
      newErrors.emergencyContactTelephone =
        "Emergency contact telephone is required";
    }

    if (staffData.hasShippingAddress) {
      if (!staffData.shippingName.trim()) {
        newErrors.shippingName = "Shipping name is required";
      }
      if (!staffData.shippingPhone.trim()) {
        newErrors.shippingPhone = "Shipping phone is required";
      }
    }

    if (
      staffData.gender === STAFF_GENDER_OTHER &&
      !staffData.genderOther.trim()
    ) {
      newErrors.genderOther = "Please specify other gender";
    }

    if (
      staffData.isHowDidYouHearAboutUsOther &&
      !staffData.howDidYouHearAboutUsOther.trim()
    ) {
      newErrors.howDidYouHearAboutUsOther = "Please specify other option";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);

      const errorList = formatErrorsForAlert(formErrors);
      if (errorList) {
        setAlert({
          type: "error",
          message: "Please correct the following errors:",
          details: errorList,
        });
      } else {
        setAlert({
          type: "error",
          message: "Please correct the errors in the form before submitting.",
        });
      }

      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    const submitData = {
      id: aid,
      type: parseInt(staffData.type),
      firstName: staffData.firstName,
      lastName: staffData.lastName,
      email: staffData.email,
      phone: staffData.phone,
      phoneType: parseInt(staffData.phoneType),
      phoneExtension: staffData.phoneExtension,
      otherPhone: staffData.otherPhone,
      otherPhoneType: parseInt(staffData.otherPhoneType),
      otherPhoneExtension: staffData.otherPhoneExtension,
      isOkToText: staffData.isOkToText,
      isOkToEmail: staffData.isOkToEmail,
      postalCode: staffData.postalCode,
      addressLine1: staffData.addressLine1,
      addressLine2: staffData.addressLine2,
      city: staffData.city,
      region: staffData.region,
      country: staffData.country,
      hasShippingAddress: staffData.hasShippingAddress,
      shippingName: staffData.shippingName,
      shippingPhone: staffData.shippingPhone,
      shippingCountry: staffData.shippingCountry,
      shippingRegion: staffData.shippingRegion,
      shippingCity: staffData.shippingCity,
      shippingAddressLine1: staffData.shippingAddressLine1,
      shippingAddressLine2: staffData.shippingAddressLine2,
      shippingPostalCode: staffData.shippingPostalCode,
      limitSpecial: staffData.limitSpecial,
      policeCheck: staffData.policeCheck || null,
      driversLicenseClass: staffData.driversLicenseClass,
      vehicleTypes: staffData.vehicleTypes || [],
      skillSets: staffData.skillSets || [],
      insuranceRequirements: staffData.insuranceRequirements || [],
      emergencyContactName: staffData.emergencyContactName,
      emergencyContactRelationship: staffData.emergencyContactRelationship,
      emergencyContactTelephone: staffData.emergencyContactTelephone,
      emergencyContactAlternativeTelephone:
        staffData.emergencyContactAlternativeTelephone,
      description: staffData.description,
      tags: staffData.tags || [],
      gender: parseInt(staffData.gender),
      genderOther: staffData.genderOther,
      joinDate: staffData.joinDate || null,
      birthDate: staffData.birthDate || null,
      howDidYouHearAboutUsID: staffData.howDidYouHearAboutUsID,
      isHowDidYouHearAboutUsOther: staffData.isHowDidYouHearAboutUsOther,
      howDidYouHearAboutUsOther: staffData.howDidYouHearAboutUsOther,
      preferredLanguage: staffData.preferredLanguage,
      identifyAs: staffData.identifyAs.map((id) => parseInt(id)),
    };

    try {
      await staffManager.updateStaff(aid, submitData, onUnauthorized);

      setAlert({
        type: "success",
        message: "Staff member updated successfully!",
      });

      setTimeout(() => {
        navigate(`/admin/staff/${aid}`);
      }, 2000);
    } catch (error) {
      console.error("Failed to update staff:", error);

      if (error && typeof error === "object") {
        const hasFieldErrors = Object.keys(error).some(
          (key) => key !== "message" && key !== "general" && key !== "detail",
        );

        if (hasFieldErrors) {
          setErrors(error);
          const errorList = formatErrorsForAlert(error);

          if (errorList) {
            setAlert({
              type: "error",
              message:
                error.general ||
                "Failed to update staff member. Please correct the following errors:",
              details: errorList,
            });
          } else {
            setAlert({
              type: "error",
              message:
                error.general ||
                error.message ||
                "Failed to update staff member. Please check the form and try again.",
            });
          }
        } else {
          setAlert({
            type: "error",
            message:
              error.message ||
              error.detail ||
              "Failed to update staff member. Please try again.",
          });
        }
      } else {
        setAlert({
          type: "error",
          message: "An unexpected error occurred. Please try again.",
        });
      }

      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleIdentifyAsChange = (value) => {
    const id = parseInt(value);
    const currentIdentifyAs = staffData.identifyAs || [];
    if (currentIdentifyAs.includes(id)) {
      handleInputChange(
        "identifyAs",
        currentIdentifyAs.filter((i) => i !== id),
      );
    } else {
      handleInputChange("identifyAs", [...currentIdentifyAs, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-sm sm:text-base text-gray-600">
              Loading staff details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      {/* Responsive Breadcrumb */}
      <nav
        className="flex mb-4 sm:mb-6 overflow-x-auto"
        aria-label="Breadcrumb"
      >
        <ol className="inline-flex items-center space-x-1 md:space-x-3 flex-nowrap">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
            >
              <ChartBarIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Dash</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to="/admin/staff"
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Staff
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}`}
                className="text-xs sm:text-sm font-medium text-gray-700 hover:text-blue-600 whitespace-nowrap"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-1 sm:mx-2 text-gray-400">/</span>
              <span className="text-xs sm:text-sm font-medium text-gray-500 inline-flex items-center whitespace-nowrap">
                <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                Update
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title - Responsive */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-6 sm:w-8 h-6 sm:h-8 mr-2 sm:mr-3 text-blue-600 flex-shrink-0" />
              Staff Member
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-3 sm:w-4 h-3 sm:h-4 mr-1 flex-shrink-0" />
              Update staff member information
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages - Responsive */}
      {alert && (
        <div
          className={`mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-sm sm:text-base ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between">
            <div className="flex-1">
              <div className="flex items-start">
                {alert.type === "success" ? (
                  <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <ExclamationTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <span className="font-medium">{alert.message}</span>
                  {alert.details && alert.details.length > 0 && (
                    <div className="mt-2 text-xs sm:text-sm">
                      {alert.details.map((detail, index) => (
                        <div key={index}>{detail}</div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-current hover:opacity-70 ml-4 text-lg sm:text-xl"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header with Actions - Responsive */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 flex items-center">
              <PencilSquareIcon className="w-5 sm:w-7 h-5 sm:h-7 mr-2 text-blue-600 flex-shrink-0" />
              Update Staff Member
            </h2>
            <Link to={`/admin/staff/${aid}`} className="flex-shrink-0">
              <button className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                Back to Detail
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation - Responsive with horizontal scroll */}
        <div className="border-b border-gray-200">
          <div className="px-4 sm:px-6">
            <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
              <Link
                to={`/admin/staff/${aid}`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Summary
              </Link>
              <Link
                to={`/admin/staff/${aid}/detail`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Detail
              </Link>
              <Link
                to={`/admin/staff/${aid}/comments`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Comments
              </Link>
              <Link
                to={`/admin/staff/${aid}/attachments`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap"
              >
                Attachments
              </Link>
              <Link
                to={`/admin/staff/${aid}/more`}
                className="border-b-2 border-transparent py-3 sm:py-4 px-1 text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center whitespace-nowrap"
              >
                More
                <EllipsisHorizontalIcon className="w-4 sm:w-5 h-4 sm:h-5 ml-1" />
              </Link>
            </nav>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          {/* Basic Information Section with Dark Header */}
          <FormSection title="Basic Information" icon={UserIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Select
                label="Type"
                value={staffData.type}
                onChange={(e) =>
                  handleInputChange("type", parseInt(e.target.value))
                }
                options={STAFF_TYPE_OPTIONS}
                error={errors.type}
                required
              />

              <Input
                label="Email"
                type="email"
                value={staffData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                error={errors.email}
                required
              />

              <Input
                label="First Name"
                value={staffData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                error={errors.firstName}
                required
              />

              <Input
                label="Last Name"
                value={staffData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                error={errors.lastName}
                required
              />
            </div>

            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="I agree to receive electronic email"
                checked={staffData.isOkToEmail}
                onChange={() => handleCheckboxChange("isOkToEmail")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="Phone"
                type="tel"
                value={staffData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                error={errors.phone}
                required
              />

              <Select
                label="Phone Type"
                value={staffData.phoneType}
                onChange={(e) =>
                  handleInputChange("phoneType", parseInt(e.target.value))
                }
                options={STAFF_PHONE_TYPE_OF_OPTIONS}
                error={errors.phoneType}
              />
            </div>

            {staffData.phoneType === 3 && (
              <div className="mb-4 sm:mb-6">
                <Input
                  label="Phone Extension"
                  value={staffData.phoneExtension}
                  onChange={(e) =>
                    handleInputChange("phoneExtension", e.target.value)
                  }
                  error={errors.phoneExtension}
                />
              </div>
            )}

            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="I agree to receive texts to my phone"
                checked={staffData.isOkToText}
                onChange={() => handleCheckboxChange("isOkToText")}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              <Input
                label="Other Phone (Optional)"
                type="tel"
                value={staffData.otherPhone}
                onChange={(e) =>
                  handleInputChange("otherPhone", e.target.value)
                }
                error={errors.otherPhone}
              />

              <Select
                label="Other Phone Type"
                value={staffData.otherPhoneType}
                onChange={(e) =>
                  handleInputChange("otherPhoneType", parseInt(e.target.value))
                }
                options={STAFF_PHONE_TYPE_OF_OPTIONS}
                error={errors.otherPhoneType}
              />
            </div>

            {staffData.otherPhoneType === 3 && (
              <div className="mb-4 sm:mb-6">
                <Input
                  label="Other Phone Extension (Optional)"
                  value={staffData.otherPhoneExtension}
                  onChange={(e) =>
                    handleInputChange("otherPhoneExtension", e.target.value)
                  }
                  error={errors.otherPhoneExtension}
                />
              </div>
            )}
          </FormSection>

          {/* Address Section with Dark Header */}
          <FormSection title="Address Information" icon={MapPinIcon}>
            <div className="mb-4 sm:mb-6">
              <Checkbox
                label="Has shipping address different than billing address"
                checked={staffData.hasShippingAddress}
                onChange={() => handleCheckboxChange("hasShippingAddress")}
              />
            </div>

            <div
              className={`grid ${staffData.hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-6 sm:gap-8`}
            >
              {/* Billing Address */}
              <div>
                {staffData.hasShippingAddress && (
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                    Billing Address
                  </h4>
                )}

                <div className="space-y-3 sm:space-y-4">
                  <Input
                    label="Country"
                    value={staffData.country}
                    onChange={(e) =>
                      handleInputChange("country", e.target.value)
                    }
                    error={errors.country}
                    required
                  />

                  <Input
                    label="Province/State"
                    value={staffData.region}
                    onChange={(e) =>
                      handleInputChange("region", e.target.value)
                    }
                    error={errors.region}
                    required
                  />

                  <Input
                    label="City"
                    value={staffData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    error={errors.city}
                    required
                  />

                  <Input
                    label="Address Line 1"
                    value={staffData.addressLine1}
                    onChange={(e) =>
                      handleInputChange("addressLine1", e.target.value)
                    }
                    error={errors.addressLine1}
                    required
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={staffData.addressLine2}
                    onChange={(e) =>
                      handleInputChange("addressLine2", e.target.value)
                    }
                    error={errors.addressLine2}
                  />

                  <Input
                    label="Postal Code"
                    value={staffData.postalCode}
                    onChange={(e) =>
                      handleInputChange("postalCode", e.target.value)
                    }
                    error={errors.postalCode}
                    required
                  />
                </div>
              </div>

              {/* Shipping Address */}
              {staffData.hasShippingAddress && (
                <div>
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-3 sm:mb-4">
                    Shipping Address
                  </h4>

                  <div className="space-y-3 sm:space-y-4">
                    <Input
                      label="Name"
                      value={staffData.shippingName}
                      onChange={(e) =>
                        handleInputChange("shippingName", e.target.value)
                      }
                      placeholder="The name to contact for this shipping address"
                      error={errors.shippingName}
                      required
                    />

                    <Input
                      label="Phone"
                      type="tel"
                      value={staffData.shippingPhone}
                      onChange={(e) =>
                        handleInputChange("shippingPhone", e.target.value)
                      }
                      placeholder="The contact phone number for this shipping address"
                      error={errors.shippingPhone}
                      required
                    />

                    <Input
                      label="Country"
                      value={staffData.shippingCountry}
                      onChange={(e) =>
                        handleInputChange("shippingCountry", e.target.value)
                      }
                      error={errors.shippingCountry}
                      required
                    />

                    <Input
                      label="Province/State"
                      value={staffData.shippingRegion}
                      onChange={(e) =>
                        handleInputChange("shippingRegion", e.target.value)
                      }
                      error={errors.shippingRegion}
                      required
                    />

                    <Input
                      label="City"
                      value={staffData.shippingCity}
                      onChange={(e) =>
                        handleInputChange("shippingCity", e.target.value)
                      }
                      error={errors.shippingCity}
                      required
                    />

                    <Input
                      label="Address Line 1"
                      value={staffData.shippingAddressLine1}
                      onChange={(e) =>
                        handleInputChange(
                          "shippingAddressLine1",
                          e.target.value,
                        )
                      }
                      error={errors.shippingAddressLine1}
                      required
                    />

                    <Input
                      label="Address Line 2 (Optional)"
                      value={staffData.shippingAddressLine2}
                      onChange={(e) =>
                        handleInputChange(
                          "shippingAddressLine2",
                          e.target.value,
                        )
                      }
                      error={errors.shippingAddressLine2}
                    />

                    <Input
                      label="Postal Code"
                      value={staffData.shippingPostalCode}
                      onChange={(e) =>
                        handleInputChange("shippingPostalCode", e.target.value)
                      }
                      error={errors.shippingPostalCode}
                      required
                    />
                  </div>
                </div>
              )}
            </div>
          </FormSection>

          {/* Additional Information Section with Dark Header */}
          <FormSection title="Additional Information" icon={BriefcaseIcon}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Limitation or Special Consideration (Optional)
                </label>
                <textarea
                  value={staffData.limitSpecial}
                  onChange={(e) =>
                    handleInputChange("limitSpecial", e.target.value)
                  }
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  maxLength={638}
                />
                <p className="mt-1 text-sm text-gray-500">Max 638 characters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <DateInput
                  label="Police Check Expiry"
                  value={staffData.policeCheck}
                  onChange={(value) => handleInputChange("policeCheck", value)}
                  error={errors.policeCheck}
                />

                <Input
                  label="Driver's License Class (Optional)"
                  value={staffData.driversLicenseClass}
                  onChange={(e) =>
                    handleInputChange("driversLicenseClass", e.target.value)
                  }
                  error={errors.driversLicenseClass}
                />
              </div>

              <VehicleTypesMultiSelect
                value={staffData.vehicleTypes}
                onChange={(value) => handleInputChange("vehicleTypes", value)}
                error={errors.vehicleTypes}
                required={false}
                label="Vehicle Types (Optional)"
                helperText="Select the vehicle types available to this staff member"
                onUnauthorized={onUnauthorized}
              />

              <SkillSetsMultiSelect
                value={staffData.skillSets}
                onChange={(value) => handleInputChange("skillSets", value)}
                error={errors.skillSets}
                required={false}
                label="Skill Sets (Optional)"
                helperText="Select the skill sets for this staff member"
                onUnauthorized={onUnauthorized}
              />

              <InsuranceRequirementsMultiSelect
                value={staffData.insuranceRequirements}
                onChange={(value) =>
                  handleInputChange("insuranceRequirements", value)
                }
                error={errors.insuranceRequirements}
                required={false}
                label="Insurance Requirements (Optional)"
                helperText="Select the insurance requirements for this staff member"
                onUnauthorized={onUnauthorized}
              />
            </div>
          </FormSection>

          {/* Emergency Contact Section with Dark Header */}
          <FormSection title="Emergency Contact" icon={ExclamationCircleIcon}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Input
                label="Contact Name"
                value={staffData.emergencyContactName}
                onChange={(e) =>
                  handleInputChange("emergencyContactName", e.target.value)
                }
                error={errors.emergencyContactName}
                required
              />

              <Input
                label="Contact Relationship"
                value={staffData.emergencyContactRelationship}
                onChange={(e) =>
                  handleInputChange(
                    "emergencyContactRelationship",
                    e.target.value,
                  )
                }
                error={errors.emergencyContactRelationship}
                required
              />

              <Input
                label="Contact Telephone"
                type="tel"
                value={staffData.emergencyContactTelephone}
                onChange={(e) =>
                  handleInputChange("emergencyContactTelephone", e.target.value)
                }
                error={errors.emergencyContactTelephone}
                required
              />

              <Input
                label="Contact Alternative Telephone (Optional)"
                type="tel"
                value={staffData.emergencyContactAlternativeTelephone}
                onChange={(e) =>
                  handleInputChange(
                    "emergencyContactAlternativeTelephone",
                    e.target.value,
                  )
                }
                error={errors.emergencyContactAlternativeTelephone}
              />
            </div>
          </FormSection>

          {/* Metrics Section with Dark Header */}
          <FormSection title="Metrics" icon={ChartPieIcon}>
            <div className="space-y-4 sm:space-y-6">
              <TagsMultiSelect
                value={staffData.tags}
                onChange={(value) => handleInputChange("tags", value)}
                error={errors.tags}
                required={false}
                label="Tags (Optional)"
                helperText="Select tags to categorize this staff member"
                onUnauthorized={onUnauthorized}
              />

              <HowHearAboutUsSelect
                value={staffData.howDidYouHearAboutUsID}
                onChange={handleHowHearChange}
                onOtherDetected={handleHowHearOtherDetected}
                error={errors.howDidYouHearAboutUsID}
                required={true}
                helperText="Tell us how this person discovered our organization"
                onUnauthorized={onUnauthorized}
              />

              {staffData.isHowDidYouHearAboutUsOther && (
                <Input
                  label="How did you hear about us? (Other)"
                  value={staffData.howDidYouHearAboutUsOther}
                  onChange={(e) =>
                    handleInputChange(
                      "howDidYouHearAboutUsOther",
                      e.target.value,
                    )
                  }
                  error={errors.howDidYouHearAboutUsOther}
                  required
                />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <Select
                  label="Gender"
                  value={staffData.gender}
                  onChange={(e) =>
                    handleInputChange("gender", parseInt(e.target.value))
                  }
                  options={GENDER_OPTIONS}
                  error={errors.gender}
                />

                <DateInput
                  label="Birth Date (Optional)"
                  value={staffData.birthDate}
                  onChange={(value) => handleInputChange("birthDate", value)}
                  max={new Date().toISOString().split("T")[0]}
                  error={errors.birthDate}
                />
              </div>

              {staffData.gender === STAFF_GENDER_OTHER && (
                <Input
                  label="Gender (Other)"
                  value={staffData.genderOther}
                  onChange={(e) =>
                    handleInputChange("genderOther", e.target.value)
                  }
                  error={errors.genderOther}
                  required
                />
              )}

              <DateInput
                label="Join Date (Optional)"
                value={staffData.joinDate}
                onChange={(value) => handleInputChange("joinDate", value)}
                error={errors.joinDate}
                helperText="This indicates when the person joined the workery"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Do you identify as belonging to any of the following groups?
                  (Optional)
                </label>
                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                  {IDENTIFY_AS_OPTIONS.map((opt) => (
                    <label key={opt.value} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        value={opt.value}
                        checked={(staffData.identifyAs || []).includes(
                          opt.value,
                        )}
                        onChange={(e) => handleIdentifyAsChange(e.target.value)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {opt.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* System Information Section with Dark Header */}
          <FormSection title="System Information" icon={ComputerDesktopIcon}>
            <div className="space-y-4 sm:space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={staffData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  maxLength={638}
                />
                <p className="mt-1 text-sm text-gray-500">Max 638 characters</p>
              </div>

              <div className="max-w-xl">
                <Select
                  label="Preferred Language"
                  value={staffData.preferredLanguage}
                  onChange={(e) =>
                    handleInputChange("preferredLanguage", e.target.value)
                  }
                  options={LANGUAGE_OPTIONS}
                  error={errors.preferredLanguage}
                />
              </div>
            </div>
          </FormSection>

          {/* Form Actions - Responsive */}
          <div className="flex flex-col sm:flex-row sm:justify-between items-stretch sm:items-center mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200 gap-3">
            <Link to={`/admin/staff/${aid}`} className="order-2 sm:order-1">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-gray-300 rounded-lg text-sm sm:text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
                Back to Detail
              </button>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`order-1 sm:order-2 inline-flex items-center justify-center px-4 sm:px-5 py-2 sm:py-2.5 border border-transparent rounded-lg text-sm sm:text-base font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckCircleIcon className="w-4 sm:w-5 h-4 sm:h-5 mr-1 sm:mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminStaffUpdatePage;
