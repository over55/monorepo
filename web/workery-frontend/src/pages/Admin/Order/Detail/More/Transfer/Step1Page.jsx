// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useAuthManager,
  useTransferOperationStorage,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
} from "../../../../../../components/UI";

function AdminOrderDetailMoreTransferStep1Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // State management
  const [errors, setErrors] = useState({});
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");

  // Initialize from storage
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Load previous state from storage
    const savedState = transferOperationStorage.getTransferOperation();
    setIsAdvancedFiltering(savedState.clientIsAdvancedFiltering);
    setActualSearchText(savedState.clientSearch);
    setCustomerEmail(savedState.clientEmail);
    setCustomerPhone(savedState.clientPhone);
    setCustomerFirstName(savedState.clientFirstName);
    setCustomerLastName(savedState.clientLastName);
  }, []);

  const handleSearch = () => {
    // Validate that at least one field has a value
    if (
      !customerFirstName &&
      !customerLastName &&
      !customerEmail &&
      !customerPhone &&
      !actualSearchText
    ) {
      setErrors({ message: "Please enter at least one search criteria" });
      window.scrollTo(0, 0);
      return;
    }

    // Clear previous results and save search parameters
    const transferOp = transferOperationStorage.getTransferOperation();
    const newTransferOp = {
      ...transferOp,
      clientIsAdvancedFiltering: isAdvancedFiltering,
      clientSearch: actualSearchText,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      clientFirstName: customerFirstName,
      clientLastName: customerLastName,
      pickedClientID: "", // Reset selection
      pickedClientName: "",
    };
    transferOperationStorage.saveTransferOperation(newTransferOp);

    // Navigate to step 2 with search parameters
    const params = new URLSearchParams();
    if (customerFirstName) params.append("fn", customerFirstName);
    if (customerLastName) params.append("ln", customerLastName);
    if (customerEmail) params.append("e", customerEmail);
    if (customerPhone) params.append("p", customerPhone);
    if (actualSearchText) params.append("q", actualSearchText);

    navigate(`/admin/order/${oid}/more/transfer/step-2?${params.toString()}`);
  };

  const handleSkip = () => {
    // Clear client selection and go to associate search
    const newTransferOp = transferOperationStorage.getTransferOperation();
    newTransferOp.pickedClientID = "";
    newTransferOp.pickedClientName = "";
    transferOperationStorage.saveTransferOperation(newTransferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-3`);
  };

  // Breadcrumb items
  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Orders", path: "/admin/orders", icon: "🔧" },
    { label: `Order #${oid}`, path: `/admin/order/${oid}`, icon: "📋" },
    { label: "More", path: `/admin/order/${oid}/more`, icon: "⋯" },
    { label: "Transfer", icon: "🔄" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      <h1 style={{ margin: 0 }}>🔧 Order</h1>
      <h4 style={{ margin: "5px 0 20px 0", color: theme.colors.secondary }}>
        ℹ️ Detail
      </h4>
      <hr />

      {/* Progress Bar */}
      <Card
        style={{ marginBottom: "20px", backgroundColor: theme.colors.light }}
      >
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Step 1 of 5</p>
        <div
          style={{
            backgroundColor: "#e0e0e0",
            borderRadius: "10px",
            height: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: theme.colors.success,
              width: "20%",
              height: "100%",
              borderRadius: "10px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </Card>

      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ margin: 0 }}>🔍 Search for Client</h3>
          <Button
            variant={isAdvancedFiltering ? "primary" : "outline"}
            onClick={() => setIsAdvancedFiltering(!isAdvancedFiltering)}
          >
            {isAdvancedFiltering
              ? "✕ Clear Advanced Filters"
              : "⚙️ Advanced Filters"}
          </Button>
        </div>

        <p style={{ color: theme.colors.secondary, marginBottom: "20px" }}>
          Please enter one or more of the following fields to begin searching.
        </p>

        {errors.message && (
          <Alert type="error" onClose={() => setErrors({})}>
            {errors.message}
          </Alert>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
        >
          <Input
            label={<u>Search Keywords</u>}
            name="actualSearchText"
            placeholder="Search..."
            value={actualSearchText}
            onChange={(e) => setActualSearchText(e.target.value)}
          />

          {isAdvancedFiltering && (
            <>
              <p
                style={{
                  fontSize: "18px",
                  fontWeight: "bold",
                  margin: "20px 0",
                }}
              >
                - OR -
              </p>

              <div
                style={{
                  backgroundColor: theme.colors.light,
                  padding: "20px",
                  borderRadius: "8px",
                }}
              >
                <h4 style={{ marginBottom: "20px" }}>⚙️ Advanced Search</h4>
                <h5 style={{ marginBottom: "15px" }}>
                  👤 <u>Customer</u>
                </h5>

                <Input
                  label="First Name"
                  name="customerFirstName"
                  placeholder="Enter first name"
                  value={customerFirstName}
                  onChange={(e) => setCustomerFirstName(e.target.value)}
                />

                <Input
                  label="Last Name"
                  name="customerLastName"
                  placeholder="Enter last name"
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                />

                <Input
                  label="Email"
                  name="customerEmail"
                  type="email"
                  placeholder="Enter email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />

                <Input
                  label="Phone"
                  name="customerPhone"
                  placeholder="Enter phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
              gap: "10px",
            }}
          >
            <Link to={`/admin/order/${oid}/more`}>
              <Button variant="outline">← Back to More</Button>
            </Link>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button variant="warning" type="button" onClick={handleSkip}>
                Skip →
              </Button>
              <Button variant="primary" type="submit">
                🔍 Search
              </Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreTransferStep1Page;
