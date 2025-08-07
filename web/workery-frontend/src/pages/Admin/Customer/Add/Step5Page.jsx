// File Path: web/workery-frontend/src/pages/Admin/Customer/Add/Step5Page.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  FormGroup,
} from "../../../../components/UI";
import { theme, globalStyles } from "../../../../constants/Theme";

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
    customerData.preferredLanguage || "",
  );
  const [password, setPassword] = useState(customerData.password || "");
  const [passwordRepeated, setPasswordRepeated] = useState(
    customerData.passwordRepeated || "",
  );

  useEffect(() => {
    window.scrollTo(0, 0);
    // In a real scenario, you might set isFetching to true here
    // before an async call and false on completion/error.
    // For this step, it's kept false.
  }, []);

  // Handle how hear about us change
  const handleHowHearChange = (value) => {
    setHowDidYouHearAboutUsID(value);
    setIsHowDidYouHearAboutUsOther(value === "5"); // "Other" option
    if (errors.howDidYouHearAboutUsID) {
      setErrors((prev) => ({ ...prev, howDidYouHearAboutUsID: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!howDidYouHearAboutUsID) {
      newErrors.howDidYouHearAboutUsID = "This field is required";
    } else if (
      howDidYouHearAboutUsID === "5" &&
      !howDidYouHearAboutUsOther.trim()
    ) {
      newErrors.howDidYouHearAboutUsOther =
        "Please specify how you heard about us";
    }

    if (gender === 0) {
      newErrors.gender = "Gender is required";
    } else if (gender === 1 && !genderOther.trim()) {
      newErrors.genderOther = "Please specify the gender";
    }

    if (!joinDate) {
      newErrors.joinDate = "Join date is required";
    }

    if (!preferredLanguage) {
      newErrors.preferredLanguage = "Preferred language is required";
    }

    if (password || passwordRepeated) {
      if (password !== passwordRepeated) {
        newErrors.password = "Passwords do not match";
        newErrors.passwordRepeated = "Passwords do not match";
      }
    }

    return newErrors;
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      window.scrollTo(0, 0);
      console.log("onSubmitClick: Ending with error.", formErrors);
      return;
    }

    setErrors({});

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
    navigate("/admin/customers/add/step-6");
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "🏠" },
    { label: "Customers", path: "/admin/customers", icon: "👥" },
    { label: "New", icon: "➕" },
  ];

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

      {errors.message && (
        <Alert
          type="error"
          onClose={() => setErrors((prev) => ({ ...prev, message: null }))}
        >
          {errors.message}
        </Alert>
      )}

      {/* Progress Wizard */}
      <Card style={{ marginBottom: "20px" }}>
        <p style={{ ...globalStyles.label, marginBottom: "10px" }}>
          Step 5 of 6: Metrics
        </p>
        <progress
          className="progress is-success"
          value="83"
          max="100"
          style={{ width: "100%" }}
        >
          83%
        </progress>
      </Card>

      <Card>
        {isFetching ? (
          <Loading message="Loading form..." />
        ) : (
          <form onSubmit={onSubmitClick}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              <FormGroup>
                <label style={globalStyles.label}>Tags (Optional)</label>
                <input
                  type="text"
                  placeholder="Enter tags separated by commas"
                  value={tags.join(", ")}
                  onChange={(e) =>
                    setTags(e.target.value.split(",").map((tag) => tag.trim()))
                  }
                  style={globalStyles.input}
                  disabled={isFetching}
                />
                <div style={globalStyles.helpText}>
                  Pick the tags you would like to associate with this client.
                </div>
              </FormGroup>

              <FormGroup>
                <label style={globalStyles.label}>
                  How did you hear about us?{" "}
                  <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={howDidYouHearAboutUsID}
                  onChange={(e) => handleHowHearChange(e.target.value)}
                  style={{
                    ...globalStyles.input,
                    borderColor: errors.howDidYouHearAboutUsID
                      ? theme.colors.error
                      : "#ddd",
                  }}
                  disabled={isFetching}
                >
                  {HOW_HEAR_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.howDidYouHearAboutUsID && (
                  <div style={globalStyles.errorMessage}>
                    {errors.howDidYouHearAboutUsID}
                  </div>
                )}
              </FormGroup>

              {isHowDidYouHearAboutUsOther && (
                <FormGroup>
                  <label style={globalStyles.label}>
                    Please specify <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Please specify"
                    value={howDidYouHearAboutUsOther}
                    onChange={(e) =>
                      setHowDidYouHearAboutUsOther(e.target.value)
                    }
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.howDidYouHearAboutUsOther
                        ? theme.colors.error
                        : "#ddd",
                    }}
                    disabled={isFetching}
                  />
                  {errors.howDidYouHearAboutUsOther && (
                    <div style={globalStyles.errorMessage}>
                      {errors.howDidYouHearAboutUsOther}
                    </div>
                  )}
                </FormGroup>
              )}

              <FormGroup>
                <label style={globalStyles.label}>
                  Gender <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(parseInt(e.target.value))}
                  style={{
                    ...globalStyles.input,
                    borderColor: errors.gender ? theme.colors.error : "#ddd",
                  }}
                  disabled={isFetching}
                >
                  {GENDER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.gender && (
                  <div style={globalStyles.errorMessage}>{errors.gender}</div>
                )}
              </FormGroup>

              {gender === 1 && (
                <FormGroup>
                  <label style={globalStyles.label}>
                    Gender (Other) <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Please specify gender"
                    value={genderOther}
                    onChange={(e) => setGenderOther(e.target.value)}
                    style={{
                      ...globalStyles.input,
                      borderColor: errors.genderOther
                        ? theme.colors.error
                        : "#ddd",
                    }}
                    disabled={isFetching}
                  />
                  {errors.genderOther && (
                    <div style={globalStyles.errorMessage}>
                      {errors.genderOther}
                    </div>
                  )}
                </FormGroup>
              )}

              <FormGroup>
                <label style={globalStyles.label}>Birth Date (Optional)</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  style={globalStyles.input}
                  disabled={isFetching}
                />
              </FormGroup>

              <FormGroup>
                <label style={globalStyles.label}>
                  Join Date <span style={{ color: "red" }}>*</span>
                </label>
                <input
                  type="date"
                  value={joinDate}
                  onChange={(e) => setJoinDate(e.target.value)}
                  style={{
                    ...globalStyles.input,
                    borderColor: errors.joinDate ? theme.colors.error : "#ddd",
                  }}
                  disabled={isFetching}
                />
                <div style={globalStyles.helpText}>
                  This indicates when the user joined the workery.
                </div>
                {errors.joinDate && (
                  <div style={globalStyles.errorMessage}>{errors.joinDate}</div>
                )}
              </FormGroup>

              <FormGroup>
                <label style={globalStyles.label}>
                  Additional Comment (Optional)
                </label>
                <textarea
                  placeholder="Max 638 characters"
                  value={additionalComment}
                  onChange={(e) => setAdditionalComment(e.target.value)}
                  rows={4}
                  style={globalStyles.input}
                  disabled={isFetching}
                />
              </FormGroup>

              <FormGroup>
                <label style={globalStyles.label}>
                  Preferred Language <span style={{ color: "red" }}>*</span>
                </label>
                <div style={{ marginTop: "10px" }}>
                  <label
                    style={{
                      marginRight: "20px",
                      cursor: "pointer",
                      fontWeight: "normal",
                    }}
                  >
                    <input
                      type="radio"
                      name="preferredLanguage"
                      value="English"
                      checked={preferredLanguage === "English"}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      disabled={isFetching}
                    />
                    &nbsp;English
                  </label>
                  <label style={{ cursor: "pointer", fontWeight: "normal" }}>
                    <input
                      type="radio"
                      name="preferredLanguage"
                      value="French"
                      checked={preferredLanguage === "French"}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      disabled={isFetching}
                    />
                    &nbsp;French
                  </label>
                </div>
                {errors.preferredLanguage && (
                  <div style={globalStyles.errorMessage}>
                    {errors.preferredLanguage}
                  </div>
                )}
              </FormGroup>

              <h2
                style={{
                  ...globalStyles.label,
                  fontSize: "1.2rem",
                  gridColumn: "1 / -1",
                  marginTop: "20px",
                  borderTop: "1px solid #eee",
                  paddingTop: "20px",
                }}
              >
                🔑 Login Credentials
              </h2>

              <FormGroup>
                <label style={globalStyles.label}>Password (Optional)</label>
                <input
                  type="password"
                  placeholder="Leave blank if not setting a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    ...globalStyles.input,
                    borderColor: errors.password ? theme.colors.error : "#ddd",
                  }}
                  disabled={isFetching}
                />
                {errors.password && (
                  <div style={globalStyles.errorMessage}>{errors.password}</div>
                )}
              </FormGroup>

              <FormGroup>
                <label style={globalStyles.label}>
                  Password Repeated (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Repeat password here"
                  value={passwordRepeated}
                  onChange={(e) => setPasswordRepeated(e.target.value)}
                  style={{
                    ...globalStyles.input,
                    borderColor: errors.passwordRepeated
                      ? theme.colors.error
                      : "#ddd",
                  }}
                  disabled={isFetching}
                />
                {errors.passwordRepeated && (
                  <div style={globalStyles.errorMessage}>
                    {errors.passwordRepeated}
                  </div>
                )}
              </FormGroup>
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
                variant="outline"
                onClick={() => navigate("/admin/customers/add/step-4")}
                disabled={isFetching}
              >
                ← Back
              </Button>
              <Button type="submit" variant="primary" disabled={isFetching}>
                {isFetching ? "Saving..." : "Next →"}
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default AdminCustomerAddStep5Page;
