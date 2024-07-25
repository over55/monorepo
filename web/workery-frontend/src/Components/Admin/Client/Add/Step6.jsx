import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faQuestionCircle,
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
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import deepClone from "../../../../Helpers/deepCloneUtility";
import { postClientCreateAPI } from "../../../../API/Client";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import DataDisplayRowText from "../../../Reusable/DataDisplayRowText";
import DataDisplayRowCheckbox from "../../../Reusable/DataDisplayRowCheckbox";
import DataDisplayRowRadio from "../../../Reusable/DataDisplayRowRadio";
import DataDisplayRowSelect from "../../../Reusable/DataDisplayRowSelect";
import DataDisplayRowTagIDs from "../../../Reusable/DataDisplayRowTagIDs";
import DataDisplayRowHowHearAboutUsItem from "../../../Reusable/DataDisplayRowHowHear";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_PHONE_TYPE_WORK,
} from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../../Constants/FieldOptions";

function AdminClientAddStep6() {
  ////
  //// Global state.
  ////

  const [addCustomer, setAddCustomer] = useRecoilState(addCustomerState);
  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    const payload = deepClone(addCustomer); // Make a copy of the read-only data.

    // Apply the following fixes to our payload.

    // Fix 1: Format join date.
    const joinDateObject = new Date(addCustomer.joinDate);
    const joinDateISOString = joinDateObject.toISOString();
    payload.joinDate = joinDateISOString;

    console.log("onSubmitClick: payload:", addCustomer);
    setFetching(false);
    setErrors({});
    postClientCreateAPI(payload, onSuccess, onError, onDone, onUnauthorized);
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
    setTopAlertMessage("Client created");
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
    setAddCustomer(ADD_CUSTOMER_STATE_DEFAULT);

    // Redirect the user to a new page.
    setForceURL("/admin/client/" + response.id);
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

          {/* Progress Wizard*/}
          <nav className="box has-background-success-light">
            <p className="subtitle is-5">Step 6 of 6</p>
            <progress class="progress is-success" value="100" max="100">
              100%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faQuestionCircle} />
              &nbsp;Are you ready to submit?
            </p>

            <p className="has-text-grey pb-4">
              Please carefully review the following customer details and if you
              are ready click the <b>Submit</b> to complete.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                {addCustomer !== undefined &&
                  addCustomer !== null &&
                  addCustomer !== "" && (
                    <div className="container">
                      <p className="title is-4 mt-2">
                        <FontAwesomeIcon className="fas" icon={faIdCard} />
                        &nbsp;Contact&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/clients/add/step-3">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowSelect
                        label="Type"
                        selectedValue={addCustomer.type}
                        options={CLIENT_TYPE_OF_FILTER_OPTIONS}
                      />
                      {addCustomer.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                        <>
                          <DataDisplayRowText
                            label="Organization Name"
                            value={addCustomer.organizationName}
                          />
                          <DataDisplayRowSelect
                            label="Organization Type"
                            selectedValue={addCustomer.organizationType}
                            options={CLIENT_ORGANIZATION_TYPE_OPTIONS}
                          />
                        </>
                      )}

                      <DataDisplayRowText
                        label="First Name"
                        value={addCustomer.firstName}
                      />

                      <DataDisplayRowText
                        label="Last Name"
                        value={addCustomer.lastName}
                      />

                      <DataDisplayRowText
                        label="Email"
                        value={addCustomer.email}
                        type="email"
                      />

                      <DataDisplayRowCheckbox
                        label="I agree to receive electronic email"
                        checked={addCustomer.isOkToEmail}
                      />

                      <DataDisplayRowText
                        label="Phone"
                        value={addCustomer.phone}
                        type="phone"
                      />

                      <DataDisplayRowSelect
                        label="Phone Type"
                        selectedValue={addCustomer.phoneType}
                        options={
                          CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                        }
                      />

                      {addCustomer.phoneType === CLIENT_PHONE_TYPE_WORK && (
                        <DataDisplayRowText
                          label="Phone Extension"
                          value={addCustomer.phoneExtension}
                        />
                      )}

                      <DataDisplayRowCheckbox
                        label="I agree to receive texts to my phone"
                        checked={addCustomer.isOkToText}
                      />

                      <DataDisplayRowText
                        label="Other Phone (Optional)"
                        value={addCustomer.otherPhone}
                        type="phone"
                      />

                      {addCustomer.otherPhoneType !== 0 && (
                        <DataDisplayRowSelect
                          label="Other Phone Type (Optional)"
                          selectedValue={addCustomer.otherPhoneType}
                          options={
                            CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                          }
                        />
                      )}

                      {addCustomer.otherPhoneType ===
                        CLIENT_PHONE_TYPE_WORK && (
                        <DataDisplayRowText
                          label="Other Phone Extension (Optional)"
                          value={addCustomer.otherPhoneExtension}
                        />
                      )}

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faAddressBook} />
                        &nbsp;Address&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/clients/add/step-4">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowCheckbox
                        label="Has shipping address different then billing address"
                        checked={addCustomer.hasShippingAddress}
                      />

                      <div className="columns">
                        <div className="column">
                          {addCustomer.hasShippingAddress ? (
                            <p className="subtitle is-6">Billing Address</p>
                          ) : (
                            <></>
                          )}

                          <DataDisplayRowText
                            label="Country"
                            value={addCustomer.country}
                          />

                          <DataDisplayRowText
                            label="Province/Territory"
                            value={addCustomer.region}
                          />

                          <DataDisplayRowText
                            label="City"
                            value={addCustomer.city}
                          />

                          <DataDisplayRowText
                            label="Address Line 1"
                            value={addCustomer.addressLine1}
                          />

                          <DataDisplayRowText
                            label="Address Line 2 (Optional)"
                            value={addCustomer.addressLine2}
                          />

                          <DataDisplayRowText
                            label="Postal Code)"
                            value={addCustomer.postalCode}
                          />
                        </div>
                        {addCustomer.hasShippingAddress && (
                          <div className="column">
                            <p className="subtitle is-6">Shipping Address</p>

                            <DataDisplayRowText
                              label="Name"
                              value={addCustomer.shippingName}
                            />

                            <DataDisplayRowText
                              label="Phone"
                              value={addCustomer.shippingPhone}
                              type="phone"
                            />

                            <DataDisplayRowText
                              label="Country"
                              value={addCustomer.shippingCountry}
                            />

                            <DataDisplayRowText
                              label="Province/Territory"
                              value={addCustomer.shippingRegion}
                            />

                            <DataDisplayRowText
                              label="City"
                              value={addCustomer.shippingCity}
                            />

                            <DataDisplayRowText
                              label="Address Line 1"
                              value={addCustomer.shippingAddressLine1}
                            />

                            <DataDisplayRowText
                              label="Address Line 2 (Optional)"
                              value={addCustomer.shippingAddressLine2}
                            />

                            <DataDisplayRowText
                              label="Postal Code"
                              value={addCustomer.shippingPostalCode}
                            />
                          </div>
                        )}
                      </div>

                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faChartPie} />
                        &nbsp;Metrics&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                        <Link to="/admin/clients/add/step-5">
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                      </p>

                      <DataDisplayRowTagIDs tags={addCustomer.tags} />

                      <DataDisplayRowHowHearAboutUsItem
                        howDidYouHearAboutUsID={
                          addCustomer.howDidYouHearAboutUsID
                        }
                      />

                      {addCustomer.howDidYouHearAboutUsOther !== undefined &&
                        addCustomer.howDidYouHearAboutUsOther !== null &&
                        addCustomer.howDidYouHearAboutUsOther !== null && (
                          <DataDisplayRowText
                            label="How did you hear about us? (Other)"
                            value={addCustomer.howDidYouHearAboutUsOther}
                          />
                        )}

                      <DataDisplayRowSelect
                        label="Gender"
                        selectedValue={addCustomer.gender}
                        options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                      />
                      {addCustomer.gender === 1 && (
                        <DataDisplayRowText
                          label="Gender (Other)"
                          value={addCustomer.genderOther}
                        />
                      )}

                      <DataDisplayRowText
                        label="Birth Date (Optional)"
                        value={addCustomer.birthDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Join Date (Optional)"
                        value={addCustomer.joinDate}
                        type="date"
                      />

                      <DataDisplayRowText
                        label="Additional Comment"
                        value={addCustomer.additionalComment}
                      />

                      <DataDisplayRowRadio
                        label="Preferred Language"
                        value={addCustomer.preferredLanguage}
                        opt1Value="English"
                        opt1Label="English"
                        opt2Value="French"
                        opt2Label="French"
                      />

                      <div className="columns pt-5">
                        <div className="column is-half">
                          <Link
                            className="button is-medium is-fullwidth-mobile"
                            to="/admin/clients/add/step-5"
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faArrowLeft}
                            />
                            &nbsp;Back
                          </Link>
                        </div>
                        <div className="column is-half has-text-right">
                          <button
                            className="button is-medium is-success is-fullwidth-mobile"
                            onClick={onSubmitClick}
                          >
                            <FontAwesomeIcon
                              className="fas"
                              icon={faCheckCircle}
                            />
                            &nbsp;Submit
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

export default AdminClientAddStep6;
