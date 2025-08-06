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
import { PAGE_SIZE_OPTIONS } from "../../../../../Constants/FieldOptions";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";

/*
Display for both tablet and mobile.
*/
function AdminAssociateListMobile(props) {
  const { tid, task, listData, onSelectClick } = props;
  return (
    <>
      {listData &&
        listData.results &&
        listData.results.map(function (datum, i) {
          return (
            <div className="mb-5">
              <hr />
              <strong>Name:</strong>&nbsp;
              <URLTextFormatter
                urlKey={datum.name}
                urlValue={`/admin/associate/${datum.id}`}
                type={`external`}
              />
              <br />
              <br />
              <strong>Phone:</strong>&nbsp;
              {datum.phone ? (
                <PhoneTextFormatter value={datum.phone} />
              ) : (
                <>-</>
              )}
              <br />
              <br />
              <strong>Email:</strong>&nbsp;
              {datum.email ? (
                <EmailTextFormatter value={datum.email} />
              ) : (
                <>-</>
              )}
              <br />
              <br />
              {datum.organizationName && (
                <>
                  <strong>Organization:</strong>&nbsp;{datum.organizationName}
                  <br />
                  <br />
                </>
              )}
              <strong>Contacts (30 days):</strong>&nbsp;
              {datum.contactsLast30Days}
              <br />
              <br />
              <strong>WSIB #:</strong>&nbsp;
              {datum.wsibNumber ? datum.wsibNumber : <>-</>}
              <br />
              <br />
              <strong>Rate:</strong>&nbsp;${datum.hourlySalaryDesired}/hr
              <br />
              <br />
              <strong>Matching Skill Sets:</strong>&nbsp;
              {datum.skillSets && datum.skillSets.length > 0 ? (
                <SkillSetsTextFormatter
                  skillSets={datum.skillSets}
                  showMatchingsSkillSets={task && task.orderSkillSets}
                />
              ) : (
                <>-</>
              )}
              <br />
              <br />
              <Link
                onClick={(e, id, name) => {
                  onSelectClick(tid, datum);
                }}
                className="button is-primary is-fullwidth-mobile"
                type="button"
              >
                Assign&nbsp;
                <FontAwesomeIcon className="mdi" icon={faChevronRight} />
              </Link>
            </div>
          );
        })}

      {/* Developers note: No pagination! */}
    </>
  );
}

export default AdminAssociateListMobile;
