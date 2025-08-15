// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Incident/Add/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useOrderIncidentManager,
  useAuthManager,
} from "../../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
} from "../../../../../../../components/UI";
import { ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../../../constants/FieldOptions";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../../../../constants/OrderIncident";

function AdminOrderDetailMoreIncidentAddPage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const orderIncidentManager = useOrderIncidentManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [startDate, setStartDate] = useState("");
  const [initiator, setInitiator] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingReason, setClosingReason] = useState(0);
  const [closingReasonOther, setClosingReasonOther] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch order details
  const fetchOrderDetail = async () => {
    setFetching(true);
    setErrors({});

    try {
      const orderData = await orderManager.getOrderDetail(oid, onUnauthorized);
      setOrder(orderData);
      console.log(
        "AdminOrderDetailMoreIncidentAddPage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentAddPage: Failed to fetch order:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  // Handle form submission
  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // Validate fields
    if (!startDate) {
      newErrors["startDate"] = "Start date is required";
      hasErrors = true;
    }
    if (!initiator) {
      newErrors["initiator"] = "Please select who initiated this incident";
      hasErrors = true;
    }
    if (!title) {
      newErrors["title"] = "Title is required";
      hasErrors = true;
    }
    if (!description) {
      newErrors["description"] = "Description is required";
      hasErrors = true;
    }
    if (closingReason === 1 && !closingReasonOther) {
      newErrors["closingReasonOther"] = "Please specify the reason";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Prepare payload
    const incidentData = {
      orderId: oid,
      initiator: initiator,
      title: title,
      description: description,
      startDate: startDate,
      closingReason: closingReason,
      closingReasonOther: closingReasonOther,
    };

    console.log("onSubmitClick | payload:", incidentData);

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await orderIncidentManager.createOrderIncident(
        incidentData,
        onUnauthorized,
      );

      console.log(
        "AdminOrderDetailMoreIncidentAddPage: Incident created successfully",
      );

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more/incident/${response.id}`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreIncidentAddPage: Failed to create incident:",
        error,
      );
      setErrors(error);
      window.scrollTo(0, 0);
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0);

      if (!authManager.isAuthenticated()) {
        navigate("/login?unauthorized=true");
        return;
      }

      fetchOrderDetail();
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  if (isFetching) {
    return <Loading message="Loading order details..." />;
  }

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/orders", label: "Orders", icon: "🔧" },
    {
      path: `/admin/order/${oid}/more`,
      label: `Order #${oid} (More)`,
      icon: "ℹ️",
    },
    {
      path: `/admin/order/${oid}/more/incidents`,
      label: "Incidents",
      icon: "🔥",
    },
    { label: "New", icon: "➕" },
  ];

  // Radio button component
  const RadioButton = ({ name, value, checked, onChange, label }) => (
    <label
      style={{ display: "block", marginBottom: "10px", cursor: "pointer" }}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        style={{ marginRight: "8px" }}
      />
      {label}
    </label>
  );

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success">
          Incident created successfully! Redirecting...
        </Alert>
      )}

      {/* Archived Banner */}
      {order && order.status === 2 && (
        <Alert type="info">This order is archived</Alert>
      )}

      {/* Page Title */}
      <h1>🔥 Incident</h1>
      <h4>➕ New</h4>
      <hr />

      {/* Page Content */}
      <Card title="➕ New Incident">
        {/* Error Display */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error" onClose={() => setErrors({})}>
            <div>
              <strong>There were errors with your submission:</strong>
              <ul style={{ margin: "10px 0 0 20px" }}>
                {Object.entries(errors).map(([key, value]) => (
                  <li key={key}>{value}</li>
                ))}
              </ul>
            </div>
          </Alert>
        )}

        <p style={{ marginBottom: "20px" }}>
          Please fill out all the required fields before submitting this form.
        </p>

        {/* Start Date Field */}
        <Input
          label="Start Date"
          name="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          error={errors.startDate}
          required
        />
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "-15px",
            marginBottom: "20px",
          }}
        >
          Please enter the date this incident began
        </div>

        {/* Initiator Radio Field */}
        <div style={{ marginBottom: "20px" }}>
          <label style={globalStyles.label}>
            Who initiated this incident? <span style={{ color: "red" }}>*</span>
          </label>
          <RadioButton
            name="initiator"
            value={ORDER_INCIDENT_INIATOR_CLIENT}
            checked={initiator === ORDER_INCIDENT_INIATOR_CLIENT}
            onChange={(e) => setInitiator(parseInt(e.target.value))}
            label="Client"
          />
          <RadioButton
            name="initiator"
            value={ORDER_INCIDENT_INIATOR_ASSOCIATE}
            checked={initiator === ORDER_INCIDENT_INIATOR_ASSOCIATE}
            onChange={(e) => setInitiator(parseInt(e.target.value))}
            label="Associate"
          />
          <RadioButton
            name="initiator"
            value={ORDER_INCIDENT_INIATOR_STAFF}
            checked={initiator === ORDER_INCIDENT_INIATOR_STAFF}
            onChange={(e) => setInitiator(parseInt(e.target.value))}
            label="Staff"
          />
          {errors.initiator && (
            <div style={globalStyles.errorMessage}>{errors.initiator}</div>
          )}
        </div>

        {/* Title Field */}
        <Input
          label="Title"
          name="title"
          placeholder="Enter incident title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={errors.title}
          required
        />

        {/* Description Field */}
        <TextArea
          label="Description"
          name="description"
          placeholder="Describe the incident"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={errors.description}
          required
          rows={5}
          maxLength={1000}
        />

        {/* Closing Reason Field (Optional) */}
        <Select
          label="Closing Reason (Optional)"
          name="closingReason"
          value={closingReason}
          onChange={(e) => setClosingReason(parseInt(e.target.value))}
          options={ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS}
          error={errors.closingReason}
        />
        <div
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "-15px",
            marginBottom: "20px",
          }}
        >
          If this incident was resolved, please select the closing reason for
          this incident
        </div>

        {/* Closing Reason Other Field */}
        {closingReason === 1 && (
          <TextArea
            label="Reason (Other)"
            name="closingReasonOther"
            placeholder="Please specify the reason"
            value={closingReasonOther}
            onChange={(e) => setClosingReasonOther(e.target.value)}
            error={errors.closingReasonOther}
            required
            rows={5}
            maxLength={500}
          />
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "30px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link to={`/admin/order/${oid}/more/incidents`}>
            <Button variant="secondary">← Back to Incidents</Button>
          </Link>

          <Button
            variant="success"
            onClick={onSubmitClick}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "✓ Submit"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreIncidentAddPage;
