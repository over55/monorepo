import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTable,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserCircle,
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
  faArrowUpRightFromSquare,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getClientDetailAPI } from "../../../../API/Client";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import SelectTextFormatter from "../../../Reusable/EveryPage/SelectTextFormatter";
import CheckboxTextFormatter from "../../../Reusable/EveryPage/CheckboxTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import RadioTextFormatter from "../../../Reusable/EveryPage/RadioTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import DataDisplayRowRadio from "../../../Reusable/DataDisplayRowRadio";
import TagsTextFormatter from "../../../Reusable/EveryPage/TagsTextFormatter";
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import {
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  ASSOCIATE_PHONE_TYPE_WORK,
} from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../../Constants/FieldOptions";

function ClientAssociateDetailFull() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();

  ////
  //// Global state.
  ////

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
  const [client, setClient] = useState({});
  const [tabIndex, setTabIndex] = useState(1);

  ////
  //// Event handling.
  ////

  //

  ////
  //// API.
  ////

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setClient(response);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    console.log("onDone: Starting...");
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

      setFetching(true);
      getClientDetailAPI(cid, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, [cid]);

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
                <Link to="/a/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/a/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail
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
                <Link to="/a/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Clients
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {client && client.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Client
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {client && (
              <div className="columns">
                <div className="column">
                  <p className="title is-one-quarter is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Detail
                  </p>
                </div>
                <div className="column is-three-quarters has-text-right">
                  {/*
                  <Link
                    to={`/a/client/${cid}/edit`}
                    className="button is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={client.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                    &nbsp;Edit
                  </Link>&nbsp;
                  <Link
                    to={`/a/orders/add/step-2-from-launchpad?id=${client && cid}&fn=${client && client.firstName}&ln=${client && client.lastName}`}
                    className="button is-success is-fullwidth-mobile"
                    type="button"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FontAwesomeIcon className="mdi" icon={faPlus} />
                    &nbsp;New Order&nbsp;
                    <FontAwesomeIcon
                      className="mdi"
                      icon={faArrowUpRightFromSquare}
                    />
                  </Link>
                  */}
                </div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {client && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/a/client/${client.id}`}>Summary</Link>
                        </li>
                        <li className="is-active">
                          <Link>
                            <strong>Detail</strong>
                          </Link>
                        </li>
                        <li>
                          <Link to={`/a/client/${client.id}/orders`}>
                            Orders
                          </Link>
                        </li>
                        {/*
                        <li>
                          <Link to={`/a/client/${client.id}/comments`}>
                            Comments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/a/client/${client.id}/attachments`}>
                            Attachments
                          </Link>
                        </li>
                        <li>
                          <Link to={`/a/client/${client.id}/more`}>
                            More&nbsp;&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faEllipsis}
                            />
                          </Link>
                        </li>
                        */}
                      </ul>
                    </div>

                    {/*
                        ##########################
                        Peronsal Information Table
                        ##########################
                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Personal Information
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Type:
                          </th>
                          <td>
                            <SelectTextFormatter
                              selectedValue={client.type}
                              options={ASSOCIATE_TYPE_OF_FILTER_OPTIONS}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            First Name:
                          </th>
                          <td>{client.firstName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Last Name:
                          </th>
                          <td>{client.lastName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Date of Birth:
                          </th>
                          <td>
                            {client.birthDate ? (
                              <DateTextFormatter value={client.birthDate} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Gender:
                          </th>
                          <td>
                            {client.gender ? (
                              <>
                                <SelectTextFormatter
                                  selectedValue={client.gender}
                                  options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                                />
                                {client.gender === 1 && (
                                  <>&nbsp;-&nbsp;{client.genderOther}</>
                                )}
                              </>
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>
                            {client.description ? client.description : <>-</>}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Tags:
                          </th>
                          <td>
                            {client.tags && client.tags.length > 0 ? (
                              <TagsTextFormatter tags={client.tags} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                                        ##########################
                                        Company Information Table
                                        ##########################
                                    */}
                    {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                      <table className="is-fullwidth table">
                        <thead>
                          <tr className="has-background-black">
                            <th className="has-text-white" colSpan="2">
                              Company Information
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Company Name:
                            </th>
                            <td>{client.organizationName}</td>
                          </tr>
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Company Type:
                            </th>
                            <td>
                              <SelectTextFormatter
                                selectedValue={client.organizationType}
                                options={ASSOCIATE_ORGANIZATION_TYPE_OPTIONS}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    )}

                    {/*
                                        ###################
                                        Contact Point Table
                                        ###################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Contact Point
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Email:
                          </th>
                          <td>
                            {client.email ? (
                              <EmailTextFormatter value={client.email} />
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            I agree to receive electronic email:
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={client.isOkToEmail}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Phone:
                          </th>
                          <td>
                            {client.phone ? (
                              <>
                                <PhoneTextFormatter value={client.phone} />
                                {client.phoneType ===
                                  ASSOCIATE_PHONE_TYPE_WORK && (
                                  <>&nbsp;{client.phoneExtension}</>
                                )}
                              </>
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Phone Type:
                          </th>
                          <td>
                            <SelectTextFormatter
                              selectedValue={client.phoneType}
                              options={
                                ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                              }
                            />
                          </td>
                        </tr>
                        {client.otherPhone && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Other Phone (Optional):
                              </th>
                              <td>
                                {client.otherPhone ? (
                                  <>
                                    <PhoneTextFormatter
                                      value={client.otherPhone}
                                    />
                                    {client.otherPhoneType ===
                                      ASSOCIATE_PHONE_TYPE_WORK && (
                                      <>&nbsp;{client.otherPhoneExtension}</>
                                    )}
                                  </>
                                ) : (
                                  <>-</>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Other Phone Type (Optional):
                              </th>
                              <td>
                                <SelectTextFormatter
                                  selectedValue={client.otherPhoneType}
                                  options={
                                    ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                                  }
                                />
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            I agree to receive texts to my phone:
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={client.isOkToText}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                                        ##########################
                                        Address Table
                                        ##########################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Address
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Location:
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={client.fullAddressWithPostalCode}
                              urlValue={client.fullAddressUrl}
                              type={`external`}
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*
                                        ##########################
                                        Internal Metrics Table
                                        ##########################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Internal Metrics
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            How did they discover us?:
                          </th>
                          <td>
                            {client.isHowDidYouHearAboutUsOther
                              ? client.howDidYouHearAboutUsOther
                              : client.howDidYouHearAboutUsText}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Join date:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={client.joinDate} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Preferred Language:
                          </th>
                          <td>
                            <RadioTextFormatter
                              value={client.preferredLanguage}
                              opt1Value={`English`}
                              opt1Label="English"
                              opt2Value={`French`}
                              opt2Label="French"
                            />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    {/*

                                        <DataDisplayRowHowHearAboutUsItem
                                            howDidYouHearAboutUsID={client.howDidYouHearAboutUsID}
                                        />

                                        {client.howDidYouHearAboutUsOther !== undefined && client.howDidYouHearAboutUsOther !== null && client.howDidYouHearAboutUsOther !== null &&
                                            <DataDisplayRowText
                                                label="How did you hear about us? (Other)"
                                                value={client.howDidYouHearAboutUsOther}
                                            />
                                        }
                                    */}

                    {/*
                                        ##########################
                                        System Table
                                        ##########################
                                    */}
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            System
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            ID:
                          </th>
                          <td>{client.publicId}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={client.createdAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created by:
                          </th>
                          <td>{client.createdByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created from:
                          </th>
                          <td>{client.createdFromIpAddress}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified at:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={client.modifiedAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified by:
                          </th>
                          <td>{client.modifiedByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified from:
                          </th>
                          <td>{client.modifiedFromIpAddress}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-one-quarter is-fullwidth-mobile"
                          to={`/a/clients`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Clients
                        </Link>
                      </div>
                      <div className="column is-three-quarters has-text-right">
                        {/*
                        <Link
                          to={`/a/client/${cid}/edit`}
                          className="button is-warning is-fullwidth-mobile"
                          disabled={client.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                        &nbsp;
                        <Link
                          to={`/a/orders/add/step-2-from-launchpad?id=${client && cid}&fn=${client && client.firstName}&ln=${client && client.lastName}`}
                          className="button is-success is-fullwidth-mobile"
                          type="button"
                          target="_blank"
                          rel="noreferrer"
                        >
                          <FontAwesomeIcon className="mdi" icon={faPlus} />
                          &nbsp;New Order&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faArrowUpRightFromSquare}
                          />
                        </Link>
                        */}
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

export default ClientAssociateDetailFull;
