import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import {
  faArrowUpRightFromSquare,
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
import { getAssociateAwayLogDetailAPI } from "../../../../API/AssociateAwayLog";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import AssociateAwayLogUpdateModal from "./ModalUpdate";
import AssociateAwayLogDeleteModal from "./ModalDelete";
import {
  PAGE_SIZE_OPTIONS,
  ASSOCIATE_AWAY_LOG_REASONS,
} from "../../../../Constants/FieldOptions";
import AssociateAwayLogReasonIconFormatter from "../../../Reusable/SpecificPage/AssociateAwayLog/ReasonIconFormatter";

function AssociateAwayLogDetailModal(props) {
  ////
  //// Props.
  ////

  const {
    currentUser,
    showDetailModalForAssociateAwayLogID,
    setShowDetailModalAssociateAwayLogID,
    showUpdateModalForAssociateAwayLogID,
    setShowUpdateModalForAssociateAwayLogID,
    showDeleteModalForAssociateAwayLogID,
    setShowDeleteModalForAssociateAwayLogID,
    onUpdated,
    onDeleted,
  } = props;

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
    setShowDetailModalAssociateAwayLogID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    console.log(
      "onEditClick: showDetailModalForAssociateAwayLogID:",
      showDetailModalForAssociateAwayLogID,
    );
    console.log(
      "onEditClick: showUpdateModalForAssociateAwayLogID:",
      showUpdateModalForAssociateAwayLogID,
    );
    setShowUpdateModalForAssociateAwayLogID(
      showDetailModalForAssociateAwayLogID,
    );
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForAssociateAwayLogID(
      showDetailModalForAssociateAwayLogID,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onAssociateAwayLogDetailSuccess(response) {
    console.log("onAssociateAwayLogDetailSuccess: Starting...");
    setDatum(response);
  }

  function onAssociateAwayLogDetailError(apiErr) {
    console.log("onAssociateAwayLogDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onAssociateAwayLogDetailDone() {
    console.log("onAssociateAwayLogDetailDone: Starting...");
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
        showDetailModalForAssociateAwayLogID !== undefined &&
        showDetailModalForAssociateAwayLogID !== null &&
        showDetailModalForAssociateAwayLogID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getAssociateAwayLogDetailAPI(
          showDetailModalForAssociateAwayLogID,
          onAssociateAwayLogDetailSuccess,
          onAssociateAwayLogDetailError,
          onAssociateAwayLogDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForAssociateAwayLogID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div
        class={`modal ${showDetailModalForAssociateAwayLogID ? "is-active" : ""}`}
      >
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
                            Associate News
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate&nbsp;
                            <FontAwesomeIcon
                              className="fas"
                              icon={faArrowUpRightFromSquare}
                            />
                            :
                          </th>
                          <td>
                            <Link
                              target="_blank"
                              rel="noreferrer"
                              to={`/admin/associate/${datum.associateId}`}
                            >
                              {datum.associateName}
                            </Link>
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Reason:
                          </th>
                          <td>
                            {datum.reason === 1 ? (
                              <span>{datum.reasonOther}</span>
                            ) : (
                              <span>
                                <AssociateAwayLogReasonIconFormatter
                                  reason={datum.reason}
                                />
                                &nbsp;{ASSOCIATE_AWAY_LOG_REASONS[datum.reason]}
                              </span>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Away until:
                          </th>
                          <td>
                            {datum.untilFurtherNotice === 1 ? (
                              <span>Further notice.</span>
                            ) : (
                              <DateTextFormatter value={datum.untilDate} />
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Start Date:
                          </th>
                          <td>
                            <DateTextFormatter value={datum.startDate} />
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

      {showUpdateModalForAssociateAwayLogID !== undefined &&
        showUpdateModalForAssociateAwayLogID !== null &&
        showUpdateModalForAssociateAwayLogID !== "" && (
          <>
            <AssociateAwayLogUpdateModal
              currentUser={currentUser}
              showUpdateModalForAssociateAwayLogID={
                showUpdateModalForAssociateAwayLogID
              }
              setShowUpdateModalForAssociateAwayLogID={
                setShowUpdateModalForAssociateAwayLogID
              }
              onUpdated={(e) => {
                console.log("AssociateAwayLogDetailModal | Refreshing detail");
                setFetching(true);
                setErrors({});
                getAssociateAwayLogDetailAPI(
                  showDetailModalForAssociateAwayLogID,
                  onAssociateAwayLogDetailSuccess,
                  onAssociateAwayLogDetailError,
                  onAssociateAwayLogDetailDone,
                  onUnauthorized,
                );

                // Run this inside the parent to refresh the list.
                onUpdated();

                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
            />
          </>
        )}

      <AssociateAwayLogDeleteModal
        currentUser={currentUser}
        showDetailModalForAssociateAwayLogID={
          showDetailModalForAssociateAwayLogID
        }
        setShowDetailModalAssociateAwayLogID={
          setShowDetailModalAssociateAwayLogID
        }
        showDeleteModalForAssociateAwayLogID={
          showDeleteModalForAssociateAwayLogID
        }
        setShowDeleteModalForAssociateAwayLogID={
          setShowDeleteModalForAssociateAwayLogID
        }
        onDeleted={onDeleted}
      />
    </>
  );
}

export default AssociateAwayLogDetailModal;
