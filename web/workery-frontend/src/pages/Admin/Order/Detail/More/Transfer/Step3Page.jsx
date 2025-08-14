// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Transfer/Step3Page.jsx

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

function AdminOrderDetailMoreTransferStep3Page() {
  const { oid } = useParams();
  const authManager = useAuthManager();
  const transferOperationStorage = useTransferOperationStorage();
  const navigate = useNavigate();

  // State management
  const [errors, setErrors] = useState({});
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [actualSearchText, setActualSearchText] = useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");

  // Initialize from storage
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!authManager.isAuthenticated()) {
      navigate("/login?unauthorized=true");
      return;
    }

    // Load previous state from storage
    const savedState = transferOperationStorage.getTransferOperation();
    setIsAdvancedFiltering(savedState.associateIsAdvancedFiltering);
    setActualSearchText(savedState.associateSearch);
    setAssociateEmail(savedState.associateEmail);
    setAssociatePhone(savedState.associatePhone);
    setAssociateFirstName(savedState.associateFirstName);
    setAssociateLastName(savedState.associateLastName);
  }, []);

  const handleSearch = () => {
    // Validate that at least one field has a value
    if (
      !associateFirstName &&
      !associateLastName &&
      !associateEmail &&
      !associatePhone &&
      !actualSearchText
    ) {
      setErrors({ message: "Please enter at least one search criteria" });
      window.scrollTo(0, 0);
      return;
    }

    // Save search parameters
    const transferOp = transferOperationStorage.getTransferOperation();
    const newTransferOp = {
      ...transferOp,
      associateIsAdvancedFiltering: isAdvancedFiltering,
      associateSearch: actualSearchText,
      associateEmail: associateEmail,
      associatePhone: associatePhone,
      associateFirstName: associateFirstName,
      associateLastName: associateLastName,
      pickedAssociateID: "", // Reset selection
      pickedAssociateName: "",
    };
    transferOperationStorage.saveTransferOperation(newTransferOp);

    // Navigate to step 4 with search parameters
    const params = new URLSearchParams();
    if (associateFirstName) params.append("fn", associateFirstName);
    if (associateLastName) params.append("ln", associateLastName);
    if (associateEmail) params.append("e", associateEmail);
    if (associatePhone) params.append("p", associatePhone);
    if (actualSearchText) params.append("q", actualSearchText);

    navigate(`/admin/order/${oid}/more/transfer/step-4?${params.toString()}`);
  };

  const handleSkip = () => {
    // Clear associate selection and go to review
    const transferOp = transferOperationStorage.getTransferOperation();
    transferOp.pickedAssociateID = "";
    transferOp.pickedAssociateName = "";
    transferOperationStorage.saveTransferOperation(transferOp);

    navigate(`/admin/order/${oid}/more/transfer/step-5`);
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
        <p style={{ fontWeight: "bold", marginBottom: "10px" }}>Step 3 of 5</p>
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
              width: "60%",
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
          <h3 style={{ margin: 0 }}>🔍 Search for Associate</h3>
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
                  👷 <u>Associate</u>
                </h5>

                <Input
                  label="First Name"
                  name="associateFirstName"
                  placeholder="Enter first name"
                  value={associateFirstName}
                  onChange={(e) => setAssociateFirstName(e.target.value)}
                />

                <Input
                  label="Last Name"
                  name="associateLastName"
                  placeholder="Enter last name"
                  value={associateLastName}
                  onChange={(e) => setAssociateLastName(e.target.value)}
                />

                <Input
                  label="Email"
                  name="associateEmail"
                  type="email"
                  placeholder="Enter email"
                  value={associateEmail}
                  onChange={(e) => setAssociateEmail(e.target.value)}
                />

                <Input
                  label="Phone"
                  name="associatePhone"
                  placeholder="Enter phone"
                  value={associatePhone}
                  onChange={(e) => setAssociatePhone(e.target.value)}
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
            <Link to={`/admin/order/${oid}/more/transfer/step-2`}>
              <Button variant="outline">← Back to Step 2</Button>
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

export default AdminOrderDetailMoreTransferStep3Page;
