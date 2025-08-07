// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";

// Gender options
const GENDER_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Male" },
  { value: 3, label: "Female" },
];

// How hear about us options (simplified)
const HOW_HEAR_OPTIONS = [
  { value: "", label: "Please select" },
  { value: "1", label: "Google" },
  { value: "2", label: "Facebook" },
  { value: "3", label: "Word of mouth" },
  { value: "4", label: "Newspaper" },
  { value: "5", label: "Other" },
];

function AdminCustomerAddStep5Page() {
  const navigate = useNavigate();

  // Get existing customer data from sessionStorage
  const [customerData, setCustomerData] = useState(() => {
    const saved = sessionStorage.getItem("workery_customer_add_data");
    return saved ? JSON.parse(saved) : {};
  });

  // Component state
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [tags, setTags] = useState(customerData.tags || []);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(
    customerData.howDidYouHearAboutUsID || "",
  );
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(customerData.isHowDidYouHearAboutUsOther || false);
  const [howDidYouHearAboutUsOther, setHowDidYouHearAboutUsOther] = useState(
    customerData.howDidYouHearAboutUsOther || "",
  );
  const [birthDate, setBirthDate] = useState(customerData.birthDate || "");
  const [joinDate, setJoinDate] = useState(
    customerData.joinDate || new Date().toISOString().split("T")[0],
  );
  const [gender, setGender] = useState(customerData.gender || 0);
  const [genderOther, setGenderOther] = useState(
    customerData.genderOther || "",
  );
  const [additionalComment, setAdditionalComment] = useState(
    customerData.additionalComment || "",
  );
  const [preferredLanguage, setPreferredLanguage] = useState(
    customerData.preferredLanguage || "English",
  );
  const [password, setPassword] = useState(customerData.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(
    customerData.passwordRepeated || "",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    setFetching(false);
  }, []);

  // Handle how hear about us change
  const handleHowHearChange = (value) => {
    setHowDidYouHearAboutUsID(value);
    setIsHowDidYouHearAboutUsOther(value === "5"); // "Other" option
  };

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // Validation
    if (howDidYouHearAboutUsID === "") {
      newErrors["howDidYouHearAboutUsID"] = "missing value";
      hasErrors = true;
    } else {
      if (
        isHowDidYouHearAboutUsOther === true &&
        howDidYouHearAboutUsOther === ""
      ) {
        newErrors["howDidYouHearAboutUsOther"] = "missing value";
        hasErrors = true;
      }
    }

    if (gender === undefined || gender === null || gender === 0) {
      newErrors["gender"] = "missing value";
      hasErrors = true;
    }

    if (
      preferredLanguage === undefined ||
      preferredLanguage === null ||
      preferredLanguage === ""
    ) {
      newErrors["preferredLanguage"] = "missing value";
      hasErrors = true;
    }

    if (password !== passwordRepeated) {
      newErrors["password"] = "does not match";
      newErrors["passwordRepeated"] = "does not match";
      hasErrors = true;
    }

    if (joinDate === undefined || joinDate === null || joinDate === "") {
      newErrors["joinDate"] = "missing value";
      hasErrors = true;
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
      tags,
      howDidYouHearAboutUsID,
      howDidYouHearAboutUsOther,
      gender,
      genderOther,
      birthDate,
      joinDate,
      additionalComment,
      preferredLanguage,
      password,
      passwordRepeated,
    };

    sessionStorage.setItem(
      "workery_customer_add_data",
      JSON.stringify(updatedCustomerData),
    );
    setCustomerData(updatedCustomerData);

    console.log("onSubmitClick: Ending with success.");

    // Navigate to next step
    navigate("/admin/customers/add/step-6");
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
          <p className="subtitle is-5">Step 5 of 6</p>
          <progress className="progress is-success" value="83" max="100">
            83%
          </progress>
        </nav>

        {/* Page Content */}
        <nav className="box">
          <p className="title is-4">📊 Metrics</p>

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
                <div className="field">
                  <label className="label">Tags (Optional)</label>
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      placeholder="Enter tags separated by commas"
                      value={tags.join(", ")}
                      onChange={(e) =>
                        setTags(
                          e.target.value.split(",").map((tag) => tag.trim()),
                        )
                      }
                      style={{ maxWidth: "320px" }}
                    />
                  </div>
                  <p className="help">
                    Pick the tags you would like to associate with this client.
                  </p>
                </div>

                <div className="field">
                  <label className="label">How did you hear about us? *</label>
                  <div className="control">
                    <div className="select" style={{ maxWidth: "520px" }}>
                      <select
                        value={howDidYouHearAboutUsID}
                        onChange={(e) => handleHowHearChange(e.target.value)}
                      >
                        {HOW_HEAR_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.howDidYouHearAboutUsID && (
                    <p className="help is-danger">
                      {errors.howDidYouHearAboutUsID}
                    </p>
                  )}
                </div>

                {isHowDidYouHearAboutUsOther && (
                  <div className="field">
                    <label className="label">
                      How did you hear about us? (Other) *
                    </label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder="Text input"
                        value={howDidYouHearAboutUsOther}
                        onChange={(e) =>
                          setHowDidYouHearAboutUsOther(e.target.value)
                        }
                        style={{ maxWidth: "100%" }}
                      />
                    </div>
                    {errors.howDidYouHearAboutUsOther && (
                      <p className="help is-danger">
                        {errors.howDidYouHearAboutUsOther}
                      </p>
                    )}
                  </div>
                )}

                <div className="field">
                  <label className="label">Gender *</label>
                  <div className="control">
                    <div className="select">
                      <select
                        value={gender}
                        onChange={(e) => setGender(parseInt(e.target.value))}
                      >
                        {GENDER_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {errors.gender && (
                    <p className="help is-danger">{errors.gender}</p>
                  )}
                </div>

                {gender === 1 && (
                  <div className="field">
                    <label className="label">Gender (Other) *</label>
                    <div className="control">
                      <input
                        className="input"
                        type="text"
                        placeholder="Text input"
                        value={genderOther}
                        onChange={(e) => setGenderOther(e.target.value)}
                        style={{ maxWidth: "380px" }}
                      />
                    </div>
                    {errors.genderOther && (
                      <p className="help is-danger">{errors.genderOther}</p>
                    )}
                  </div>
                )}

                <div className="field">
                  <label className="label">Birth Date (Optional)</label>
                  <div className="control">
                    <input
                      className="input"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      style={{ maxWidth: "180px" }}
                    />
                  </div>
                </div>

                <div className="field">
                  <label className="label">Join Date *</label>
                  <div className="control">
                    <input
                      className="input"
                      type="date"
                      value={joinDate}
                      onChange={(e) => setJoinDate(e.target.value)}
                      style={{ maxWidth: "180px" }}
                    />
                  </div>
                  <p className="help">
                    This indicates when the user joined the workery
                  </p>
                  {errors.joinDate && (
                    <p className="help is-danger">{errors.joinDate}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Additional Comment (Optional)</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      placeholder="Text input"
                      value={additionalComment}
                      onChange={(e) => setAdditionalComment(e.target.value)}
                      rows={4}
                      style={{ maxWidth: "280px" }}
                    />
                  </div>
                  <p className="help">Max 638 characters</p>
                </div>

                <div className="field">
                  <label className="label">Preferred Language *</label>
                  <div className="control">
                    <label className="radio">
                      <input
                        type="radio"
                        name="preferredLanguage"
                        value="English"
                        checked={preferredLanguage === "English"}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                      />
                      &nbsp;English
                    </label>
                    <br />
                    <label className="radio">
                      <input
                        type="radio"
                        name="preferredLanguage"
                        value="French"
                        checked={preferredLanguage === "French"}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                      />
                      &nbsp;French
                    </label>
                  </div>
                  {errors.preferredLanguage && (
                    <p className="help is-danger">{errors.preferredLanguage}</p>
                  )}
                </div>

                <p className="title is-6 mt-2">🔑 Login Credentials</p>

                <div className="field">
                  <label className="label">Password (Optional)</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="Password input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.password && (
                    <p className="help is-danger">{errors.password}</p>
                  )}
                </div>

                <div className="field">
                  <label className="label">Password Repeated (Optional)</label>
                  <div className="control">
                    <input
                      className="input"
                      type="password"
                      placeholder="Password input again"
                      value={passwordRepeated}
                      onChange={(e) => setPasswordRepeated(e.target.value)}
                      style={{ maxWidth: "380px" }}
                    />
                  </div>
                  {errors.passwordRepeated && (
                    <p className="help is-danger">{errors.passwordRepeated}</p>
                  )}
                </div>

                <div className="columns pt-5">
                  <div className="column is-half">
                    <Link
                      className="button is-medium is-fullwidth-mobile"
                      to="/admin/customers/add/step-4"
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

export default AdminCustomerAddStep5Page;
