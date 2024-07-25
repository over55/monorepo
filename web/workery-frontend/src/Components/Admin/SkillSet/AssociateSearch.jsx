import React, { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import Scroll from "react-scroll";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGraduationCap,
  faArrowLeft,
  faSearch,
  faTasks,
  faTachometer,
  faPlus,
  faTimesCircle,
  faCheckCircle,
  faHardHat,
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

import {
  getAssociateDetailAPI,
  postAssociateCreateAPI,
} from "../../../API/Associate";
import FormErrorBox from "../../Reusable/FormErrorBox";
import FormMultiSelectFieldForSkillSets from "../../Reusable/FormMultiSelectFieldForSkillSets";
import FormRadioField from "../../Reusable/FormRadioField";
import PageLoadingContent from "../../Reusable/PageLoadingContent";
import {
  addAssociateState,
  ADD_ASSOCIATE_STATE_DEFAULT,
} from "../../../AppState";

function AdminAssociateSkillSetSearch() {
  ////
  //// Global state.
  ////

  const [addAssociate, setAddAssociate] = useRecoilState(addAssociateState);

  ////
  //// Component states.
  ////

  const [errors, setErrors] = useState({});
  const [isFetching, setFetching] = useState(false);
  const [forceURL, setForceURL] = useState("");
  const [skillSets, setSkillSets] = useState([]);
  const [searchType, setSearchType] = useState("");
  const [showCancelWarning, setShowCancelWarning] = useState(false);

  ////
  //// Event handling.
  ////

  const onSubmitClick = (e) => {
    console.log("onSubmitClick: Beginning...");
    let newErrors = {};
    let hasErrors = false;

    if (skillSets === undefined || skillSets === null || skillSets === "") {
      newErrors["skillSets"] = "missing value";
      hasErrors = true;
    } else {
      if (skillSets.length === 0) {
        newErrors["skillSets"] = "missing value";
        hasErrors = true;
      }
    }
    if (searchType === undefined || searchType === null || searchType === "") {
      newErrors["searchType"] = "missing value";
      hasErrors = true;
    }
    if (hasErrors) {
      // Set the associate based error validation.
      setErrors(newErrors);

      // The following code will cause the screen to scroll to the top of
      // the page. Please see ``react-scroll`` for more information:
      // https://github.com/fisshy/react-scroll
      var scroll = Scroll.animateScroll;
      scroll.scrollToTop();

      console.log("onSubmitClick: Ending with error.");
      return;
    }

    setForceURL(
      "/admin/skill-sets/search-results?ssids=" +
        skillSets +
        "&type=" +
        searchType,
    );
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
              <li className="is-active">
                <Link aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faGraduationCap} />
                  &nbsp;Skill Sets
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
                <Link to="/admin/dashboard" aria-current="page">
                  <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                  &nbsp;Back to Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          {/* Page Title */}
          <h1 className="title is-2">
            <FontAwesomeIcon className="fas" icon={faGraduationCap} />
            &nbsp;Skill Sets
          </h1>
          <h4 className="subtitle is-4">
            <FontAwesomeIcon className="fas" icon={faSearch} />
            &nbsp;Search Criteria
          </h4>
          <hr />

          {/* Page */}
          <nav className="box">
            <p className="title is-4">
              <FontAwesomeIcon className="fas" icon={faSearch} />
              &nbsp;Search for existing associate:
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
                  <FormMultiSelectFieldForSkillSets
                    label="Skill Set(s)"
                    name="skillSets"
                    placeholder="Pick skill sets"
                    skillSets={skillSets}
                    setSkillSets={setSkillSets}
                    errorText={errors && errors.skillSets}
                    helpText="Pick the skill sets you want to search associates by."
                    isRequired={true}
                  />

                  <FormRadioField
                    label="Search Type"
                    name="searchType"
                    value={searchType}
                    errorText={errors && errors.searchType}
                    opt1Value="all"
                    opt1Label="Must contain all of the above skill sets"
                    opt2Value="in"
                    opt2Label="Can contain any one of the above skill sets"
                    onChange={(e) => setSearchType(e.target.value)}
                  />

                  <div className="columns pt-5">
                    <div className="column is-half">
                      <Link
                        className="button is-medium is-fullwidth-mobile"
                        to="/admin/dashboard"
                      >
                        <FontAwesomeIcon className="fas" icon={faArrowLeft} />
                        &nbsp;Back to Dashboard
                      </Link>
                    </div>
                    <div className="column is-half has-text-right">
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

export default AdminAssociateSkillSetSearch;
