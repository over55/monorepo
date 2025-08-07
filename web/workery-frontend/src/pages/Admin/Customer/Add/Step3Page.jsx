// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

// Customer type constants
const COMMERCIAL_CUSTOMER_TYPE_OF_ID = 3;
const CLIENT_PHONE_TYPE_WORK = 1;

// Organization type options
const CLIENT_ORGANIZATION_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Private" },
  { value: 2, label: "Non-profit" },
  { value: 3, label: "Government" },
];

// Phone type options
const CLIENT_PHONE_TYPE_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Work" },
  { value: 2, label: "Home" },
  { value: 3, label: "Mobile" },
];

function AdminCustomerAddStep3Page() {
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : {};
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [organizationName, setOrganizationName] = useState(
    customerData.organizationName || "",
  );
  const [organizationType, setOrganizationType] = useState(
    customerData.organizationType || 0,
  );
  const [email, setEmail] = useState(customerData.email || "");
  const [phone, setPhone] = useState(customerData.phone || "");
  const [phoneExtension, setPhoneExtension] = useState(
    customerData.phoneExtension || "",
  );
  const [phoneType, setPhoneType] = useState(customerData.phoneType || 0);
  const [firstName, setFirstName] = useState(customerData.firstName || "");
  const [lastName, setLastName] = useState(customerData.lastName || "");
  const [otherPhone, setOtherPhone] = useState(customerData.otherPhone || "");
  const [otherPhoneType, setOtherPhoneType] = useState(
    customerData.otherPhoneType || 0,
  );
  const [otherPhoneExtension, setOtherPhoneExtension] = useState(
    customerData.otherPhoneExtension || "",
  );
  const [isOkToText, setIsOkToText] = useState(
    customerData.isOkToText || false,
  );
  const [isOkToEmail, setIsOkToEmail] = useState(
    customerData.isOkToEmail || false,
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setFetching(false);
  }, []);

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // Validation
    if (customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID) {
      if (organizationName === "") {
        newErrors["organizationName"] = "missing value";
        hasErrors = true;
      }
      if (organizationType === 0) {
        newErrors["organizationType"] = "missing value";
        hasErrors = true;
      }
    }
    if (firstName === "") {
      newErrors["firstName"] = "missing value";
      hasErrors = true;
    }
    if (lastName === "") {
      newErrors["lastName"] = "missing value";
      hasErrors = true;
    }
    if (phone === "") {
      newErrors["phone"] = "missing value";
      hasErrors = true;
    }
    if (phoneType === 0) {
      newErrors["phoneType"] = "missing value";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save data to sessionStorage
    const updatedCustomerData = {
      ...customerData,
      organizationName,
      organizationType,
      firstName,
      lastName,
      email,
      phone,
      phoneType,
      phoneExtension,
      otherPhone,
      otherPhoneType,
      otherPhoneExtension,
      isOkToText,
      isOkToEmail,
    };

    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    // Navigate to next step
    navigate("/admin/customers/add/step-4");
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
        <nav className="box has-background-light">
          <p className="subtitle is-5">Step 3 of 6</p>
          <progress className="progress is-success" value="50" max="100">
            50%
          </progress>
        </nav>

        {/* Page Content */}
        <nav className="box">
          <p className="title is-4">🆔 Contact</p>

          <p className="has-text-grey pb-4">
            Please fill out all the required fields before submitting this form.
          </p>

          {isFetching ? (
            <div>Submitting...</div>
          ) : (
            <>
              {errors.message && (
                <div className="notification is-danger">{errors.message}</div>
              )}

              <div className="container">
                {/* Organization fields for commercial customers */}
                {customerData.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                  <>
                    <div className="field">
                      <label className="label">Organization Name *</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder="Text input"
                          value={organizationName}
                          onChange={(e) => setOrganizationName(e.target.value)}
                          style={{ maxWidth: "380px" }}
                        />
                      </div>
                      {errors.organizationName && (
                        <p className="help is-danger">
                          {errors.organizationName}
                        </p>
                      )}
                    </div>

                    <div className="field">
                      <label className="label">Organization Type *</label>
                      <div className="control">
                        <div className="select">
                          <select
                            value={organizationType}
                            onChange={(e) =>
                              setOrganizationType(parseInt(e.target.value))
                            }
                          >
                            {CLIENT_ORGANIZATION_TYPE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {errors.organizationType && (
                        <p className="help is-danger">
                          {errors.organizationType}
                        </p>
                      )}
                    </div>
                  </>
                )}

                <div className="field">
                  <label className="label">First Name *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="help is-danger">{errors.firstName}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Last Name *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="help is-danger">{errors.lastName}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Email (Optional)</label>
                  <div className="control">
                    <input
                      className="input"
                      type="email"
                      placeholder="Text input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  <p className="help">
                    Optional field if not set then workery will generate a
                    temporary email.
                  </p>
                  {errors.email && (
                    <p className="help is-danger">{errors.email}</p>
                  )}
                </div>

                <div className="field">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={isOkToEmail}
                      onChange={(e) => setIsOkToEmail(e.target.checked)}
                    />
                    &nbsp;I agree to receive electronic email
                  </label>
                </div>

                <div className="field">
                  <label className="label">Phone *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ maxWidth: "200px" }}
                    />
                  </div>
                  {errors.phone && (
                    <p className="help is-danger">{errors.phone}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Phone Type *</label>
                  <div className="control">
                    <div className="select">
                      <select
                        value={phoneType}
                        onChange={(e) => setPhoneType(parseInt(e.target.value))}
                      >
                        {CLIENT_PHONE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.phoneType && (
                    <p className="help is-danger">{errors.phoneType}</p>
                  )}
                </div>

                {phoneType === CLIENT_PHONE_TYPE_WORK && (
                  <div className="field">
                    <label className="label">Phone Extension (Optional)</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder="Text input"
                        value={phoneExtension}
                        onChange={(e) => setPhoneExtension(e.target.value)}
                        style={{ maxWidth: "100px" }}
                      />
                    </div>
                  </div>
                )}

                <div className="field">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={isOkToText}
                      onChange={(e) => setIsOkToText(e.target.checked)}
                    />
                    &nbsp;I agree to receive texts to my phone
                  </label>
                </div>

                <div className="field">
                  <label className="label">Other Phone (Optional)</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Text input"
                      value={otherPhone}
                      onChange={(e) => setOtherPhone(e.target.value)}
                      style={{ maxWidth: "200px" }}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Other Phone Type (Optional)</label>
                  <div className="control">
                    <div className="select">
                      <select
                        value={otherPhoneType}
                        onChange={(e) =>
                          setOtherPhoneType(parseInt(e.target.value))
                        }
                      >
                        {CLIENT_PHONE_TYPE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {otherPhoneType === CLIENT_PHONE_TYPE_WORK && (
                  <div className="field">
                    <label className="label">
                      Other Phone Extension (Optional)
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder="Text input"
                        value={otherPhoneExtension}
                        onChange={(e) => setOtherPhoneExtension(e.target.value)}
                        style={{ maxWidth: "100px" }}
                      />
                    </div>
                  </div>
                )}

                <div className="columns pt-5">
                  <div className="column is-half">
                    <Link
                      className="button is-medium is-fullwidth-mobile"
                      to="/admin/customers/add/step-2"
                    >
                      ← Back
                    </Link>
                  </div>
                  <div className="column is-half has-text-right">
                    <button
                      className="button is-medium is-primary is-fullwidth-mobile"
                      onClick={onSubmitClick}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </nav>
      </section>
    </div>
  );
}

export default AdminCustomerAddStep3Page;
