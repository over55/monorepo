import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faPencil,
  faTime,
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
import { getBulletinDetailAPI } from "../../../../API/Bulletin";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import BulletinUpdateModal from "./ModalUpdate";
import BulletinDeleteModal from "./ModalDelete";

function BulletinDetailModal({
  currentUser,
  showDetailModalForBulletinID,
  setShowDetailModalBulletinID,
  showUpdateModalForBulletinID,
  setShowUpdateModalForBulletinID,
  showDeleteModalForBulletinID,
  setShowDeleteModalForBulletinID,
  onUpdated,
  onDeleted,
}) {
  ////
  //// Global state.
  ////

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [datum, setDatum] = useState({});

  ////
  //// Event handling.
  ////

  const onCloseModal = () => {
    // setWasCanceledSuccessfully(false);
    setDatum(null);
    setShowDetailModalBulletinID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    setShowUpdateModalForBulletinID(showDetailModalForBulletinID);
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForBulletinID(showDetailModalForBulletinID);
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onBulletinDetailSuccess(response) {
    console.log("onBulletinDetailSuccess: Starting...");
    setDatum(response);
  }

  function onBulletinDetailError(apiErr) {
    console.log("onBulletinDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onBulletinDetailDone() {
    console.log("onBulletinDetailDone: Starting...");
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
        showDetailModalForBulletinID !== undefined &&
        showDetailModalForBulletinID !== null &&
        showDetailModalForBulletinID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getBulletinDetailAPI(
          showDetailModalForBulletinID,
          onBulletinDetailSuccess,
          onBulletinDetailError,
          onBulletinDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForBulletinID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div class={`modal ${showDetailModalForBulletinID ? "is-active" : ""}`}>
        <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">
              <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
              &nbsp;Detail
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
                {datum !== undefined && datum !== null && datum !== "" && (
                  <>
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Bulletin
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Text:
                          </th>
                          <td>{datum.text}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            System
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created At:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={datum.createdAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created By:
                          </th>
                          <td>{datum.createdByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created From:
                          </th>
                          <td>{datum.createdFromIpAddress}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified At:
                          </th>
                          <td>
                            <DateTimeTextFormatter value={datum.modifiedAt} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified By:
                          </th>
                          <td>{datum.modifiedByUserName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified From:
                          </th>
                          <td>{datum.modifiedFromIpAddress}</td>
                        </tr>
                      </tbody>
                    </table>
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
                &nbsp;Close
              </button>
              <button class="button is-warning" onClick={onEditClick}>
                <FontAwesomeIcon className="mdi" icon={faPencil} />
                &nbsp;Edit
              </button>
              <button class="button is-danger" onClick={onDeleteClick}>
                <FontAwesomeIcon className="mdi" icon={faTrash} />
                &nbsp;Delete
              </button>
            </footer>
          )}
        </div>
      </div>

      <BulletinUpdateModal
        currentUser={currentUser}
        showUpdateModalForBulletinID={showUpdateModalForBulletinID}
        setShowUpdateModalForBulletinID={setShowUpdateModalForBulletinID}
        onUpdated={(e) => {
          console.log("BulletinDetailModal | Refreshing detail");
          setFetching(true);
          setErrors({});
          getBulletinDetailAPI(
            showDetailModalForBulletinID,
            onBulletinDetailSuccess,
            onBulletinDetailError,
            onBulletinDetailDone,
            onUnauthorized,
          );

          // Run this inside the parent to refresh the list.
          onUpdated();
        }}
      />

      <BulletinDeleteModal
        currentUser={currentUser}
        showDetailModalForBulletinID={showDetailModalForBulletinID}
        setShowDetailModalBulletinID={setShowDetailModalBulletinID}
        showDeleteModalForBulletinID={showDeleteModalForBulletinID}
        setShowDeleteModalForBulletinID={setShowDeleteModalForBulletinID}
        onDeleted={onDeleted}
      />
    </>
  );
}

export default BulletinDetailModal;
