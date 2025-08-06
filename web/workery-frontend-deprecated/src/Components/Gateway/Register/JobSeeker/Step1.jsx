import React, { useState, useEffect } from "react";
import { Link, useSearchParams, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faCheckCircle,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormPhoneField from "../../../Reusable/FormPhoneField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  registerJobSeekerState,
} from "../../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../Constants/FieldOptions";

function RegisterJobSeekerStep1() {
  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [registerJobSeeker, setRegisterJobSeeker] = useRecoilState(
    registerJobSeekerState,
  );

  ////
  //// Component states.
  ////

  // Page States
  const [forceURL, setForceURL] = useState("");
  const [errors, setErrors] = useState({});

  // Form States
  const [firstName, setFirstName] = useState(registerJobSeekerState.firstName);
  const [lastName, setLastName] = useState(registerJobSeekerState.lastName);
  const [email, setEmail] = useState(registerJobSeekerState.email);
  const [phone, setPhone] = useState(registerJobSeekerState.phone);
  const [phoneType, setPhoneType] = useState(registerJobSeekerState.phoneType);
  const [otherPhone, setOtherPhone] = useState(
    registerJobSeekerState.otherPhone,
  );
  const [otherPhoneType, setOtherPhoneType] = useState(
    registerJobSeekerState.otherPhoneType,
  );
  const [isOkToText, setIsOkToText] = useState(
    registerJobSeekerState.isOkToText,
  );
  const [isOkToEmail, setIsOkToEmail] = useState(
    registerJobSeekerState.isOkToEmail,
  );
  const [country] = useState(registerJobSeekerState.country);
  const [password, setPassword] = useState(registerJobSeekerState.password);
  const [passwordRepeated, setPasswordRepeated] = useState(
    registerJobSeekerState.passwordRepeated,
  );

  ////
  //// Event handling.
  ////

  const onSubmit = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    // if (addAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
    //     if (organizationName === "") {
    //         newErrors["organizationName"] = "missing value";
    //         hasErrors = true;
    //     }
    //     if (organizationType === 0) {
    //         newErrors["organizationType"] = "missing value";
    //         hasErrors = true;
    //     }
    // }
    if (firstName === "") {
      newErrors["firstName"] = "missing value";
      hasErrors = true;
    }
    if (lastName === "") {
      newErrors["lastName"] = "missing value";
      hasErrors = true;
    }
    if (email === "") {
      newErrors["email"] = "missing value";
      hasErrors = true;
    }
    if (phone === "") {
      newErrors["phone"] = "missing value";
      hasErrors = true;
    }
    if (phoneType === 0) {
      newErrors["phoneType"] = "missing value";
      hasErrors = true;
    }

    if (hasErrors) {
      // Set the associate based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      return;
    }

    // Save to persistent storage.
    let jobSeeker = { ...registerJobSeekerState };
    jobSeeker.firstName = firstName;
    jobSeeker.lastName = lastName;
    jobSeeker.email = email;
    jobSeeker.phone = phone;
    jobSeeker.phoneType = phoneType;
    jobSeeker.otherPhone = otherPhone;
    jobSeeker.otherPhoneType = otherPhoneType;
    jobSeeker.isOkToText = isOkToText;
    jobSeeker.isOkToEmail = isOkToEmail;
    setRegisterJobSeeker(jobSeeker);

    // Redirect to the next page.
    setForceURL("/register-step-3-job-seeker");
  };

  ////
  //// Misc.
  ////

  // Do nothing.

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
            <div class="hero-body">
              <div class="container">
                <div class="columns is-centered">
                  <div class="is-half-tablet">
                    {/* Progress Wizard */}
                    <nav className="box has-background-light">
                      <p className="subtitle is-5">Step 1 of 7</p>
                      <progress
                        class="progress is-success"
                        value="29"
                        max="100"
                      >
                        29%
                      </progress>
                    </nav>

                    <div class="box is-rounded column">
                      <form>
                        <h1 className="title is-3 has-text-centered">
                          Register as Job Seeker
                        </h1>
                        <FormErrorBox errors={errors} />
                        <p class="has-text-grey-light">
                          Please fill out the following form to become
                          registered as an <b>job seeker</b>. All the fields
                          below are manditory.
                        </p>
                        <p>&nbsp;</p>

                        <FormInputField
                          label="First Name"
                          name="firstName"
                          placeholder="Text input"
                          value={firstName}
                          errorText={errors && errors.firstName}
                          helpText=""
                          onChange={(e) => setFirstName(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Last Name"
                          name="lastName"
                          placeholder="Text input"
                          value={lastName}
                          errorText={errors && errors.lastName}
                          helpText=""
                          onChange={(e) => setLastName(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Email"
                          name="email"
                          type="email"
                          placeholder="Text input"
                          value={email}
                          errorText={errors && errors.email}
                          helpText=""
                          onChange={(e) => setEmail(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormCheckboxField
                          label="I agree to receive electronic email"
                          name="isOkToEmail"
                          checked={isOkToEmail}
                          errorText={errors && errors.isOkToEmail}
                          onChange={(e, x) => setIsOkToEmail(!isOkToEmail)}
                          maxWidth="180px"
                        />

                        <FormPhoneField
                          label="Phone"
                          name="phone"
                          placeholder="Text input"
                          selectedCountry={country}
                          selectePhoneNumber={phone}
                          errorText={errors && errors.phone}
                          helpText=""
                          onChange={(ph) => setPhone(ph)}
                          isRequired={true}
                          maxWidth="200px"
                        />

                        <FormSelectField
                          label="Phone Type"
                          name="phoneType"
                          placeholder="Pick"
                          selectedValue={phoneType}
                          errorText={errors && errors.phoneType}
                          helpText=""
                          onChange={(e) =>
                            setPhoneType(parseInt(e.target.value))
                          }
                          options={
                            ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                          }
                        />

                        <FormCheckboxField
                          label="I agree to receive texts to my phone"
                          name="isOkToText"
                          checked={isOkToText}
                          errorText={errors && errors.setIsOkToText}
                          onChange={(e, x) => setIsOkToText(!isOkToText)}
                          maxWidth="180px"
                        />

                        <FormPhoneField
                          label="Other Phone (Optional)"
                          name="otherPhone"
                          placeholder="Text input"
                          selectedCountry={country}
                          selectePhoneNumber={otherPhone}
                          errorText={errors && errors.otherPhone}
                          helpText=""
                          onChange={(ph) => setOtherPhone(ph)}
                          isRequired={true}
                          maxWidth="200px"
                        />

                        <FormSelectField
                          label="Other Phone Type (Optional)"
                          name="otherPhoneType"
                          placeholder="Pick"
                          selectedValue={otherPhoneType}
                          errorText={errors && errors.phootherPhoneTypeneType}
                          helpText=""
                          onChange={(e) =>
                            setOtherPhoneType(parseInt(e.target.value))
                          }
                          options={
                            ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS
                          }
                        />

                        <nav class="level">
                          <div class="level-left">
                            <div class="level-item">
                              <Link class="button is-link" to="/register">
                                <FontAwesomeIcon icon={faArrowLeft} />
                                &nbsp;Back
                              </Link>
                            </div>
                          </div>
                          <div class="level-right">
                            <div class="level-item">
                              <button
                                type="button"
                                class="button is-primary"
                                onClick={onSubmit}
                              >
                                <FontAwesomeIcon icon={faCheckCircle} />
                                &nbsp;Submit
                              </button>
                            </div>
                          </div>
                        </nav>
                      </form>
                    </div>
                  </div>
                  {/* End box */}
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

export default RegisterJobSeekerStep1;
