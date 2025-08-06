import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesSquare,
  faClock,
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

import { getTaskItemDetailAPI } from "../../../../../API/TaskItem";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
import VehicleTypesTextFormatter from "../../../../Reusable/EveryPage/VehicleTypesTextFormatter";
import InsuranceRequirementsTextFormatter from "../../../../Reusable/EveryPage/InsuranceRequirementsTextFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  taskItemDetailState,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
  ASSOCIATE_PHONE_TYPE_OF_MAP,
} from "../../../../../Constants/FieldOptions";

function AdminTaskItemSurveyStep1() {
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

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  //

  ////
  //// API.
  ////

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
          {task && (task.status === 2 || task.isClosed === true) && (
            <AlertBanner message="Archived / Closed" status="info" />
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
          {task && task.isClosed === false && (
            <nav className="box has-background-light">
              <p className="subtitle is-5">Step 1 of 3</p>
              <progress class="progress is-success" value="33" max="100">
                33%
              </progress>
            </nav>
          )}

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
                <div className="column has-text-right">
                  {/*
                                <Link to={`/admin/task/${tid}/survey/step-2`} className="button is-small is-primary is-fullwidth-mobile" type="button" disabled={task.status === 2}>
                                    Begin&nbsp;<FontAwesomeIcon className="fas" icon={faArrowRight} />
                                </Link>
                                */}
                </div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {task && (
                  <div
                    className="container"
                    key={`taskitem_${task.id}_${task.modifiedAt}`}
                  >
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
                          <td>{task.title}</td>
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
                        {task.associatePhone && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Associate Phone Number (
                              {
                                ASSOCIATE_PHONE_TYPE_OF_MAP[
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
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate Tags
                          </th>
                          <td>
                            <TagsTextFormatter tags={task.associateTags} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate Skill Sets
                          </th>
                          <td>
                            <SkillSetsTextFormatter
                              skillSets={task.associateSkillSets}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate Vehicle Types
                          </th>
                          <td>
                            <VehicleTypesTextFormatter
                              vehicleTypes={task.associateVehicleTypes}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate Insurance Requirements
                          </th>
                          <td>
                            <InsuranceRequirementsTextFormatter
                              insuranceRequirements={
                                task.associateInsuranceRequirements
                              }
                            />
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
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Task Created At
                          </th>
                          <td>
                            <DateTimeTextFormatter value={task.createdAt} />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/tasks`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Tasks
                        </Link>
                      </div>
                      {task.isClosed === false && (
                        <div className="column is-half has-text-right">
                          <Link
                            to={`/admin/task/${tid}/close`}
                            className="button is-danger is-fullwidth-mobile"
                            disabled={task.status === 2}
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faTimesSquare}
                            />
                            &nbsp;Close
                          </Link>
                          &nbsp;
                          <Link
                            to={`/admin/task/${tid}/postpone`}
                            className="button is-warning is-fullwidth-mobile"
                            disabled={task.status === 2}
                          >
                            <FontAwesomeIcon className="fas" icon={faClock} />
                            &nbsp;Postpone
                          </Link>
                          &nbsp;
                          <Link
                            to={`/admin/task/${tid}/survey/step-2`}
                            className="button is-primary is-fullwidth-mobile"
                            disabled={task.status === 2}
                          >
                            Begin&nbsp;
                            <FontAwesomeIcon
                              className="fas"
                              icon={faArrowRight}
                            />
                          </Link>
                        </div>
                      )}
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

export default AdminTaskItemSurveyStep1;
