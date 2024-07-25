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
import { getServiceFeeDetailAPI } from "../../../../API/ServiceFee";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import ServiceFeeUpdateModal from "./ModalUpdate";
import ServiceFeeDeleteModal from "./ModalDelete";

function ServiceFeeDetailModal({
  currentUser,
  showDetailModalForServiceFeeID,
  setShowDetailModalServiceFeeID,
  showUpdateModalForServiceFeeID,
  setShowUpdateModalForServiceFeeID,
  showDeleteModalForServiceFeeID,
  setShowDeleteModalForServiceFeeID,
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
    setShowDetailModalServiceFeeID("");
  };

  const onEditClick = () => {
    console.log("onEditClick: Starting...");
    console.log(
      "onEditClick: showDetailModalForServiceFeeID:",
      showDetailModalForServiceFeeID,
    );
    console.log(
      "onEditClick: showUpdateModalForServiceFeeID:",
      showUpdateModalForServiceFeeID,
    );
    setShowUpdateModalForServiceFeeID(showDetailModalForServiceFeeID);
  };

  const onDeleteClick = () => {
    console.log("onDeleteClick: Starting...");
    setShowDeleteModalForServiceFeeID(showDetailModalForServiceFeeID);
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onServiceFeeDetailSuccess(response) {
    console.log("onServiceFeeDetailSuccess: Starting...");
    setDatum(response);
  }

  function onServiceFeeDetailError(apiErr) {
    console.log("onServiceFeeDetailError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onServiceFeeDetailDone() {
    console.log("onServiceFeeDetailDone: Starting...");
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
        showDetailModalForServiceFeeID !== undefined &&
        showDetailModalForServiceFeeID !== null &&
        showDetailModalForServiceFeeID !== ""
      ) {
        setFetching(true);
        setErrors({});
        getServiceFeeDetailAPI(
          showDetailModalForServiceFeeID,
          onServiceFeeDetailSuccess,
          onServiceFeeDetailError,
          onServiceFeeDetailDone,
          onUnauthorized,
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [showDetailModalForServiceFeeID]);

  ////
  //// RENDER COMPONENT
  ////

  return (
    <>
      <div class={`modal ${showDetailModalForServiceFeeID ? "is-active" : ""}`}>
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
                            Service Fee
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
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Percentage:
                          </th>
                          <td>{datum.percentage}</td>
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

      {showUpdateModalForServiceFeeID !== undefined &&
        showUpdateModalForServiceFeeID !== null &&
        showUpdateModalForServiceFeeID !== "" && (
          <>
            <ServiceFeeUpdateModal
              currentUser={currentUser}
              showUpdateModalForServiceFeeID={showUpdateModalForServiceFeeID}
              setShowUpdateModalForServiceFeeID={
                setShowUpdateModalForServiceFeeID
              }
              onUpdated={(e) => {
                console.log("ServiceFeeDetailModal | Refreshing detail");
                setFetching(true);
                setErrors({});
                getServiceFeeDetailAPI(
                  showDetailModalForServiceFeeID,
                  onServiceFeeDetailSuccess,
                  onServiceFeeDetailError,
                  onServiceFeeDetailDone,
                  onUnauthorized,
                );

                // Run this inside the parent to refresh the list.
                onUpdated();

                window.scrollTo(0, 0); // Start the page at the top of the page.
              }}
            />
          </>
        )}

      <ServiceFeeDeleteModal
        currentUser={currentUser}
        showDetailModalForServiceFeeID={showDetailModalForServiceFeeID}
        setShowDetailModalServiceFeeID={setShowDetailModalServiceFeeID}
        showDeleteModalForServiceFeeID={showDeleteModalForServiceFeeID}
        setShowDeleteModalForServiceFeeID={setShowDeleteModalForServiceFeeID}
        onDeleted={onDeleted}
      />
    </>
  );
}

export default ServiceFeeDetailModal;
