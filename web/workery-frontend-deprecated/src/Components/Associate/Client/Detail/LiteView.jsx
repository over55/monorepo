import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTags,
  faEnvelope,
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
import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../Reusable/EveryPage/TagsTextFormatter";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../Constants/FieldOptions";

function AssociateClientDetailLite() {
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

                    <div className="card">
                      <div className="card-content">
                        <div className="media">
                          {/*
                                                <div className="media-left">
                                                    <figure className="image is-48x48">
                                                      <img src="https://bulma.io/images/placeholders/96x96.png" alt="Placeholder image" />
                                                    </figure>
                                                </div>
                                                 */}
                          <div className="media-content">
                            {client.type === 3 && (
                              <p className="title is-2 is-size-3-mobile">
                                <FontAwesomeIcon
                                  className="mdi"
                                  icon={faBuilding}
                                />
                                &nbsp;{client.organizationName}
                              </p>
                            )}
                            <p className="title is-3 is-size-4-mobile">
                              {client.type === 2 && (
                                <>
                                  <FontAwesomeIcon
                                    className="mdi"
                                    icon={faHome}
                                  />
                                  &nbsp;
                                </>
                              )}
                              {client.name}
                            </p>
                            <p className="subtitle is-5 is-size-6-mobile">
                              <URLTextFormatter
                                urlKey={client.fullAddressWithPostalCode}
                                urlValue={client.fullAddressUrl}
                                type={`external`}
                              />
                            </p>
                          </div>
                        </div>

                        <div className="content">
                          <p>
                            <FontAwesomeIcon
                              className="fas"
                              icon={faEnvelope}
                            />
                            &nbsp;
                            {client.email ? (
                              <EmailTextFormatter value={client.email} />
                            ) : (
                              <>-</>
                            )}
                          </p>
                          <p>
                            <FontAwesomeIcon
                              className="fas"
                              icon={faSquarePhone}
                            />
                            &nbsp;
                            {client.phone ? (
                              <PhoneTextFormatter value={client.phone} />
                            ) : (
                              <>-</>
                            )}
                          </p>
                          <p>
                            <FontAwesomeIcon className="fas" icon={faTags} />
                            &nbsp;Tag(s):&nbsp;
                            {client.tags && client.tags.length > 0 ? (
                              <TagsTextFormatter tags={client.tags} />
                            ) : (
                              <>-</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="columns">
                      <div className="column"></div>
                      <div className="column"></div>
                    </div>

                    {/*
                                    {client.avatarObjectUrl && <>
                                        <DataDisplayRowImage
                                            label="Profile Photo"
                                            objectURL={client.avatarObjectUrl}
                                            maxWidth={"640px"}
                                        />
                                    </>}

                                    <DataDisplayRowSelect
                                        label="Type"
                                        selectedValue={client.type}
                                        options={CLIENT_TYPE_OF_FILTER_OPTIONS}
                                    />

                                    {client.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && <>
                                        <DataDisplayRowText
                                            label="Organization Name"
                                            value={client.organizationName}
                                        />
                                        <DataDisplayRowSelect
                                            label="Organization Type"
                                            selectedValue={client.organizationType}
                                            options={CLIENT_ORGANIZATION_TYPE_OPTIONS}
                                        />
                                    </>}

                                    <DataDisplayRowText
                                        label="First Name"
                                        value={client.firstName}
                                    />

                                    <DataDisplayRowText
                                        label="Last Name"
                                        value={client.lastName}
                                    />

                                    <DataDisplayRowText
                                        label="Email"
                                        value={client.email}
                                        type="email"
                                    />

                                    <DataDisplayRowText
                                        label="Phone"
                                        value={client.phone}
                                        type="phone"
                                    />
*/}

                    <div className="columns pt-5">
                      <div className="column is-one-quarter">
                        <Link
                          className="button is-fullwidth-mobile"
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

export default AssociateClientDetailLite;
