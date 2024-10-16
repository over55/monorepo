import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowCircleUp,
  faMessage,
  faChevronRight,
  faPlus,
  faPencil,
  faTimes,
  faBullhorn,
  faArrowUpRightFromSquare,
  faNewspaper,
  faWrench,
  faHardHat,
  faUserCircle,
  faTasks,
  faGauge,
  faArrowRight,
  faUsers,
  faBarcode,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getDashboardAPI } from "../../../API/Gateway";
import FormErrorBox from "../../Reusable/FormErrorBox";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import DashboardBubbleLink from "../../Reusable/EveryPage/DashboardBubbleLink";
import AssociateAwayLogReasonIconFormatter from "../../Reusable/SpecificPage/AssociateAwayLog/ReasonIconFormatter";
import { ASSOCIATE_AWAY_LOG_REASONS } from "../../../Constants/FieldOptions";
import BulletinCreateModal from "./BulletinModalCreate";
import BulletinDeleteModal from "./BulletinModalDelete";
import AssociateAwayLogCreateModal from "./AssociateAwayLogModalCreate";
import AssociateAwayLogUpdateModal from "./AssociateAwayLogModalUpdate";
import AssociateAwayLogDeleteModal from "./AssociateAwayLogModalDelete";

function AdminDashboard() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [dashboard, setDashboard] = useState({});
  const [showDeleteModalForBulletinID, setShowDeleteModalForBulletinID] =
    useState("");
  const [showBulletinCreateModal, setBulletinShowCreateModal] = useState(false);
  const [
    showAssociateAwayLogDeleteModalForAssociateAwayLogID,
    setAssociateAwayLogShowDeleteModalForAssociateAwayLogID,
  ] = useState("");
  const [showAssociateAwayLogCreateModal, setAssociateAwayLogShowCreateModal] =
    useState(false);
  const [
    showUpdateModalForAssociateAwayLogID,
    setShowUpdateModalForAssociateAwayLogID,
  ] = useState("");
  const [
    showDeleteModalForAssociateAwayLogID,
    setShowDeleteModalForAssociateAwayLogID,
  ] = useState("");

  ////
  //// API.
  ////

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setDashboard(response);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    console.log("onError: response:", apiErr);
    // setErrors(apiErr);

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
  //// Event handling.
  ////

  ////
  //// Misc.
  ////

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getDashboardAPI(onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, []);

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
          <nav
            className="breadcrumb has-background-light p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="is-active">
                <Link to="/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <div className="columns">
            <div className="column">
              <h1 className="title is-2">
                <FontAwesomeIcon className="fas" icon={faGauge} />
                &nbsp;Dashboard
              </h1>
              <hr />
            </div>
          </div>

          {/* Modals */}
          <BulletinDeleteModal
            currentUser={currentUser}
            showDeleteModalForBulletinID={showDeleteModalForBulletinID}
            setShowDeleteModalForBulletinID={setShowDeleteModalForBulletinID}
            onSuccessDeleteCallbackFunc={() => {
              console.log(
                "Bulletin delete successfull, reloading dashboard now...",
              );
              setFetching(true);
              getDashboardAPI(onSuccess, onError, onDone, onUnauthorized);
            }}
          />
          <BulletinCreateModal
            currentUser={currentUser}
            showCreateModal={showBulletinCreateModal}
            setShowCreateModal={setBulletinShowCreateModal}
            onSuccessCreateCallbackFunc={(e) => {
              console.log(
                "Bulletin created successfull, reloading dashboard now...",
              );
              setFetching(true);
              getDashboardAPI(onSuccess, onError, onDone, onUnauthorized);
            }}
          />
          <AssociateAwayLogCreateModal
            currentUser={currentUser}
            showCreateModal={showAssociateAwayLogCreateModal}
            setShowCreateModal={setAssociateAwayLogShowCreateModal}
            onSuccessCreateCallbackFunc={(e) => {
              console.log(
                "Associate away log created successfull, reloading dashboard now...",
              );
              setFetching(true);
              getDashboardAPI(onSuccess, onError, onDone, onUnauthorized);
            }}
          />
          <AssociateAwayLogDeleteModal
            currentUser={currentUser}
            showDeleteModalForAssociateAwayLogID={
              showDeleteModalForAssociateAwayLogID
            }
            setShowDeleteModalForAssociateAwayLogID={
              setShowDeleteModalForAssociateAwayLogID
            }
            onSuccessDeleteCallbackFunc={(e) => {
              console.log(
                "Associate away log delete successfull, reloading dashboard now...",
              );
              setFetching(true);
              getDashboardAPI(onSuccess, onError, onDone, onUnauthorized);
            }}
          />
          <AssociateAwayLogUpdateModal
            currentUser={currentUser}
            showUpdateModalForAssociateAwayLogID={
              showUpdateModalForAssociateAwayLogID
            }
            setShowUpdateModalForAssociateAwayLogID={
              setShowUpdateModalForAssociateAwayLogID
            }
            onSuccessUpdateCallbackFunc={(e) => {
              console.log(
                "Associate away log updated successfull, reloading dashboard now...",
              );
              setFetching(true);
              getDashboardAPI(onSuccess, onError, onDone, onUnauthorized);
            }}
          />

          {/* Page Menu Options */}
          {isFetching ? (
            <PageLoadingContent displayMessage={"Loading..."} />
          ) : (
            <>
              <div className="container">
                <FormErrorBox errors={errors} />

                {/* Bubble Summary and Navigator (Tablet++) */}
                <div className="columns is-vcentered is-multiline is-hidden-mobile">
                  <div className="column">
                    <DashboardBubbleLink
                      notificationCount={dashboard.clientsCount}
                      title={`Clients`}
                      subtitle={`View your client list`}
                      faIcon={faUserCircle}
                      url={`/admin/clients`}
                      bgColour={`has-background-link-dark`}
                    />
                  </div>
                  <div className="column">
                    <DashboardBubbleLink
                      notificationCount={dashboard.associatesCount}
                      title={`Associates`}
                      subtitle={`View associate data`}
                      faIcon={faHardHat}
                      url={`/admin/associates`}
                      bgColour={`has-background-danger-dark`}
                    />
                  </div>
                  <div className="column">
                    <DashboardBubbleLink
                      notificationCount={dashboard.jobsCount}
                      title={`Jobs`}
                      subtitle={`View your job history`}
                      faIcon={faWrench}
                      url={`/admin/orders`}
                      bgColour={`has-background-success-dark`}
                    />
                  </div>
                  <div className="column">
                    <DashboardBubbleLink
                      notificationCount={dashboard.tasksCount}
                      title={`Tasks`}
                      subtitle={`View your tasks`}
                      faIcon={faTasks}
                      url={`/admin/tasks`}
                      bgColour={`has-background-info-dark`}
                    />
                  </div>
                </div>
              </div>

              {/* Page Content */}
              <nav className="box">
                {/* Bubble Summary and Navigator (Mobile) */}
                <div
                  className="has-background-info-light is-hidden-tablet mb-6 p-5"
                  style={{ borderRadius: "15px" }}
                >
                  <table className="is-fullwidth has-background-info-light table">
                    <thead>
                      <tr>
                        <th colSpan="2">System</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <FontAwesomeIcon
                            className="fas"
                            icon={faUserCircle}
                          />
                          &nbsp;Clients ({dashboard.clientsCount})
                        </td>
                        <td>
                          <div className="buttons is-right">
                            <Link to={`/admin/clients`} className="is-small">
                              View&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faChevronRight}
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* End Clients */}
                      <tr>
                        <td>
                          <FontAwesomeIcon className="fas" icon={faHardHat} />
                          &nbsp;Associates ({dashboard.associatesCount})
                        </td>
                        <td>
                          <div className="buttons is-right">
                            <Link to={`/admin/associates`} className="is-small">
                              View&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faChevronRight}
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* End Associates */}
                      <tr>
                        <td>
                          <FontAwesomeIcon className="fas" icon={faWrench} />
                          &nbsp;Jobs ({dashboard.jobsCount})
                        </td>
                        <td>
                          <div className="buttons is-right">
                            <Link to={`/admin/orders`} className="is-small">
                              View&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faChevronRight}
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* End Jobs */}
                      <tr>
                        <td>
                          <FontAwesomeIcon className="fas" icon={faTasks} />
                          &nbsp;Tasks ({dashboard.tasksCount})
                        </td>
                        <td>
                          <div className="buttons is-right">
                            <Link to={`/admin/tasks`} className="is-small">
                              View&nbsp;
                              <FontAwesomeIcon
                                className="mdi"
                                icon={faChevronRight}
                              />
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {/* End Tasks */}
                    </tbody>
                  </table>
                </div>

                {/* Office News */}
                <div
                  className="has-background-light mb-6 p-5"
                  style={{ borderRadius: "15px" }}
                >
                  <h1 className="title is-1 is-size-3-mobile">
                    <FontAwesomeIcon className="fas" icon={faNewspaper} />
                    &nbsp;Office News
                  </h1>
                  <table className="is-fullwidth has-background-light table">
                    <thead>
                      <tr>
                        <th colSpan="2">Messages</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.bulletins &&
                        dashboard.bulletins.map(function (datum, i) {
                          return (
                            <tr>
                              <td>{datum.text}</td>
                              <td>
                                <button
                                  className="button is-small is-danger"
                                  onClick={(e) =>
                                    setShowDeleteModalForBulletinID(datum.id)
                                  }
                                >
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faTimes}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  <button
                    className="button is-normal is-primary"
                    onClick={(e) => setBulletinShowCreateModal(true)}
                  >
                    <FontAwesomeIcon className="fas" icon={faPlus} />
                    &nbsp;Add
                  </button>
                </div>

                {/* JOB HISTORY (DEPRECATED) */}
                {/*
                <div className="mb-6 p-5" style={{ borderRadius: "15px" }}>
                  <h1 className="title is-1 is-size-3-mobile">
                    <FontAwesomeIcon className="fas" icon={faWrench} />
                    &nbsp;Job History
                  </h1>
                  <h5 className="title is-6 has-text-grey">
                    Maximum of 5 orders are listed here:
                  </h5>
                  <table className="is-fullwidth is-striped table">
                    <thead>
                      <tr>
                        <th>Job #</th>
                        <th>Client Name</th>
                        <th>Associate Name</th>
                        <th>Created</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.userJobHistory &&
                        dashboard.userJobHistory.map(function (datum, i) {
                          return (
                            <tr>
                              <td>
                                <Link
                                  to={`/admin/order/${datum.wjid}`}
                                  className=""
                                >
                                  {datum.wjid}
                                </Link>
                              </td>
                              <td>{datum.customerName}</td>
                              <td>{datum.associateName}</td>
                              <td>
                                <DateTimeTextFormatter
                                  value={datum.modifiedAt}
                                />
                              </td>
                              <td>
                                <Link
                                  to={`/admin/order/${datum.wjid}`}
                                  className=""
                                >
                                  View&nbsp;
                                  <FontAwesomeIcon
                                    className="mdi"
                                    icon={faChevronRight}
                                  />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                */}

                {/* Associate Away logs (DEPRECATED) */}
                <div
                  className="has-background-light mb-6 p-5"
                  style={{ borderRadius: "15px" }}
                >
                  <h1 className="title is-1 is-size-3-mobile">
                    <FontAwesomeIcon className="fas" icon={faBullhorn} />
                    &nbsp;Associate News
                  </h1>
                  <table className="is-fullwidth has-background-light table">
                    <thead>
                      <tr>
                        <th>
                          Associate&nbsp;
                          <FontAwesomeIcon
                            className="fas"
                            icon={faArrowUpRightFromSquare}
                          />
                        </th>
                        <th>Reason</th>
                        <th>Start</th>
                        <th>Away until</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.associateAwayLogs &&
                        dashboard.associateAwayLogs.map(function (datum, i) {
                          return (
                            <tr>
                              <td>
                                <Link
                                  target="_blank"
                                  rel="noreferrer"
                                  to={`/admin/associate/${datum.associateId}`}
                                >
                                  {datum.associateName}
                                </Link>
                              </td>
                              <td>
                                {datum.reason === 1 ? (
                                  <span>{datum.reasonOther}</span>
                                ) : (
                                  <span>
                                    <AssociateAwayLogReasonIconFormatter
                                      reason={datum.reason}
                                    />
                                    &nbsp;
                                    {ASSOCIATE_AWAY_LOG_REASONS[datum.reason]}
                                  </span>
                                )}
                              </td>
                              <td>
                                <DateTextFormatter value={datum.startDate} />
                              </td>
                              <td>
                                {datum.untilFurtherNotice === 1 ? (
                                  <span>Further notice.</span>
                                ) : (
                                  <DateTextFormatter value={datum.untilDate} />
                                )}
                              </td>
                              <td>
                                <button
                                  className="button is-small is-warning"
                                  onClick={(e) => {
                                    setShowUpdateModalForAssociateAwayLogID(
                                      datum.id,
                                    );
                                  }}
                                >
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faPencil}
                                  />
                                </button>
                                &nbsp;
                                <button
                                  className="button is-small is-danger"
                                  onClick={(e) =>
                                    setShowDeleteModalForAssociateAwayLogID(
                                      datum.id,
                                    )
                                  }
                                >
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faTimes}
                                  />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  <button
                    className="button is-normal is-primary"
                    onClick={(e) => {
                      setAssociateAwayLogShowCreateModal(true);
                    }}
                  >
                    <FontAwesomeIcon className="fas" icon={faPlus} />
                    &nbsp;Add
                  </button>
                </div>

                {/* Team Job History (DEPRECATED) */}
                {/*
                <div className="mb-6 p-5" style={{ borderRadius: "15px" }}>
                  <h1 className="title is-1 is-size-3-mobile">
                    <FontAwesomeIcon className="fas" icon={faUsers} />
                    &nbsp;Team Job History
                  </h1>
                  <h5 className="title is-6 has-text-grey">
                    Maximum of 10 orders are listed here:
                  </h5>
                  <table className="is-fullwidth is-striped table">
                    <thead>
                      <tr>
                        <th>Job #</th>
                        <th>Client Name</th>
                        <th>Associate Name</th>
                        <th>Created</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.teamJobHistory &&
                        dashboard.teamJobHistory.map(function (datum, i) {
                          return (
                            <tr>
                              <td>
                                <Link
                                  to={`/admin/order/${datum.wjid}`}
                                  className=""
                                >
                                  {datum.wjid}
                                </Link>
                              </td>
                              <td>{datum.customerName}</td>
                              <td>{datum.associateName}</td>
                              <td>
                                <DateTimeTextFormatter
                                  value={datum.modifiedAt}
                                />
                              </td>
                              <td>
                                <Link
                                  to={`/admin/order/${datum.wjid}`}
                                  className=""
                                >
                                  View&nbsp;
                                  <FontAwesomeIcon
                                    className="mdi"
                                    icon={faChevronRight}
                                  />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
                */}

                {/* Comments (DEPRECATED) */}
                {/*
                <div className="mb-6 p-5" style={{ borderRadius: "15px" }}>
                  <h1 className="title is-1 is-size-3-mobile">
                    <FontAwesomeIcon className="fas" icon={faMessage} />
                    &nbsp;Comments
                  </h1>
                  <h5 className="title is-6 has-text-grey">
                    Maximum of 10 comments are listed here:
                  </h5>
                  <table className="is-fullwidth table">
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Comment</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.pastFewDayComments &&
                        dashboard.pastFewDayComments.map(function (datum, i) {
                          return (
                            <tr>
                              <td>
                                <Link
                                  to={`/admin/order/${datum.orderWjid}`}
                                  className=""
                                >
                                  {datum.orderWjid}
                                </Link>
                              </td>
                              <td>{datum.content}</td>
                              <td>
                                <Link
                                  to={`/admin/order/${datum.orderWjid}/comments`}
                                  className=""
                                >
                                  View&nbsp;
                                  <FontAwesomeIcon
                                    className="mdi"
                                    icon={faChevronRight}
                                  />
                                </Link>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                  <Link to={`/admin/dashboard/comments`} className="">
                    See more comments&nbsp;
                    <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                  </Link>
                </div>
                */}

              </nav>

              <div className="has-text-right">
                <Link
                  onClick={() => {
                    var scroll = Scroll.animateScroll;
                    scroll.scrollToTop();
                  }}
                >
                  Back to Top&nbsp;
                  <FontAwesomeIcon className="mdi" icon={faArrowCircleUp} />
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
    </>
  );
}

export default AdminDashboard;
