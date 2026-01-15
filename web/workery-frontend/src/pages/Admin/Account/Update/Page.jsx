// File Path: web/workery-frontend/src/pages/Admin/Account/Update/Page.jsx
// UIX Upgraded - Uses UIX primitives (Card, Alert, Breadcrumb, Spinner, Button)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAccountManager,
  useAuthManager,
  useTagManager,
  useVehicleTypeManager,
  useHowHearAboutUsItemManager,
} from "../../../../services/Services";
import {
  Card,
  Alert,
  Breadcrumb,
  Spinner,
  Button,
  UIXThemeProvider,
  useUIXTheme,
} from "../../../../components/UIX";
import {
  UserCircleIcon,
  PencilIcon,
  ChevronLeftIcon,
  HomeIcon,
  CheckCircleIcon,
  IdentificationIcon,
  MapPinIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  BriefcaseIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
} from "../../../../constants/Roles";
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
  const { getThemeClasses } = useUIXTheme();

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
  const [phoneExtension, setPhoneExtension] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToEmail, setIsOkToEmail] = useState(false);
  const [isOkToText, setIsOkToText] = useState(false);
  const [faxNumber, setFaxNumber] = useState("");

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
  const [agreePromotionsEmail, setAgreePromotionsEmail] = useState(false);

  // Options for dropdowns
  const [tagOptions, setTagOptions] = useState([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [howHearOptions, setHowHearOptions] = useState([]);

  // Memoize theme classes
  const themeClasses = useMemo(() => ({
    textPrimary: getThemeClasses("text-primary"),
    textSecondary: getThemeClasses("text-secondary"),
    linkPrimary: getThemeClasses("link-primary"),
    bgMuted: getThemeClasses("bg-muted"),
  }), [getThemeClasses]);

  // Handle unauthorized access
  const onUnauthorized = useCallback(() => {
    authManager.clearAllTokens();
    navigate("/login?unauthorized=true");
  }, [authManager, navigate]);

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
          setPhoneExtension(profileData.phoneExtension || "");
          setOtherPhone(profileData.otherPhone || "");
          setOtherPhoneType(profileData.otherPhoneType || 0);
          setOtherPhoneExtension(profileData.otherPhoneExtension || "");
          setIsOkToEmail(profileData.isOkToEmail || false);
          setIsOkToText(profileData.isOkToText || false);
          setFaxNumber(profileData.faxNumber || "");
          setAgreePromotionsEmail(profileData.agreePromotionsEmail || false);

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
    onUnauthorized,
  ]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    setIsSaving(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Prepare update payload
      let payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        otherPhone: otherPhone.trim(),
        otherPhoneType: parseInt(otherPhoneType) || 0,
        otherPhoneExtension: otherPhoneExtension.trim(),
        isOkToText: isOkToText,
        faxNumber: faxNumber.trim(),
        country: country,
        region: region,
        city: city.trim(),
        hasShippingAddress: hasShippingAddress,
      };

      // Only include these fields for non-Executive users
      if (currentUser.role !== EXECUTIVE_ROLE_ID) {
        payload = {
          ...payload,
          phoneType: parseInt(phoneType) || 0,
          phoneExtension: phoneExtension.trim(),
          isOkToEmail: isOkToEmail,
          agreePromotionsEmail: agreePromotionsEmail,
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim(),
          postalCode: postalCode.trim(),
        };
      }

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

      // Debug log in development
      if (process.env.NODE_ENV === "development") {
        console.log("Submitting profile update with payload:", payload);
      }

      // Submit update
      await accountManager.updateAccount(
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
  }, [
    firstName, lastName, email, phone, otherPhone, otherPhoneType, otherPhoneExtension,
    isOkToText, faxNumber, country, region, city, hasShippingAddress, currentUser,
    phoneType, phoneExtension, isOkToEmail, agreePromotionsEmail, addressLine1,
    addressLine2, postalCode, shippingName, shippingPhone, shippingCountry,
    shippingRegion, shippingCity, shippingAddressLine1, shippingAddressLine2,
    shippingPostalCode, limitSpecial, policeCheck, driversLicenseClass,
    vehicleTypes, emergencyContactName, emergencyContactRelationship,
    emergencyContactTelephone, emergencyContactAlternativeTelephone, description,
    preferredLanguage, tags, gender, genderOther, birthDate, howDidYouHearAboutUsId,
    isHowDidYouHearAboutUsOther, howDidYouHearAboutUsOther, identifyAs,
    accountManager, onUnauthorized, navigate,
  ]);

  // Breadcrumb items
  const breadcrumbItems = useMemo(() => [
    { label: "Dashboard", to: "/admin/dashboard", icon: HomeIcon },
    { label: "My Profile", to: "/admin/account", icon: UserCircleIcon },
    { label: "Edit", icon: PencilIcon, isActive: true },
  ], []);

  // Loading state
  if (isLoading) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-4xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Card padding="p-0" className="flex items-center justify-center min-h-[400px] border-0 shadow-none">
          <div className="text-center">
            <Spinner size="lg" />
            <p className="mt-4 text-gray-600">Loading account details...</p>
          </div>
        </Card>
      </Card>
    );
  }

  // No data state
  if (!currentUser) {
    return (
      <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-4xl mx-auto border-0 shadow-none">
        <Breadcrumb items={breadcrumbItems} className="mb-6" />
        <Alert type="warning" className="mb-4">No account data found</Alert>
        <Link to="/admin/account">
          <Button variant="secondary" icon={ChevronLeftIcon}>
            Back to Profile
          </Button>
        </Link>
      </Card>
    );
  }

  // Check if user is Executive (simplified form)
  const isExecutive = currentUser.role === EXECUTIVE_ROLE_ID;

  return (
    <Card padding="p-4 sm:p-6 lg:p-8" className="max-w-4xl mx-auto border-0 shadow-none">
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} className="mb-6" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-2xl md:text-3xl font-bold ${themeClasses.textPrimary} flex items-center`}>
          <PencilIcon className={`w-6 h-6 md:w-8 md:h-8 mr-3 ${themeClasses.linkPrimary}`} />
          Edit Profile
        </h1>
        <p className={`mt-2 ${themeClasses.textSecondary}`}>
          Update your account information
        </p>
        {isExecutive && (
          <Alert type="info" className="mt-4" icon={InformationCircleIcon}>
            Note: As an Executive user, some fields are restricted and cannot be edited.
          </Alert>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert type="success" className="mb-6" icon={CheckCircleIcon}>
          {successMessage}
        </Alert>
      )}

      {/* Error Message */}
      {errors.general && (
        <Alert type="error" className="mb-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  placeholder="Enter your first name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  placeholder="Enter your last name"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>

              {!isExecutive && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.birthDate ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.birthDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.birthDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(parseInt(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.gender ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {GENDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.gender && (
                      <p className="mt-1 text-sm text-red-500">{errors.gender}</p>
                    )}
                  </div>

                  {gender === 1 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender (Other)
                      </label>
                      <input
                        type="text"
                        value={genderOther}
                        onChange={(e) => setGenderOther(e.target.value)}
                        placeholder="Please specify"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.genderOther ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.genderOther && (
                        <p className="mt-1 text-sm text-red-500">{errors.genderOther}</p>
                      )}
                    </div>
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
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="email@example.com"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Only show email agreement checkboxes for non-Executives */}
              {!isExecutive && (
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={isOkToEmail}
                      onChange={(e) => setIsOkToEmail(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to receive electronic emails
                    </span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="(123) 456-7890"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.phone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                )}
              </div>

              {/* Only show phone type for non-Executives */}
              {!isExecutive && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Type
                  </label>
                  <select
                    value={phoneType}
                    onChange={(e) => setPhoneType(parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phoneType ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    {ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.phoneType && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneType}</p>
                  )}
                </div>
              )}

              {!isExecutive && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Extension (Optional)
                  </label>
                  <input
                    type="text"
                    value={phoneExtension}
                    onChange={(e) => setPhoneExtension(e.target.value)}
                    placeholder="1234"
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phoneExtension ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.phoneExtension && (
                    <p className="mt-1 text-sm text-red-500">{errors.phoneExtension}</p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isOkToText}
                    onChange={(e) => setIsOkToText(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    I agree to receive text messages
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={otherPhone}
                  onChange={(e) => setOtherPhone(e.target.value)}
                  placeholder="(123) 456-7890"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.otherPhone ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.otherPhone && (
                  <p className="mt-1 text-sm text-red-500">{errors.otherPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Other Phone Type (Optional)
                </label>
                <select
                  value={otherPhoneType}
                  onChange={(e) => setOtherPhoneType(parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.otherPhoneType ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.otherPhoneType && (
                  <p className="mt-1 text-sm text-red-500">{errors.otherPhoneType}</p>
                )}
              </div>

              {!isExecutive && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Other Phone Extension (Optional)
                    </label>
                    <input
                      type="text"
                      value={otherPhoneExtension}
                      onChange={(e) => setOtherPhoneExtension(e.target.value)}
                      placeholder="1234"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.otherPhoneExtension ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.otherPhoneExtension && (
                      <p className="mt-1 text-sm text-red-500">{errors.otherPhoneExtension}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fax Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={faxNumber}
                      onChange={(e) => setFaxNumber(e.target.value)}
                      placeholder="(123) 456-7890"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.faxNumber ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.faxNumber && (
                      <p className="mt-1 text-sm text-red-500">{errors.faxNumber}</p>
                    )}
                  </div>
                </>
              )}

              {/* Only show promotional email checkbox for non-Executives */}
              {!isExecutive && (
                <div className="md:col-span-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={agreePromotionsEmail}
                      onChange={(e) => setAgreePromotionsEmail(e.target.checked)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      I agree to receive promotional emails
                    </span>
                  </label>
                </div>
              )}
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
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={hasShippingAddress}
                    onChange={(e) => setHasShippingAddress(e.target.checked)}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Has shipping address different from billing address
                  </span>
                </label>
              </div>
            )}

            <div className={hasShippingAddress ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
              <div>
                {hasShippingAddress && (
                  <h3 className="text-md font-medium text-gray-700 mb-4">
                    Billing Address
                  </h3>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.country ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {COUNTRY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.country && (
                      <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Province/State <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      required
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.region ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Select...</option>
                      {(REGION_OPTIONS[country] || []).map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.region && (
                      <p className="mt-1 text-sm text-red-500">{errors.region}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      placeholder="Enter city"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.city ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  {/* Only show address line 1 for non-Executives */}
                  {!isExecutive && (
                    <>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 1 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          required
                          placeholder="Street address"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.addressLine1 ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.addressLine1 && (
                          <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          placeholder="Apartment, suite, etc."
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.addressLine2 ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.addressLine2 && (
                          <p className="mt-1 text-sm text-red-500">{errors.addressLine2}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          required
                          placeholder="A1B 2C3"
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            errors.postalCode ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                        {errors.postalCode && (
                          <p className="mt-1 text-sm text-red-500">{errors.postalCode}</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {hasShippingAddress && (
                <div>
                  <h3 className="text-md font-medium text-gray-700 mb-4">
                    Shipping Address
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        value={shippingName}
                        onChange={(e) => setShippingName(e.target.value)}
                        placeholder="Contact name for shipping"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingName ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingName && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingName}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={shippingPhone}
                        onChange={(e) => setShippingPhone(e.target.value)}
                        placeholder="(123) 456-7890"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingPhone ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingPhone && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingPhone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={shippingCountry}
                        onChange={(e) => setShippingCountry(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingCountry ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {COUNTRY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.shippingCountry && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingCountry}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Province/State
                      </label>
                      <select
                        value={shippingRegion}
                        onChange={(e) => setShippingRegion(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingRegion ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Select...</option>
                        {(REGION_OPTIONS[shippingCountry] || []).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.shippingRegion && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingRegion}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={shippingCity}
                        onChange={(e) => setShippingCity(e.target.value)}
                        placeholder="Enter city"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingCity ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingCity && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingCity}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 1
                      </label>
                      <input
                        type="text"
                        value={shippingAddressLine1}
                        onChange={(e) => setShippingAddressLine1(e.target.value)}
                        placeholder="Street address"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingAddressLine1 ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingAddressLine1 && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingAddressLine1}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        value={shippingAddressLine2}
                        onChange={(e) => setShippingAddressLine2(e.target.value)}
                        placeholder="Apartment, suite, etc."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingAddressLine2 ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingAddressLine2 && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingAddressLine2}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        value={shippingPostalCode}
                        onChange={(e) => setShippingPostalCode(e.target.value)}
                        placeholder="A1B 2C3"
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.shippingPostalCode ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.shippingPostalCode && (
                        <p className="mt-1 text-sm text-red-500">{errors.shippingPostalCode}</p>
                      )}
                    </div>
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
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Limitations or Special Considerations (Optional)
                    </label>
                    <textarea
                      value={limitSpecial}
                      onChange={(e) => setLimitSpecial(e.target.value)}
                      rows={4}
                      placeholder="Enter any limitations or special considerations..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.limitSpecial ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Maximum 638 characters</p>
                    {errors.limitSpecial && (
                      <p className="mt-1 text-sm text-red-500">{errors.limitSpecial}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Police Check Expiry (Optional)
                    </label>
                    <input
                      type="date"
                      value={policeCheck}
                      onChange={(e) => setPoliceCheck(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.policeCheck ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.policeCheck && (
                      <p className="mt-1 text-sm text-red-500">{errors.policeCheck}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Driver's License Class (Optional)
                    </label>
                    <input
                      type="text"
                      value={driversLicenseClass}
                      onChange={(e) => setDriversLicenseClass(e.target.value)}
                      placeholder="e.g., G, G2"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.driversLicenseClass ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.driversLicenseClass && (
                      <p className="mt-1 text-sm text-red-500">{errors.driversLicenseClass}</p>
                    )}
                  </div>

                  {vehicleTypeOptions.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Vehicle Types (Optional)
                      </label>
                      <select
                        multiple
                        value={vehicleTypes}
                        onChange={(e) => {
                          const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                          setVehicleTypes(selectedValues);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] ${
                          errors.vehicleTypes ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {vehicleTypeOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                      {errors.vehicleTypes && (
                        <p className="mt-1 text-sm text-red-500">{errors.vehicleTypes}</p>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Enter a description..."
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.description ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">Maximum 638 characters</p>
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-500">{errors.description}</p>
                    )}
                  </div>

                  <div>
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
                          onChange={(e) => setPreferredLanguage(e.target.value)}
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
                          onChange={(e) => setPreferredLanguage(e.target.value)}
                          className="mr-2"
                        />
                        French
                      </label>
                    </div>
                  </div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      placeholder="Emergency contact name"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.emergencyContactName ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.emergencyContactName && (
                      <p className="mt-1 text-sm text-red-500">{errors.emergencyContactName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={emergencyContactRelationship}
                      onChange={(e) => setEmergencyContactRelationship(e.target.value)}
                      placeholder="e.g., Spouse, Parent, Friend"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.emergencyContactRelationship ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.emergencyContactRelationship && (
                      <p className="mt-1 text-sm text-red-500">{errors.emergencyContactRelationship}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactTelephone}
                      onChange={(e) => setEmergencyContactTelephone(e.target.value)}
                      placeholder="(123) 456-7890"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.emergencyContactTelephone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.emergencyContactTelephone && (
                      <p className="mt-1 text-sm text-red-500">{errors.emergencyContactTelephone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alternative Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={emergencyContactAlternativeTelephone}
                      onChange={(e) => setEmergencyContactAlternativeTelephone(e.target.value)}
                      placeholder="(123) 456-7890"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.emergencyContactAlternativeTelephone ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    {errors.emergencyContactAlternativeTelephone && (
                      <p className="mt-1 text-sm text-red-500">{errors.emergencyContactAlternativeTelephone}</p>
                    )}
                  </div>
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tags (Optional)
                      </label>
                      <select
                        multiple
                        value={tags}
                        onChange={(e) => {
                          const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
                          setTags(selectedValues);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] ${
                          errors.tags ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        {tagOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                      {errors.tags && (
                        <p className="mt-1 text-sm text-red-500">{errors.tags}</p>
                      )}
                    </div>
                  )}

                  {howHearOptions.length > 0 && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How did you hear about us?
                      </label>
                      <select
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
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.howDidYouHearAboutUsId ? "border-red-500" : "border-gray-300"
                        }`}
                      >
                        <option value="">Please select</option>
                        {howHearOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      {errors.howDidYouHearAboutUsId && (
                        <p className="mt-1 text-sm text-red-500">{errors.howDidYouHearAboutUsId}</p>
                      )}
                    </div>
                  )}

                  {isHowDidYouHearAboutUsOther && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        How did you hear about us? (Other)
                      </label>
                      <input
                        type="text"
                        value={howDidYouHearAboutUsOther}
                        onChange={(e) => setHowDidYouHearAboutUsOther(e.target.value)}
                        placeholder="Please specify..."
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.howDidYouHearAboutUsOther ? "border-red-500" : "border-gray-300"
                        }`}
                      />
                      {errors.howDidYouHearAboutUsOther && (
                        <p className="mt-1 text-sm text-red-500">{errors.howDidYouHearAboutUsOther}</p>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Do you identify as belonging to any of the following groups? (Optional)
                    </label>
                    <select
                      multiple
                      value={identifyAs}
                      onChange={(e) => {
                        const selectedValues = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                        setIdentifyAs(selectedValues);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] ${
                        errors.identifyAs ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      {IDENTIFY_AS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">Hold Ctrl/Cmd to select multiple</p>
                    {errors.identifyAs && (
                      <p className="mt-1 text-sm text-red-500">{errors.identifyAs}</p>
                    )}
                  </div>
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
              icon={ChevronLeftIcon}
            >
              Back to Profile
            </Button>
          </Link>

          <Button
            type="submit"
            variant="primary"
            disabled={isSaving}
            icon={isSaving ? null : CheckCircleIcon}
          >
            {isSaving ? (
              <span className="flex items-center">
                <Spinner size="sm" className="mr-2" />
                Saving...
              </span>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}

// Wrapper with UIXThemeProvider
function AdminAccountUpdatePageWithProvider() {
  return (
    <UIXThemeProvider>
      <AdminAccountUpdatePage />
    </UIXThemeProvider>
  );
}

export default AdminAccountUpdatePageWithProvider;
