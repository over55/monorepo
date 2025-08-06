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
import { getClientDetailAPI } from "../../../../API/Client";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import InactiveClientUpdateModal from "./ModalUpdate";
import InactiveClientDeleteModal from "./ModalDelete";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import SelectTextFormatter from "../../../Reusable/EveryPage/SelectTextFormatter";
import {
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  INACTIVE_CLIENT_DEACTIVATION_REASON_MAP,
} from "../../../../Constants/FieldOptions";

function InactiveClientDetailModal({
  currentUser,
  showDetailModalForInactiveClientID,
  setShowDetailModalInactiveClientID,
  showUpdateModalForInactiveClientID,
  setShowUpdateModalForInactiveClientID,
  showDeleteModalForInactiveClientID,
  setShowDeleteModalForInactiveClientID,
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
    setShowDetailModalInactiveClientID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    console.log(
      "onEditClick: showDetailModalForInactiveClientID:",
      showDetailModalForInactiveClientID,
    );
    console.log(
      "onEditClick: showUpdateModalForInactiveClientID:",
      showUpdateModalForInactiveClientID,
    );
    setShowUpdateModalForInactiveClientID(showDetailModalForInactiveClientID);
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForInactiveClientID(showDetailModalForInactiveClientID);
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onInactiveClientDetailSuccess(response) {
    console.log("onInactiveClientDetailSuccess: Starting...");
    setDatum(response);
  }

  function onInactiveClientDetailError(apiErr) {
    console.log("onInactiveClientDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onInactiveClientDetailDone() {
    console.log("onInactiveClientDetailDone: Starting...");
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
        showDetailModalForInactiveClientID !== undefined &&
        showDetailModalForInactiveClientID !== null &&
        showDetailModalForInactiveClientID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getClientDetailAPI(
          showDetailModalForInactiveClientID,
          onInactiveClientDetailSuccess,
          onInactiveClientDetailError,
          onInactiveClientDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForInactiveClientID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div
        class={`modal ${showDetailModalForInactiveClientID ? "is-active" : ""}`}
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
                            Inactive Client
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            First Name:
                          </th>
                          <td>{datum.firstName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Last Name:
                          </th>
                          <td>{datum.lastName}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Date of Birth:
                          </th>
                          <td>
                            {datum.birthDate ? (
                              <DateTextFormatter value={datum.birthDate} />
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
                            Gender:
                          </th>
                          <td>
                            {datum.gender ? (
                              <>
                                <SelectTextFormatter
                                  selectedValue={datum.gender}
                                  options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                                />
                                {datum.gender === 1 && (
                                  <>&nbsp;-&nbsp;{datum.genderOther}</>
                                )}
                              </>
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
                            Description:
                          </th>
                          <td>
                            {datum.description ? datum.description : <>-</>}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Deactivation Reason:
                          </th>
                          <td>
                            {datum.deactivationReason ? (
                              <>
                                {/* If other, else value. */}
                                {datum.deactivationReason === 1
                                  ? datum.deactivationReasonOther
                                  : INACTIVE_CLIENT_DEACTIVATION_REASON_MAP[
                                      datum.deactivationReason
                                    ]}
                              </>
                            ) : (
                              <>-</>
                            )}
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

      {showUpdateModalForInactiveClientID !== undefined &&
        showUpdateModalForInactiveClientID !== null &&
        showUpdateModalForInactiveClientID !== "" && (
          <>
            <InactiveClientUpdateModal
              currentUser={currentUser}
              showUpdateModalForInactiveClientID={
                showUpdateModalForInactiveClientID
              }
              setShowUpdateModalForInactiveClientID={
                setShowUpdateModalForInactiveClientID
              }
              onUpdated={(e) => {
                console.log("InactiveClientDetailModal | Refreshing detail");
                setFetching(true);
                setErrors({});
                getClientDetailAPI(
                  showDetailModalForInactiveClientID,
                  onInactiveClientDetailSuccess,
                  onInactiveClientDetailError,
                  onInactiveClientDetailDone,
                  onUnauthorized,
                );

                // Run this inside the parent to refresh the list.
                onUpdated();

                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
            />
          </>
        )}

      <InactiveClientDeleteModal
        currentUser={currentUser}
        showDetailModalForInactiveClientID={showDetailModalForInactiveClientID}
        setShowDetailModalInactiveClientID={setShowDetailModalInactiveClientID}
        showDeleteModalForInactiveClientID={showDeleteModalForInactiveClientID}
        setShowDeleteModalForInactiveClientID={
          setShowDeleteModalForInactiveClientID
        }
        onDeleted={onDeleted}
      />
    </>
  );
}

export default InactiveClientDetailModal;
