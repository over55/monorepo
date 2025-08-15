// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/AssignAssociate/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  FormGroup,
  TextArea,
} from "../../../../../components/UI";
import { STORAGE_KEYS } from "../../../../../constants/Storage";
import {
  TASK_ASSIGN_ASSOCIATE_STATUS,
  TASK_HOW_JOB_ACCEPTED,
  TASK_WHY_JOB_DECLINED,
  TASK_WIZARD_STEPS,
  TASK_PROGRESS_PERCENTAGE,
} from "../../../../../constants/Task";

function AdminTaskItemAssignAssociateStep3Page() {
  // URL Parameters
  const { tid } = useParams();

  // Component states
  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [associateData, setAssociateData] = useState(null);
  const [status, setStatus] = useState(0);
  const [predefinedComment, setPredefinedComment] = useState("");
  const [comment, setComment] = useState("");
  const [howWasJobAccepted, setHowWasJobAccepted] = useState(0);
  const [whyJobDeclined, setWhyJobDeclined] = useState(0);

  // Load associate data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
    );
    if (!storedData) {
      setForceURL(`/admin/task/${tid}/assign-associate/step-2`);
      return;
    }

    const data = JSON.parse(storedData);
    setAssociateData(data);
  }, [tid]);

  // Event handling
  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (!status || status === 0) {
      newErrors["status"] = "Please select whether the job was accepted";
      hasErrors = true;
    } else {
      if (
        status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED &&
        (!howWasJobAccepted || howWasJobAccepted === 0)
      ) {
        newErrors["howWasJobAccepted"] =
          "Please select how the job was accepted";
        hasErrors = true;
      }
      if (
        status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED &&
        (!whyJobDeclined || whyJobDeclined === 0)
      ) {
        newErrors["whyJobDeclined"] = "Please select why the job was declined";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to session storage with existing data
    const updatedData = {
      ...associateData,
      status: status,
      comment: comment,
      howWasJobAccepted: howWasJobAccepted,
      whyJobDeclined: whyJobDeclined,
      predefinedComment: predefinedComment,
    };
    sessionStorage.setItem(
      STORAGE_KEYS.WORKERY_ASSIGN_ASSOCIATE_DATA,
      JSON.stringify(updatedData),
    );

    // Redirect to the next page
    setForceURL(`/admin/task/${tid}/assign-associate/step-4`);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPredefinedComment("");
    setHowWasJobAccepted(0);
    setWhyJobDeclined(0);
  };

  const handleHowAcceptedChange = (value) => {
    setHowWasJobAccepted(value);

    const todayDate = new Date().toISOString().slice(0, 10);
    let method = "";
    switch (value) {
      case TASK_HOW_JOB_ACCEPTED.PHONE:
        method = "phone";
        break;
      case TASK_HOW_JOB_ACCEPTED.TEXT:
        method = "text";
        break;
      case TASK_HOW_JOB_ACCEPTED.EMAIL:
        method = "email";
        break;
      case TASK_HOW_JOB_ACCEPTED.IN_PERSON:
        method = "in-person confirmation";
        break;
      default:
    }

    if (method && associateData) {
      setPredefinedComment(
        `Job accepted by ${associateData.associateName} on ${todayDate} via ${method}.`,
      );
    }
  };

  const handleWhyDeclinedChange = (value) => {
    setWhyJobDeclined(value);

    const todayDate = new Date().toISOString().slice(0, 10);
    let reason = "";
    switch (value) {
      case TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY:
        reason = "associate was busy";
        break;
      case TASK_WHY_JOB_DECLINED.NO_SKILLS:
        reason = "associate does not have the skills";
        break;
      case TASK_WHY_JOB_DECLINED.NO_TRAVEL:
        reason = "associate does not wish to travel to the customer's location";
        break;
      case TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT:
        reason = "associate does not wish to work with this client";
        break;
      default:
    }

    if (reason && associateData) {
      setPredefinedComment(
        `Job declined by ${associateData.associateName} on ${todayDate} because ${reason}.`,
      );
    }
  };

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

      {/* Page Title */}
      <h1>📋 Task</h1>
      <h4>ℹ️ Detail</h4>
      <hr />

      {/* Progress Wizard */}
      <Card>
        <p>
          Step {TASK_WIZARD_STEPS.ASSIGN_ASSOCIATE.CONFIRM} of{" "}
          {TASK_WIZARD_STEPS.ASSIGN_ASSOCIATE.TOTAL}
        </p>
        <progress value={TASK_PROGRESS_PERCENTAGE.STEP_3_OF_4} max="100">
          {TASK_PROGRESS_PERCENTAGE.STEP_3_OF_4}%
        </progress>
      </Card>

      {/* Page Content */}
      <Card title="📋 Task Detail - Assign Associate">
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error">
            {Object.entries(errors).map(([key, value]) => (
              <div key={key}>{value}</div>
            ))}
          </Alert>
        )}

        {associateData && (
          <div>
            {/* Associate Info */}
            <FormGroup>
              <label>Associate</label>
              <div>
                <Link to={`/admin/associate/${associateData.associateID}`}>
                  {associateData.associateName}
                </Link>
              </div>
            </FormGroup>

            {/* Accepted Job? */}
            <FormGroup>
              <label>Accepted Job? *</label>
              <div>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value={TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED}
                    checked={status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED}
                    onChange={(e) =>
                      handleStatusChange(TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED)
                    }
                  />{" "}
                  Yes
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="status"
                    value={TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED}
                    checked={status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED}
                    onChange={(e) =>
                      handleStatusChange(TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED)
                    }
                  />{" "}
                  No
                </label>
              </div>
              {errors.status && (
                <div style={{ color: "red", fontSize: "12px" }}>
                  {errors.status}
                </div>
              )}
            </FormGroup>

            {/* How was job accepted */}
            {status === TASK_ASSIGN_ASSOCIATE_STATUS.ACCEPTED && (
              <FormGroup>
                <label>How was this job accepted? *</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={TASK_HOW_JOB_ACCEPTED.PHONE}
                      checked={
                        howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.PHONE
                      }
                      onChange={(e) =>
                        handleHowAcceptedChange(TASK_HOW_JOB_ACCEPTED.PHONE)
                      }
                    />{" "}
                    Phone
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={TASK_HOW_JOB_ACCEPTED.TEXT}
                      checked={howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.TEXT}
                      onChange={(e) =>
                        handleHowAcceptedChange(TASK_HOW_JOB_ACCEPTED.TEXT)
                      }
                    />{" "}
                    Text
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={TASK_HOW_JOB_ACCEPTED.EMAIL}
                      checked={
                        howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.EMAIL
                      }
                      onChange={(e) =>
                        handleHowAcceptedChange(TASK_HOW_JOB_ACCEPTED.EMAIL)
                      }
                    />{" "}
                    Email
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={TASK_HOW_JOB_ACCEPTED.IN_PERSON}
                      checked={
                        howWasJobAccepted === TASK_HOW_JOB_ACCEPTED.IN_PERSON
                      }
                      onChange={(e) =>
                        handleHowAcceptedChange(TASK_HOW_JOB_ACCEPTED.IN_PERSON)
                      }
                    />{" "}
                    In-person confirmation
                  </label>
                </div>
                {errors.howWasJobAccepted && (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {errors.howWasJobAccepted}
                  </div>
                )}
              </FormGroup>
            )}

            {/* Why was job declined */}
            {status === TASK_ASSIGN_ASSOCIATE_STATUS.DECLINED && (
              <FormGroup>
                <label>Why was this job declined? *</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY}
                      checked={
                        whyJobDeclined === TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY
                      }
                      onChange={(e) =>
                        handleWhyDeclinedChange(
                          TASK_WHY_JOB_DECLINED.ASSOCIATE_BUSY,
                        )
                      }
                    />{" "}
                    Associate was busy
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={TASK_WHY_JOB_DECLINED.NO_SKILLS}
                      checked={
                        whyJobDeclined === TASK_WHY_JOB_DECLINED.NO_SKILLS
                      }
                      onChange={(e) =>
                        handleWhyDeclinedChange(TASK_WHY_JOB_DECLINED.NO_SKILLS)
                      }
                    />{" "}
                    Associate does not have the skills
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={TASK_WHY_JOB_DECLINED.NO_TRAVEL}
                      checked={
                        whyJobDeclined === TASK_WHY_JOB_DECLINED.NO_TRAVEL
                      }
                      onChange={(e) =>
                        handleWhyDeclinedChange(TASK_WHY_JOB_DECLINED.NO_TRAVEL)
                      }
                    />{" "}
                    Associate does not wish to travel to the customer's location
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT}
                      checked={
                        whyJobDeclined ===
                        TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT
                      }
                      onChange={(e) =>
                        handleWhyDeclinedChange(
                          TASK_WHY_JOB_DECLINED.NO_WORK_WITH_CLIENT,
                        )
                      }
                    />{" "}
                    Associate does not wish to work with this client
                  </label>
                </div>
                {errors.whyJobDeclined && (
                  <div style={{ color: "red", fontSize: "12px" }}>
                    {errors.whyJobDeclined}
                  </div>
                )}
              </FormGroup>
            )}

            {/* Predefined Comment */}
            {status !== 0 && (
              <TextArea
                label="Predefined Comment"
                value={predefinedComment}
                disabled={true}
                rows={3}
              />
            )}

            {/* Additional Comment */}
            <TextArea
              label="Comment (Optional)"
              placeholder="Write any additional comments here."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
            />

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <Link to={`/admin/task/${tid}/assign-associate/step-2`}>
                <Button variant="secondary">← Back to Step 2</Button>
              </Link>

              <div style={{ marginLeft: "auto" }}>
                <Button onClick={onSubmitClick} variant="primary">
                  Confirm & Continue →
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminTaskItemAssignAssociateStep3Page;
