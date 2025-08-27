// File Path: monorepo/web/workery-frontend/src/pages/Admin/Account/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  useAccountManager,
  useAuthManager,
  useTagManager,
  useVehicleTypeManager,
  useHowHearAboutUsItemManager,
} from "../../../../services/Services";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Select,
  Checkbox,
  Textarea,
  DateInput,
  FormGroup,
  FormSection,
  Badge,
  MultiSelect,
} from "../../../../components/UI";
import {
  UserCircleIcon,
  PencilIcon,
  ArrowLeftIcon,
  HomeIcon,
  CheckCircleIcon,
  XCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  GlobeAltIcon,
  BriefcaseIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../../constants/Roles";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";
import { ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../constants/Associate";
import { ensureISODateForAPI } from "../../../../services/Helpers/DateFormatter";

// Gender options
const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Prefer not to say" },
];

// Identify As options
const IDENTIFY_AS_OPTIONS = [
  { value: 1, label: "Other" },
  { value: 2, label: "Prefer not to say" },
  { value: 3, label: "Women" },
  { value: 4, label: "Newcomer to Canada" },
  { value: 5, label: "Visible minority" },
  { value: 6, label: "Veteran" },
  { value: 7, label: "Francophone" },
  { value: 8, label: "Person with disability" },
  { value: 9, label: "Inuit" },
  { value: 10, label: "First Nations" },
  { value: 11, label: "Métis" },
];

// Country options (prioritized)
const COUNTRY_OPTIONS = [
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

// Province/State options based on country
const REGION_OPTIONS = {
  CA: [
    { value: "AB", label: "Alberta" },
    { value: "BC", label: "British Columbia" },
    { value: "MB", label: "Manitoba" },
    { value: "NB", label: "New Brunswick" },
    { value: "NL", label: "Newfoundland and Labrador" },
    { value: "NS", label: "Nova Scotia" },
    { value: "NT", label: "Northwest Territories" },
    { value: "NU", label: "Nunavut" },
    { value: "ON", label: "Ontario" },
    { value: "PE", label: "Prince Edward Island" },
    { value: "QC", label: "Quebec" },
    { value: "SK", label: "Saskatchewan" },
    { value: "YT", label: "Yukon" },
  ],
  US: [
    { value: "AL", label: "Alabama" },
    { value: "AK", label: "Alaska" },
    { value: "AZ", label: "Arizona" },
    // ... add more US states as needed
  ],
  MX: [
    { value: "AGU", label: "Aguascalientes" },
    { value: "BCN", label: "Baja California" },
    // ... add more Mexican states as needed
  ],
};

/**
 * Account Update Page for Admin Users
 * Allows editing of profile information for Executive, Management, and Frontline staff
 */
function AdminAccountUpdatePage() {
  // Services
  const accountManager = useAccountManager();
  const authManager = useAuthManager();
  const tagManager = useTagManager();
  const vehicleTypeManager = useVehicleTypeManager();
  const howHearManager = useHowHearAboutUsItemManager();
  const navigate = useNavigate();

  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  // Form fields - Common
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [isOkToEmail, setIsOkToEmail] = useState(false);
  const [isOkToText, setIsOkToText] = useState(false);

  // Address fields
  const [country, setCountry] = useState("CA");
  const [region, setRegion] = useState("");
  const [city, setCity] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // Shipping address fields
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("CA");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

  // Professional fields (Management/Frontline only)
  const [limitSpecial, setLimitSpecial] = useState("");
  const [policeCheck, setPoliceCheck] = useState("");
  const [driversLicenseClass, setDriversLicenseClass] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [description, setDescription] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Emergency contact fields
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactTelephone, setEmergencyContactTelephone] =
    useState("");
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState("");

  // Metrics fields
  const [tags, setTags] = useState([]);
  const [howDidYouHearAboutUsId, setHowDidYouHearAboutUsId] = useState("");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] =
    useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState(0);
  const [genderOther, setGenderOther] = useState("");
  const [identifyAs, setIdentifyAs] = useState([]);

  // Options for dropdowns
  const [tagOptions, setTagOptions] = useState([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [howHearOptions, setHowHearOptions] = useState([]);

  // Check authentication
  useEffect(() => {
    if (!authManager.isAuthenticated()) {
      navigate("/login");
    }
  }, [authManager, navigate]);

  // Fetch account details and options
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const onUnauthorized = () => {
          authManager.clearAllTokens();
          navigate("/login?unauthorized=true");
        };

        // Fetch account details
        const profileData =
          await accountManager.getAccountDetail(onUnauthorized);

        if (mounted) {
          // Validate that this is a staff user
          if (
            ![
              EXECUTIVE_ROLE_ID,
              MANAGEMENT_ROLE_ID,
              FRONTLINE_ROLE_ID,
            ].includes(profileData.role)
          ) {
            navigate("/501");
            return;
          }

          setCurrentUser(profileData);

          // Populate form fields
          setFirstName(profileData.firstName || "");
          setLastName(profileData.lastName || "");
          setEmail(profileData.email || "");
          setPhone(profileData.phone || "");
          setPhoneType(profileData.phoneType || 0);
          setOtherPhone(profileData.otherPhone || "");
          setOtherPhoneType(profileData.otherPhoneType || 0);
          setIsOkToEmail(profileData.isOkToEmail || false);
          setIsOkToText(profileData.isOkToText || false);

          // Address
          setCountry(profileData.country || "CA");
          setRegion(profileData.region || "");
          setCity(profileData.city || "");
          setAddressLine1(profileData.addressLine1 || "");
          setAddressLine2(profileData.addressLine2 || "");
          setPostalCode(profileData.postalCode || "");

          // Shipping address
          setHasShippingAddress(profileData.hasShippingAddress || false);
          setShippingName(profileData.shippingName || "");
          setShippingPhone(profileData.shippingPhone || "");
          setShippingCountry(profileData.shippingCountry || "CA");
          setShippingRegion(profileData.shippingRegion || "");
          setShippingCity(profileData.shippingCity || "");
          setShippingAddressLine1(profileData.shippingAddressLine1 || "");
          setShippingAddressLine2(profileData.shippingAddressLine2 || "");
          setShippingPostalCode(profileData.shippingPostalCode || "");

          // Professional fields (Management/Frontline only)
          if (profileData.role !== EXECUTIVE_ROLE_ID) {
            setLimitSpecial(profileData.limitSpecial || "");
            setPoliceCheck(profileData.policeCheck || "");
            setDriversLicenseClass(profileData.driversLicenseClass || "");
            setDescription(profileData.description || "");
            setPreferredLanguage(profileData.preferredLanguage || "English");

            // Vehicle types (convert to array of IDs)
            if (
              profileData.vehicleTypes &&
              profileData.vehicleTypes.length > 0
            ) {
              const vehicleTypeIds = profileData.vehicleTypes.map(
                (vt) => vt.id,
              );
              setVehicleTypes(vehicleTypeIds);
            }

            // Emergency contact
            setEmergencyContactName(profileData.emergencyContactName || "");
            setEmergencyContactRelationship(
              profileData.emergencyContactRelationship || "",
            );
            setEmergencyContactTelephone(
              profileData.emergencyContactTelephone || "",
            );
            setEmergencyContactAlternativeTelephone(
              profileData.emergencyContactAlternativeTelephone || "",
            );

            // Metrics
            if (profileData.tags && profileData.tags.length > 0) {
              const tagIds = profileData.tags.map((tag) => tag.id);
              setTags(tagIds);
            }

            setHowDidYouHearAboutUsId(profileData.howDidYouHearAboutUsId || "");
            setIsHowDidYouHearAboutUsOther(
              profileData.howDidYouHearAboutUsText === "Other",
            );
            setHowDidYouHearAboutUsOther(
              profileData.howDidYouHearAboutUsOther || "",
            );
            setBirthDate(profileData.birthDate || "");
            setGender(profileData.gender || 0);
            setGenderOther(profileData.genderOther || "");

            if (profileData.identifyAs && profileData.identifyAs.length > 0) {
              setIdentifyAs(profileData.identifyAs);
            }
          }

          // Fetch options for dropdowns (Management/Frontline only)
          if (profileData.role !== EXECUTIVE_ROLE_ID) {
            // Fetch tags
            try {
              const tagsResponse =
                await tagManager.getSelectOptions(onUnauthorized);
              if (tagsResponse && tagsResponse.results) {
                const tagOpts = tagsResponse.results.map((tag) => ({
                  value: tag.id,
                  label: tag.text,
                }));
                setTagOptions(tagOpts);
              }
            } catch (error) {
              console.error("Failed to fetch tags:", error);
            }

            // Fetch vehicle types
            try {
              const vehicleTypesResponse =
                await vehicleTypeManager.getSelectOptions(onUnauthorized);
              if (vehicleTypesResponse && vehicleTypesResponse.results) {
                const vehicleOpts = vehicleTypesResponse.results.map((vt) => ({
                  value: vt.id,
                  label: vt.text,
                }));
                setVehicleTypeOptions(vehicleOpts);
              }
            } catch (error) {
              console.error("Failed to fetch vehicle types:", error);
            }

            // Fetch how hear about us items
            try {
              const howHearResponse =
                await howHearManager.getSelectOptions(onUnauthorized);
              if (howHearResponse && howHearResponse.results) {
                const howHearOpts = howHearResponse.results.map((item) => ({
                  value: item.id,
                  label: item.text,
                }));
                setHowHearOptions(howHearOpts);
              }
            } catch (error) {
              console.error("Failed to fetch how hear items:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch account details:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load account details" });
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [
    accountManager,
    authManager,
    navigate,
    tagManager,
    vehicleTypeManager,
    howHearManager,
  ]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setErrors({});
    setSuccessMessage("");

    try {
      const onUnauthorized = () => {
        authManager.clearAllTokens();
        navigate("/login?unauthorized=true");
      };

      // Prepare update payload
      let payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        phoneType: parseInt(phoneType) || 0,
        otherPhone: otherPhone.trim(),
        otherPhoneType: parseInt(otherPhoneType) || 0,
        isOkToEmail: isOkToEmail,
        isOkToText: isOkToText,
        country: country,
        region: region,
        city: city.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2.trim(),
        postalCode: postalCode.trim(),
        hasShippingAddress: hasShippingAddress,
      };

      // Add shipping address if enabled
      if (hasShippingAddress) {
        payload = {
          ...payload,
          shippingName: shippingName.trim(),
          shippingPhone: shippingPhone.trim(),
          shippingCountry: shippingCountry,
          shippingRegion: shippingRegion,
          shippingCity: shippingCity.trim(),
          shippingAddressLine1: shippingAddressLine1.trim(),
          shippingAddressLine2: shippingAddressLine2.trim(),
          shippingPostalCode: shippingPostalCode.trim(),
        };
      }

      // Add additional fields for Management/Frontline staff
      if (currentUser.role !== EXECUTIVE_ROLE_ID) {
        payload = {
          ...payload,
          limitSpecial: limitSpecial.trim(),
          policeCheck: policeCheck ? ensureISODateForAPI(policeCheck) : "",
          driversLicenseClass: driversLicenseClass.trim(),
          vehicleTypes: vehicleTypes,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactRelationship: emergencyContactRelationship.trim(),
          emergencyContactTelephone: emergencyContactTelephone.trim(),
          emergencyContactAlternativeTelephone:
            emergencyContactAlternativeTelephone.trim(),
          description: description.trim(),
          preferredLanguage: preferredLanguage,
          tags: tags,
          gender: parseInt(gender) || 0,
          genderOther: genderOther.trim(),
          birthDate: birthDate ? ensureISODateForAPI(birthDate) : "",
          howDidYouHearAboutUsId: howDidYouHearAboutUsId,
          isHowDidYouHearAboutUsOther: isHowDidYouHearAboutUsOther,
          howDidYouHearAboutUsOther: howDidYouHearAboutUsOther.trim(),
          identifyAs: identifyAs,
        };
      }

      // Submit update
      const response = await accountManager.updateAccount(
        payload,
        onUnauthorized,
      );

      setSuccessMessage("Profile updated successfully!");

      // Redirect after a short delay
      setTimeout(() => {
        navigate("/admin/account");
      }, 2000);
    } catch (error) {
      console.error("Failed to update account:", error);
      setErrors(error || { general: "Failed to update profile" });

      // Scroll to top to show error
      window.scrollTo(0, 0);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return <Loading fullScreen message="Loading account details..." />;
  }

  // No data state
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Alert type="warning">No account data found</Alert>
        <Link to="/admin/account" className="mt-4">
          <Button variant="secondary">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
      </div>
    );
  }

  // Check if user is Executive (simplified form)
  const isExecutive = currentUser.role === EXECUTIVE_ROLE_ID;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
            {
              label: "My Profile",
              href: "/admin/account",
              icon: UserCircleIcon,
            },
            { label: "Edit", icon: PencilIcon },
          ]}
        />

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <PencilIcon className="w-8 h-8 mr-3 text-gray-700" />
            Edit Profile
          </h1>
          <p className="mt-2 text-gray-600">Update your account information</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <Alert type="success" className="mb-6">
            <CheckCircleIcon className="h-5 w-5" />
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {errors.general && (
          <Alert type="error" className="mb-6">
            <XCircleIcon className="h-5 w-5" />
            {errors.general}
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Card className="mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2 text-gray-600" />
                Personal Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup>
                  <Input
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    error={errors.firstName}
                    placeholder="Enter your first name"
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    error={errors.lastName}
                    placeholder="Enter your last name"
                  />
                </FormGroup>

                {!isExecutive && (
                  <>
                    <FormGroup>
                      <DateInput
                        label="Date of Birth"
                        value={birthDate}
                        onChange={(value) => setBirthDate(value)}
                        error={errors.birthDate}
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Select
                        label="Gender"
                        value={gender}
                        onChange={(e) => setGender(parseInt(e.target.value))}
                        options={GENDER_OPTIONS}
                        error={errors.gender}
                      />
                    </FormGroup>

                    {gender === 1 && (
                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Gender (Other)"
                          value={genderOther}
                          onChange={(e) => setGenderOther(e.target.value)}
                          error={errors.genderOther}
                          placeholder="Please specify"
                        />
                      </FormGroup>
                    )}
                  </>
                )}
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2 text-gray-600" />
                Contact Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormGroup className="md:col-span-2">
                  <Input
                    type="email"
                    label="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    error={errors.email}
                    placeholder="email@example.com"
                  />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                  <Checkbox
                    label="I agree to receive electronic emails"
                    checked={isOkToEmail}
                    onChange={(e) => setIsOkToEmail(e.target.checked)}
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="tel"
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    error={errors.phone}
                    placeholder="(123) 456-7890"
                  />
                </FormGroup>

                <FormGroup>
                  <Select
                    label="Phone Type"
                    value={phoneType}
                    onChange={(e) => setPhoneType(parseInt(e.target.value))}
                    options={ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                    error={errors.phoneType}
                  />
                </FormGroup>

                <FormGroup className="md:col-span-2">
                  <Checkbox
                    label="I agree to receive text messages"
                    checked={isOkToText}
                    onChange={(e) => setIsOkToText(e.target.checked)}
                  />
                </FormGroup>

                <FormGroup>
                  <Input
                    type="tel"
                    label="Other Phone (Optional)"
                    value={otherPhone}
                    onChange={(e) => setOtherPhone(e.target.value)}
                    error={errors.otherPhone}
                    placeholder="(123) 456-7890"
                  />
                </FormGroup>

                <FormGroup>
                  <Select
                    label="Other Phone Type (Optional)"
                    value={otherPhoneType}
                    onChange={(e) =>
                      setOtherPhoneType(parseInt(e.target.value))
                    }
                    options={ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                    error={errors.otherPhoneType}
                  />
                </FormGroup>
              </div>
            </div>
          </Card>

          {/* Address Information */}
          <Card className="mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
                Address Information
              </h2>
            </div>
            <div className="p-6">
              {!isExecutive && (
                <FormGroup className="mb-6">
                  <Checkbox
                    label="Has shipping address different from billing address"
                    checked={hasShippingAddress}
                    onChange={(e) => setHasShippingAddress(e.target.checked)}
                  />
                </FormGroup>
              )}

              <div
                className={
                  hasShippingAddress
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                    : ""
                }
              >
                <div>
                  {hasShippingAddress && (
                    <h3 className="text-md font-medium text-gray-700 mb-4">
                      Billing Address
                    </h3>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                      <Select
                        label="Country"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        options={COUNTRY_OPTIONS}
                        required
                        error={errors.country}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Select
                        label="Province/State"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        options={REGION_OPTIONS[country] || []}
                        required
                        error={errors.region}
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="City"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        error={errors.city}
                        placeholder="Enter city"
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="Address Line 1"
                        value={addressLine1}
                        onChange={(e) => setAddressLine1(e.target.value)}
                        required={!isExecutive}
                        error={errors.addressLine1}
                        placeholder="Street address"
                      />
                    </FormGroup>

                    <FormGroup className="md:col-span-2">
                      <Input
                        label="Address Line 2 (Optional)"
                        value={addressLine2}
                        onChange={(e) => setAddressLine2(e.target.value)}
                        error={errors.addressLine2}
                        placeholder="Apartment, suite, etc."
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        label="Postal Code"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        required={!isExecutive}
                        error={errors.postalCode}
                        placeholder="A1B 2C3"
                      />
                    </FormGroup>
                  </div>
                </div>

                {hasShippingAddress && (
                  <div>
                    <h3 className="text-md font-medium text-gray-700 mb-4">
                      Shipping Address
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Contact Name"
                          value={shippingName}
                          onChange={(e) => setShippingName(e.target.value)}
                          error={errors.shippingName}
                          placeholder="Contact name for shipping"
                        />
                      </FormGroup>

                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Contact Phone"
                          value={shippingPhone}
                          onChange={(e) => setShippingPhone(e.target.value)}
                          error={errors.shippingPhone}
                          placeholder="(123) 456-7890"
                        />
                      </FormGroup>

                      <FormGroup>
                        <Select
                          label="Country"
                          value={shippingCountry}
                          onChange={(e) => setShippingCountry(e.target.value)}
                          options={COUNTRY_OPTIONS}
                          error={errors.shippingCountry}
                        />
                      </FormGroup>

                      <FormGroup>
                        <Select
                          label="Province/State"
                          value={shippingRegion}
                          onChange={(e) => setShippingRegion(e.target.value)}
                          options={REGION_OPTIONS[shippingCountry] || []}
                          error={errors.shippingRegion}
                        />
                      </FormGroup>

                      <FormGroup className="md:col-span-2">
                        <Input
                          label="City"
                          value={shippingCity}
                          onChange={(e) => setShippingCity(e.target.value)}
                          error={errors.shippingCity}
                          placeholder="Enter city"
                        />
                      </FormGroup>

                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Address Line 1"
                          value={shippingAddressLine1}
                          onChange={(e) =>
                            setShippingAddressLine1(e.target.value)
                          }
                          error={errors.shippingAddressLine1}
                          placeholder="Street address"
                        />
                      </FormGroup>

                      <FormGroup className="md:col-span-2">
                        <Input
                          label="Address Line 2 (Optional)"
                          value={shippingAddressLine2}
                          onChange={(e) =>
                            setShippingAddressLine2(e.target.value)
                          }
                          error={errors.shippingAddressLine2}
                          placeholder="Apartment, suite, etc."
                        />
                      </FormGroup>

                      <FormGroup>
                        <Input
                          label="Postal Code"
                          value={shippingPostalCode}
                          onChange={(e) =>
                            setShippingPostalCode(e.target.value)
                          }
                          error={errors.shippingPostalCode}
                          placeholder="A1B 2C3"
                        />
                      </FormGroup>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Professional Information (Management/Frontline only) */}
          {!isExecutive && (
            <>
              <Card className="mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Professional Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup className="md:col-span-2">
                      <Textarea
                        label="Limitations or Special Considerations (Optional)"
                        value={limitSpecial}
                        onChange={(e) => setLimitSpecial(e.target.value)}
                        error={errors.limitSpecial}
                        rows={4}
                        placeholder="Enter any limitations or special considerations..."
                        helperText="Maximum 638 characters"
                      />
                    </FormGroup>

                    <FormGroup>
                      <DateInput
                        label="Police Check Expiry (Optional)"
                        value={policeCheck}
                        onChange={(value) => setPoliceCheck(value)}
                        error={errors.policeCheck}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        label="Driver's License Class (Optional)"
                        value={driversLicenseClass}
                        onChange={(e) => setDriversLicenseClass(e.target.value)}
                        error={errors.driversLicenseClass}
                        placeholder="e.g., G, G2"
                      />
                    </FormGroup>

                    {vehicleTypeOptions.length > 0 && (
                      <FormGroup className="md:col-span-2">
                        <MultiSelect
                          label="Vehicle Types (Optional)"
                          options={vehicleTypeOptions}
                          value={vehicleTypes}
                          onChange={setVehicleTypes}
                          error={errors.vehicleTypes}
                          placeholder="Select vehicle types..."
                        />
                      </FormGroup>
                    )}

                    <FormGroup className="md:col-span-2">
                      <Textarea
                        label="Description (Optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        error={errors.description}
                        rows={4}
                        placeholder="Enter a description..."
                        helperText="Maximum 638 characters"
                      />
                    </FormGroup>

                    <FormGroup>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Preferred Language
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="preferredLanguage"
                            value="English"
                            checked={preferredLanguage === "English"}
                            onChange={(e) =>
                              setPreferredLanguage(e.target.value)
                            }
                            className="mr-2"
                          />
                          English
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="preferredLanguage"
                            value="French"
                            checked={preferredLanguage === "French"}
                            onChange={(e) =>
                              setPreferredLanguage(e.target.value)
                            }
                            className="mr-2"
                          />
                          French
                        </label>
                      </div>
                    </FormGroup>
                  </div>
                </div>
              </Card>

              {/* Emergency Contact */}
              <Card className="mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Emergency Contact
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormGroup>
                      <Input
                        label="Contact Name"
                        value={emergencyContactName}
                        onChange={(e) =>
                          setEmergencyContactName(e.target.value)
                        }
                        error={errors.emergencyContactName}
                        placeholder="Emergency contact name"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        label="Relationship"
                        value={emergencyContactRelationship}
                        onChange={(e) =>
                          setEmergencyContactRelationship(e.target.value)
                        }
                        error={errors.emergencyContactRelationship}
                        placeholder="e.g., Spouse, Parent, Friend"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        type="tel"
                        label="Contact Phone"
                        value={emergencyContactTelephone}
                        onChange={(e) =>
                          setEmergencyContactTelephone(e.target.value)
                        }
                        error={errors.emergencyContactTelephone}
                        placeholder="(123) 456-7890"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Input
                        type="tel"
                        label="Alternative Phone (Optional)"
                        value={emergencyContactAlternativeTelephone}
                        onChange={(e) =>
                          setEmergencyContactAlternativeTelephone(
                            e.target.value,
                          )
                        }
                        error={errors.emergencyContactAlternativeTelephone}
                        placeholder="(123) 456-7890"
                      />
                    </FormGroup>
                  </div>
                </div>
              </Card>

              {/* Metrics */}
              <Card className="mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-gray-600" />
                    Additional Information
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tagOptions.length > 0 && (
                      <FormGroup className="md:col-span-2">
                        <MultiSelect
                          label="Tags (Optional)"
                          options={tagOptions}
                          value={tags}
                          onChange={setTags}
                          error={errors.tags}
                          placeholder="Select tags..."
                        />
                      </FormGroup>
                    )}

                    {howHearOptions.length > 0 && (
                      <FormGroup className="md:col-span-2">
                        <Select
                          label="How did you hear about us?"
                          value={howDidYouHearAboutUsId}
                          onChange={(e) => {
                            const value = e.target.value;
                            setHowDidYouHearAboutUsId(value);
                            // Check if "Other" was selected
                            const selectedOption = howHearOptions.find(
                              (opt) => opt.value === value,
                            );
                            setIsHowDidYouHearAboutUsOther(
                              selectedOption?.label === "Other",
                            );
                          }}
                          options={[
                            { value: "", label: "Please select" },
                            ...howHearOptions,
                          ]}
                          error={errors.howDidYouHearAboutUsId}
                        />
                      </FormGroup>
                    )}

                    {isHowDidYouHearAboutUsOther && (
                      <FormGroup className="md:col-span-2">
                        <Input
                          label="How did you hear about us? (Other)"
                          value={howDidYouHearAboutUsOther}
                          onChange={(e) =>
                            setHowDidYouHearAboutUsOther(e.target.value)
                          }
                          error={errors.howDidYouHearAboutUsOther}
                          placeholder="Please specify..."
                        />
                      </FormGroup>
                    )}

                    <FormGroup className="md:col-span-2">
                      <MultiSelect
                        label="Do you identify as belonging to any of the following groups? (Optional)"
                        options={IDENTIFY_AS_OPTIONS}
                        value={identifyAs}
                        onChange={setIdentifyAs}
                        error={errors.identifyAs}
                        placeholder="Select all that apply..."
                      />
                    </FormGroup>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Link to="/admin/account">
              <Button
                type="button"
                variant="secondary"
                className="flex items-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </Link>

            <Button
              type="submit"
              variant="success"
              disabled={isSaving}
              className="flex items-center"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminAccountUpdatePage;
