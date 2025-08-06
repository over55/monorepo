import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faEnvelope,
  faTriangleExclamation,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../Reusable/FormErrorBox";
import { postForgotPasswordAPI } from "../../API/Gateway";
import { topAlertMessageState, topAlertStatusState } from "../../AppState";

function ForgotPassword() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const isUnauthorized = searchParams.get("unauthorized");

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
  const [validation, setValidation] = useState({
    email: false,
  });
  const [email, setEmail] = useState("");
  const [forceURL, setForceURL] = useState("");
  const [wasEmailSent, setWasEmailSent] = useState(false);

  ////
  //// API.
  ////

  function onForgotPasswordSuccess() {
    console.log("onForgotPasswordSuccess: Starting...");

    setTopAlertMessage("Email sent");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onOrganizationUpdateSuccess: Delayed for 2 seconds.");
      console.log(
        "onOrganizationUpdateSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    setWasEmailSent(true);
  }

  function onForgotPasswordError(apiErr) {
    console.log("onForgotPasswordError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onForgotPasswordDone() {
    console.log("onForgotPasswordDone: Starting...");
  }

  ////
  //// Event handling.
  ////

  function onEmailChange(e) {
    setEmail(e.target.value);
    validation["email"] = false;
    setValidation(validation);
    // setErrors(errors["email"]="");
  }

  function onButtonClick(e) {
    var newErrors = {};
    var newValidation = {};
    if (email === undefined || email === null || email === "") {
      newErrors["email"] = "value is missing";
    } else {
      newValidation["email"] = true;
    }

    /// Save to state.
    setErrors(newErrors);
    setValidation(newValidation);

    if (Object.keys(newErrors).length > 0) {
      //
      // Handle errors.
      //

      console.log("failed validation");

      // window.scrollTo(0, 0);  // Start the page at the top of the page.

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();
    } else {
      //
      // Submit to server.
      //

      console.log("successful validation, submitting to API server.");
      postForgotPasswordAPI(
        email,
        onForgotPasswordSuccess,
        onForgotPasswordError,
        onForgotPasswordDone,
      );
    }
  }

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
    }

    return () => (mounted = false);
  }, []);

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  ////
  //// Component rendering.
  ////

  return (
    <>
      <div className="column is-12 container">
        <div className="section">
          <section className="hero is-fullheight">
            <div className="hero-body">
              <div className="container">
                <div className="columns is-centered">
                  <div className="column is-half-tablet is-one-third-widescreen">
                    <div className="box is-rounded">
                      {/* Start Logo */}
                      <nav className="level">
                        <div className="level-item has-text-centered">
                          <figure className="image">
                            <img
                              src="/img/workery-logo.jpeg"
                              style={{ width: "256px" }}
                            />
                          </figure>
                        </div>
                      </nav>
                      {/* End Logo */}
                      {!wasEmailSent ? (
                        <>
                          <form>
                            <h1 className="title is-4 has-text-centered">
                              Forgot Password
                            </h1>
                            <p className="has-text-grey pb-5">
                              Please enter your email and we will send you a
                              password reset email.
                            </p>
                            {isUnauthorized === "true" && (
                              <article className="message is-danger">
                                <div className="message-body">
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faTriangleExclamation}
                                  />
                                  &nbsp;Your session has ended.
                                  <br />
                                  Please login again
                                </div>
                              </article>
                            )}
                            <FormErrorBox errors={errors} />

                            <div className="field">
                              <label className="label is-small has-text-grey-light">
                                Email
                              </label>
                              <div className="control has-icons-left has-icons-right">
                                <input
                                  className={`input ${errors && errors.email && "is-danger"} ${validation && validation.email && "is-success"}`}
                                  type="email"
                                  placeholder="Email"
                                  value={email}
                                  onChange={onEmailChange}
                                />
                                <span className="icon is-small is-left">
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faEnvelope}
                                  />
                                </span>
                              </div>
                              {errors && errors.email && (
                                <p className="help is-danger">{errors.email}</p>
                              )}
                            </div>

                            <br />
                            <button
                              className="button is-medium is-block is-fullwidth is-primary"
                              type="button"
                              onClick={onButtonClick}
                              style={{ backgroundColor: "#FF0000" }}
                            >
                              Submit <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                          </form>
                          <br />
                        </>
                      ) : (
                        <article className="message is-success">
                          <div className="message-body">
                            <h1 className="is-size-4">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              &nbsp;<b>Email Sent</b>
                            </h1>
                            <p>
                              The password reset email has been sent to your
                              inbox. Please check and follow the instructions in
                              the email.
                            </p>
                            <br />
                            <p>
                              Didn't receive the email?{" "}
                              <a onClick={(e) => onButtonClick()}>Click here</a>{" "}
                              to resend again
                            </p>
                          </div>
                        </article>
                      )}
                      <nav className="level">
                        <div className="level-item has-text-centered">
                          <div>
                            <Link to="/login" className="is-size-7-tablet">
                              <FontAwesomeIcon icon={faArrowLeft} />
                              &nbsp;Back
                            </Link>
                          </div>
                        </div>
                      </nav>
                    </div>
                    {/* End box */}

                    <div className="has-text-centered">
                      <p>© 2024 Over 55 (London) Inc.</p>
                    </div>
                    {/* End suppoert text. */}
                  </div>
                  {/* End Column */}
                </div>
              </div>
              {/* End container */}
            </div>
            {/* End hero-body */}
          </section>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
