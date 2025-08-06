import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faCircleCheck,
  faClose,
  faCheck,
  faCircleExclamation,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { topAlertMessageState, topAlertStatusState } from "../../../AppState";
import { deleteBulletinAPI } from "../../../API/Bulletin";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../Reusable/FormErrorBox";

function BulletinDeleteModal({
  currentUser,
  showDeleteModalForBulletinID,
  setShowDeleteModalForBulletinID,
  onSuccessDeleteCallbackFunc,
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

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    setShowDeleteModalForBulletinID(null);
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setFetching(true);
    setErrors({});
    deleteBulletinAPI(
      showDeleteModalForBulletinID,
      onBulletinDeleteSuccess,
      onBulletinDeleteError,
      onBulletinDeleteDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Delete --- //

  function onBulletinDeleteSuccess() {
    console.log("onBulletinDeleteSuccess: Starting...");
    onSuccessDeleteCallbackFunc();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Bulletin deleted");
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

    setShowDeleteModalForBulletinID(""); // This will cause the modal to close.
  }

  function onBulletinDeleteError(apiErr) {
    console.log("onBulletinDeleteError: Starting...");
    setErrors(apiErr);
  }

  function onBulletinDeleteDone() {
    console.log("onBulletinDeleteDone: Starting...");
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
    <div class={`modal ${showDeleteModalForBulletinID ? "is-active" : ""}`}>
      <div class="modal-background"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <FontAwesomeIcon className="mdi" icon={faTrash} />
            &nbsp;Delete
          </p>
          <button
            class="delete"
            aria-label="close"
            onClick={onCloseModal}
          ></button>
        </header>
        {isFetching ? (
          <>
            <section class="modal-card-body">
              <div class="column has-text-centered is-1">
                <div class="loader-wrapper is-centered">
                  <br />
                  <div
                    class="loader is-loading"
                    style={{ height: "80px", width: "80px" }}
                  ></div>
                </div>
                <br />
                <div className="">Deleting...</div>
                <br />
              </div>
            </section>
          </>
        ) : (
          <>
            <section class="modal-card-body">
              <div class="content">
                <FormErrorBox errors={errors} />
                You are about to delete this bulletin. This action cannot be
                undone. Are you sure you want to continue?
              </div>
            </section>
            <footer class="modal-card-foot">
              <button class="button" onClick={onCloseModal}>
                <FontAwesomeIcon className="mdi" icon={faClose} />
                &nbsp;Cancel
              </button>
              <button class="button is-success" onClick={onDeleteClick}>
                <FontAwesomeIcon className="mdi" icon={faCheck} />
                &nbsp;Confirm and Delete
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default BulletinDeleteModal;
