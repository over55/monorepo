// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step6Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useCustomerManager } from "../../../../services/Services";

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
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setFetching(false);
  }, []);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = async (e) => {
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
      setFetching(true);
      setErrors({});

      // Create the customer using the CustomerManager
      const response = await customerManager.createCustomer(
        payload,
        onUnauthorized,
      );

      console.log("Customer created successfully:", response);

      // Clear the stored form data
      sessionStorage.removeItem("workery_customer_add_data");

      // Show success message (you could add a toast/notification here)
      alert("Customer created successfully!");

      // Navigate to the customer detail page
      navigate(`/admin/customer/${response.id}`);
    } catch (error) {
      console.error("Error creating customer:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Helper function to get option label by value
  const getOptionLabel = (options, value) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className="container">
      <section className="section">
        {/* Desktop Breadcrumbs */}
        <nav
          className="breadcrumb has-background-light is-hidden-touch p-4"
          aria-label="breadcrumbs"
        >
          <ul>
            <li>
              <Link to="/admin/dashboard" aria-current="page">
                🏠 Dashboard
              </Link>
            </li>
            <li>
              <Link to="/admin/customers" aria-current="page">
                👥 Customers
              </Link>
            </li>
            <li className="is-active">
              <Link aria-current="page">➕ New</Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Breadcrumbs */}
        <nav
          className="breadcrumb has-background-light is-hidden-desktop p-4"
          aria-label="breadcrumbs"
        >
          <ul>
            <li>
              <Link to="/admin/customers" aria-current="page">
                ← Back to Customers
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page Title */}
        <h1 className="title is-2">👥 Customers</h1>
        <h4 className="subtitle is-4">➕ New Customer</h4>
        <hr />

        {/* Progress Wizard */}
        <nav className="box has-background-success-light">
          <p className="subtitle is-5">Step 6 of 6</p>
          <progress className="progress is-success" value="100" max="100">
            100%
          </progress>
        </nav>

        {/* Page Content */}
        <nav className="box">
          <p className="title is-4">❓ Are you ready to submit?</p>

          <p className="has-text-grey pb-4">
            Please carefully review the following customer details and if you
            are ready click the <b>Submit</b> to complete.
          </p>

          {isFetching ? (
            <div>Submitting...</div>
          ) : (
            <>
              {errors.message && (
                <div className="notification is-danger">{errors.message}</div>
              )}

              {customerData && Object.keys(customerData).length > 0 && (
                <div className="container">
                  <p className="title is-4 mt-2">
                    🆔 Contact&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                    <Link to="/admin/customers/add/step-3">✏️ Edit</Link>
                  </p>

                  <div className="content">
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
                          <strong>Other Phone:</strong>{" "}
                          {customerData.otherPhone}
                        </p>
                        <p>
                          <strong>Other Phone Type:</strong>{" "}
                          {getOptionLabel(
                            CLIENT_PHONE_TYPE_OPTIONS,
                            customerData.otherPhoneType,
                          )}
                        </p>
                        {customerData.otherPhoneType ===
                          CLIENT_PHONE_TYPE_WORK &&
                          customerData.otherPhoneExtension && (
                            <p>
                              <strong>Other Phone Extension:</strong>{" "}
                              {customerData.otherPhoneExtension}
                            </p>
                          )}
                      </>
                    )}
                  </div>

                  <p className="title is-4">
                    📍 Address&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                    <Link to="/admin/customers/add/step-4">✏️ Edit</Link>
                  </p>

                  <div className="content">
                    <p>
                      <strong>
                        Has shipping address different than billing address:
                      </strong>{" "}
                      {customerData.hasShippingAddress ? "Yes" : "No"}
                    </p>

                    <div className="columns">
                      <div className="column">
                        {customerData.hasShippingAddress && (
                          <h6>
                            <strong>Billing Address</strong>
                          </h6>
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
                          <strong>Postal Code:</strong>{" "}
                          {customerData.postalCode}
                        </p>
                      </div>

                      {customerData.hasShippingAddress && (
                        <div className="column">
                          <h6>
                            <strong>Shipping Address</strong>
                          </h6>
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

                  <p className="title is-4">
                    📊 Metrics&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                    <Link to="/admin/customers/add/step-5">✏️ Edit</Link>
                  </p>

                  <div className="content">
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

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/customers/add/step-5"
                      >
                        ← Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-success is-fullwidth-mobile"
                        onClick={onSubmitClick}
                        disabled={isFetching}
                      >
                        {isFetching ? "Submitting..." : "✅ Submit"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
      </section>
    </div>
  );
}

export default AdminCustomerAddStep6Page;
