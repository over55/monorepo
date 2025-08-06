import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
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
  faStar,
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
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  addOrderState,
} from "../../../../AppState";

function AdminOrderAddStep2() {
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
  const [startDate, setStartDate] = useState(addOrder.startDate);
  const [isOngoing, setIsOngoing] = useState(addOrder.isOngoing);
  const [isHomeSupportService, setIsHomeSupportService] = useState(
    addOrder.isHomeSupportService,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (isOngoing === undefined || isOngoing === null || isOngoing === 0) {
      newErrors["isOngoing"] = "missing value";
      hasErrors = true;
    }

    if (
      isHomeSupportService === undefined ||
      isHomeSupportService === null ||
      isHomeSupportService === 0
    ) {
      newErrors["isHomeSupportService"] = "missing value";
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
    modifiedAddOrder.startDate = startDate;
    modifiedAddOrder.isOngoing = isOngoing;
    modifiedAddOrder.isHomeSupportService = isHomeSupportService;
    setAddOrder(modifiedAddOrder);
    console.log(
      "onSubmitClick: startDate=" +
        startDate +
        " isOngoing=" +
        isOngoing +
        "isHomeSupportService=" +
        isHomeSupportService,
    );
    console.log("onSubmitClick: modifiedAddOrder=" + modifiedAddOrder);
    setForceURL("/admin/orders/add/step-3");
  };

  ////
  //// API.
  ////

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

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 2 of 4</p>
            <progress class="progress is-success" value="50" max="100">
              40%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
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
                  Your Order record will be cancelled and your work will be
                  lost. This cannot be undone. Do you want to continue?
                </section>
                <footer className="modal-card-foot">
                  <Link
                    className="button is-medium is-success"
                    to={`/admin/orders/add/step-1-search`}
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

            <p className="title is-4 pb-2">
              <FontAwesomeIcon className="fas" icon={faStar} />
              &nbsp;Job Type
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

                  <FormRadioField
                    label="Is this job one time or ongoing?"
                    name="isOngoing"
                    value={isOngoing}
                    errorText={errors && errors.isOngoing}
                    opt1Value={2}
                    opt1Label="One-Time"
                    opt2Value={1}
                    opt2Label="Ongoing"
                    onChange={(e) => setIsOngoing(parseInt(e.target.value))}
                    errorText={errors && errors.isOngoing}
                  />

                  <FormRadioField
                    label="Is this job a home support service?"
                    name="isHomeSupportService"
                    value={isHomeSupportService}
                    errorText={errors && errors.isHomeSupportService}
                    opt1Value={2}
                    opt1Label="No"
                    opt2Value={1}
                    opt2Label="Yes"
                    onChange={(e) =>
                      setIsHomeSupportService(parseInt(e.target.value))
                    }
                    errorText={errors && errors.isHomeSupportService}
                  />

                  <div className="container">
                    <FormAlternateDateField
                      label="When should this job start? (Optional)"
                      name="startDate"
                      placeholder="Text input"
                      value={startDate}
                      helpText="Leave blank if nothing was specified by client."
                      onChange={(date) => setStartDate(date)}
                      isRequired={true}
                      maxWidth="180px"
                      errorText={errors && errors.startDate}
                    />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <button
                        className="button is-medium is-fullwidth-mobile"
                        onClick={(e) => setShowCancelWarning(true)}
                      >
                        <FontAwesomeIcon className="fas" icon={faTimesCircle} />
                        &nbsp;Cancel
                      </button>
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

export default AdminOrderAddStep2;
