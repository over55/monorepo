import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";

function AdminClientAddStep1PartA() {
  ////
  //// Global state.
  ////

  const [addCustomer, setAddCustomer] = useRecoilState(addCustomerState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  ////
  //// Event handling.
  ////

  const onAddClientClick = (e) => {
    console.log("deleting previous addCustomer:", addCustomer);
    setAddCustomer(ADD_CUSTOMER_STATE_DEFAULT);
    setForceURL("/admin/clients/add/step-2");
  };

  ////
  //// API.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    if (firstName === "" && lastName === "" && email === "" && phone === "") {
      setErrors({
        message: "please enter a value",
      });
      return;
    }
    setForceURL(
      "/admin/clients/add/step-1-results?fn=" +
        firstName +
        "&ln=" +
        lastName +
        "&e=" +
        email +
        "&p=" +
        phone,
    );
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

          {/* Progress Wizard */}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 1 of 6</p>
            <progress class="progress is-success" value="17" max="100">
              17%
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
                    to={`/admin/clients`}
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
              <FontAwesomeIcon className="fas" icon={faSearch} />
              &nbsp;Search for existing client:
            </p>

            {/* <p className="pb-4 has-text-grey">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  <FormInputField
                    label="First Name"
                    name="firstName"
                    placeholder="Text input"
                    value={firstName}
                    errorText={errors && errors.firstName}
                    helpText=""
                    onChange={(e) => setFirstName(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Last Name"
                    name="lastName"
                    placeholder="Text input"
                    value={lastName}
                    errorText={errors && errors.lastName}
                    helpText=""
                    onChange={(e) => setLastName(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Text input"
                    value={email}
                    errorText={errors && errors.email}
                    helpText=""
                    onChange={(e) => setEmail(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Phone"
                    name="phone"
                    placeholder="Text input"
                    value={phone}
                    errorText={errors && errors.phone}
                    helpText=""
                    onChange={(e) => setPhone(e.target.value)}
                    isRequired={true}
                    maxWidth="150px"
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
                        <FontAwesomeIcon className="fas" icon={faSearch} />
                        &nbsp;Search
                      </button>
                    </div>
                  </div>

                  <p className="title is-4 has-text-centered">- OR -</p>

                  <div className="columns pt-5">
                    <div className="column has-text-centered">
                      <Link
                        className="button is-medium is-success is-fullwidth-mobile"
                        onClick={onAddClientClick}
                      >
                        <FontAwesomeIcon className="fas" icon={faPlus} />
                        &nbsp;Add client
                      </Link>
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

export default AdminClientAddStep1PartA;
