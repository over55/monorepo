import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingUser,
  faImage,
  faPaperclip,
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
  faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import {
  getClientDetailAPI,
  postUpgradeClientAPI,
} from "../../../../../../API/Client";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import AlertBanner from "../../../../../Reusable/EveryPage/AlertBanner";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../../AppState";
import { CLIENT_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../../Constants/FieldOptions";

function AdminClientUpgradeOperation() {
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
  const [organizationName, setOrganizationName] = useState("");
  const [organizationType, setOrganizationType] = useState(0);

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    setErrors({});
    setFetching(true);
    postUpgradeClientAPI(
      {
        customer_id: cid,
        organization_name: organizationName,
        organization_type: organizationType,
      },
      onUpgradeSuccess,
      onUpgradeError,
      onUpgradeDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

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

  // --- Upgrade --- //

  function onUpgradeSuccess(response) {
    console.log("onUpgradeSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Client upgraded");
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

    setForceURL("/admin/client/" + cid + "/more");
  }

  function onUpgradeError(apiErr) {
    console.log("onUpgradeError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onUpgradeDone() {
    console.log("onUpgradeDone: Starting...");
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
              <li className="">
                <Link to={`/admin/client/${cid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail (More)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faBuildingUser} />
                  &nbsp;Upgrade
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
                <Link to={`/admin/client/${cid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail
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
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faBuildingUser} />
                    &nbsp;Upgrade Client
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

                {client && (
                  <div className="container">
                    <article className="message is-warning">
                      <div className="message-body">
                        <p className="title is-4">
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCircleExclamation}
                          />
                          &nbsp;Warning
                        </p>
                        <p>
                          You are about to <b>upgrade</b> this client from{" "}
                          <i>Residential</i> type into <i>Business</i>. This
                          will affect the rates, associates and terms the client
                          will now be applied. Are you sure you want to
                          continue?
                        </p>
                      </div>
                    </article>

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
                    <FormSelectField
                      label="Organization Type"
                      name="organizationType"
                      placeholder="Pick"
                      selectedValue={organizationType}
                      errorText={errors && errors.organizationType}
                      helpText=""
                      onChange={(e) =>
                        setOrganizationType(parseInt(e.target.value))
                      }
                      options={
                        CLIENT_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS
                      }
                    />

                    {/* Bottom Navigation */}
                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/client/${cid}/more`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Detail
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          className="button is-danger is-fullwidth-mobile"
                          onClick={onSubmitClick}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                            type="button"
                          />
                          &nbsp;Confirm and Upgrade
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

export default AdminClientUpgradeOperation;
