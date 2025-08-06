import axios from "axios";
import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCashRegister,
  faAddressCard,
  faUserAltSlash,
  faHandHoldingUsd,
  faBan,
  faClock,
  faShieldAlt,
  faBirthdayCake,
  faHandHolding,
  faBuilding,
  faChartPie,
  faToolbox,
  faRandom,
  faHandshake,
  faCalendarTimes,
  faGlobe,
  faMailBulk,
  faSearchDollar,
  faEnvelope,
  faChartBar,
  faMessage,
  faChevronRight,
  faPlus,
  faPencil,
  faTimes,
  faBullhorn,
  faArrowUpRightFromSquare,
  faNewspaper,
  faWrench,
  faHardHat,
  faUserCircle,
  faTasks,
  faGauge,
  faArrowRight,
  faUsers,
  faBarcode,
  faSquarePhone,
  faMapPin,
  faLink,
  faGraduationCap,
  faTags,
  faBalanceScale,
  faCreditCard,
  faFaceFrown,
  faCar,
  faTty,
  faArrowCircleRight,
  faArrowLeft,
  faCloudDownload,
} from "@fortawesome/free-solid-svg-icons";

import FormSelectField from "../../../../Reusable/FormSelectField";
import FormAlternateDateField from "../../../../Reusable/FormAlternateDateField";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import { ORDER_STATUS_FILTER_OPTIONS } from "../../../../../Constants/FieldOptions";
import { WORKERY_REPORT_API_ENDPOINT } from "../../../../../Constants/API";
import {
  getAccessTokenFromLocalStorage,
  attachAxiosRefreshTokenHandler,
} from "../../../../../Helpers/jwtUtility";
import { getAPIBaseURL } from "../../../../../Helpers/urlUtility";

function AdminReport09() {
  ////
  //// Component states.
  ////

  // Page State
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Form State
  // (None)

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    setFetching(true);
    setErrors({});

    // const accessToken = getAccessTokenFromLocalStorage();
    // const url = WORKERY_REPORT_API_ENDPOINT.replace("{reportID}", 1) + "?branch_id=" + fromDate + "&subscription_offer_id=" + toDate + "&token="+accessToken;
    // console.log("Downloading Report via", url);

    // // // The following code will open up a new browser tab and load up the
    // // // URL that you inputted.
    // // var win = window.open(url, '_blank');
    // // win.focus();
    //
    // // The following code will open up the file to download.
    // window.location = url;
    //
    // // Add minor delay and then run to remove the button ``disable`` state
    // // so the user is able to click the download button again.
    // setTimeout(() => {
    //     setFetching(false);
    //     setErrors({});
    // }, 100); // 0.10 seconds.

    // IMPORTANT: THIS IS THE ONLY WAY WE CAN GET THE ACCESS TOKEN.
    const accessToken = getAccessTokenFromLocalStorage();

    // Generate our app's Axios instance.
    // Create a new Axios instance which will be sending and receiving in
    // blob (binary data) format. Special thanks to the following URL:
    // https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
    const customAxios = axios.create({
      baseURL: getAPIBaseURL(),
      headers: {
        Authorization: "JWT " + accessToken,
        "Content-Type": "application/octet-stream;",
        Accept: "application/octet-stream",
      },
      responseType: "blob", // important
    });

    // Attach our Axios "refesh token" interceptor.
    attachAxiosRefreshTokenHandler(customAxios);

    const aURL = WORKERY_REPORT_API_ENDPOINT.replace("{reportID}", 9);

    customAxios
      .get(aURL)
      .then((successResponse) => {
        // SUCCESS
        onSuccessPDFDownloadCallback(successResponse);
      })
      .catch((exception) => {
        // ERROR
        if (exception.response) {
          const responseData = exception.response.data; // <=--- NOTE: https://github.com/axios/axios/issues/960
          console.log("onSubmitClick | exception:", exception); // For debuggin purposes only.
          console.log(
            "onSubmitClick | exception.response:",
            exception.response,
          ); // For debuggin purposes only.
          console.log(
            "onSubmitClick | exception.response.data:",
            exception.response.data,
          ); // For debuggin purposes only.
          setErrors(responseData);
        }
      })
      .then(() => {
        // FINALLY
        setFetching(false);
      });
  };

  ////
  //// API.
  ////

  const onSuccessPDFDownloadCallback = (successResponse) => {
    /**
     *  The following code was taken from the following URL:
     *  https://gist.github.com/javilobo8/097c30a233786be52070986d8cdb1743
     */
    const url = window.URL.createObjectURL(new Blob([successResponse.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "report_09.csv");
    document.body.appendChild(link);
    link.click();

    /**
     *  The following code will close this current tab.
     */
    window.close();
  };

  ////
  //// Misc.
  ////

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
          <nav
            className="breadcrumb has-background-light p-4"
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
                <Link to="/admin/reports" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faChartBar} />
                  &nbsp;Reports
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Client Addresses Report
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <div className="columns">
            <div className="column">
              <h1 className="title is-2">
                <FontAwesomeIcon className="fas" icon={faUserCircle} />
                &nbsp;Client Addresses Report
              </h1>
              <hr />
            </div>
          </div>

          {/* Page */}
          <nav className="box">
            <p className="title is-4">Generate and Download Report</p>
            <p className="has-text-grey pb-4">
              There are no fields to choose from, simple click{" "}
              <strong>download</strong> to generate the report and download.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/reports"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-success is-fullwidth-mobile"
                        onClick={onSubmitClick}
                      >
                        <FontAwesomeIcon
                          className="fas"
                          icon={faCloudDownload}
                        />
                        &nbsp;Download
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

export default AdminReport09;
