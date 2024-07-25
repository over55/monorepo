import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  faFileSignature,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import deepClone from "../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../Helpers/datetimeUtility";
import { postOrderCreateAPI } from "../../../../API/Order";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormMultiSelectFieldForSkillSets from "../../../Reusable/FormMultiSelectFieldForSkillSets";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import CheckboxTextFormatter from "../../../Reusable/EveryPage/CheckboxTextFormatter";
import SkillSetIDsTextFormatter from "../../../Reusable/EveryPage/SkillSetIDsTextFormatter";
import TagIDsTextFormatter from "../../../Reusable/EveryPage/TagIDsTextFormatter";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
  addOrderState,
} from "../../../../AppState";
import {
  addCustomerState,
  ADD_ORDER_STATE_DEFAULT,
} from "../../../../AppState";

function AdminOrderAddStep4() {
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
  const [customerID] = useState(addOrder.customerID);
  const [customerFirstName] = useState(addOrder.customerFirstName);
  const [customerLastName] = useState(addOrder.customerLastName);
  const [startDate] = useState(addOrder.startDate);
  const [isOngoing] = useState(addOrder.isOngoing);
  const [isHomeSupportService] = useState(addOrder.isHomeSupportService);
  const [description] = useState(addOrder.description);
  const [skillSets] = useState(addOrder.skillSets);
  const [additonalComment] = useState(addOrder.additonalComment);
  const [tags] = useState(addOrder.tags);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    const payload = deepClone(addOrder); // Make a copy of the read-only data.

    // Apply the following fixes to our payload.

    // Fix 1: startDate
    if (addOrder.startDate !== undefined && addOrder.startDate !== null) {
      if (!isISODate(addOrder.startDate)) {
        const startDateObject = new Date(addOrder.startDate);
        const startDateISOString = startDateObject.toISOString();
        payload.startDate = startDateISOString;
      }
    }

    console.log("onSubmitClick: Success");

    console.log("onSubmitClick: payload:", addOrder);

    setFetching(false);
    setErrors({});
    postOrderCreateAPI(payload, onSuccess, onError, onDone);
  };

  ////
  //// API.
  ////

  function onSuccess(response) {
    // For debugging purposes only.
    console.log("onSuccess: Starting...");
    console.log(response);

    if (response === undefined || response === null || response === "") {
      console.log("onSuccess: exiting early");
      return;
    }

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Order created");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onSuccess: Delayed for 2 seconds.");
      console.log(
        "onSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Clear all data that staff inputed in this wizard.
    setAddOrder(ADD_ORDER_STATE_DEFAULT);

    // Redirect the user to a new page.
    setForceURL("/admin/order/" + response.wjid);
  }

  function onError(apiErr) {
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    setFetching(false);
  }

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

  console.log("isOngoing:", isOngoing);

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
          <nav className="box has-background-success-light">
            <p className="subtitle is-5">Step 4 of 4</p>
            <progress class="progress is-success" value="100" max="100">
              100%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4 pb-2">
              <FontAwesomeIcon className="fas" icon={faFileSignature} />
              &nbsp;Review
            </p>

            <p className="has-text-grey pb-4">
              Please review the following order summary table before submitting
              this order into the system.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

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
                          Customer:
                        </th>
                        <td>
                          <URLTextFormatter
                            urlKey={`${customerFirstName} ${customerLastName}`}
                            urlValue={`/admin/client/${customerID}`}
                            type={`external`}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Start Date:
                        </th>
                        <td>
                          {startDate ? <DateTextFormatter value={startDate} /> : <>-</>}
                        </td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Is Ongoing:
                        </th>
                        <td>
                          <CheckboxTextFormatter checked={isOngoing===1} />
                        </td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Is Home Support Service
                        </th>
                        <td>
                          <CheckboxTextFormatter
                            checked={isHomeSupportService===1}
                          />
                        </td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Description:
                        </th>
                        <td>{description}</td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Skill Sets:
                        </th>
                        <td>
                          <SkillSetIDsTextFormatter skillSets={skillSets} />
                        </td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Additonal Comment:
                        </th>
                        <td>{additonalComment}</td>
                      </tr>
                      <tr>
                        <th
                          className="has-background-light"
                          style={{ width: "30%" }}
                        >
                          Tags:
                        </th>
                        <td>
                          <TagIDsTextFormatter tags={tags} />
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to={`/admin/orders/add/step-3`}
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
                        <FontAwesomeIcon className="fas" icon={faCheckCircle} />
                        &nbsp;Submit
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

export default AdminOrderAddStep4;
