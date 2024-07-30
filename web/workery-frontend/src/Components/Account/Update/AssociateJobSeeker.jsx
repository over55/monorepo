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
  faCircleExclamation
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
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
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


function AssociateJobSeekerUpdate({
  currentUser,
  setCurrentUser,
}) {
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

  // Step 4
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [phoneType, setPhoneType] = useState(currentUser.phoneType);
  const [firstName, setFirstName] = useState(currentUser.firstName);
  const [lastName, setLastName] = useState(currentUser.lastName);
  const [otherPhone, setOtherPhone] = useState(currentUser.otherPhone);
  const [otherPhoneType, setOtherPhoneType] = useState(currentUser.otherPhoneType);
  const [isOkToText, setIsOkToText] = useState(currentUser.isOkToText);
  const [isOkToEmail, setIsOkToEmail] = useState(currentUser.isOkToEmail);

  // Step 5
  const [postalCode, setPostalCode] = useState(currentUser.postalCode);
  const [addressLine1, setAddressLine1] = useState(currentUser.addressLine1);
  const [addressLine2, setAddressLine2] = useState(currentUser.addressLine2);
  const [city, setCity] = useState(currentUser.city);
  const [region, setRegion] = useState(currentUser.region);
  const [country, setCountry] = useState(currentUser.country);
  const [hasShippingAddress, setHasShippingAddress] = useState(currentUser.hasShippingAddress);
  const [shippingName, setShippingName] = useState(currentUser.shippingName);
  const [shippingPhone, setShippingPhone] = useState(currentUser.shippingPhone);
  const [shippingCountry, setShippingCountry] = useState(currentUser.shippingCountry);
  const [shippingRegion, setShippingRegion] = useState(currentUser.shippingRegion);
  const [shippingCity, setShippingCity] = useState(currentUser.shippingCity);
  const [shippingAddressLine1, setShippingAddressLine1] = useState(currentUser.shippingAddressLine1);
  const [shippingAddressLine2, setShippingAddressLine2] = useState(currentUser.shippingAddressLine2);
  const [shippingPostalCode, setShippingPostalCode] = useState(currentUser.shippingPostalCode);

  // Step 6
  const [limitSpecial, setLimitSpecial] = useState(currentUser.limitSpecial);
  const [policeCheck, setPoliceCheck] = useState(currentUser.policeCheck);
  const [driversLicenseClass, setDriversLicenseClass] = useState(currentUser.driversLicenseClass);
  const [vehicleTypes, setVehicleTypes] = useState([]); //TODO
  const [emergencyContactName, setEmergencyContactName] = useState(currentUser.emergencyContactName);
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState(currentUser.emergencyContactRelationship);
  const [emergencyContactTelephone, setEmergencyContactTelephone] =
    useState(currentUser.emergencyContactTelephone);
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState(currentUser.emergencyContactAlternativeTelephone);
  const [description, setDescription] = useState(currentUser.description);
  const [preferredLanguage, setPreferredLanguage] = useState(currentUser.preferredLanguage);

  // Step 7
  const [tags, setTags] = useState([]); //TODO
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState(currentUser.howDidYouHearAboutUsId);
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(false); //TODO
  const [howDidYouHearAboutUsOther, setHowHearAboutUsItemOther] = useState(currentUser.howDidYouHearAboutUsOther);
  const [birthDate, setBirthDate] = useState(currentUser.birthDate);
  const [joinDate, setJoinDate] = useState(currentUser.joinDate);
  const [gender, setGender] = useState(currentUser.gender);
  const [genderOther, setGenderOther] = useState(currentUser.genderOther);
  const [identifyAs, setIdentifyAs] = useState([]); //TODO

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
      phoneType: phoneType,
      otherPhone: otherPhone,
      otherPhoneType: otherPhoneType,
      isOkToText: isOkToText,
      isOkToEmail: isOkToEmail,
      postalCode: postalCode,
      addressLine1: addressLine1,
      addressLine2: addressLine2,
      city: city,
      region: region,
      country: country,
      hasShippingAddress: hasShippingAddress,
      shippingName: shippingName,
      shippingPhone: shippingPhone,
      shippingCountry: shippingCountry,
      shippingRegion: shippingRegion,
      shippingCity: shippingCity,
      shippingAddressLine1: shippingAddressLine1,
      shippingAddressLine2: shippingAddressLine2,
      shippingPostalCode: shippingPostalCode,
      limitSpecial: limitSpecial,
      policeCheck: policeCheck,
      driversLicenseClass: driversLicenseClass,
      vehicleTypes: vehicleTypes,
      emergencyContactName: emergencyContactName,
      emergencyContactRelationship: emergencyContactRelationship,
      emergencyContactTelephone: emergencyContactTelephone,
      emergencyContactAlternativeTelephone:
        emergencyContactAlternativeTelephone,
      description: description,
      tags: tags,
      gender: gender,
      genderOther: genderOther,
      joinDate: joinDate,
      birthDate: birthDate,
      howDidYouHearAboutUsId: howDidYouHearAboutUsID,
      isHowDidYouHearAboutUsOther: isHowDidYouHearAboutUsOther,
      howDidYouHearAboutUsOther: howDidYouHearAboutUsOther,
      preferredLanguage: preferredLanguage,
      identifyAs: identifyAs,
    };

    // Apply the following fixes to our payload.

    // Fix 2: birthDate
    if (payload.birthDate) {
      if (!isISODate(payload.birthDate)) {
        const birthDateObject = new Date(payload.birthDate);
        const birthDateISOString = birthDateObject.toISOString();
        payload.birthDate = birthDateISOString;
      }
    }

    // Fix 5: joinDate
    if (payload.duesDate) {
      if (!isISODate(payload.duesDate)) {
        const joinDateObject = new Date(payload.joinDate);
        const joinDateISOString = joinDateObject.toISOString();
        payload.joinDate = joinDateISOString;
      }
    }

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
                <Link to={`/a/dashboard`} aria-current="page">
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
                    </div>
                    <div className="column has-text-right"></div>
                  </div>
                )}

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
                          If you want to make any changes to your profile then <b>please contact us</b> via email at <EmailTextFormatter value={`info@o55.ca`} />.
                        </p>
                      </div>
                    </article>

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
                        {/*
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
                        */}
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

export default AssociateJobSeekerUpdate;
