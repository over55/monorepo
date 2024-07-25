import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingUser,
  faKey,
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
  getAccountDetailAPI,
  putAccountChangePasswordAPI,
} from "../../../../../API/Account";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../Reusable/FormInputField";
import FormSelectField from "../../../../Reusable/FormSelectField";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../../AppState";
import { CLIENT_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS } from "../../../../../Constants/FieldOptions";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../../../Constants/App";

function AccountMoreOperationChangePassword() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordRepeated, setNewPasswordRepeated] = useState("");
  const [oldPassword, setOldPassword] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    setErrors({});
    setFetching(true);
    putAccountChangePasswordAPI(
      {
        new_password: newPassword,
        new_password_repeated: newPasswordRepeated,
        old_password: oldPassword,
      },
      onChangePasswordSuccess,
      onChangePasswordError,
      onChangePasswordDone,
      onUnauthorized,
    );
  };

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
        dashboardLink = "/dashboard";
        break;
      default:
        dashboardLink = "/501"; // Default or error handling
        break;
    }
    return dashboardLink;
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onAccountDetailSuccess(response) {
    console.log("onAccountDetailSuccess: Starting...");
    setCurrentUser(response);
  }

  function onAccountDetailError(apiErr) {
    console.log("onAccountDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAccountDetailDone() {
    console.log("onAccountDetailDone: Starting...");
    setFetching(false);
  }

  // --- ChangePassword --- //

  function onChangePasswordSuccess(response) {
    console.log("onChangePasswordSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Password changed");
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

    setForceURL("/account/more");
  }

  function onChangePasswordError(apiErr) {
    console.log("onChangePasswordError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onChangePasswordDone() {
    console.log("onChangePasswordDone: Starting...");
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
                <Link
                  to={generateBreadcrumbItemLink(currentUser)}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li>
                <Link to={`/account/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Profile (More)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faKey} />
                  &nbsp;Change Password
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
                <Link to={`/account/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Profile (More)
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {currentUser && currentUser.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

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
                    <FontAwesomeIcon className="fas" icon={faKey} />
                    &nbsp;Change Password
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

                {currentUser && (
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
                          You are about to <b>change the password</b> for your
                          account. Please make sure you enter it correctly or
                          else you'll be locked out of your account and
                          requiring password reseting. Are you sure you want to
                          continue?
                        </p>
                      </div>
                    </article>

                    <FormInputField
                      label="New Password"
                      name="newPassword"
                      placeholder="Password input"
                      value={newPassword}
                      errorText={errors && errors.newPassword}
                      helpText=""
                      onChange={(e) => setNewPassword(e.target.value)}
                      isRequired={true}
                      maxWidth="380px"
                      type="password"
                    />

                    <FormInputField
                      label="New Password Repeated"
                      name="newPasswordRepeated"
                      placeholder="Password input again"
                      value={newPasswordRepeated}
                      errorText={errors && errors.newPasswordRepeated}
                      helpText=""
                      onChange={(e) => setNewPasswordRepeated(e.target.value)}
                      isRequired={true}
                      maxWidth="380px"
                      type="password"
                    />

                    <FormInputField
                      label="Old Password"
                      name="oldPassword"
                      placeholder="Password input"
                      value={oldPassword}
                      errorText={errors && errors.oldPassword}
                      helpText=""
                      onChange={(e) => setOldPassword(e.target.value)}
                      isRequired={true}
                      maxWidth="380px"
                      type="password"
                    />

                    {/* Bottom Navigation */}
                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/account/more`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Profile (More)
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
                          &nbsp;Confirm and Submit
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

export default AccountMoreOperationChangePassword;
