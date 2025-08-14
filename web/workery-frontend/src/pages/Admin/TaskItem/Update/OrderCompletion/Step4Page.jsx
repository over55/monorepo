// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step4Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import {
  useTaskManager,
  useOrderCompletionStorage,
} from "../../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  TextArea,
} from "../../../../../components/UI";

function AdminTaskItemOrderCompletionStep4Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Form state from storage
  const savedState = orderCompletionStorage.getState();
  const [comment, setComment] = useState(savedState.comment);

  const onUnauthorized = () => {
    navigate("/login?unauthorized=true");
  };

  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      try {
        setIsLoading(true);
        setErrors({});

        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);

        if (mounted) {
          setTask(taskData);

          // Auto-generate comment if not already set
          if (!comment && savedState.hasInputtedFinancials === 1) {
            let autoComment = "";
            if (savedState.paymentStatus === 1) {
              // Completed and paid
              autoComment = `Service fees for Workery Order ID ${taskData.orderWjid} paid on ${
                savedState.invoiceServiceFeePaymentDate
                  ? new Date(savedState.invoiceServiceFeePaymentDate)
                      .toISOString()
                      .slice(0, 10)
                  : new Date().toISOString().slice(0, 10)
              }.`;
            } else if (savedState.paymentStatus === 2) {
              // Completed but unpaid
              autoComment = `Service fees due for Workery Order ID ${taskData.orderWjid} completed on ${
                savedState.completionDate
                  ? new Date(savedState.completionDate)
                      .toISOString()
                      .slice(0, 10)
                  : new Date().toISOString().slice(0, 10)
              }.`;
            }
            setComment(autoComment);
          }
        }
      } catch (error) {
        console.error("Failed to fetch task:", error);
        if (mounted) {
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid]);

  const handleSubmit = () => {
    const newErrors = {};

    // Validation
    if (!comment || comment.trim() === "") {
      newErrors.comment = "Comment is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    orderCompletionStorage.updateState({
      comment: comment.trim(),
    });

    // Navigate to next step
    navigate(`/admin/task/${tid}/order-completion/step-5`);
  };

  if (isLoading) {
    return <Loading message="Loading task details..." />;
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Tasks", path: "/admin/tasks", icon: "📋" },
    { label: "Task Detail", icon: "ℹ️" },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Breadcrumb items={breadcrumbItems} />

      <h1>Task</h1>
      <h4>Detail</h4>
      <hr />

      {/* Progress Bar */}
      <Card style={{ marginBottom: "20px" }}>
        <p>
          <strong>Step 4 of 5</strong>
        </p>
        <div
          style={{
            backgroundColor: "#e9ecef",
            borderRadius: "4px",
            height: "20px",
          }}
        >
          <div
            style={{
              width: "80%",
              backgroundColor: "#28a745",
              height: "100%",
              borderRadius: "4px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </Card>

      {/* Main Content */}
      <Card title="Task Detail - Order Completion">
        {Object.keys(errors).length > 0 && (
          <Alert type="error">
            {Object.entries(errors).map(([key, value]) => (
              <div key={key}>{value}</div>
            ))}
          </Alert>
        )}

        <TextArea
          label="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          error={errors.comment}
          required
          rows={5}
          placeholder="Write any additional comments here."
        />

        <p style={{ fontSize: "14px", color: "#666" }}>
          This comment will be attached to the order.
        </p>

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link to={`/admin/task/${tid}/order-completion/step-3`}>
            <Button variant="secondary">← Back to Step 3</Button>
          </Link>
          <Button onClick={handleSubmit} variant="primary">
            Save & Continue →
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep4Page;
