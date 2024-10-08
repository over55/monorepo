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
  faHardHat,
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
import {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  ASSOCIATE_PHONE_TYPE_WORK,
} from "../../../../Constants/App";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
} from "../../../../Constants/FieldOptions";
import {
  addAssociateState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../../AppState";

function AdminAssociateAddStep3() {
  ////
  //// Global state.
  ////

  const [addAssociate, setAddAssociate] = useRecoilState(addAssociateState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [organizationName, setOrganizationName] = useState(
    addAssociate.organizationName,
  );
  const [organizationType, setOrganizationType] = useState(
    addAssociate.organizationType,
  );
  const [email, setEmail] = useState(addAssociate.email);
  const [phone, setPhone] = useState(addAssociate.phone);
  const [phoneType, setPhoneType] = useState(addAssociate.phoneType);
  const [phoneExtension, setPhoneExtension] = useState(
    addAssociate.phoneExtension,
  );
  const [firstName, setFirstName] = useState(addAssociate.firstName);
  const [lastName, setLastName] = useState(addAssociate.lastName);
  const [otherPhone, setOtherPhone] = useState(addAssociate.otherPhone);
  const [otherPhoneType, setOtherPhoneType] = useState(
    addAssociate.otherPhoneType,
  );
  const [otherPhoneExtension, setOtherPhoneExtension] = useState(
    addAssociate.otherPhoneExtension,
  );
  const [isOkToText, setIsOkToText] = useState(addAssociate.isOkToText);
  const [isOkToEmail, setIsOkToEmail] = useState(addAssociate.isOkToEmail);
  const [country] = useState(addAssociate.country);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (addAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID) {
      if (organizationName === "") {
        newErrors["organizationName"] = "missing value";
        hasErrors = true;
      }
      if (organizationType === 0) {
        newErrors["organizationType"] = "missing value";
        hasErrors = true;
      }
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
    let modifiedAddAssociate = { ...addAssociate };
    modifiedAddAssociate.organizationName = organizationName;
    modifiedAddAssociate.organizationType = organizationType;
    modifiedAddAssociate.firstName = firstName;
    modifiedAddAssociate.lastName = lastName;
    modifiedAddAssociate.email = email;
    modifiedAddAssociate.phone = phone;
    modifiedAddAssociate.phoneType = phoneType;
    modifiedAddAssociate.phoneExtension = phoneExtension;
    modifiedAddAssociate.otherPhone = otherPhone;
    modifiedAddAssociate.otherPhoneType = otherPhoneType;
    modifiedAddAssociate.otherPhoneExtension = otherPhoneExtension;
    modifiedAddAssociate.isOkToText = isOkToText;
    modifiedAddAssociate.isOkToEmail = isOkToEmail;
    setAddAssociate(modifiedAddAssociate);

    // Redirect to the next page.
    setForceURL("/admin/associates/add/step-4");
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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Associates
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faHardHat} />
            &nbsp;Associates
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Associate
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
                  {addAssociate.type === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
                    <>
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
                          ASSOCIATE_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS
                        }
                      />
                    </>
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
                    options={ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                  />

                  {phoneType === ASSOCIATE_PHONE_TYPE_WORK && (
                    <FormInputField
                      label="Phone Extension (Optional)"
                      name="phoneExtension"
                      type="text"
                      placeholder="Text input"
                      value={phoneExtension}
                      errorText={errors && errors.phoneExtension}
                      helpText=""
                      onChange={(e) => setPhoneExtension(e.target.value)}
                      isRequired={true}
                      maxWidth="100px"
                    />
                  )}

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
                    options={ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                  />

                  {otherPhoneType === ASSOCIATE_PHONE_TYPE_WORK && (
                    <FormInputField
                      label="Other Phone Extension (Optional)"
                      name="otherPhoneExtension"
                      type="text"
                      placeholder="Text input"
                      value={otherPhoneExtension}
                      errorText={errors && errors.otherPhoneExtension}
                      helpText=""
                      onChange={(e) => setOtherPhoneExtension(e.target.value)}
                      isRequired={true}
                      maxWidth="100px"
                    />
                  )}

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/associates/add/step-2"
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

export default AdminAssociateAddStep3;
