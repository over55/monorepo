// File Path: monorepo/web/workery-frontend/src/pages/Admin/Staff/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useStaffManager,
  useTagManager,
  useVehicleTypeManager,
  useHowHearAboutUsItemManager,
} from "../../../../services/Services";
import { Loading, Alert, Button, Breadcrumb } from "../../../../components/UI";
import {
  RESIDENTIAL_STAFF_TYPE_OF_ID,
  COMMERCIAL_STAFF_TYPE_OF_ID,
  STAFF_PHONE_TYPE_OF_OPTIONS,
  STAFF_GENDER_OTHER,
} from "../../../../constants/Staff";
import {
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
} from "../../../../constants/FieldOptions";
import { HomeIcon } from "@heroicons/react/24/outline";

function AdminStaffUpdatePage() {
  const { aid } = useParams();
  const navigate = useNavigate();

  // Services
  const staffManager = useStaffManager();
  const tagManager = useTagManager();
  const vehicleTypeManager = useVehicleTypeManager();
  const howHearManager = useHowHearAboutUsItemManager();

  // Component State
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options for dropdowns
  const [tagOptions, setTagOptions] = useState([]);
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
  const [howHearOptions, setHowHearOptions] = useState([]);

  // Form Fields - Basic Info
  const [staffType, setStaffType] = useState(RESIDENTIAL_STAFF_TYPE_OF_ID);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
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

  // Load staff detail and options on mount
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
        setStaffType(staffData.type || RESIDENTIAL_STAFF_TYPE_OF_ID);
        setEmail(staffData.email || "");
        setPhone(staffData.phone || "");
        setPhoneType(staffData.phoneType || 0);
        setFirstName(staffData.firstName || "");
        setLastName(staffData.lastName || "");
        setOtherPhone(staffData.otherPhone || "");
        setOtherPhoneType(staffData.otherPhoneType || 0);
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
        setPoliceCheck(staffData.policeCheck || "");
        setDriversLicenseClass(staffData.driversLicenseClass || "");

        // Vehicle Types - Extract IDs
        if (staffData.vehicleTypes && Array.isArray(staffData.vehicleTypes)) {
          const vtIds = staffData.vehicleTypes.map((vt) => vt.id || vt);
          setVehicleTypes(vtIds);
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

        // Tags - Extract IDs
        if (staffData.tags && Array.isArray(staffData.tags)) {
          const tagIds = staffData.tags.map((tag) => tag.id || tag);
          setTags(tagIds);
        }

        setHowDidYouHearAboutUsID(staffData.howDidYouHearAboutUsID || "");
        setIsHowDidYouHearAboutUsOther(
          staffData.howDidYouHearAboutUsText === "Other",
        );
        setHowDidYouHearAboutUsOther(staffData.howDidYouHearAboutUsOther || "");

        // Date fields
        if (staffData.birthDate) {
          // Convert to YYYY-MM-DD format for HTML date input
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

        // Load select options
        const [tagsData, vehicleTypesData, howHearData] = await Promise.all([
          tagManager.getTagSelectOptions(onUnauthorized),
          vehicleTypeManager.getVehicleTypeSelectOptions(onUnauthorized),
          howHearManager.getSelectOptions(onUnauthorized),
        ]);

        if (!mounted) return;

        // Process options
        if (tagsData) {
          const options = Array.isArray(tagsData)
            ? tagsData
            : tagsData.results || tagsData.data || [];
          setTagOptions(options);
        }

        if (vehicleTypesData) {
          const options = Array.isArray(vehicleTypesData)
            ? vehicleTypesData
            : vehicleTypesData.results || vehicleTypesData.data || [];
          setVehicleTypeOptions(options);
        }

        if (howHearData) {
          const options = Array.isArray(howHearData)
            ? howHearData
            : howHearData.results || howHearData.data || [];
          setHowHearOptions(options);
        }
      } catch (error) {
        console.error("Error loading staff detail:", error);
        if (mounted) {
          setErrors(error || { general: "Failed to load staff details" });
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
    setSuccessMessage("");

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
        otherPhone,
        otherPhoneType: parseInt(otherPhoneType),
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
        policeCheck,
        driversLicenseClass,
        vehicleTypes: vehicleTypes.map((id) => parseInt(id)),
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactTelephone,
        emergencyContactAlternativeTelephone,
        description,
        tags: tags.map((id) => parseInt(id)),
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
      setSuccessMessage("Staff member updated successfully!");
      setTimeout(() => {
        navigate(`/admin/staff/${aid}`);
      }, 1500);
    } catch (error) {
      console.error("Error updating staff:", error);
      setErrors(error || { general: "Failed to update staff member" });
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle tag selection
  const handleTagChange = (tagId) => {
    const id = parseInt(tagId);
    if (tags.includes(id)) {
      setTags(tags.filter((t) => t !== id));
    } else {
      setTags([...tags, id]);
    }
  };

  // Handle vehicle type selection
  const handleVehicleTypeChange = (vtId) => {
    const id = parseInt(vtId);
    if (vehicleTypes.includes(id)) {
      setVehicleTypes(vehicleTypes.filter((v) => v !== id));
    } else {
      setVehicleTypes([...vehicleTypes, id]);
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

  // Breadcrumb items
  const breadcrumbItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: HomeIcon },
    { href: "/admin/staff", label: "Staff" },
    { href: `/admin/staff/${aid}`, label: "Detail" },
    { label: "Update" },
  ];

  if (isLoading) {
    return <Loading text="Loading staff details..." />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1>Update Staff Member</h1>

      {successMessage && <Alert type="success">{successMessage}</Alert>}

      {errors.general && <Alert type="error">{errors.general}</Alert>}

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <fieldset
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <legend>
            <strong>Basic Information</strong>
          </legend>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Type: <span style={{ color: "red" }}>*</span>
              <div>
                <label>
                  <input
                    type="radio"
                    value={RESIDENTIAL_STAFF_TYPE_OF_ID}
                    checked={staffType === RESIDENTIAL_STAFF_TYPE_OF_ID}
                    onChange={(e) => setStaffType(parseInt(e.target.value))}
                  />
                  Residential
                </label>
                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="radio"
                    value={COMMERCIAL_STAFF_TYPE_OF_ID}
                    checked={staffType === COMMERCIAL_STAFF_TYPE_OF_ID}
                    onChange={(e) => setStaffType(parseInt(e.target.value))}
                  />
                  Commercial
                </label>
              </div>
            </label>
            {errors.type && <div style={{ color: "red" }}>{errors.type}</div>}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              First Name: <span style={{ color: "red" }}>*</span>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                required
              />
            </label>
            {errors.firstName && (
              <div style={{ color: "red" }}>{errors.firstName}</div>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Last Name: <span style={{ color: "red" }}>*</span>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                required
              />
            </label>
            {errors.lastName && (
              <div style={{ color: "red" }}>{errors.lastName}</div>
            )}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Email: <span style={{ color: "red" }}>*</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                required
              />
            </label>
            {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <input
                type="checkbox"
                checked={isOkToEmail}
                onChange={(e) => setIsOkToEmail(e.target.checked)}
              />
              I agree to receive electronic email
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Phone: <span style={{ color: "red" }}>*</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                required
              />
            </label>
            {errors.phone && <div style={{ color: "red" }}>{errors.phone}</div>}
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Phone Type:
              <select
                value={phoneType}
                onChange={(e) => setPhoneType(parseInt(e.target.value))}
                style={{ display: "block", width: "100%", padding: "5px" }}
              >
                <option value={0}>Please select</option>
                {STAFF_PHONE_TYPE_OF_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <input
                type="checkbox"
                checked={isOkToText}
                onChange={(e) => setIsOkToText(e.target.checked)}
              />
              I agree to receive texts to my phone
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Other Phone (Optional):
              <input
                type="tel"
                value={otherPhone}
                onChange={(e) => setOtherPhone(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Other Phone Type:
              <select
                value={otherPhoneType}
                onChange={(e) => setOtherPhoneType(parseInt(e.target.value))}
                style={{ display: "block", width: "100%", padding: "5px" }}
              >
                <option value={0}>Please select</option>
                {STAFF_PHONE_TYPE_OF_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        {/* Address Information */}
        <fieldset
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <legend>
            <strong>Address Information</strong>
          </legend>

          <div style={{ marginBottom: "15px" }}>
            <label>
              <input
                type="checkbox"
                checked={hasShippingAddress}
                onChange={(e) => setHasShippingAddress(e.target.checked)}
              />
              Has shipping address different than billing address
            </label>
          </div>

          <div style={{ display: "flex", gap: "20px" }}>
            <div style={{ flex: 1 }}>
              {hasShippingAddress && <h4>Billing Address</h4>}

              <div style={{ marginBottom: "15px" }}>
                <label>
                  Country: <span style={{ color: "red" }}>*</span>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "5px" }}
                    placeholder="e.g., CA"
                    required
                  />
                </label>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>
                  Province/State: <span style={{ color: "red" }}>*</span>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "5px" }}
                    placeholder="e.g., Ontario"
                    required
                  />
                </label>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>
                  City: <span style={{ color: "red" }}>*</span>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "5px" }}
                    required
                  />
                </label>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>
                  Address Line 1: <span style={{ color: "red" }}>*</span>
                  <input
                    type="text"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "5px" }}
                    required
                  />
                </label>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>
                  Address Line 2 (Optional):
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "5px" }}
                  />
                </label>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label>
                  Postal Code: <span style={{ color: "red" }}>*</span>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    style={{ display: "block", width: "100%", padding: "5px" }}
                    required
                  />
                </label>
              </div>
            </div>

            {hasShippingAddress && (
              <div style={{ flex: 1 }}>
                <h4>Shipping Address</h4>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Name:
                    <input
                      type="text"
                      value={shippingName}
                      onChange={(e) => setShippingName(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Phone:
                    <input
                      type="tel"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Country:
                    <input
                      type="text"
                      value={shippingCountry}
                      onChange={(e) => setShippingCountry(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Province/State:
                    <input
                      type="text"
                      value={shippingRegion}
                      onChange={(e) => setShippingRegion(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    City:
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Address Line 1:
                    <input
                      type="text"
                      value={shippingAddressLine1}
                      onChange={(e) => setShippingAddressLine1(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Address Line 2:
                    <input
                      type="text"
                      value={shippingAddressLine2}
                      onChange={(e) => setShippingAddressLine2(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <label>
                    Postal Code:
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "5px",
                      }}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </fieldset>

        {/* Additional Information */}
        <fieldset
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <legend>
            <strong>Additional Information</strong>
          </legend>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Limitation or Special Consideration (Optional):
              <textarea
                value={limitSpecial}
                onChange={(e) => setLimitSpecial(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                rows={4}
                maxLength={638}
              />
            </label>
            <small>Max 638 characters</small>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Police Check Expiry:
              <input
                type="date"
                value={policeCheck}
                onChange={(e) => setPoliceCheck(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Driver's License Class (Optional):
              <input
                type="text"
                value={driversLicenseClass}
                onChange={(e) => setDriversLicenseClass(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Vehicle Types (Optional):</label>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
              }}
            >
              {vehicleTypeOptions.map((vt) => (
                <label
                  key={vt.value}
                  style={{ display: "block", marginBottom: "5px" }}
                >
                  <input
                    type="checkbox"
                    value={vt.value}
                    checked={vehicleTypes.includes(parseInt(vt.value))}
                    onChange={(e) => handleVehicleTypeChange(e.target.value)}
                  />
                  {vt.label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Emergency Contact */}
        <fieldset
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <legend>
            <strong>Emergency Contact</strong>
          </legend>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Contact Name:
              <input
                type="text"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Contact Relationship:
              <input
                type="text"
                value={emergencyContactRelationship}
                onChange={(e) =>
                  setEmergencyContactRelationship(e.target.value)
                }
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Contact Telephone:
              <input
                type="tel"
                value={emergencyContactTelephone}
                onChange={(e) => setEmergencyContactTelephone(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Contact Alternative Telephone (Optional):
              <input
                type="tel"
                value={emergencyContactAlternativeTelephone}
                onChange={(e) =>
                  setEmergencyContactAlternativeTelephone(e.target.value)
                }
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>
        </fieldset>

        {/* Metrics */}
        <fieldset
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <legend>
            <strong>Metrics</strong>
          </legend>

          <div style={{ marginBottom: "15px" }}>
            <label>Tags (Optional):</label>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
              }}
            >
              {tagOptions.map((tag) => (
                <label
                  key={tag.value}
                  style={{ display: "block", marginBottom: "5px" }}
                >
                  <input
                    type="checkbox"
                    value={tag.value}
                    checked={tags.includes(parseInt(tag.value))}
                    onChange={(e) => handleTagChange(e.target.value)}
                  />
                  {tag.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              How did you hear about us? <span style={{ color: "red" }}>*</span>
              <select
                value={howDidYouHearAboutUsID}
                onChange={(e) => {
                  const value = e.target.value;
                  setHowDidYouHearAboutUsID(value);
                  // Check if "Other" was selected
                  const selectedOption = howHearOptions.find(
                    (opt) => String(opt.value) === String(value),
                  );
                  setIsHowDidYouHearAboutUsOther(
                    selectedOption &&
                      selectedOption.label.toLowerCase() === "other",
                  );
                }}
                style={{ display: "block", width: "100%", padding: "5px" }}
                required
              >
                <option value="">Please select</option>
                {howHearOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {isHowDidYouHearAboutUsOther && (
            <div style={{ marginBottom: "15px" }}>
              <label>
                How did you hear about us? (Other):{" "}
                <span style={{ color: "red" }}>*</span>
                <input
                  type="text"
                  value={howDidYouHearAboutUsOther}
                  onChange={(e) => setHowDidYouHearAboutUsOther(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                  required={isHowDidYouHearAboutUsOther}
                />
              </label>
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label>
              Gender:
              <select
                value={gender}
                onChange={(e) => setGender(parseInt(e.target.value))}
                style={{ display: "block", width: "100%", padding: "5px" }}
              >
                <option value={0}>Please select</option>
                {GENDER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {gender === STAFF_GENDER_OTHER && (
            <div style={{ marginBottom: "15px" }}>
              <label>
                Gender (Other): <span style={{ color: "red" }}>*</span>
                <input
                  type="text"
                  value={genderOther}
                  onChange={(e) => setGenderOther(e.target.value)}
                  style={{ display: "block", width: "100%", padding: "5px" }}
                  required={gender === STAFF_GENDER_OTHER}
                />
              </label>
            </div>
          )}

          <div style={{ marginBottom: "15px" }}>
            <label>
              Birth Date (Optional):
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                max={new Date().toISOString().split("T")[0]}
              />
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Join Date (Optional):
              <input
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
              />
            </label>
          </div>
        </fieldset>

        {/* System Information */}
        <fieldset
          style={{
            marginBottom: "30px",
            padding: "20px",
            border: "1px solid #ddd",
          }}
        >
          <legend>
            <strong>System Information</strong>
          </legend>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Description (Optional):
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ display: "block", width: "100%", padding: "5px" }}
                rows={4}
                maxLength={638}
              />
            </label>
            <small>Max 638 characters</small>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Preferred Language:
              <div>
                <label>
                  <input
                    type="radio"
                    value="English"
                    checked={preferredLanguage === "English"}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  />
                  English
                </label>
                <label style={{ marginLeft: "15px" }}>
                  <input
                    type="radio"
                    value="French"
                    checked={preferredLanguage === "French"}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                  />
                  French
                </label>
              </div>
            </label>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>
              Do you identify as belonging to any of the following groups?
              (Optional):
            </label>
            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                border: "1px solid #ddd",
                padding: "10px",
              }}
            >
              {IDENTIFY_AS_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{ display: "block", marginBottom: "5px" }}
                >
                  <input
                    type="checkbox"
                    value={opt.value}
                    checked={identifyAs.includes(opt.value)}
                    onChange={(e) => handleIdentifyAsChange(e.target.value)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        {/* Form Actions */}
        <div
          style={{
            marginTop: "30px",
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <Link to={`/admin/staff/${aid}`}>
            <button type="button" style={{ padding: "10px 20px" }}>
              ← Back to Detail
            </button>
          </Link>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: "10px 20px",
              backgroundColor: isSubmitting ? "#ccc" : "#28a745",
              color: "white",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminStaffUpdatePage;
