// File Path: monorepo/web/workery-frontend/src/pages/Admin/TaskItem/Update/Survey/Step3Page.jsx

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  useTaskManager,
  useSurveyStorage,
} from "../../../../../services/Services";
import {
  Breadcrumb,
  Card,
  Button,
  Alert,
  Loading,
  Badge,
} from "../../../../../components/UI";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      task_id: tid,
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

    setIsSubmitting(true);
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
      setIsSubmitting(false);
    }
  };

  const getReasonLabel = (value) => {
    const option = TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS.find(
      (opt) => opt.value === value,
    );
    return option ? option.label : "";
  };

  const renderResponseIcon = (value) => {
    if (value === 1) {
      return <Badge variant="success">✓ Yes</Badge>;
    } else if (value === 2) {
      return <Badge variant="error">✗ No</Badge>;
    }
    return "-";
  };

  const breadcrumbItems = [
    { label: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { label: "Tasks", path: "/admin/tasks", icon: "📋" },
    { label: "Task Detail", icon: "ℹ️" },
  ];

  if (isFetching) {
    return (
      <div className="container">
        <Breadcrumb items={breadcrumbItems} />
        <Card>
          <Loading message="Loading task details..." />
        </Card>
      </div>
    );
  }

  return (
    <div className="container">
      <Breadcrumb items={breadcrumbItems} />

      {/* Page Title */}
      <h1>📋 Task Survey</h1>
      <h4>✅ Review & Submit</h4>
      <hr />

      {/* Progress */}
      <Card style={{ backgroundColor: "#d4edda" }}>
        <p>Step 3 of 3</p>
        <progress value="100" max="100">
          100%
        </progress>
      </Card>

      {/* Page Content */}
      <Card title="📋 Task Detail - Survey">
        {/* Errors */}
        {errors && Object.keys(errors).length > 0 && (
          <Alert type="error">
            <h4>Error submitting survey:</h4>
            <ul>
              {Object.entries(errors).map(([key, value]) => (
                <li key={key}>
                  {key}: {value}
                </li>
              ))}
            </ul>
          </Alert>
        )}

        {task && (
          <>
            {/* Task Details Table */}
            <div style={{ marginBottom: "30px" }}>
              <h3 style={{ marginBottom: "20px" }}>📄 Task Information</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      colSpan="2"
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Task Detail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "30%",
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Type
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      Order Completion
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Description
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {task.description}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Job #
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <Link to={`/admin/order/${task.orderWjid}`}>
                        {task.orderWjid}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Job Start Date
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {task.orderStartDate
                        ? new Date(task.orderStartDate).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Job Description
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {task.orderDescription || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Client Name
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <Link to={`/admin/customer/${task.customerId}`}>
                        {task.customerName}
                      </Link>
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Associate
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      <Link to={`/admin/associate/${task.associateId}`}>
                        {task.associateName}
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Survey Submission Table */}
            <div>
              <h3 style={{ marginBottom: "20px" }}>📝 Survey Submission</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      colSpan="2"
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        borderBottom: "2px solid #dee2e6",
                      }}
                    >
                      Form Submission
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td
                      style={{
                        width: "30%",
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                        fontWeight: "600",
                      }}
                    >
                      Was there a survey conducted?
                    </td>
                    <td
                      style={{
                        padding: "10px",
                        borderBottom: "1px solid #dee2e6",
                      }}
                    >
                      {renderResponseIcon(formData.wasSurveyConducted)}
                    </td>
                  </tr>
                  {formData.wasSurveyConducted === 1 && (
                    <>
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Was the quality of the work satisfactory?
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {renderResponseIcon(formData.wasJobSatisfactory)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Was the work completed on time and on budget?
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {renderResponseIcon(
                            formData.wasJobFinishedOnTimeAndOnBudget,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Was the Associate Member punctual?
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {renderResponseIcon(formData.wasAssociatePunctual)}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Was the Associate Member professional?
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {renderResponseIcon(
                            formData.wasAssociateProfessional,
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Would you refer Over55 to a friend or family member?
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          {renderResponseIcon(
                            formData.wouldCustomerReferOurOrganization,
                          )}
                        </td>
                      </tr>
                    </>
                  )}
                  {formData.wasSurveyConducted === 2 && (
                    <>
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                          }}
                        >
                          Why was the survey not conducted?
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <Badge variant="warning">
                            {getReasonLabel(formData.noSurveyConductedReason)}
                          </Badge>
                        </td>
                      </tr>
                      {formData.noSurveyConductedReason === 1 && (
                        <tr>
                          <td
                            style={{
                              padding: "10px",
                              borderBottom: "1px solid #dee2e6",
                              fontWeight: "600",
                            }}
                          >
                            Other Reason
                          </td>
                          <td
                            style={{
                              padding: "10px",
                              borderBottom: "1px solid #dee2e6",
                            }}
                          >
                            {formData.noSurveyConductedReasonOther}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                            fontWeight: "600",
                            verticalAlign: "top",
                          }}
                        >
                          Comment
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            borderBottom: "1px solid #dee2e6",
                          }}
                        >
                          <div
                            style={{
                              backgroundColor: "#f8f9fa",
                              padding: "10px",
                              borderRadius: "4px",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {formData.comment || "-"}
                          </div>
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div
              style={{
                marginTop: "30px",
                display: "flex",
                justifyContent: "space-between",
                paddingTop: "20px",
                borderTop: "1px solid #dee2e6",
              }}
            >
              <Link to={`/admin/task/${tid}/survey/step-2`}>
                <Button variant="secondary">← Back to Step 2</Button>
              </Link>
              <Button
                onClick={onSubmitClick}
                variant="success"
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "✓ Save & Submit"}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
