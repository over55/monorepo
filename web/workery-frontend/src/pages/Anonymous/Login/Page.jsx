import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../services/Services";

function LoginPage() {
  // State management
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Services and navigation
  const authManager = useAuthManager();
  const navigate = useNavigate();

  /**
   * Check if user is already authenticated on component mount
   */
  useEffect(() => {
    if (authManager.isAuthenticated()) {
      console.log("User already authenticated, redirecting...");
      navigate("/dashboard");
    }
  }, [authManager, navigate]);

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear field-specific error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }

    // Clear general auth error when user modifies form
    if (errors.auth) {
      setErrors((prev) => ({
        ...prev,
        auth: null,
      }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  /**
   * Handle form submission with modern async/await
   */
  const handleSubmitAsync = async () => {
    setIsSubmitted(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      console.log("Attempting login:", { email: formData.email });

      // Attempt login
      const profile = await authManager.login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      console.log("Login successful:", {
        id: profile.id,
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName,
        role: profile.role,
      });

      // Handle successful login
      handleLoginSuccess(profile);
    } catch (error) {
      console.error("Login failed:", error);
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle form submission with callbacks (for backwards compatibility)
   */
  const handleSubmitCallbacks = () => {
    setIsSubmitted(true);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    console.log("Attempting login with callbacks:", { email: formData.email });

    authManager.loginWithCallbacks(
      {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      },
      // onSuccess
      (profile) => {
        console.log("Login successful (callbacks):", profile);
        handleLoginSuccess(profile);
        setLoading(false);
      },
      // onError
      (error) => {
        console.error("Login failed (callbacks):", error);
        handleLoginError(error);
        setLoading(false);
      },
      // onDone
      () => {
        console.log("Login attempt completed (callbacks)");
      },
    );
  };

  /**
   * Handle successful login
   */
  const handleLoginSuccess = (profile) => {
    // Clear form
    setFormData({ email: "", password: "" });
    setErrors({});
    setIsSubmitted(false);

    // Redirect based on user role
    const redirectPath = getRedirectPath(profile);
    console.log(`Redirecting to: ${redirectPath}`);
    navigate(redirectPath);
  };

  /**
   * Handle login error
   */
  const handleLoginError = (error) => {
    if (error.auth) {
      setErrors({ auth: error.auth });
    } else if (error.email) {
      setErrors({ email: error.email });
    } else if (error.password) {
      setErrors({ password: error.password });
    } else if (error.message) {
      setErrors({ auth: error.message });
    } else {
      setErrors({ auth: "An unexpected error occurred. Please try again." });
    }
  };

  /**
   * Determine redirect path based on user profile
   */
  const getRedirectPath = (profile) => {
    if (profile.role === 1) {
      // Executive
      return "/admin/dashboard";
    } else if (profile.role === 2) {
      // Management
      return "/management/dashboard";
    } else if (profile.role === 3) {
      // Frontline
      return "/dashboard";
    } else if (profile.role === 4) {
      // Associate
      return "/associate/dashboard";
    } else if (profile.role === 5) {
      // Customer
      return "/customer/dashboard";
    } else {
      return "/dashboard"; // Default
    }
  };

  /**
   * Utility functions
   */
  const hasErrors = () => Object.keys(errors).length > 0;
  const isFormValid = () => Object.keys(validateForm()).length === 0;

  const resetForm = () => {
    setFormData({ email: "", password: "" });
    setErrors({});
    setIsSubmitted(false);
    setLoading(false);
  };

  // Debug log in development
  if (import.meta.env.DEV) {
    console.log("LoginPage state:", {
      formData: { email: formData.email, password: "[HIDDEN]" },
      errors,
      loading,
      isSubmitted,
      isFormValid: isFormValid(),
      hasErrors: hasErrors(),
    });
  }

  // Public API for parent components
  const loginPageAPI = {
    // Form data
    formData,
    errors,
    loading,
    isSubmitted,

    // Actions
    handleFieldChange,
    handleSubmitAsync,
    handleSubmitCallbacks,
    resetForm,

    // Getters
    hasErrors,
    isFormValid,

    // State setters
    setFormData,
    setErrors,
    setLoading,
  };

  return (
    <>
      {/*
        Business logic only - no GUI as requested.

        To use this logic:
        - Call handleSubmitAsync() or handleSubmitCallbacks()
        - Use handleFieldChange(field, value) for form updates
        - Check loading, errors, formData states
        - Use resetForm() to clear everything
      */}
    </>
  );
}

export default LoginPage;
