// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step1Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
} from "../../../../../components/UI";
import { SkillSetsDisplay } from "../../../../../components/Display";
import { TagsDisplay } from "../../../../../components/business/displays";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";

function AdminTaskItemAssignAssociateStep1Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Event handling
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  // Helper function to extract IDs from array of objects
  const extractIds = (items) => {
    if (!items || !Array.isArray(items)) return [];
    return items
      .map((item) => {
        // Handle different possible structures
        if (typeof item === "number" || typeof item === "string") {
          return item;
        }
        // Try different possible ID properties
        return item.id || item.value || item.skillSetId || item.tagId;
      })
      .filter(Boolean);
  };

  // Load task details
  useEffect(() => {
    let mounted = true;

    const fetchTask = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (mounted) {
          setTask(taskData);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching task:", error);
          setErrors(error);
        }
      } finally {
        if (mounted) {
          setFetching(false);
        }
      }
    };

    fetchTask();

    return () => {
      mounted = false;
    };
  }, [tid]);

  // Component rendering
  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Tasks", path: "/admin/tasks", icon: "📋" },
    { label: "Task Detail", icon: "ℹ️" },
  ];

  return (
    <div className="container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banner */}
      {task && (task.status === 2 || task.isClosed === true) && (
        <Alert type="info">Archived / Closed</Alert>
      )}

      {/* Page Title */}
      <h1>📋 Task</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      {/* Progress Wizard */}
      {task && task.isClosed === false && (
        <Card>
          <p>Step 1 of 4</p>
          <progress value="25" max="100">
            25%
          </progress>
        </Card>
      )}

      {/* Page Content */}
      <Card title="📋 Task Detail - Assign Associate">
        {isFetching ? (
          <Loading message="Loading..." />
        ) : (
          <>
            {errors && Object.keys(errors).length > 0 && (
              <Alert type="error">
                {Object.entries(errors).map(([key, value]) => (
                  <div key={key}>
                    {key}: {value}
                  </div>
                ))}
              </Alert>
            )}

            {task && (
              <div>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th colSpan="2">Task Detail</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th style={{ width: "30%" }}>Type</th>
                      <td>{task.title}</td>
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>{task.description}</td>
                    </tr>
                    <tr>
                      <th>Job #</th>
                      <td>
                        <Link to={`/admin/order/${task.orderWjid}`}>
                          {task.orderWjid}
                        </Link>
                      </td>
                    </tr>
                    <tr>
                      <th>Job Start Date</th>
                      <td>
                        {task.orderStartDate
                          ? new Date(task.orderStartDate).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                    <tr>
                      <th>Job Description</th>
                      <td>{task.orderDescription || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ verticalAlign: "top" }}>Job Skill Sets</th>
                      <td>
                        <SkillSetsDisplay
                          values={extractIds(task.orderSkillSets)}
                          onUnauthorized={onUnauthorized}
                          variant="primary"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th style={{ verticalAlign: "top" }}>Job Tags</th>
                      <td>
                        <TagsDisplay
                          values={extractIds(task.orderTags)}
                          onUnauthorized={onUnauthorized}
                          variant="success"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Client Name</th>
                      <td>
                        <Link to={`/admin/customer/${task.customerId}`}>
                          {task.customerName}
                        </Link>
                      </td>
                    </tr>
                    {task.customerPhone && (
                      <tr>
                        <th>
                          Client Phone Number (
                          {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]}):
                        </th>
                        <td>
                          {task.customerPhone}
                          {task.customerPhoneExtension &&
                            ` ext. ${task.customerPhoneExtension}`}
                        </td>
                      </tr>
                    )}
                    {task.customerFullAddressUrl && (
                      <tr>
                        <th>Client Address</th>
                        <td>
                          <a
                            href={task.customerFullAddressUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {task.customerFullAddressWithoutPostalCode}
                          </a>
                        </td>
                      </tr>
                    )}
                    <tr>
                      <th style={{ verticalAlign: "top" }}>Client Tags</th>
                      <td>
                        <TagsDisplay
                          values={extractIds(task.customerTags)}
                          onUnauthorized={onUnauthorized}
                          variant="info"
                        />
                      </td>
                    </tr>
                    <tr>
                      <th>Comments</th>
                      <td>
                        <Link to={`/admin/order/${task.orderWjid}/comments`}>
                          View comments
                        </Link>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{ marginTop: "20px", display: "flex", gap: "10px" }}
                >
                  <Link to="/admin/tasks">
                    <Button variant="secondary">← Back to Tasks</Button>
                  </Link>

                  <div
                    style={{ marginLeft: "auto", display: "flex", gap: "10px" }}
                  >
                    {task.isClosed === false && (
                      <>
                        <Link to={`/admin/task/${tid}/close`}>
                          <Button variant="danger" disabled={task.status === 2}>
                            ✕ Close
                          </Button>
                        </Link>
                        <Link to={`/admin/task/${tid}/assign-associate/step-2`}>
                          <Button
                            variant="primary"
                            disabled={task.status === 2}
                          >
                            Begin →
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep1Page;
