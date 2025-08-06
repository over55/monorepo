import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserCircle,
  faGraduationCap,
  faCogs,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserTie,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faBalanceScale,
  faUserFriends,
  faServer,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import deepClone from "../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../Helpers/datetimeUtility";
import { putAccountUpdateAPI, getAccountDetailAPI } from "../../../API/Account";
import AlertBanner from "../../Reusable/EveryPage/AlertBanner";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormRadioField from "../../Reusable/FormRadioField";
import FormInputField from "../../Reusable/FormInputField";
import FormTextareaField from "../../Reusable/FormTextareaField";
import FormSelectField from "../../Reusable/FormSelectField";
import FormCheckboxField from "../../Reusable/FormCheckboxField";
import FormCountryField from "../../Reusable/FormCountryField";
import FormRegionField from "../../Reusable/FormRegionField";
import FormMultiSelectField from "../../Reusable/FormMultiSelectField";
import FormMultiSelectFieldForSkillSets from "../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForInsuranceRequirement from "../../Reusable/FormMultiSelectFieldForInsuranceRequirement";
import FormMultiSelectFieldForVehicleType from "../../Reusable/FormMultiSelectFieldForVehicleType";
import FormMultiSelectFieldForTags from "../../Reusable/FormMultiSelectFieldForTags";
import FormSelectFieldForServiceFee from "../../Reusable/FormSelectFieldForServiceFee";
import FormSelectFieldForHowHearAboutUsItem from "../../Reusable/FormSelectFieldForHowHear";
import FormAlternateDateField from "../../Reusable/FormAlternateDateField";
import FormPhoneField from "../../Reusable/FormPhoneField";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
} from "../../../Constants/App";
import {
  addStaffState,
  ADD_ASSOCIATE_STATE_DEFAULT,
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
} from "../../../Constants/FieldOptions";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../Constants/App";

function AccountExecutiveStaffUpdate({ currentUser, setCurrentUser }) {
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

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    let payload = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      city: city,
      region: region,
      country: country,
    };
    console.log("onSubmitClick: payload:", payload);

    setFetching(true);
    setErrors({});
    putAccountUpdateAPI(payload, onSuccess, onError, onDone);
  };

  ////
  //// API.
  ////

  // --- Update --- //

  function onSuccess(response) {
    // For debugging purposes only.
    console.log("onSuccess: Starting...");
    console.log(response);

    if (response === undefined || response === null || response === "") {
      console.log("onSuccess: exiting early");
      return;
    }

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Account update");
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

    // Redirect the user to a new page.
    setForceURL("/account");
  }

  function onError(apiErr) {
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    setFetching(false);
  }

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setPhoneType(currentUser.phoneType);
      setFirstName(currentUser.firstName);
      setLastName(currentUser.lastName);
      setCity(currentUser.city);
      setRegion(currentUser.region);
      try {
        setCountry(currentUser.country);
      } catch (error) {
        console.log(error);
      }
    }

    return () => {
      mounted = false;
    };
  }, [currentUser]);

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
                <Link to={`/admin/dashboard`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link aria-current="page" to={`/account`}>
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Profile
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPencil} />
                  &nbsp;Edit
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
                <Link to={`/account`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Profile
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
            <FontAwesomeIcon className="fas" icon={faPencil} />
            &nbsp;Edit
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                {/* Title + Options */}
                {currentUser && (
                  <div className="columns">
                    <div className="column">
                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faPencil} />
                        &nbsp;Edit Profile
                      </p>
                      <p className="has-text-grey pb-4">
                        Please fill out all the required fields before
                        submitting this form.
                      </p>
                    </div>
                    <div className="column has-text-right"></div>
                  </div>
                )}

                <FormErrorBox errors={errors} />

                {currentUser && (
                  <div className="container">
                    <p className="title is-5">
                      <FontAwesomeIcon className="fas" icon={faIdCard} />
                      &nbsp;Contact
                    </p>

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

                    <p className="title is-5">
                      <FontAwesomeIcon className="fas" icon={faAddressBook} />
                      &nbsp;Address
                    </p>
                    <FormCountryField
                      priorityOptions={["CA", "US", "MX"]}
                      label="Country"
                      name="country"
                      placeholder="Text input"
                      selectedCountry={country}
                      errorText={errors && errors.country}
                      helpText=""
                      onChange={(value) => setCountry(value)}
                      isRequired={true}
                      maxWidth="160px"
                    />

                    <FormRegionField
                      label="Province/Territory"
                      name="region"
                      placeholder="Text input"
                      selectedCountry={country}
                      selectedRegion={region}
                      errorText={errors && errors.region}
                      helpText=""
                      onChange={(value) => setRegion(value)}
                      isRequired={true}
                      maxWidth="280px"
                    />

                    <FormInputField
                      label="City"
                      name="city"
                      placeholder="Text input"
                      value={city}
                      errorText={errors && errors.city}
                      helpText=""
                      onChange={(e) => setCity(e.target.value)}
                      isRequired={true}
                      maxWidth="380px"
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/account`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Profile
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-success is-fullwidth-mobile"
                          disabled={isFetching}
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                            type="button"
                          />
                          &nbsp;{isFetching ? `Submitting...` : `Save`}
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

export default AccountExecutiveStaffUpdate;
