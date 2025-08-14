// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step3Page.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTaskManager,
  useSurveyStorage,
} from "../../../../../services/Services";

const TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS = [
  { value: 0, label: "Please select" },
  { value: 1, label: "Other" },
  { value: 2, label: "Unable to reach client" },
  { value: 3, label: "Client did not want to complete survey" },
  { value: 4, label: "Client no longer with company" },
];

export default function AdminTaskItemSurveyStep3Page() {
  const { tid } = useParams();
  const navigate = useNavigate();
  const taskManager = useTaskManager();
  const surveyStorage = useSurveyStorage();

  const [task, setTask] = useState(null);
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);

  // Get form state from storage
  const formData = surveyStorage.getState();

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

  const onSubmitClick = async () => {
    console.log("onSubmitClick: Beginning...");
    console.log("onSubmitClick: task:", task);

    const payload = {
      task_item_id: tid,
      was_survey_conducted: formData.wasSurveyConducted,
      no_survey_conducted_reason: formData.noSurveyConductedReason,
      no_survey_conducted_reason_other: formData.noSurveyConductedReasonOther,
      comment: formData.comment,
      was_job_satisfactory: formData.wasJobSatisfactory,
      was_job_finished_on_time_and_on_budget:
        formData.wasJobFinishedOnTimeAndOnBudget,
      was_associate_punctual: formData.wasAssociatePunctual,
      was_associate_professional: formData.wasAssociateProfessional,
      would_customer_refer_our_organization:
        formData.wouldCustomerReferOurOrganization,
    };

    // If no survey was conducted, remove survey-specific fields
    if (formData.wasSurveyConducted === 2) {
      console.log("onSubmitClick: no survey entered");
      delete payload.was_job_satisfactory;
      delete payload.was_job_finished_on_time_and_on_budget;
      delete payload.was_associate_punctual;
      delete payload.was_associate_professional;
      delete payload.would_customer_refer_our_organization;
    }

    console.log("onSubmitClick: payload:", payload);

    setFetching(true);
    setErrors({});

    try {
      await taskManager.submitSurvey(payload, () => {
        navigate("/login?unauthorized=true");
      });

      // Clear the wizard state
      surveyStorage.clearState();

      // Navigate to order detail page
      if (task && task.orderWjid) {
        navigate(`/admin/order/${task.orderWjid}`);
      } else {
        navigate("/admin/tasks");
      }
    } catch (error) {
      console.error("Failed to submit survey:", error);
      setErrors(error);
      window.scrollTo(0, 0);
    } finally {
      setFetching(false);
    }
  };

  const getReasonLabel = (value) => {
    const option = TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS.find(
      (opt) => opt.value === value,
    );
    return option ? option.label : "";
  };

  if (isFetching) {
    return <div>Loading...</div>;
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
      <div style={{ backgroundColor: "#d4edda", padding: "10px" }}>
        <p>Step 3 of 3</p>
        <progress value="100" max="100">
          100%
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

        {task && (
          <div>
            <table>
              <thead>
                <tr>
                  <th colSpan="2">Task Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: "30%" }}>Type</td>
                  <td>Order Completion</td>
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
              </tbody>
            </table>

            <table style={{ marginTop: "20px" }}>
              <thead>
                <tr>
                  <th colSpan="2">Form Submission</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ width: "30%" }}>
                    Was there a survey conducted?
                  </td>
                  <td>
                    {formData.wasSurveyConducted === 1 ? "✓ Yes" : "✗ No"}
                  </td>
                </tr>
                {formData.wasSurveyConducted === 1 && (
                  <>
                    <tr>
                      <td>Was the quality of the work satisfactory?</td>
                      <td>
                        {formData.wasJobSatisfactory === 1 ? "✓ Yes" : "✗ No"}
                      </td>
                    </tr>
                    <tr>
                      <td>Was the work completed on time and on budget?</td>
                      <td>
                        {formData.wasJobFinishedOnTimeAndOnBudget === 1
                          ? "✓ Yes"
                          : "✗ No"}
                      </td>
                    </tr>
                    <tr>
                      <td>Was the Associate Member punctual?</td>
                      <td>
                        {formData.wasAssociatePunctual === 1 ? "✓ Yes" : "✗ No"}
                      </td>
                    </tr>
                    <tr>
                      <td>Was the Associate Member professional?</td>
                      <td>
                        {formData.wasAssociateProfessional === 1
                          ? "✓ Yes"
                          : "✗ No"}
                      </td>
                    </tr>
                    <tr>
                      <td>
                        Would you refer Over55 to a friend of family member?
                      </td>
                      <td>
                        {formData.wouldCustomerReferOurOrganization === 1
                          ? "✓ Yes"
                          : "✗ No"}
                      </td>
                    </tr>
                  </>
                )}
                {formData.wasSurveyConducted === 2 && (
                  <>
                    <tr>
                      <td>Please select why the survey was not conducted?</td>
                      <td>
                        {getReasonLabel(formData.noSurveyConductedReason)}
                      </td>
                    </tr>
                    {formData.noSurveyConductedReason === 1 && (
                      <tr>
                        <td>
                          Please select why the survey was not conducted?
                          (Other)
                        </td>
                        <td>{formData.noSurveyConductedReasonOther}</td>
                      </tr>
                    )}
                    <tr>
                      <td>Comment</td>
                      <td>{formData.comment}</td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>

            <div style={{ marginTop: "30px" }}>
              <Link to={`/admin/task/${tid}/survey/step-2`}>
                ← Back to Step 2
              </Link>
              <button
                onClick={onSubmitClick}
                style={{ float: "right" }}
                type="button"
                disabled={isFetching}
              >
                {isFetching ? "Submitting..." : "✓ Save & Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
