// File Path: web/workery-frontend/src/pages/Admin/Order/Search/CriteriaPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useAuthManager } from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  FormGroup,
} from "../../../../components/UI";

function AdminOrderSearchCriteriaPage() {
  const authManager = useAuthManager();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  // Search form state
  const [actualSearchText, setActualSearchText] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);

  // Filter checkboxes
  const [filterByOrder, setFilterByOrder] = useState(false);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByAssociate, setFilterByAssociate] = useState(false);

  // Customer fields
  const [customerOrganizationName, setCustomerOrganizationName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");

  // Associate fields
  const [associateOrganizationName, setAssociateOrganizationName] =
    useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");

  // Order fields
  const [orderWjid, setOrderWjid] = useState("");

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    // Clear previous errors
    setErrors({});

    // Validation - ensure at least one field is filled
    if (
      customerOrganizationName === "" &&
      customerFirstName === "" &&
      customerLastName === "" &&
      customerEmail === "" &&
      customerPhone === "" &&
      actualSearchText === "" &&
      associateOrganizationName === "" &&
      associateFirstName === "" &&
      associateLastName === "" &&
      associateEmail === "" &&
      associatePhone === "" &&
      orderWjid === ""
    ) {
      setErrors({
        message: "Please enter a value in at least one field",
      });
      window.scrollTo(0, 0);
      return;
    }

    // Build URL with query parameters (matching the original format)
    const queryParams = new URLSearchParams();

    if (customerFirstName) queryParams.append("cfn", customerFirstName);
    if (customerLastName) queryParams.append("cln", customerLastName);
    if (customerEmail) queryParams.append("ce", customerEmail);
    if (customerPhone)
      queryParams.append("cp", encodeURIComponent(customerPhone));
    if (customerOrganizationName)
      queryParams.append("con", customerOrganizationName);
    if (actualSearchText) queryParams.append("q", actualSearchText);
    if (associateFirstName) queryParams.append("afn", associateFirstName);
    if (associateLastName) queryParams.append("aln", associateLastName);
    if (associateEmail) queryParams.append("ae", associateEmail);
    if (associatePhone)
      queryParams.append("ap", encodeURIComponent(associatePhone));
    if (associateOrganizationName)
      queryParams.append("aon", associateOrganizationName);
    if (orderWjid) queryParams.append("owjid", orderWjid);

    const searchURL = `/admin/orders/search-result?${queryParams.toString()}`;
    navigate(searchURL);
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      setFetching(false);
    }

    return () => {
      mounted = false;
    };
  }, [authManager, navigate]);

  if (isFetching) {
    return <Loading message="Loading..." />;
  }

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    { label: "Search", icon: "🔍" },
  ];

  const styles = {
    checkboxGroup: {
      marginBottom: "20px",
    },
    checkbox: {
      marginRight: "8px",
    },
    checkboxLabel: {
      display: "flex",
      alignItems: "center",
      marginBottom: "10px",
      cursor: "pointer",
    },
    advancedSection: {
      backgroundColor: "#f8f9fa",
      padding: "20px",
      borderRadius: "8px",
      marginBottom: "20px",
      border: "1px solid #e9ecef",
    },
    sectionTitle: {
      marginBottom: "15px",
      fontSize: "16px",
      fontWeight: "600",
      color: "#495057",
    },
    fieldGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "15px",
      marginBottom: "15px",
    },
    buttonGroup: {
      display: "flex",
      gap: "15px",
      justifyContent: "space-between",
      flexWrap: "wrap",
      marginTop: "30px",
    },
    orDivider: {
      textAlign: "center",
      margin: "20px 0",
      fontSize: "18px",
      fontWeight: "600",
      color: "#6c757d",
    },
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1>🔧 Orders</h1>
      <h2 style={{ fontSize: "18px", color: "#6c757d", marginBottom: "20px" }}>
        🔍 Search
      </h2>

      {Object.keys(errors).length > 0 && (
        <Alert type="error" onClose={() => setErrors({})}>
          {errors.message || "Please correct the errors below"}
        </Alert>
      )}

      <Card title="🔍 Search for existing order:">
        <p style={{ color: "#666", marginBottom: "20px" }}>
          Please enter one or more of the following fields to begin searching.
        </p>

        <form onSubmit={onSubmitClick}>
          {/* Basic Search */}
          <FormGroup>
            <Input
              label="Search Keywords"
              name="actualSearchText"
              placeholder="Search..."
              value={actualSearchText}
              onChange={(e) => setActualSearchText(e.target.value)}
              error={errors.actualSearchText}
            />
          </FormGroup>

          {/* Advanced Search Section */}
          {isAdvancedFiltering && (
            <>
              <div style={styles.orDivider}>- OR -</div>

              <div style={styles.advancedSection}>
                <h3 style={styles.sectionTitle}>🔍 Advanced Search</h3>

                {/* Filter Checkboxes */}
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filterByCustomer}
                      onChange={(e) => setFilterByCustomer(e.target.checked)}
                      style={styles.checkbox}
                    />
                    Filter By Customer
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filterByAssociate}
                      onChange={(e) => setFilterByAssociate(e.target.checked)}
                      style={styles.checkbox}
                    />
                    Filter By Associate
                  </label>

                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={filterByOrder}
                      onChange={(e) => setFilterByOrder(e.target.checked)}
                      style={styles.checkbox}
                    />
                    Filter By Order
                  </label>
                </div>

                {/* Customer Fields */}
                {filterByCustomer && (
                  <div style={{ marginBottom: "30px" }}>
                    <h4 style={styles.sectionTitle}>👤 Customer</h4>
                    <div style={styles.fieldGrid}>
                      <Input
                        label="First Name"
                        name="customerFirstName"
                        placeholder="Text input"
                        value={customerFirstName}
                        onChange={(e) => setCustomerFirstName(e.target.value)}
                        error={errors.customerFirstName}
                      />
                      <Input
                        label="Last Name"
                        name="customerLastName"
                        placeholder="Text input"
                        value={customerLastName}
                        onChange={(e) => setCustomerLastName(e.target.value)}
                        error={errors.customerLastName}
                      />
                      <Input
                        label="Email"
                        name="customerEmail"
                        type="email"
                        placeholder="Text input"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        error={errors.customerEmail}
                      />
                      <Input
                        label="Phone"
                        name="customerPhone"
                        placeholder="Text input"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        error={errors.customerPhone}
                      />
                    </div>
                    <Input
                      label="Organization Name"
                      name="customerOrganizationName"
                      placeholder="Text input"
                      value={customerOrganizationName}
                      onChange={(e) =>
                        setCustomerOrganizationName(e.target.value)
                      }
                      error={errors.customerOrganizationName}
                    />
                  </div>
                )}

                {/* Associate Fields */}
                {filterByAssociate && (
                  <div style={{ marginBottom: "30px" }}>
                    <h4 style={styles.sectionTitle}>👷 Associate</h4>
                    <div style={styles.fieldGrid}>
                      <Input
                        label="First Name"
                        name="associateFirstName"
                        placeholder="Text input"
                        value={associateFirstName}
                        onChange={(e) => setAssociateFirstName(e.target.value)}
                        error={errors.associateFirstName}
                      />
                      <Input
                        label="Last Name"
                        name="associateLastName"
                        placeholder="Text input"
                        value={associateLastName}
                        onChange={(e) => setAssociateLastName(e.target.value)}
                        error={errors.associateLastName}
                      />
                      <Input
                        label="Email"
                        name="associateEmail"
                        type="email"
                        placeholder="Text input"
                        value={associateEmail}
                        onChange={(e) => setAssociateEmail(e.target.value)}
                        error={errors.associateEmail}
                      />
                      <Input
                        label="Phone"
                        name="associatePhone"
                        placeholder="Text input"
                        value={associatePhone}
                        onChange={(e) => setAssociatePhone(e.target.value)}
                        error={errors.associatePhone}
                      />
                    </div>
                    <Input
                      label="Organization Name"
                      name="associateOrganizationName"
                      placeholder="Text input"
                      value={associateOrganizationName}
                      onChange={(e) =>
                        setAssociateOrganizationName(e.target.value)
                      }
                      error={errors.associateOrganizationName}
                    />
                  </div>
                )}

                {/* Order Fields */}
                {filterByOrder && (
                  <div style={{ marginBottom: "30px" }}>
                    <h4 style={styles.sectionTitle}>🔧 Order</h4>
                    <Input
                      label="Job #"
                      name="orderWjid"
                      placeholder="Text input"
                      value={orderWjid}
                      onChange={(e) => setOrderWjid(e.target.value)}
                      error={errors.orderWjid}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Action Buttons */}
          <div style={styles.buttonGroup}>
            <Link to="/admin/orders">
              <Button type="button" variant="secondary">
                ← Back to Orders
              </Button>
            </Link>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button
                type="button"
                variant={isAdvancedFiltering ? "primary" : "outline"}
                onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
              >
                🔍 Advanced Search
              </Button>

              <Button type="submit" variant="primary">
                🔍 Search
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminOrderSearchCriteriaPage;
