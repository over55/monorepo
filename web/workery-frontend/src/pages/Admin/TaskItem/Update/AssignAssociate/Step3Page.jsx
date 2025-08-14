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
    const storedData = sessionStorage.getItem("WORKERY_ASSIGN_ASSOCIATE_DATA");
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
      if (status === 3 && (!howWasJobAccepted || howWasJobAccepted === 0)) {
        newErrors["howWasJobAccepted"] =
          "Please select how the job was accepted";
        hasErrors = true;
      }
      if (status === 4 && (!whyJobDeclined || whyJobDeclined === 0)) {
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
      "WORKERY_ASSIGN_ASSOCIATE_DATA",
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
      case 1:
        method = "phone";
        break;
      case 2:
        method = "text";
        break;
      case 3:
        method = "email";
        break;
      case 4:
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
      case 1:
        reason = "associate was busy";
        break;
      case 2:
        reason = "associate does not have the skills";
        break;
      case 3:
        reason = "associate does not wish to travel to the customer's location";
        break;
      case 4:
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
        <p>Step 3 of 4</p>
        <progress value="75" max="100">
          75%
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
                    value={3}
                    checked={status === 3}
                    onChange={(e) => handleStatusChange(3)}
                  />{" "}
                  Yes
                </label>
                <br />
                <label>
                  <input
                    type="radio"
                    name="status"
                    value={4}
                    checked={status === 4}
                    onChange={(e) => handleStatusChange(4)}
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
            {status === 3 && (
              <FormGroup>
                <label>How was this job accepted? *</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={1}
                      checked={howWasJobAccepted === 1}
                      onChange={(e) => handleHowAcceptedChange(1)}
                    />{" "}
                    Phone
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={2}
                      checked={howWasJobAccepted === 2}
                      onChange={(e) => handleHowAcceptedChange(2)}
                    />{" "}
                    Text
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={3}
                      checked={howWasJobAccepted === 3}
                      onChange={(e) => handleHowAcceptedChange(3)}
                    />{" "}
                    Email
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="howWasJobAccepted"
                      value={4}
                      checked={howWasJobAccepted === 4}
                      onChange={(e) => handleHowAcceptedChange(4)}
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
            {status === 4 && (
              <FormGroup>
                <label>Why was this job declined? *</label>
                <div>
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={1}
                      checked={whyJobDeclined === 1}
                      onChange={(e) => handleWhyDeclinedChange(1)}
                    />{" "}
                    Associate was busy
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={2}
                      checked={whyJobDeclined === 2}
                      onChange={(e) => handleWhyDeclinedChange(2)}
                    />{" "}
                    Associate does not have the skills
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={3}
                      checked={whyJobDeclined === 3}
                      onChange={(e) => handleWhyDeclinedChange(3)}
                    />{" "}
                    Associate does not wish to travel to the customer's location
                  </label>
                  <br />
                  <label>
                    <input
                      type="radio"
                      name="whyJobDeclined"
                      value={4}
                      checked={whyJobDeclined === 4}
                      onChange={(e) => handleWhyDeclinedChange(4)}
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
