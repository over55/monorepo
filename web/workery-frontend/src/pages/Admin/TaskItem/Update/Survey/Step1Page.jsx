// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step1Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useTaskManager } from "../../../../../services/Services";

const TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
];

export default function AdminTaskItemSurveyStep1Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (mounted) {
        setFetching(true);
        try {
          const taskData = await taskManager.getTaskDetail(tid, () => {
            navigate("/login?unauthorized=true");
          });
          setTask(taskData);
        } catch (error) {
          console.error("Failed to fetch task details:", error);
          setErrors(error);
        } finally {
          setFetching(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [tid]);

  if (isFetching) {
    return <div>Loading...</div>;
  }

  if (errors && Object.keys(errors).length > 0) {
    return (
      <div>
        <h3>Errors:</h3>
        <ul>
          {Object.entries(errors).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb">
        <ol>
          <li>
            <Link to="/admin/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/admin/tasks">Tasks</Link>
          </li>
          <li>Task Detail</li>
        </ol>
      </nav>

      {/* Page Title */}
      <h1>Task Survey</h1>
      <h4>Detail</h4>
      <hr />

      {/* Progress */}
      <div>
        <p>Step 1 of 3</p>
        <progress value="33" max="100">
          33%
        </progress>
      </div>

      {/* Page Content */}
      <div>
        <h2>Task Detail - Survey</h2>

        {task && (
          <div>
            {task.isClosed === true && (
              <div style={{ backgroundColor: "#d1ecf1", padding: "10px" }}>
                Archived / Closed
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th colSpan="2">Task Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Type</td>
                  <td>{task.title || "Survey"}</td>
                </tr>
                <tr>
                  <td>Description</td>
                  <td>{task.description}</td>
                </tr>
                <tr>
                  <td>Job #</td>
                  <td>
                    <Link to={`/admin/order/${task.orderWjid}`}>
                      {task.orderWjid}
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>Job Start Date</td>
                  <td>{task.orderStartDate}</td>
                </tr>
                <tr>
                  <td>Job Description</td>
                  <td>{task.orderDescription || "-"}</td>
                </tr>
                <tr>
                  <td>Job Skill Sets</td>
                  <td>
                    {task.orderSkillSets && task.orderSkillSets.length > 0
                      ? task.orderSkillSets.map((s) => s.subCategory).join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Job Tags</td>
                  <td>
                    {task.orderTags && task.orderTags.length > 0
                      ? task.orderTags.map((t) => t.text).join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Client Name</td>
                  <td>
                    <Link to={`/admin/customer/${task.customerId}`}>
                      {task.customerName}
                    </Link>
                  </td>
                </tr>
                {task.customerPhone && (
                  <tr>
                    <td>Client Phone Number</td>
                    <td>
                      {task.customerPhone}
                      {task.customerPhoneExtension &&
                        ` ext. ${task.customerPhoneExtension}`}
                    </td>
                  </tr>
                )}
                {task.customerFullAddressUrl && (
                  <tr>
                    <td>Client Address</td>
                    <td>{task.customerFullAddressWithoutPostalCode}</td>
                  </tr>
                )}
                <tr>
                  <td>Client Tags</td>
                  <td>
                    {task.customerTags && task.customerTags.length > 0
                      ? task.customerTags.map((t) => t.text).join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Associate</td>
                  <td>
                    <Link to={`/admin/associate/${task.associateId}`}>
                      {task.associateName}
                    </Link>
                  </td>
                </tr>
                {task.associatePhone && (
                  <tr>
                    <td>Associate Phone Number</td>
                    <td>
                      {task.associatePhone}
                      {task.associatePhoneExtension &&
                        ` ext. ${task.associatePhoneExtension}`}
                    </td>
                  </tr>
                )}
                {task.associateFullAddressUrl && (
                  <tr>
                    <td>Associate Address</td>
                    <td>{task.associateFullAddressWithoutPostalCode}</td>
                  </tr>
                )}
                <tr>
                  <td>Associate Tags</td>
                  <td>
                    {task.associateTags && task.associateTags.length > 0
                      ? task.associateTags.map((t) => t.text).join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Associate Skill Sets</td>
                  <td>
                    {task.associateSkillSets &&
                    task.associateSkillSets.length > 0
                      ? task.associateSkillSets
                          .map((s) => s.subCategory)
                          .join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Associate Vehicle Types</td>
                  <td>
                    {task.associateVehicleTypes &&
                    task.associateVehicleTypes.length > 0
                      ? task.associateVehicleTypes.map((v) => v.text).join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Associate Insurance Requirements</td>
                  <td>
                    {task.associateInsuranceRequirements &&
                    task.associateInsuranceRequirements.length > 0
                      ? task.associateInsuranceRequirements
                          .map((i) => i.text)
                          .join(", ")
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td>Comments</td>
                  <td>
                    <Link to={`/admin/order/${task.orderWjid}/comments`}>
                      View comments
                    </Link>
                  </td>
                </tr>
                <tr>
                  <td>Task Created At</td>
                  <td>{task.createdAt}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ marginTop: "20px" }}>
              <Link to="/admin/tasks">← Back to Tasks</Link>
              {task.isClosed === false && (
                <span style={{ float: "right" }}>
                  <Link
                    to={`/admin/task/${tid}/close`}
                    style={{ marginRight: "10px" }}
                  >
                    Close
                  </Link>
                  <Link
                    to={`/admin/task/${tid}/postpone`}
                    style={{ marginRight: "10px" }}
                  >
                    Postpone
                  </Link>
                  <Link to={`/admin/task/${tid}/survey/step-2`}>Begin →</Link>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
