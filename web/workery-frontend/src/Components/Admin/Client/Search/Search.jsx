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
import FormPhoneField from "../../../Reusable/FormPhoneField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";

function AdminClientSearch() {
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
  const [organizationName, setOrganizationName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [showOnlyActive, setShowOnlyActive] = useState(true);
  const [country] = useState(addCustomer.country);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    if (
      firstName === "" &&
      lastName === "" &&
      email === "" &&
      phone === "" &&
      organizationName === ""
    ) {
      setErrors({
        message: "please enter a value",
      });
      return;
    }

    let aURL = "/admin/clients/search-result?fn=" +
      firstName +
      "&ln=" +
      lastName +
      "&e=" +
      email +
      "&p=" +
      encodeURIComponent(phone) +
      "&on=" +
      organizationName +
      "&active=" +
      showOnlyActive;

    console.log("aURL:", aURL);

    setForceURL(aURL
    );
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
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Search
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
            <FontAwesomeIcon className="fas" icon={faSearch} />
            &nbsp;Search
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faSearch} />
              &nbsp;Search for existing client:
            </p>

            <p className="has-text-grey pb-4">
              Please enter one or more of the following fields to begin
              searching.
            </p>

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
                  <FormPhoneField
                    label="Phone"
                    name="phone"
                    placeholder="Text input"
                    selectedCountry={country}
                    selectePhoneNumber={phone}
                    errorText={errors && errors.phone}
                    helpText=""
                    onChange={(ph) => {
                      setPhone(ph);
                    }}
                    isRequired={true}
                    maxWidth="200px"
                  />
                  <FormInputField
                    label="Organization Name"
                    name="organizationName"
                    placeholder="Text input"
                    value={organizationName}
                    errorText={errors && errors.organizationName}
                    helpText=""
                    onChange={(e) => setOrganizationName(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormCheckboxField
                    label="Search active Clients only"
                    name="showOnlyActive"
                    checked={showOnlyActive}
                    errorText={errors && errors.showOnlyActive}
                    helpText="By selecting this checkbox, you will be shown only clients which are active, else unselecting checkbox will search all clients."
                    onChange={(e) => {
                      setShowOnlyActive(!showOnlyActive);
                    }}
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/clients"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Clients
                      </Link>
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
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminClientSearch;
