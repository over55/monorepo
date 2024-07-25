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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../../Reusable/FormErrorBox";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import {
  PAGE_SIZE_OPTIONS,
  ACTIVITY_SHEET_STATUS_MAP,
} from "../../../../../Constants/FieldOptions";

function AdminOrderActivitySheetListDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th>Associate</th>
              <th>Created At</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (datum, i) {
                return (
                  <tr className="is-size-7-tablet">
                    <td data-label="Associate">
                      <URLTextFormatter
                        urlKey={datum.associateName}
                        urlValue={`/admin/associate/${datum.associateId}`}
                        type={`external`}
                      />
                    </td>
                    <td data-label="Start Date">
                      <DateTextFormatter value={datum.createdAt} />
                    </td>
                    <td data-label="Status">
                      {ACTIVITY_SHEET_STATUS_MAP[datum.status]}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

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
                <button className="button is-info" onClick={onPreviousClicked}>
                  Previous
                </button>
                &nbsp;
              </>
            )}
            {listData.hasNextPage && (
              <>
                <button className="button is-info" onClick={onNextClicked}>
                  Next
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderActivitySheetListDesktop;
