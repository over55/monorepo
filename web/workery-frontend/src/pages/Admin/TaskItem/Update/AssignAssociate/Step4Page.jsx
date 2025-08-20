// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step4Page.jsx

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
import {
  SkillSetsDisplay,
  TagsDisplay,
} from "../../../../../components/Display";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";

function AdminTaskItemAssignAssociateStep4Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();

  // Component states
  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [assignmentData, setAssignmentData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Starting...");

    if (!assignmentData) {
      setErrors({ general: "Assignment data not found" });
      return;
    }

    // Prepare payload - using snake_case as required by API
    const payload = {
      task_id: tid,
      task_item_id: tid,
      associate_id: assignmentData.associateID,
      status: assignmentData.status,
      how_was_job_accepted: assignmentData.howWasJobAccepted,
      why_job_declined: assignmentData.whyJobDeclined,
      predefined_comment: assignmentData.predefinedComment,
      comment: assignmentData.comment,
    };

    console.log("onSubmitClick: Payload:", payload);
    setErrors({});
    setIsSubmitting(true);

    try {
      await taskManager.assignAssociate(payload, onUnauthorized);

      // Clear session storage
      sessionStorage.removeItem("WORKERY_ASSIGN_ASSOCIATE_DATA");

      // Show success message (handled by navigate)
      setForceURL(`/admin/order/${task.orderWjid}`);
    } catch (error) {
      console.error("Error assigning associate:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load task details and assignment data
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      // Load assignment data from session storage
      const storedData = sessionStorage.getItem(
        "WORKERY_ASSIGN_ASSOCIATE_DATA",
      );
      if (!storedData) {
        setForceURL(`/admin/task/${tid}/assign-associate/step-3`);
        return;
      }

      const data = JSON.parse(storedData);
      setAssignmentData(data);

      setFetching(true);
      setErrors({});

      try {
        // Fetch fresh task details
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

    fetchData();

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

  const assignAssociateStatusMap = {
    3: "Yes",
    4: "No",
  };

  return (
    <div className="container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page banner */}
      {task && task.status === 2 && <Alert type="info">Archived</Alert>}

      {/* Page Title */}
      <h1>📋 Task</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      {/* Progress Wizard */}
      <Card style={{ backgroundColor: "#d4edda" }}>
        <p>Step 4 of 4</p>
        <progress value="100" max="100">
          100%
        </progress>
      </Card>

      {/* Page Content */}
      <Card title="📋 Task Detail - Assign Associate">
        <p>Please review the following summary before submitting the task.</p>

        {isFetching || isSubmitting ? (
          <Loading message={isSubmitting ? "Submitting..." : "Loading..."} />
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

            {task && assignmentData && (
              <div>
                <table style={{ width: "100%" }}>
                  <thead>
                    <tr>
                      <th colSpan="2">Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th style={{ width: "30%" }}>Type</th>
                      <td>Assign Associate</td>
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
                      <th>Associate</th>
                      <td>
                        <Link
                          to={`/admin/associate/${assignmentData.associateID}`}
                        >
                          {assignmentData.associateName}
                        </Link>
                      </td>
                    </tr>
                    {assignmentData.associatePhone && (
                      <tr>
                        <th>Associate Phone Number</th>
                        <td>{assignmentData.associatePhone}</td>
                      </tr>
                    )}
                    {assignmentData.associateEmail && (
                      <tr>
                        <th>Associate Email</th>
                        <td>{assignmentData.associateEmail}</td>
                      </tr>
                    )}
                    <tr>
                      <th>Accepted Job?</th>
                      <td>{assignAssociateStatusMap[assignmentData.status]}</td>
                    </tr>
                    <tr>
                      <th>Predefined Comment</th>
                      <td>{assignmentData.predefinedComment}</td>
                    </tr>
                    <tr>
                      <th>Comment</th>
                      <td>{assignmentData.comment || "-"}</td>
                    </tr>
                  </tbody>
                </table>

                <div
                  style={{ marginTop: "20px", display: "flex", gap: "10px" }}
                >
                  <Link to={`/admin/task/${tid}/assign-associate/step-3`}>
                    <Button variant="secondary" disabled={isSubmitting}>
                      ← Back to Step 3
                    </Button>
                  </Link>

                  <div style={{ marginLeft: "auto" }}>
                    <Button
                      onClick={onSubmitClick}
                      variant="success"
                      disabled={isSubmitting}
                    >
                      ✓ Save & Submit
                    </Button>
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

export default AdminTaskItemAssignAssociateStep4Page;
