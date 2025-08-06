import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../services/Services";

/**
 * Example of how to create a full login form that uses the business logic
 * This shows how you would integrate the business logic with actual form elements
 */
function LoginFormExample() {
  // Use the same business logic from LoginPage
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    if (authManager.isAuthenticated()) {
      navigate("/dashboard");
    }
  }, [authManager, navigate]);

  // Handle form field changes
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }

    if (errors.auth) {
      setErrors((prev) => ({
        ...prev,
        auth: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const profile = await authManager.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Login successful:", profile);

      // Clear form and redirect
      setFormData({ email: "", password: "" });
      setErrors({});
      setIsSubmitted(false);

      // Redirect based on role
      const redirectPath =
        profile.role === 1 ? "/admin/dashboard" : "/dashboard";
      navigate(redirectPath);
    } catch (error) {
      console.error("Login failed:", error);

      if (error.auth) {
        setErrors({ auth: error.auth });
      } else {
        setErrors({ auth: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
      <h2>Login to Workery</h2>

      <form onSubmit={handleSubmit}>
        {/* Email Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleFieldChange("email", e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: errors.email ? "2px solid red" : "1px solid #ccc",
              borderRadius: "4px",
            }}
            disabled={loading}
            placeholder="Enter your email"
          />
          {errors.email && (
            <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.email}
            </div>
          )}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "15px" }}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleFieldChange("password", e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              border: errors.password ? "2px solid red" : "1px solid #ccc",
              borderRadius: "4px",
            }}
            disabled={loading}
            placeholder="Enter your password"
          />
          {errors.password && (
            <div style={{ color: "red", fontSize: "14px", marginTop: "5px" }}>
              {errors.password}
            </div>
          )}
        </div>

        {/* General Error */}
        {errors.auth && (
          <div
            style={{
              color: "red",
              fontSize: "14px",
              marginBottom: "15px",
              padding: "10px",
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: "4px",
            }}
          >
            {errors.auth}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* Additional Links */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Link
          to="/forgot-password"
          style={{ color: "#007bff", textDecoration: "none" }}
        >
          Forgot your password?
        </Link>
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === "development" && (
        <div
          style={{
            marginTop: "20px",
            padding: "10px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            fontSize: "12px",
          }}
        >
          <strong>Debug Info:</strong>
          <pre>
            {JSON.stringify(
              {
                formData: { email: formData.email, password: "[HIDDEN]" },
                errors,
                loading,
              },
              null,
              2,
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

export default LoginFormExample;
