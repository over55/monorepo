import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faFile,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faWrench,
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
  getAttachmentDetailAPI,
  deleteAttachmentAPI,
} from "../../../../../API/Attachment";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import DataDisplayRowText from "../../../../Reusable/DataDisplayRowText";
import FormInputField from "../../../../Reusable/FormInputField";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../../Reusable/FormCheckboxField";
import FormCountryField from "../../../../Reusable/FormCountryField";
import FormRegionField from "../../../../Reusable/FormRegionField";
import DataDisplayRowDownloadLink from "../../../../Reusable/DataDisplayRowDownloadLink";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../../../AppState";

function AdminOrderAttachmentDetail() {
  ////
  //// URL Parameters.
  ////

  const { oid, aid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [currentUser] = useRecoilState(currentUserState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [attachment, setAttachment] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [selectedAttachmentForDeletion, setSelectedAttachmentForDeletion] =
    useState("");

  ////
  //// Event handling.
  ////

  const onSelectAttachmentForDeletion = (e, attachment) => {
    console.log("onSelectAttachmentForDeletion", attachment);
    setSelectedAttachmentForDeletion(attachment);
  };

  const onDeselectAttachmentForDeletion = (e) => {
    console.log("onDeselectAttachmentForDeletion");
    setSelectedAttachmentForDeletion("");
  };

  const onDeleteConfirmButtonClick = (e) => {
    console.log("onDeleteConfirmButtonClick"); // For debugging purposes only.

    deleteAttachmentAPI(
      selectedAttachmentForDeletion,
      onAttachmentDeleteSuccess,
      onAttachmentDeleteError,
      onAttachmentDeleteDone,
      onUnauthorized,
    );
    setSelectedAttachmentForDeletion("");
  };

  ////
  //// API.
  ////

  // --- Attachment Detail --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setAttachment(response);
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

  // --- Attachment delete --- //

  function onAttachmentDeleteSuccess(response) {
    console.log("onAttachmentDeleteSuccess: Starting..."); // For debugging purposes only.

    // Update notification.
    setTopAlertStatus("success");
    setTopAlertMessage("Attachment deleted");
    setTimeout(() => {
      console.log(
        "onDeleteConfirmButtonClick: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Fetch again an updated list.
    setForceURL("/admin/order/" + oid + "/attachments");
  }

  function onAttachmentDeleteError(apiErr) {
    console.log("onAttachmentDeleteError: Starting..."); // For debugging purposes only.
    setErrors(apiErr);

    // Update notification.
    setTopAlertStatus("danger");
    setTopAlertMessage("Failed deleting");
    setTimeout(() => {
      console.log(
        "onAttachmentDeleteError: topAlertMessage, topAlertStatus:",
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

  function onAttachmentDeleteDone() {
    console.log("onAttachmentDeleteDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="">
                <Link
                  to={`/admin/order/${oid}/attachments`}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order #{oid} (Attachments)
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faFile} />
                  &nbsp;Attachment
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
                  to={`/admin/order/${oid}/attachments`}
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
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Order
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Modal */}
          <div
            className={`modal ${selectedAttachmentForDeletion ? "is-active" : ""}`}
          >
            <div className="modal-background"></div>
            <div className="modal-card">
              <header className="modal-card-head">
                <p className="modal-card-title">Are you sure?</p>
                <button
                  className="delete"
                  aria-label="close"
                  onClick={onDeselectAttachmentForDeletion}
                ></button>
              </header>
              <section className="modal-card-body">
                You are about to <b>delete</b> this attachment; it will no
                longer appear on your dashboard This action can be undone but
                you'll need to contact the system administrator. Are you sure
                you would like to continue?
              </section>
              <footer className="modal-card-foot">
                <button
                  className="button is-success"
                  onClick={onDeleteConfirmButtonClick}
                >
                  Confirm
                </button>
                <button
                  className="button"
                  onClick={onDeselectAttachmentForDeletion}
                >
                  Cancel
                </button>
              </footer>
            </div>
          </div>

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            <div className="columns">
              <div className="column">
                <p className="title is-4">
                  <FontAwesomeIcon className="fas" icon={faFile} />
                  &nbsp;Attachment
                </p>
              </div>
              {attachment && (
                <div className="column has-text-right">
                  <Link
                    to={`/admin/order/${oid}/attachment/${attachment.id}/edit`}
                    className="button is-small is-warning is-fullwidth-mobile"
                    type="button"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={(e, ses) => onSelectAttachmentForDeletion(e, aid)}
                    className="button is-small is-danger is-fullwidth-mobile"
                    type="button"
                  >
                    <FontAwesomeIcon className="mdi" icon={faTrashCan} />
                    &nbsp;Delete
                  </button>
                </div>
              )}
            </div>

            <FormErrorBox errors={errors} />

            {/* <p className="pb-4 has-text-grey">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                {attachment && (
                  <div className="container">
                    <DataDisplayRowText
                      label="Title"
                      value={attachment.title}
                    />

                    <DataDisplayRowText
                      label="Description"
                      value={attachment.description}
                    />

                    <DataDisplayRowDownloadLink
                      label="File"
                      filename={attachment.filename}
                      objectURL={attachment.objectUrl}
                    />

                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          to={`/admin/order/${oid}/attachments`}
                          className="button is-fullwidth-mobile"
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Attachments
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/admin/order/${oid}/attachment/${aid}/edit`}
                          className="button is-medium is-warning is-fullwidth-mobile"
                          type="button"
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

export default AdminOrderAttachmentDetail;
