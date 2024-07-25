import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowCircleRight,
  faHome,
  faBuildingUser,
  faHomeUser,
  faUserGear,
  faArrowRight,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
} from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
  currentUserState,
} from "../../../../AppState";

function AdminClientAddStep2() {
  ////
  //// Global state.
  ////

  const [addCustomer, setAddCustomer] = useRecoilState(addCustomerState);
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  ////
  //// Event handling.
  ////

  const onSelectType = (to) => {
    // Let's create a clone of our customer.
    let modifiedAddCustomer = { ...addCustomer };

    // Set the type.
    modifiedAddCustomer.type = to;

    // Attach the customers country based on current user's country if
    // the logged in user has a country, if not then default to `Canada`,
    // because Over55 is in Canada. Why are we doing this? Because the
    // phone number formatter requires a country while we ask about country
    // in the wizard before.
    if (
      currentUser.country !== undefined &&
      currentUser.country !== null &&
      currentUser.country !== ""
    ) {
      modifiedAddCustomer.country = currentUser.country;
    } else {
      modifiedAddCustomer.country = "Canada";
    }

    // Save to persistent storage our new customer.
    setAddCustomer(modifiedAddCustomer);

    // Redirect to the next page.
    setForceURL("/admin/clients/add/step-3");
  };

  ////
  //// API.
  ////

  // Nothing...

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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Clients
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Clients
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Client
          </h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 2 of 6</p>
            <progress class="progress is-success" value="33" max="100">
              33%
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
                  Your Client record will be cancelled and your work will be
                  lost. This cannot be undone. Do you want to continue?
                </section>
                <footer className="modal-card-foot">
                  <Link
                    className="button is-medium is-success"
                    to={`/admin/clients/add/step-1-search`}
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

            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faUserGear} />
              &nbsp;Select Client Type:
            </p>

            <p className="has-text-grey pb-4">
              Please select the type of client this is.
            </p>

            <>
              <FormErrorBox errors={errors} />
              <div className="container">
                <div className="columns">
                  {/* Residential */}
                  <div className="column">
                    <div className="card">
                      <div className="card-image has-background-info">
                        <div
                          className="has-text-centered"
                          style={{ padding: "60px" }}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faHome}
                            style={{ color: "white", fontSize: "9rem" }}
                          />
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="media">
                          <div className="media-content">
                            <p className="title is-4">
                              <FontAwesomeIcon
                                className="fas"
                                icon={faHomeUser}
                              />
                              &nbsp;Residential User
                            </p>
                          </div>
                        </div>

                        <div className="content">
                          Add a Residential Client.
                          <br />
                        </div>
                      </div>
                      <footer className="card-footer">
                        <button
                          onClick={(e, s) =>
                            onSelectType(RESIDENTIAL_CUSTOMER_TYPE_OF_ID)
                          }
                          type="button"
                          className="card-footer-item button is-primary is-large"
                        >
                          Pick&nbsp;
                          <FontAwesomeIcon
                            className="fas"
                            icon={faArrowCircleRight}
                          />
                        </button>
                      </footer>
                    </div>
                  </div>

                  {/* Business */}
                  <div className="column">
                    <div className="card">
                      <div className="card-image has-background-info">
                        <div
                          className="has-text-centered"
                          style={{ padding: "60px" }}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faBuilding}
                            style={{ color: "white", fontSize: "9rem" }}
                          />
                        </div>
                      </div>
                      <div className="card-content">
                        <div className="media">
                          <div className="media-content">
                            <p className="title is-4">
                              <FontAwesomeIcon
                                className="fas"
                                icon={faBuildingUser}
                              />
                              &nbsp;Business User
                            </p>
                          </div>
                        </div>

                        <div className="content">
                          Add a Commercial Client.
                          <br />
                        </div>
                      </div>
                      <footer className="card-footer">
                        <button
                          onClick={(e, s) =>
                            onSelectType(COMMERCIAL_CUSTOMER_TYPE_OF_ID)
                          }
                          type="button"
                          className="card-footer-item button is-primary is-large"
                        >
                          Pick&nbsp;
                          <FontAwesomeIcon
                            className="fas"
                            icon={faArrowCircleRight}
                          />
                        </button>
                      </footer>
                    </div>
                  </div>
                </div>

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
                  <div className="column is-half has-text-right"></div>
                </div>
              </div>
            </>
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminClientAddStep2;
