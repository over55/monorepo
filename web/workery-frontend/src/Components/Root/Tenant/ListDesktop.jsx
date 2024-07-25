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
import { DateTime } from "luxon";

import FormErrorBox from "../../Reusable/FormErrorBox";
import { PAGE_SIZE_OPTIONS } from "../../../Constants/FieldOptions";

function RootTenantListDesktop(props) {
  const {
    listData,
    setPageSize,
    pageSize,
    previousCursors,
    onPreviousClicked,
    onNextClicked,
    onSelectTenantForDeletion,
  } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th>Schema</th>
              <th>Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (tenant, i) {
                return (
                  <tr key={`desktop_${tenant.id}`}>
                    <td data-label="Schema">{tenant.schemaName}</td>
                    <td data-label="Name">{tenant.name}</td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          to={`/root/tenant/${tenant.id}`}
                          className="button is-small is-primary"
                          type="button"
                        >
                          <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
                          &nbsp;View
                        </Link>
                        <Link
                          to={`/root/tenant/${tenant.id}/start`}
                          className="button is-small is-success"
                        >
                          Start&nbsp;
                          <FontAwesomeIcon icon={faChevronRight} />
                        </Link>
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
              <button className="button" onClick={onPreviousClicked}>
                Previous
              </button>
            )}
            {listData.hasNextPage && (
              <>
                <button className="button" onClick={onNextClicked}>
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

export default RootTenantListDesktop;
