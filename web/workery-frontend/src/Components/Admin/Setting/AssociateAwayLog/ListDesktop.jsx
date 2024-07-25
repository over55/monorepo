import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretUp,
  faCaretDown,
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

import FormErrorBox from "../../../Reusable/FormErrorBox";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import DateTimeTextFormatter from "../../../Reusable/EveryPage/DateTimeTextFormatter";
import DateTextFormatter from "../../../Reusable/EveryPage/DateTextFormatter";
import {
  PAGE_SIZE_OPTIONS,
  ASSOCIATE_AWAY_LOG_REASONS,
} from "../../../../Constants/FieldOptions";
import AssociateAwayLogReasonIconFormatter from "../../../Reusable/SpecificPage/AssociateAwayLog/ReasonIconFormatter";

function AdminSettingAssociateAwayLogListDesktop(props) {
  ////
  //// Props.
  ////

  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectAssociateAwayLogForDeletion,
    sortByValue,
    showDetailModalForAssociateAwayLogID,
    setShowDetailModalAssociateAwayLogID,
  } = props;

  ////
  //// Render
  ////

  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th>
                Associate&nbsp;
                <FontAwesomeIcon
                  className="fas"
                  icon={faArrowUpRightFromSquare}
                />
              </th>
              <th>Reason</th>
              <th>Away until</th>
              <th>Start</th>
              <th>
                Created At
                {sortByValue === "created_at,ASC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretUp} />
                  </>
                )}
                {sortByValue === "created_at,DESC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretDown} />
                  </>
                )}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (datum, i) {
                return (
                  <tr>
                    <td data-label="Text">
                      <Link
                        target="_blank"
                        rel="noreferrer"
                        to={`/admin/associate/${datum.associateId}`}
                      >
                        {datum.associateName}
                      </Link>
                    </td>
                    <td data-label="Reason">
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
                    <td data-label="Away until">
                      {datum.untilFurtherNotice === 1 ? (
                        <span>Further notice.</span>
                      ) : (
                        <DateTextFormatter value={datum.untilDate} />
                      )}
                    </td>
                    <td data-label="Start Date">
                      <DateTextFormatter value={datum.startDate} />
                    </td>
                    <td data-label="Created At">
                      <DateTimeTextFormatter value={datum.createdAt} />
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          onClick={(id) => {
                            setShowDetailModalAssociateAwayLogID(datum.id);
                          }}
                          className="is-small"
                        >
                          View&nbsp;
                          <FontAwesomeIcon
                            className="mdi"
                            icon={faChevronRight}
                          />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>

        <p className="has-text-right is-size-5 pb-6">
          Total Results: {listData.count}
        </p>

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

export default AdminSettingAssociateAwayLogListDesktop;
