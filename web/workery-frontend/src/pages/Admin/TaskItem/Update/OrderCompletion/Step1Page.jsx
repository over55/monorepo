// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/OrderCompletion/Step1Page.jsx

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
} from "../../../../../components/UI";
import {
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../../constants/FieldOptions";

function AdminTaskItemOrderCompletionStep1Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const orderCompletionStorage = useOrderCompletionStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

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

          // Initialize order completion storage with task data if needed
          const currentState = orderCompletionStorage.getState();
          if (!currentState.invoiceIDs) {
            orderCompletionStorage.updateState({
              invoiceIDs: taskData.orderWjid,
              invoiceServiceFeeID: taskData.associateServiceFeeID || "",
              invoiceServiceFeePercentage:
                taskData.associateServiceFeePercentage || 0,
            });
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

  const handleBegin = () => {
    navigate(`/admin/task/${tid}/order-completion/step-2`);
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
          <strong>Step 1 of 5</strong>
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
              width: "20%",
              backgroundColor: "#28a745",
              height: "100%",
              borderRadius: "4px",
              transition: "width 0.3s",
            }}
          />
        </div>
      </Card>

      {/* Main Content */}
      <Card
        title="Task Detail - Order Completion"
        actions={
          <Button
            onClick={handleBegin}
            variant="primary"
            disabled={task?.isClosed}
          >
            Begin →
          </Button>
        }
      >
        {Object.keys(errors).length > 0 && (
          <Alert type="error">
            {typeof errors === "string" ? errors : JSON.stringify(errors)}
          </Alert>
        )}

        {task && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#000", color: "#fff" }}>
                <th colSpan="2" style={{ padding: "10px", textAlign: "left" }}>
                  Task Detail
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th
                  style={{
                    width: "30%",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  Type
                </th>
                <td style={{ padding: "10px" }}>{task.title}</td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Description
                </th>
                <td style={{ padding: "10px" }}>{task.description}</td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Job #
                </th>
                <td style={{ padding: "10px" }}>
                  <Link to={`/admin/order/${task.orderWjid}`}>
                    {task.orderWjid}
                  </Link>
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Job Description
                </th>
                <td style={{ padding: "10px" }}>
                  {task.orderDescription || "-"}
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Job Skill Sets
                </th>
                <td style={{ padding: "10px" }}>
                  {task.orderSkillSets
                    ?.map((skill) => skill.subCategory)
                    .join(", ") || "-"}
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Job Tags
                </th>
                <td style={{ padding: "10px" }}>
                  {task.orderTags?.map((tag) => tag.text).join(", ") || "-"}
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Client Name
                </th>
                <td style={{ padding: "10px" }}>
                  <Link to={`/admin/customer/${task.customerId}`}>
                    {task.customerName}
                  </Link>
                </td>
              </tr>
              {task.customerPhone && (
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Client Phone (
                    {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]})
                  </th>
                  <td style={{ padding: "10px" }}>
                    {task.customerPhone}
                    {task.customerPhoneExtension &&
                      ` x${task.customerPhoneExtension}`}
                  </td>
                </tr>
              )}
              {task.customerFullAddressWithoutPostalCode && (
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Client Address
                  </th>
                  <td style={{ padding: "10px" }}>
                    {task.customerFullAddressWithoutPostalCode}
                  </td>
                </tr>
              )}
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Client Tags
                </th>
                <td style={{ padding: "10px" }}>
                  {task.customerTags?.map((tag) => tag.text).join(", ") || "-"}
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Associate
                </th>
                <td style={{ padding: "10px" }}>
                  <Link to={`/admin/associate/${task.associateId}`}>
                    {task.associateName}
                  </Link>
                </td>
              </tr>
              {task.associatePhone && (
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Associate Phone (
                    {ASSOCIATE_PHONE_TYPE_OF_MAP[task.associatePhoneType]})
                  </th>
                  <td style={{ padding: "10px" }}>
                    {task.associatePhone}
                    {task.associatePhoneExtension &&
                      ` x${task.associatePhoneExtension}`}
                  </td>
                </tr>
              )}
              {task.associateFullAddressWithoutPostalCode && (
                <tr>
                  <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                    Associate Address
                  </th>
                  <td style={{ padding: "10px" }}>
                    {task.associateFullAddressWithoutPostalCode}
                  </td>
                </tr>
              )}
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Associate Tags
                </th>
                <td style={{ padding: "10px" }}>
                  {task.associateTags?.map((tag) => tag.text).join(", ") || "-"}
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Comments
                </th>
                <td style={{ padding: "10px" }}>
                  <Link to={`/admin/order/${task.orderWjid}/comments`}>
                    View comments
                  </Link>
                </td>
              </tr>
              <tr>
                <th style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
                  Task Created At
                </th>
                <td style={{ padding: "10px" }}>
                  {task.createdAt
                    ? new Date(task.createdAt).toLocaleString()
                    : "-"}
                </td>
              </tr>
            </tbody>
          </table>
        )}

        <div
          style={{
            marginTop: "30px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <Link to="/admin/tasks">
            <Button variant="secondary">← Back to Tasks</Button>
          </Link>
          <div style={{ display: "flex", gap: "10px" }}>
            {!task?.isClosed && (
              <>
                <Link to={`/admin/task/${tid}/close`}>
                  <Button variant="danger">Close</Button>
                </Link>
                <Link to={`/admin/task/${tid}/postpone`}>
                  <Button variant="warning">Postpone</Button>
                </Link>
                <Button onClick={handleBegin} variant="primary">
                  Begin →
                </Button>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default AdminTaskItemOrderCompletionStep1Page;
