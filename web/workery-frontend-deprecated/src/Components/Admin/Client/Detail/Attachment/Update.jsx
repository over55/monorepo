import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

import {
  putAttachmentUpdateAPI,
  getAttachmentDetailAPI,
} from "../../../../../API/Attachment";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import FormInputField from "../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../../Reusable/FormCheckboxField";
import FormCountryField from "../../../../Reusable/FormCountryField";
import FormRegionField from "../../../../Reusable/FormRegionField";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../AppState";

function AdminClientAttachmentUpdate() {
  ////
  //// URL Parameters.
  ////

  const { cid, aid } = useParams();

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

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
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("description", description);

    putAttachmentUpdateAPI(
      aid,
      formData,
      onAdminClientAttachmentUpdateSuccess,
      onAdminClientAttachmentUpdateError,
      onAdminClientAttachmentUpdateDone,
      onUnauthorized,
    );
    console.log("onSubmitClick: Finished.");
  };

  ////
  //// API.
  ////

  // --- Update --- //

  function onAdminClientAttachmentUpdateSuccess(response) {
    // For debugging purposes only.
    console.log("onAdminClientAttachmentUpdateSuccess: Starting...");
    console.log(response);

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Attachment uploaded");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log(
        "onAdminClientAttachmentUpdateSuccess: Delayed for 2 seconds.",
      );
      console.log(
        "onAdminClientAttachmentUpdateSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Redirect the user to the user attachments page.
    setForceURL("/admin/client/" + cid + "/attachments");
  }

  function onAdminClientAttachmentUpdateError(apiErr) {
    console.log("onAdminClientAttachmentUpdateError: Starting...");
    setErrors(apiErr);

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Failed submitting");
    setTopAlertStatus("danger");
    setTimeout(() => {
      console.log("onAdminClientAttachmentUpdateError: Delayed for 2 seconds.");
      console.log(
        "onAdminClientAttachmentUpdateError: topAlertMessage, topAlertStatus:",
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

  function onAdminClientAttachmentUpdateDone() {
    console.log("onAdminClientAttachmentUpdateDone: Starting...");
    setFetching(false);
  }

  // --- Detail --- //
  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setTitle(response.title);
    setDescription(response.description);
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
      getAttachmentDetailAPI(aid, onSuccess, onError, onDone, onUnauthorized);
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
                <Link to="/admin/clients" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUserCircle} />
                  &nbsp;Clients
                </Link>
              </li>
              <li className="">
                <Link
                  to={`/admin/client/${cid}/attachments`}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail (Attachments)
                </Link>
              </li>
              <li className="">
                <Link
                  to={`/admin/client/${cid}/attachment/${aid}`}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faFile} />
                  &nbsp;Attachment
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
                <Link
                  to={`/admin/client/${cid}/attachments`}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail (Attachments)
                </Link>
              </li>
            </ul>
          </nav>

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
              <FontAwesomeIcon className="fas" icon={faPencil} />
              &nbsp;Edit Attachment
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

                  <FormInputField
                    label="Title"
                    name="title"
                    placeholder="Text input"
                    value={title}
                    errorText={errors && errors.title}
                    helpText=""
                    onChange={(e) => setTitle(e.target.value)}
                    isRequired={true}
                    maxWidth="150px"
                  />

                  <FormInputField
                    label="Description"
                    name="description"
                    type="text"
                    placeholder="Text input"
                    value={description}
                    errorText={errors && errors.description}
                    helpText=""
                    onChange={(e) => setDescription(e.target.value)}
                    isRequired={true}
                    maxWidth="485px"
                  />

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
                        className="button is-medium"
                      />
                      <br />
                      <br />
                    </>
                  )}

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        to={`/admin/client/${cid}/attachment/${aid}`}
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

export default AdminClientAttachmentUpdate;
