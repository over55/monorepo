import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import URLTextFormatter from "../../../Reusable/EveryPage/URLTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import { PAGE_SIZE_OPTIONS } from "../../../../Constants/FieldOptions";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
} from "../../../../Constants/App";

/*
Display for both tablet and mobile.
*/
function CustomerOrderListGrid(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    currentUser,
  } = props;
  return (
    <>
      <div className="container mb-6 columns is-multiline">
        {listData &&
          listData.results &&
          listData.results.map(function (datum, i) {
            return (
              <div className="column is-4 mb-5" key={`${datum.wjid}-grid`}>
                {/* CARD */}
                <div
                  className="card has-background-info-light m-4"
                  key={`id_${datum.id}`}
                >
                  {/* HEADER */}
                  <header className="card-header">
                    <p className="is-size-4 card-header-title">
                      <Link to={`/c/order/${datum.wjid}`}>
                        <OrderTypeOfIconFormatter type={datum.type} /> &nbsp;
                        <strong>Job</strong>&nbsp;
                        {datum.wjid}
                      </Link>
                    </p>
                    <button
                      className="card-header-icon"
                      aria-label="more options"
                    >
                      <span className="icon">
                        <i className="fas fa-angle-down" aria-hidden="true"></i>
                      </span>
                    </button>
                  </header>
                  {/* end HEADER */}
                  {/* BODY */}
                  <div className="card-content">
                    <div className="content">
                      <strong>Client:</strong>
                      <br />
                      <URLTextFormatter
                        urlKey={datum.customerName}
                        urlValue={`/c/client/${datum.customerId}`}
                        type={`external`}
                      />
                      <br />
                      <br />
                      <strong>Assigned:</strong>
                      <br />
                      <DateTextFormatter value={datum.assignmentDate} />
                      <br />
                      <br />
                      <strong>Created:</strong>
                      <br />
                      <DateTextFormatter value={datum.createdAt} />
                      <br />
                      <br />
                      <strong>Status:</strong>
                      <br />
                      <OrderStatusFormatter value={datum.status} />
                    </div>
                  </div>
                  {/* end BODY */}
                  {/* BOTTOM */}
                  <footer className="card-footer">
                    {(currentUser.role === EXECUTIVE_ROLE_ID ||
                      currentUser.role === MANAGEMENT_ROLE_ID) && (
                      <Link
                        to={`/c/financial/${datum.wjid}`}
                        className="card-footer-item"
                        type="button"
                      >
                        Financials&nbsp;
                        <FontAwesomeIcon
                          className="mdi"
                          icon={faChevronRight}
                        />
                      </Link>
                    )}
                    <br />
                    <br />
                    <Link
                      to={`/c/order/${datum.wjid}`}
                      className="card-footer-item"
                      type="button"
                    >
                      Detail&nbsp;
                      <FontAwesomeIcon className="mdi" icon={faChevronRight} />
                    </Link>
                  </footer>
                  {/* end Footer */}
                </div>
                {/* end CARD */}
              </div>
            );
          })}
      </div>

      <div className="columns pt-4">
        <div className="column is-half">
          <span className="select">
            <select
              className={`input has-text-grey-light`}
              name="pageSize"
              onChange={(e) => setPageSize(parseInt(e.target.value))}
            >
              {PAGE_SIZE_OPTIONS.map(function (option, i) {
                return (
                  <option
                    selected={pageSize === option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                );
              })}
            </select>
          </span>
        </div>
        <div className="column is-half has-text-right">
          {previousCursors.length > 0 && (
            <>
              <button
                className="button is-info is-fullwidth-mobile"
                onClick={onPreviousClicked}
              >
                Previous
              </button>
              &nbsp;
            </>
          )}
          {listData.hasNextPage && (
            <>
              <button
                className="button is-info is-fullwidth-mobile"
                onClick={onNextClicked}
              >
                Next
              </button>
            </>
          )}
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <p className="has-text-right is-size-5 pb-6">
            Total Results: {listData.count}
          </p>
        </div>
      </div>
    </>
  );
}

export default CustomerOrderListGrid;
