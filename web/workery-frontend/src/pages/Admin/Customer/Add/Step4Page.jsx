// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

// Country options
const COUNTRY_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "CA", label: "Canada" },
  { value: "US", label: "United States" },
  { value: "MX", label: "Mexico" },
];

// Region options for Canada
const CANADA_REGION_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "YT", label: "Yukon" },
];

// Region options for US
const US_REGION_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  // Add more states as needed...
];

function AdminCustomerAddStep4Page() {
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : {};
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [postalCode, setPostalCode] = useState(customerData.postalCode || "");
  const [addressLine1, setAddressLine1] = useState(
    customerData.addressLine1 || "",
  );
  const [addressLine2, setAddressLine2] = useState(
    customerData.addressLine2 || "",
  );
  const [city, setCity] = useState(customerData.city || "");
  const [region, setRegion] = useState(customerData.region || "");
  const [country, setCountry] = useState(customerData.country || "CA");
  const [hasShippingAddress, setHasShippingAddress] = useState(
    customerData.hasShippingAddress || false,
  );
  const [shippingName, setShippingName] = useState(
    customerData.shippingName || "",
  );
  const [shippingPhone, setShippingPhone] = useState(
    customerData.shippingPhone || "",
  );
  const [shippingCountry, setShippingCountry] = useState(
    customerData.shippingCountry || "CA",
  );
  const [shippingRegion, setShippingRegion] = useState(
    customerData.shippingRegion || "",
  );
  const [shippingCity, setShippingCity] = useState(
    customerData.shippingCity || "",
  );
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    customerData.shippingAddressLine1 || "",
  );
  const [shippingAddressLine2, setShippingAddressLine2] = useState(
    customerData.shippingAddressLine2 || "",
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    customerData.shippingPostalCode || "",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setFetching(false);
  }, []);

  // Get region options based on selected country
  const getRegionOptions = (selectedCountry) => {
    switch (selectedCountry) {
      case "CA":
        return CANADA_REGION_OPTIONS;
      case "US":
        return US_REGION_OPTIONS;
      default:
        return [{ value: "", label: "Please select" }];
    }
  };

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    let newErrors = {};
    let hasErrors = false;

    // Validation for billing address
    if (postalCode === "") {
      newErrors["postalCode"] = "missing value";
      hasErrors = true;
    }
    if (addressLine1 === "") {
      newErrors["addressLine1"] = "missing value";
      hasErrors = true;
    }
    if (city === "") {
      newErrors["city"] = "missing value";
      hasErrors = true;
    }
    if (region === "") {
      newErrors["region"] = "missing value";
      hasErrors = true;
    }
    if (country === "") {
      newErrors["country"] = "missing value";
      hasErrors = true;
    }

    // Validation for shipping address if enabled
    if (hasShippingAddress === true) {
      if (shippingName === "") {
        newErrors["shippingName"] = "missing value";
        hasErrors = true;
      }
      if (shippingPhone === "") {
        newErrors["shippingPhone"] = "missing value";
        hasErrors = true;
      }
      if (shippingCountry === "") {
        newErrors["shippingCountry"] = "missing value";
        hasErrors = true;
      }
      if (shippingRegion === "") {
        newErrors["shippingRegion"] = "missing value";
        hasErrors = true;
      }
      if (shippingCity === "") {
        newErrors["shippingCity"] = "missing value";
        hasErrors = true;
      }
      if (shippingAddressLine1 === "") {
        newErrors["shippingAddressLine1"] = "missing value";
        hasErrors = true;
      }
      if (shippingPostalCode === "") {
        newErrors["shippingPostalCode"] = "missing value";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      console.log("onSubmitClick: Ending with error.");
      return;
    }

    // Save data to sessionStorage
    const updatedCustomerData = {
      ...customerData,
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
    };

    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    console.log("onSubmitClick: Ending with success.");

    // Navigate to next step
    navigate("/admin/customers/add/step-5");
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
          <p className="subtitle is-5">Step 4 of 6</p>
          <progress className="progress is-success" value="67" max="100">
            67%
          </progress>
        </nav>

        {/* Page Content */}
        <nav className="box">
          <p className="title is-4">📍 Address</p>

          {isFetching ? (
            <div>Submitting...</div>
          ) : (
            <>
              {errors.message && (
                <div className="notification is-danger">{errors.message}</div>
              )}

              <div className="container">
                <div className="field">
                  <label className="checkbox">
                    <input
                      type="checkbox"
                      checked={hasShippingAddress}
                      onChange={(e) => setHasShippingAddress(e.target.checked)}
                    />
                    &nbsp;Has shipping address different than billing address
                  </label>
                </div>

                <div className="columns">
                  <div className="column">
                    {hasShippingAddress && (
                      <p className="subtitle is-6">Billing Address</p>
                    )}

                    <div className="field">
                      <label className="label">Country *</label>
                      <div className="control">
                        <div className="select" style={{ maxWidth: "160px" }}>
                          <select
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                          >
                            {COUNTRY_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {errors.country && (
                        <p className="help is-danger">{errors.country}</p>
                      )}
                    </div>

                    <div className="field">
                      <label className="label">Province/Territory *</label>
                      <div className="control">
                        <div className="select" style={{ maxWidth: "280px" }}>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                          >
                            {getRegionOptions(country).map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {errors.region && (
                        <p className="help is-danger">{errors.region}</p>
                      )}
                    </div>

                    <div className="field">
                      <label className="label">City *</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder="Text input"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          style={{ maxWidth: "380px" }}
                        />
                      </div>
                      {errors.city && (
                        <p className="help is-danger">{errors.city}</p>
                      )}
                    </div>

                    <div className="field">
                      <label className="label">Address Line 1 *</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder="Text input"
                          value={addressLine1}
                          onChange={(e) => setAddressLine1(e.target.value)}
                          style={{ maxWidth: "380px" }}
                        />
                      </div>
                      {errors.addressLine1 && (
                        <p className="help is-danger">{errors.addressLine1}</p>
                      )}
                    </div>

                    <div className="field">
                      <label className="label">Address Line 2 (Optional)</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder="Text input"
                          value={addressLine2}
                          onChange={(e) => setAddressLine2(e.target.value)}
                          style={{ maxWidth: "380px" }}
                        />
                      </div>
                    </div>

                    <div className="field">
                      <label className="label">Postal Code *</label>
                      <div className="control">
                        <input
                          className="input"
                          type="text"
                          placeholder="Text input"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          style={{ maxWidth: "100px" }}
                        />
                      </div>
                      {errors.postalCode && (
                        <p className="help is-danger">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>

                  {hasShippingAddress && (
                    <div className="column">
                      <p className="subtitle is-6">Shipping Address</p>

                      <div className="field">
                        <label className="label">Name *</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            placeholder="Text input"
                            value={shippingName}
                            onChange={(e) => setShippingName(e.target.value)}
                            style={{ maxWidth: "350px" }}
                          />
                        </div>
                        <p className="help">
                          The name to contact for this shipping address
                        </p>
                        {errors.shippingName && (
                          <p className="help is-danger">
                            {errors.shippingName}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label className="label">Phone *</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            placeholder="Text input"
                            value={shippingPhone}
                            onChange={(e) => setShippingPhone(e.target.value)}
                            style={{ maxWidth: "150px" }}
                          />
                        </div>
                        <p className="help">
                          The contact phone number for this shipping address
                        </p>
                        {errors.shippingPhone && (
                          <p className="help is-danger">
                            {errors.shippingPhone}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label className="label">Country *</label>
                        <div className="control">
                          <div className="select" style={{ maxWidth: "160px" }}>
                            <select
                              value={shippingCountry}
                              onChange={(e) =>
                                setShippingCountry(e.target.value)
                              }
                            >
                              {COUNTRY_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                        {errors.shippingCountry && (
                          <p className="help is-danger">
                            {errors.shippingCountry}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label className="label">Province/Territory *</label>
                        <div className="control">
                          <div className="select" style={{ maxWidth: "280px" }}>
                            <select
                              value={shippingRegion}
                              onChange={(e) =>
                                setShippingRegion(e.target.value)
                              }
                            >
                              {getRegionOptions(shippingCountry).map(
                                (option) => (
                                  <option
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </option>
                                ),
                              )}
                            </select>
                          </div>
                        </div>
                        {errors.shippingRegion && (
                          <p className="help is-danger">
                            {errors.shippingRegion}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label className="label">City *</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            placeholder="Text input"
                            value={shippingCity}
                            onChange={(e) => setShippingCity(e.target.value)}
                            style={{ maxWidth: "380px" }}
                          />
                        </div>
                        {errors.shippingCity && (
                          <p className="help is-danger">
                            {errors.shippingCity}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label className="label">Address Line 1 *</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            placeholder="Text input"
                            value={shippingAddressLine1}
                            onChange={(e) =>
                              setShippingAddressLine1(e.target.value)
                            }
                            style={{ maxWidth: "380px" }}
                          />
                        </div>
                        {errors.shippingAddressLine1 && (
                          <p className="help is-danger">
                            {errors.shippingAddressLine1}
                          </p>
                        )}
                      </div>

                      <div className="field">
                        <label className="label">
                          Address Line 2 (Optional)
                        </label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            placeholder="Text input"
                            value={shippingAddressLine2}
                            onChange={(e) =>
                              setShippingAddressLine2(e.target.value)
                            }
                            style={{ maxWidth: "380px" }}
                          />
                        </div>
                      </div>

                      <div className="field">
                        <label className="label">Postal Code *</label>
                        <div className="control">
                          <input
                            className="input"
                            type="text"
                            placeholder="Text input"
                            value={shippingPostalCode}
                            onChange={(e) =>
                              setShippingPostalCode(e.target.value)
                            }
                            style={{ maxWidth: "100px" }}
                          />
                        </div>
                        {errors.shippingPostalCode && (
                          <p className="help is-danger">
                            {errors.shippingPostalCode}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="columns pt-5">
                  <div className="column is-half">
                    <Link
                      className="button is-medium is-fullwidth-mobile"
                      to="/admin/customers/add/step-3"
                    >
                      ← Back
                    </Link>
                  </div>
                  <div className="column is-half has-text-right">
                    <button
                      className="button is-medium is-primary is-fullwidth-mobile"
                      onClick={onSubmitClick}
                      type="button"
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

export default AdminCustomerAddStep4Page;
