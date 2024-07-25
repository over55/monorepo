import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faEnvelope,
  faKey,
  faTriangleExclamation,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../Reusable/FormErrorBox";
import useLocalStorage from "../../Hooks/useLocalStorage";
import { postPasswordResetAPI } from "../../API/Gateway";
import { topAlertMessageState, topAlertStatusState } from "../../AppState";

function PasswordReset() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const verificationCode = searchParams.get("q");

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
    password: false,
    passwordRepeated: false,
  });
  const [password, setPassword] = useState("");
  const [passwordRepeated, setPasswordRepeated] = useState("");
  const [forceURL, setForceURL] = useState("");
  const [wasPasswordSent, setWasPasswordSent] = useState(false);

  ////
  //// API.
  ////

  function onPasswordResetSuccess() {
    console.log("onPasswordResetSuccess: Starting...");

    setTopAlertMessage("Pasword successfully reset");
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

    setWasPasswordSent(true);
  }

  function onPasswordResetError(apiErr) {
    console.log("onPasswordResetError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onPasswordResetDone() {
    console.log("onPasswordResetDone: Starting...");
  }

  ////
  //// Event handling.
  ////

  function onPasswordChange(e) {
    setPassword(e.target.value);
    validation["password"] = false;
    setValidation(validation);
    // setErrors(errors["password"]="");
  }

  function onPasswordRepeatedChange(e) {
    setPasswordRepeated(e.target.value);
    validation["passwordRepeated"] = false;
    setValidation(validation);
  }

  function onButtonClick(e) {
    var newErrors = {};
    var newValidation = {};
    if (password === undefined || password === null || password === "") {
      newErrors["password"] = "value is missing";
    } else {
      newValidation["password"] = true;
    }

    if (
      passwordRepeated === undefined ||
      passwordRepeated === null ||
      passwordRepeated === ""
    ) {
      newErrors["passwordRepeated"] = "value is missing";
    } else {
      newValidation["passwordRepeated"] = true;
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
      postPasswordResetAPI(
        verificationCode,
        password,
        passwordRepeated,
        onPasswordResetSuccess,
        onPasswordResetError,
        onPasswordResetDone,
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
                      {!wasPasswordSent ? (
                        <>
                          <form>
                            <h1 className="title is-2 is-size-4-mobile has-text-centered">
                              Password Reset
                            </h1>
                            <p className="has-text-grey pb-5">
                              Please enter a new password.
                            </p>
                            <FormErrorBox errors={errors} />

                            <div className="field">
                              <label className="label is-small has-text-grey-light">
                                Password
                              </label>
                              <div className="control has-icons-left has-icons-right">
                                <input
                                  className={`input ${errors && errors.password && "is-danger"} ${validation && validation.password && "is-success"}`}
                                  type="password"
                                  placeholder="Password"
                                  value={password}
                                  onChange={onPasswordChange}
                                />
                                <span className="icon is-small is-left">
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faKey}
                                  />
                                </span>
                              </div>
                              {errors && errors.password && (
                                <p className="help is-danger">
                                  {errors.password}
                                </p>
                              )}
                            </div>
                            <div className="field">
                              <label className="label is-small has-text-grey-light">
                                Password Repeated
                              </label>
                              <div className="control has-icons-left has-icons-right">
                                <input
                                  className={`input ${errors && errors.passwordRepeated && "is-danger"} ${validation && validation.passwordRepeated && "is-success"}`}
                                  type="password"
                                  placeholder="Password Repeated"
                                  value={passwordRepeated}
                                  onChange={onPasswordRepeatedChange}
                                />
                                <span className="icon is-small is-left">
                                  <FontAwesomeIcon
                                    className="fas"
                                    icon={faKey}
                                  />
                                </span>
                              </div>
                              {errors && errors.passwordRepeated && (
                                <p className="help is-danger">
                                  {errors.passwordRepeated}
                                </p>
                              )}
                            </div>

                            <br />
                            <button
                              className="button is-medium is-block is-fullwidth is-primary"
                              type="button"
                              onClick={onButtonClick}
                              style={{ backgroundColor: "#FF0000" }}
                            >
                              Submit&nbsp;
                              <FontAwesomeIcon icon={faArrowRight} />
                            </button>
                          </form>
                          <br />
                        </>
                      ) : (
                        <article className="message is-success">
                          <div className="message-body">
                            <h1 className="is-size-4">
                              <FontAwesomeIcon icon={faCheckCircle} />
                              &nbsp;<b>Password Set</b>
                            </h1>
                            <p>
                              The new password has been successfully set to your
                              account, you may now log in with this new password
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

export default PasswordReset;
