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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import Scroll from "react-scroll";

import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../AppState";
import { postBulletinCreateAPI } from "../../../../API/Bulletin";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormTextareaField from "../../../Reusable/FormTextareaField";

function BulletinCreateModal({
  currentUser,
  showCreateModal,
  setShowCreateModal,
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
  const [text, setText] = useState("");

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setFetching(false);
    setText("");
    setErrors({});
    setShowCreateModal(false);
  };

  const onSaveClick = () => {
    console.log("onSaveClick: Starting...");
    setFetching(true);
    setErrors({});
    postBulletinCreateAPI(
      {
        text: text,
      },
      onBulletinCreateSuccess,
      onBulletinCreateError,
      onBulletinCreateDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Create --- //

  function onBulletinCreateSuccess(response) {
    console.log("onBulletinCreateSuccess: Starting...");
    onCreated();
    onCloseModal();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Bulletin created");
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

  function onBulletinCreateError(apiErr) {
    console.log("onBulletinCreateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onBulletinCreateDone() {
    console.log("onBulletinCreateDone: Starting...");
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
    <div class={`modal ${showCreateModal ? "is-active" : ""}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faPlus} />
            &nbsp;New Bulletin
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
              <FormTextareaField
                label="Text"
                name="text"
                placeholder="Text input"
                value={text}
                errorText={errors && errors.text}
                helpText=""
                onChange={(e) => setText(e.target.value)}
                isRequired={true}
                maxWidth="280px"
                helpText={"Max 638 characters"}
                rows={4}
              />
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

export default BulletinCreateModal;
