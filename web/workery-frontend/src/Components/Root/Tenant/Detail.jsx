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
  faUserCircle,
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

import { getTenantDetailAPI } from "../../../API/Tenant";
import FormErrorBox from "../../Reusable/FormErrorBox";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import { topAlertMessageState, topAlertStatusState } from "../../../AppState";
import FormRowText from "../../Reusable/FormRowText";
import FormTextYesNoRow from "../../Reusable/FormRowTextYesNo";

function RootTenantDetail() {
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
  const [tenant, setTenant] = useState({});
  const [tabIndex, setTabIndex] = useState(1);

  ////
  //// Event handling.
  ////

  //

  ////
  //// API.
  ////

  function onTenantDetailSuccess(response) {
    console.log("onTenantDetailSuccess: Starting...");
    setTenant(response);
  }

  function onTenantDetailError(apiErr) {
    console.log("onTenantDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTenantDetailDone() {
    console.log("onTenantDetailDone: Starting...");
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
      console.log(tid);
      getTenantDetailAPI(
        tid,
        onTenantDetailSuccess,
        onTenantDetailError,
        onTenantDetailDone,
        onUnauthorized,
      );
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail
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
                <Link to="/root/tenants" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Organizations
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page */}
          <nav className="box">
            {tenant && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faBuilding} />
                    &nbsp;Tenant
                  </p>
                </div>
                <div className="column has-text-right">
                  <Link
                    to={`/root/tenant/${tid}/edit`}
                    className="button is-small is-warning is-fullwidth-mobile"
                    type="button"
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                    &nbsp;Edit
                  </Link>
                </div>
              </div>
            )}
            <FormErrorBox errors={errors} />

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                {tenant && (
                  <div className="container">
                    <p className="subtitle is-6 pt-4">
                      <FontAwesomeIcon className="fas" icon={faIdCard} />
                      &nbsp;Identification
                    </p>
                    <hr />

                    <FormRowText
                      label="Schema Name"
                      value={tenant.schemaName}
                      helpText=""
                    />

                    <FormRowText label="Name" value={tenant.name} helpText="" />

                    <FormRowText
                      label="Alternate Name"
                      value={tenant.alternateName}
                      helpText=""
                    />

                    <FormRowText
                      label="Description"
                      value={tenant.description}
                      helpText=""
                    />

                    <p className="subtitle is-6 pt-4">
                      <FontAwesomeIcon className="fas" icon={faSquarePhone} />
                      &nbsp;Contact
                    </p>
                    <hr />

                    <FormRowText
                      label="Email"
                      value={tenant.email}
                      helpText=""
                    />

                    <FormRowText
                      label="Telephone"
                      value={tenant.telephone}
                      helpText=""
                    />

                    <p className="subtitle is-6 pt-4">
                      <FontAwesomeIcon className="fas" icon={faAddressCard} />
                      &nbsp;Address
                    </p>
                    <hr />

                    <FormRowText
                      label="Country"
                      value={tenant.addressCountry}
                      helpText=""
                    />

                    <FormRowText
                      label="Country"
                      value={tenant.addressCountry}
                      helpText=""
                    />

                    <FormRowText
                      label="State/Province"
                      value={tenant.addressRegion}
                      helpText=""
                    />

                    <FormRowText
                      label="City"
                      value={tenant.addressLocality}
                      helpText=""
                    />

                    <FormRowText
                      label="Postal Code"
                      value={tenant.postalCode}
                      helpText=""
                    />

                    <FormRowText
                      label="Address"
                      value={tenant.streetAddress}
                      helpText=""
                    />

                    <FormRowText
                      label="Address (Extra line)"
                      value={tenant.streetAddressExtra}
                      helpText=""
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-hidden-touch"
                          to={`/root/tenants`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back
                        </Link>
                        <Link
                          className="button is-fullwidth is-hidden-desktop"
                          to={`/root/tenants`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/root/tenant/${tid}/edit`}
                          className="button is-primary is-hidden-touch"
                        >
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
                        <Link
                          to={`/root/tenant/${tid}/edit`}
                          className="button is-primary is-fullwidth is-hidden-desktop"
                        >
                          <FontAwesomeIcon className="fas" icon={faPencil} />
                          &nbsp;Edit
                        </Link>
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

export default RootTenantDetail;
