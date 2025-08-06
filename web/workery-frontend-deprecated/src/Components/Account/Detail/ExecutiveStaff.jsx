import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleInfo,
  faBuilding,
  faEnvelope,
  faSquarePhone,
  faTable,
  faHome,
  faImage,
  faEllipsis,
  faRepeat,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faUserCircle,
  faGauge,
  faPencil,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getAccountDetailAPI } from "../../../API/Account";
import DateTimeTextFormatter from "../../Reusable/EveryPage/DateTimeTextFormatter";
import CheckboxTextFormatter from "../../Reusable/EveryPage/CheckboxTextFormatter";
import SelectTextFormatter from "../../Reusable/EveryPage/SelectTextFormatter";
import FormErrorBox from "../../Reusable/FormErrorBox";
import {
  topAlertMessageState,
  topAlertStatusState,
  currentUserState,
} from "../../../AppState";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import TagsTextFormatter from "../../Reusable/EveryPage/TagsTextFormatter";
import URLTextFormatter from "../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../Reusable/EveryPage/PhoneTextFormatter";
import DateTextFormatter from "../../Reusable/EveryPage/DateTextFormatter";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../Constants/App";
import {
  EXECUTIVE_ROLE_ID,
  MANAGEMENT_ROLE_ID,
  FRONTLINE_ROLE_ID,
  ASSOCIATE_ROLE_ID,
  CUSTOMER_ROLE_ID,
} from "../../../Constants/App";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
} from "../../../Constants/FieldOptions";

function AccountExecutiveStaffDetail({ currentUser }) {
  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
    }

    return () => {
      mounted = false;
    };
  }, []);

  ////
  //// Component rendering.
  ////

  return (
    <>
      {/*
      ##########################
      Peronsal Information Table
      ##########################
    */}
      <table className="is-fullwidth table">
        <thead>
          <tr className="has-background-black">
            <th className="has-text-white" colSpan="2">
              Personal Information
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Type:
            </th>
            <td>Executive Staff</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              First Name:
            </th>
            <td>{currentUser.firstName}</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Last Name:
            </th>
            <td>{currentUser.lastName}</td>
          </tr>
        </tbody>
      </table>

      {/*
        ##########################
        Company Information Table
        ##########################
    */}
      {currentUser.type === COMMERCIAL_CUSTOMER_TYPE_OF_ID && (
        <table className="is-fullwidth table">
          <thead>
            <tr className="has-background-black">
              <th className="has-text-white" colSpan="2">
                Company Information
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="has-background-light" style={{ width: "30%" }}>
                Company Name:
              </th>
              <td>{currentUser.organizationName}</td>
            </tr>
            <tr>
              <th className="has-background-light" style={{ width: "30%" }}>
                Company Type:
              </th>
              <td>
                <SelectTextFormatter
                  selectedValue={currentUser.organizationType}
                  options={CLIENT_ORGANIZATION_TYPE_OPTIONS}
                />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/*
        ###################
        Contact Point Table
        ###################
    */}
      <table className="is-fullwidth table">
        <thead>
          <tr className="has-background-black">
            <th className="has-text-white" colSpan="2">
              Contact Point
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Email:
            </th>
            <td>
              {currentUser.email ? (
                <EmailTextFormatter value={currentUser.email} />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              I agree to receive electronic email:
            </th>
            <td>
              <CheckboxTextFormatter checked={currentUser.isOkToEmail} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Phone:
            </th>
            <td>
              {currentUser.phone ? (
                <PhoneTextFormatter value={currentUser.phone} />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Phone Type:
            </th>
            <td>
              <SelectTextFormatter
                selectedValue={currentUser.phoneType}
                options={CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
              />
            </td>
          </tr>
          {currentUser.otherPhone && (
            <>
              <tr>
                <th className="has-background-light" style={{ width: "30%" }}>
                  Other Phone (Optional):
                </th>
                <td>
                  {currentUser.otherPhone ? (
                    <PhoneTextFormatter value={currentUser.otherPhone} />
                  ) : (
                    <>-</>
                  )}
                </td>
              </tr>
              <tr>
                <th className="has-background-light" style={{ width: "30%" }}>
                  Other Phone Type (Optional):
                </th>
                <td>
                  <SelectTextFormatter
                    selectedValue={currentUser.otherPhoneType}
                    options={CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
                  />
                </td>
              </tr>
            </>
          )}
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              I agree to receive texts to my phone:
            </th>
            <td>
              <CheckboxTextFormatter checked={currentUser.isOkToText} />
            </td>
          </tr>
        </tbody>
      </table>

      {/*
        ##########################
        Address Table
        ##########################
    */}
      {currentUser.role !== EXECUTIVE_ROLE_ID && (
        <table className="is-fullwidth table">
          <thead>
            <tr className="has-background-black">
              <th className="has-text-white" colSpan="2">
                Address
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th className="has-background-light" style={{ width: "30%" }}>
                Location:
              </th>
              <td>
                <URLTextFormatter
                  urlKey={currentUser.fullAddressWithPostalCode}
                  urlValue={currentUser.fullAddressUrl}
                  type={`external`}
                />
              </td>
            </tr>
          </tbody>
        </table>
      )}

      {/*
        ##########################
        Internal Metrics Table
        ##########################
    */}
      {/*
    <table className="is-fullwidth table">
      <thead>
        <tr className="has-background-black">
          <th className="has-text-white" colSpan="2">
            Internal Metrics
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th
            className="has-background-light"
            style={{ width: "30%" }}
          >
            How did they discover us?:
          </th>
          <td>
            {currentUser.isHowDidYouHearAboutUsOther
              ? currentUser.howDidYouHearAboutUsOther
              : currentUser.howDidYouHearAboutUsText}
          </td>
        </tr>
        <tr>
          <th
            className="has-background-light"
            style={{ width: "30%" }}
          >
            Join date:
          </th>
          <td>
            <DateTimeTextFormatter
              value={currentUser.joinDate}
            />
          </td>
        </tr>
      </tbody>
    </table>
    */}

      {/*
        <DataDisplayRowHowHearAboutUsItem
            howDidYouHearAboutUsID={currentUser.howDidYouHearAboutUsID}
        />

        {currentUser.howDidYouHearAboutUsOther !== undefined && currentUser.howDidYouHearAboutUsOther !== null && currentUser.howDidYouHearAboutUsOther !== null &&
            <DataDisplayRowText
                label="How did you hear about us? (Other)"
                value={currentUser.howDidYouHearAboutUsOther}
            />
        }
    */}

      {/*
        ##########################
        System Table
        ##########################
    */}
      <table className="is-fullwidth table">
        <thead>
          <tr className="has-background-black">
            <th className="has-text-white" colSpan="2">
              System
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Created at:
            </th>
            <td>
              <DateTimeTextFormatter value={currentUser.createdAt} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Modified at:
            </th>
            <td>
              <DateTimeTextFormatter value={currentUser.modifiedAt} />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
}

export default AccountExecutiveStaffDetail;
