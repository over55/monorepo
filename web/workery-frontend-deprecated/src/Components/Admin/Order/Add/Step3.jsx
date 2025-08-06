import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faCircle,
  faArrowLeft,
  faTable,
  faArrowUpRightFromSquare,
  faArrowRight,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faWrench,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
  faComment,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormMultiSelectFieldForSkillSets from "../../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForTags from "../../../Reusable/FormMultiSelectFieldForTags";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  addOrderState,
} from "../../../../AppState";

function AdminOrderAddStep3() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);
  const [addOrder, setAddOrder] = useRecoilState(addOrderState);

  ////
  //// Component states.
  ////

  // --- Page related --- //
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  // --- Form related --- //
  const [description, setDescription] = useState(addOrder.description);
  const [skillSets, setSkillSets] = useState(addOrder.skillSets);
  const [additonalComment, setAdditonalComment] = useState(
    addOrder.additonalComment,
  );
  const [tags, setTags] = useState(addOrder.tags);

  ////
  //// Event handling.
  ////

  ////
  //// API.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (skillSets === undefined || skillSets === null || skillSets === "") {
      newErrors["skillSets"] = "missing value";
      hasErrors = true;
    } else {
      if (skillSets.length === 0) {
        newErrors["skillSets"] = "missing value";
        hasErrors = true;
      }
    }

    if (
      description === undefined ||
      description === null ||
      description === ""
    ) {
      newErrors["description"] = "missing value";
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

    console.log("onSubmitClick: Success");

    // Save to persistent storage.
    let modifiedAddOrder = { ...addOrder };
    modifiedAddOrder.description = description;
    modifiedAddOrder.skillSets = skillSets;
    modifiedAddOrder.additonalComment = additonalComment;
    modifiedAddOrder.tags = tags;
    setAddOrder(modifiedAddOrder);
    console.log("onSubmitClick: description=" + description);
    console.log("onSubmitClick: skillSets=" + skillSets);
    console.log("onSubmitClick: additonalComment=" + additonalComment);
    console.log("onSubmitClick: tags=" + tags);
    console.log("onSubmitClick: modifiedAddOrder=" + modifiedAddOrder);
    setForceURL("/admin/orders/add/step-4");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(false);
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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;New
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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowRight} />
                  &nbsp;Back to Orders
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Orders
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Order
          </h4>
          <hr />
          <br />

          {/* Modal */}
          <div className={`modal ${showCancelWarning ? "is-active" : ""}`}>
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={(e) => setShowCancelWarning(false)}
                ></button>
              </header>
              <section className="modal-card-body">
                Your Order record will be cancelled and your work will be lost.
                This cannot be undone. Do you want to continue?
              </section>
              <footer className="modal-card-foot">
                <Link
                  className="button is-medium is-success"
                  to={`/admin/orders`}
                >
                  Yes
                </Link>
                <button
                  className="button is-medium"
                  onClick={(e) => setShowCancelWarning(false)}
                >
                  No
                </button>
              </footer>
            </div>
          </div>

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 3 of 4</p>
            <progress class="progress is-success" value="75" max="100">
              60%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4 pb-2">
              <FontAwesomeIcon className="fas" icon={faGraduationCap} />
              &nbsp;Skills and Description
            </p>

            <p className="has-text-grey pb-4">
              Please fill out all the required fields before submitting this
              form.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                <div className="container">
                  <FormTextareaField
                    label="Describe the Job:"
                    name="description"
                    placeholder="Describe here..."
                    value={description}
                    errorText={errors && errors.description}
                    helpText=""
                    onChange={(e) => setDescription(e.target.value)}
                    isRequired={true}
                    maxWidth="280px"
                    helpText={"Max 1,000 characters"}
                    rows={4}
                  />

                  <FormMultiSelectFieldForSkillSets
                    label="Please select required job skill(s):"
                    name="skillSets"
                    placeholder="Pick skill sets"
                    skillSets={skillSets}
                    setSkillSets={setSkillSets}
                    errorText={errors && errors.skillSets}
                    helpText="Pick at least a single skill set at minimum."
                    isRequired={true}
                  />

                  <p className="title is-4 pb-2">
                    <FontAwesomeIcon className="fas" icon={faChartPie} />
                    &nbsp;Metrics
                  </p>

                  <FormMultiSelectFieldForTags
                    label="Tags (Optional)"
                    name="tags"
                    placeholder="Pick tags"
                    tags={tags}
                    setTags={setTags}
                    errorText={errors && errors.tags}
                    helpText="Pick the tags you would like to associate with this order."
                    isRequired={true}
                    maxWidth="320px"
                  />

                  <p className="title is-4 pb-2">
                    <FontAwesomeIcon className="fas" icon={faComment} />
                    &nbsp;Comments
                  </p>

                  <FormTextareaField
                    label="Additional comment(s): (Optional)"
                    name="additonalComment"
                    placeholder="Additional comments go here..."
                    value={additonalComment}
                    errorText={errors && errors.additonalComment}
                    helpText=""
                    onChange={(e) => setAdditonalComment(e.target.value)}
                    isRequired={true}
                    maxWidth="280px"
                    helpText={"Max 1,000 characters"}
                    rows={4}
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to={`/admin/orders/add/step-2`}
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSubmitClick}
                      >
                        Next&nbsp;
                        <FontAwesomeIcon className="fas" icon={faArrowRight} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminOrderAddStep3;
