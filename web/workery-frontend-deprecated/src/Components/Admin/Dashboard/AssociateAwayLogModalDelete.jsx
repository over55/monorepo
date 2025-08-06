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
import { deleteAssociateAwayLogAPI } from "../../../API/AssociateAwayLog";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../Reusable/FormErrorBox";

function AssociateAwayLogDeleteModal({
  currentUser,
  showDeleteModalForAssociateAwayLogID,
  setShowDeleteModalForAssociateAwayLogID,
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
    setShowDeleteModalForAssociateAwayLogID("");
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setFetching(true);
    setErrors({});
    deleteAssociateAwayLogAPI(
      showDeleteModalForAssociateAwayLogID,
      onAssociateAwayLogDeleteSuccess,
      onAssociateAwayLogDeleteError,
      onAssociateAwayLogDeleteDone,
      onUnauthorized,
    );
  };

  ////
  //// API.
  ////

  // --- Delete --- //

  function onAssociateAwayLogDeleteSuccess() {
    console.log("onAssociateAwayLogDeleteSuccess: Starting...");
    onSuccessDeleteCallbackFunc();

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("AssociateAwayLog deleted");
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

    onCloseModal();
  }

  function onAssociateAwayLogDeleteError(apiErr) {
    console.log("onAssociateAwayLogDeleteError: Starting...");
    setErrors(apiErr);
  }

  function onAssociateAwayLogDeleteDone() {
    console.log("onAssociateAwayLogDeleteDone: Starting...");
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
    <div
      class={`modal ${showDeleteModalForAssociateAwayLogID ? "is-active" : ""}`}
    >
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
                You are about to delete this associate news. This action cannot
                be undone. Are you sure you want to continue?
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

export default AssociateAwayLogDeleteModal;
