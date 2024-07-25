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
import { getSkillSetDetailAPI } from "../../../../API/SkillSet";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import RadioTextFormatter from "../../../Reusable/EveryPage/RadioTextFormatter";
import SkillSetUpdateModal from "./ModalUpdate";
import SkillSetDeleteModal from "./ModalDelete";

function SkillSetDetailModal({
  currentUser,
  showDetailModalForSkillSetID,
  setShowDetailModalSkillSetID,
  showUpdateModalForSkillSetID,
  setShowUpdateModalForSkillSetID,
  showDeleteModalForSkillSetID,
  setShowDeleteModalForSkillSetID,
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
    setShowDetailModalSkillSetID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    setShowUpdateModalForSkillSetID(showDetailModalForSkillSetID);
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForSkillSetID(showDetailModalForSkillSetID);
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onSkillSetDetailSuccess(response) {
    console.log("onSkillSetDetailSuccess: Starting...");
    setDatum(response);
  }

  function onSkillSetDetailError(apiErr) {
    console.log("onSkillSetDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onSkillSetDetailDone() {
    console.log("onSkillSetDetailDone: Starting...");
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
        showDetailModalForSkillSetID !== undefined &&
        showDetailModalForSkillSetID !== null &&
        showDetailModalForSkillSetID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getSkillSetDetailAPI(
          showDetailModalForSkillSetID,
          onSkillSetDetailSuccess,
          onSkillSetDetailError,
          onSkillSetDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForSkillSetID]);

  ////
  //// RENDER COMPONENT
  ////

  console.log("datum:", datum); // For debugging purposes only.

  return (
    <>
      <div class={`modal ${showDetailModalForSkillSetID ? "is-active" : ""}`}>
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
                            Skill Set
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Category:
                          </th>
                          <td>{datum.category}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Sub-Category:
                          </th>
                          <td>{datum.subCategory}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description:
                          </th>
                          <td>{datum.description}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Status:
                          </th>
                          <td>
                            {datum.status === 1 && <>Active</>}
                            {datum.status === 2 && <>Archived</>}
                          </td>
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
                          <td>
                            {datum.createdByUserName ? (
                              datum.createdByUserName
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Created From:
                          </th>
                          <td>
                            {datum.createdFromIpAddress ? (
                              datum.createdFromIpAddress
                            ) : (
                              <>-</>
                            )}
                          </td>
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
                          <td>
                            {datum.modifiedByUserName ? (
                              datum.modifiedByUserName
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Modified From:
                          </th>
                          <td>
                            {datum.modifiedFromIpAddress ? (
                              datum.modifiedFromIpAddress
                            ) : (
                              <>-</>
                            )}
                          </td>
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

      <SkillSetUpdateModal
        currentUser={currentUser}
        showUpdateModalForSkillSetID={showUpdateModalForSkillSetID}
        setShowUpdateModalForSkillSetID={setShowUpdateModalForSkillSetID}
        onUpdated={(e) => {
          console.log("SkillSetDetailModal | Refreshing detail");
          setFetching(true);
          setErrors({});
          getSkillSetDetailAPI(
            showDetailModalForSkillSetID,
            onSkillSetDetailSuccess,
            onSkillSetDetailError,
            onSkillSetDetailDone,
            onUnauthorized,
          );

          // Run this inside the parent to refresh the list.
          onUpdated();
        }}
      />

      <SkillSetDeleteModal
        currentUser={currentUser}
        showDetailModalForSkillSetID={showDetailModalForSkillSetID}
        setShowDetailModalSkillSetID={setShowDetailModalSkillSetID}
        showDeleteModalForSkillSetID={showDeleteModalForSkillSetID}
        setShowDeleteModalForSkillSetID={setShowDeleteModalForSkillSetID}
        onDeleted={onDeleted}
      />
    </>
  );
}

export default SkillSetDetailModal;
