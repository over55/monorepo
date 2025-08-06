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
import { getVehicleTypeDetailAPI } from "../../../../API/VehicleType";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import VehicleTypeUpdateModal from "./ModalUpdate";
import VehicleTypeDeleteModal from "./ModalDelete";

function VehicleTypeDetailModal({
  currentUser,
  showDetailModalForVehicleTypeID,
  setShowDetailModalVehicleTypeID,
  showUpdateModalForVehicleTypeID,
  setShowUpdateModalForVehicleTypeID,
  showDeleteModalForVehicleTypeID,
  setShowDeleteModalForVehicleTypeID,
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
    setShowDetailModalVehicleTypeID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    console.log(
      "onEditClick: showDetailModalForVehicleTypeID:",
      showDetailModalForVehicleTypeID,
    );
    console.log(
      "onEditClick: showUpdateModalForVehicleTypeID:",
      showUpdateModalForVehicleTypeID,
    );
    setShowUpdateModalForVehicleTypeID(showDetailModalForVehicleTypeID);
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForVehicleTypeID(showDetailModalForVehicleTypeID);
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onVehicleTypeDetailSuccess(response) {
    console.log("onVehicleTypeDetailSuccess: Starting...");
    setDatum(response);
  }

  function onVehicleTypeDetailError(apiErr) {
    console.log("onVehicleTypeDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onVehicleTypeDetailDone() {
    console.log("onVehicleTypeDetailDone: Starting...");
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
        showDetailModalForVehicleTypeID !== undefined &&
        showDetailModalForVehicleTypeID !== null &&
        showDetailModalForVehicleTypeID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getVehicleTypeDetailAPI(
          showDetailModalForVehicleTypeID,
          onVehicleTypeDetailSuccess,
          onVehicleTypeDetailError,
          onVehicleTypeDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForVehicleTypeID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div
        class={`modal ${showDetailModalForVehicleTypeID ? "is-active" : ""}`}
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
                            Vehicle Type
                          </th>
                          <th className="has-text-white" colSpan="2">
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Name:
                          </th>
                          <td>{datum.name}</td>
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

      {showUpdateModalForVehicleTypeID !== undefined &&
        showUpdateModalForVehicleTypeID !== null &&
        showUpdateModalForVehicleTypeID !== "" && (
          <>
            <VehicleTypeUpdateModal
              currentUser={currentUser}
              showUpdateModalForVehicleTypeID={showUpdateModalForVehicleTypeID}
              setShowUpdateModalForVehicleTypeID={
                setShowUpdateModalForVehicleTypeID
              }
              onUpdated={(e) => {
                console.log("VehicleTypeDetailModal | Refreshing detail");
                setFetching(true);
                setErrors({});
                getVehicleTypeDetailAPI(
                  showDetailModalForVehicleTypeID,
                  onVehicleTypeDetailSuccess,
                  onVehicleTypeDetailError,
                  onVehicleTypeDetailDone,
                  onUnauthorized,
                );

                // Run this inside the parent to refresh the list.
                onUpdated();

                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
            />
          </>
        )}

      <VehicleTypeDeleteModal
        currentUser={currentUser}
        showDetailModalForVehicleTypeID={showDetailModalForVehicleTypeID}
        setShowDetailModalVehicleTypeID={setShowDetailModalVehicleTypeID}
        showDeleteModalForVehicleTypeID={showDeleteModalForVehicleTypeID}
        setShowDeleteModalForVehicleTypeID={setShowDeleteModalForVehicleTypeID}
        onDeleted={onDeleted}
      />
    </>
  );
}

export default VehicleTypeDetailModal;
