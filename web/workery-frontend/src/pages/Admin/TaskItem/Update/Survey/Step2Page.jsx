// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step2Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useSurveyStorage } from "../../../../../services/Services";

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
    formData.wasSurveyConducted,
  );
  const [noSurveyConductedReason, setNoSurveyConductedReason] = useState(
    formData.noSurveyConductedReason,
  );
  const [noSurveyConductedReasonOther, setNoSurveyConductedReasonOther] =
    useState(formData.noSurveyConductedReasonOther);
  const [comment, setComment] = useState(formData.comment);
  const [wasJobSatisfactory, setWasJobSatisfactory] = useState(
    formData.wasJobSatisfactory,
  );
  const [wasJobFinishedOnTimeAndOnBudget, setWasJobFinishedOnTimeAndOnBudget] =
    useState(formData.wasJobFinishedOnTimeAndOnBudget);
  const [wasAssociatePunctual, setWasAssociatePunctual] = useState(
    formData.wasAssociatePunctual,
  );
  const [wasAssociateProfessional, setWasAssociateProfessional] = useState(
    formData.wasAssociateProfessional,
  );
  const [
    wouldCustomerReferOurOrganization,
    setWouldCustomerReferOurOrganization,
  ] = useState(formData.wouldCustomerReferOurOrganization);

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
      newErrors["wasSurveyConducted"] = "missing value";
      hasErrors = true;
    }

    if (wasSurveyConducted === 1) {
      if (
        wasJobSatisfactory === undefined ||
        wasJobSatisfactory === null ||
        wasJobSatisfactory === "" ||
        wasJobSatisfactory === 0
      ) {
        newErrors["wasJobSatisfactory"] = "missing value";
        hasErrors = true;
      }
      if (
        wasJobFinishedOnTimeAndOnBudget === undefined ||
        wasJobFinishedOnTimeAndOnBudget === null ||
        wasJobFinishedOnTimeAndOnBudget === "" ||
        wasJobFinishedOnTimeAndOnBudget === 0
      ) {
        newErrors["wasJobFinishedOnTimeAndOnBudget"] = "missing value";
        hasErrors = true;
      }
      if (
        wasAssociatePunctual === undefined ||
        wasAssociatePunctual === null ||
        wasAssociatePunctual === "" ||
        wasAssociatePunctual === 0
      ) {
        newErrors["wasAssociatePunctual"] = "missing value";
        hasErrors = true;
      }
      if (
        wasAssociateProfessional === undefined ||
        wasAssociateProfessional === null ||
        wasAssociateProfessional === "" ||
        wasAssociateProfessional === 0
      ) {
        newErrors["wasAssociateProfessional"] = "missing value";
        hasErrors = true;
      }
      if (
        wouldCustomerReferOurOrganization === undefined ||
        wouldCustomerReferOurOrganization === null ||
        wouldCustomerReferOurOrganization === "" ||
        wouldCustomerReferOurOrganization === 0
      ) {
        newErrors["wouldCustomerReferOurOrganization"] = "missing value";
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
        newErrors["noSurveyConductedReason"] = "missing value";
        hasErrors = true;
      } else {
        if (noSurveyConductedReason === 1) {
          if (
            noSurveyConductedReasonOther === undefined ||
            noSurveyConductedReasonOther === null ||
            noSurveyConductedReasonOther === "" ||
            noSurveyConductedReasonOther === 0
          ) {
            newErrors["noSurveyConductedReasonOther"] = "missing value";
            hasErrors = true;
          }
        }
      }
      if (comment === undefined || comment === null || comment === "") {
        newErrors["comment"] = "missing value";
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
        <p>Step 2 of 3</p>
        <progress value="66" max="100">
          66%
        </progress>
      </div>

      {/* Page Content */}
      <div>
        <h2>Task Detail - Survey</h2>

        {/* Errors */}
        {errors && Object.keys(errors).length > 0 && (
          <div style={{ color: "red", marginBottom: "20px" }}>
            <h3>Errors:</h3>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div>
            <label>
              Was there a survey conducted?
              {errors.wasSurveyConducted && (
                <span style={{ color: "red" }}>
                  {" "}
                  ({errors.wasSurveyConducted})
                </span>
              )}
            </label>
            <div>
              <label>
                <input
                  type="radio"
                  value={1}
                  checked={wasSurveyConducted === 1}
                  onChange={(e) =>
                    setWasSurveyConducted(parseInt(e.target.value))
                  }
                />
                Yes
              </label>
              <label style={{ marginLeft: "20px" }}>
                <input
                  type="radio"
                  value={2}
                  checked={wasSurveyConducted === 2}
                  onChange={(e) =>
                    setWasSurveyConducted(parseInt(e.target.value))
                  }
                />
                No
              </label>
            </div>
            <small>Selecting `yes` will close this job as success</small>
          </div>

          {wasSurveyConducted === 1 && (
            <>
              <div style={{ marginTop: "20px" }}>
                <label>
                  Was the quality of the work satisfactory?
                  {errors.wasJobSatisfactory && (
                    <span style={{ color: "red" }}>
                      {" "}
                      ({errors.wasJobSatisfactory})
                    </span>
                  )}
                </label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value={1}
                      checked={wasJobSatisfactory === 1}
                      onChange={(e) =>
                        setWasJobSatisfactory(parseInt(e.target.value))
                      }
                    />
                    Yes
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      value={2}
                      checked={wasJobSatisfactory === 2}
                      onChange={(e) =>
                        setWasJobSatisfactory(parseInt(e.target.value))
                      }
                    />
                    No
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <label>
                  Was the work completed on time and on budget?
                  {errors.wasJobFinishedOnTimeAndOnBudget && (
                    <span style={{ color: "red" }}>
                      {" "}
                      ({errors.wasJobFinishedOnTimeAndOnBudget})
                    </span>
                  )}
                </label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value={1}
                      checked={wasJobFinishedOnTimeAndOnBudget === 1}
                      onChange={(e) =>
                        setWasJobFinishedOnTimeAndOnBudget(
                          parseInt(e.target.value),
                        )
                      }
                    />
                    Yes
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      value={2}
                      checked={wasJobFinishedOnTimeAndOnBudget === 2}
                      onChange={(e) =>
                        setWasJobFinishedOnTimeAndOnBudget(
                          parseInt(e.target.value),
                        )
                      }
                    />
                    No
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <label>
                  Was the Associate Member punctual?
                  {errors.wasAssociatePunctual && (
                    <span style={{ color: "red" }}>
                      {" "}
                      ({errors.wasAssociatePunctual})
                    </span>
                  )}
                </label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value={1}
                      checked={wasAssociatePunctual === 1}
                      onChange={(e) =>
                        setWasAssociatePunctual(parseInt(e.target.value))
                      }
                    />
                    Yes
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      value={2}
                      checked={wasAssociatePunctual === 2}
                      onChange={(e) =>
                        setWasAssociatePunctual(parseInt(e.target.value))
                      }
                    />
                    No
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <label>
                  Was the Associate Member professional?
                  {errors.wasAssociateProfessional && (
                    <span style={{ color: "red" }}>
                      {" "}
                      ({errors.wasAssociateProfessional})
                    </span>
                  )}
                </label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value={1}
                      checked={wasAssociateProfessional === 1}
                      onChange={(e) =>
                        setWasAssociateProfessional(parseInt(e.target.value))
                      }
                    />
                    Yes
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      value={2}
                      checked={wasAssociateProfessional === 2}
                      onChange={(e) =>
                        setWasAssociateProfessional(parseInt(e.target.value))
                      }
                    />
                    No
                  </label>
                </div>
              </div>

              <div style={{ marginTop: "20px" }}>
                <label>
                  Would you refer Over55 to a friend of family member?
                  {errors.wouldCustomerReferOurOrganization && (
                    <span style={{ color: "red" }}>
                      {" "}
                      ({errors.wouldCustomerReferOurOrganization})
                    </span>
                  )}
                </label>
                <div>
                  <label>
                    <input
                      type="radio"
                      value={1}
                      checked={wouldCustomerReferOurOrganization === 1}
                      onChange={(e) =>
                        setWouldCustomerReferOurOrganization(
                          parseInt(e.target.value),
                        )
                      }
                    />
                    Yes
                  </label>
                  <label style={{ marginLeft: "20px" }}>
                    <input
                      type="radio"
                      value={2}
                      checked={wouldCustomerReferOurOrganization === 2}
                      onChange={(e) =>
                        setWouldCustomerReferOurOrganization(
                          parseInt(e.target.value),
                        )
                      }
                    />
                    No
                  </label>
                </div>
              </div>
            </>
          )}

          {wasSurveyConducted === 2 && (
            <>
              <div style={{ marginTop: "20px" }}>
                <label>
                  Please select why the survey was not conducted?
                  {errors.noSurveyConductedReason && (
                    <span style={{ color: "red" }}>
                      {" "}
                      ({errors.noSurveyConductedReason})
                    </span>
                  )}
                </label>
                <select
                  value={noSurveyConductedReason}
                  onChange={(e) =>
                    setNoSurveyConductedReason(parseInt(e.target.value))
                  }
                >
                  {TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS.map(
                    (option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ),
                  )}
                </select>
              </div>

              {noSurveyConductedReason === 1 && (
                <div style={{ marginTop: "20px" }}>
                  <label>
                    Please select why the survey was not conducted? (Other)
                    {errors.noSurveyConductedReasonOther && (
                      <span style={{ color: "red" }}>
                        {" "}
                        ({errors.noSurveyConductedReasonOther})
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    value={noSurveyConductedReasonOther}
                    onChange={(e) =>
                      setNoSurveyConductedReasonOther(e.target.value)
                    }
                    placeholder="Text input"
                    style={{ width: "100%", maxWidth: "380px" }}
                  />
                </div>
              )}

              <div style={{ marginTop: "20px" }}>
                <label>
                  Comment
                  {errors.comment && (
                    <span style={{ color: "red" }}> ({errors.comment})</span>
                  )}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Write any additional comments here."
                  rows={5}
                  style={{ width: "100%", maxWidth: "500px" }}
                />
                <small>Include any additional information here.</small>
              </div>
            </>
          )}

          <div style={{ marginTop: "30px" }}>
            <Link to={`/admin/task/${tid}/survey/step-1`}>
              ← Back to Step 1
            </Link>
            <button
              onClick={onSubmitClick}
              style={{ float: "right" }}
              type="button"
            >
              Save & Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
