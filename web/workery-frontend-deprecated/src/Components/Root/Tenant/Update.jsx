import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import { getTenantDetailAPI, putTenantUpdateAPI } from "../../../API/Tenant";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormInputField from "../../Reusable/FormInputField";
import FormTextareaField from "../../Reusable/FormTextareaField";
import FormRadioField from "../../Reusable/FormRadioField";
import FormMultiSelectField from "../../Reusable/FormMultiSelectField";
import FormSelectField from "../../Reusable/FormSelectField";
import FormCheckboxField from "../../Reusable/FormCheckboxField";
import FormCountryField from "../../Reusable/FormCountryField";
import FormRegionField from "../../Reusable/FormRegionField";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import { HOW_DID_YOU_HEAR_ABOUT_US_WITH_EMPTY_OPTIONS } from "../../../Constants/FieldOptions";
import { topAlertMessageState, topAlertStatusState } from "../../../AppState";

function RootTenantUpdate() {
  ////
  //// URL Parameters.
  ////

  const { tid } = useParams();

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
  const [name, setName] = useState("");
  const [alternateName, setAlternateName] = useState("");
  const [description, setDescription] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [addressLocality, setAddressLocality] = useState("");
  const [addressRegion, setAddressRegion] = useState("");
  const [addressCountry, setAddressCountry] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");

  ////
  //// Event handling.
  ////

  // Nothing.

  ////
  //// API.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    setFetching(true);
    setErrors({});
    const tenant = {
      ID: tid,
      Name: name,
      AlternateName: alternateName,
      Description: description,
      SchemaName: schemaName,
      AddressLocality: addressLocality,
      AddressRegion: addressRegion,
      AddressCountry: addressCountry,
      Email: email,
      Telephone: telephone,
      StreetAddress: streetAddress,
      PostalCode: postalCode,
      State: 1,
    };
    console.log("onSubmitClick, tenant:", tenant);
    putTenantUpdateAPI(
      tenant,
      onAdminTenantUpdateSuccess,
      onAdminTenantUpdateError,
      onAdminTenantUpdateDone,
      onUnauthorized,
    );
  };

  function onDetailSuccess(response) {
    console.log("onDetailSuccess: Starting...");
    setName(response.name);
    setAlternateName(response.alternateName);
    setDescription(response.description);
    setSchemaName(response.schemaName);
    setAddressCountry(response.addressCountry);
    setAddressRegion(response.addressRegion);
    setAddressLocality(response.addressLocality);
    setPostalCode(response.postalCode);
    setEmail(response.email);
    setTelephone(response.telephone);
    setStreetAddress(response.streetAddress);
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

  function onAdminTenantUpdateSuccess(response) {
    // For debugging purposes only.
    console.log("onAdminTenantUpdateSuccess: Starting...");
    console.log(response);

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Tenant updated");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onAdminTenantUpdateSuccess: Delayed for 2 seconds.");
      console.log(
        "onAdminTenantUpdateSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Redirect the user to a new page.
    setForceURL("/root/tenant/" + response.id);
  }

  function onAdminTenantUpdateError(apiErr) {
    console.log("onAdminTenantUpdateError: Starting...");
    setErrors(apiErr);

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Failed submitting");
    setTopAlertStatus("danger");
    setTimeout(() => {
      console.log("onAdminTenantUpdateError: Delayed for 2 seconds.");
      console.log(
        "onAdminTenantUpdateError: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAdminTenantUpdateDone() {
    console.log("onAdminTenantUpdateDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getTenantDetailAPI(
        tid,
        onDetailSuccess,
        onDetailError,
        onDetailDone,
        onUnauthorized,
      );
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
                <Link to="/root/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Admin Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/root/tenants" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faBuilding} />
                  &nbsp;Tenants
                </Link>
              </li>
              <li className="">
                <Link to={`/root/tenant/${tid}`} aria-current="page">
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
                <Link to={`/root/tenant/${tid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faBuilding} />
              &nbsp;Tenant
            </p>
            <FormErrorBox errors={errors} />

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <div className="container">
                  <p className="subtitle is-6 pt-4">
                    <FontAwesomeIcon className="fas" icon={faIdCard} />
                    &nbsp;Identification
                  </p>
                  <hr />

                  <FormInputField
                    label="Name"
                    name="name"
                    placeholder="Text input"
                    value={name}
                    errorText={errors && errors.name}
                    helpText=""
                    onChange={(e) => setName(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Alternate Name"
                    name="alternateName"
                    placeholder="Text input"
                    value={alternateName}
                    errorText={errors && errors.alternateName}
                    helpText=""
                    onChange={(e) => setAlternateName(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormTextareaField
                    label="Description"
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

                  <p className="subtitle is-6 pt-4">
                    <FontAwesomeIcon className="fas" icon={faSquarePhone} />
                    &nbsp;Contact
                  </p>
                  <hr />

                  <FormInputField
                    label="Email"
                    name="email"
                    placeholder="Text input"
                    value={email}
                    errorText={errors && errors.email}
                    helpText=""
                    onChange={(e) => setEmail(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Telephone"
                    name="telephone"
                    placeholder="Text input"
                    value={telephone}
                    errorText={errors && errors.telephone}
                    helpText=""
                    onChange={(e) => setTelephone(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <p className="subtitle is-6 pt-4">
                    <FontAwesomeIcon className="fas" icon={faAddressCard} />
                    &nbsp;Address
                  </p>
                  <hr />

                  <FormCountryField
                    priorityOptions={["CA", "US", "MX"]}
                    label="Country"
                    name="addressCountry"
                    placeholder="Text input"
                    selectedCountry={addressCountry}
                    errorText={errors && errors.addressCountry}
                    helpText=""
                    onChange={(value) => setAddressCountry(value)}
                    isRequired={true}
                    maxWidth="160px"
                  />

                  <FormRegionField
                    label="Province/Territory"
                    name="addressRegion"
                    placeholder="Text input"
                    selectedCountry={addressCountry}
                    selectedRegion={addressRegion}
                    errorText={errors && errors.addressRegion}
                    helpText=""
                    onChange={(value) => setAddressRegion(value)}
                    isRequired={true}
                    maxWidth="280px"
                  />

                  <FormInputField
                    label="City"
                    name="addressLocality"
                    placeholder="Text input"
                    value={addressLocality}
                    errorText={errors && errors.addressLocality}
                    helpText=""
                    onChange={(e) => setAddressLocality(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  <FormInputField
                    label="Street Address"
                    name="streetAddress"
                    placeholder="Text input"
                    value={streetAddress}
                    errorText={errors && errors.streetAddress}
                    helpText=""
                    onChange={(e) => setStreetAddress(e.target.value)}
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
                    maxWidth="380px"
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-hidden-touch"
                        to={`/root/tenant/${tid}`}
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                      <Link
                        className="button is-fullwidth is-hidden-desktop"
                        to={`/root/tenant/${tid}`}
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-primary is-hidden-touch"
                        onClick={onSubmitClick}
                      >
                        <FontAwesomeIcon className="fas" icon={faCheckCircle} />
                        &nbsp;Save
                      </button>
                      <button
                        className="button is-primary is-fullwidth is-hidden-desktop"
                        onClick={onSubmitClick}
                      >
                        <FontAwesomeIcon className="fas" icon={faCheckCircle} />
                        &nbsp;Save
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

export default RootTenantUpdate;
