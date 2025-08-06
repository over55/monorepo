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
  ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  ASSOCIATE_TYPE_OF_FILTER_OPTIONS,
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  GENDER_OPTIONS_WITH_EMPTY_OPTION,
  IDENTIFY_AS_OPTIONS,
} from "../../../Constants/FieldOptions";
import SkillSetsTextFormatter from "../../Reusable/EveryPage/SkillSetsTextFormatter";
import InsuranceRequirementsTextFormatter from "../../Reusable/EveryPage/InsuranceRequirementsTextFormatter";
import DriversLicenseClassesTextFormatter from "../../Reusable/EveryPage/DriversLicenseClassesTextFormatter";
import VehicleTypesTextFormatter from "../../Reusable/EveryPage/VehicleTypesTextFormatter";
import MultiSelectTextFormatter from "../../Reusable/EveryPage/MultiSelectTextFormatter";
import RadioTextFormatter from "../../Reusable/EveryPage/RadioTextFormatter";

function AccountAssociateJobSeekerDetail({ currentUser }) {
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
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Date of Birth:
            </th>
            <td>
              {currentUser.birthDate ? (
                <DateTextFormatter value={currentUser.birthDate} />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Gender:
            </th>
            <td>
              {currentUser.gender ? (
                <>
                  <SelectTextFormatter
                    selectedValue={currentUser.gender}
                    options={GENDER_OPTIONS_WITH_EMPTY_OPTION}
                  />
                  {currentUser.gender === 1 && (
                    <>&nbsp;-&nbsp;{currentUser.genderOther}</>
                  )}
                </>
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Description:
            </th>
            <td>
              {currentUser.description ? currentUser.description : <>-</>}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Tags:
            </th>
            <td>
              {currentUser.tags && currentUser.tags.length > 0 ? (
                <TagsTextFormatter tags={currentUser.tags} />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Skill Sets:
            </th>
            <td>
              {currentUser.skillSets && currentUser.skillSets.length > 0 ? (
                <SkillSetsTextFormatter skillSets={currentUser.skillSets} />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
        </tbody>
      </table>

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
                options={ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
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
                    options={ASSOCIATE_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS}
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

      {/*
                          ##########################
                          ACCOUNT
                          ##########################
                      */}
      <table className="is-fullwidth table">
        <thead>
          <tr className="has-background-black">
            <th className="has-text-white" colSpan="2">
              Account
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Insurance Requirement(s):
            </th>
            <td>
              {currentUser.insuranceRequirements &&
              currentUser.insuranceRequirements.length > 0 ? (
                <InsuranceRequirementsTextFormatter
                  insuranceRequirements={currentUser.insuranceRequirements}
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Hourly salary desired (Optional):
            </th>
            <td>${currentUser.hourlySalaryDesired}&nbsp;/&nbsp;hr</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Limit special:
            </th>
            <td>
              {currentUser.limitSpecial ? currentUser.limitSpecial : <>-</>}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Dues Expiry:
            </th>
            <td>
              <DateTextFormatter value={currentUser.duesDate} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Commercial insurance expiry date:
            </th>
            <td>
              <DateTextFormatter
                value={currentUser.commercialInsuranceExpiryDate}
              />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Auto Insurance Expiry Date:
            </th>
            <td>
              <DateTextFormatter value={currentUser.autoInsuranceExpiryDate} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              WSIB #:
            </th>
            <td>{currentUser.wsibNumber ? currentUser.wsibNumber : <>-</>}</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              WSIB Insurance Date:
            </th>
            <td>
              <DateTextFormatter value={currentUser.wsibInsuranceDate} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Police check date:
            </th>
            <td>
              <DateTextFormatter value={currentUser.policeCheck} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              HST #:
            </th>
            <td>{currentUser.taxId ? currentUser.taxId : <>-</>}</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Drivers license class(es):
            </th>
            <td>
              {currentUser.driversLicenseClass &&
              currentUser.driversLicenseClass.length > 0 ? (
                <DriversLicenseClassesTextFormatter
                  driversLicenseClass={currentUser.driversLicenseClass}
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Vehicle(s):
            </th>
            <td>
              {currentUser.vehicleTypes &&
              currentUser.vehicleTypes.length > 0 ? (
                <VehicleTypesTextFormatter
                  vehicleTypes={currentUser.vehicleTypes}
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          {/*
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Account Balance:
            </th>
            <td>TODO</td>
          </tr>
          */}
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Is active:
            </th>
            <td>
              {currentUser.status === 1 ? (
                <span>Active</span>
              ) : (
                <span>Archive</span>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Preferred Language:
            </th>
            <td>
              {currentUser.gender ? (
                <RadioTextFormatter
                  value={currentUser.preferredLanguage}
                  opt1Value="English"
                  opt1Label="English"
                  opt2Value="French"
                  opt2Label="French"
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/*
                          ##########################
                          Emergency Contact Table
                          ##########################
                      */}
      <table className="is-fullwidth table">
        <thead>
          <tr className="has-background-black">
            <th className="has-text-white" colSpan="2">
              Emergency Contact
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Name:
            </th>
            <td>{currentUser.emergencyContactName}</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Relationship:
            </th>
            <td>{currentUser.emergencyContactRelationship}</td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Telephone:
            </th>
            <td>
              {currentUser.emergencyContactTelephone ? (
                <PhoneTextFormatter
                  value={currentUser.emergencyContactTelephone}
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Alternate Telephone:
            </th>
            <td>
              {currentUser.emergencyContactAlternativeTelephone ? (
                <PhoneTextFormatter
                  value={currentUser.emergencyContactAlternativeTelephone}
                />
              ) : (
                <>-</>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/*
                          ##########################
                          Internal Metrics Table
                          ##########################
                      */}
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
            <th className="has-background-light" style={{ width: "30%" }}>
              How did they discover us?:
            </th>
            <td>
              {currentUser.isHowDidYouHearAboutUsOther
                ? currentUser.howDidYouHearAboutUsOther
                : currentUser.howDidYouHearAboutUsText}
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Join date:
            </th>
            <td>
              <DateTimeTextFormatter value={currentUser.joinDate} />
            </td>
          </tr>
          <tr>
            <th className="has-background-light" style={{ width: "30%" }}>
              Do you identify as belonging to any of the following groups?
            </th>
            <td>
              <MultiSelectTextFormatter
                selectedValues={currentUser.identifyAs}
                options={IDENTIFY_AS_OPTIONS}
              />
            </td>
          </tr>
        </tbody>
      </table>

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

export default AccountAssociateJobSeekerDetail;
