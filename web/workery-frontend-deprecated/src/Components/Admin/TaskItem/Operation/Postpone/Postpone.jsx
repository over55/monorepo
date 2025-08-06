import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import FormSelectField from "../../../../Reusable/FormSelectField";
import FormInputField from "../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormAlternateDateField from "../../../../Reusable/FormAlternateDateField";
// import TaskStatusFormatter from "../../../../Reusable/SpecificPage/Task/StatusFormatter";
// import TaskTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Task/TypeOfIconFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import TaskItemUpdateURLPathFormatter from "../../../../Reusable/SpecificPage/TaskItem/UpdateURLPathFormatter";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  taskItemDetailState,
} from "../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
} from "../../../../../Constants/FieldOptions";
import { TASK_ITEM_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../Constants/FieldOptions";
import { postTaskPostponeOperationAPI } from "../../../../../API/TaskItem";

function AdminTaskItemPostponeOperation() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const back = searchParams.get("back");

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

  const [reason, setReason] = useState(0);
  const [reasonOther, setReasonOther] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [describeTheComment, setDescribeTheComment] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (
      reason === undefined ||
      reason === null ||
      reason === "" ||
      reason === 0
    ) {
      newErrors["reason"] = "missing value";
      hasErrors = true;
    } else {
      if (reason === 1) {
        if (
          reasonOther === undefined ||
          reasonOther === null ||
          reasonOther === ""
        ) {
          newErrors["reasonOther"] = "missing value";
          hasErrors = true;
        }
      }
    }
    if (startDate === undefined || startDate === null || startDate === "") {
      newErrors["startDate"] = "missing value";
      hasErrors = true;
    }
    if (
      describeTheComment === undefined ||
      describeTheComment === null ||
      describeTheComment === ""
    ) {
      newErrors["describeTheComment"] = "missing value";
      hasErrors = true;
    }

    if (hasErrors) {
      console.log("onSubmitClick: Aboring because of error(s)");

      // Set the associate based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      return;
    }

    // Make a copy of the read-only data in snake case format.
    const payload = {
      task_item_id: tid,
      reason: reason,
      reason_other: reasonOther,
      start_date: startDate,
      describe_the_comment: describeTheComment,
    };

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", payload);

    setFetching(false);
    setErrors({});
    postTaskPostponeOperationAPI(
      payload,
      onOperationSuccess,
      onOperationError,
      onOperationDone,
    );
  };

  ////
  //// API.
  ////

  function onOperationSuccess(response) {
    console.log("onOperationSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Task postponed");
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

    // Redirect the user to a new page.
    setForceURL(TaskItemUpdateURLPathFormatter(response.id, response.type));
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
              <li className="">
                <Link
                  to={TaskItemUpdateURLPathFormatter(task.id, task.type)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Task&nbsp;Detail
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faClock} />
                  &nbsp;Postpone Operation
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
                <Link
                  to={TaskItemUpdateURLPathFormatter(task.id, task.type)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail
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
            <FontAwesomeIcon className="fas" icon={faClock} />
            &nbsp;Operations
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {task && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faClock} />
                    &nbsp;Postpone
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

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
                    {task.isClosed === true ? (
                      <>
                        <section className="hero is-medium has-background-white-ter">
                          <div className="hero-body">
                            <p className="title">
                              <FontAwesomeIcon className="fas" icon={faTable} />
                              &nbsp;Task Closed
                            </p>
                            <p className="subtitle">
                              This task has been closed and no work is needed to
                              be done here.{" "}
                              <b>
                                <Link to="/admin/tasks">
                                  Click here&nbsp;
                                  <FontAwesomeIcon
                                    className="mdi"
                                    icon={faArrowRight}
                                  />
                                </Link>
                              </b>{" "}
                              to go back to the tasks list and pick another task
                              to handle.
                            </p>
                          </div>
                        </section>
                      </>
                    ) : (
                      <>
                        <p className="pb-4">
                          Please fill out all the required fields before
                          submitting this form.
                        </p>
                        <FormSelectField
                          label="Reason"
                          name="reason"
                          placeholder="Pick"
                          selectedValue={reason}
                          errorText={errors && errors.reason}
                          helpText=""
                          onChange={(e) => setReason(parseInt(e.target.value))}
                          options={
                            TASK_ITEM_POSTPONE_REASON_OPTIONS_WITH_EMPTY_OPTION
                          }
                        />

                        {reason === 1 && (
                          <FormInputField
                            label="Reason (Other)"
                            name="reasonOther"
                            placeholder="Text input"
                            value={reasonOther}
                            errorText={errors && errors.reasonOther}
                            helpText=""
                            onChange={(e) => setReasonOther(e.target.value)}
                            isRequired={true}
                            maxWidth="380px"
                          />
                        )}

                        <FormAlternateDateField
                          label="Start Date"
                          name="startDate"
                          placeholder="Text input"
                          value={startDate}
                          errorText={errors && errors.startDate}
                          helpText=""
                          onChange={(date) => setStartDate(date)}
                          isRequired={false}
                          maxWidth="187px"
                        />

                        <FormTextareaField
                          label="Describe the comment"
                          name="describeTheComment"
                          placeholder="Describe here"
                          value={describeTheComment}
                          errorText={errors && errors.describeTheComment}
                          helpText=""
                          onChange={(e) =>
                            setDescribeTheComment(e.target.value)
                          }
                          isRequired={true}
                          maxWidth="280px"
                          helpText={"Include any additional information here."}
                          rows={5}
                        />
                      </>
                    )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={TaskItemUpdateURLPathFormatter(
                            task.id,
                            task.type,
                          )}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Detail
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        {task.isClosed === false && (
                          <button
                            onClick={onSubmitClick}
                            className="button is-success is-fullwidth-mobile"
                            disabled={task.status === 2}
                            type="button"
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faCheckCircle}
                            />
                            &nbsp;Begin
                          </button>
                        )}
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

export default AdminTaskItemPostponeOperation;
