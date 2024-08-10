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
  faUniversity,
  faGauge,
  faPencil,
  faUsers,
  faIdCard,
  faAddressBook,
  faContactCard,
  faChartPie,
  faBuilding,
  faClose,
  faCogs
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


function AdminSettingNOCSearch() {
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
  const [filterByOrder, setFilterByOrder] = useState(false);
  const [filterByCustomer, setFilterByCustomer] = useState(false);
  const [filterByAssociate, setFilterByAssociate] = useState(false);
  const [showCancelWarning, setShowCancelWarning] = useState(false);
  const [isAdvancedFiltering, setIsAdvancedFiltering] = useState(false);
  const [unitGroupTitle, setUnitGroupTitle] = useState("");

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    if (
      actualSearchText === "" &&
      unitGroupTitle === ""
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
    let aURL = "/admin/settings/noc/search-result" +
      "?q=" +
      actualSearchText +
      "&ugt=" +
      unitGroupTitle;
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
                <Link to="/admin/settings" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faCogs} />
                  &nbsp;Settings
                </Link>
              </li>
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faUniversity} />
                  &nbsp;National Occupational Classification
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
                <Link to="/admin/settings" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Settings
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faUniversity} />
            &nbsp;National Occupational Classification
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
              &nbsp;Search for existing NOC's:
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

                        <FormInputField
                          label={<u>Unit Group Title</u>}
                          name="unitGroupTitle"
                          placeholder="Search all unit group title"
                          value={unitGroupTitle}
                          errorText={errors && errors.unitGroupTitle}
                          helpText=""
                          onChange={(e) => setUnitGroupTitle(e.target.value)}
                          isRequired={true}
                          maxWidth="380px"
                        />

                      </div>
                    </>
                  )}

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/settings"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Settings
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

export default AdminSettingNOCSearch;
