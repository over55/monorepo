import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHardHat,
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
  getAssignableAssociatesByTaskAPI,
} from "../../../../../API/TaskItem";
import { getAssociateListAPI } from "../../../../../API/Associate";
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
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  ASSOCIATE_STATUS_ACTIVE,
} from "../../../../../Constants/App";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
} from "../../../../../Constants/FieldOptions";
import AdminAssociateListDesktop from "./Step2ListDesktop";
import AdminAssociateListMobile from "./Step2ListMobile";

function AdminTaskItemAssignAssociateStep2() {
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
  const [associates, setAssociates] = useState("");

  ////
  //// Event handling.
  ////

  const onSelectClick = (taskItemID, datum) => {
    // Save to persistent storage.
    let modifiedAddTaskItemAssignAssociate = {
      ...ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT,
    };
    modifiedAddTaskItemAssignAssociate.associateID = datum.id;
    modifiedAddTaskItemAssignAssociate.associateName = datum.name;
    modifiedAddTaskItemAssignAssociate.associatePhone = datum.phone;
    modifiedAddTaskItemAssignAssociate.associateEmail = datum.email;
    modifiedAddTaskItemAssignAssociate.associateOrganizationName =
      datum.organizationName;
    modifiedAddTaskItemAssignAssociate.associateContactsLast30Days =
      datum.contactsLast30Days;
    modifiedAddTaskItemAssignAssociate.associateWsibNumber = datum.wsibNumber;
    modifiedAddTaskItemAssignAssociate.associateHourlySalaryDesired =
      datum.hourlySalaryDesired;
    modifiedAddTaskItemAssignAssociate.associateSkillSets = datum.skillSets;
    setAddTaskItemAssignAssociate(modifiedAddTaskItemAssignAssociate);
    const url = "/admin/task/" + taskItemID + "/assign-associate/step-3";
    setForceURL(url);
  };

  const fetchList = (taskID) => {
    setFetching(true);
    setErrors({});
    getAssignableAssociatesByTaskAPI(
      taskID,
      onAssociateListSuccess,
      onAssociateListError,
      onAssociateListDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Task Item Detail --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setTask(response);
    fetchList(response.id);
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

  // --- Associate List --- //

  function onAssociateListSuccess(response) {
    console.log("onAssociateListSuccess: Starting...");
    if (response.results !== null) {
      setAssociates(response);
    }
  }

  function onAssociateListError(apiErr) {
    console.log("onAssociateListError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateListDone() {
    console.log("onAssociateListDone: Starting...");
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
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 2 of 4</p>
            <progress class="progress is-success" value="50" max="100">
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
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Task Detail - Assign Associate
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
                            Comments
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={`View comments`}
                              urlValue={`/admin/order/${task.orderWjid}/comments`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/* Available Associates */}
                    {task && (
                      <div className="columns pt-5">
                        <div className="column">
                          <p className="title is-4">
                            <FontAwesomeIcon className="fas" icon={faHardHat} />
                            &nbsp;Available Associates
                          </p>
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
                          <AdminAssociateListDesktop
                            tid={tid}
                            task={task}
                            listData={associates}
                            onSelectClick={onSelectClick}
                          />
                        </div>

                        {/*
                                                ###########################################################################
                                                EVERYTHING INSIDE HERE WILL ONLY BE DISPLAYED ON A TABLET OR MOBILE SCREEN.
                                                ###########################################################################
                                            */}
                        <div className="is-fullwidth is-hidden-desktop">
                          <AdminAssociateListMobile
                            tid={tid}
                            task={task}
                            listData={associates}
                            onSelectClick={onSelectClick}
                          />
                        </div>
                      </div>
                    ) : (
                      <section className="hero is-medium has-background-white-ter">
                        <div className="hero-body">
                          <p className="title">
                            <FontAwesomeIcon className="fas" icon={faTable} />
                            &nbsp;No Associates
                          </p>
                          <p className="subtitle">
                            No associates.{" "}
                            <b>
                              <Link to="/admin/associates/add/step-1">
                                Click here&nbsp;
                                <FontAwesomeIcon
                                  className="mdi"
                                  icon={faArrowRight}
                                />
                              </Link>
                            </b>{" "}
                            to get started creating your first associate.
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
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 1
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

export default AdminTaskItemAssignAssociateStep2;
