import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faCalendarMinus,
  faCalendarPlus,
  faDumbbell,
  faCalendar,
  faGauge,
  faSearch,
  faCircleInfo,
  faPencil,
  faTrashCan,
  faPlus,
  faArrowRight,
  faTable,
  faArrowUpRightFromSquare,
  faFilter,
  faRefresh,
  faCalendarCheck,
  faUsers,
  faBuilding,
  faHome
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../../../../Reusable/FormErrorBox";
import PhoneTextFormatter from "../../../../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../../../../Reusable/EveryPage/EmailTextFormatter";
import { PAGE_SIZE_OPTIONS } from "../../../../../../../Constants/FieldOptions";
import DateTextFormatter from "../../../../../../Reusable/EveryPage/DateTextFormatter";
import URLTextFormatter from "../../../../../../Reusable/EveryPage/URLTextFormatter";
import {
  DEFAULT_CLIENT_LIST_SORT_BY_VALUE,
  DEFAULT_CLIENT_STATUS_FILTER_OPTION,
  RESIDENTIAL_CUSTOMER_TYPE_OF_ID,
  COMMERCIAL_CUSTOMER_TYPE_OF_ID,
  CLIENT_STATUS_ACTIVE,
} from "../../../../../../../Constants/App";

/*
Display for both tablet and mobile.
*/
function AdminOrderMoreIncidentListGrid(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
  } = props;
  return (
    <div className="container mb-6 columns is-multiline">
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
              <div className="column is-4 mb-5" key={`${datum.id}-grid`}>
                  {/* CARD */}
                  <div
                    className="card has-background-info-light m-4"
                    key={`id_${datum.id}`}
                  >
                      {/* HEADER */}
                      <header className="card-header">
                        <p className="is-size-5 card-header-title">
                        <Link to={`/admin/client/${datum.id}`}>
                          {datum.type ===
                            COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
                            <strong>
                              <FontAwesomeIcon
                                className="fas"
                                icon={faBuilding}
                              />
                              &nbsp;{datum.organizationName}
                            </strong>
                          )}
                          {datum.type ===
                            RESIDENTIAL_CUSTOMER_TYPE_OF_ID && (
                            <strong>
                              <FontAwesomeIcon
                                className="fas"
                                icon={faHome}
                              />
                              &nbsp;{datum.firstName}&nbsp;
                              {datum.lastName}
                            </strong>
                          )}
                        </Link>
                        </p>
                        <button
                          className="card-header-icon"
                          aria-label="more options"
                        >
                          <span className="icon">
                            <i
                              className="fas fa-angle-down"
                              aria-hidden="true"
                            ></i>
                          </span>
                        </button>
                      </header>
                      {/* end HEADER */}
                      {/* BODY */}
                      <div className="card-content">
                      <div className="content">
                        {datum.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && <>
                            <u>{datum.firstName}&nbsp;{datum.lastName}</u>
                             <br />
                        </>}
                        {datum.addressLine1}
                        <br />
                        {datum.city}, {datum.region}
                        <br />
                        {datum.phone ? (
                          <Link to={`tel:${datum.phone}`}>
                            {datum && datum.phone && (
                              <PhoneTextFormatter
                                value={datum.phone}
                              />
                            )}
                          </Link>
                        ) : (
                          <>-</>
                        )}
                        <br />
                        {datum.email ? (
                          <EmailTextFormatter value={datum.email} />
                        ) : (
                          <>-</>
                        )}
                      </div>
                      </div>
                      {/* end BODY */}
                      {/* BOTTOM */}
                      <footer className="card-footer">
                      <Link
                        to={`/admin/client/${datum.id}`}
                        className="card-footer-item"
                      >
                        Select&nbsp;
                        <FontAwesomeIcon
                          className="fas"
                          icon={faChevronRight}
                        />
                      </Link>
                      </footer>
                      {/* end Footer */}
                  </div>
                  {/* end CARD */}
              </div>
          );
        })}

      <div className="columns">
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
    </div>
  );
}

export default AdminOrderMoreIncidentListGrid;
