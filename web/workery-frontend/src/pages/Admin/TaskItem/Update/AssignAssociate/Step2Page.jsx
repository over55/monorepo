// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  useTaskManager,
  useAssociateManager,
} from "../../../../../services/Services";
import { CLIENT_PHONE_TYPE_OF_MAP } from "../../../../../constants/FieldOptions";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import { ASSOCIATE_STATUS_ACTIVE } from "../../../../../constants/Associate";

function AdminTaskItemAssignAssociateStep2Page() {
  // URL Parameters
  const { tid } = useParams();

  // Services
  const taskManager = useTaskManager();
  const associateManager = useAssociateManager();

  // Component states
  const [task, setTask] = useState(null);
  const [associates, setAssociates] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Event handling
  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true");
  };

  const onSelectClick = (associate) => {
    // Save selected associate to session storage for next steps
    sessionStorage.setItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
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

  // Load task details and then load filtered associates
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!mounted) return;

      setFetching(true);
      setErrors({});

      try {
        // Step 1: Fetch task details first
        const taskData = await taskManager.getTaskDetail(tid, onUnauthorized);
        if (!mounted) return;

        setTask(taskData);

        // Step 2: Extract skill set IDs from the task
        let skillSetIds = [];
        if (taskData.orderSkillSets && taskData.orderSkillSets.length > 0) {
          skillSetIds = taskData.orderSkillSets
            .map((skill) => skill.id || skill.value || skill._id)
            .filter((id) => id); // Remove any undefined/null values
        }

        // Step 3: Build filters for associate search
        const filtersMap = new Map();
        filtersMap.set("status", ASSOCIATE_STATUS_ACTIVE); // Only active associates

        // Add skill set filtering if the task has required skills
        if (skillSetIds.length > 0) {
          // Use 'in_skill_set_ids' to get associates with ANY of these skills
          filtersMap.set("inSkillSetIds", skillSetIds.join(","));
        }

        // You might also want to add other filters:
        // filtersMap.set("pageSize", 250); // Get more results
        // filtersMap.set("sortField", "lexical_name");
        // filtersMap.set("sortOrder", "ASC");

        // Step 4: Fetch associates with skill set filtering
        console.log("Fetching associates with skill set filters:", skillSetIds);

        // Use the associate manager with filters instead of task's getAssignableAssociates
        const associatesData =
          await associateManager.getAssociatesWithFiltersMap(
            filtersMap,
            onUnauthorized,
            true, // Force refresh to get latest data
          );

        if (mounted) {
          // Sort associates by number of matching skills (optional enhancement)
          if (associatesData.results && skillSetIds.length > 0) {
            associatesData.results.sort((a, b) => {
              const aMatchCount = countMatchingSkills(a.skillSets, skillSetIds);
              const bMatchCount = countMatchingSkills(b.skillSets, skillSetIds);
              return bMatchCount - aMatchCount; // Sort descending by match count
            });
          }

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

  // Helper function to count matching skills
  const countMatchingSkills = (associateSkills, requiredSkillIds) => {
    if (!associateSkills || associateSkills.length === 0) return 0;

    const requiredSet = new Set(requiredSkillIds);
    let count = 0;

    for (const skill of associateSkills) {
      const skillId = skill.id || skill.value || skill._id;
      if (requiredSet.has(skillId)) {
        count++;
      }
    }

    return count;
  };

  // Helper function to render skill sets with matching highlights
  const renderSkillSets = (associateSkillSets, taskSkillSets) => {
    if (!associateSkillSets || associateSkillSets.length === 0) {
      return <span style={{ color: "#999" }}>No skills</span>;
    }

    // Create a Set of task skill IDs for faster lookup
    const taskSkillIds = new Set();
    if (taskSkillSets && taskSkillSets.length > 0) {
      taskSkillSets.forEach((skill) => {
        const skillId = skill.id || skill.value || skill._id;
        if (skillId) taskSkillIds.add(skillId);
      });
    }

    const matchingSkills = [];
    const nonMatchingSkills = [];

    // Separate matching and non-matching skills
    associateSkillSets.forEach((skill) => {
      const skillId = skill.id || skill.value || skill._id;
      const skillName = skill.name || skill.text || skill.label;
      const isMatching = taskSkillIds.has(skillId);

      if (isMatching) {
        matchingSkills.push({ id: skillId, name: skillName });
      } else {
        nonMatchingSkills.push({ id: skillId, name: skillName });
      }
    });

    // Render skill sets with matching ones first and highlighted
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {/* Show matching skills first with green highlight */}
        {matchingSkills.map((skill) => (
          <span
            key={skill.id}
            className="tag is-success"
            title="Matches job requirement"
          >
            ✓ {skill.name}
          </span>
        ))}
        {/* Show non-matching skills with default styling */}
        {nonMatchingSkills.map((skill) => (
          <span key={skill.id} className="tag is-light">
            {skill.name}
          </span>
        ))}
        {/* Show match count if there are matches */}
        {matchingSkills.length > 0 && taskSkillIds.size > 0 && (
          <span className="tag is-info is-light">
            {matchingSkills.length}/{taskSkillIds.size} matches
          </span>
        )}
      </div>
    );
  };

  // Desktop view component
  const DesktopView = ({ associates, task }) => (
    <div className="table-wrapper">
      <table className="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Contacts (30 days)</th>
            <th>WSIB #</th>
            <th>Rate</th>
            <th>Skill Sets</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {associates.results.map((associate) => (
            <tr key={associate.id}>
              <td>
                <Link to={`/admin/associate/${associate.id}`} target="_blank">
                  {associate.name}
                </Link>
              </td>
              <td>
                {associate.phone ? (
                  <a href={`tel:${associate.phone}`}>{associate.phone}</a>
                ) : (
                  <span style={{ color: "#999" }}>-</span>
                )}
              </td>
              <td>
                {associate.email ? (
                  <a href={`mailto:${associate.email}`}>{associate.email}</a>
                ) : (
                  <span style={{ color: "#999" }}>-</span>
                )}
              </td>
              <td>{associate.contactsLast30Days || 0}</td>
              <td>
                {associate.wsibNumber || (
                  <span style={{ color: "#999" }}>-</span>
                )}
              </td>
              <td>
                {associate.hourlySalaryDesired ? (
                  `$${associate.hourlySalaryDesired}/hr`
                ) : (
                  <span style={{ color: "#999" }}>-</span>
                )}
              </td>
              <td>
                {renderSkillSets(associate.skillSets, task?.orderSkillSets)}
              </td>
              <td>
                <button
                  className="button is-small is-primary"
                  onClick={() => onSelectClick(associate)}
                >
                  Assign →
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // Mobile view component
  const MobileView = ({ associates, task }) => (
    <div>
      {associates.results.map((associate) => (
        <div
          key={associate.id}
          className="box"
          style={{ marginBottom: "1rem" }}
        >
          <div className="content">
            <p>
              <strong>Name:</strong>{" "}
              <Link to={`/admin/associate/${associate.id}`} target="_blank">
                {associate.name}
              </Link>
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {associate.phone ? (
                <a href={`tel:${associate.phone}`}>{associate.phone}</a>
              ) : (
                <span style={{ color: "#999" }}>-</span>
              )}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {associate.email ? (
                <a href={`mailto:${associate.email}`}>{associate.email}</a>
              ) : (
                <span style={{ color: "#999" }}>-</span>
              )}
            </p>

            {associate.organizationName && (
              <p>
                <strong>Organization:</strong> {associate.organizationName}
              </p>
            )}

            <p>
              <strong>Contacts (30 days):</strong>{" "}
              {associate.contactsLast30Days || 0}
            </p>

            <p>
              <strong>WSIB #:</strong>{" "}
              {associate.wsibNumber || <span style={{ color: "#999" }}>-</span>}
            </p>

            <p>
              <strong>Rate:</strong>{" "}
              {associate.hourlySalaryDesired ? (
                `$${associate.hourlySalaryDesired}/hr`
              ) : (
                <span style={{ color: "#999" }}>-</span>
              )}
            </p>

            <div style={{ marginBottom: "1rem" }}>
              <strong>Skill Sets:</strong>
              <div style={{ marginTop: "0.5rem" }}>
                {renderSkillSets(associate.skillSets, task?.orderSkillSets)}
              </div>
            </div>

            <button
              className="button is-primary is-fullwidth"
              onClick={() => onSelectClick(associate)}
            >
              Assign →
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="container">
      <section className="section">
        {/* Desktop Breadcrumbs */}
        <nav
          className="breadcrumb has-background-light is-hidden-touch p-4"
          aria-label="breadcrumbs"
        >
          <ul>
            <li>
              <Link to="/admin/dashboard">
                <span className="icon is-small">📊</span>
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/tasks">
                <span className="icon is-small">📋</span>
                <span>Tasks</span>
              </Link>
            </li>
            <li className="is-active">
              <Link aria-current="page">
                <span className="icon is-small">ℹ️</span>
                <span>Task Detail</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile Breadcrumbs */}
        <nav
          className="breadcrumb has-background-light is-hidden-desktop p-4"
          aria-label="breadcrumbs"
        >
          <ul>
            <li>
              <Link to="/admin/tasks">
                <span className="icon is-small">←</span>
                <span>Back to Tasks</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Page banner */}
        {task && task.status === 2 && (
          <div className="notification is-info is-light">
            <strong>Archived</strong>
          </div>
        )}

        {/* Page Title */}
        <h1 className="title is-2">
          <span className="icon is-small">📋</span>
          <span>Task</span>
        </h1>
        <h4 className="subtitle is-4">
          <span className="icon is-small">ℹ️</span>
          <span>Detail</span>
        </h4>
        <hr />

        {/* Progress Wizard */}
        <nav className="box has-background-light">
          <p className="subtitle is-5">Step 2 of 4</p>
          <progress className="progress is-success" value="50" max="100">
            50%
          </progress>
        </nav>

        {/* Page Content */}
        <nav className="box">
          {/* Title */}
          {task && (
            <div className="columns">
              <div className="column">
                <p className="title is-4">
                  <span className="icon is-small">📋</span>
                  <span>Task Detail - Assign Associate</span>
                </p>
              </div>
            </div>
          )}

          {isFetching ? (
            <div className="has-text-centered" style={{ padding: "3rem" }}>
              <div
                className="loader is-loading"
                style={{ fontSize: "3rem" }}
              ></div>
              <p style={{ marginTop: "1rem" }}>Loading...</p>
            </div>
          ) : (
            <>
              {/* Error Display */}
              {errors && Object.keys(errors).length > 0 && (
                <div className="notification is-danger">
                  <button
                    className="delete"
                    onClick={() => setErrors({})}
                  ></button>
                  {Object.entries(errors).map(([key, value]) => (
                    <div key={key}>
                      <strong>{key}:</strong> {value}
                    </div>
                  ))}
                </div>
              )}

              {task && (
                <div className="container">
                  {/* Task Summary Table */}
                  <table className="table is-fullwidth">
                    <thead>
                      <tr className="has-background-success-light">
                        <th colSpan="2">Task Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Type
                        </th>
                        <td>Assign Associate</td>
                      </tr>
                      <tr>
                        <th className="has-background-light">Description</th>
                        <td>{task.description}</td>
                      </tr>
                      <tr>
                        <th className="has-background-light">Job #</th>
                        <td>
                          <Link to={`/admin/order/${task.orderWjid}`}>
                            {task.orderWjid}
                          </Link>
                        </td>
                      </tr>
                      <tr>
                        <th className="has-background-light">Job Start Date</th>
                        <td>
                          {task.orderStartDate
                            ? new Date(task.orderStartDate).toLocaleDateString()
                            : "-"}
                        </td>
                      </tr>
                      <tr>
                        <th className="has-background-light">
                          Job Description
                        </th>
                        <td>{task.orderDescription || "-"}</td>
                      </tr>
                      <tr>
                        <th className="has-background-light">
                          Required Skill Sets
                        </th>
                        <td>
                          {task.orderSkillSets &&
                          task.orderSkillSets.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {task.orderSkillSets.map((skill, index) => (
                                <span
                                  key={skill.id || skill.value || index}
                                  className="tag is-primary"
                                >
                                  {skill.name || skill.text || skill.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#999" }}>
                              No specific skills required
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th className="has-background-light">Job Tags</th>
                        <td>
                          {task.orderTags && task.orderTags.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {task.orderTags.map((tag, index) => (
                                <span
                                  key={tag.id || tag.value || index}
                                  className="tag is-info"
                                >
                                  {tag.name || tag.text || tag.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#999" }}>-</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th className="has-background-light">Client Name</th>
                        <td>
                          <Link to={`/admin/client/${task.customerId}`}>
                            {task.customerName}
                          </Link>
                        </td>
                      </tr>
                      {task.customerPhone && (
                        <tr>
                          <th className="has-background-light">
                            Client Phone Number (
                            {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]}):
                          </th>
                          <td>
                            <a href={`tel:${task.customerPhone}`}>
                              {task.customerPhone}
                              {task.customerPhoneExtension && (
                                <span>
                                  &nbsp;ext. {task.customerPhoneExtension}
                                </span>
                              )}
                            </a>
                          </td>
                        </tr>
                      )}
                      {task.customerFullAddressUrl && (
                        <tr>
                          <th className="has-background-light">
                            Client Address
                          </th>
                          <td>
                            <a
                              href={task.customerFullAddressUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {task.customerFullAddressWithoutPostalCode}
                            </a>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th className="has-background-light">Client Tags</th>
                        <td>
                          {task.customerTags && task.customerTags.length > 0 ? (
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                              }}
                            >
                              {task.customerTags.map((tag, index) => (
                                <span
                                  key={tag.id || tag.value || index}
                                  className="tag is-warning"
                                >
                                  {tag.name || tag.text || tag.label}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#999" }}>-</span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th className="has-background-light">Comments</th>
                        <td>
                          <Link to={`/admin/order/${task.orderWjid}/comments`}>
                            View comments
                          </Link>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* Available Associates Section */}
                  <div className="columns pt-5">
                    <div className="column">
                      <p className="title is-4">
                        <span className="icon is-small">👷</span>
                        <span>Available Associates</span>
                        {task.orderSkillSets &&
                          task.orderSkillSets.length > 0 && (
                            <span className="tag is-info is-light ml-2">
                              Filtered by required skills
                            </span>
                          )}
                      </p>
                    </div>
                  </div>

                  {associates &&
                  associates.results &&
                  associates.results.length > 0 ? (
                    <>
                      <div className="notification is-info is-light">
                        <strong>Note:</strong> Associates are shown based on
                        matching skill sets. Green highlighted skills match the
                        job requirements.
                      </div>

                      {/* Desktop View */}
                      <div className="is-hidden-touch">
                        <DesktopView associates={associates} task={task} />
                      </div>

                      {/* Mobile View */}
                      <div className="is-hidden-desktop">
                        <MobileView associates={associates} task={task} />
                      </div>
                    </>
                  ) : (
                    <section className="hero is-medium has-background-white-ter">
                      <div className="hero-body">
                        <p className="title">
                          <span className="icon">👷</span>
                          <span>No Matching Associates</span>
                        </p>
                        <p className="subtitle">
                          {task.orderSkillSets &&
                          task.orderSkillSets.length > 0 ? (
                            <>
                              No active associates found with the required skill
                              sets.{" "}
                              <Link to="/admin/associates/add/step-1">
                                <strong>Click here →</strong>
                              </Link>{" "}
                              to add a new associate.
                            </>
                          ) : (
                            <>
                              No active associates found.{" "}
                              <Link to="/admin/associates/add/step-1">
                                <strong>Click here →</strong>
                              </Link>{" "}
                              to add a new associate.
                            </>
                          )}
                        </p>
                      </div>
                    </section>
                  )}

                  {/* Navigation Buttons */}
                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-fullwidth-mobile"
                        to={`/admin/task/${tid}/assign-associate/step-1`}
                      >
                        <span className="icon is-small">←</span>
                        <span>Back to Step 1</span>
                      </Link>
                    </div>
                    <div className="column is-half has-text-right"></div>
                  </div>
                </div>
              )}
            </>
          )}
        </nav>
      </section>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep2Page;
