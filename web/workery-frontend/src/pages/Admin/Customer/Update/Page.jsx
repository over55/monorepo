// File Path: web/workery-frontend/src/pages/Admin/Customer/Update/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useCustomerManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  Textarea,
  Select,
  Checkbox,
  FormGroup,
} from "../../../../components/UI";
import HowHearAboutUsSelect from "../../../../components/Form/HowHearAboutUsSelect";
import TagsMultiSelect from "../../../../components/Form/TagsMultiSelect";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../constants/Customer";

// Constants
const CLIENT_PHONE_TYPE_WORK = 2;

// Option configurations
const CLIENT_TYPE_OPTIONS = [
  { value: RESIDENTIAL_CUSTOMER_TYPE_OF_ID, label: "Residential" },
  { value: COMMERCIAL_CUSTOMER_TYPE_OF_ID, label: "Commercial" },
];

const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Unknown" },
  { value: 2, label: "Private" },
  { value: 3, label: "Non-profit" },
  { value: 4, label: "Government" },
];

const CLIENT_PHONE_TYPE_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Mobile" },
  { value: 2, label: "Work" },
  { value: 3, label: "Home" },
];

const GENDER_OPTIONS = [
  { value: "", label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
  { value: 4, label: "Prefer not to say" },
];

function AdminCustomerUpdatePage() {
  const { cid } = useParams();
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // State management
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state - Settings
  const [customerType, setCustomerType] = useState(
    RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  );

  // Form state - Contact
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState("");
  const [phoneExtension, setPhoneExtension] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState("");
  const [otherPhoneExtension, setOtherPhoneExtension] = useState("");
  const [isOkToText, setIsOkToText] = useState(false);
  const [isOkToEmail, setIsOkToEmail] = useState(false);

  // Form state - Address
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("Canada");
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("Canada");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

  // Form state - Metrics
  const [tags, setTags] = useState([]);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState("");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] =
    useState("");
  const [birthDate, setBirthDate] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [gender, setGender] = useState("");
  const [genderOther, setGenderOther] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Handle unauthorized access
  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch customer details
  const fetchCustomerDetail = async () => {
    if (!cid) return;

    setFetching(true);
    setErrors({});

    try {
      const response = await customerManager.getCustomerDetail(
        cid,
        onUnauthorized,
      );
      console.log("Customer detail fetched:", response);

      setCustomer(response);

      // Populate form fields with customer data
      // Settings
      setCustomerType(response.type || RESIDENTIAL_CUSTOMER_TYPE_OF_ID);

      // Contact
      setOrganizationName(response.organizationName || "");
      setOrganizationType(response.organizationType || "");
      setEmail(response.email || "");
      setPhone(response.phone || "");
      setPhoneType(response.phoneType || "");
      setPhoneExtension(response.phoneExtension || "");
      setFirstName(response.firstName || "");
      setLastName(response.lastName || "");
      setOtherPhone(response.otherPhone || "");
      setOtherPhoneType(response.otherPhoneType || "");
      setOtherPhoneExtension(response.otherPhoneExtension || "");
      setIsOkToText(response.isOkToText || false);
      setIsOkToEmail(response.isOkToEmail || false);

      // Address
      setPostalCode(response.postalCode || "");
      setAddressLine1(response.addressLine1 || "");
      setAddressLine2(response.addressLine2 || "");
      setCity(response.city || "");
      setRegion(response.region || "");
      setCountry(response.country || "Canada");
      setHasShippingAddress(response.hasShippingAddress || false);
      setShippingName(response.shippingName || "");
      setShippingPhone(response.shippingPhone || "");
      setShippingCountry(response.shippingCountry || "Canada");
      setShippingRegion(response.shippingRegion || "");
      setShippingCity(response.shippingCity || "");
      setShippingAddressLine1(response.shippingAddressLine1 || "");
      setShippingAddressLine2(response.shippingAddressLine2 || "");
      setShippingPostalCode(response.shippingPostalCode || "");

      // Metrics
      // Extract tag IDs from tag objects
      if (response.tags && Array.isArray(response.tags)) {
        const tagIds = response.tags.map((tag) => {
          if (typeof tag === "object" && tag !== null) {
            return tag.id || tag.value || tag;
          }
          return tag;
        });
        setTags(tagIds);
      } else {
        setTags([]);
      }

      setHowDidYouHearAboutUsID(
        response.howDidYouHearAboutUsID ||
          response.howDidYouHearAboutUsId ||
          "",
      );
      setIsHowDidYouHearAboutUsOther(
        response.howDidYouHearAboutUsText === "Other" ||
          response.isHowDidYouHearAboutUsOther ||
          false,
      );
      setHowDidYouHearAboutUsOther(response.howDidYouHearAboutUsOther || "");

      // Format dates for input fields
      if (response.birthDate) {
        const birthDateObj = new Date(response.birthDate);
        setBirthDate(birthDateObj.toISOString().split("T")[0]);
      }
      if (response.joinDate) {
        const joinDateObj = new Date(response.joinDate);
        setJoinDate(joinDateObj.toISOString().split("T")[0]);
      }

      setGender(response.gender || "");
      setGenderOther(response.genderOther || "");
      setPreferredLanguage(response.preferredLanguage || "English");
    } catch (error) {
      console.error("Failed to fetch customer details:", error);
      setErrors({
        message: "Failed to load customer details. Please try again.",
      });
    } finally {
      setFetching(false);
    }
  };

  // Submit form
  const onSubmitClick = async (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    const data = {
      id: cid,
      type: customerType,
      organizationName: organizationName,
      organizationType: organizationType ? parseInt(organizationType) : null,
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      phoneType: phoneType ? parseInt(phoneType) : null,
      phoneExtension: phoneExtension,
      otherPhone: otherPhone,
      otherPhoneExtension: otherPhoneExtension,
      otherPhoneType: otherPhoneType ? parseInt(otherPhoneType) : null,
      isOkToText: isOkToText,
      isOkToEmail: isOkToEmail,
      postalCode: postalCode,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      city: city,
      region: region,
      country: country,
      hasShippingAddress: hasShippingAddress,
      shippingName: shippingName,
      shippingPhone: shippingPhone,
      shippingCountry: shippingCountry,
      shippingRegion: shippingRegion,
      shippingCity: shippingCity,
      shippingAddressLine1: shippingAddressLine1,
      shippingAddressLine2: shippingAddressLine2,
      shippingPostalCode: shippingPostalCode,
      tags: tags.filter(
        (tag) =>
          tag !== null &&
          tag !== undefined &&
          tag !== "" &&
          tag !== "0" &&
          tag !== 0,
      ),
      gender: gender ? parseInt(gender) : null,
      genderOther: genderOther,
      joinDate: joinDate,
      birthDate: birthDate,
      howDidYouHearAboutUsID: howDidYouHearAboutUsID,
      isHowDidYouHearAboutUsOther: isHowDidYouHearAboutUsOther,
      howDidYouHearAboutUsOther: howDidYouHearAboutUsOther,
      preferredLanguage: preferredLanguage,
    };

    console.log("Submitting data:", data);

    setSubmitting(true);
    setErrors({});

    try {
      const response = await customerManager.updateCustomer(
        cid,
        data,
        onUnauthorized,
      );
      console.log("Customer updated successfully:", response);

      setSuccess("Customer updated successfully!");

      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${cid}`);
      }, 1500);
    } catch (error) {
      console.error("Failed to update customer:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setSubmitting(false);
    }
  };

  // Initial data load
  useEffect(() => {
    window.scrollTo(0, 0);
    fetchCustomerDetail();
  }, [cid]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Customers", path: "/admin/customers", icon: "👤" },
    { label: "Detail", path: `/admin/customer/${cid}`, icon: "ℹ️" },
    { label: "Update", icon: "✏️" },
  ];

  if (isFetching) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading customer details..." />
      </div>
    );
  }

  return (
    <div style={globalStyles.container}>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>👤 Customer</h1>
          <h4 style={{ margin: "5px 0 0 0", color: theme.colors.secondary }}>
            ✏️ Edit
          </h4>
        </div>
      </div>

      {/* Status Alerts */}
      {customer && customer.status === 2 && (
        <Alert type="info">📁 This customer is archived</Alert>
      )}

      {/* Success/Error Messages */}
      {success && (
        <Alert type="success" dismissible onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {errors.message && (
        <Alert type="error" dismissible onDismiss={() => setErrors({})}>
          {errors.message}
        </Alert>
      )}

      {/* Main Form */}
      <Card>
        <form onSubmit={onSubmitClick}>
          <div style={{ marginBottom: "30px" }}>
            <h3 style={{ marginBottom: "5px" }}>✏️ Edit Customer</h3>
            <p style={{ color: theme.colors.secondary, margin: 0 }}>
              Please fill out all the required fields before submitting this
              form.
            </p>
          </div>

          {/* Settings Section */}
          <div style={{ marginBottom: "40px" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              ⚙️ Settings
            </h4>

            <FormGroup label="Type" required={true}>
              <div style={{ marginTop: "10px" }}>
                {CLIENT_TYPE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    style={{
                      marginRight: "20px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="radio"
                      name="customerType"
                      value={option.value}
                      checked={customerType === option.value}
                      onChange={(e) =>
                        setCustomerType(parseInt(e.target.value))
                      }
                      disabled={isSubmitting}
                      style={{ marginRight: "8px" }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.type && (
                <div style={globalStyles.errorMessage}>{errors.type}</div>
              )}
            </FormGroup>
          </div>

          {/* Contact Section */}
          <div style={{ marginBottom: "40px" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              🆔 Contact
            </h4>

            {customerType === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
              <>
                <Input
                  label="Organization Name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  error={errors.organizationName}
                  required={true}
                />

                <Select
                  label="Organization Type"
                  value={organizationType}
                  onChange={(e) => setOrganizationType(e.target.value)}
                  options={CLIENT_ORGANIZATION_TYPE_OPTIONS}
                  error={errors.organizationType}
                />
              </>
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
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={errors.firstName}
                required={true}
              />

              <Input
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={errors.lastName}
                required={true}
              />
            </div>

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              helperText="Optional field if not set then workery will generate a temporary email."
            />

            <Checkbox
              label="I agree to receive electronic email"
              checked={isOkToEmail}
              onChange={(e) => setIsOkToEmail(e.target.checked)}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={errors.phone}
                required={true}
              />

              <Select
                label="Phone Type"
                value={phoneType}
                onChange={(e) => setPhoneType(e.target.value)}
                options={CLIENT_PHONE_TYPE_OPTIONS}
                error={errors.phoneType}
              />
            </div>

            {phoneType == CLIENT_PHONE_TYPE_WORK && (
              <Input
                label="Phone Extension (Optional)"
                value={phoneExtension}
                onChange={(e) => setPhoneExtension(e.target.value)}
                error={errors.phoneExtension}
                style={{ maxWidth: "200px" }}
              />
            )}

            <Checkbox
              label="I agree to receive texts to my phone"
              checked={isOkToText}
              onChange={(e) => setIsOkToText(e.target.checked)}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Other Phone (Optional)"
                value={otherPhone}
                onChange={(e) => setOtherPhone(e.target.value)}
                error={errors.otherPhone}
              />

              <Select
                label="Other Phone Type (Optional)"
                value={otherPhoneType}
                onChange={(e) => setOtherPhoneType(e.target.value)}
                options={CLIENT_PHONE_TYPE_OPTIONS}
                error={errors.otherPhoneType}
              />
            </div>

            {otherPhoneType == CLIENT_PHONE_TYPE_WORK && (
              <Input
                label="Other Phone Extension (Optional)"
                value={otherPhoneExtension}
                onChange={(e) => setOtherPhoneExtension(e.target.value)}
                error={errors.otherPhoneExtension}
                style={{ maxWidth: "200px" }}
              />
            )}
          </div>

          {/* Address Section */}
          <div style={{ marginBottom: "40px" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              📍 Address
            </h4>

            <Checkbox
              label="Has shipping address different than billing address"
              checked={hasShippingAddress}
              onChange={(e) => setHasShippingAddress(e.target.checked)}
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: hasShippingAddress ? "1fr 1fr" : "1fr",
                gap: "30px",
                marginTop: "20px",
              }}
            >
              {/* Billing Address */}
              <div>
                {hasShippingAddress && (
                  <h5 style={{ marginBottom: "15px" }}>Billing Address</h5>
                )}

                <Input
                  label="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  error={errors.country}
                  required={true}
                />

                <Input
                  label="Province/Territory"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  error={errors.region}
                  required={true}
                />

                <Input
                  label="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  error={errors.city}
                  required={true}
                />

                <Input
                  label="Address Line 1"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  error={errors.addressLine1}
                  required={true}
                />

                <Input
                  label="Address Line 2 (Optional)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  error={errors.addressLine2}
                />

                <Input
                  label="Postal Code"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  error={errors.postalCode}
                  required={true}
                  style={{ maxWidth: "200px" }}
                />
              </div>

              {/* Shipping Address */}
              {hasShippingAddress && (
                <div>
                  <h5 style={{ marginBottom: "15px" }}>Shipping Address</h5>

                  <Input
                    label="Name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    error={errors.shippingName}
                    helperText="The name to contact for this shipping address"
                    required={true}
                  />

                  <Input
                    label="Phone"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    error={errors.shippingPhone}
                    helperText="The contact phone number for this shipping address"
                    required={true}
                  />

                  <Input
                    label="Country"
                    value={shippingCountry}
                    onChange={(e) => setShippingCountry(e.target.value)}
                    error={errors.shippingCountry}
                    required={true}
                  />

                  <Input
                    label="Province/Territory"
                    value={shippingRegion}
                    onChange={(e) => setShippingRegion(e.target.value)}
                    error={errors.shippingRegion}
                    required={true}
                  />

                  <Input
                    label="City"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    error={errors.shippingCity}
                    required={true}
                  />

                  <Input
                    label="Address Line 1"
                    value={shippingAddressLine1}
                    onChange={(e) => setShippingAddressLine1(e.target.value)}
                    error={errors.shippingAddressLine1}
                    required={true}
                  />

                  <Input
                    label="Address Line 2 (Optional)"
                    value={shippingAddressLine2}
                    onChange={(e) => setShippingAddressLine2(e.target.value)}
                    error={errors.shippingAddressLine2}
                  />

                  <Input
                    label="Postal Code"
                    value={shippingPostalCode}
                    onChange={(e) => setShippingPostalCode(e.target.value)}
                    error={errors.shippingPostalCode}
                    required={true}
                    style={{ maxWidth: "200px" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Metrics Section */}
          <div style={{ marginBottom: "40px" }}>
            <h4
              style={{
                fontSize: "1.25rem",
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              📊 Metrics
            </h4>

            <TagsMultiSelect
              value={tags}
              onChange={(selectedTagIds) => {
                setTags(selectedTagIds);
                // Clear error when value changes
                if (errors.tags) {
                  setErrors((prev) => ({ ...prev, tags: null }));
                }
              }}
              error={errors.tags}
              required={false}
              disabled={isSubmitting}
              label="Tags (Optional)"
              placeholder="Select tags..."
              helperText="Pick the tags you would like to associate with this client."
              onUnauthorized={onUnauthorized}
            />

            <HowHearAboutUsSelect
              value={howDidYouHearAboutUsID}
              onChange={(value) => {
                setHowDidYouHearAboutUsID(value);
                // Clear error when value changes
                if (errors.howDidYouHearAboutUsID) {
                  setErrors((prev) => ({
                    ...prev,
                    howDidYouHearAboutUsID: null,
                  }));
                }
              }}
              onOtherDetected={setIsHowDidYouHearAboutUsOther}
              error={errors.howDidYouHearAboutUsID}
              required={true}
              disabled={isSubmitting}
              onUnauthorized={onUnauthorized}
            />

            {isHowDidYouHearAboutUsOther && (
              <Input
                label="How did you hear about us? (Other)"
                value={howDidYouHearAboutUsOther}
                onChange={(e) => setHowDidYouHearAboutUsOther(e.target.value)}
                error={errors.howDidYouHearAboutUsOther}
                required={true}
              />
            )}

            <Select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              options={GENDER_OPTIONS}
              error={errors.gender}
            />

            {gender == 1 && (
              <Input
                label="Gender (Other)"
                value={genderOther}
                onChange={(e) => setGenderOther(e.target.value)}
                error={errors.genderOther}
                required={true}
              />
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              <Input
                label="Birth Date (Optional)"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />

              <Input
                label="Join Date (Optional)"
                type="date"
                value={joinDate}
                onChange={(e) => setJoinDate(e.target.value)}
                helperText="This indicates when the user joined the workery"
              />
            </div>

            {/* Fixed Preferred Language Radio Group */}
            <FormGroup label="Preferred Language">
              <div style={{ marginTop: "10px" }}>
                <label
                  style={{
                    marginRight: "20px",
                    cursor: "pointer",
                    fontWeight: "normal",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="preferredLanguage"
                    value="English"
                    checked={preferredLanguage === "English"}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    disabled={isSubmitting}
                    style={{ marginRight: "8px" }}
                  />
                  English
                </label>
                <label
                  style={{
                    cursor: "pointer",
                    fontWeight: "normal",
                    display: "inline-flex",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="radio"
                    name="preferredLanguage"
                    value="French"
                    checked={preferredLanguage === "French"}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    disabled={isSubmitting}
                    style={{ marginRight: "8px" }}
                  />
                  French
                </label>
              </div>
              {errors.preferredLanguage && (
                <div style={globalStyles.errorMessage}>
                  {errors.preferredLanguage}
                </div>
              )}
            </FormGroup>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingTop: "20px",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <Link to={`/admin/customer/${cid}`}>
              <Button variant="outline" disabled={isSubmitting}>
                ← Back to Detail
              </Button>
            </Link>

            <Button
              type="submit"
              variant="success"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              ✓ Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminCustomerUpdatePage;
