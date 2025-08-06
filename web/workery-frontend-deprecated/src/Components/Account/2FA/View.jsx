import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faBuilding,
  faEnvelope,
  faSquarePhone,
  faTable,
  faHome,
  faLock,
  faTimesCircle,
  faArrowRight,
  faImage,
  faEllipsis,
  faRepeat,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faKey,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getAccountDetailAPI } from "../../../API/Account";
import { postDisableOTP } from "../../../API/Gateway";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import CheckboxTextFormatter from "../../Reusable/EveryPage/CheckboxTextFormatter";
import SelectTextFormatter from "../../Reusable/EveryPage/SelectTextFormatter";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormTextareaField from "../../Reusable/FormTextareaField";
import FormRadioField from "../../Reusable/FormRadioField";
import FormMultiSelectField from "../../Reusable/FormMultiSelectField";
import FormSelectField from "../../Reusable/FormSelectField";
import FormCheckboxField from "../../Reusable/FormCheckboxField";
import FormCountryField from "../../Reusable/FormCountryField";
import FormRegionField from "../../Reusable/FormRegionField";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import FormInputField from "../../Reusable/FormInputField";
import FormTextYesNoRow from "../../Reusable/FormRowTextYesNo";
import DataDisplayRowImage from "../../Reusable/DataDisplayRowImage";
import TagsTextFormatter from "../../Reusable/EveryPage/TagsTextFormatter";
import URLTextFormatter from "../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../Reusable/EveryPage/PhoneTextFormatter";
import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../Constants/App";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../Constants/App";
import {
  USER_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  USER_TYPE_OF_FILTER_OPTIONS,
  USER_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../Constants/FieldOptions";

function AccountTwoFactorAuthenticationDetail() {
  ////
  ////
  ////

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

  // Page related states.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  // Modal related states.
  const [showDisableOTPWarning, setShowDisableOTPWarning] = useState(false);

  ////
  //// Event handling.
  ////

  const onDisableTwoFactorAuthenticationButtonClick = () => {
    console.log("onDisableTwoFactorAuthenticationButtonClick: Starting...");
    console.log("otpEnabled:", currentUser.otpEnabled);
    postDisableOTP(onDisableOTPSuccess, onDisableOTPError, onDisableOTPDone);
  };

  const onCloseDisableTwoFactorAuthenticationModal = () => {
    setErrors({});
    setShowDisableOTPWarning(false);
  };

  ////
  //// API.
  ////

  // --- Account Detail --- //

  const onAccountDetailSuccess = (response) => {
    console.log("onAccountDetailSuccess: Starting...");
    setCurrentUser(response);
  };

  const onAccountDetailError = (apiErr) => {
    console.log("onAccountDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  };

  const onAccountDetailDone = () => {
    console.log("onAccountDetailDone: Starting...");
    setFetching(false);
  };

  // --- 2FA Disable --- //

  const onDisableOTPSuccess = (response) => {
    console.log("onDisableOTPSuccess: Starting...");

    // Update the current logged in user account.
    setCurrentUser(response);

    // Change the page state to accomodate success.
    setErrors({});
    setShowDisableOTPWarning(false);

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("2FA Disabled");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);
  };

  const onDisableOTPError = (apiErr) => {
    console.log("onDisableOTPError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  };

  const onDisableOTPDone = () => {
    console.log("onDisableOTPDone: Starting...");
    setFetching(false);
  };

  ////
  //// BREADCRUMB
  ////

  const generateBreadcrumbItemLink = (currentUser) => {
    let dashboardLink;
    switch (currentUser.role) {
      case EXECUTIVE_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case MANAGEMENT_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case FRONTLINE_ROLE_ID:
        dashboardLink = "/admin/dashboard";
        break;
      case CUSTOMER_ROLE_ID:
        dashboardLink = "/c/dashboard";
        break;
      case ASSOCIATE_ROLE_ID:
        dashboardLink = "/a/dashboard";
        break;
      case ASSOCIATE_JOB_SEEKER_ROLE_ID:
        dashboardLink = "/js/dashboard";
        break;
      default:
        dashboardLink = "/501"; // Default or error handling
        break;
    }
    return dashboardLink;
  };

  const breadcrumbItems = {
    items: [
      {
        text: "Dashboard",
        link: generateBreadcrumbItemLink(currentUser),
        isActive: false,
        icon: faGauge,
      },
      { text: "Account", link: "/account", icon: faUserCircle, isActive: true },
    ],
    mobileBackLinkItems: {
      link: generateBreadcrumbItemLink(currentUser),
      text: "Back to Dashboard",
      icon: faArrowLeft,
    },
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
      setFetching(true);
      setErrors({});
      getAccountDetailAPI(
        onAccountDetailSuccess,
        onAccountDetailError,
        onAccountDetailDone,
      );
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

  // showDisableOTPWarning, setShowDisableOTPWarning

  return (
    <>
      {/* App Modal(s) */}
      <div className={`modal ${showDisableOTPWarning ? "is-active" : ""}`}>
        <div className="modal-background"></div>
        <div className="modal-card">
          <header className="modal-card-head">
            <p className="modal-card-title">Are you sure?</p>
            <button
              className="delete"
              aria-label="close"
              onClick={onCloseDisableTwoFactorAuthenticationModal}
            ></button>
          </header>
          <section className="modal-card-body">
            <FormErrorBox errors={errors} />
            You are about to <b>disable two-factor authentication</b> for your
            account; this will make your account less secure as when you login
            next time you will not be asked for your 2FA Code. Are you sure you
            would like to continue?
          </section>
          <footer className="modal-card-foot">
            <button
              className="button is-success"
              onClick={onDisableTwoFactorAuthenticationButtonClick}
            >
              Confirm
            </button>
            <button
              className="button"
              onClick={onCloseDisableTwoFactorAuthenticationModal}
            >
              Cancel
            </button>
          </footer>
        </div>
      </div>

      <div className="container">
        <section className="section">
          {/* Desktop Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-touch p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link
                  to={generateBreadcrumbItemLink(currentUser)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Profile (2FA)
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
                <Link
                  to={generateBreadcrumbItemLink(currentUser)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Profile
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {currentUser && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Detail
                  </p>
                </div>
                <div className="column has-text-right">
                  {currentUser.otpEnabled ? (
                    <button
                      className="button is-small is-danger is-fullwidth-mobile"
                      type="button"
                      disabled={currentUser.status === 2}
                      onClick={(e) => {
                        setShowDisableOTPWarning(true);
                      }}
                    >
                      <FontAwesomeIcon className="mdi" icon={faUnlock} />
                    </button>
                  ) : (
                    <Link
                      className="button is-small is-success is-fullwidth-mobile"
                      type="button"
                      disabled={currentUser.status === 2}
                      to="/account/2fa/setup/step-1"
                    >
                      <FontAwesomeIcon className="mdi" icon={faLock} />
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                {showDisableOTPWarning === false && (
                  <FormErrorBox errors={errors} />
                )}

                {currentUser && (
                  <div className="container">
                    {/* Tab Navigation */}
                    <div className="tabs is-medium is-size-7-mobile">
                      <ul>
                        <li>
                          <Link to={`/account`}>Detail</Link>
                        </li>
                        <li className="is-active">
                          <Link to={`/account/2fa`}>2FA</Link>
                        </li>
                        <li>
                          <Link to={`/account/more`}>
                            More&nbsp;&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faEllipsis}
                            />
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {currentUser.otpEnabled ? (
                      <section className="hero is-medium has-background-white-ter">
                        <div className="hero-body">
                          <p className="title is-size-6-mobile">
                            <FontAwesomeIcon
                              className="fas"
                              icon={faCheckCircle}
                            />
                            &nbsp;2FA Enabled
                          </p>
                          <p className="subtitle is-size-7-mobile">
                            Your account is secure with two-factor
                            authentication. Next time you login you will be
                            asked to provide a 2FA code from your authenticator
                            app.
                          </p>
                        </div>
                      </section>
                    ) : (
                      <section className="hero is-medium has-background-white-ter">
                        <div className="hero-body">
                          <h1 className="title is-2 is-size-6-mobile">
                            <FontAwesomeIcon
                              className="fas"
                              icon={faTimesCircle}
                            />
                            &nbsp;2FA Disabled
                          </h1>
                          <p className="subtitle is-size-7-mobile">
                            Your account does not have 2FA enabled.{" "}
                            <b>
                              <Link to="/account/2fa/setup/step-1">
                                Click here&nbsp;
                                <FontAwesomeIcon
                                  className="mdi"
                                  icon={faArrowRight}
                                />
                              </Link>
                            </b>{" "}
                            to get started adding 2FA to your account.
                          </p>
                        </div>
                      </section>
                    )}

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-medium is-fullwidth-mobile"
                          to={generateBreadcrumbItemLink(currentUser)}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Dashboard
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        {currentUser.otpEnabled ? (
                          <button
                            className="button is-medium is-danger is-fullwidth-mobile"
                            disabled={currentUser.status === 2}
                            onClick={(e) => {
                              setShowDisableOTPWarning(true);
                            }}
                          >
                            <FontAwesomeIcon className="fas" icon={faUnlock} />
                            &nbsp;Disable 2FA
                          </button>
                        ) : (
                          <Link
                            className="button is-medium is-success is-fullwidth-mobile"
                            disabled={currentUser.status === 2}
                            to="/account/2fa/setup/step-1"
                          >
                            <FontAwesomeIcon className="fas" icon={faLock} />
                            &nbsp;Enable 2FA
                          </Link>
                        )}
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

export default AccountTwoFactorAuthenticationDetail;
