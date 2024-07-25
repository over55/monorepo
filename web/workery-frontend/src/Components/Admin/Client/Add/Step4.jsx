import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormCountryField from "../../../Reusable/FormCountryField";
import FormRegionField from "../../../Reusable/FormRegionField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../AppState";

function AdminClientAddStep4() {
  ////
  //// Global state.
  ////

  const [addCustomer, setAddCustomer] = useRecoilState(addCustomerState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [postalCode, setPostalCode] = useState(addCustomer.postalCode);
  const [addressLine1, setAddressLine1] = useState(addCustomer.addressLine1);
  const [addressLine2, setAddressLine2] = useState(addCustomer.addressLine2);
  const [city, setCity] = useState(addCustomer.city);
  const [region, setRegion] = useState(addCustomer.region);
  const [country, setCountry] = useState(addCustomer.country);
  const [hasShippingAddress, setHasShippingAddress] = useState(
    addCustomer.hasShippingAddress,
  );
  const [shippingName, setShippingName] = useState(addCustomer.shippingName);
  const [shippingPhone, setShippingPhone] = useState(addCustomer.shippingPhone);
  const [shippingCountry, setShippingCountry] = useState(
    addCustomer.shippingCountry,
  );
  const [shippingRegion, setShippingRegion] = useState(
    addCustomer.shippingRegion,
  );
  const [shippingCity, setShippingCity] = useState(addCustomer.shippingCity);
  const [shippingAddressLine1, setShippingAddressLine1] = useState(
    addCustomer.shippingAddressLine1,
  );
  const [shippingAddressLine2, setShippingAddressLine2] = useState(
    addCustomer.shippingAddressLine2,
  );
  const [shippingPostalCode, setShippingPostalCode] = useState(
    addCustomer.shippingPostalCode,
  );

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    let newErrors = {};
    let hasErrors = false;

    if (postalCode === "") {
      newErrors["postalCode"] = "missing value";
      hasErrors = true;
    }
    if (addressLine1 === "") {
      newErrors["addressLine1"] = "missing value";
      hasErrors = true;
    }
    if (city === "") {
      newErrors["city"] = "missing value";
      hasErrors = true;
    }
    if (region === "") {
      newErrors["region"] = "missing value";
      hasErrors = true;
    }
    if (country === "") {
      newErrors["country"] = "missing value";
      hasErrors = true;
    }

    if (hasShippingAddress === true) {
      if (shippingName === "") {
        newErrors["shippingName"] = "missing value";
        hasErrors = true;
      }
      if (shippingPhone === "") {
        newErrors["shippingPhone"] = "missing value";
        hasErrors = true;
      }
      if (shippingCountry === "") {
        newErrors["shippingCountry"] = "missing value";
        hasErrors = true;
      }
      if (shippingRegion === "") {
        newErrors["shippingRegion"] = "missing value";
        hasErrors = true;
      }
      if (shippingCity === "") {
        newErrors["shippingCity"] = "missing value";
        hasErrors = true;
      }
      if (shippingAddressLine1 === "") {
        newErrors["shippingAddressLine1"] = "missing value";
        hasErrors = true;
      }
      if (shippingPostalCode === "") {
        newErrors["shippingPostalCode"] = "missing value";
        hasErrors = true;
      }
    }

    if (hasErrors) {
      // Set the client based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      console.log("onSubmitClick: Ending with error.");
      return;
    }

    // Save to persistent storage.
    let modifiedAddCustomer = { ...addCustomer };
    modifiedAddCustomer.postalCode = postalCode;
    modifiedAddCustomer.addressLine1 = addressLine1;
    modifiedAddCustomer.addressLine2 = addressLine2;
    modifiedAddCustomer.city = city;
    modifiedAddCustomer.region = region;
    modifiedAddCustomer.country = country;
    modifiedAddCustomer.hasShippingAddress = hasShippingAddress;
    modifiedAddCustomer.shippingName = shippingName;
    modifiedAddCustomer.shippingPhone = shippingPhone;
    modifiedAddCustomer.shippingCountry = shippingCountry;
    modifiedAddCustomer.shippingRegion = shippingRegion;
    modifiedAddCustomer.shippingCity = shippingCity;
    modifiedAddCustomer.shippingAddressLine1 = shippingAddressLine1;
    modifiedAddCustomer.shippingAddressLine2 = shippingAddressLine2;
    modifiedAddCustomer.shippingPostalCode = shippingPostalCode;
    setAddCustomer(modifiedAddCustomer);

    console.log("onSubmitClick: Ending with success.");

    // Redirect to the next page.
    setForceURL("/admin/clients/add/step-5");
  };

  ////
  //// API.
  ////

  // Do nothing.

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

  // console.log("Country:", country);

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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Clients
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Clients
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faPlus} />
            &nbsp;New Client
          </h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-light">
            <p className="subtitle is-5">Step 4 of 6</p>
            <progress class="progress is-success" value="67" max="100">
              67%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faAddressBook} />
              &nbsp;Address
            </p>

            {/* <p className="pb-4 has-text-grey">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  <FormCheckboxField
                    label="Has shipping address different then billing address"
                    name="hasShippingAddress"
                    checked={hasShippingAddress}
                    errorText={errors && errors.hasShippingAddress}
                    onChange={(e) => setHasShippingAddress(!hasShippingAddress)}
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

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/clients/add/step-3"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSubmitClick}
                        type="button"
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

export default AdminClientAddStep4;
