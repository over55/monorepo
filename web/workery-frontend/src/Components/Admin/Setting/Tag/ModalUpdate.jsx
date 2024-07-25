import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil,
  faCircleCheck,
  faClose,
  faCheck,
  faCircleExclamation,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { getTagDetailAPI, putTagUpdateAPI } from "../../../../API/Tag";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";

function TagUpdateModal({
  currentUser,
  showUpdateModalForTagID,
  setShowUpdateModalForTagID,
  onUpdated,
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
  const [datum, setDatum] = useState({});

  // Form state.
  const [text, setText] = useState("");
  const [description, setDescription] = useState("");

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setErrors({});
    setDatum(null);
    setShowUpdateModalForTagID("");
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setErrors({});
    setFetching(true);
    // setDatum(null);
    // setShowUpdateModalForTagID("");
    // onReloadList(); // Cause the page to get latest list.
    putTagUpdateAPI(
      {
        id: showUpdateModalForTagID,
        text: text,
        description: description,
      },
      onTagUpdateSuccess,
      onTagUpdateError,
      onTagUpdateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onTagDetailSuccess(response) {
    console.log("onTagDetailSuccess: Starting...");
    setDatum(response);
    setText(response.text);
    setDescription(response.description);
  }

  function onTagDetailError(apiErr) {
    console.log("onTagDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTagDetailDone() {
    console.log("onTagDetailDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onTagUpdateSuccess(response) {
    console.log("onTagUpdateSuccess: Starting...");
    onCloseModal();
    onUpdated();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Tag updated");
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

    console.log("onTagUpdateSuccess: Done");
  }

  function onTagUpdateError(apiErr) {
    console.log("onTagUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onTagUpdateDone() {
    console.log("onTagUpdateDone: Starting...");
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

      // Do not fetch API if we do not have anything selected.
      if (
        showUpdateModalForTagID !== undefined &&
        showUpdateModalForTagID !== null &&
        showUpdateModalForTagID !== ""
      ) {
        setFetching(true);
        getTagDetailAPI(
          showUpdateModalForTagID,
          onTagDetailSuccess,
          onTagDetailError,
          onTagDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showUpdateModalForTagID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <div class={`modal ${showUpdateModalForTagID ? "is-active" : ""}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faPencil} />
            &nbsp;Edit
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
              {datum !== undefined && datum !== null && datum !== "" && (
                <>
                  <FormErrorBox errors={errors} />
                  <FormInputField
                    label="Text"
                    name="text"
                    placeholder="Text input"
                    value={text}
                    errorText={errors && errors.text}
                    helpText=""
                    onChange={(e) => setText(e.target.value)}
                    isRequired={true}
                    maxWidth="100%"
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
              &nbsp;Confirm and Save
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}

export default TagUpdateModal;
