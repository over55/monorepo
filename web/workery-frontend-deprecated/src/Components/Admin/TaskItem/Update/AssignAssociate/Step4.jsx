import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
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
import { useParams } from "react-router-dom";

import {
  getTaskItemDetailAPI,
  postTaskAssignAssociateOperationAPI,
} from "../../../../../API/TaskItem";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  addTaskItemAssignAssociateState,
  ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT,
  taskItemDetailState,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
} from "../../../../../Constants/FieldOptions";

function AdminTaskItemAssignAssociateStep4() {
  ////
  //// URL Parameters.
  ////

  const { tid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [task, setTask] = useRecoilState(taskItemDetailState);
  const [addTaskItemAssignAssociate, setAddTaskItemAssignAssociate] =
    useRecoilState(addTaskItemAssignAssociateState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [associateID] = useState(addTaskItemAssignAssociate.associateID);
  const [associateName] = useState(addTaskItemAssignAssociate.associateName);
  const [associatePhone] = useState(addTaskItemAssignAssociate.associatePhone);
  const [associateEmail] = useState(addTaskItemAssignAssociate.associateEmail);
  const [associateOrganizationName] = useState(
    addTaskItemAssignAssociate.associateOrganizationName,
  );
  const [assassociateContactsLast30DaysociateName] = useState(
    addTaskItemAssignAssociate.assassociateContactsLast30DaysociateName,
  );
  const [associateWsibNumber] = useState(
    addTaskItemAssignAssociate.associateWsibNumber,
  );
  const [associateHourlySalaryDesired] = useState(
    addTaskItemAssignAssociate.associateHourlySalaryDesired,
  );
  const [associateSkillSets] = useState(
    addTaskItemAssignAssociate.associateSkillSets,
  );
  const [status] = useState(addTaskItemAssignAssociate.status);
  const [comment] = useState(addTaskItemAssignAssociate.comment);
  const [howWasJobAccepted] = useState(addTaskItemAssignAssociate.howWasJobAccepted);
  const [whyJobDeclined] = useState(addTaskItemAssignAssociate.whyJobDeclined);
  const [predefinedComment] = useState(addTaskItemAssignAssociate.predefinedComment);

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Starting...");
    const payload = {
      task_item_id: tid,
      associate_id: associateID,
      status: status,
      how_was_job_accepted: howWasJobAccepted,
      why_job_declined: whyJobDeclined,
      predefined_comment: predefinedComment,
      comment: comment,
    };

    console.log("onSubmitClick: Payload:", payload);
    setErrors({});
    setFetching(true);
    postTaskAssignAssociateOperationAPI(
      payload,
      onOperationSuccess,
      onOperationError,
      onOperationDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onDetailSuccess(response) {
    console.log("onDetailSuccess: Starting...");
    setTask(response);
  }

  function onDetailError(apiErr) {
    console.log("onDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDetailDone() {
    console.log("onDetailDone: Starting...");
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
    setAddTaskItemAssignAssociate(ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT);

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

  const assignAssociateStatusMap = {
    3: "Yes",
    4: "No",
  };

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
      getTaskItemDetailAPI(
        tid,
        onDetailSuccess,
        onDetailError,
        onDetailDone,
        onUnauthorized,
      );
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
            <p className="subtitle is-5">Step 4 of 4</p>
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
                    &nbsp;Task Detail - Assign Associate
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            <p className="pb-4">
              Please review the following summary before submitting the task.
            </p>

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
                            Summary
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
                              urlKey={associateName}
                              urlValue={`/admin/associate/${associateID}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        {task.associatePhone && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Associate Phone Number (
                              {
                                CLIENT_PHONE_TYPE_OF_MAP[
                                  task.associatePhoneType
                                ]
                              }
                              ):
                            </th>
                            <td>
                              <PhoneTextFormatter value={task.associatePhone} />
                              {task.associatePhoneExtension && (
                                <>&nbsp;{task.associatePhoneExtension}</>
                              )}
                            </td>
                          </tr>
                        )}
                        {task.associateFullAddressUrl && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Associate Address
                            </th>
                            <td>
                              <URLTextFormatter
                                urlKey={
                                  task.associateFullAddressWithoutPostalCode
                                }
                                urlValue={task.associateFullAddressUrl}
                                type={`external`}
                              />
                            </td>
                          </tr>
                        )}
                        {/*
                            const [associateEmail] = useState(addTaskItemAssignAssociate.associateEmail);
                            const [associateOrganizationName] = useState(addTaskItemAssignAssociate.associateOrganizationName);
                            const [assassociateContactsLast30DaysociateName] = useState(addTaskItemAssignAssociate.assassociateContactsLast30DaysociateName);
                            const [associateWsibNumber] = useState(addTaskItemAssignAssociate.associateWsibNumber);
                            const [associateHourlySalaryDesired] = useState(addTaskItemAssignAssociate.associateHourlySalaryDesired);
                            const [associateSkillSets] = useState(addTaskItemAssignAssociate.associateSkillSets);
                        */}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Accepted Job?
                          </th>
                          <td>{assignAssociateStatusMap[status]}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Predefined Comment
                          </th>
                          <td>{predefinedComment}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Comment
                          </th>
                          <td>{comment}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/task/${tid}/assign-associate/step-3`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 3
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          className="button is-success is-fullwidth-mobile"
                          type="button"
                          onClick={onSubmitClick}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
                          &nbsp;Save & Submit
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

export default AdminTaskItemAssignAssociateStep4;
