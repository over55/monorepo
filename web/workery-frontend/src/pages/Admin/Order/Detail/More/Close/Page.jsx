// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Close/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useOrderManager,
  useAuthManager,
} from "../../../../../../services/Services";
import { theme, globalStyles } from "../../../../../../constants/Theme";
import {
  Card,
  Button,
  Alert,
  Loading,
  Breadcrumb,
  Input,
  TextArea,
  Select,
} from "../../../../../../components/UI";
import { TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../../constants/FieldOptions";

function AdminOrderDetailMoreClosePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [wasCompleted, setWasCompleted] = useState(0);
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");
  const [visits, setVisits] = useState(1);
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
        "AdminOrderDetailMoreClosePage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreClosePage: Failed to fetch order:",
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

    // Validate was completed selection
    if (
      wasCompleted === undefined ||
      wasCompleted === null ||
      wasCompleted === "" ||
      wasCompleted === 0
    ) {
      newErrors["wasCompleted"] = "Please select whether the job was completed";
      hasErrors = true;
    } else {
      if (wasCompleted === 1) {
        // Validate fields for successful completion
        if (
          completionDate === undefined ||
          completionDate === null ||
          completionDate === ""
        ) {
          newErrors["completionDate"] = "Completion date is required";
          hasErrors = true;
        }
        if (
          describeTheComment === undefined ||
          describeTheComment === null ||
          describeTheComment === ""
        ) {
          newErrors["describeTheComment"] = "Comment is required";
          hasErrors = true;
        }
        if (
          visits === undefined ||
          visits === null ||
          visits === "" ||
          visits === 0
        ) {
          newErrors["visits"] = "Number of visits is required";
          hasErrors = true;
        } else if (visits < 1) {
          newErrors["visits"] = "Number of visits must be at least 1";
          hasErrors = true;
        }
      } else if (wasCompleted === 2) {
        // Validate fields for unsuccessful completion
        if (
          reason === undefined ||
          reason === null ||
          reason === "" ||
          reason === 0
        ) {
          newErrors["reason"] = "Reason is required";
          hasErrors = true;
        } else {
          if (reason === 1) {
            if (
              reasonOther === undefined ||
              reasonOther === null ||
              reasonOther === ""
            ) {
              newErrors["reasonOther"] = "Please specify the reason";
              hasErrors = true;
            }
          }
        }
        if (
          describeTheComment === undefined ||
          describeTheComment === null ||
          describeTheComment === ""
        ) {
          newErrors["describeTheComment"] = "Comment is required";
          hasErrors = true;
        }
      }
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Prepare payload for API
    const closureData = {
      wasCompleted: wasCompleted,
      completionDate: completionDate,
      reason: reason,
      reasonOther: reasonOther,
      describeTheComment: describeTheComment,
      visits: parseInt(visits),
    };

    console.log("onSubmitClick | payload:", closureData);

    setIsSubmitting(true);
    setErrors({});

    try {
      await orderManager.closeOrder(oid, closureData, onUnauthorized);

      console.log("AdminOrderDetailMoreClosePage: Order closed successfully");

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMoreClosePage: Failed to close order:",
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
    { label: "Close", icon: "✖️" },
  ];

  // Radio button component (since it's not in the UI components)
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
        <Alert type="success">Order closed successfully! Redirecting...</Alert>
      )}

      {/* Archived Banner */}
      {order && order.status === 2 && (
        <Alert type="info">This order is archived</Alert>
      )}

      {/* Page Title */}
      <h1>🔧 Order</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      {/* Page Content */}
      <Card title="✖️ Close Order">
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

        {order && (
          <div>
            <p style={{ marginBottom: "20px" }}>
              Please fill out all the required fields before submitting this
              form.
            </p>

            {/* Was Completed Radio Field */}
            <div style={{ marginBottom: "20px" }}>
              <label style={globalStyles.label}>
                Was this job successfully completed by the Associate?{" "}
                <span style={{ color: "red" }}>*</span>
              </label>
              <RadioButton
                name="wasCompleted"
                value={1}
                checked={wasCompleted === 1}
                onChange={(e) => setWasCompleted(parseInt(e.target.value))}
                label="Yes"
              />
              <RadioButton
                name="wasCompleted"
                value={2}
                checked={wasCompleted === 2}
                onChange={(e) => setWasCompleted(parseInt(e.target.value))}
                label="No"
              />
              <div
                style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}
              >
                Selecting 'Yes' will close this job as successful
              </div>
              {errors.wasCompleted && (
                <div style={globalStyles.errorMessage}>
                  {errors.wasCompleted}
                </div>
              )}
            </div>

            {/* Fields for successful completion */}
            {wasCompleted === 1 && (
              <>
                <Input
                  label="Completion Date"
                  name="completionDate"
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  error={errors.completionDate}
                  required
                />

                <TextArea
                  label="Describe the comment"
                  name="describeTheComment"
                  placeholder="Describe the work completed and any relevant details"
                  value={describeTheComment}
                  onChange={(e) => setDescribeTheComment(e.target.value)}
                  error={errors.describeTheComment}
                  required
                  rows={5}
                  maxLength={1000}
                />

                <Input
                  label="Visits"
                  name="visits"
                  type="number"
                  value={visits}
                  onChange={(e) => setVisits(parseInt(e.target.value) || 0)}
                  error={errors.visits}
                  required
                  placeholder="Number of visits"
                  min="1"
                  style={{ maxWidth: "150px" }}
                />
                <div
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "-15px",
                    marginBottom: "20px",
                  }}
                >
                  Please enter the number of visits the associate made with the
                  client
                </div>
              </>
            )}

            {/* Fields for unsuccessful completion */}
            {wasCompleted === 2 && (
              <>
                <Select
                  label="Reason"
                  name="reason"
                  value={reason}
                  onChange={(e) => setReason(parseInt(e.target.value))}
                  options={TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION}
                  error={errors.reason}
                  required
                />

                {reason === 1 && (
                  <Input
                    label="Reason (Other)"
                    name="reasonOther"
                    placeholder="Please specify the reason"
                    value={reasonOther}
                    onChange={(e) => setReasonOther(e.target.value)}
                    error={errors.reasonOther}
                    required
                  />
                )}

                <TextArea
                  label="Describe the comment"
                  name="describeTheComment"
                  placeholder="Describe why the job was not completed"
                  value={describeTheComment}
                  onChange={(e) => setDescribeTheComment(e.target.value)}
                  error={errors.describeTheComment}
                  required
                  rows={5}
                  maxLength={1000}
                />
              </>
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
              <Link to={`/admin/order/${oid}/more`}>
                <Button variant="secondary">← Back to More</Button>
              </Link>

              <Button
                variant="success"
                onClick={onSubmitClick}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "✓ Submit"}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminOrderDetailMoreClosePage;
