import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useRecoilState } from "recoil";
import { useLocation } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCircleInfo,
  faCircleCheck,
  faClose,
  faCheck,
  faCircleExclamation,
  faArrowRight,
  faExclamation,
  faSignOut,
} from "@fortawesome/free-solid-svg-icons";
import { currentUserIsInactiveState } from "../../AppState";
import { Link } from "react-scroll";

/**
  The purpose of this component is to intercept anonymous users at our
  application URLs which require authorization.
 */
function AutoLogoutAfterInactivityRedirector() {
  ////
  //// Global state.
  ////

  // Note: By using `Recoil` to manage the isInactive state, any changes to
  // `isInactive` in one component will automatically trigger updates in all
  // components that use it. This ensures that the modal will update in
  // the background when `isInactive` changes, regardless of which page
  // caused the change.
  const [isInactive, setIsInactive] = useRecoilState(
    currentUserIsInactiveState,
  );

  ////
  //// Logic
  ////

  useEffect(() => {
    if (isInactive === false) {
      const countdownTimeout = setTimeout(
        () => {
          setIsInactive(true);
        },
        60 * 60 * 1000,
      ); // 60 minutes in milliseconds

      // Clean up the timeout to prevent memory leaks
      return () => clearTimeout(countdownTimeout);
    }

    // Empty dependency array ensures useEffect runs only once on component mount
  }, [isInactive]);

  // CASE 1 OF 3:
  // ------------
  // Get the current location and if we are at specific URL paths then we
  // will not render this component.
  const ignorePathsArr = [
    "/",
    "/register",
    "/register-successful",
    "/index",
    "/login",
    "/login/2fa",
    "/login/2fa/step-1",
    "/login/2fa/step-2",
    "/login/2fa/step-3",
    "/login/2fa/step-3/backup-code",
    "/login/2fa/backup-code",
    "/login/2fa/backup-code-recovery",
    "/logout",
    "/verify",
    "/forgot-password",
    "/password-reset",
    "/root/dashboard",
    "/root/tenants",
    "/root/tenant",
    "/terms",
    "/privacy",
  ];
  const location = useLocation();
  var arrayLength = ignorePathsArr.length;
  for (var i = 0; i < arrayLength; i++) {
    // console.log(location.pathname, "===", ignorePathsArr[i], " EQUALS ", location.pathname === ignorePathsArr[i]); // For debugging purposes only.
    if (location.pathname === ignorePathsArr[i]) {
      console.log("skipping applying auto logout after inactivity redirector");
      return null;
    }
  }

  // CASE 2 OF 3:
  // ------------
  // Lock window if the user is inactive
  if (isInactive) {
    console.log("detected inactivity, rendering modal");
    return (
      <div class={`modal is-active`}>
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              <FontAwesomeIcon className="mdi" icon={faCircleExclamation} />
              &nbsp;Session Expired
            </p>
          </header>
          <section class="modal-card-body">
            <section className="hero is-medium has-background-white">
              <div className="hero-body">
                <p className="title">
                  <FontAwesomeIcon className="fas" icon={faSignOut} />
                  &nbsp;You have been signed off
                </p>
                <p className="subtitle">
                  Workery has detected inactivity for 30 minutes or more in your
                  session, to help protect the user's data in the systen, you
                  have been automatically logged off. Please&nbsp;
                  <b>
                    <a href="/logout">
                      click here&nbsp;
                      <FontAwesomeIcon className="mdi" icon={faArrowRight} />
                    </a>
                  </b>{" "}
                  to log back into the system.
                </p>
              </div>
            </section>
          </section>
          <footer class="modal-card-foot">
            <a class="button" href={`/logout`}>
              Login Again&nbsp;
              <FontAwesomeIcon className="mdi" icon={faArrowRight} />
            </a>
          </footer>
        </div>
      </div>
    );
  } else {
    // CASE 3 OF 3:
    // ------------
    // Do nothing.
    return null;
  }
}

export default AutoLogoutAfterInactivityRedirector;
