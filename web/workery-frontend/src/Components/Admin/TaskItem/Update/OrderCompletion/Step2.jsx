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
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import FormSelectField from "../../../../Reusable/FormSelectField";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import DataDisplayRowURL from "../../../../Reusable/DetailPage/DataDisplayRowURL";
import FormInputField from "../../../../Reusable/FormInputField";
import FormAlternateDateField from "../../../../Reusable/FormAlternateDateField";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  taskItemDetailState,
  addTaskItemOrderCompletionState,
} from "../../../../../AppState";
import { TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../Constants/FieldOptions";

function AdminTaskItemOrderCompletionStep2() {
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
  const [addTaskItemOrderCompletion, setAddTaskItemOrderCompletion] =
    useRecoilState(addTaskItemOrderCompletionState);
  const [task] = useRecoilState(taskItemDetailState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [wasCompleted, setWasCompleted] = useState(
    addTaskItemOrderCompletion.wasCompleted,
  );
  const [reason, setReason] = useState(addTaskItemOrderCompletion.reason);
  const [reasonOther, setReasonOther] = useState(
    addTaskItemOrderCompletion.reasonOther,
  );
  const [completionDate, setCompletionDate] = useState(
    addTaskItemOrderCompletion.completionDate,
  );
  const [closingReasonComment, setClosingReasonComment] = useState(
    addTaskItemOrderCompletion.closingReasonComment,
  );
  const [reasonComment, setReasonComment] = useState(
    addTaskItemOrderCompletion.reasonComment,
  );
  const [visits, setVisits] = useState(
    addTaskItemOrderCompletion.visits,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    //Note: 0=unselected, 1=Yes, 2=No
    if (
      wasCompleted === undefined ||
      wasCompleted === null ||
      wasCompleted === "" ||
      wasCompleted === 0
    ) {
      newErrors["wasCompleted"] = "missing value";
      hasErrors = true;
    }

    if (wasCompleted === 1) {
      if (
        completionDate === undefined ||
        completionDate === null ||
        completionDate === ""
      ) {
        newErrors["completionDate"] = "missing value";
        hasErrors = true;
        console.log("error:completionDate:", completionDate);
    }
      if (
        reasonComment === undefined ||
        reasonComment === null ||
        reasonComment === ""
      ) {
        newErrors["reasonComment"] = "missing value";
        hasErrors = true;
      }
      if (
        visits === undefined ||
        visits === null ||
        visits === "" ||
        visits === 0
      ) {
        newErrors["visits"] = "missing value";
        hasErrors = true;
      }
    }

    if (wasCompleted === 2) {
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
            reasonOther === "" ||
            reasonOther === 0
          ) {
            newErrors["reasonOther"] = "missing value";
            hasErrors = true;
          }
        }
      }
      if (
        closingReasonComment === undefined ||
        closingReasonComment === null ||
        closingReasonComment === ""
      ) {
        newErrors["closingReasonComment"] = "missing value";
        hasErrors = true;
      }
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

    // Save to persistent storage.
    let modifiedAddTaskItemOrderCompleted = { ...addTaskItemOrderCompletion };
    modifiedAddTaskItemOrderCompleted.wasCompleted = wasCompleted;
    modifiedAddTaskItemOrderCompleted.reason = reason;
    modifiedAddTaskItemOrderCompleted.reasonOther = reasonOther;
    modifiedAddTaskItemOrderCompleted.completionDate = completionDate;
    modifiedAddTaskItemOrderCompleted.reasonComment = reasonComment;
    modifiedAddTaskItemOrderCompleted.closingReasonComment =
      closingReasonComment;
    if (modifiedAddTaskItemOrderCompleted.invoiceIDs === undefined || modifiedAddTaskItemOrderCompleted.invoiceIDs === null || modifiedAddTaskItemOrderCompleted.invoiceIDs === "") {
        modifiedAddTaskItemOrderCompleted.invoiceIDs = task.orderWjid;
    }
    modifiedAddTaskItemOrderCompleted.visits = parseInt(visits);
    setAddTaskItemOrderCompletion(modifiedAddTaskItemOrderCompleted);

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", modifiedAddTaskItemOrderCompleted);

    // Redirect to the next page.
    switch (modifiedAddTaskItemOrderCompleted.wasCompleted) {
      case 1:
        setForceURL("/admin/task/" + tid + "/order-completion/step-3");
        break;
      case 2:
        setForceURL("/admin/task/" + tid + "/order-completion/step-3");
        break;
      default:
        alert("wrong option");
    }
  };

  ////
  //// API.
  ////

  // Nothing.

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
            <p className="subtitle is-5">Step 2 of 5</p>
            <progress class="progress is-success" value="40" max="100">
              40%
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
                    &nbsp;Task Detail - Order Completion
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
                    <FormRadioField
                      label="Did the Associate successfully complete the job?"
                      value={wasCompleted}
                      opt1Value={1}
                      opt1Label="Yes"
                      opt2Value={2}
                      opt2Label="No"
                      errorText={errors.wasCompleted}
                      wasValidated={false}
                      helpText="A decision must be recorded."
                      onChange={(e) => {
                          // DEVELOPERS NOTE:
                          // We will change the state of `was_completed` and
                          // entirely reset the form below this radio field.
                          setWasCompleted(parseInt(e.target.value))
                          setCompletionDate(null);
                          setReasonComment("");
                          setReason(0);
                          setReasonOther("");
                      }}
                    />

                    {/* Was Completed */}
                    {wasCompleted === 1 && (
                      <>
                        <FormAlternateDateField
                          label="Completion Date"
                          name="completionDate"
                          placeholder="Text input"
                          value={completionDate}
                          errorText={errors && errors.completionDate}
                          helpText="If associate promises to complete in a future date, then postpone this order. Note: Future dates are not allowed."
                          onChange={(date) => {
                              // DEVELOPERS NOTE:
                              // This callback block only gets called when the
                              // user successfully finishes picking a date. So
                              // only update the state if successfully finished
                              // picking a date; in addition, create an
                              // auto-generated comment.
                              setCompletionDate(date);

                              var completionDateStr = date.toISOString().slice(0, 10);
                              setReasonComment("Job completed by Associate on "+completionDateStr+".")
                          }}
                          isRequired={false}
                          maxWidth="187px"
                          maxDate={new Date()}
                        />
                        <FormTextareaField
                          label="Reason Comment"
                          name="reasonComment"
                          placeholder="Write details for the decision."
                          value={reasonComment}
                          errorText={errors && errors.reasonComment}
                          helpText=""
                          onChange={(e) => setReasonComment(e.target.value)}
                          isRequired={true}
                          maxWidth="280px"
                          helpText={
                            "The decision must be record for auditing purposes."
                          }
                          rows={5}
                          disabled={!completionDate}
                        />
                        <FormInputField
                          label="Visits"
                          type="number"
                          name="visits"
                          placeholder="#"
                          value={visits}
                          errorText={errors && errors.visits}
                          helpText="Please enter the number of vists the associate made with the client"
                          onChange={(e) => setVisits(parseInt(e.target.value))}
                          isRequired={true}
                          maxWidth="80px"
                        />
                      </>
                    )}

                    {/* Was Not Completed */}
                    {wasCompleted === 2 && (
                      <>
                        <FormSelectField
                          label="Reason for cancellation"
                          name="reason"
                          placeholder="Pick"
                          selectedValue={reason}
                          errorText={errors && errors.reason}
                          helpText=""
                          onChange={(e) => setReason(parseInt(e.target.value))}
                          options={
                            TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION
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

                        <FormTextareaField
                          label="Closing Reason Comment"
                          name="closingReasonComment"
                          placeholder="Write any additional comments here."
                          value={closingReasonComment}
                          errorText={errors && errors.closingReasonComment}
                          helpText=""
                          onChange={(e) =>
                            setClosingReasonComment(e.target.value)
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
                          to={`/admin/task/${tid}/order-completion/step-1`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Step 1
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-primary is-fullwidth-mobile"
                          type="button"
                        >
                          Save&nbsp;&&nbsp;Continue&nbsp;
                          <FontAwesomeIcon
                            className="fas"
                            icon={faArrowRight}
                          />
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

export default AdminTaskItemOrderCompletionStep2;
