import React, { useState, useEffect } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faEnvelope,
  faKey,
  faTriangleExclamation,
  faCheckCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../Reusable/FormErrorBox";
import useLocalStorage from "../../Hooks/useLocalStorage";
import { postLoginAPI } from "../../API/Gateway";
import {
  onHamburgerClickedState,
  currentUserState,
  currentUserIsInactiveState,
} from "../../AppState";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
  ASSOCIATE_JOB_SEEKER_ROLE_ID,
  ASSOCIATE_IS_JOB_SEEKER_YES,
  ASSOCIATE_IS_JOB_SEEKER_NO
} from "../../Constants/App";
import LoginDesktop from "./LoginDesktop";
import LoginMobile from "./LoginMobile";

function Login() {
  ////
  //// URL Parameters.
  ////

  const [searchParams] = useSearchParams(); // Special thanks via https://stackoverflow.com/a/65451140
  const isUnauthorized = searchParams.get("unauthorized");

  ////
  //// Global state.
  ////

  const [onHamburgerClicked, setOnHamburgerClicked] = useRecoilState(
    onHamburgerClickedState,
  );
  const [currentUser, setCurrentUser] = useRecoilState(currentUserState);
  const [isInactive, setIsInactive] = useRecoilState(
    currentUserIsInactiveState,
  );

  ////
  //// Component states.
  ////

  // const [errors, setErrors] = useState({
  //     "email": "account does not exist",
  //     "password": "invalid password"
  // });
  const [errors, setErrors] = useState({});
  const [validation, setValidation] = useState({
    email: false,
    password: false,
  });
  const [profile, setProfile] = useLocalStorage("WORKERY_USER_PROFILE");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forceURL, setForceURL] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  ////
  //// API.
  ////

  function onLoginSuccess(response) {
    console.log("onLoginSuccess: Starting...");

    // Save the data to local storage for persistance in this browser and
    // redirect the user to their respected dahsboard.
    setOnHamburgerClicked(false); // Set to `false` so the side menu does not load up on startup of app.
    if (response !== undefined && response !== null && response !== "") {
      // For debugging purposes only.
      console.log("onLoginSuccess | user prefix:", response.user);

      // BUGFIX:
      try {
        response.tenantID = response.tenantId;
        response.roleID = response.roleId;
      } catch (err) {
        console.log("onLoginSuccess | catch err:", err);
      }

      // For debugging purposes only.
      console.log("onLoginSuccess | user postfix:", response.user);

      // Store in persistance storage in the browser.
      setCurrentUser(response.user);

      // Change inactivity.
      console.log("pre-login: isInactive:", isInactive);
      setIsInactive(false);
      console.log("post-login: isInactive: false");

      if (response.user.otpEnabled === false) {
        console.log("onLoginSuccess | redirecting to dashboard");
         console.log("onLoginSuccess | role id:", response.user.role);
        switch (response.user.role) {
          case EXECUTIVE_ROLE_ID:
            setForceURL("/root/tenants");
            break;
          case MANAGEMENT_ROLE_ID:
            setForceURL("/admin/dashboard");
            break;
          case FRONTLINE_ROLE_ID:
            setForceURL("/admin/dashboard");
            break;
          case ASSOCIATE_ROLE_ID:
            setForceURL("/a/dashboard");
            break;
          case ASSOCIATE_JOB_SEEKER_ROLE_ID:
            setForceURL("/js/dashboard");
            break;
          case CUSTOMER_ROLE_ID:
            setForceURL("/c/dashboard");
            break;
          default:
            setForceURL("/501");
            break;
        }
      } else {
        if (response.user.otpVerified === false) {
          console.log("onLoginSuccess | redirecting to 2fa setup wizard");
          setForceURL("/login/2fa/step-1");
        } else {
          console.log("onLoginSuccess | redirecting to 2fa validation");
          setForceURL("/login/2fa");
        }
      }
    }
  }

  function onLoginError(apiErr) {
    console.log("onLoginError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onLoginDone() {
    console.log("onLoginDone: Starting...");
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

  function onPasswordChange(e) {
    setPassword(e.target.value);
    validation["password"] = false;
    setValidation(validation);
    // setErrors(errors["password"]="");
  }

  function onButtonClick(e) {
    var newErrors = {};
    var newValidation = {};
    if (email === undefined || email === null || email === "") {
      newErrors["email"] = "value is missing";
    } else {
      newValidation["email"] = true;
    }
    if (password === undefined || password === null || password === "") {
      newErrors["password"] = "value is missing";
    } else {
      newValidation["password"] = true;
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

      const postData = {
        email: email,
        password: password,
      };
      postLoginAPI(postData, onLoginSuccess, onLoginError, onLoginDone);
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

  ////
  //// Component rendering.
  ////

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

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
                      <>
                        <form>
                          <h1 className="title is-4 has-text-centered">
                            Sign In
                          </h1>
                          {/*<p className="has-text-grey pb-5">
                            Please enter your email and we will send you a
                            password reset email.
                          </p>*/}
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
                                <FontAwesomeIcon className="fas" icon={faKey} />
                              </span>
                            </div>
                            {errors && errors.password && (
                              <p className="help is-danger">
                                {errors.password}
                              </p>
                            )}
                          </div>

                          <br />
                          <button
                            className="button is-medium is-block is-fullwidth is-primary"
                            type="button"
                            onClick={onButtonClick}
                          >
                            Submit <FontAwesomeIcon icon={faArrowRight} />
                          </button>
                        </form>
                        <br />
                      </>
                      <nav className="level">
                        <div className="level-item has-text-centered">
                          <div>
                            <Link
                              to="/forgot-password"
                              className="is-size-7-tablet"
                            >
                              Forgot Password
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

export default Login;
