// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import { useTaskManager } from "../../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  Table,
} from "../../../../../components/UI";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";

function AdminTaskItemAssignAssociateStep2Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();

  // Component states
  const [task, setTask] = useState(null);
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [selectedAssociate, setSelectedAssociate] = useState(null);

  // Event handling
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  const onSelectClick = (associate) => {
    // Save selected associate to session storage for next steps
    sessionStorage.setItem(
      "WORKERY_ASSIGN_ASSOCIATE_DATA",
      JSON.stringify({
        associateID: associate.id,
        associateName: associate.name,
        associatePhone: associate.phone,
        associateEmail: associate.email,
        associateOrganizationName: associate.organizationName,
        associateContactsLast30Days: associate.contactsLast30Days,
        associateWsibNumber: associate.wsibNumber,
        associateHourlySalaryDesired: associate.hourlySalaryDesired,
        associateSkillSets: associate.skillSets,
      }),
    );
    setForceURL(`/admin/task/${tid}/assign-associate/step-3`);
  };

  // Load task details and assignable associates
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        // Fetch task details
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (mounted) {
          setTask(taskData);
        }

        // Fetch assignable associates
        const associatesData = await taskManager.getAssignableAssociates(
          tid,
          onUnauthorized,
        );
        if (mounted) {
          setAssociates(associatesData);
        }
      } catch (error) {
        if (mounted) {
          console.error("Error fetching data:", error);
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

  // Check if skill matches task requirements
  const doesSkillMatch = (associateSkills, taskSkills) => {
    if (!associateSkills || !taskSkills) return false;
    const taskSkillIds = taskSkills.map((s) => s.id || s.value);
    return associateSkills.some((skill) =>
      taskSkillIds.includes(skill.id || skill.value),
    );
  };

  // Table columns for associates
  const tableColumns = [
    { key: "name", label: "Name" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "contactsLast30Days", label: "Contacts (30 days)" },
    { key: "wsibNumber", label: "WSIB #" },
    {
      key: "hourlySalaryDesired",
      label: "Rate",
      render: (value) => (value ? `$${value}/hr` : "-"),
    },
    {
      key: "skillSets",
      label: "Matching Skill Sets",
      render: (value, row) => {
        if (!value || value.length === 0) return "-";
        const matchingSkills = value.filter((skill) =>
          doesSkillMatch([skill], task?.orderSkillSets),
        );
        return matchingSkills.map((s) => s.name || s.text).join(", ") || "-";
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (value, row) => (
        <Button size="sm" onClick={() => onSelectClick(row)}>
          Assign →
        </Button>
      ),
    },
  ];

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
      <Card>
        <p>Step 2 of 4</p>
        <progress value="50" max="100">
          50%
        </progress>
      </Card>

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
              <>
                {/* Task Summary Table */}
                <table style={{ width: "100%", marginBottom: "30px" }}>
                  <thead>
                    <tr>
                      <th colSpan="2">Task Detail</th>
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
                      <th>Job Skill Sets</th>
                      <td>
                        {task.orderSkillSets && task.orderSkillSets.length > 0
                          ? task.orderSkillSets
                              .map((skill) => skill.name || skill.text)
                              .join(", ")
                          : "-"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Available Associates */}
                <h3>👷 Available Associates</h3>

                {associates &&
                associates.results &&
                associates.results.length > 0 ? (
                  <Table columns={tableColumns} data={associates.results} />
                ) : (
                  <Alert type="info">
                    No associates available.
                    <Link to="/admin/associates/add/step-1-search">
                      {" "}
                      Click here to add an associate.
                    </Link>
                  </Alert>
                )}

                <div style={{ marginTop: "20px" }}>
                  <Link to={`/admin/task/${tid}/assign-associate/step-1`}>
                    <Button variant="secondary">← Back to Step 1</Button>
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep2Page;
