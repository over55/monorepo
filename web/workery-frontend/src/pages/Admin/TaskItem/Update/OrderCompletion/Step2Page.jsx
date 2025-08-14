// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step2Page.jsx

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
  FormGroup,
  Input,
  Select,
  TextArea,
} from "../../../../../components/UI";
import { TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../constants/FieldOptions";

function AdminTaskItemOrderCompletionStep2Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // Form state from storage
  const savedState = orderCompletionStorage.getState();
  const [wasCompleted, setWasCompleted] = useState(savedState.wasCompleted);
  const [reason, setReason] = useState(savedState.reason);
  const [reasonOther, setReasonOther] = useState(savedState.reasonOther);
  const [completionDate, setCompletionDate] = useState(
    savedState.completionDate,
  );
  const [closingReasonComment, setClosingReasonComment] = useState(
    savedState.closingReasonComment,
  );
  const [reasonComment, setReasonComment] = useState(savedState.reasonComment);
  const [visits, setVisits] = useState(savedState.visits);

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

  const handleWasCompletedChange = (value) => {
    setWasCompleted(parseInt(value));
    // Reset dependent fields
    setCompletionDate(null);
    setReasonComment("");
    setReason(0);
    setReasonOther("");
    setClosingReasonComment("");
  };

  const handleCompletionDateChange = (e) => {
    const date = new Date(e.target.value);
    setCompletionDate(date);

    // Auto-generate comment
    const dateStr = date.toISOString().slice(0, 10);
    setReasonComment(`Job completed by Associate on ${dateStr}.`);
  };

  const handleSubmit = () => {
    const newErrors = {};

    // Validation
    if (!wasCompleted) {
      newErrors.wasCompleted = "Please select whether the job was completed";
    }

    if (wasCompleted === 1) {
      if (!completionDate) {
        newErrors.completionDate = "Completion date is required";
      }
      if (!reasonComment) {
        newErrors.reasonComment = "Reason comment is required";
      }
      if (!visits || visits <= 0) {
        newErrors.visits = "Number of visits is required";
      }
    }

    if (wasCompleted === 2) {
      if (!reason) {
        newErrors.reason = "Cancellation reason is required";
      }
      if (reason === 1 && !reasonOther) {
        newErrors.reasonOther = "Please specify the other reason";
      }
      if (!closingReasonComment) {
        newErrors.closingReasonComment = "Closing reason comment is required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    orderCompletionStorage.updateState({
      wasCompleted,
      reason,
      reasonOther,
      completionDate,
      reasonComment,
      closingReasonComment,
      visits: parseInt(visits),
    });

    // Navigate to next step
    navigate(`/admin/task/${tid}/order-completion/step-3`);
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
          <strong>Step 2 of 5</strong>
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
              width: "40%",
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

        <FormGroup>
          <label>
            Did the Associate successfully complete the job?{" "}
            <span style={{ color: "red" }}>*</span>
          </label>
          <div>
            <label>
              <input
                type="radio"
                name="wasCompleted"
                value="1"
                checked={wasCompleted === 1}
                onChange={(e) => handleWasCompletedChange(e.target.value)}
              />{" "}
              Yes
            </label>{" "}
            <label>
              <input
                type="radio"
                name="wasCompleted"
                value="2"
                checked={wasCompleted === 2}
                onChange={(e) => handleWasCompletedChange(e.target.value)}
              />{" "}
              No
            </label>
          </div>
          {errors.wasCompleted && (
            <div style={{ color: "red", fontSize: "12px" }}>
              {errors.wasCompleted}
            </div>
          )}
        </FormGroup>

        {/* If job was completed */}
        {wasCompleted === 1 && (
          <>
            <Input
              label="Completion Date"
              type="date"
              value={
                completionDate ? completionDate.toISOString().slice(0, 10) : ""
              }
              onChange={handleCompletionDateChange}
              error={errors.completionDate}
              required
              max={new Date().toISOString().slice(0, 10)}
            />

            <TextArea
              label="Reason Comment"
              value={reasonComment}
              onChange={(e) => setReasonComment(e.target.value)}
              error={errors.reasonComment}
              required
              rows={5}
              disabled={!completionDate}
              placeholder="Write details for the decision."
            />

            <Input
              label="Visits"
              type="number"
              value={visits}
              onChange={(e) => setVisits(e.target.value)}
              error={errors.visits}
              required
              placeholder="Number of visits"
              min="1"
            />
          </>
        )}

        {/* If job was not completed */}
        {wasCompleted === 2 && (
          <>
            <Select
              label="Reason for cancellation"
              value={reason}
              onChange={(e) => setReason(parseInt(e.target.value))}
              error={errors.reason}
              required
              options={TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION}
            />

            {reason === 1 && (
              <Input
                label="Reason (Other)"
                value={reasonOther}
                onChange={(e) => setReasonOther(e.target.value)}
                error={errors.reasonOther}
                required
                placeholder="Please specify..."
              />
            )}

            <TextArea
              label="Closing Reason Comment"
              value={closingReasonComment}
              onChange={(e) => setClosingReasonComment(e.target.value)}
              error={errors.closingReasonComment}
              required
              rows={5}
              placeholder="Write any additional comments here."
            />
          </>
        )}

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link to={`/admin/task/${tid}/order-completion/step-1`}>
            <Button variant="secondary">← Back to Step 1</Button>
          </Link>
          <Button onClick={handleSubmit} variant="primary">
            Save & Continue →
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep2Page;
