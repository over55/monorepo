// File Path: web/workery-frontend/src/pages/Admin/Order/Detail/More/Postpone/Page.jsx

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
import { ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../../constants/FieldOptions";

function AdminOrderDetailMorePostponePage() {
  const { oid } = useParams();
  const orderManager = useOrderManager();
  const authManager = useAuthManager();
  const navigate = useNavigate();

  // Component states
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [order, setOrder] = useState({});
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [startDate, setStartDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");
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
        "AdminOrderDetailMorePostponePage: Order data loaded successfully",
      );
    } catch (error) {
      console.error(
        "AdminOrderDetailMorePostponePage: Failed to fetch order:",
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

    // Validate reason
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

    // Validate start date
    if (startDate === undefined || startDate === null || startDate === "") {
      newErrors["startDate"] = "Start date is required";
      hasErrors = true;
    }

    // Validate comment
    if (
      describeTheComment === undefined ||
      describeTheComment === null ||
      describeTheComment === ""
    ) {
      newErrors["describeTheComment"] = "Comment is required";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Prepare payload for API
    const postponeData = {
      reason: reason,
      reasonOther: reasonOther,
      startDate: startDate,
      describeTheComment: describeTheComment,
    };

    console.log("onSubmitClick | payload:", postponeData);

    setIsSubmitting(true);
    setErrors({});

    try {
      await orderManager.postponeOrder(oid, postponeData, onUnauthorized);

      console.log(
        "AdminOrderDetailMorePostponePage: Order postponed successfully",
      );

      // Show success message
      setShowSuccessMessage(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/admin/order/${oid}/more`);
      }, 2000);
    } catch (error) {
      console.error(
        "AdminOrderDetailMorePostponePage: Failed to postpone order:",
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
    { label: "Postpone", icon: "🕐" },
  ];

  return (
    <div style={globalStyles.container}>
      <Breadcrumb items={breadcrumbItems} />

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert type="success">
          Order postponed successfully! Redirecting...
        </Alert>
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
      <Card title="🕐 Postpone Order">
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

            {/* Reason Field */}
            <Select
              label="Reason"
              name="reason"
              value={reason}
              onChange={(e) => setReason(parseInt(e.target.value))}
              options={ORDER_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION}
              error={errors.reason}
              required
            />

            {/* Reason Other Field */}
            {reason === 1 && (
              <TextArea
                label="Reason (Other)"
                name="reasonOther"
                placeholder="Please specify the reason"
                value={reasonOther}
                onChange={(e) => setReasonOther(e.target.value)}
                error={errors.reasonOther}
                required
                rows={3}
                maxLength={500}
              />
            )}

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

            {/* Comment Field */}
            <TextArea
              label="Describe the comment"
              name="describeTheComment"
              placeholder="Describe the reason for postponement here"
              value={describeTheComment}
              onChange={(e) => setDescribeTheComment(e.target.value)}
              error={errors.describeTheComment}
              required
              rows={5}
              maxLength={1000}
            />

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

export default AdminOrderDetailMorePostponePage;
