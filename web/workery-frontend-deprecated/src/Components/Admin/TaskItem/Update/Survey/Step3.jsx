import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faHome,
  faTags,
  faEnvelope,
  faTable,
  faAddressCard,
  faSquarePhone,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faTasks,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faEllipsis,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import deepClone from "../../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../../Helpers/datetimeUtility";
import {
  getTaskItemDetailAPI,
  postTaskSurveyOperationAPI,
} from "../../../../../API/TaskItem";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
// import TaskStatusFormatter from "../../../../Reusable/SpecificPage/Task/StatusFormatter";
// import TaskTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Task/TypeOfIconFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import SelectTextFormatter from "../../../../Reusable/EveryPage/SelectTextFormatter";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import DataDisplayRowURL from "../../../../Reusable/DetailPage/DataDisplayRowURL";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  addTaskItemSurveyState,
  ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT,
  taskItemDetailState,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
  TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../../../Constants/FieldOptions";

function AdminTaskItemSurveyStep3() {
  ////
  //// URL Arguments.
  ////

  const { tid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [addTaskItemSurvey, setAddTaskItemSurvey] = useRecoilState(
    addTaskItemSurveyState,
  );
  const [task, setTask] = useRecoilState(taskItemDetailState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    console.log("onSubmitClick: task:", task);

    const modifiedTask = deepClone(addTaskItemSurvey); // Make a copy of the read-only data.

    // Make a copy of the read-only data in snake case format.
    const payload = {
      task_item_id: tid,
      was_survey_conducted: modifiedTask.wasSurveyConducted,
      no_survey_conducted_reason: modifiedTask.noSurveyConductedReason,
      no_survey_conducted_reason_other:
        modifiedTask.noSurveyConductedReasonOther,
      comment: modifiedTask.comment,
      was_job_satisfactory: modifiedTask.wasJobSatisfactory,
      was_job_finished_on_time_and_on_budget:
        modifiedTask.wasJobFinishedOnTimeAndOnBudget,
      was_associate_punctual: modifiedTask.wasAssociatePunctual,
      was_associate_professional: modifiedTask.wasAssociateProfessional,
      would_customer_refer_our_organization:
        modifiedTask.wouldCustomerReferOurOrganization,
    };

    // Fix 4: Do not include financials if not specificed.
    if (modifiedTask.hasInputtedFinancials == 2) {
      console.log("onSubmitClick: no survey entered");
      delete payload.was_job_satisfactory;
      delete payload.was_job_finished_on_time_and_on_budget;
      delete payload.was_associate_punctual;
      delete payload.was_associate_professional;
      delete payload.would_customer_refer_our_organization;
    }

    console.log("onSubmitClick: payload:", payload);

    setFetching(false);
    setErrors({});
    postTaskSurveyOperationAPI(
      payload,
      onOperationSuccess,
      onOperationError,
      onOperationDone,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setTask(response);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    console.log("onDone: Starting...");
    setFetching(false);
  }

  // --- Operation --- //

  function onOperationSuccess(response) {
    console.log("onOperationSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Task completed");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onOperationSuccess: Delayed for 2 seconds.");
      console.log(
        "onOperationSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Clear all data that staff inputed in this wizard.
    setAddTaskItemSurvey(ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT);

    // Redirect the user to a new page.
    setForceURL("/admin/order/"+task.orderWjid);
  }

  function onOperationError(apiErr) {
    console.log("onOperationError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOperationDone() {
    console.log("onOperationDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      // DEVELOPERS NOTE:
      // Why are we calling the task item details API if we used persistent
      // storage throughout this wizard? We are doing this so in case
      // the staff member is about to finish this task item and will
      // updated on any last minute changes made by the system before
      // they submit into the system; therefore, if two simulatious staff
      // members are working on this task, this step helps in whom
      // submitted first.

      setFetching(true);
      getTaskItemDetailAPI(tid, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

  ////
  //// Component rendering.
  ////

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
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/admin/tasks" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Tasks
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Task&nbsp;Detail
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
              <li className="">
                <Link to="/admin/tasks" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Tasks
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {task && task.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faTasks} />
            &nbsp;Task
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-success-light">
            <p className="subtitle is-5">Step 3 of 3</p>
            <progress class="progress is-success" value="100" max="100">
              100%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {task && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Task Detail - Survey
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {task && (
                  <div className="container">
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Task Detail
                          </th>
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
                          <td>Order Completion</td>
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
                            <URLTextFormatter
                              urlKey={task.orderWjid}
                              urlValue={`/admin/order/${task.orderWjid}`}
                              type={`external`}
                            />
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
                            <DateTextFormatter value={task.orderStartDate} />
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
                            <SkillSetsTextFormatter
                              skillSets={task.orderSkillSets}
                            />
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
                            <TagsTextFormatter tags={task.orderTags} />
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
                            <URLTextFormatter
                              urlKey={task.customerName}
                              urlValue={`/admin/client/${task.customerId}`}
                              type={`external`}
                            />
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
                              <PhoneTextFormatter value={task.customerPhone} />
                              {task.customerPhoneExtension && (
                                <>&nbsp;{task.customerPhoneExtension}</>
                              )}
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
                              <URLTextFormatter
                                urlKey={
                                  task.customerFullAddressWithoutPostalCode
                                }
                                urlValue={task.customerFullAddressUrl}
                                type={`external`}
                              />
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
                            <TagsTextFormatter tags={task.customerTags} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={task.associateName}
                              urlValue={`/admin/associate/${task.associateId}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Form Submission
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Was there a survey conducted?
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={addTaskItemSurvey.wasSurveyConducted}
                            />
                          </td>
                        </tr>
                        {addTaskItemSurvey.wasSurveyConducted === 1 && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Was the quality of the work satisfactory?
                              </th>
                              <td>
                                <CheckboxTextFormatter
                                  checked={
                                    addTaskItemSurvey.wasJobSatisfactory === 1
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Was the work completed on time and on budget?
                              </th>
                              <td>
                                <CheckboxTextFormatter
                                  checked={
                                    addTaskItemSurvey.wasJobFinishedOnTimeAndOnBudget ===
                                    1
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Was the Associate Member punctual?
                              </th>
                              <td>
                                <CheckboxTextFormatter
                                  checked={
                                    addTaskItemSurvey.wasAssociatePunctual === 1
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Was the Associate Member professional?
                              </th>
                              <td>
                                <CheckboxTextFormatter
                                  checked={
                                    addTaskItemSurvey.wasAssociateProfessional ===
                                    1
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Would you refer Over55 to a friend of family
                                member?
                              </th>
                              <td>
                                <CheckboxTextFormatter
                                  checked={
                                    addTaskItemSurvey.wouldCustomerReferOurOrganization ===
                                    1
                                  }
                                />
                              </td>
                            </tr>
                          </>
                        )}
                        {addTaskItemSurvey.wasSurveyConducted === 2 && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Please select why the survey was not conducted?
                              </th>
                              <td>
                                <SelectTextFormatter
                                  options={
                                    TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS_WITH_EMPTY_OPTION
                                  }
                                  selectedValue={
                                    addTaskItemSurvey.wouldCustomerReferOurOrganization
                                  }
                                />
                              </td>
                            </tr>
                            {addTaskItemSurvey.noSurveyConductedReason ===
                              1 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Please select why the survey was not
                                  conducted? (Other)
                                </th>
                                <td>
                                  {
                                    addTaskItemSurvey.noSurveyConductedReasonOther
                                  }
                                </td>
                              </tr>
                            )}
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Comment
                              </th>
                              <td>{addTaskItemSurvey.comment}</td>
                            </tr>
                          </>
                        )}
                      </tbody>
                    </table>

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/task/${tid}/survey/step-2`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 2
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-primary is-fullwidth-mobile"
                          type="button"
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
                          &nbsp;Save&nbsp;&&nbsp;Submit
                        </button>
                      </div>
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

export default AdminTaskItemSurveyStep3;
