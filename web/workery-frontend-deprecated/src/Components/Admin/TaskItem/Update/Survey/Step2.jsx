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
  addTaskItemSurveyState,
} from "../../../../../AppState";
import { TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS_WITH_EMPTY_OPTION } from "../../../../../Constants/FieldOptions";

function AdminTaskItemSurveyStep2() {
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
  const [task] = useRecoilState(taskItemDetailState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [wasSurveyConducted, setWasSurveyConducted] = useState(
    addTaskItemSurvey.wasSurveyConducted,
  );
  const [noSurveyConductedReason, setNoSurveyConductedReason] = useState(
    addTaskItemSurvey.noSurveyConductedReason,
  );
  const [noSurveyConductedReasonOther, setNoSurveyConductedReasonOther] =
    useState(addTaskItemSurvey.noSurveyConductedReasonOther);
  const [comment, setComment] = useState(addTaskItemSurvey.comment);
  const [wasJobSatisfactory, setWasJobSatisfactory] = useState(
    addTaskItemSurvey.wasJobSatisfactory,
  );
  const [wasJobFinishedOnTimeAndOnBudget, setWasJobFinishedOnTimeAndOnBudget] =
    useState(addTaskItemSurvey.wasJobFinishedOnTimeAndOnBudget);
  const [wasAssociatePunctual, setWasAssociatePunctual] = useState(
    addTaskItemSurvey.wasAssociatePunctual,
  );
  const [wasAssociateProfessional, setWasAssociateProfessional] = useState(
    addTaskItemSurvey.wasAssociateProfessional,
  );
  const [
    wouldCustomerReferOurOrganization,
    setWouldCustomerReferOurOrganization,
  ] = useState(addTaskItemSurvey.wouldCustomerReferOurOrganization);

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    //Note: 0=unselected, 1=Yes, 2=No
    if (
      wasSurveyConducted === undefined ||
      wasSurveyConducted === null ||
      wasSurveyConducted === "" ||
      wasSurveyConducted === 0
    ) {
      newErrors["wasSurveyConducted"] = "missing value";
      hasErrors = true;
    }

    if (wasSurveyConducted === 1) {
      if (
        wasJobSatisfactory === undefined ||
        wasJobSatisfactory === null ||
        wasJobSatisfactory === "" ||
        wasJobSatisfactory === 0
      ) {
        newErrors["wasJobSatisfactory"] = "missing value";
        hasErrors = true;
      }
      if (
        wasJobFinishedOnTimeAndOnBudget === undefined ||
        wasJobFinishedOnTimeAndOnBudget === null ||
        wasJobFinishedOnTimeAndOnBudget === "" ||
        wasJobFinishedOnTimeAndOnBudget === 0
      ) {
        newErrors["wasJobFinishedOnTimeAndOnBudget"] = "missing value";
        hasErrors = true;
      }
      if (
        wasAssociatePunctual === undefined ||
        wasAssociatePunctual === null ||
        wasAssociatePunctual === "" ||
        wasAssociatePunctual === 0
      ) {
        newErrors["wasAssociatePunctual"] = "missing value";
        hasErrors = true;
      }
      if (
        wasAssociateProfessional === undefined ||
        wasAssociateProfessional === null ||
        wasAssociateProfessional === "" ||
        wasAssociateProfessional === 0
      ) {
        newErrors["wasAssociateProfessional"] = "missing value";
        hasErrors = true;
      }
      if (
        wouldCustomerReferOurOrganization === undefined ||
        wouldCustomerReferOurOrganization === null ||
        wouldCustomerReferOurOrganization === "" ||
        wouldCustomerReferOurOrganization === 0
      ) {
        newErrors["wouldCustomerReferOurOrganization"] = "missing value";
        hasErrors = true;
      }
    }

    if (wasSurveyConducted === 2) {
      if (
        noSurveyConductedReason === undefined ||
        noSurveyConductedReason === null ||
        noSurveyConductedReason === "" ||
        noSurveyConductedReason === 0
      ) {
        newErrors["noSurveyConductedReason"] = "missing value";
        hasErrors = true;
      } else {
        if (noSurveyConductedReason === 1) {
          if (
            noSurveyConductedReasonOther === undefined ||
            noSurveyConductedReasonOther === null ||
            noSurveyConductedReasonOther === "" ||
            noSurveyConductedReasonOther === 0
          ) {
            newErrors["noSurveyConductedReasonOther"] = "missing value";
            hasErrors = true;
          }
        }
      }
      if (comment === undefined || comment === null || comment === "") {
        newErrors["comment"] = "missing value";
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
    let modifiedAddTaskItemOrderCompleted = { ...addTaskItemSurvey };
    modifiedAddTaskItemOrderCompleted.wasSurveyConducted = wasSurveyConducted;
    modifiedAddTaskItemOrderCompleted.noSurveyConductedReason =
      noSurveyConductedReason;
    modifiedAddTaskItemOrderCompleted.noSurveyConductedReasonOther =
      noSurveyConductedReasonOther;
    modifiedAddTaskItemOrderCompleted.comment = comment;
    modifiedAddTaskItemOrderCompleted.wasJobSatisfactory = wasJobSatisfactory;
    modifiedAddTaskItemOrderCompleted.wasJobFinishedOnTimeAndOnBudget =
      wasJobFinishedOnTimeAndOnBudget;
    modifiedAddTaskItemOrderCompleted.wasAssociatePunctual =
      wasAssociatePunctual;
    modifiedAddTaskItemOrderCompleted.wasAssociateProfessional =
      wasAssociateProfessional;
    modifiedAddTaskItemOrderCompleted.wouldCustomerReferOurOrganization =
      wouldCustomerReferOurOrganization;
    setAddTaskItemSurvey(modifiedAddTaskItemOrderCompleted);

    // For debugging purposes only.
    console.log("onSubmitClick | payload:", modifiedAddTaskItemOrderCompleted);

    // Redirect to the next page.
    switch (modifiedAddTaskItemOrderCompleted.wasSurveyConducted) {
      case 1:
        setForceURL("/admin/task/" + tid + "/survey/step-3");
        break;
      case 2:
        setForceURL("/admin/task/" + tid + "/survey/step-3");
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
            <p className="subtitle is-5">Step 2 of 3</p>
            <progress class="progress is-success" value="66" max="100">
              66%
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
                    <FormRadioField
                      label="Was there a survey conducted?"
                      value={wasSurveyConducted}
                      opt1Value={1}
                      opt1Label="Yes"
                      opt2Value={2}
                      opt2Label="No"
                      errorText={errors.wasSurveyConducted}
                      wasValidated={false}
                      helpText="Selecting `yes` will close this job as success"
                      onChange={(e) =>
                        setWasSurveyConducted(parseInt(e.target.value))
                      }
                    />

                    {wasSurveyConducted === 1 && (
                      <>
                        <FormRadioField
                          label="Was the quality of the work satisfactory?"
                          value={wasJobSatisfactory}
                          opt1Value={1}
                          opt1Label="Yes"
                          opt2Value={2}
                          opt2Label="No"
                          errorText={errors.wasJobSatisfactory}
                          wasValidated={false}
                          helpText=""
                          onChange={(e) =>
                            setWasJobSatisfactory(parseInt(e.target.value))
                          }
                        />
                        <FormRadioField
                          label="Was the work completed on time and on budget?"
                          value={wasJobFinishedOnTimeAndOnBudget}
                          opt1Value={1}
                          opt1Label="Yes"
                          opt2Value={2}
                          opt2Label="No"
                          errorText={errors.wasJobFinishedOnTimeAndOnBudget}
                          wasValidated={false}
                          helpText=""
                          onChange={(e) =>
                            setWasJobFinishedOnTimeAndOnBudget(
                              parseInt(e.target.value),
                            )
                          }
                        />
                        <FormRadioField
                          label="Was the Associate Member punctual?"
                          value={wasAssociatePunctual}
                          opt1Value={1}
                          opt1Label="Yes"
                          opt2Value={2}
                          opt2Label="No"
                          errorText={errors.wasAssociatePunctual}
                          wasValidated={false}
                          helpText=""
                          onChange={(e) =>
                            setWasAssociatePunctual(parseInt(e.target.value))
                          }
                        />
                        <FormRadioField
                          label="Was the Associate Member professional?"
                          value={wasAssociateProfessional}
                          opt1Value={1}
                          opt1Label="Yes"
                          opt2Value={2}
                          opt2Label="No"
                          errorText={errors.wasAssociateProfessional}
                          wasValidated={false}
                          helpText=""
                          onChange={(e) =>
                            setWasAssociateProfessional(
                              parseInt(e.target.value),
                            )
                          }
                        />
                        <FormRadioField
                          label="Would you refer Over55 to a friend of family member?"
                          value={wouldCustomerReferOurOrganization}
                          opt1Value={1}
                          opt1Label="Yes"
                          opt2Value={2}
                          opt2Label="No"
                          errorText={errors.wouldCustomerReferOurOrganization}
                          wasValidated={false}
                          helpText=""
                          onChange={(e) =>
                            setWouldCustomerReferOurOrganization(
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </>
                    )}

                    {wasSurveyConducted === 2 && (
                      <>
                        <FormSelectField
                          label="Please select why the survey was not conducted?"
                          name="noSurveyConductedReason"
                          placeholder="Pick"
                          selectedValue={noSurveyConductedReason}
                          errorText={errors && errors.noSurveyConductedReason}
                          helpText=""
                          onChange={(e) =>
                            setNoSurveyConductedReason(parseInt(e.target.value))
                          }
                          options={
                            TASK_ITEM_NO_SURVEY_CONDUCTED_REASON_OPTIONS_WITH_EMPTY_OPTION
                          }
                        />

                        {noSurveyConductedReason === 1 && (
                          <FormInputField
                            label="Please select why the survey was not conducted? (Other)"
                            name="noSurveyConductedReasonOther"
                            placeholder="Text input"
                            value={noSurveyConductedReasonOther}
                            errorText={
                              errors && errors.noSurveyConductedReasonOther
                            }
                            helpText=""
                            onChange={(e) =>
                              setNoSurveyConductedReasonOther(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="380px"
                          />
                        )}

                        <FormTextareaField
                          label="Comment"
                          name="comment"
                          placeholder="Write any additional comments here."
                          value={comment}
                          errorText={errors && errors.comment}
                          helpText=""
                          onChange={(e) => setComment(e.target.value)}
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
                          to={`/admin/task/${tid}/survey/step-1`}
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

export default AdminTaskItemSurveyStep2;
