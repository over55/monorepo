// File Path: monorepo/web/workery-frontend/src/pages/Admin/OrderIncident/Add/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  useOrderIncidentManager,
  useOrderManager,
  useAuthManager,
} from "../../../../services/Services";
import { theme, globalStyles } from "../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
  Modal,
  Table,
} from "../../../../components/UI";
import { ORDER_INCIDENT_CLOSING_REASON_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../constants/FieldOptions";
import {
  ORDER_INCIDENT_INIATOR_CLIENT,
  ORDER_INCIDENT_INIATOR_ASSOCIATE,
  ORDER_INCIDENT_INIATOR_STAFF,
} from "../../../../constants/OrderIncident";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

function AdminOrderIncidentAddPage() {
  const orderIncidentManager = useOrderIncidentManager();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [startDate, setStartDate] = useState("");
  const [initiator, setInitiator] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [closingReason, setClosingReason] = useState(0);
  const [closingReasonOther, setClosingReasonOther] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Order selection states
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState("");
  const [ordersList, setOrdersList] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [orderSearchPage, setOrderSearchPage] = useState(1);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  // Fetch orders for selection modal
  const fetchOrders = async (search = "") => {
    setIsLoadingOrders(true);
    try {
      const params = {
        page: orderSearchPage,
        limit: 10,
        search: search,
        sortBy: "created_at,DESC",
      };

      const data = await orderManager.getOrders(params, onUnauthorized);
      setOrdersList(data.results || []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrdersList([]);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Handle order search
  const handleOrderSearch = (e) => {
    const query = e.target.value;
    setOrderSearchQuery(query);

    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchOrders(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  // Handle order selection
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
    setShowOrderModal(false);
    setOrderSearchQuery("");
  };

  // Remove selected order
  const handleRemoveOrder = () => {
    setSelectedOrder(null);
  };

  // Open order modal
  const handleOpenOrderModal = () => {
    setShowOrderModal(true);
    fetchOrders();
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
      initiator: initiator,
      title: title,
      description: description,
      startDate: startDate,
      closingReason: closingReason,
      closingReasonOther: closingReasonOther,
    };

    // Add orderId if an order is selected
    if (selectedOrder) {
      incidentData.orderId = selectedOrder.id || selectedOrder.wjid;
    }

    console.log("onSubmitClick | payload:", incidentData);

    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await orderIncidentManager.createOrderIncident(
        incidentData,
        onUnauthorized,
      );

      console.log("AdminOrderIncidentAddPage: Incident created successfully");

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order-incident/${response.id}`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderIncidentAddPage: Failed to create incident:",
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
    }

    return () => {
      mounted = false;
    };
  }, []);

  const breadcrumbItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/admin/order-incidents", label: "Incidents", icon: "🔥" },
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

  // Format order status
  const getOrderStatusLabel = (status) => {
    const statusMap = {
      1: "New",
      2: "Declined",
      3: "Pending",
      4: "Cancelled",
      5: "Ongoing",
      6: "In Progress",
      7: "Completed but Unpaid",
      8: "Completed and Paid",
      9: "Archived",
    };
    return statusMap[status] || "Unknown";
  };

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success">
          Incident created successfully! Redirecting...
        </Alert>
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

        {/* Work Order Selection */}
        <div style={{ marginBottom: "20px" }}>
          <label style={globalStyles.label}>Work Order (Optional)</label>

          {selectedOrder ? (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f8f9fa",
                border: "1px solid #dee2e6",
                borderRadius: "4px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div style={{ flex: 1 }}>
                  <strong>
                    Order #{selectedOrder.wjid || selectedOrder.id}
                  </strong>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#666",
                      marginTop: "5px",
                    }}
                  >
                    <div>Customer: {selectedOrder.customerName || "N/A"}</div>
                    <div>
                      Associate: {selectedOrder.associateName || "Not assigned"}
                    </div>
                    <div>
                      Status: {getOrderStatusLabel(selectedOrder.status)}
                    </div>
                    {selectedOrder.description && (
                      <div>Description: {selectedOrder.description}</div>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRemoveOrder}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    padding: "5px",
                  }}
                  title="Remove order"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <Button
                onClick={handleOpenOrderModal}
                variant="outline"
                icon={MagnifyingGlassIcon}
              >
                Select Work Order
              </Button>
              <div
                style={{
                  fontSize: "12px",
                  color: "#666",
                  marginTop: "10px",
                }}
              >
                Click to search and select a work order, or leave blank if this
                incident is not related to a specific order
              </div>
            </div>
          )}
        </div>

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
          <Link to="/admin/order-incidents">
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

      {/* Order Selection Modal */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setOrderSearchQuery("");
        }}
        title="Select Work Order"
        size="lg"
      >
        <div style={{ marginBottom: "20px" }}>
          <Input
            placeholder="Search by order ID, customer name, or description..."
            value={orderSearchQuery}
            onChange={handleOrderSearch}
            icon={MagnifyingGlassIcon}
          />
        </div>

        {isLoadingOrders ? (
          <div style={{ textAlign: "center", padding: "40px" }}>
            <Loading size="md" />
          </div>
        ) : ordersList.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #dee2e6" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Order ID
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Customer
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>
                    Associate
                  </th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersList.map((order) => (
                  <tr
                    key={order.id || order.wjid}
                    style={{
                      borderBottom: "1px solid #dee2e6",
                      cursor: "pointer",
                    }}
                    onClick={() => handleOrderSelect(order)}
                  >
                    <td style={{ padding: "10px" }}>
                      #{order.wjid || order.id}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {order.customerName || "N/A"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {order.associateName || "Not assigned"}
                    </td>
                    <td style={{ padding: "10px" }}>
                      {getOrderStatusLabel(order.status)}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderSelect(order);
                        }}
                      >
                        Select
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Alert type="info">
            {orderSearchQuery
              ? "No orders found matching your search."
              : "No orders available."}
          </Alert>
        )}

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            onClick={() => {
              setShowOrderModal(false);
              setOrderSearchQuery("");
            }}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default AdminOrderIncidentAddPage;
