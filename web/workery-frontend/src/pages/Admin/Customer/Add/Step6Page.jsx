// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step6Page.jsx

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";
import { globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
} from "../../../../components/UI";
import HowHearAboutUsDisplay from "../../../../components/Display/HowHearAboutUsDisplay";
import TagsDisplay from "../../../../components/Display/TagsDisplay";

// Customer type constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const CLIENT_PHONE_TYPE_WORK = 1;

// Options for display
const CLIENT_TYPE_OPTIONS = [
  { value: 1, label: "Unassigned" },
  { value: 2, label: "Residential" },
  { value: 3, label: "Commercial" },
];

const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

const CLIENT_PHONE_TYPE_OPTIONS = [
  { value: 1, label: "Work" },
  { value: 2, label: "Home" },
  { value: 3, label: "Mobile" },
];

const GENDER_OPTIONS = [
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
];

function AdminCustomerAddStep6Page() {
  const navigate = useNavigate();
  const customerManager = useCustomerManager();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : {};
  });

  // Component state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");

    try {
      // Create a payload with the customer data
      const payload = { ...customerData };

      // Clean up tags - remove any empty strings or invalid values
      if (payload.tags && Array.isArray(payload.tags)) {
        payload.tags = payload.tags.filter(
          (tag) =>
            tag !== null &&
            tag !== undefined &&
            tag !== "" &&
            tag !== "0" &&
            tag !== 0,
        );

        // If no valid tags remain, set to empty array
        if (payload.tags.length === 0) {
          payload.tags = [];
        }
      } else {
        payload.tags = [];
      }

      // Format join date for API
      if (payload.joinDate) {
        const joinDateObject = new Date(payload.joinDate);
        payload.joinDate = joinDateObject.toISOString();
      }

      console.log("onSubmitClick: cleaned payload:", payload);
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Create the customer using the CustomerManager
      const response = await customerManager.createCustomer(
        payload,
        onUnauthorized,
      );

      console.log("Customer created successfully:", response);

      // Clear the stored form data
      sessionStorage.removeItem("workery_customer_add_data");

      setSuccess("Customer created successfully!");

      // Navigate to the customer detail page after a short delay
      setTimeout(() => {
        navigate(`/admin/customer/${response.id}`);
      }, 1500);
    } catch (err) {
      console.error("Error creating customer:", err);
      const errorMessage =
        err.message ||
        "An unexpected error occurred while creating the customer.";
      setError(errorMessage);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get option label by value
  const getOptionLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { label: "Customers", path: "/admin/customers", icon: "👥" },
    { label: "New", icon: "➕" },
  ];

  const sectionHeaderStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
    marginBottom: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const editLinkStyle = {
    fontSize: "1rem",
    fontWeight: "normal",
  };

  const contentBlockStyle = {
    marginBottom: "40px",
  };

  const fieldStyle = {
    marginBottom: "15px",
  };

  const labelStyle = {
    fontWeight: "600",
    marginRight: "10px",
    color: "#333",
  };

  const valueStyle = {
    color: "#555",
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          ➕ New Customer
        </h1>
      </div>

      {success && (
        <Alert type="success" dismissible onDismiss={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" dismissible onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Progress Wizard */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontWeight: "bold" }}>Step 6 of 6</p>
        <progress
          value="100"
          max="100"
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
          }}
        >
          100%
        </progress>
      </div>

      <Card>
        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: "bold",
            marginBottom: "10px",
          }}
        >
          ❓ Are you ready to submit?
        </h2>
        <p style={{ color: "#555", marginBottom: "20px" }}>
          Please carefully review the following customer details and if you are
          ready click the <b>Submit</b> to complete.
        </p>

        {loading ? (
          <Loading message="Submitting customer data..." />
        ) : (
          <>
            {customerData && Object.keys(customerData).length > 0 && (
              <div>
                {/* Contact Information */}
                <div style={contentBlockStyle}>
                  <h3 style={sectionHeaderStyle}>
                    <span>🆔 Contact</span>
                    <Link
                      to="/admin/customers/add/step-3"
                      style={editLinkStyle}
                    >
                      ✏️ Edit
                    </Link>
                  </h3>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Type:</span>
                    <span style={valueStyle}>
                      {getOptionLabel(CLIENT_TYPE_OPTIONS, customerData.type)}
                    </span>
                  </div>

                  {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                    <>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Organization Name:</span>
                        <span style={valueStyle}>
                          {customerData.organizationName}
                        </span>
                      </div>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Organization Type:</span>
                        <span style={valueStyle}>
                          {getOptionLabel(
                            CLIENT_ORGANIZATION_TYPE_OPTIONS,
                            customerData.organizationType,
                          )}
                        </span>
                      </div>
                    </>
                  )}

                  <div style={fieldStyle}>
                    <span style={labelStyle}>First Name:</span>
                    <span style={valueStyle}>{customerData.firstName}</span>
                  </div>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Last Name:</span>
                    <span style={valueStyle}>{customerData.lastName}</span>
                  </div>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Email:</span>
                    <span style={valueStyle}>
                      {customerData.email || "Not provided"}
                    </span>
                  </div>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>
                      I agree to receive electronic email:
                    </span>
                    <span style={valueStyle}>
                      {customerData.isOkToEmail ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Phone:</span>
                    <span style={valueStyle}>{customerData.phone}</span>
                  </div>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Phone Type:</span>
                    <span style={valueStyle}>
                      {getOptionLabel(
                        CLIENT_PHONE_TYPE_OPTIONS,
                        customerData.phoneType,
                      )}
                    </span>
                  </div>

                  {customerData.phoneType === CLIENT_PHONE_TYPE_WORK &&
                    customerData.phoneExtension && (
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Phone Extension:</span>
                        <span style={valueStyle}>
                          {customerData.phoneExtension}
                        </span>
                      </div>
                    )}

                  <div style={fieldStyle}>
                    <span style={labelStyle}>
                      I agree to receive texts to my phone:
                    </span>
                    <span style={valueStyle}>
                      {customerData.isOkToText ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>

                  {customerData.otherPhone && (
                    <>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Other Phone:</span>
                        <span style={valueStyle}>
                          {customerData.otherPhone}
                        </span>
                      </div>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Other Phone Type:</span>
                        <span style={valueStyle}>
                          {getOptionLabel(
                            CLIENT_PHONE_TYPE_OPTIONS,
                            customerData.otherPhoneType,
                          )}
                        </span>
                      </div>
                      {customerData.otherPhoneType === CLIENT_PHONE_TYPE_WORK &&
                        customerData.otherPhoneExtension && (
                          <div style={fieldStyle}>
                            <span style={labelStyle}>
                              Other Phone Extension:
                            </span>
                            <span style={valueStyle}>
                              {customerData.otherPhoneExtension}
                            </span>
                          </div>
                        )}
                    </>
                  )}
                </div>

                {/* Address Information */}
                <div style={contentBlockStyle}>
                  <h3 style={sectionHeaderStyle}>
                    <span>📍 Address</span>
                    <Link
                      to="/admin/customers/add/step-4"
                      style={editLinkStyle}
                    >
                      ✏️ Edit
                    </Link>
                  </h3>

                  <div style={fieldStyle}>
                    <span style={labelStyle}>
                      Has shipping address different than billing address:
                    </span>
                    <span style={valueStyle}>
                      {customerData.hasShippingAddress ? "✅ Yes" : "❌ No"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "30px",
                      flexWrap: "wrap",
                      marginTop: "20px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: "300px" }}>
                      {customerData.hasShippingAddress && (
                        <h4
                          style={{ fontWeight: "bold", marginBottom: "10px" }}
                        >
                          Billing Address
                        </h4>
                      )}
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Country:</span>
                        <span style={valueStyle}>{customerData.country}</span>
                      </div>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Province/Territory:</span>
                        <span style={valueStyle}>{customerData.region}</span>
                      </div>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>City:</span>
                        <span style={valueStyle}>{customerData.city}</span>
                      </div>
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Address Line 1:</span>
                        <span style={valueStyle}>
                          {customerData.addressLine1}
                        </span>
                      </div>
                      {customerData.addressLine2 && (
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Address Line 2:</span>
                          <span style={valueStyle}>
                            {customerData.addressLine2}
                          </span>
                        </div>
                      )}
                      <div style={fieldStyle}>
                        <span style={labelStyle}>Postal Code:</span>
                        <span style={valueStyle}>
                          {customerData.postalCode}
                        </span>
                      </div>
                    </div>

                    {customerData.hasShippingAddress && (
                      <div style={{ flex: 1, minWidth: "300px" }}>
                        <h4
                          style={{ fontWeight: "bold", marginBottom: "10px" }}
                        >
                          Shipping Address
                        </h4>
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Name:</span>
                          <span style={valueStyle}>
                            {customerData.shippingName}
                          </span>
                        </div>
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Phone:</span>
                          <span style={valueStyle}>
                            {customerData.shippingPhone}
                          </span>
                        </div>
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Country:</span>
                          <span style={valueStyle}>
                            {customerData.shippingCountry}
                          </span>
                        </div>
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Province/Territory:</span>
                          <span style={valueStyle}>
                            {customerData.shippingRegion}
                          </span>
                        </div>
                        <div style={fieldStyle}>
                          <span style={labelStyle}>City:</span>
                          <span style={valueStyle}>
                            {customerData.shippingCity}
                          </span>
                        </div>
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Address Line 1:</span>
                          <span style={valueStyle}>
                            {customerData.shippingAddressLine1}
                          </span>
                        </div>
                        {customerData.shippingAddressLine2 && (
                          <div style={fieldStyle}>
                            <span style={labelStyle}>Address Line 2:</span>
                            <span style={valueStyle}>
                              {customerData.shippingAddressLine2}
                            </span>
                          </div>
                        )}
                        <div style={fieldStyle}>
                          <span style={labelStyle}>Postal Code:</span>
                          <span style={valueStyle}>
                            {customerData.shippingPostalCode}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Metrics Information */}
                <div style={contentBlockStyle}>
                  <h3 style={sectionHeaderStyle}>
                    <span>📊 Metrics</span>
                    <Link
                      to="/admin/customers/add/step-5"
                      style={editLinkStyle}
                    >
                      ✏️ Edit
                    </Link>
                  </h3>

                  {/* Use the new TagsDisplay component */}
                  <div style={{ marginBottom: "20px" }}>
                    <TagsDisplay
                      values={
                        customerData.tags && customerData.tags.length > 0
                          ? customerData.tags
                          : []
                      }
                      label="Tags"
                      onUnauthorized={onUnauthorized}
                      variant="success"
                    />
                  </div>

                  {/* Use the new HowHearAboutUsDisplay component */}
                  <div style={{ marginBottom: "20px" }}>
                    <HowHearAboutUsDisplay
                      value={customerData.howDidYouHearAboutUsID}
                      label="How did you hear about us?"
                      onUnauthorized={onUnauthorized}
                    />
                  </div>

                  {/* Show "Other" field if it exists */}
                  {customerData.howDidYouHearAboutUsOther && (
                    <div style={fieldStyle}>
                      <span style={labelStyle}>
                        How did you hear about us? (Other):
                      </span>
                      <span style={valueStyle}>
                        {customerData.howDidYouHearAboutUsOther}
                      </span>
                    </div>
                  )}

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Gender:</span>
                    <span style={valueStyle}>
                      {getOptionLabel(GENDER_OPTIONS, customerData.gender)}
                    </span>
                  </div>

                  {customerData.gender === 1 && customerData.genderOther && (
                    <div style={fieldStyle}>
                      <span style={labelStyle}>Gender (Other):</span>
                      <span style={valueStyle}>{customerData.genderOther}</span>
                    </div>
                  )}

                  {customerData.birthDate && (
                    <div style={fieldStyle}>
                      <span style={labelStyle}>Birth Date:</span>
                      <span style={valueStyle}>{customerData.birthDate}</span>
                    </div>
                  )}

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Join Date:</span>
                    <span style={valueStyle}>{customerData.joinDate}</span>
                  </div>

                  {customerData.additionalComment && (
                    <div style={fieldStyle}>
                      <span style={labelStyle}>Additional Comment:</span>
                      <span style={valueStyle}>
                        {customerData.additionalComment}
                      </span>
                    </div>
                  )}

                  <div style={fieldStyle}>
                    <span style={labelStyle}>Preferred Language:</span>
                    <span style={valueStyle}>
                      {customerData.preferredLanguage}
                    </span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: "30px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <Button
                    type="button"
                    onClick={() => navigate("/admin/customers/add/step-5")}
                    variant="outline"
                    disabled={loading}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    onClick={onSubmitClick}
                    variant="success"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "✅ Submit"}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep6Page;
