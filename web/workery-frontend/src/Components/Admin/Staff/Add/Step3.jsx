import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faUserTie,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
  faArrowRight,
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
import { STAFF_TYPE_MANAGEMENT } from "../../../../Constants/App";
import {
  STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  STAFF_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../Constants/FieldOptions";
import { addStaffState, ADD_STAFF_STATE_DEFAULT } from "../../../../AppState";

function AdminStaffAddStep3() {
  ////
  //// Global state.
  ////

  const [addStaff, setAddStaff] = useRecoilState(addStaffState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [email, setEmail] = useState(addStaff.email);
  const [phone, setPhone] = useState(addStaff.phone);
  const [phoneType, setPhoneType] = useState(addStaff.phoneType);
  const [firstName, setFirstName] = useState(addStaff.firstName);
  const [lastName, setLastName] = useState(addStaff.lastName);
  const [otherPhone, setOtherPhone] = useState(addStaff.otherPhone);
  const [otherPhoneType, setOtherPhoneType] = useState(addStaff.otherPhoneType);
  const [isOkToText, setIsOkToText] = useState(addStaff.isOkToText);
  const [isOkToEmail, setIsOkToEmail] = useState(addStaff.isOkToEmail);
  const [country] = useState(addStaff.country);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (addStaff.type === STAFF_TYPE_MANAGEMENT) {
      // Do nothing...
    }
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
      // Set the staff based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      return;
    }

    // Save to persistent storage.
    let modifiedAddStaff = { ...addStaff };
    modifiedAddStaff.firstName = firstName;
    modifiedAddStaff.lastName = lastName;
    modifiedAddStaff.email = email;
    modifiedAddStaff.phone = phone;
    modifiedAddStaff.phoneType = phoneType;
    modifiedAddStaff.otherPhone = otherPhone;
    modifiedAddStaff.otherPhoneType = otherPhoneType;
    modifiedAddStaff.isOkToText = isOkToText;
    modifiedAddStaff.isOkToEmail = isOkToEmail;
    setAddStaff(modifiedAddStaff);

    // Redirect to the next page.
    setForceURL("/admin/staff/add/step-4");
  };

  ////
  //// API.
  ////

  // Do nothing...

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(false);
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
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/admin/staff" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserTie} />
                  &nbsp;Staff
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPlus} />
                  &nbsp;New
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
                <Link to="/admin/staff" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Staff
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Staff
          </h4>
          <hr />

          {/* Progress Wizard */}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 3 of 7</p>
            <progress class="progress is-success" value="43" max="100">
              43%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faIdCard} />
              &nbsp;Contact
            </p>

            <p className="has-text-grey pb-4">
              Please fill out all the required fields before submitting this
              form.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  {addStaff.type === STAFF_TYPE_MANAGEMENT && (
                    <>{/* Do nothing */}</>
                  )}

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
                    onChange={(e) => setPhoneType(parseInt(e.target.value))}
                    options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
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
                    options={STAFF_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/staff/add/step-2"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSubmitClick}
                      >
                        Next&nbsp;
                        <FontAwesomeIcon className="fas" icon={faArrowRight} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminStaffAddStep3;
