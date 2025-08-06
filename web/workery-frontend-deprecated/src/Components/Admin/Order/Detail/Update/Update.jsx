import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faTags,
  faEnvelope,
  faTable,
  faAddressCard,
  faSquarePhone,
  faTasks,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faWrench,
  faGauge,
  faPencil,
  faUsers,
  faCircleInfo,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faEllipsis,
  faMap,
  faGraduationCap
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";
import { useParams } from "react-router-dom";

import deepClone from "../../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../../Helpers/datetimeUtility";
import { getOrderDetailAPI, putOrderUpdateAPI } from "../../../../../API/Order";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import OrderStatusFormatter from "../../../../Reusable/SpecificPage/Order/StatusFormatter";
import OrderTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Order/TypeOfIconFormatter";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import FormRadioField from "../../../../Reusable/FormRadioField";
import FormAlternateDateField from "../../../../Reusable/FormAlternateDateField";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormMultiSelectField from "../../../../Reusable/FormMultiSelectField";
import FormMultiSelectFieldForSkillSets from "../../../../Reusable/FormMultiSelectFieldForSkillSets";
import FormMultiSelectFieldForTags from "../../../../Reusable/FormMultiSelectFieldForTags";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
} from "../../../../../AppState";
import { COMMERCIAL_CUSTOMER_TYPE_OF_ID } from "../../../../../Constants/App";
import {
  addCustomerState,
  ADD_CUSTOMER_STATE_DEFAULT,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
} from "../../../../../Constants/FieldOptions";

function AdminOrderUpdate() {
  ////
  //// URL Parameters.
  ////

  const { oid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);

  ////
  //// Component states.
  ////

    // --- Page related --- //
  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [order, setOrder] = useState({});

  // --- Form related --- //
  const [startDate, setStartDate] = useState(null);
  const [isOngoing, setIsOngoing] = useState(null);
  const [isHomeSupportService, setIsHomeSupportService] = useState(false);

  const [description, setDescription] = useState("");
  const [skillSets, setSkillSets] = useState([]);
  const [tags, setTags] = useState([]);


  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");

    const payload = deepClone(order); // Make a copy of the read-only data.

    // Fix 1: startDate
    if (order.startDate !== undefined && order.startDate !== null) {
      if (!isISODate(order.startDate)) {
        const startDateObject = new Date(order.startDate);
        const startDateISOString = startDateObject.toISOString();
        payload.startDate = startDateISOString;
      }
    }

    payload.isOngoing = isOngoing;
    payload.isHomeSupportService = isHomeSupportService;
    payload.description = description;
    payload.skillSets = skillSets;
    payload.tags = tags;

    console.log("onSubmitClick: payload:", payload);

    setFetching(false);
    setErrors({});
    putOrderUpdateAPI(payload, onUpdateSuccess, onUpdateError, onUpdateDone);
  };

  ////
  //// API.
  ////

  // --- Retrieve --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setOrder(response);

    // Set form related fields.
    setStartDate(response.startDate);
    if (response.isOngoing) {
        setIsOngoing(1);
    } else {
        setIsOngoing(2);
    }
    if (response.isHomeSupportService) {
        setIsHomeSupportService(1);
    } else {
        setIsHomeSupportService(2);
    }
    setDescription(response.description);

    const skillSetsIDArray = response.skillSets.map(item => item.id);
    setSkillSets(skillSetsIDArray);

    const tagsIDArray = response.tags.map(item => item.id);
    setTags(tagsIDArray);
  }

  function onError(apiErr) {
    console.log("onError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onDone() {
    console.log("onDone: Starting...");
    setFetching(false);
  }

  // --- Update --- //

  function onUpdateSuccess(response) {
    console.log("onUpdateSuccess: Starting...");
    console.log(response);

    if (response === undefined || response === null || response === "") {
      console.log("onSuccess: exiting early");
      return;
    }

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Order updated");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onSuccess: Delayed for 2 seconds.");
      console.log(
        "onSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    setForceURL("/admin/order/"+oid);
  }

  function onUpdateError(apiErr) {
    console.log("onUpdateError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onUpdateDone() {
    console.log("onUpdateDone: Starting...");
    setFetching(false);
  }

  const onUnauthorized = () => {
    setForceURL("/login?unauthorized=true"); // If token expired or user is not logged in, redirect back to login.
  };

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(true);
      getOrderDetailAPI(oid, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, [oid]);

  ////
  //// Component rendering.
  ////

  if (forceURL !== "") {
    return <Navigate to={forceURL} />;
  }

  return (
    <>
      <div className="container">
        <section className="section">
          {/* Desktop Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-touch p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGauge} />
                  &nbsp;Dashboard
                </Link>
              </li>
              <li className="">
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faWrench} />
                  &nbsp;Orders
                </Link>
              </li>
              <li className="">
                <Link to={`/admin/order/${oid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Order&nbsp;#{oid}
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faPencil} />
                  &nbsp;Update
                </Link>
              </li>
            </ul>
          </nav>

          {/* Mobile Breadcrumbs */}
          <nav
            className="breadcrumb has-background-light is-hidden-desktop p-4"
            aria-label="breadcrumbs"
          >
            <ul>
              <li className="">
                <Link to={`/admin/order/${oid}`} aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Detail
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {order && order.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Order
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {order && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faPencil} />
                    &nbsp;Update
                  </p>
                </div>
                <div className="column has-text-right">
                {/*
                  <Link
                    to={`/admin/order/${oid}/edit`}
                    className="button is-small is-warning is-fullwidth-mobile"
                    type="button"
                    disabled={order.status === 2}
                  >
                    <FontAwesomeIcon className="mdi" icon={faPencil} />
                    &nbsp;Edit
                  </Link>
                  */}
                </div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {order && (
                  <div className="container">
                  <hr />

                  <p className="title is-4 pb-2">
                    <FontAwesomeIcon className="fas" icon={faBuilding} />
                    &nbsp;General
                  </p>

                  <FormRadioField
                    label="Is this job one time or ongoing?"
                    name="isOngoing"
                    value={isOngoing}
                    errorText={errors && errors.isOngoing}
                    opt1Value={2}
                    opt1Label="One-Time"
                    opt2Value={1}
                    opt2Label="Ongoing"
                    onChange={(e) => setIsOngoing(parseInt(e.target.value))}
                    errorText={errors && errors.isOngoing}
                  />
                  <FormRadioField
                    label="Is this job a home support service?"
                    name="isHomeSupportService"
                    value={isHomeSupportService}
                    errorText={errors && errors.isHomeSupportService}
                    opt1Value={2}
                    opt1Label="No"
                    opt2Value={1}
                    opt2Label="Yes"
                    onChange={(e) =>
                      setIsHomeSupportService(parseInt(e.target.value))
                    }
                    errorText={errors && errors.isHomeSupportService}
                  />

                  <FormAlternateDateField
                    label="When should this job start? (Optional)"
                    name="startDate"
                    placeholder="Text input"
                    value={startDate}
                    helpText="Leave blank if nothing was specified by client."
                    onChange={(date) => setStartDate(date)}
                    isRequired={true}
                    maxWidth="180px"
                    errorText={errors && errors.startDate}
                  />

                  <p className="title is-4 pb-2">
                    <FontAwesomeIcon className="fas" icon={faGraduationCap} />
                    &nbsp;Skill Sets
                  </p>

                  <FormTextareaField
                    label="Describe the Job:"
                    name="description"
                    placeholder="Describe here..."
                    value={description}
                    errorText={errors && errors.description}
                    helpText=""
                    onChange={(e) => setDescription(e.target.value)}
                    isRequired={true}
                    maxWidth="280px"
                    helpText={"Max 1,000 characters"}
                    rows={4}
                  />

                  <FormMultiSelectFieldForSkillSets
                    label="Please select required job skill(s):"
                    name="skillSets"
                    placeholder="Pick skill sets"
                    skillSets={skillSets}
                    setSkillSets={setSkillSets}
                    errorText={errors && errors.skillSets}
                    helpText="Pick at least a single skill set at minimum."
                    isRequired={true}
                  />

                  <p className="title is-4 pb-2">
                    <FontAwesomeIcon className="fas" icon={faChartPie} />
                    &nbsp;Metrics
                  </p>

                  <FormMultiSelectFieldForTags
                    label="Tags (Optional)"
                    name="tags"
                    placeholder="Pick tags"
                    tags={tags}
                    setTags={setTags}
                    errorText={errors && errors.tags}
                    helpText="Pick the tags you would like to associate with this order."
                    isRequired={true}
                    maxWidth="320px"
                  />




                    <div className="columns pt-5">
                      <div className="column is-half">
                        <Link
                          className="button is-fullwidth-mobile"
                          to={`/admin/order/${oid}`}
                        >
                          <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                          &nbsp;Back to Detail
                        </Link>
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-success is-fullwidth-mobile"
                          disabled={order.status === 2}
                        >
                          <FontAwesomeIcon className="fas" icon={faCheckCircle} />
                          &nbsp;Save&nbsp;&&nbsp;Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminOrderUpdate;
