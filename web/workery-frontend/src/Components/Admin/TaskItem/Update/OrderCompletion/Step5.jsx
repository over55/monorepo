import React, { useState, useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRight,
  faHome,
  faTags,
  faEnvelope,
  faTable,
  faAddressCard,
  faSquarePhone,
  faTachometer,
  faPlus,
  faArrowLeft,
  faCheckCircle,
  faTasks,
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
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import deepClone from "../../../../../Helpers/deepCloneUtility";
import { isISODate } from "../../../../../Helpers/datetimeUtility";
import {
  getTaskItemDetailAPI,
  postTaskOrderCompletionOperationAPI,
} from "../../../../../API/TaskItem";
import FormErrorBox from "../../../../Reusable/FormErrorBox";
import URLTextFormatter from "../../../../Reusable/EveryPage/URLTextFormatter";
import EmailTextFormatter from "../../../../Reusable/EveryPage/EmailTextFormatter";
import PhoneTextFormatter from "../../../../Reusable/EveryPage/PhoneTextFormatter";
import TagsTextFormatter from "../../../../Reusable/EveryPage/TagsTextFormatter";
import SkillSetsTextFormatter from "../../../../Reusable/EveryPage/SkillSetsTextFormatter";
import DateTextFormatter from "../../../../Reusable/EveryPage/DateTextFormatter";
import DateTimeTextFormatter from "../../../../Reusable/EveryPage/DateTimeTextFormatter";
import SelectTextFormatter from "../../../../Reusable/EveryPage/SelectTextFormatter";
import ServiceFeeIDsTextFormatter from "../../../../Reusable/EveryPage/ServiceFeeIDsTextFormatter";
// import TaskStatusFormatter from "../../../../Reusable/SpecificPage/Task/StatusFormatter";
// import TaskTypeOfIconFormatter from "../../../../Reusable/SpecificPage/Task/TypeOfIconFormatter";
import CheckboxTextFormatter from "../../../../Reusable/EveryPage/CheckboxTextFormatter";
import RadioTextFormatter from "../../../../Reusable/EveryPage/RadioTextFormatter";
import FormTextareaField from "../../../../Reusable/FormTextareaField";
import FormRadioField from "../../../../Reusable/FormRadioField";
import AlertBanner from "../../../../Reusable/EveryPage/AlertBanner";
import DataDisplayRowURL from "../../../../Reusable/DetailPage/DataDisplayRowURL";
import PageLoadingContent from "../../../../Reusable/PageLoadingContent";
import {
  topAlertMessageState,
  topAlertStatusState,
  addTaskItemOrderCompletionState,
  ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT,
  taskItemDetailState,
} from "../../../../../AppState";
import {
  CLIENT_PHONE_TYPE_OF_OPTIONS_WITH_EMPTY_OPTIONS,
  CLIENT_TYPE_OF_FILTER_OPTIONS,
  CLIENT_ORGANIZATION_TYPE_OPTIONS,
  CLIENT_PHONE_TYPE_OF_MAP,
  TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION,
  ORDER_INVOICE_PAYMENT_METHODS_OPTIONS
} from "../../../../../Constants/FieldOptions";
import {
  ORDER_STATUS_COMPLETED_AND_PAID,
  ORDER_STATUS_COMPLETED_BUT_UNPAID,
} from "../../../../../Constants/App";
import MultiSelectTextFormatter from "../../../../Reusable/EveryPage/MultiSelectTextFormatter";

function AdminTaskItemOrderCompletionStep5() {
  ////
  //// URL Arguments.
  ////

  const { tid } = useParams();

  ////
  //// Global state.
  ////

  const [topAlertMessage, setTopAlertMessage] =
    useRecoilState(topAlertMessageState);
  const [topAlertStatus, setTopAlertStatus] =
    useRecoilState(topAlertStatusState);
  const [addTaskItemOrderCompletion, setAddTaskItemOrderCompletion] =
    useRecoilState(addTaskItemOrderCompletionState);
  const [task, setTask] = useRecoilState(taskItemDetailState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = () => {
    console.log("onSubmitClick: Beginning...");
    console.log("onSubmitClick: task:", task);

    const modifiedTask = deepClone(addTaskItemOrderCompletion); // Make a copy of the read-only data.

    // Apply the following fixes to our payload.

    // Fix 1: completionDate
    if (
      modifiedTask.completionDate !== undefined &&
      modifiedTask.completionDate !== null &&
      modifiedTask.completionDate !== ""
    ) {
      if (!isISODate(modifiedTask.completionDate)) {
        const dateObject = new Date(modifiedTask.completionDate);
        const dateISOString = dateObject.toISOString();
        modifiedTask.completionDate = dateISOString;
      }
    }

    // Fix 2: invoiceDate
    if (
      modifiedTask.invoiceDate !== undefined &&
      modifiedTask.invoiceDate !== null &&
      modifiedTask.invoiceDate !== ""
    ) {
      if (!isISODate(modifiedTask.invoiceDate)) {
        const dateObject = new Date(modifiedTask.invoiceDate);
        const dateISOString = dateObject.toISOString();
        modifiedTask.invoiceDate = dateISOString;
      }
    }

    // Fix 3: invoiceServiceFeePaymentDate
    if (
      modifiedTask.invoiceServiceFeePaymentDate !== undefined &&
      modifiedTask.invoiceServiceFeePaymentDate !== null &&
      modifiedTask.invoiceServiceFeePaymentDate !== ""
    ) {
      if (!isISODate(modifiedTask.invoiceServiceFeePaymentDate)) {
        const dateObject = new Date(modifiedTask.invoiceServiceFeePaymentDate);
        const dateISOString = dateObject.toISOString();
        modifiedTask.invoiceServiceFeePaymentDate = dateISOString;
      }
    }

    // Make a copy of the read-only data in snake case format.
    const payload = {
      task_item_id: tid,
      was_completed: modifiedTask.wasCompleted,
      reason: modifiedTask.reason,
      reason_other: modifiedTask.reasonOther,
      reason_comment: modifiedTask.reasonComment,
      completion_date: modifiedTask.completionDate,
      visits: parseInt(modifiedTask.visits),
      closing_reason_comment: modifiedTask.closingReasonComment,
      has_inputted_financials: modifiedTask.hasInputtedFinancials,
      invoice_paid_to: modifiedTask.invoicePaidTo,
      payment_status: modifiedTask.paymentStatus,
      invoice_date: modifiedTask.invoiceDate,
      invoice_ids: modifiedTask.invoiceIDs,
      invoice_quoted_labour_amount: parseFloat(modifiedTask.invoiceQuotedLabourAmount),
      invoice_quoted_material_amount: parseFloat(modifiedTask.invoiceQuotedMaterialAmount),
      invoice_quoted_other_costs_amount:
        parseFloat(modifiedTask.invoiceQuotedOtherCostsAmount),
      invoice_total_quote_amount: parseFloat(modifiedTask.invoiceTotalQuoteAmount),
      invoice_labour_amount: parseFloat(modifiedTask.invoiceLabourAmount),
      invoice_material_amount: parseFloat(modifiedTask.invoiceMaterialAmount),
      invoice_other_costs_amount: parseFloat(modifiedTask.invoiceOtherCostsAmount),
      invoice_tax_amount: parseFloat(modifiedTask.invoiceTaxAmount),
      invoice_is_custom_tax_amount: true ? (modifiedTask.invoiceIsCustomTaxAmount === "true" || modifiedTask.invoiceIsCustomTaxAmount === true || modifiedTask.invoiceIsCustomTaxAmount === 1) : false,
      invoice_total_amount: parseFloat(modifiedTask.invoiceTotalAmount),
      invoice_deposit_amount: parseFloat(modifiedTask.invoiceDepositAmount),
      invoice_amount_due: parseFloat(modifiedTask.invoiceAmountDue),
      invoice_service_fee_id: modifiedTask.invoiceServiceFeeID,
      invoice_service_fee_percentage: modifiedTask.invoiceServiceFeePercentage,
      invoice_service_fee: modifiedTask.invoiceServiceFee,
      invoice_service_fee_other: modifiedTask.invoiceServiceFeeOther,
      is_invoice_service_fee_other: modifiedTask.isInvoiceServiceFeeOther,
      invoice_service_fee_amount: parseFloat(modifiedTask.invoiceServiceFeeAmount),
      invoice_service_fee_payment_date:
        modifiedTask.invoiceServiceFeePaymentDate,
      invoice_actual_service_fee_amount_paid:
        modifiedTask.invoiceActualServiceFeeAmountPaid,
      invoice_balance_owing_amount: parseFloat(modifiedTask.invoiceBalanceOwingAmount),
      comment: modifiedTask.comment,
      payment_methods: modifiedTask.paymentMethods,
    };

    // Fix 4: Do not include financials if not specificed.
    if (modifiedTask.hasInputtedFinancials == 2) {
      console.log("onSubmitClick: no financials entered");
      delete payload.invoice_paid_to;
      delete payload.payment_status;
      delete payload.invoice_date;
      delete payload.invoice_ids;
      delete payload.invoice_quoted_labour_amount;
      delete payload.invoice_quoted_material_amount;
      delete payload.invoice_quoted_other_costs_amount;
      delete payload.invoice_total_quote_amount;
      delete payload.invoice_labour_amount;
      delete payload.invoice_material_amount;
      delete payload.invoice_other_costs_amount;
      delete payload.invoice_tax_amount;
      delete payload.invoice_is_custom_tax_amount;
      delete payload.invoice_total_amount;
      delete payload.invoice_deposit_amount;
      delete payload.invoice_amount_due;
      delete payload.invoice_service_fee_id;
      delete payload.invoice_service_fee_percentage;
      delete payload.invoice_service_fee;
      delete payload.invoice_service_fee_other;
      delete payload.is_invoice_service_fee_other;
      delete payload.invoice_service_fee_amount;
      delete payload.invoice_service_fee_payment_date;
      delete payload.invoice_actual_service_fee_amount_paid;
      delete payload.invoice_balance_owing_amount;
      delete payload.paymentMethods;
    }

    console.log("onSubmitClick: payload:", payload);

    setFetching(false);
    setErrors({});
    postTaskOrderCompletionOperationAPI(
      payload,
      onOperationSuccess,
      onOperationError,
      onOperationDone,
    );
  };

  ////
  //// API.
  ////

  // --- Detail --- //

  function onSuccess(response) {
    console.log("onSuccess: Starting...");
    setTask(response);
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

  // --- Operation --- //

  function onOperationSuccess(response) {
    console.log("onOperationSuccess: Starting...");

    // Add a temporary banner message in the app and then clear itself after 2 seconds.
    setTopAlertMessage("Task completed");
    setTopAlertStatus("success");
    setTimeout(() => {
      console.log("onOperationSuccess: Delayed for 2 seconds.");
      console.log(
        "onOperationSuccess: topAlertMessage, topAlertStatus:",
        topAlertMessage,
        topAlertStatus,
      );
      setTopAlertMessage("");
    }, 2000);

    // Clear all data that staff inputed in this wizard.
    setAddTaskItemOrderCompletion(ADD_TASK_ITEM_ORDER_COMPLETION_STATE_DEFAULT);

    // Redirect the user to a new page.
    setForceURL("/admin/order/"+task.orderWjid);
  }

  function onOperationError(apiErr) {
    console.log("onOperationError: Starting...");
    setErrors(apiErr);

    // The following code will cause the screen to scroll to the top of
    // the page. Please see ``react-scroll`` for more information:
    // https://github.com/fisshy/react-scroll
    var scroll = Scroll.animateScroll;
    scroll.scrollToTop();
  }

  function onOperationDone() {
    console.log("onOperationDone: Starting...");
    setFetching(false);
  }

  // --- All --- //

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

      // DEVELOPERS NOTE:
      // Why are we calling the task item details API if we used persistent
      // storage throughout this wizard? We are doing this so in case
      // the staff member is about to finish this task item and will
      // updated on any last minute changes made by the system before
      // they submit into the system; therefore, if two simulatious staff
      // members are working on this task, this step helps in whom
      // submitted first.

      setFetching(true);
      getTaskItemDetailAPI(tid, onSuccess, onError, onDone, onUnauthorized);
    }

    return () => {
      mounted = false;
    };
  }, [tid]);

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
                <Link to="/admin/tasks" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faTasks} />
                  &nbsp;Tasks
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCircleInfo} />
                  &nbsp;Task&nbsp;Detail
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
                <Link to="/admin/tasks" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Tasks
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page banner */}
          {task && task.status === 2 && (
            <AlertBanner message="Archived" status="info" />
          )}

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faTasks} />
            &nbsp;Task
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faCircleInfo} />
            &nbsp;Detail
          </h4>
          <hr />

          {/* Progress Wizard*/}
          <nav className="box has-background-success-light">
            <p className="subtitle is-5">Step 5 of 5</p>
            <progress class="progress is-success" value="100" max="100">
              100%
            </progress>
          </nav>

          {/* Page */}
          <nav className="box">
            {/* Title + Options */}
            {task && (
              <div className="columns">
                <div className="column">
                  <p className="title is-4">
                    <FontAwesomeIcon className="fas" icon={faTable} />
                    &nbsp;Task Detail - Order Completion
                  </p>
                </div>
                <div className="column has-text-right"></div>
              </div>
            )}

            {/* <p className="pb-4">Please fill out all the required fields before submitting this form.</p> */}

            {isFetching ? (
              <PageLoadingContent displayMessage={"Loading..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />

                {task && (
                  <div className="container">
                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Task Detail
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Type
                          </th>
                          <td>Order Completion</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Description
                          </th>
                          <td>{task.description}</td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job #
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={task.orderWjid}
                              urlValue={`/admin/order/${task.orderWjid}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Start Date
                          </th>
                          <td>
                            <DateTextFormatter value={task.orderStartDate} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Description
                          </th>
                          <td>
                            {task.orderDescription ? (
                              task.orderDescription
                            ) : (
                              <>-</>
                            )}
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Skill Sets
                          </th>
                          <td>
                            <SkillSetsTextFormatter
                              skillSets={task.orderSkillSets}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Job Tags
                          </th>
                          <td>
                            <TagsTextFormatter tags={task.orderTags} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Client Name
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={task.customerName}
                              urlValue={`/admin/client/${task.customerId}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        {task.customerPhone && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Client Phone Number (
                              {CLIENT_PHONE_TYPE_OF_MAP[task.customerPhoneType]}
                              ):
                            </th>
                            <td>
                              <PhoneTextFormatter value={task.customerPhone} />
                              {task.customerPhoneExtension && (
                                <>&nbsp;{task.customerPhoneExtension}</>
                              )}
                            </td>
                          </tr>
                        )}
                        {task.customerFullAddressUrl && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Client Address
                            </th>
                            <td>
                              <URLTextFormatter
                                urlKey={
                                  task.customerFullAddressWithoutPostalCode
                                }
                                urlValue={task.customerFullAddressUrl}
                                type={`external`}
                              />
                            </td>
                          </tr>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Client Tags
                          </th>
                          <td>
                            <TagsTextFormatter tags={task.customerTags} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={task.associateName}
                              urlValue={`/admin/associate/${task.associateID}`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        {task.associatePhone && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Associate Phone Number (
                              {
                                CLIENT_PHONE_TYPE_OF_MAP[
                                  task.associatePhoneType
                                ]
                              }
                              ):
                            </th>
                            <td>
                              <PhoneTextFormatter value={task.associatePhone} />
                              {task.associatePhoneExtension && (
                                <>&nbsp;{task.associatePhoneExtension}</>
                              )}
                            </td>
                          </tr>
                        )}
                        {task.associateFullAddressUrl && (
                          <tr>
                            <th
                              className="has-background-light"
                              style={{ width: "30%" }}
                            >
                              Associate Address
                            </th>
                            <td>
                              <URLTextFormatter
                                urlKey={
                                  task.associateFullAddressWithoutPostalCode
                                }
                                urlValue={task.associateFullAddressUrl}
                                type={`external`}
                              />
                            </td>
                          </tr>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Associate Tags
                          </th>
                          <td>
                            <TagsTextFormatter tags={task.associateTags} />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Comments
                          </th>
                          <td>
                            <URLTextFormatter
                              urlKey={`View comments`}
                              urlValue={`/admin/order/${task.orderWjid}/comments`}
                              type={`external`}
                            />
                          </td>
                        </tr>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Task Created At
                          </th>
                          <td>
                            <DateTimeTextFormatter value={task.createdAt} />
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="is-fullwidth table">
                      <thead>
                        <tr className="has-background-black">
                          <th className="has-text-white" colSpan="2">
                            Form Submission
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Was this job successfully completed by the
                            Associate?
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={addTaskItemOrderCompletion.wasCompleted}
                            />
                          </td>
                        </tr>
                        {addTaskItemOrderCompletion.wasCompleted === 1 && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Completion Date
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={
                                    addTaskItemOrderCompletion.completionDate
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Reason Comment
                              </th>
                              <td>
                                {addTaskItemOrderCompletion.reasonComment}
                              </td>
                            </tr>
                          </>
                        )}
                        {addTaskItemOrderCompletion.wasCompleted === 2 && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Reason for cancellation
                              </th>
                              <td>
                                <SelectTextFormatter
                                  selectedValue={
                                    addTaskItemOrderCompletion.reason
                                  }
                                  options={
                                    TASK_ITEM_ORDER_CANCEL_REASON_OPTIONS_WITH_EMPTY_OPTION
                                  }
                                />
                              </td>
                            </tr>
                            {addTaskItemOrderCompletion.reason === 1 && (
                              <tr>
                                <th
                                  className="has-background-light"
                                  style={{ width: "30%" }}
                                >
                                  Reason for cancellation (Other)
                                </th>
                                <td>
                                  {addTaskItemOrderCompletion.reasonOther}
                                </td>
                              </tr>
                            )}
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Closing Reason Comment
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.closingReasonComment
                                }
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Was there financials inputted?
                          </th>
                          <td>
                            <CheckboxTextFormatter
                              checked={
                                addTaskItemOrderCompletion.hasInputtedFinancials === 1
                              }
                            />
                          </td>
                        </tr>
                        {addTaskItemOrderCompletion.hasInputtedFinancials ===
                          1 && (
                          <>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Who was paid for this job?
                              </th>
                              <td>
                                <RadioTextFormatter
                                  value={
                                    addTaskItemOrderCompletion.invoicePaidTo
                                  }
                                  opt1Value={1}
                                  opt1Label={`Associate`}
                                  opt2Value={2}
                                  opt2Label={`Organization`}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                What is the service fee payment status of this job?
                              </th>
                              <td>
                                <RadioTextFormatter
                                  value={
                                    addTaskItemOrderCompletion.paymentStatus
                                  }
                                  opt1Value={ORDER_STATUS_COMPLETED_AND_PAID}
                                  opt1Label={`Paid`}
                                  opt2Value={ORDER_STATUS_COMPLETED_BUT_UNPAID}
                                  opt2Label={`Unpaid`}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Completion Date
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={
                                    addTaskItemOrderCompletion.completionDate
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Invoice date
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={addTaskItemOrderCompletion.invoiceDate}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Invoice IDs
                              </th>
                              <td>{addTaskItemOrderCompletion.invoiceIDs}</td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Quoted Labour
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceQuotedLabourAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Quoted Materials
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceQuotedMaterialAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Quoted Other Costs
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceQuotedOtherCostsAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Total Quoted
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceTotalQuoteAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Labour
                              </th>
                              <td>
                                {addTaskItemOrderCompletion.invoiceLabourAmount}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Material
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceMaterialAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Other Costs
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceOtherCostsAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Tax
                              </th>
                              <td>
                                {addTaskItemOrderCompletion.invoiceTaxAmount}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Total Amount
                              </th>
                              <td>
                                {addTaskItemOrderCompletion.invoiceTotalAmount}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Deposit Amount
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceDepositAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Amount Amount
                              </th>
                              <td>
                                {addTaskItemOrderCompletion.invoiceAmountDue}
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Service Fee
                              </th>
                              <td>
                                <ServiceFeeIDsTextFormatter
                                  serviceFees={[
                                    addTaskItemOrderCompletion.invoiceServiceFeeID,
                                  ]}
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Required Service Fee Amount
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceServiceFeeAmount
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Invoice service fee payment date
                              </th>
                              <td>
                                <DateTextFormatter
                                  value={
                                    addTaskItemOrderCompletion.invoiceServiceFeePaymentDate
                                  }
                                />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Actual Service Fee Paid
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceActualServiceFeeAmountPaid
                                }
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Payment Method
                              </th>
                              <td>
                              <MultiSelectTextFormatter
                                selectedValues={addTaskItemOrderCompletion.paymentMethods}
                                options={ORDER_INVOICE_PAYMENT_METHODS_OPTIONS}
                              />
                              </td>
                            </tr>
                            <tr>
                              <th
                                className="has-background-light"
                                style={{ width: "30%" }}
                              >
                                Balance Owing Amount
                              </th>
                              <td>
                                {
                                  addTaskItemOrderCompletion.invoiceBalanceOwingAmount
                                }
                              </td>
                            </tr>
                          </>
                        )}
                        <tr>
                          <th
                            className="has-background-light"
                            style={{ width: "30%" }}
                          >
                            Comment
                          </th>
                          <td>{addTaskItemOrderCompletion.comment}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="columns pt-5">
                      <div className="column is-half">
                        {(addTaskItemOrderCompletion && addTaskItemOrderCompletion.hasInputtedFinancials === 1) ? (
                            <Link
                              className="button is-fullwidth-mobile"
                              to={`/admin/task/${tid}/order-completion/step-4`}
                            >
                              <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                              &nbsp;Back to Step 4
                            </Link>
                        ) : (
                            <Link
                              className="button is-fullwidth-mobile"
                              to={`/admin/task/${tid}/order-completion/step-3`}
                            >
                              <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                              &nbsp;Back to Step 3
                            </Link>
                        )}
                      </div>
                      <div className="column is-half has-text-right">
                        <button
                          onClick={onSubmitClick}
                          className="button is-primary is-fullwidth-mobile"
                          type="button"
                        >
                          <FontAwesomeIcon
                            className="fas"
                            icon={faCheckCircle}
                          />
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

export default AdminTaskItemOrderCompletionStep5;
