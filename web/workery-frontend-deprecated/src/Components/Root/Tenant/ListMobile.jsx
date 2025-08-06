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

/*
Display for both tablet and mobile.
*/
function RootTenantListMobile(props) {
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
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
            <div className="mb-5" key={`mobile_tablet_${datum.id}`}>
              {i !== 0 && <hr />}
              <strong>Schema:</strong>&nbsp;{datum.schemaName}
              <br />
              <br />
              <strong>Name:</strong>&nbsp;{datum.name}
              <br />
              <br />
              {/* Tablet only */}
              <div className="is-hidden-mobile pt-2" key={`tablet_${datum.id}`}>
                <div className="buttons is-right">
                  <Link
                    to={`/root/tenant/${datum.id}`}
                    className="button is-small is-primary"
                    type="button"
                  >
                    <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
                    &nbsp;View
                  </Link>
                  <div className="column">
                    <Link
                      to={`/root/tenant/${datum.id}/start`}
                      className="button is-small is-success"
                    >
                      Start&nbsp;
                      <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                  </div>
                </div>
              </div>
              {/* Mobile only */}
              <div className="is-hidden-tablet pt-2" key={`mobile_${datum.id}`}>
                <div className="columns is-mobile">
                  <div className="column">
                    <Link
                      to={`/root/tenant/${datum.id}`}
                      className="button is-small is-primary is-fullwidth"
                      type="button"
                    >
                      <FontAwesomeIcon className="mdi" icon={faCircleInfo} />
                      &nbsp;View
                    </Link>
                  </div>
                  <div className="column">
                    <Link
                      to={`/root/tenant/${datum.id}/start`}
                      className="button is-small is-success is-fullwidth"
                    >
                      Start&nbsp;
                      <FontAwesomeIcon icon={faChevronRight} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

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
    </>
  );
}

export default RootTenantListMobile;
