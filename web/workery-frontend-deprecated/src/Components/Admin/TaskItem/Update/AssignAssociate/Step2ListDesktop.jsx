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
import {
  PAGE_SIZE_OPTIONS,
  USER_ROLES,
} from "../../../../../Constants/FieldOptions";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";

function AdminAssociateListDesktop(props) {
  const { tid, task, listData, onSelectClick } = props;
  return (
    <div className="b-table">
      <div className="table-wrapper has-mobile-cards">
        <table className="is-fullwidth is-striped is-hoverable is-fullwidth table">
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Contacts (30 days)</th>
              <th>WSIB #</th>
              <th>Rate</th>
              <th>Matching Skill Sets</th>
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
                    <td data-label="Name">
                      <URLTextFormatter
                        urlKey={datum.name}
                        urlValue={`/admin/associate/${datum.id}`}
                        type={`external`}
                      />
                    </td>
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
                    <td data-label="Contacts (30 days)">
                      {datum.contactsLast30Days}
                    </td>
                    <td data-label="WSIB #">
                      {datum.wsibNumber ? datum.wsibNumber : <>-</>}
                    </td>
                    <td data-label="Rate">${datum.hourlySalaryDesired}/hr</td>
                    <td data-label="Matching Skills">
                      {datum.skillSets && datum.skillSets.length > 0 ? (
                        <SkillSetsTextFormatter
                          skillSets={datum.skillSets}
                          showMatchingsSkillSets={task && task.orderSkillSets}
                        />
                      ) : (
                        <>-</>
                      )}
                    </td>
                    <td className="is-actions-cell">
                      <div className="buttons is-right">
                        <Link
                          onClick={(e, id, name) => {
                            onSelectClick(tid, datum);
                          }}
                          className="is-small"
                        >
                          Assign&nbsp;
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

        {/* Developers note: No pagination! */}
      </div>
    </div>
  );
}

export default AdminAssociateListDesktop;
