import React, { useState, useEffect } from "react";
import { getHowHearAboutUsItemSelectOptionListAPI } from "../../API/HowHearAboutUsItem";

/**
EXAMPLE USAGE:

    <FormHowHearField
      howDidYouHearAboutUsID={howDidYouHearAboutUsID}
      setHowDidYouHearAboutUsID={setHowDidYouHearAboutUsID}
      howHearAboutUsItemOther={howHearAboutUsItemOther}
      setHowHearAboutUsItemOther={setHowHearAboutUsItemOther}
      errorText={errors && errors.howDidYouHearAboutUsID}
      helpText="Please select the primary gym location this member will be using"
      maxWidth="310px"
      isHidden={true}
    />
*/
function FormSelectFieldForHowHearAboutUsItem({
    howDidYouHearAboutUsID,
    setHowDidYouHearAboutUsID,
    isHowDidYouHearAboutUsOther, // This variable controls whether this component detected the `Other` option or not.
    setIsHowDidYouHearAboutUsOther,
    errorText,
    validationText,
    helpText,
    disabled,
    isHidden
}) {
    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [howHearOptions, setHowHearOptions] = useState([]);

    ////
    //// Event handling.
    ////

    const setHowDidYouHearAboutUsIDOverride = (howHearID) => {
        // CASE 1: "Other" option selected.
        for (let index in howHearOptions) {
            let howHearOption = howHearOptions[index];
            if (howHearOption.label === "Other" && howHearOption.value === howHearID) {
                // console.log("FormSelectFieldForHowHearAboutUsItem | howHearID:", howHearID, "| isHowDidYouHearAboutUsOther: true");
                setIsHowDidYouHearAboutUsOther(true);
                setHowDidYouHearAboutUsID(howHearID);
                return;
            }
        }

        // CASE 2: Non-"Other" option selected.
        // console.log("FormSelectFieldForHowHearAboutUsItem | howHearID:", howHearID, "| isHowDidYouHearAboutUsOther: false");
        setIsHowDidYouHearAboutUsOther(false);
        setHowDidYouHearAboutUsID(howHearID);
    }

    ////
    //// API.
    ////

    function onHowHearSelectOptionsSuccess(response){
        // console.log("onHowHearSelectOptionsSuccess: Starting...");
        let b = [
            {"value": "", "label": "Please select"},
            ...response
        ]
        setHowHearOptions(b);

        // Set `isHowDidYouHearAboutUsOther` if the user selected the `other` label.
        for (let index in response) {
            let howHearOption = response[index];
            if (howHearOption.label === "Other" && howHearOption.value === howDidYouHearAboutUsID) {
                setIsHowDidYouHearAboutUsOther(true);
                console.log("FormSelectFieldForHowHearAboutUsItem | picked other | howHearID:", howDidYouHearAboutUsID);
                return;
            }
        }
    }

    function onHowHearSelectOptionsError(apiErr) {
        // console.log("onHowHearSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onHowHearSelectOptionsDone() {
        // console.log("onHowHearSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getHowHearAboutUsItemSelectOptionListAPI(
                onHowHearSelectOptionsSuccess,
                onHowHearSelectOptionsError,
                onHowHearSelectOptionsDone
            );
        }

        return () => { mounted = false; }
    }, []);

    ////
    //// Component rendering.
    ////

    // Render the JSX component.
    return (
        <>
            <div className={`field pb-4 ${isHidden && "is-hidden"}`} key={howDidYouHearAboutUsID}>
                <label className="label">How did you hear about us?</label>
                <div className="control">
                    <span className="select">
                        {howHearOptions.length > 0 &&
                            <select className={`input ${errorText && 'is-danger'} ${validationText && 'is-success'} has-text-black`}
                                     name={`howDidYouHearAboutUsID`}
                              placeholder={`Pick howHear location`}
                                 onChange={(e,c)=>setHowDidYouHearAboutUsIDOverride(e.target.value)}
                                 disabled={disabled}>
                                {howHearOptions && howHearOptions.length > 0 && howHearOptions.map(function(option, i){
                                    return <option selected={howDidYouHearAboutUsID === option.value} value={option.value} name={option.label}>{option.label}</option>;
                                })}
                            </select>
                        }
                    </span>
                </div>
                {helpText &&
                    <p className="help">{helpText}</p>
                }
                {errorText &&
                    <p className="help is-danger">{errorText}</p>
                }
            </div>
        </>
    );
}

export default FormSelectFieldForHowHearAboutUsItem;
