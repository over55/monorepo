import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faImage,
  faFile,
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
  faCogs,
  faCircleInfo,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { postAvatarClientAPI } from "../../../../../../API/Client";
import { getClientDetailAPI } from "../../../../../../API/Client";
import FormErrorBox from "../../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../../../Reusable/FormCheckboxField";
import FormCountryField from "../../../../../Reusable/FormCountryField";
import FormRegionField from "../../../../../Reusable/FormRegionField";
import AlertBanner from "../../../../../Reusable/EveryPage/AlertBanner";
import PageLoadingContent from "../../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../../AppState";

function AdminClientAvatarOperation() {
  ////
  //// URL Parameters.
  ////

  const { cid } = useParams();

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
  const [selectedFile, setSelectedFile] = useState(null);
  const [client, setClient] = useState({});

  ////
  //// Event handling.
  ////

  const onHandleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Starting...");
    setFetching(true);
    setErrors({});

    const formData = new FormData();
    formData.append("customer_id", cid);
    formData.append("file", selectedFile);

    postAvatarClientAPI(
      formData,
      onAdminClientAvatarOperationSuccess,
      onAdminClientAvatarOperationError,
      onAdminClientAvatarOperationDone,
      onUnauthorized,
    );
    console.log("onSubmitClick: Finished.");
  };

  ////
  //// API.
  ////

  // --- Avatar Operation --- //

  function onAdminClientAvatarOperationSuccess(response) {
    // For debugging purposes only.
    console.log("onAdminClientAvatarOperationSuccess: Starting...");
    console.log(response);

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Photo changed");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log(
        "onAdminClientAvatarOperationSuccess: Delayed for 2 seconds.",
      );
      console.log(
        "onAdminClientAvatarOperationSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Redirect the user to the user attachments page.
    setForceURL("/admin/client/" + cid + "/more");
  }

  function onAdminClientAvatarOperationError(apiErr) {
    console.log("onAdminClientAvatarOperationError: Starting...");
    setErrors(apiErr);

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Failed submitting");
    setTopAlertStatus("danger");
    setTimeout(() => {
      console.log("onAdminClientAvatarOperationError: Delayed for 2 seconds.");
      console.log(
        "onAdminClientAvatarOperationError: topAlertMessage, topAlertStatus:",
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

  function onAdminClientAvatarOperationDone() {
    console.log("onAdminClientAvatarOperationDone: Starting...");
    setFetching(false);
  }

  // --- Detail --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setClient(response);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    console.log("onDone: Starting...");
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
      setErrors({});
      setFetching(true);
      getClientDetailAPI(cid, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, [cid]);

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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/client/${cid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail (More)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPencil} />
                  &nbsp;Avatar
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
                <Link to={`/admin/client/${cid}/more`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail (More)
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {client && client.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUserCircle} />
            &nbsp;Client
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faImage} />
              &nbsp;Change Photo
            </p>

            <FormErrorBox errors={errors} />

            {/* <p className="pb-4 has-text-grey">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <div className="container">
                  <article className="message is-warning">
                    <div className="message-body">
                      <strong>Warning:</strong> Submitting with new uploaded
                      file will delete previous upload.
                    </div>
                  </article>

                  {selectedFile !== undefined &&
                  selectedFile !== null &&
                  selectedFile !== "" ? (
                    <>
                      <article className="message is-success">
                        <div className="message-body">
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
                          &nbsp;File ready to upload.
                        </div>
                      </article>
                    </>
                  ) : (
                    <>
                      <b>File (Optional)</b>
                      <br />
                      <input
                        name="file"
                        type="file"
                        onChange={onHandleFileChange}
                      />
                      <br />
                      <br />
                    </>
                  )}

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        to={`/admin/client/${cid}/more`}
                        className="button is-fullwidth-mobile"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Detail
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className="button is-medium is-success is-fullwidth-mobile"
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

export default AdminClientAvatarOperation;
