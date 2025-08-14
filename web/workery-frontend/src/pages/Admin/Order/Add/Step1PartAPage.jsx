// File Path: web/workery-frontend/src/pages/Admin/Order/Add/Step1PartAPage.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useAuthManager,
  useOrderCreationStorage,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Modal,
  Input,
} from "../../../../components/UI";

function AdminOrderAddStep1PartAPage() {
  const authManager = useAuthManager();
  const orderCreationStorage = useOrderCreationStorage();
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // Form fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  const onSubmitClick = (e) => {
    e.preventDefault();
    console.log("onSubmitClick: Beginning...");

    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "Please enter at least one search criteria",
      });
      return;
    }

    // Build query string for search
    const params = new URLSearchParams();
    if (firstName) params.append("fn", firstName);
    if (lastName) params.append("ln", lastName);
    if (email) params.append("e", email);
    if (phone) params.append("p", phone);

    navigate(`/admin/orders/add/step-1-results?${params.toString()}`);
  };

  const onAddOrderClick = (e) => {
    e.preventDefault();
    console.log("Starting new order creation without search");

    // Clear any existing order state
    orderCreationStorage.clearOrderCreation();

    // Initialize new order state
    const newOrderState = {
      customerId: null,
      customerFirstName: null,
      customerLastName: null,
      startDate: null,
      isOngoing: null,
      isHomeSupportService: null,
      description: "",
      skillSets: [],
      additionalComment: "",
      tags: [],
    };

    orderCreationStorage.saveOrderCreation(newOrderState);
    navigate("/admin/orders/add/step-3");
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      // Clear any existing order creation state when starting fresh
      orderCreationStorage.clearOrderCreation();
    }

    return () => {
      mounted = false;
    };
  }, []);

  if (isFetching) {
    return <Loading message="Loading..." />;
  }

  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Orders", path: "/admin/orders", icon: "🔧" },
          { label: "New", icon: "➕" },
        ]}
      />

      <h1>Orders</h1>
      <h4>New Order</h4>
      <hr />

      {/* Progress Wizard */}
      <Card title="Step 1 of 4">
        <progress value="25" max="100" style={{ width: "100%" }}>
          25%
        </progress>
      </Card>

      <br />

      {/* Search Form */}
      <Card title="Search for existing client:">
        {errors.message && <Alert type="error">{errors.message}</Alert>}

        <form onSubmit={onSubmitClick}>
          <Input
            label="First Name"
            name="firstName"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
          />

          <Input
            label="Last Name"
            name="lastName"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />

          <Input
            label="Phone"
            name="phone"
            placeholder="Enter phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "20px",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCancelWarning(true)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Search
            </Button>
          </div>
        </form>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <p>- OR -</p>
        </div>

        <div style={{ textAlign: "center" }}>
          <a
            href="/admin/customers/add/step-2"
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none" }}
          >
            <Button variant="success">Create New Customer</Button>
          </a>
        </div>
      </Card>

      {/* Cancel Warning Modal */}
      <Modal
        isOpen={showCancelWarning}
        onClose={() => setShowCancelWarning(false)}
        title="Are you sure?"
        footer={
          <>
            <Button
              onClick={() => setShowCancelWarning(false)}
              variant="secondary"
            >
              No
            </Button>
            <Button onClick={() => navigate("/admin/orders")} variant="success">
              Yes
            </Button>
          </>
        }
      >
        <p>
          Your Order record will be cancelled and your work will be lost. This
          cannot be undone. Do you want to continue?
        </p>
      </Modal>
    </div>
  );
}

export default AdminOrderAddStep1PartAPage;
