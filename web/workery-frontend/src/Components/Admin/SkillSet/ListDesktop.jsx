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

import FormErrorBox from "../../Reusable/FormErrorBox";
import { PAGE_SIZE_OPTIONS, USER_ROLES } from "../../../Constants/FieldOptions";
import PhoneTextFormatter from "../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import SkillSetsTextFormatter from "../../Reusable/EveryPage/SkillSetsTextFormatter";

function AdminAssociateSkillSetSearchResultDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectAssociateForDeletion,
    sortByValue,
    targetSkillSetIDs = [],
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th></th>
              <th>First Name</th>
              <th>
                Last Name
                {sortByValue === "lexical_name,ASC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretUp} />
                  </>
                )}
                {sortByValue === "lexical_name,DESC" && (
                  <>
                    &nbsp;
                    <FontAwesomeIcon className="fas" icon={faCaretDown} />
                  </>
                )}
              </th>
              <th>Phone</th>
              <th>Email</th>
              <th>Skill Set(s)</th>
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
                    <td data-label="First Name">{datum.firstName}</td>
                    <td data-label="Last Name">{datum.lastName}</td>
                    <td data-label="Phone">
                      {datum.phone ? (
                        <PhoneTextFormatter value={datum.phone} />
                      ) : (
                        <>-</>
                      )}
                    </td>
                    <td data-label="Email">
                      <Link to={`mailto:${datum.email}`}>{datum.email}</Link>
                    </td>
                    <td data-label="Skill Set(s)">
                      <SkillSetsTextFormatter
                        skillSets={datum.skillSets}
                        highlightMatchingsSkillSetIDs={targetSkillSetIDs}
                      />
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/associate/${datum.id}`}
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

export default AdminAssociateSkillSetSearchResultDesktop;
