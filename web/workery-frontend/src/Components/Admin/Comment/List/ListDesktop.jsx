import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHardHat,
  faWrench,
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
  faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import FormErrorBox from "../../../Reusable/FormErrorBox";
import PhoneTextFormatter from "../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../Reusable/EveryPage/EmailTextFormatter";
import {
  PAGE_SIZE_OPTIONS,
  USER_ROLES,
} from "../../../../Constants/FieldOptions";

function AdminCommentListDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectCommentForDeletion,
    sortByValue,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th></th>
              <th>Content</th>
              <th>Belongs to</th>
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
                    <td></td>
                    <td data-label="Content">{datum.content}</td>
                    <td data-label="Belongs to">
                      {datum.belongsTo == 1 && (
                        <>
                          <FontAwesomeIcon
                            className="fas"
                            icon={faUserCircle}
                          />
                          &nbsp;Customer
                        </>
                      )}
                      {datum.belongsTo == 2 && (
                        <>
                          <FontAwesomeIcon className="fas" icon={faHardHat} />
                          &nbsp;Associate
                        </>
                      )}
                      {datum.belongsTo == 3 && (
                        <>
                          <FontAwesomeIcon className="fas" icon={faWrench} />
                          &nbsp;Order
                        </>
                      )}
                    </td>
                    <td data-label="Created At">{datum.createdAt}</td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        {datum.belongsTo == 1 && (
                          <Link
                            to={`/admin/client/${datum.customerId}/comments`}
                            className="is-small"
                          >
                            View&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faChevronRight}
                            />
                          </Link>
                        )}
                        {datum.belongsTo == 2 && (
                          <Link
                            to={`/admin/associate/${datum.associateId}/comments`}
                            className="is-small"
                          >
                            View&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faChevronRight}
                            />
                          </Link>
                        )}
                        {datum.belongsTo == 3 && (
                          <Link
                            to={`/admin/order/${datum.orderWjid}/comments`}
                            className="is-small"
                          >
                            View&nbsp;
                            <FontAwesomeIcon
                              className="mdi"
                              icon={faChevronRight}
                            />
                          </Link>
                        )}
                      </div>
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

export default AdminCommentListDesktop;
