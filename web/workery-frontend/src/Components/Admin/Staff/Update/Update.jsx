import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

import deepClone from "../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../Helpers/datetimeUtility";
import { getStaffDetailAPI, putStaffUpdateAPI } from "../../../../API/Staff";
import AlertBanner from "../../../Reusable/EveryPage/AlertBanner";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormCountryField from "../../../Reusable/FormCountryField";
import FormRegionField from "../../../Reusable/FormRegionField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormMultiSelectFieldForSkillSets from "../../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForInsuranceRequirement from "../../../Reusable/FormMultiSelectFieldForInsuranceRequirement";
import FormMultiSelectFieldForVehicleType from "../../../Reusable/FormMultiSelectFieldForVehicleType";
import FormMultiSelectFieldForTags from "../../../Reusable/FormMultiSelectFieldForTags";
import FormSelectFieldForServiceFee from "../../../Reusable/FormSelectFieldForServiceFee";
import FormSelectFieldForHowHearAboutUsItem from "../../../Reusable/FormSelectFieldForHowHear";
import FormAlternateDateField from "../../../Reusable/FormAlternateDateField";
import FormPhoneField from "../../../Reusable/FormPhoneField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  COMMERCIAL_ASSOCIATE_TYPE_OF_ID,
  RESIDENTIAL_ASSOCIATE_TYPE_OF_ID,
} from "../../../../Constants/App";
import {
  addStaffState,
  ADD_ASSOCIATE_STATE_DEFAULT,
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import {
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS,
  ASSOCIATE_ORGANIZATION_TYPE_OPTIONS_WITH_EMPTY_OPTIONS,
  GENDER_OPTIONS,
  IDENTIFY_AS_OPTIONS,
} from "../../../../Constants/FieldOptions";

function AdminStaffUpdate() {
  ////
  //// URL Parameters.
  ////

  const { aid } = useParams();

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
  const [staff, setStaff] = useState({});

  // Step 3
  const [staffType, setStaffType] = useState(0);

  // Step 4
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneType, setPhoneType] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [otherPhone, setOtherPhone] = useState("");
  const [otherPhoneType, setOtherPhoneType] = useState(0);
  const [isOkToText, setIsOkToText] = useState(false);
  const [isOkToEmail, setIsOkToEmail] = useState(false);

  // Step 5
  const [postalCode, setPostalCode] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [hasShippingAddress, setHasShippingAddress] = useState(false);
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const [shippingRegion, setShippingRegion] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingPostalCode, setShippingPostalCode] = useState("");

  // Step 6
  const [limitSpecial, setLimitSpecial] = useState("");
  const [policeCheck, setPoliceCheck] = useState("");
  const [driversLicenseClass, setDriversLicenseClass] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyContactRelationship, setEmergencyContactRelationship] =
    useState("");
  const [emergencyContactTelephone, setEmergencyContactTelephone] =
    useState("");
  const [
    emergencyContactAlternativeTelephone,
    setEmergencyContactAlternativeTelephone,
  ] = useState("");
  const [description, setDescription] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");

  // Step 7
  const [tags, setTags] = useState([]);
  const [howDidYouHearAboutUsID, setHowDidYouHearAboutUsID] = useState("");
  const [isHowDidYouHearAboutUsOther, setIsHowDidYouHearAboutUsOther] =
    useState(false);
  const [howDidYouHearAboutUsOther, setHowHearAboutUsItemOther] = useState("");
  const [birthDate, setBirthDate] = useState(null);
  const [joinDate, setJoinDate] = useState(null);
  const [gender, setGender] = useState(0);
  const [genderOther, setGenderOther] = useState("");
  const [identifyAs, setIdentifyAs] = useState([]);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    let payload = {
      id: aid,
      type: staffType,
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
      howDidYouHearAboutUsID: howDidYouHearAboutUsID,
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
    putStaffUpdateAPI(payload, onSuccess, onError, onDone);
  };

  ////
  //// API.
  ////

  // --- Details --- //

  function onDetailSuccess(response) {
    console.log("onDetailSuccess: Starting...");
    setStaff(response);

    // Step 3
    setStaffType(response.type);

    // Step 4
    setEmail(response.email);
    setPhone(response.phone);
    setPhoneType(response.phoneType);
    setFirstName(response.firstName);
    setLastName(response.lastName);
    setOtherPhone(response.otherPhone);
    setOtherPhoneType(response.otherPhoneType);
    setIsOkToText(response.isOkToText);
    setIsOkToEmail(response.isOkToEmail);

    // Step 5
    setPostalCode(response.postalCode);
    setAddressLine1(response.addressLine1);
    setAddressLine2(response.addressLine2);
    setCity(response.city);
    setRegion(response.region);
    setCountry(response.country);
    setHasShippingAddress(response.hasShippingAddress);
    setShippingName(response.shippingName);
    setShippingPhone(response.shippingPhone);
    setShippingCountry(response.shippingCountry);
    setShippingRegion(response.shippingRegion);
    setShippingCity(response.shippingCity);
    setShippingAddressLine1(response.shippingAddressLine1);
    setShippingAddressLine2(response.shippingAddressLine2);
    setShippingPostalCode(response.shippingPostalCode);
    setIdentifyAs(response.identifyAs);

    setLimitSpecial(response.limitSpecial);
    setPoliceCheck(response.policeCheck);
    setDriversLicenseClass(response.driversLicenseClass);

    try {
      if (response.vehicleTypes) {
        const vtIDs = response.vehicleTypes.map(
          (vehicleType) => vehicleType.id,
        );
        setVehicleTypes(vtIDs);
      }
    } catch (e) {
      // Do nothing.
    }

    setEmergencyContactName(response.emergencyContactName);
    setEmergencyContactRelationship(response.emergencyContactRelationship);
    setEmergencyContactTelephone(response.emergencyContactTelephone);
    setEmergencyContactAlternativeTelephone(
      response.emergencyContactAlternativeTelephone,
    );
    setDescription(response.description);
    setPreferredLanguage(response.preferredLanguage);

    try {
      // Step 6
      // (We need to convert into ID strings)
      if (response.tags) {
        let tagIDs = [];
        for (let tag of response.tags) {
          tagIDs.push(tag.id);
        }
        setTags(tagIDs);
      }
    } catch (e) {
      // Do nothing.
    }

    setHowDidYouHearAboutUsID(response.howDidYouHearAboutUsID);
    setIsHowDidYouHearAboutUsOther(
      response.howDidYouHearAboutUsText === "Other",
    );
    setHowHearAboutUsItemOther(response.howDidYouHearAboutUsOther);
    setBirthDate(response.birthDate);
    setJoinDate(response.joinDate);
    setGender(response.gender);
    setGenderOther(response.genderOther);
  }

  function onDetailError(apiErr) {
    console.log("onDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDetailDone() {
    console.log("onDetailDone: Starting...");
    setFetching(false);
  }

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
    setTopAlertMessage("Staff update");
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
    setForceURL("/admin/staff/" + response.id);
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

      setFetching(true);
      getStaffDetailAPI(aid, onDetailSuccess, onDetailError, onDetailDone);
    }

    return () => {
      mounted = false;
    };
  }, [aid]);

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
                  &nbsp;Staffs
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/staff/${aid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPencil} />
                  &nbsp;Update
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
                <Link to={`/admin/staff/${aid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {staff && staff.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserTie} />
            &nbsp;Staff
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
                {staff && (
                  <div className="columns">
                    <div className="column">
                      <p className="title is-4">
                        <FontAwesomeIcon className="fas" icon={faPencil} />
                        &nbsp;Edit Staff
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

                {staff && (
                  <div className="container">
                    <p className="title is-5">
                      <FontAwesomeIcon className="fas" icon={faCogs} />
                      &nbsp;Settings
                    </p>

                    <FormRadioField
                      label="Type"
                      name="type"
                      value={staffType}
                      opt1Value={RESIDENTIAL_ASSOCIATE_TYPE_OF_ID}
                      opt1Label="Residential"
                      opt2Value={COMMERCIAL_ASSOCIATE_TYPE_OF_ID}
                      opt2Label="Business"
                      errorText={errors.text}
                      wasValidated={false}
                      helpText=""
                      onChange={(e) => setStaffType(parseInt(e.target.value))}
                    />

                    <p className="title is-5">
                      <FontAwesomeIcon className="fas" icon={faIdCard} />
                      &nbsp;Contact
                    </p>

                    {staffType === COMMERCIAL_ASSOCIATE_TYPE_OF_ID && (
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

                    <p className="title is-5">
                      <FontAwesomeIcon className="fas" icon={faAddressBook} />
                      &nbsp;Address
                    </p>

                    <FormCheckboxField
                      label="Has shipping address different then billing address"
                      name="hasShippingAddress"
                      checked={hasShippingAddress}
                      errorText={errors && errors.hasShippingAddress}
                      onChange={(e) =>
                        setHasShippingAddress(!hasShippingAddress)
                      }
                      maxWidth="180px"
                    />

                    <div className="columns">
                      <div className="column">
                        <p className="subtitle is-6">
                          {hasShippingAddress ? (
                            <p className="subtitle is-6">Billing Address</p>
                          ) : (
                            <p className="subtitle is-6"></p>
                          )}
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

                        <FormInputField
                          label="Address Line 1"
                          name="addressLine1"
                          placeholder="Text input"
                          value={addressLine1}
                          errorText={errors && errors.addressLine1}
                          helpText=""
                          onChange={(e) => setAddressLine1(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Address Line 2 (Optional)"
                          name="addressLine2"
                          placeholder="Text input"
                          value={addressLine2}
                          errorText={errors && errors.addressLine2}
                          helpText=""
                          onChange={(e) => setAddressLine2(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                        <FormInputField
                          label="Postal Code"
                          name="postalCode"
                          placeholder="Text input"
                          value={postalCode}
                          errorText={errors && errors.postalCode}
                          helpText=""
                          onChange={(e) => setPostalCode(e.target.value)}
                          isRequired={true}
                          maxWidth="100px"
                        />
                      </div>
                      {hasShippingAddress && (
                        <div className="column">
                          <p className="subtitle is-6">Shipping Address</p>

                          <FormInputField
                            label="Name"
                            name="shippingName"
                            placeholder="Text input"
                            value={shippingName}
                            errorText={errors && errors.shippingName}
                            helpText="The name to contact for this shipping address"
                            onChange={(e) => setShippingName(e.target.value)}
                            isRequired={true}
                            maxWidth="350px"
                          />

                          <FormInputField
                            label="Phone"
                            name="shippingPhone"
                            placeholder="Text input"
                            value={shippingPhone}
                            errorText={errors && errors.shippingPhone}
                            helpText="The contact phone number for this shipping address"
                            onChange={(e) => setShippingPhone(e.target.value)}
                            isRequired={true}
                            maxWidth="150px"
                          />

                          <FormCountryField
                            priorityOptions={["CA", "US", "MX"]}
                            label="Country"
                            name="shippingCountry"
                            placeholder="Text input"
                            selectedCountry={shippingCountry}
                            errorText={errors && errors.shippingCountry}
                            helpText=""
                            onChange={(value) => setShippingCountry(value)}
                            isRequired={true}
                            maxWidth="160px"
                          />

                          <FormRegionField
                            label="Province/Territory"
                            name="shippingRegion"
                            placeholder="Text input"
                            selectedCountry={shippingCountry}
                            selectedRegion={shippingRegion}
                            errorText={errors && errors.shippingRegion}
                            helpText=""
                            onChange={(value) => setShippingRegion(value)}
                            isRequired={true}
                            maxWidth="280px"
                          />

                          <FormInputField
                            label="City"
                            name="shippingCity"
                            placeholder="Text input"
                            value={shippingCity}
                            errorText={errors && errors.shippingCity}
                            helpText=""
                            onChange={(e) => setShippingCity(e.target.value)}
                            isRequired={true}
                            maxWidth="380px"
                          />

                          <FormInputField
                            label="Address Line 1"
                            name="shippingAddressLine1"
                            placeholder="Text input"
                            value={shippingAddressLine1}
                            errorText={errors && errors.shippingAddressLine1}
                            helpText=""
                            onChange={(e) =>
                              setShippingAddressLine1(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="380px"
                          />

                          <FormInputField
                            label="Address Line 2 (Optional)"
                            name="shippingAddressLine2"
                            placeholder="Text input"
                            value={shippingAddressLine2}
                            errorText={errors && errors.shippingAddressLine2}
                            helpText=""
                            onChange={(e) =>
                              setShippingAddressLine2(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="380px"
                          />

                          <FormInputField
                            label="Postal Code"
                            name="shippingPostalCode"
                            placeholder="Text input"
                            value={shippingPostalCode}
                            errorText={errors && errors.shippingPostalCode}
                            helpText=""
                            onChange={(e) =>
                              setShippingPostalCode(e.target.value)
                            }
                            isRequired={true}
                            maxWidth="100px"
                          />
                        </div>
                      )}
                    </div>

                    <p className="title is-6 mt-2">
                      <FontAwesomeIcon className="fas" icon={faBalanceScale} />
                      &nbsp;Insurance, financial, etc
                    </p>

                    <FormTextareaField
                      label="Limitation or special consideration (optional)"
                      name="limitSpecial"
                      placeholder="Text input"
                      value={limitSpecial}
                      errorText={errors && errors.limitSpecial}
                      helpText=""
                      onChange={(e) => setLimitSpecial(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={"Max 638 characters"}
                      rows={4}
                    />

                    <FormAlternateDateField
                      label="Police Check Expiry"
                      name="policeCheck"
                      placeholder="Text input"
                      value={policeCheck}
                      errorText={errors && errors.policeCheck}
                      helpText=""
                      onChange={(date) => setPoliceCheck(date)}
                      isRequired={false}
                      maxWidth="187px"
                    />

                    <FormInputField
                      label="Drivers License Class (optional)"
                      name="driversLicenseClass"
                      type="text"
                      placeholder="Text input"
                      value={driversLicenseClass}
                      errorText={errors && errors.driversLicenseClass}
                      helpText=""
                      onChange={(e) => setDriversLicenseClass(e.target.value)}
                      isRequired={false}
                      maxWidth="380px"
                    />

                    <FormMultiSelectFieldForVehicleType
                      label="Vehicle Types (optional)"
                      name="vehicleTypes"
                      placeholder="Pick vehicle types"
                      vehicleTypes={vehicleTypes}
                      setVehicleTypes={setVehicleTypes}
                      errorText={errors && errors.vehicleTypes}
                      helpText="Pick the vehicle types you would like to staff with this cliient."
                      isRequired={true}
                    />

                    <p className="title is-6 mt-2">
                      <FontAwesomeIcon className="fas" icon={faUserFriends} />
                      &nbsp;Emergency Contact
                    </p>

                    <FormInputField
                      label="Contact Name"
                      name="emergencyContactName"
                      type="text"
                      placeholder="Text input"
                      value={emergencyContactName}
                      errorText={errors && errors.emergencyContactName}
                      helpText=""
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      isRequired={false}
                      maxWidth="380px"
                    />

                    <FormInputField
                      label="Contact Relationship"
                      name="emergencyContactRelationship"
                      type="text"
                      placeholder="Text input"
                      value={emergencyContactRelationship}
                      errorText={errors && errors.emergencyContactRelationship}
                      helpText=""
                      onChange={(e) =>
                        setEmergencyContactRelationship(e.target.value)
                      }
                      isRequired={false}
                      maxWidth="380px"
                    />

                    <FormPhoneField
                      label="Contact Telephone"
                      name="emergencyContactTelephone"
                      selectedCountry={country}
                      selectePhoneNumber={emergencyContactTelephone}
                      errorText={errors && errors.emergencyContactTelephone}
                      helpText=""
                      onChange={(ph) => setEmergencyContactTelephone(ph)}
                      isRequired={false}
                      maxWidth="190px"
                    />

                    <FormPhoneField
                      label="Contact Alternative Telephone (Optional)"
                      name="emergencyContactAlternativeTelephone"
                      type="text"
                      placeholder="Text input"
                      selectedCountry={country}
                      selectePhoneNumber={emergencyContactAlternativeTelephone}
                      errorText={
                        errors && errors.emergencyContactAlternativeTelephone
                      }
                      helpText=""
                      onChange={(ph) =>
                        setEmergencyContactAlternativeTelephone(ph)
                      }
                      isRequired={false}
                      maxWidth="190px"
                    />

                    <p className="title is-5">
                      <FontAwesomeIcon className="fas" icon={faChartPie} />
                      &nbsp;Metrics
                    </p>

                    <FormMultiSelectFieldForTags
                      label="Tags (Optional)"
                      name="tags"
                      placeholder="Pick tags"
                      tags={tags}
                      setTags={setTags}
                      errorText={errors && errors.tags}
                      helpText="Pick the tags you would like to staff with this cliient."
                      isRequired={true}
                      maxWidth="320px"
                    />

                    <FormSelectFieldForHowHearAboutUsItem
                      howDidYouHearAboutUsID={howDidYouHearAboutUsID}
                      setHowDidYouHearAboutUsID={setHowDidYouHearAboutUsID}
                      isHowDidYouHearAboutUsOther={isHowDidYouHearAboutUsOther}
                      setIsHowDidYouHearAboutUsOther={
                        setIsHowDidYouHearAboutUsOther
                      }
                      errorText={errors && errors.howDidYouHearAboutUsID}
                      helpText=""
                      isRequired={true}
                      maxWidth="520px"
                    />
                    {isHowDidYouHearAboutUsOther === true && (
                      <>
                        <FormInputField
                          label="How did you hear about us? (Other)"
                          name="howDidYouHearAboutUsOther"
                          placeholder="Text input"
                          value={howDidYouHearAboutUsOther}
                          errorText={errors && errors.howDidYouHearAboutUsOther}
                          helpText=""
                          onChange={(e) =>
                            setHowHearAboutUsItemOther(e.target.value)
                          }
                          isRequired={true}
                          maxWidth="100%"
                        />
                      </>
                    )}

                    <FormSelectField
                      label="Gender"
                      name="gender"
                      placeholder="Pick"
                      selectedValue={gender}
                      errorText={errors && errors.gender}
                      helpText=""
                      onChange={(e) => setGender(e.target.value)}
                      options={GENDER_OPTIONS}
                    />

                    {gender === 1 && (
                      <FormInputField
                        label="Gender (Other)"
                        name="genderOther"
                        placeholder="Text input"
                        value={genderOther}
                        errorText={errors && errors.genderOther}
                        helpText=""
                        onChange={(e) => setGenderOther(e.target.value)}
                        isRequired={true}
                        maxWidth="380px"
                      />
                    )}

                    <FormAlternateDateField
                      label="Birth Date (Optional)"
                      name="birthDate"
                      placeholder="Text input"
                      value={birthDate}
                      helpText=""
                      onChange={(date) => setBirthDate(date)}
                      isRequired={true}
                      maxWidth="180px"
                      maxDate={new Date()}
                    />

                    {/*
                                    <FormAlternateDateField
                                        label="Join Date (Optional)"
                                        name="joinDate"
                                        placeholder="Text input"
                                        value={joinDate}
                                        helpText="This indicates when the user joined the workery"
                                        onChange={(date)=>setJoinDate(date)}
                                        isRequired={true}
                                        maxWidth="180px"
                                    />
                                    */}

                    <p className="title is-6 mt-2">
                      <FontAwesomeIcon className="fas" icon={faServer} />
                      &nbsp;System
                    </p>

                    <FormTextareaField
                      label="Description (optional)"
                      name="description"
                      placeholder="Text input"
                      value={description}
                      errorText={errors && errors.description}
                      helpText=""
                      onChange={(e) => setDescription(e.target.value)}
                      isRequired={true}
                      maxWidth="280px"
                      helpText={"Max 638 characters"}
                      rows={4}
                    />

                    <FormRadioField
                      label="Preferred Language"
                      name="preferredLanguage"
                      value={preferredLanguage}
                      errorText={errors && errors.preferredLanguage}
                      opt1Value="English"
                      opt1Label="English"
                      opt2Value="French"
                      opt2Label="French"
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                    />

                    <FormMultiSelectField
                      label="Do you identify as belonging to any of the following groups? (Optional)"
                      name="identifyAs"
                      placeholder="Text input"
                      options={IDENTIFY_AS_OPTIONS}
                      selectedValues={identifyAs}
                      onChange={(e) => {
                        let values = [];
                        for (let option of e) {
                          values.push(option.value);
                        }
                        setIdentifyAs(values);
                      }}
                      errorText={errors && errors.identifyAs}
                      helpText=""
                      isRequired={true}
                      maxWidth="320px"
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/staff/${aid}`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Detail
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

export default AdminStaffUpdate;
