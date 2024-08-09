import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHardHat,
  faUserCircle,
  faFilter,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faWrench,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { useRecoilState } from "recoil";

import { getOrderDetailAPI, postOrderCreateAPI } from "../../../../API/Order";
import FormErrorBox from "../../../Reusable/FormErrorBox";
import FormInputField from "../../../Reusable/FormInputField";
import FormTextareaField from "../../../Reusable/FormTextareaField";
import FormRadioField from "../../../Reusable/FormRadioField";
import FormMultiSelectField from "../../../Reusable/FormMultiSelectField";
import FormSelectField from "../../../Reusable/FormSelectField";
import FormCheckboxField from "../../../Reusable/FormCheckboxField";
import FormPhoneField from "../../../Reusable/FormPhoneField";
import PageLoadingContent from "../../../Reusable/PageLoadingContent";
import {
  addOrderState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../../AppState";


function AdminSettingNAICSSearch() {
  ////
  //// Global state.
  ////

  const [addOrder, setAddOrder] = useRecoilState(addOrderState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [actualSearchText, setActualSearchText] = useState("");
  const [accountType, setAccountType] = useState(0);
  const [filterByOrder, setFilterByOrder] = useState(false);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByAssociate, setFilterByAssociate] = useState(false);
  const [customerOrganizationName, setCustomerOrganizationName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [associateOrganizationName, setAssociateOrganizationName] =
    useState("");
  const [associateEmail, setAssociateEmail] = useState("");
  const [associatePhone, setAssociatePhone] = useState("");
  const [associateFirstName, setAssociateFirstName] = useState("");
  const [associateLastName, setAssociateLastName] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [orderWjid, setOrderWjid] = useState("");
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [country] = useState(addOrder.country);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    if (
      customerOrganizationName === "" &&
      customerFirstName === "" &&
      customerLastName === "" &&
      customerEmail === "" &&
      customerPhone === "" &&
      actualSearchText === "" &&
      associateOrganizationName === "" &&
      associateFirstName === "" &&
      associateLastName === "" &&
      associateEmail === "" &&
      associatePhone === "" &&
      orderWjid === ""
    ) {
      setErrors({
        message: "please enter a value",
      });
      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();
      return;
    }
    let aURL = "/admin/settings/naics/search-result?cfn=" +
      customerFirstName +
      "&cln=" +
      customerLastName +
      "&ce=" +
      customerEmail +
      "&cp=" +
      encodeURIComponent(customerPhone) +
      "&con=" +
      customerOrganizationName +
      "&q=" +
      actualSearchText +
      "&afn=" +
      associateFirstName +
      "&aln=" +
      associateLastName +
      "&ae=" +
      associateEmail +
      "&ap=" +
      encodeURIComponent(associatePhone) +
      "&aon=" +
      associateOrganizationName +
      "&owjid=" +
      orderWjid;
    setForceURL(aURL);
  };

  ////
  //// API.
  ////

  // Nothing.

  ////
  //// Misc.
  ////

  useEffect(() => {
    let mounted = true;

    if (mounted) {
      window.scrollTo(0, 0); // Start the page at the top of the page.

      setFetching(false);
    }

    return () => {
      mounted = false;
    };
  }, []);
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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faSearch} />
                  &nbsp;Search
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
                <Link to="/admin/orders" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Orders
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faWrench} />
            &nbsp;Orders
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faSearch} />
            &nbsp;Search
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faSearch} />
              &nbsp;Search for existing order:
            </p>

            <p className="has-text-grey pb-4">
              Please enter one or more of the following fields to begin
              searching.
            </p>

            {isFetching ? (
              <PageLoadingContent displayMessage={"Submitting..."} />
            ) : (
              <>
                <FormErrorBox errors={errors} />
                <div className="container">
                  <FormInputField
                    label={<u>Search Keywords</u>}
                    name="actualSearchText"
                    placeholder="Search..."
                    value={actualSearchText}
                    errorText={errors && errors.actualSearchText}
                    helpText=""
                    onChange={(e) => setActualSearchText(e.target.value)}
                    isRequired={true}
                    maxWidth="380px"
                  />

                  {isAdvancedFiltering && (
                    <>
                      <p className="title is-4 has-text-left pb-3">- OR -</p>
                      <div className="has-background-light container p-4">
                        <p className="title is-4">
                          <FontAwesomeIcon className="fas" icon={faFilter} />
                          &nbsp;Advanced Search
                        </p>

                        <FormCheckboxField
                          label="Filter By Customer"
                          name="filterByCustomer"
                          checked={filterByCustomer}
                          errorText={errors && errors.filterByCustomer}
                          onChange={(e, x) =>
                            setFilterByCustomer(!filterByCustomer)
                          }
                          maxWidth="180px"
                        />

                        <FormCheckboxField
                          label="Filter By Associate"
                          name="filterByAssociate"
                          checked={filterByAssociate}
                          errorText={errors && errors.filterByAssociate}
                          onChange={(e, x) =>
                            setFilterByAssociate(!filterByAssociate)
                          }
                          maxWidth="180px"
                        />

                        <FormCheckboxField
                          label="Filter By Order"
                          name="filterByOrder"
                          checked={filterByOrder}
                          errorText={errors && errors.filterByOrder}
                          onChange={(e, x) =>
                            setFilterByOrder(!filterByOrder)
                          }
                          maxWidth="180px"
                        />

                        {filterByCustomer === true && (
                          <>
                            <p className="title is-5">
                              <FontAwesomeIcon
                                className="fas"
                                icon={faUserCircle}
                              />
                              &nbsp;<u>Customer</u>
                            </p>
                            <FormInputField
                              label="First Name"
                              name="customerFirstName"
                              placeholder="Text input"
                              value={customerFirstName}
                              errorText={errors && errors.customerFirstName}
                              helpText=""
                              onChange={(e) =>
                                setCustomerFirstName(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />

                            <FormInputField
                              label="Last Name"
                              name="customerLastName"
                              placeholder="Text input"
                              value={customerLastName}
                              errorText={errors && errors.customerLastName}
                              helpText=""
                              onChange={(e) =>
                                setCustomerLastName(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />

                            <FormInputField
                              label="Email"
                              name="customerEmail"
                              type="email"
                              placeholder="Text input"
                              value={customerEmail}
                              errorText={errors && errors.customerEmail}
                              helpText=""
                              onChange={(e) => setCustomerEmail(e.target.value)}
                              isRequired={true}
                              maxWidth="380px"
                            />

                            <FormPhoneField
                              label="Phone"
                              name="customerPhone"
                              placeholder="Text input"
                              selectedCountry={country}
                              selectePhoneNumber={customerPhone}
                              errorText={errors && errors.customerPhone}
                              helpText=""
                              onChange={(ph) => {
                                setCustomerPhone(ph);
                              }}
                              isRequired={true}
                              maxWidth="200px"
                            />

                            <FormInputField
                              label="Organization Name"
                              name="customerOrganizationName"
                              placeholder="Text input"
                              value={customerOrganizationName}
                              errorText={
                                errors && errors.customerOrganizationName
                              }
                              helpText=""
                              onChange={(e) =>
                                setCustomerOrganizationName(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />
                          </>
                        )}

                        {filterByAssociate === true && (
                          <>
                            <p className="title is-5">
                              <FontAwesomeIcon
                                className="fas"
                                icon={faHardHat}
                              />
                              &nbsp;<u>Associate</u>
                            </p>
                            <FormInputField
                              label="First Name"
                              name="associateFirstName"
                              placeholder="Text input"
                              value={associateFirstName}
                              errorText={errors && errors.associateFirstName}
                              helpText=""
                              onChange={(e) =>
                                setAssociateFirstName(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />

                            <FormInputField
                              label="Last Name"
                              name="associateLastName"
                              placeholder="Text input"
                              value={associateLastName}
                              errorText={errors && errors.associateLastName}
                              helpText=""
                              onChange={(e) =>
                                setAssociateLastName(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />

                            <FormInputField
                              label="Email"
                              name="associateEmail"
                              type="email"
                              placeholder="Text input"
                              value={associateEmail}
                              errorText={errors && errors.associateEmail}
                              helpText=""
                              onChange={(e) =>
                                setAssociateEmail(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />

                            <FormPhoneField
                              label="Phone"
                              name="associatePhone"
                              placeholder="Text input"
                              selectedCountry={country}
                              selectePhoneNumber={associatePhone}
                              errorText={errors && errors.associatePhone}
                              helpText=""
                              onChange={(ph) => {
                                setAssociatePhone(ph);
                              }}
                              isRequired={true}
                              maxWidth="200px"
                            />

                            <FormInputField
                              label="Organization Name"
                              name="associateOrganizationName"
                              placeholder="Text input"
                              value={associateOrganizationName}
                              errorText={
                                errors && errors.associateOrganizationName
                              }
                              helpText=""
                              onChange={(e) =>
                                setAssociateOrganizationName(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />
                          </>
                        )}

                        {filterByOrder === true && (
                          <>
                            <p className="title is-5">
                              <FontAwesomeIcon
                                className="fas"
                                icon={faWrench}
                              />
                              &nbsp;<u>Order</u>
                            </p>
                            <FormInputField
                              label="Job #"
                              name="orderWjid"
                              placeholder="Text input"
                              value={orderWjid}
                              errorText={errors && errors.orderWjid}
                              helpText=""
                              onChange={(e) =>
                                setOrderWjid(e.target.value)
                              }
                              isRequired={true}
                              maxWidth="380px"
                            />
                          </>
                        )}
                      </div>
                    </>
                  )}

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/orders"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Orders
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
                      <button
                        className={`button is-medium is-fullwidth-mobile ${isAdvancedFiltering ? `is-link` : `is-link is-light`}`}
                        onClick={(e) => {
                          setIsAdvancedFiltering(!isAdvancedFiltering);
                        }}
                      >
                        <FontAwesomeIcon className="fas" icon={faFilter} />
                        &nbsp;Advanced Search
                      </button>
                      &nbsp;
                      <button
                        className="button is-medium is-primary is-fullwidth-mobile"
                        onClick={onSubmitClick}
                      >
                        <FontAwesomeIcon className="fas" icon={faSearch} />
                        &nbsp;Search
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </nav>
        </section>
      </div>
    </>
  );
}

export default AdminSettingNAICSSearch;
