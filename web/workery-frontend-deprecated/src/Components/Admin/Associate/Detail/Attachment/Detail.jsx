import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { useRecoilState } from "recoil";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrashCan,
  faTable,
  faFile,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faHardHat,
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
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import DataDisplayRowDownloadLink from "../../../../Reusable/DataDisplayRowDownloadLink";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../AppState";

function AdminAssociateAttachmentDetail() {
  ////
  //// URL Parameters.
  ////

  const { aid, atid } = useParams();

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
  const [attachment, setAttachment] = useState({});
  const [forceURL, setForceURL] = useState("");
  const [selectedAttachmentForDeletion, setSelectedAttachmentForDeletion] =
    useState("");

  ////
  //// Event handling.
  ////

  // --- Details --- //

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
    setForceURL("/admin/associate/" + aid);
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

  ////
  //// API.
  ////

  const onSelectAttachmentForDeletion = (e, aid) => {
    console.log("onSelectAttachmentForDeletion", aid);
    setSelectedAttachmentForDeletion(aid);
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
    );
    setSelectedAttachmentForDeletion("");
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getAttachmentDetailAPI(atid, onSuccess, onError, onDone);
    }

    return () => {
      mounted = false;
    };
  }, [atid]);

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
                <Link to="/admin/associates" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faHardHat} />
                  &nbsp;Associates
                </Link>
              </li>
              <li className="">
                <Link
                  to={`/admin/associate/${aid}/attachments`}
                  aria-current="page"
                >
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Detail (Attachments)
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
                  to={`/admin/associate/${aid}/attachments`}
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
            <FontAwesomeIcon className="fas" icon={faHardHat} />
            &nbsp;Associate
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
                You are about to <b>permanently delete</b> this attachment; it
                will no longer appear on your dashboard This action can be
                undone but you'll need to contact the system administrator. Are
                you sure you would like to continue?
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
            {attachment && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Attachment
                  </p>
                </div>
                <div className="column has-text-right">
                  <Link
                    to={`/admin/associate/${aid}/attachment/${atid}/edit`}
                    className="button is-small is-warning"
                    type="button"
                  >
                    Edit
                  </Link>
                  &nbsp;
                  <button
                    onClick={(e, ses) => onSelectAttachmentForDeletion(e, atid)}
                    className="button is-small is-danger"
                    type="button"
                  >
                    <FontAwesomeIcon className="mdi" icon={faTrashCan} />
                    &nbsp;Delete
                  </button>
                </div>
              </div>
            )}

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
                          to={`/admin/associate/${aid}/attachments`}
                          className="button is-fullwidth-mobile"
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Attachments
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <Link
                          to={`/admin/associate/${aid}/attachment/${atid}/edit`}
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

export default AdminAssociateAttachmentDetail;
