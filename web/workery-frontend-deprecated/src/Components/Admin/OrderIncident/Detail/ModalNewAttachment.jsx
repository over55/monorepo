import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faCircleInfo,
  faCircleCheck,
  faClose,
  faCheck,
  faCircleExclamation,
  faArrowRight,
  faCheckCircle
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { postOrderIncidentAttachmentCreateAPI } from "../../../../API/OrderIncident";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";

function AttachmentCreateModal({
  currentUser,
  orderIncidentID,
  showModal,
  setShowModal,
  onCreated,
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

  // Modal state.
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  // Form state.
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setShowModal(false);
  };

  const onHandleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const onSaveClick = (e) => {
    console.log("onSubmitClick: Starting...");
    setFetching(true);
    setErrors({});

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("order_incident_id", orderIncidentID);
    console.log("onSubmitClick: formData:", formData);

    postOrderIncidentAttachmentCreateAPI(
      formData,
      onAttachmentCreateSuccess,
      onAttachmentCreateError,
      onAttachmentCreateDone,
      onUnauthorized,
    );
    console.log("onSubmitClick: Finished.");
  };

  ////
  //// API.
  ////

  // --- Create --- //

  function onAttachmentCreateSuccess(response) {
    console.log("onAttachmentCreateSuccess: Starting...");
    onCreated();
    onCloseModal();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Attachment created");
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
  }

  function onAttachmentCreateError(apiErr) {
    console.log("onAttachmentCreateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAttachmentCreateDone() {
    console.log("onAttachmentCreateDone: Starting...");
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
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div class={`modal ${showModal ? "is-active" : ""}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faPlus} />
            &nbsp;New Attachment
          </p>
          <button
            class="delete"
            aria-label="close"
            onClick={onCloseModal}
          ></button>
        </header>
        <section class="modal-card-body">
          {isFetching ? (
            <div class="column has-text-centered is-1">
              <div class="loader-wrapper is-centered">
                <br />
                <div
                  class="loader is-loading"
                  style={{ height: "80px", width: "80px" }}
                ></div>
              </div>
              <br />
              <div className="">Fetching...</div>
              <br />
            </div>
          ) : (
            <div class="content">
              <FormErrorBox errors={errors} />
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

            </div>
          )}
        </section>
        {isFetching ? (
          <></>
        ) : (
          <footer class="modal-card-foot">
            <button class="button" onClick={onCloseModal}>
              <FontAwesomeIcon className="mdi" icon={faClose} />
              &nbsp;Cancel
            </button>
            <button class="button is-success" onClick={onSaveClick}>
              <FontAwesomeIcon className="mdi" icon={faCheck} />
              &nbsp;Submit
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default AttachmentCreateModal;
