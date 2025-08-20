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
      return <span className="has-text-grey">-</span>;
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
      <div className="tags">
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
      </div>
    );
  };

  // Desktop view component
  const DesktopView = ({ associates, task }) => (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="table is-fullwidth is-striped is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Contacts (30 days)</th>
              <th>WSIB #</th>
              <th>Rate</th>
              <th>Matching Skill Sets</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {associates.results.map((associate, index) => (
              <tr key={associate.id}>
                <td>{index + 1}</td>
                <td data-label="Name">
                  <Link
                    to={`/admin/associate/${associate.id}`}
                    target="_blank"
                    className="has-text-primary"
                  >
                    <strong>{associate.name}</strong>
                  </Link>
                </td>
                <td data-label="Phone">
                  {associate.phone ? (
                    <a
                      href={`tel:${associate.phone}`}
                      className="has-text-link"
                    >
                      📞 {associate.phone}
                    </a>
                  ) : (
                    <span className="has-text-grey">-</span>
                  )}
                </td>
                <td data-label="Email">
                  {associate.email ? (
                    <a
                      href={`mailto:${associate.email}`}
                      className="has-text-link"
                    >
                      ✉️ {associate.email}
                    </a>
                  ) : (
                    <span className="has-text-grey">-</span>
                  )}
                </td>
                <td data-label="Contacts (30 days)">
                  {associate.contactsLast30Days || 0}
                </td>
                <td data-label="WSIB #">
                  {associate.wsibNumber || (
                    <span className="has-text-grey">-</span>
                  )}
                </td>
                <td data-label="Rate">
                  {associate.hourlySalaryDesired ? (
                    <span className="has-text-success">
                      ${associate.hourlySalaryDesired}/hr
                    </span>
                  ) : (
                    <span className="has-text-grey">-</span>
                  )}
                </td>
                <td data-label="Matching Skills">
                  {renderSkillSets(associate.skillSets, task?.orderSkillSets)}
                </td>
                <td className="is-actions-cell">
                  <div className="buttons is-right">
                    <button
                      className="button is-small is-primary"
                      onClick={() => onSelectClick(associate)}
                    >
                      Assign →
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Mobile view component
  const MobileView = ({ associates, task }) => (
    <>
      {associates.results.map((associate, index) => (
        <div key={associate.id} className="mb-5">
          {index !== 0 && <hr />}
          <strong>👤 Name:</strong>
          &nbsp;
          <Link
            to={`/admin/associate/${associate.id}`}
            target="_blank"
            className="has-text-primary"
          >
            <strong>{associate.name}</strong>
          </Link>
          <br />
          <br />
          <strong>📞 Phone:</strong>
          &nbsp;
          {associate.phone ? (
            <a href={`tel:${associate.phone}`} className="has-text-link">
              {associate.phone}
            </a>
          ) : (
            <span className="has-text-grey">-</span>
          )}
          <br />
          <br />
          <strong>✉️ Email:</strong>
          &nbsp;
          {associate.email ? (
            <a href={`mailto:${associate.email}`} className="has-text-link">
              {associate.email}
            </a>
          ) : (
            <span className="has-text-grey">-</span>
          )}
          <br />
          <br />
          {associate.organizationName && (
            <>
              <strong>🏢 Organization:</strong>
              &nbsp;{associate.organizationName}
              <br />
              <br />
            </>
          )}
          <strong>📅 Contacts (30 days):</strong>
          &nbsp;{associate.contactsLast30Days || 0}
          <br />
          <br />
          <strong>🆔 WSIB #:</strong>
          &nbsp;
          {associate.wsibNumber || <span className="has-text-grey">-</span>}
          <br />
          <br />
          <strong>💵 Rate:</strong>
          &nbsp;
          {associate.hourlySalaryDesired ? (
            <span className="has-text-success">
              ${associate.hourlySalaryDesired}/hr
            </span>
          ) : (
            <span className="has-text-grey">-</span>
          )}
          <br />
          <br />
          <strong>🔧 Matching Skill Sets:</strong>
          <br />
          {renderSkillSets(associate.skillSets, task?.orderSkillSets)}
          <br />
          <button
            className="button is-primary is-fullwidth"
            onClick={() => onSelectClick(associate)}
          >
            Assign →
          </button>
        </div>
      ))}
    </>
  );

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return (
    <>
      <div className="container">
        <section className="section">
          {/* Desktop Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-touch p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to="/admin/dashboard" aria-current="page">
                  📊 Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/admin/tasks" aria-current="page">
                  📋 Tasks
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">ℹ️ Task Detail</Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-desktop p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to="/admin/tasks" aria-current="page">
                  ← Back to Tasks
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {task && task.status === 2 && (
            <div className="notification is-info is-light">
              ℹ️ <strong>Note:</strong> This task is archived.
            </div>
          )}

          {/* Page Title */}
          <h1 className="title is-2">📋 Task</h1>
          <h4 className="subtitle is-4">ℹ️ Detail</h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 2 of 4</p>
            <progress className="progress is-success" value="50" max="100">
              50%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {task && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    📋 Task Detail - Assign Associate
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            {isFetching ? (
              <div className="has-text-centered" style={{ padding: "40px" }}>
                <div className="lds-ring">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
                <p className="has-text-grey" style={{ marginTop: "20px" }}>
                  Loading...
                </p>
                <style>{`
                  .lds-ring {
                    display: inline-block;
                    position: relative;
                    width: 80px;
                    height: 80px;
                  }
                  .lds-ring div {
                    box-sizing: border-box;
                    display: block;
                    position: absolute;
                    width: 64px;
                    height: 64px;
                    margin: 8px;
                    border: 8px solid #00d1b2;
                    border-radius: 50%;
                    animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                    border-color: #00d1b2 transparent transparent transparent;
                  }
                  .lds-ring div:nth-child(1) {
                    animation-delay: -0.45s;
                  }
                  .lds-ring div:nth-child(2) {
                    animation-delay: -0.3s;
                  }
                  .lds-ring div:nth-child(3) {
                    animation-delay: -0.15s;
                  }
                  @keyframes lds-ring {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}</style>
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
                    <p className="title is-5">⚠️ Error</p>
                    {Object.entries(errors).map(([key, value]) => (
                      <p key={key}>
                        <strong>{key}:</strong> {value}
                      </p>
                    ))}
                  </div>
                )}

                {task && (
                  <div className="container">
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
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description
                          </th>
                          <td>{task.description}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job #
                          </th>
                          <td>
                            <Link
                              to={`/admin/order/${task.orderWjid}`}
                              className="has-text-primary"
                            >
                              {task.orderWjid} →
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Start Date
                          </th>
                          <td>
                            {task.orderStartDate
                              ? new Date(
                                  task.orderStartDate,
                                ).toLocaleDateString()
                              : "-"}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Description
                          </th>
                          <td>
                            {task.orderDescription ? (
                              task.orderDescription
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Skill Sets
                          </th>
                          <td>
                            {task.orderSkillSets &&
                            task.orderSkillSets.length > 0 ? (
                              <div className="tags">
                                {task.orderSkillSets.map((skill, index) => (
                                  <span
                                    key={skill.id || skill.value || index}
                                    className="tag is-primary"
                                  >
                                    🔧 {skill.name || skill.text || skill.label}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="has-text-grey">-</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Tags
                          </th>
                          <td>
                            {task.orderTags && task.orderTags.length > 0 ? (
                              <div className="tags">
                                {task.orderTags.map((tag, index) => (
                                  <span
                                    key={tag.id || tag.value || index}
                                    className="tag is-info is-light"
                                  >
                                    🏷️ {tag.name || tag.text || tag.label}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="has-text-grey">-</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Client Name
                          </th>
                          <td>
                            <Link
                              to={`/admin/client/${task.customerId}`}
                              className="has-text-primary"
                            >
                              {task.customerName} →
                            </Link>
                          </td>
                        </tr>
                        {task.customerPhone && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Client Phone Number (
                              {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]}
                              ):
                            </th>
                            <td>
                              <a
                                href={`tel:${task.customerPhone}`}
                                className="has-text-link"
                              >
                                📞 {task.customerPhone}
                                {task.customerPhoneExtension && (
                                  <> ext. {task.customerPhoneExtension}</>
                                )}
                              </a>
                            </td>
                          </tr>
                        )}
                        {task.customerFullAddressUrl && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Client Address
                            </th>
                            <td>
                              <a
                                href={task.customerFullAddressUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="has-text-link"
                              >
                                📍 {task.customerFullAddressWithoutPostalCode}
                              </a>
                            </td>
                          </tr>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Client Tags
                          </th>
                          <td>
                            {task.customerTags &&
                            task.customerTags.length > 0 ? (
                              <div className="tags">
                                {task.customerTags.map((tag, index) => (
                                  <span
                                    key={tag.id || tag.value || index}
                                    className="tag is-warning is-light"
                                  >
                                    🏷️ {tag.name || tag.text || tag.label}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="has-text-grey">-</span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Comments
                          </th>
                          <td>
                            <Link
                              to={`/admin/order/${task.orderWjid}/comments`}
                              className="has-text-primary"
                            >
                              💬 View comments →
                            </Link>
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Available Associates */}
                    {task && (
                      <div className="columns pt-5">
                        <div className="column">
                          <p className="title is-4">👷 Available Associates</p>
                          {task.orderSkillSets &&
                            task.orderSkillSets.length > 0 && (
                              <div className="notification is-info is-light">
                                ℹ️ <strong>Note:</strong> Associates are
                                filtered by matching skill sets. Green
                                highlighted skills match the job requirements.
                              </div>
                            )}
                        </div>
                        <div className="column has-text-right"></div>
                      </div>
                    )}

                    {associates &&
                    associates.results &&
                    associates.results.length > 0 ? (
                      <div className="container">
                        {/*
                          ##################################################################
                          EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A DESKTOP SCREEN.
                          ##################################################################
                        */}
                        <div className="is-hidden-touch">
                          <DesktopView associates={associates} task={task} />
                        </div>

                        {/*
                          ###########################################################################
                          EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                          ###########################################################################
                        */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <MobileView associates={associates} task={task} />
                        </div>
                      </div>
                    ) : (
                      <section className="hero is-medium has-background-white-ter">
                        <div className="hero-body">
                          <p className="title">⚠️ No Associates</p>
                          <p className="subtitle">
                            {task.orderSkillSets &&
                            task.orderSkillSets.length > 0 ? (
                              <>
                                No active associates found with the required
                                skill sets.{" "}
                                <b>
                                  <Link to="/admin/associates/add/step-1-search">
                                    Click here →
                                  </Link>
                                </b>{" "}
                                to get started creating your first associate.
                              </>
                            ) : (
                              <>
                                No active associates found.{" "}
                                <b>
                                  <Link to="/admin/associates/add/step-1-search">
                                    Click here →
                                  </Link>
                                </b>{" "}
                                to get started creating your first associate.
                              </>
                            )}
                          </p>
                        </div>
                      </section>
                    )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/task/${tid}/assign-associate/step-1`}
                        >
                          ← Back to Step 1
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
    </>
  );
}

export default AdminTaskItemAssignAssociateStep2Page;
