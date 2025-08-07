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

      // Format join date for API
      if (payload.joinDate) {
        const joinDateObject = new Date(payload.joinDate);
        payload.joinDate = joinDateObject.toISOString();
      }

      console.log("onSubmitClick: payload:", payload);
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
        <Alert type="success" onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert type="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Progress Wizard */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontWeight: "bold" }}>Step 6 of 6</p>
        <progress
          className="progress is-success"
          value="100"
          max="100"
          style={{ width: "100%" }}
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
                  <p>
                    <strong>Type:</strong>{" "}
                    {getOptionLabel(CLIENT_TYPE_OPTIONS, customerData.type)}
                  </p>
                  {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                    <>
                      <p>
                        <strong>Organization Name:</strong>{" "}
                        {customerData.organizationName}
                      </p>
                      <p>
                        <strong>Organization Type:</strong>{" "}
                        {getOptionLabel(
                          CLIENT_ORGANIZATION_TYPE_OPTIONS,
                          customerData.organizationType,
                        )}
                      </p>
                    </>
                  )}
                  <p>
                    <strong>First Name:</strong> {customerData.firstName}
                  </p>
                  <p>
                    <strong>Last Name:</strong> {customerData.lastName}
                  </p>
                  <p>
                    <strong>Email:</strong>{" "}
                    {customerData.email || "Not provided"}
                  </p>
                  <p>
                    <strong>I agree to receive electronic email:</strong>{" "}
                    {customerData.isOkToEmail ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Phone:</strong> {customerData.phone}
                  </p>
                  <p>
                    <strong>Phone Type:</strong>{" "}
                    {getOptionLabel(
                      CLIENT_PHONE_TYPE_OPTIONS,
                      customerData.phoneType,
                    )}
                  </p>
                  {customerData.phoneType === CLIENT_PHONE_TYPE_WORK &&
                    customerData.phoneExtension && (
                      <p>
                        <strong>Phone Extension:</strong>{" "}
                        {customerData.phoneExtension}
                      </p>
                    )}
                  <p>
                    <strong>I agree to receive texts to my phone:</strong>{" "}
                    {customerData.isOkToText ? "Yes" : "No"}
                  </p>
                  {customerData.otherPhone && (
                    <>
                      <p>
                        <strong>Other Phone:</strong> {customerData.otherPhone}
                      </p>
                      <p>
                        <strong>Other Phone Type:</strong>{" "}
                        {getOptionLabel(
                          CLIENT_PHONE_TYPE_OPTIONS,
                          customerData.otherPhoneType,
                        )}
                      </p>
                      {customerData.otherPhoneType === CLIENT_PHONE_TYPE_WORK &&
                        customerData.otherPhoneExtension && (
                          <p>
                            <strong>Other Phone Extension:</strong>{" "}
                            {customerData.otherPhoneExtension}
                          </p>
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
                  <p>
                    <strong>
                      Has shipping address different than billing address:
                    </strong>{" "}
                    {customerData.hasShippingAddress ? "Yes" : "No"}
                  </p>
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
                      <p>
                        <strong>Country:</strong> {customerData.country}
                      </p>
                      <p>
                        <strong>Province/Territory:</strong>{" "}
                        {customerData.region}
                      </p>
                      <p>
                        <strong>City:</strong> {customerData.city}
                      </p>
                      <p>
                        <strong>Address Line 1:</strong>{" "}
                        {customerData.addressLine1}
                      </p>
                      {customerData.addressLine2 && (
                        <p>
                          <strong>Address Line 2:</strong>{" "}
                          {customerData.addressLine2}
                        </p>
                      )}
                      <p>
                        <strong>Postal Code:</strong> {customerData.postalCode}
                      </p>
                    </div>

                    {customerData.hasShippingAddress && (
                      <div style={{ flex: 1, minWidth: "300px" }}>
                        <h4
                          style={{ fontWeight: "bold", marginBottom: "10px" }}
                        >
                          Shipping Address
                        </h4>
                        <p>
                          <strong>Name:</strong> {customerData.shippingName}
                        </p>
                        <p>
                          <strong>Phone:</strong> {customerData.shippingPhone}
                        </p>
                        <p>
                          <strong>Country:</strong>{" "}
                          {customerData.shippingCountry}
                        </p>
                        <p>
                          <strong>Province/Territory:</strong>{" "}
                          {customerData.shippingRegion}
                        </p>
                        <p>
                          <strong>City:</strong> {customerData.shippingCity}
                        </p>
                        <p>
                          <strong>Address Line 1:</strong>{" "}
                          {customerData.shippingAddressLine1}
                        </p>
                        {customerData.shippingAddressLine2 && (
                          <p>
                            <strong>Address Line 2:</strong>{" "}
                            {customerData.shippingAddressLine2}
                          </p>
                        )}
                        <p>
                          <strong>Postal Code:</strong>{" "}
                          {customerData.shippingPostalCode}
                        </p>
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
                  {customerData.tags && customerData.tags.length > 0 && (
                    <p>
                      <strong>Tags:</strong> {customerData.tags.join(", ")}
                    </p>
                  )}
                  <p>
                    <strong>How did you hear about us:</strong>{" "}
                    {customerData.howDidYouHearAboutUsID}
                  </p>
                  {customerData.howDidYouHearAboutUsOther && (
                    <p>
                      <strong>How did you hear about us (Other):</strong>{" "}
                      {customerData.howDidYouHearAboutUsOther}
                    </p>
                  )}
                  <p>
                    <strong>Gender:</strong>{" "}
                    {getOptionLabel(GENDER_OPTIONS, customerData.gender)}
                  </p>
                  {customerData.gender === 1 && customerData.genderOther && (
                    <p>
                      <strong>Gender (Other):</strong>{" "}
                      {customerData.genderOther}
                    </p>
                  )}
                  {customerData.birthDate && (
                    <p>
                      <strong>Birth Date:</strong> {customerData.birthDate}
                    </p>
                  )}
                  <p>
                    <strong>Join Date:</strong> {customerData.joinDate}
                  </p>
                  {customerData.additionalComment && (
                    <p>
                      <strong>Additional Comment:</strong>{" "}
                      {customerData.additionalComment}
                    </p>
                  )}
                  <p>
                    <strong>Preferred Language:</strong>{" "}
                    {customerData.preferredLanguage}
                  </p>
                </div>

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
                    variant="primary"
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
