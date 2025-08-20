// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step2Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSurveyStorage } from "../../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Radio,
  Select,
  Textarea,
  FormGroup,
  Input,
} from "../../../../../components/UI";

const TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
];

export default function AdminTaskItemSurveyStep2Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const surveyStorage = useSurveyStorage();

  // Get form state from storage
  const formData = surveyStorage.getState();

  const [errors, setErrors] = useState({});
  const [wasSurveyConducted, setWasSurveyConducted] = useState(
    formData.wasSurveyConducted || 0,
  );
  const [noSurveyConductedReason, setNoSurveyConductedReason] = useState(
    formData.noSurveyConductedReason || 0,
  );
  const [noSurveyConductedReasonOther, setNoSurveyConductedReasonOther] =
    useState(formData.noSurveyConductedReasonOther || "");
  const [comment, setComment] = useState(formData.comment || "");
  const [wasJobSatisfactory, setWasJobSatisfactory] = useState(
    formData.wasJobSatisfactory || 0,
  );
  const [wasJobFinishedOnTimeAndOnBudget, setWasJobFinishedOnTimeAndOnBudget] =
    useState(formData.wasJobFinishedOnTimeAndOnBudget || 0);
  const [wasAssociatePunctual, setWasAssociatePunctual] = useState(
    formData.wasAssociatePunctual || 0,
  );
  const [wasAssociateProfessional, setWasAssociateProfessional] = useState(
    formData.wasAssociateProfessional || 0,
  );
  const [
    wouldCustomerReferOurOrganization,
    setWouldCustomerReferOurOrganization,
  ] = useState(formData.wouldCustomerReferOurOrganization || 0);

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // Validation
    if (
      wasSurveyConducted === undefined ||
      wasSurveyConducted === null ||
      wasSurveyConducted === "" ||
      wasSurveyConducted === 0
    ) {
      newErrors["wasSurveyConducted"] = "This field is required";
      hasErrors = true;
    }

    if (wasSurveyConducted === 1) {
      if (
        wasJobSatisfactory === undefined ||
        wasJobSatisfactory === null ||
        wasJobSatisfactory === "" ||
        wasJobSatisfactory === 0
      ) {
        newErrors["wasJobSatisfactory"] = "This field is required";
        hasErrors = true;
      }
      if (
        wasJobFinishedOnTimeAndOnBudget === undefined ||
        wasJobFinishedOnTimeAndOnBudget === null ||
        wasJobFinishedOnTimeAndOnBudget === "" ||
        wasJobFinishedOnTimeAndOnBudget === 0
      ) {
        newErrors["wasJobFinishedOnTimeAndOnBudget"] = "This field is required";
        hasErrors = true;
      }
      if (
        wasAssociatePunctual === undefined ||
        wasAssociatePunctual === null ||
        wasAssociatePunctual === "" ||
        wasAssociatePunctual === 0
      ) {
        newErrors["wasAssociatePunctual"] = "This field is required";
        hasErrors = true;
      }
      if (
        wasAssociateProfessional === undefined ||
        wasAssociateProfessional === null ||
        wasAssociateProfessional === "" ||
        wasAssociateProfessional === 0
      ) {
        newErrors["wasAssociateProfessional"] = "This field is required";
        hasErrors = true;
      }
      if (
        wouldCustomerReferOurOrganization === undefined ||
        wouldCustomerReferOurOrganization === null ||
        wouldCustomerReferOurOrganization === "" ||
        wouldCustomerReferOurOrganization === 0
      ) {
        newErrors["wouldCustomerReferOurOrganization"] =
          "This field is required";
        hasErrors = true;
      }
    }

    if (wasSurveyConducted === 2) {
      if (
        noSurveyConductedReason === undefined ||
        noSurveyConductedReason === null ||
        noSurveyConductedReason === "" ||
        noSurveyConductedReason === 0
      ) {
        newErrors["noSurveyConductedReason"] = "This field is required";
        hasErrors = true;
      } else {
        if (noSurveyConductedReason === 1) {
          if (
            noSurveyConductedReasonOther === undefined ||
            noSurveyConductedReasonOther === null ||
            noSurveyConductedReasonOther === "" ||
            noSurveyConductedReasonOther === 0
          ) {
            newErrors["noSurveyConductedReasonOther"] =
              "This field is required";
            hasErrors = true;
          }
        }
      }
      if (comment === undefined || comment === null || comment === "") {
        newErrors["comment"] = "This field is required";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aborting because of error(s)");
      setErrors(newErrors);
      window.scrollTo(0, 0);
      return;
    }

    // Save to storage
    surveyStorage.updateState({
      wasSurveyConducted,
      noSurveyConductedReason,
      noSurveyConductedReasonOther,
      comment,
      wasJobSatisfactory,
      wasJobFinishedOnTimeAndOnBudget,
      wasAssociatePunctual,
      wasAssociateProfessional,
      wouldCustomerReferOurOrganization,
    });

    // Navigate to step 3
    navigate(`/admin/task/${tid}/survey/step-3`);
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Tasks", path: "/admin/tasks", icon: "📋" },
    { label: "Task Detail", icon: "ℹ️" },
  ];

  return (
    <div className="container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>📋 Task Survey</h1>
      <h4>📝 Survey Questions</h4>
      <hr />

      {/* Progress */}
      <Card>
        <p>Step 2 of 3</p>
        <progress value="66" max="100">
          66%
        </progress>
      </Card>

      {/* Page Content */}
      <Card title="📋 Task Detail - Survey">
        {/* Errors */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error">
            <h4>Please correct the following errors:</h4>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>{value}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Survey Form */}
        <div style={{ maxWidth: "800px" }}>
          {/* Was Survey Conducted */}
          <FormGroup
            label="Was there a survey conducted?"
            required={true}
            error={errors.wasSurveyConducted}
            helperText="Selecting 'Yes' will close this job as success"
          >
            <div style={{ display: "flex", gap: "20px", marginTop: "10px" }}>
              <Radio
                label="Yes"
                name="wasSurveyConducted"
                value={1}
                checked={wasSurveyConducted === 1}
                onChange={(e) =>
                  setWasSurveyConducted(parseInt(e.target.value))
                }
              />
              <Radio
                label="No"
                name="wasSurveyConducted"
                value={2}
                checked={wasSurveyConducted === 2}
                onChange={(e) =>
                  setWasSurveyConducted(parseInt(e.target.value))
                }
              />
            </div>
          </FormGroup>

          {/* Survey Questions - Show if Yes */}
          {wasSurveyConducted === 1 && (
            <Card className="mt-4" style={{ backgroundColor: "#f8f9fa" }}>
              <h4 style={{ marginBottom: "20px" }}>📝 Survey Questions</h4>

              {/* Job Satisfactory */}
              <FormGroup
                label="Was the quality of the work satisfactory?"
                required={true}
                error={errors.wasJobSatisfactory}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "10px" }}
                >
                  <Radio
                    label="Yes"
                    name="wasJobSatisfactory"
                    value={1}
                    checked={wasJobSatisfactory === 1}
                    onChange={(e) =>
                      setWasJobSatisfactory(parseInt(e.target.value))
                    }
                  />
                  <Radio
                    label="No"
                    name="wasJobSatisfactory"
                    value={2}
                    checked={wasJobSatisfactory === 2}
                    onChange={(e) =>
                      setWasJobSatisfactory(parseInt(e.target.value))
                    }
                  />
                </div>
              </FormGroup>

              {/* On Time and Budget */}
              <FormGroup
                label="Was the work completed on time and on budget?"
                required={true}
                error={errors.wasJobFinishedOnTimeAndOnBudget}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "10px" }}
                >
                  <Radio
                    label="Yes"
                    name="wasJobFinishedOnTimeAndOnBudget"
                    value={1}
                    checked={wasJobFinishedOnTimeAndOnBudget === 1}
                    onChange={(e) =>
                      setWasJobFinishedOnTimeAndOnBudget(
                        parseInt(e.target.value),
                      )
                    }
                  />
                  <Radio
                    label="No"
                    name="wasJobFinishedOnTimeAndOnBudget"
                    value={2}
                    checked={wasJobFinishedOnTimeAndOnBudget === 2}
                    onChange={(e) =>
                      setWasJobFinishedOnTimeAndOnBudget(
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
              </FormGroup>

              {/* Associate Punctual */}
              <FormGroup
                label="Was the Associate Member punctual?"
                required={true}
                error={errors.wasAssociatePunctual}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "10px" }}
                >
                  <Radio
                    label="Yes"
                    name="wasAssociatePunctual"
                    value={1}
                    checked={wasAssociatePunctual === 1}
                    onChange={(e) =>
                      setWasAssociatePunctual(parseInt(e.target.value))
                    }
                  />
                  <Radio
                    label="No"
                    name="wasAssociatePunctual"
                    value={2}
                    checked={wasAssociatePunctual === 2}
                    onChange={(e) =>
                      setWasAssociatePunctual(parseInt(e.target.value))
                    }
                  />
                </div>
              </FormGroup>

              {/* Associate Professional */}
              <FormGroup
                label="Was the Associate Member professional?"
                required={true}
                error={errors.wasAssociateProfessional}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "10px" }}
                >
                  <Radio
                    label="Yes"
                    name="wasAssociateProfessional"
                    value={1}
                    checked={wasAssociateProfessional === 1}
                    onChange={(e) =>
                      setWasAssociateProfessional(parseInt(e.target.value))
                    }
                  />
                  <Radio
                    label="No"
                    name="wasAssociateProfessional"
                    value={2}
                    checked={wasAssociateProfessional === 2}
                    onChange={(e) =>
                      setWasAssociateProfessional(parseInt(e.target.value))
                    }
                  />
                </div>
              </FormGroup>

              {/* Would Refer */}
              <FormGroup
                label="Would you refer Over55 to a friend or family member?"
                required={true}
                error={errors.wouldCustomerReferOurOrganization}
              >
                <div
                  style={{ display: "flex", gap: "20px", marginTop: "10px" }}
                >
                  <Radio
                    label="Yes"
                    name="wouldCustomerReferOurOrganization"
                    value={1}
                    checked={wouldCustomerReferOurOrganization === 1}
                    onChange={(e) =>
                      setWouldCustomerReferOurOrganization(
                        parseInt(e.target.value),
                      )
                    }
                  />
                  <Radio
                    label="No"
                    name="wouldCustomerReferOurOrganization"
                    value={2}
                    checked={wouldCustomerReferOurOrganization === 2}
                    onChange={(e) =>
                      setWouldCustomerReferOurOrganization(
                        parseInt(e.target.value),
                      )
                    }
                  />
                </div>
              </FormGroup>
            </Card>
          )}

          {/* No Survey Conducted - Show if No */}
          {wasSurveyConducted === 2 && (
            <Card className="mt-4" style={{ backgroundColor: "#fff3cd" }}>
              <h4 style={{ marginBottom: "20px" }}>⚠️ No Survey Conducted</h4>

              {/* Reason Select */}
              <Select
                label="Please select why the survey was not conducted"
                value={noSurveyConductedReason}
                onChange={(e) =>
                  setNoSurveyConductedReason(parseInt(e.target.value))
                }
                options={TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS}
                required={true}
                error={errors.noSurveyConductedReason}
              />

              {/* Other Reason Input */}
              {noSurveyConductedReason === 1 && (
                <Input
                  label="Please specify the reason"
                  type="text"
                  value={noSurveyConductedReasonOther}
                  onChange={(e) =>
                    setNoSurveyConductedReasonOther(e.target.value)
                  }
                  placeholder="Enter the specific reason..."
                  required={true}
                  error={errors.noSurveyConductedReasonOther}
                />
              )}

              {/* Comment Textarea */}
              <Textarea
                label="Comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write any additional comments here..."
                rows={5}
                required={true}
                error={errors.comment}
                helperText="Include any additional information here."
              />
            </Card>
          )}

          {/* Action Buttons */}
          <div
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Link to={`/admin/task/${tid}/survey/step-1`}>
              <Button variant="secondary">← Back to Step 1</Button>
            </Link>
            <Button onClick={onSubmitClick} variant="primary">
              Save & Continue →
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
