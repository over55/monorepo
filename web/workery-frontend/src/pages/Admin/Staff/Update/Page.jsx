// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  ChartBarIcon,
  UserGroupIcon,
  InformationCircleIcon,
  PencilSquareIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  BuildingOfficeIcon,
  HomeIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  DocumentTextIcon,
  TruckIcon,
  ExclamationCircleIcon,
  HeartIcon,
  ChartPieIcon,
  ComputerDesktopIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  EllipsisHorizontalIcon,
  ChatBubbleLeftRightIcon,
  PaperClipIcon,
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
} from "../../../../components/Form";
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

const STAFF_TYPE_OPTIONS = [
  { value: STAFF_TYPE_EXECUTIVE, label: "Executive" },
  { value: STAFF_TYPE_MANAGEMENT, label: "Management" },
  { value: STAFF_TYPE_FRONTLINE, label: "Frontline" },
];

const LANGUAGE_OPTIONS = [
  { value: "English", label: "English" },
  { value: "French", label: "French" },
];

function AdminStaffUpdatePage() {
  const { aid } = useParams();
  const navigate = useNavigate();

  // Services
  const staffManager = useStaffManager();

  // Component State
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields - Basic Info
  const [staffType, setStaffType] = useState(STAFF_TYPE_FRONTLINE);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [phoneExtension, setPhoneExtension] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToText, setIsOkToText] = useState(false);
  const [isOkToEmail, setIsOkToEmail] = useState(false);

  // Form Fields - Address
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

  // Form Fields - Additional Info
  const [limitSpecial, setLimitSpecial] = useState("");
  const [policeCheck, setPoliceCheck] = useState("");
  const [driversLicenseClass, setDriversLicenseClass] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [skillSets, setSkillSets] = useState([]);
  const [insuranceRequirements, setInsuranceRequirements] = useState([]);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactTelephone, setEmergencyContactTelephone] =
    useState("");
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState("");
  const [description, setDescription] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Form Fields - Metrics
  const [tags, setTags] = useState([]);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState("");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] =
    useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [gender, setGender] = useState(0);
  const [genderOther, setGenderOther] = useState("");
  const [identifyAs, setIdentifyAs] = useState([]);

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Load staff detail on mount
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setErrors({});

      try {
        // Load staff detail
        const staffData = await staffManager.getStaffDetail(
          aid,
          onUnauthorized,
        );

        if (!mounted) return;

        // Populate form fields
        setStaffType(staffData.type || STAFF_TYPE_FRONTLINE);
        setEmail(staffData.email || "");
        setPhone(staffData.phone || "");
        setPhoneType(staffData.phoneType || 0);
        setPhoneExtension(staffData.phoneExtension || "");
        setFirstName(staffData.firstName || "");
        setLastName(staffData.lastName || "");
        setOtherPhone(staffData.otherPhone || "");
        setOtherPhoneType(staffData.otherPhoneType || 0);
        setOtherPhoneExtension(staffData.otherPhoneExtension || "");
        setIsOkToText(staffData.isOkToText || false);
        setIsOkToEmail(staffData.isOkToEmail || false);

        // Address fields
        setPostalCode(staffData.postalCode || "");
        setAddressLine1(staffData.addressLine1 || "");
        setAddressLine2(staffData.addressLine2 || "");
        setCity(staffData.city || "");
        setRegion(staffData.region || "");
        setCountry(staffData.country || "");
        setHasShippingAddress(staffData.hasShippingAddress || false);
        setShippingName(staffData.shippingName || "");
        setShippingPhone(staffData.shippingPhone || "");
        setShippingCountry(staffData.shippingCountry || "");
        setShippingRegion(staffData.shippingRegion || "");
        setShippingCity(staffData.shippingCity || "");
        setShippingAddressLine1(staffData.shippingAddressLine1 || "");
        setShippingAddressLine2(staffData.shippingAddressLine2 || "");
        setShippingPostalCode(staffData.shippingPostalCode || "");

        // Additional fields
        setLimitSpecial(staffData.limitSpecial || "");
        setDriversLicenseClass(staffData.driversLicenseClass || "");

        // Police Check - Format date if exists
        if (staffData.policeCheck) {
          const date = new Date(staffData.policeCheck);
          if (!isNaN(date.getTime())) {
            setPoliceCheck(date.toISOString().split("T")[0]);
          }
        }

        // Vehicle Types - Extract IDs from array of objects
        if (staffData.vehicleTypes && Array.isArray(staffData.vehicleTypes)) {
          const vtIds = staffData.vehicleTypes.map((vt) => vt.id || vt);
          setVehicleTypes(vtIds);
        }

        // Skill Sets - Extract IDs from array of objects
        if (staffData.skillSets && Array.isArray(staffData.skillSets)) {
          const ssIds = staffData.skillSets.map((ss) => ss.id || ss);
          setSkillSets(ssIds);
        }

        // Insurance Requirements - Extract IDs from array of objects
        if (
          staffData.insuranceRequirements &&
          Array.isArray(staffData.insuranceRequirements)
        ) {
          const irIds = staffData.insuranceRequirements.map(
            (ir) => ir.id || ir,
          );
          setInsuranceRequirements(irIds);
        }

        setEmergencyContactName(staffData.emergencyContactName || "");
        setEmergencyContactRelationship(
          staffData.emergencyContactRelationship || "",
        );
        setEmergencyContactTelephone(staffData.emergencyContactTelephone || "");
        setEmergencyContactAlternativeTelephone(
          staffData.emergencyContactAlternativeTelephone || "",
        );
        setDescription(staffData.description || "");
        setPreferredLanguage(staffData.preferredLanguage || "English");

        // Tags - Extract IDs from array of objects
        if (staffData.tags && Array.isArray(staffData.tags)) {
          const tagIds = staffData.tags.map((tag) => tag.id || tag);
          setTags(tagIds);
        }

        setHowDidYouHearAboutUsID(staffData.howDidYouHearAboutUsID || "");
        setIsHowDidYouHearAboutUsOther(
          staffData.isHowDidYouHearAboutUsOther || false,
        );
        setHowDidYouHearAboutUsOther(staffData.howDidYouHearAboutUsOther || "");

        // Date fields
        if (staffData.birthDate) {
          const date = new Date(staffData.birthDate);
          if (!isNaN(date.getTime())) {
            setBirthDate(date.toISOString().split("T")[0]);
          }
        }

        if (staffData.joinDate) {
          const date = new Date(staffData.joinDate);
          if (!isNaN(date.getTime())) {
            setJoinDate(date.toISOString().split("T")[0]);
          }
        }

        setGender(staffData.gender || 0);
        setGenderOther(staffData.genderOther || "");
        setIdentifyAs(staffData.identifyAs || []);
      } catch (error) {
        console.error("Error loading staff detail:", error);
        if (mounted) {
          setAlert({
            type: "error",
            message: "Failed to load staff details. Please try again.",
          });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [aid]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setAlert(null);

    try {
      // Prepare payload
      const payload = {
        id: aid,
        type: parseInt(staffType),
        firstName,
        lastName,
        email,
        phone,
        phoneType: parseInt(phoneType),
        phoneExtension,
        otherPhone,
        otherPhoneType: parseInt(otherPhoneType),
        otherPhoneExtension,
        isOkToText,
        isOkToEmail,
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
        limitSpecial,
        policeCheck: policeCheck || null,
        driversLicenseClass,
        vehicleTypes: vehicleTypes || [],
        skillSets: skillSets || [],
        insuranceRequirements: insuranceRequirements || [],
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactTelephone,
        emergencyContactAlternativeTelephone,
        description,
        tags: tags || [],
        gender: parseInt(gender),
        genderOther,
        joinDate: joinDate || null,
        birthDate: birthDate || null,
        howDidYouHearAboutUsID: howDidYouHearAboutUsID,
        isHowDidYouHearAboutUsOther,
        howDidYouHearAboutUsOther,
        preferredLanguage,
        identifyAs: identifyAs.map((id) => parseInt(id)),
      };

      // Call update API
      const response = await staffManager.updateStaff(
        aid,
        payload,
        onUnauthorized,
      );

      // Success - redirect to detail page
      setAlert({
        type: "success",
        message: "Staff member updated successfully!",
      });
      setTimeout(() => {
        navigate(`/admin/staff/${aid}`);
      }, 2000);
    } catch (error) {
      console.error("Error updating staff:", error);
      setErrors(error || {});
      setAlert({
        type: "error",
        message:
          "Failed to update staff member. Please check the form and try again.",
      });
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle how hear change
  const handleHowHearChange = (value) => {
    setHowDidYouHearAboutUsID(value);
  };

  // Handle how hear other detected
  const handleHowHearOtherDetected = (isOther) => {
    setIsHowDidYouHearAboutUsOther(isOther);
    if (!isOther) {
      setHowDidYouHearAboutUsOther("");
    }
  };

  // Handle identify as selection
  const handleIdentifyAsChange = (value) => {
    const id = parseInt(value);
    if (identifyAs.includes(id)) {
      setIdentifyAs(identifyAs.filter((i) => i !== id));
    } else {
      setIdentifyAs([...identifyAs, id]);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading staff details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to="/admin/staff"
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <UserGroupIcon className="w-4 h-4 mr-2" />
                  Staff
                </span>
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link
                to={`/admin/staff/${aid}`}
                className="text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                <span className="inline-flex items-center">
                  <InformationCircleIcon className="w-4 h-4 mr-2" />
                  Detail
                </span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-sm font-medium text-gray-500 inline-flex items-center">
                <PencilSquareIcon className="w-4 h-4 mr-2" />
                Update
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Title */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserGroupIcon className="w-8 h-8 mr-3 text-blue-600" />
              Staff Member
            </h1>
            <p className="mt-1 text-sm text-gray-600 flex items-center">
              <PencilSquareIcon className="w-4 h-4 mr-1" />
              Update staff member information
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {alert && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg ${
            alert.type === "success"
              ? "bg-green-50 border border-green-200 text-green-700"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              {alert.type === "success" ? (
                <CheckCircleIcon className="w-5 h-5 mr-2" />
              ) : (
                <XCircleIcon className="w-5 h-5 mr-2" />
              )}
              <span>{alert.message}</span>
            </div>
            <button
              onClick={() => setAlert(null)}
              className="text-current hover:opacity-70"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white shadow-sm rounded-lg">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <PencilSquareIcon className="w-7 h-7 mr-2 text-blue-600" />
              Update Staff Member
            </h2>
            <Link to={`/admin/staff/${aid}`}>
              <button className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Detail
              </button>
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <Link
              to={`/admin/staff/${aid}`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Summary
            </Link>
            <Link
              to={`/admin/staff/${aid}/detail`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Detail
            </Link>
            <Link
              to={`/admin/staff/${aid}/comments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Comments
            </Link>
            <Link
              to={`/admin/staff/${aid}/attachments`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              Attachments
            </Link>
            <Link
              to={`/admin/staff/${aid}/more`}
              className="border-b-2 border-transparent py-4 px-1 text-base font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center"
            >
              More
              <EllipsisHorizontalIcon className="w-5 h-5 ml-1" />
            </Link>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Basic Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={staffType}
                    onChange={(e) => setStaffType(parseInt(e.target.value))}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.type ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  >
                    {STAFF_TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isOkToEmail}
                    onChange={(e) => setIsOkToEmail(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to receive electronic email
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={phoneType}
                    onChange={(e) => setPhoneType(parseInt(e.target.value))}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phoneType ? "border-red-300" : "border-gray-300"
                    }`}
                    required
                  >
                    <option value={0}>Please select</option>
                    {STAFF_PHONE_TYPE_OF_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.phoneType && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.phoneType}
                    </p>
                  )}
                </div>
              </div>

              {phoneType === 3 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Extension
                  </label>
                  <input
                    type="text"
                    value={phoneExtension}
                    onChange={(e) => setPhoneExtension(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="mt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isOkToText}
                    onChange={(e) => setIsOkToText(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to receive texts to my phone
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={otherPhone}
                    onChange={(e) => setOtherPhone(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Phone Type
                  </label>
                  <select
                    value={otherPhoneType}
                    onChange={(e) =>
                      setOtherPhoneType(parseInt(e.target.value))
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={0}>Please select</option>
                    {STAFF_PHONE_TYPE_OF_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {otherPhoneType === 3 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Phone Extension (Optional)
                  </label>
                  <input
                    type="text"
                    value={otherPhoneExtension}
                    onChange={(e) => setOtherPhoneExtension(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Address Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="w-5 h-5 mr-2 text-blue-600" />
                Address Information
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasShippingAddress}
                    onChange={(e) => setHasShippingAddress(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Has shipping address different than billing address
                  </span>
                </label>
              </div>

              <div
                className={`grid ${hasShippingAddress ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"} gap-8`}
              >
                {/* Billing Address */}
                <div>
                  {hasShippingAddress && (
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      Billing Address
                    </h4>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.country ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Canada"
                        required
                      />
                      {errors.country && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.country}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Province/State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.region ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="e.g., Ontario"
                        required
                      />
                      {errors.region && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.region}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.city ? "border-red-300" : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.city && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.city}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.addressLine1
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.addressLine1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                          errors.postalCode
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        required
                      />
                      {errors.postalCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.postalCode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                {hasShippingAddress && (
                  <div>
                    <h4 className="text-base font-medium text-gray-900 mb-4">
                      Shipping Address
                    </h4>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingName
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingName && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingName}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingPhone
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingPhone && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingPhone}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingCountry
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingCountry && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingCountry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Province/State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingRegion}
                          onChange={(e) => setShippingRegion(e.target.value)}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingRegion
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingRegion && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingRegion}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingCity
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingCity && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingCity}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingAddressLine1}
                          onChange={(e) =>
                            setShippingAddressLine1(e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingAddressLine1
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingAddressLine1 && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingAddressLine1}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={shippingAddressLine2}
                          onChange={(e) =>
                            setShippingAddressLine2(e.target.value)
                          }
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={shippingPostalCode}
                          onChange={(e) =>
                            setShippingPostalCode(e.target.value)
                          }
                          className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                            errors.shippingPostalCode
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          required={hasShippingAddress}
                        />
                        {errors.shippingPostalCode && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.shippingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BriefcaseIcon className="w-5 h-5 mr-2 text-blue-600" />
                Additional Information
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Limitation or Special Consideration (Optional)
                  </label>
                  <textarea
                    value={limitSpecial}
                    onChange={(e) => setLimitSpecial(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    maxLength={638}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Max 638 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Police Check Expiry
                    </label>
                    <input
                      type="date"
                      value={policeCheck}
                      onChange={(e) => setPoliceCheck(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver's License Class (Optional)
                    </label>
                    <input
                      type="text"
                      value={driversLicenseClass}
                      onChange={(e) => setDriversLicenseClass(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <VehicleTypesMultiSelect
                  value={vehicleTypes}
                  onChange={(value) => setVehicleTypes(value)}
                  error={errors.vehicleTypes}
                  required={false}
                  label="Vehicle Types (Optional)"
                  placeholder="Select vehicle types..."
                  helperText="Select the vehicle types available to this staff member"
                  onUnauthorized={onUnauthorized}
                />

                <SkillSetsMultiSelect
                  value={skillSets}
                  onChange={(value) => setSkillSets(value)}
                  error={errors.skillSets}
                  required={false}
                  label="Skill Sets (Optional)"
                  placeholder="Select skill sets..."
                  helperText="Select the skill sets for this staff member"
                  onUnauthorized={onUnauthorized}
                />

                <InsuranceRequirementsMultiSelect
                  value={insuranceRequirements}
                  onChange={(value) => setInsuranceRequirements(value)}
                  error={errors.insuranceRequirements}
                  required={false}
                  label="Insurance Requirements (Optional)"
                  placeholder="Select insurance requirements..."
                  helperText="Select the insurance requirements for this staff member"
                  onUnauthorized={onUnauthorized}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ExclamationCircleIcon className="w-5 h-5 mr-2 text-blue-600" />
                Emergency Contact
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.emergencyContactName
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.emergencyContactName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Relationship <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={emergencyContactRelationship}
                    onChange={(e) =>
                      setEmergencyContactRelationship(e.target.value)
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.emergencyContactRelationship
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.emergencyContactRelationship && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactRelationship}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Telephone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactTelephone}
                    onChange={(e) =>
                      setEmergencyContactTelephone(e.target.value)
                    }
                    className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.emergencyContactTelephone
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    required
                  />
                  {errors.emergencyContactTelephone && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.emergencyContactTelephone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contact Alternative Telephone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={emergencyContactAlternativeTelephone}
                    onChange={(e) =>
                      setEmergencyContactAlternativeTelephone(e.target.value)
                    }
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartPieIcon className="w-5 h-5 mr-2 text-blue-600" />
                Metrics
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <TagsMultiSelect
                  value={tags}
                  onChange={(value) => setTags(value)}
                  error={errors.tags}
                  required={false}
                  label="Tags (Optional)"
                  placeholder="Select tags..."
                  helperText="Select tags to categorize this staff member"
                  onUnauthorized={onUnauthorized}
                />

                <HowHearAboutUsSelect
                  value={howDidYouHearAboutUsID}
                  onChange={handleHowHearChange}
                  onOtherDetected={handleHowHearOtherDetected}
                  error={errors.howDidYouHearAboutUsID}
                  required={true}
                  label="How did you hear about us?"
                  helperText="Tell us how this person discovered our organization"
                  onUnauthorized={onUnauthorized}
                />

                {isHowDidYouHearAboutUsOther && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How did you hear about us? (Other){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={howDidYouHearAboutUsOther}
                      onChange={(e) =>
                        setHowDidYouHearAboutUsOther(e.target.value)
                      }
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.howDidYouHearAboutUsOther
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required={isHowDidYouHearAboutUsOther}
                    />
                    {errors.howDidYouHearAboutUsOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.howDidYouHearAboutUsOther}
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(parseInt(e.target.value))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={0}>Please select</option>
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Birth Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                      max={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {gender === STAFF_GENDER_OTHER && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender (Other) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={genderOther}
                      onChange={(e) => setGenderOther(e.target.value)}
                      className={`block w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                        errors.genderOther
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      required={gender === STAFF_GENDER_OTHER}
                    />
                    {errors.genderOther && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.genderOther}
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Join Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

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
                          checked={identifyAs.includes(opt.value)}
                          onChange={(e) =>
                            handleIdentifyAsChange(e.target.value)
                          }
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
            </div>
          </div>

          {/* System Information Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 rounded-t-lg">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <ComputerDesktopIcon className="w-5 h-5 mr-2 text-blue-600" />
                System Information
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    maxLength={638}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Max 638 characters
                  </p>
                </div>

                <div className="max-w-xl">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Language <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {LANGUAGE_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center">
                        <input
                          type="radio"
                          value={option.value}
                          checked={preferredLanguage === option.value}
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.preferredLanguage && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.preferredLanguage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <Link to={`/admin/staff/${aid}`}>
              <button
                type="button"
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 rounded-lg text-base font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ChevronLeftIcon className="w-5 h-5 mr-2" />
                Back to Detail
              </button>
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`inline-flex items-center px-5 py-2.5 border border-transparent rounded-lg text-base font-medium text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminStaffUpdatePage;
