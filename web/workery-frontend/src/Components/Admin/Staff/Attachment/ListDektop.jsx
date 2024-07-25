import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDownload,
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

import FormErrorBox from "../../../Reusable/FormErrorBox";
import {
  PAGE_SIZE_OPTIONS,
  ATTACHMENT_STATES,
} from "../../../../Constants/FieldOptions";

function AdminStaffDetailAttachmentListDesktop(props) {
  const {
    staffID,
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
              <th>Title</th>
              <th>State</th>
              <th>Created</th>
              <th>File</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listData &&
              listData.results &&
              listData.results.map(function (attachment, i) {
                return (
                  <tr>
                    <td data-label="Title">{attachment.title}</td>
                    <td data-label="State">
                      {ATTACHMENT_STATES[attachment.status]}
                    </td>
                    <td data-label="Created">{attachment.createdAt}</td>
                    <td data-label="File">
                      <a
                        href={attachment.objectUrl}
                        target="_blank"
                        rel="noreferrer"
                        className=""
                      >
                        <FontAwesomeIcon className="mdi" icon={faDownload} />
                        &nbsp;
                        {attachment.filename ? (
                          <>{attachment.filename}</>
                        ) : (
                          <>Download File</>
                        )}
                      </a>
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          to={`/admin/staff/${staffID}/attachment/${attachment.id}`}
                          className="button is-small is-primary"
                          type="button"
                        >
                          View
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

export default AdminStaffDetailAttachmentListDesktop;
