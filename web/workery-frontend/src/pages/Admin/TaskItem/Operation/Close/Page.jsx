// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Operation/Close/Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import {
  useTaskManager,
  useAuthManager,
} from "../../../../../services/Services";
import {
  Card,
  Button,
  Input,
  Select,
  TextArea,
  Alert,
  Loading,
  Breadcrumb,
  FormGroup,
} from "../../../../../components/UI";
import { globalStyles } from "../../../../../constants/Theme";
import { TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../constants/FieldOptions";

function AdminTaskItemCloseOperationPage() {
  const navigate = useNavigate();
  const { tid } = useParams();
  const [searchParams] = useSearchParams();
  const back = searchParams.get("back");

  const taskManager = useTaskManager();
  const authManager = useAuthManager();

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [task, setTask] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [wasCompleted, setWasCompleted] = useState(0);
  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [describeTheComment, setDescribeTheComment] = useState("");

  // Authorization callback
  const onUnauthorized = () => {
    authManager.logout();
    navigate("/login?unauthorized=true");
  };

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      if (!tid) return;

      setIsLoading(true);
      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        setTask(taskData);
      } catch (error) {
        console.error("Failed to fetch task details:", error);
        setErrors(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTaskDetails();
  }, [tid]);

  // Validation
  const validateForm = () => {
    const newErrors = {};
    let hasErrors = false;

    if (!wasCompleted) {
      newErrors.wasCompleted = "Please select whether the job was completed";
      hasErrors = true;
    } else {
      if (wasCompleted === 1) {
        // Job was completed successfully
        if (!completionDate) {
          newErrors.completionDate = "Completion date is required";
          hasErrors = true;
        }
        if (!describeTheComment.trim()) {
          newErrors.describeTheComment = "Please describe the completion";
          hasErrors = true;
        }
      } else if (wasCompleted === 2) {
        // Job was not completed
        if (!reason) {
          newErrors.reason = "Please select a reason";
          hasErrors = true;
        } else if (reason === 1 && !reasonOther.trim()) {
          newErrors.reasonOther = "Please specify the reason";
          hasErrors = true;
        }
        if (!describeTheComment.trim()) {
          newErrors.describeTheComment = "Please provide additional details";
          hasErrors = true;
        }
      }
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare payload
      const payload = {
        task_item_id: tid,
        was_completed: wasCompleted,
        completion_date: wasCompleted === 1 ? completionDate : null,
        reason: wasCompleted === 2 ? reason : null,
        reason_other: wasCompleted === 2 && reason === 1 ? reasonOther : null,
        describe_the_comment: describeTheComment,
      };

      // Submit close operation
      await taskManager.closeTask(payload, onUnauthorized);

      // Navigate to task detail page
      navigate(getTaskUpdateURL(task.id, task.type));
    } catch (error) {
      console.error("Failed to close task:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get task update URL
  const getTaskUpdateURL = (taskId, taskType) => {
    switch (taskType) {
      case 1:
        return `/admin/task/${taskId}/assign-associate/step-1`;
      case 2:
      case 3:
        return `/admin/task/${taskId}/postpone`;
      case 4:
        return `/admin/task/${taskId}/survey/step-1`;
      case 5:
        return `/admin/task/${taskId}/order-completion/step-1`;
      default:
        return `/admin/task/${taskId}/close`;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div style={globalStyles.container}>
        <Loading message="Loading task details..." />
      </div>
    );
  }

  // Render main content
  return (
    <div style={globalStyles.container}>
      <Breadcrumb
        items={[
          { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
          { label: "Tasks", path: "/admin/tasks", icon: "📋" },
          {
            label: "Task Detail",
            path: task ? getTaskUpdateURL(task.id, task.type) : "#",
            icon: "ℹ️",
          },
          { label: "Close Operation", icon: "⏹️" },
        ]}
      />

      <h1>Task</h1>
      <h2>Close Operation</h2>

      {task && task.status === 2 && (
        <Alert type="info">This task is archived</Alert>
      )}

      <Card title="Close Task">
        {errors && errors.message && (
          <Alert type="error" onClose={() => setErrors({})}>
            {errors.message}
          </Alert>
        )}

        {task && (
          <>
            {task.isClosed ? (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "4px",
                }}
              >
                <h3>Task Closed</h3>
                <p>
                  This task has been closed and no work is needed to be done
                  here.
                </p>
                <Link to="/admin/tasks">
                  <Button style={{ marginTop: "20px" }}>
                    Go back to tasks list →
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p>
                  Please fill out all the required fields before submitting this
                  form.
                </p>

                <FormGroup>
                  <label style={globalStyles.label}>
                    Was this job successfully completed by the Associate? *
                  </label>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label>
                      <input
                        type="radio"
                        name="wasCompleted"
                        value={1}
                        checked={wasCompleted === 1}
                        onChange={(e) =>
                          setWasCompleted(parseInt(e.target.value))
                        }
                      />{" "}
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="wasCompleted"
                        value={2}
                        checked={wasCompleted === 2}
                        onChange={(e) =>
                          setWasCompleted(parseInt(e.target.value))
                        }
                      />{" "}
                      No
                    </label>
                  </div>
                  {errors.wasCompleted && (
                    <div style={globalStyles.errorMessage}>
                      {errors.wasCompleted}
                    </div>
                  )}
                  <small style={{ color: "#666" }}>
                    Selecting 'yes' will close this job as success
                  </small>
                </FormGroup>

                {wasCompleted === 1 && (
                  <>
                    <Input
                      label="Completion Date"
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                      error={errors.completionDate}
                      required
                    />

                    <TextArea
                      label="Describe the completion"
                      value={describeTheComment}
                      onChange={(e) => setDescribeTheComment(e.target.value)}
                      error={errors.describeTheComment}
                      required
                      rows={5}
                      placeholder="Include any additional information here..."
                    />
                  </>
                )}

                {wasCompleted === 2 && (
                  <>
                    <Select
                      label="Reason"
                      value={reason}
                      onChange={(e) => setReason(parseInt(e.target.value))}
                      options={TASK_ITEM_CLOSE_REASON_OPTIONS_WITH_EMPTY_OPTION}
                      error={errors.reason}
                      required
                    />

                    {reason === 1 && (
                      <Input
                        label="Reason (Other)"
                        type="text"
                        value={reasonOther}
                        onChange={(e) => setReasonOther(e.target.value)}
                        error={errors.reasonOther}
                        required
                        placeholder="Please specify..."
                      />
                    )}

                    <TextArea
                      label="Describe the issue"
                      value={describeTheComment}
                      onChange={(e) => setDescribeTheComment(e.target.value)}
                      error={errors.describeTheComment}
                      required
                      rows={5}
                      placeholder="Include any additional information here..."
                    />
                  </>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "30px",
                  }}
                >
                  <Link
                    to={
                      task
                        ? getTaskUpdateURL(task.id, task.type)
                        : "/admin/tasks"
                    }
                  >
                    <Button variant="secondary">← Back to Detail</Button>
                  </Link>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || task.status === 2}
                    variant="success"
                  >
                    {isSubmitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminTaskItemCloseOperationPage;
