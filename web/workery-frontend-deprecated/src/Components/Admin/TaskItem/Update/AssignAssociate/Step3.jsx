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
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import DataDisplayRowURL from "../../../../Reusable/DetailPage/DataDisplayRowURL";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  addTaskItemAssignAssociateState,
  ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT,
  taskItemDetailState,
} from "../../../../../AppState";

function AdminTaskItemAssignAssociateStep3() {
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
  const [task, setTask] = useRecoilState(taskItemDetailState);
  const [addTaskItemAssignAssociate, setAddTaskItemAssignAssociate] =
    useRecoilState(addTaskItemAssignAssociateState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [associateID, setAssociateID] = useState(
    addTaskItemAssignAssociate.associateID,
  );
  const [associateName, setAssociateName] = useState(
    addTaskItemAssignAssociate.associateName,
  );
  const [status, setStatus] = useState(addTaskItemAssignAssociate.status);
  const [predefinedComment, setPredefinedComment] = useState(addTaskItemAssignAssociate.predefinedComment);
  const [comment, setComment] = useState(addTaskItemAssignAssociate.comment);
  const [howWasJobAccepted, setHowWasJobAccepted] = useState(addTaskItemAssignAssociate.howWasJobAccepted);
  const [whyJobDeclined, setWhyJobDeclined] = useState(addTaskItemAssignAssociate.whyJobDeclined);

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (
      status === undefined ||
      status === null ||
      status === "" ||
      status === 0
    ) {
      newErrors["status"] = "missing value";
      hasErrors = true;
  } else {
      if (status === 3) { // Accepted
        if (howWasJobAccepted === undefined || howWasJobAccepted === null || howWasJobAccepted === "" || howWasJobAccepted === 0) {
            newErrors["howWasJobAccepted"] = "missing value";
            hasErrors = true;
        }
      }
      if (status === 4) { // Rejected
          if (whyJobDeclined === undefined || whyJobDeclined === null || whyJobDeclined === "" || whyJobDeclined === 0) {
              newErrors["whyJobDeclined"] = "missing value";
              hasErrors = true;
          }
      }
  }

    // if (comment === undefined || comment === null || comment === "") {
    //   newErrors["comment"] = "missing value";
    //   hasErrors = true;
    // }

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
    let modifiedAddTaskItemAssignAssociate = {
      ...ADD_TASK_ITEM_ASSIGN_ASSOCIATE_STATE_DEFAULT,
    };
    modifiedAddTaskItemAssignAssociate.associateID = associateID;
    modifiedAddTaskItemAssignAssociate.associateName = associateName;
    modifiedAddTaskItemAssignAssociate.status = status;
    modifiedAddTaskItemAssignAssociate.comment = comment;
    modifiedAddTaskItemAssignAssociate.howWasJobAccepted = howWasJobAccepted;
    modifiedAddTaskItemAssignAssociate.whyJobDeclined = whyJobDeclined;
    modifiedAddTaskItemAssignAssociate.predefinedComment = predefinedComment;
    setAddTaskItemAssignAssociate(modifiedAddTaskItemAssignAssociate);

    // Redirect to the next page.
    setForceURL("/admin/task/" + tid + "/assign-associate/step-4");
  };

  ////
  //// API.
  ////

  // Do nothing.

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
            <p className="subtitle is-5">Step 3 of 4</p>
            <progress class="progress is-success" value="75" max="100">
              75%
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
                    <DataDisplayRowURL
                      label="Associate"
                      urlKey={associateName}
                      urlValue={`/admin/associate/${associateID}`}
                      helpText=""
                      type="external"
                    />

                    <FormRadioField
                      label="Accepted Job?"
                      name="status"
                      value={status}
                      errorText={errors && errors.status}
                      opt1Value={3}
                      opt1Label="Yes"
                      opt2Value={4}
                      opt2Label="No"
                      onChange={(e) => setStatus(parseInt(e.target.value))}
                      errorText={errors && errors.status}
                    />

                    {status === 3 && <FormRadioField
                      label="How was this job accepted?"
                      name="howWasJobAccepted"
                      value={howWasJobAccepted}
                      hasOptPerLine={true}
                      errorText={errors && errors.howWasJobAccepted}
                      opt1Value={1}
                      opt1Label="Phone"
                      opt2Value={2}
                      opt2Label="Text"
                      opt3Value={3}
                      opt3Label="Email"
                      opt4Value={4}
                      opt4Label="In-person confirmation"
                      onChange={(e) => {
                          setHowWasJobAccepted(parseInt(e.target.value))

                          var todayDate = new Date().toISOString().slice(0, 10);
                          var choice = "";
                          switch (parseInt(e.target.value)) {
                              case 1:
                                  choice="phone";
                                  break;
                              case 2:
                                  choice="text";
                                  break;
                              case 3:
                                  choice="email";
                                  break;
                              case 4:
                                  choice="in-person confirmation";
                                  break;
                              default:
                          }
                          setPredefinedComment("Job accepted by "+associateName+" on "+todayDate+" via " + choice + ".");

                      }}
                      errorText={errors && errors.howWasJobAccepted}
                    />}

                    {status === 4 && <FormRadioField
                      label="Why was this job declined?"
                      name="whyJobDeclined"
                      hasOptPerLine={true}
                      value={whyJobDeclined}
                      errorText={errors && errors.whyJobDeclined}
                      opt1Value={1}
                      opt1Label="Associate was busy"
                      opt2Value={2}
                      opt2Label="Associate does not have the skills"
                      opt3Value={3}
                      opt3Label="Associate does not wish to travel to the customer's location"
                      opt4Value={4}
                      opt4Label="Associate does not wish to work with this client"
                      errorText={errors && errors.whyJobDeclined}
                      onChange={(e) => {
                          setWhyJobDeclined(parseInt(e.target.value))

                          var todayDate = new Date().toISOString().slice(0, 10);
                          var choice = "";
                          switch (parseInt(e.target.value)) {
                              case 1:
                                  choice="associate was busy";
                                  break;
                              case 2:
                                  choice="associate does not have the skills";
                                  break;
                              case 3:
                                  choice="associate does not wish to travel to the customer\'s location";
                                  break;
                              case 4:
                                  choice="associate does not wish to work with this client";
                                  break;
                              default:
                          }
                          setPredefinedComment("Job declined by "+associateName+" on "+todayDate+" because " + choice + ".");

                      }}
                    />}

                    {status !== 0 && <FormTextareaField
                      label="Predefined Comment"
                      name="predefinedComment"
                      placeholder="The predefined comment to autopopulated based on your choice."
                      value={predefinedComment}
                      errorText={errors && errors.predefinedComment}
                      helpText=""
                      onChange={null}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={
                        "This is the predefined comment is autopopulated based on your choices above and attached to the order."
                      }
                      rows={3}
                      disabled={true}
                    />}

                    <FormTextareaField
                      label="Comment (Optional)"
                      name="comment"
                      placeholder="Write any additional comments here."
                      value={comment}
                      errorText={errors && errors.comment}
                      helpText=""
                      onChange={(e) => setComment(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={
                        "This is the comment will be attached to the order."
                      }
                      rows={5}
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/task/${tid}/assign-associate/step-2`}
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
                          Confirm&nbsp;&&nbsp;Continue&nbsp;
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

export default AdminTaskItemAssignAssociateStep3;
