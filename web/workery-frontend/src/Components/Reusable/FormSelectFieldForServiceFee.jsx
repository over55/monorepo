import React, { useState, useEffect } from "react";
import { getServiceFeeSelectOptionListAPI } from "../../API/ServiceFee";

/**
EXAMPLE USAGE:

    <FormServiceFeeField
      serviceFeeID={serviceFeeID}
      setServiceFeeID={setServiceFeeID}
      serviceFeeOther={serviceFeeOther}
      setServiceFeeOther={setServiceFeeOther}
      errorText={errors && errors.serviceFeeID}
      helpText="Please select the primary gym location this member will be using"
      maxWidth="310px"
      isHidden={true}
    />
*/
function FormSelectFieldForServiceFee({
    serviceFeeID,
    setServiceFeeID,
    isServiceFeeOther, // This variable controls whether this component detected the `Other` option or not.
    setIsServiceFeeOther,
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
    const [serviceFeeOptions, setServiceFeeOptions] = useState([]);

    ////
    //// Event handling.
    ////

    const setServiceFeeIDOverride = (serviceFeeID) => {
        // CASE 1: "Other" option selected.
        for (let index in serviceFeeOptions) {
            let serviceFeeOption = serviceFeeOptions[index];
            if (serviceFeeOption.label === "Other" && serviceFeeOption.value === serviceFeeID) {
                // console.log("FormSelectFieldForServiceFee | serviceFeeID:", serviceFeeID, "| isServiceFeeOther: true");
                setIsServiceFeeOther(true);
                setServiceFeeID(serviceFeeID);
                return;
            }
        }

        // CASE 2: Non-"Other" option selected.
        // console.log("FormSelectFieldForServiceFee | serviceFeeID:", serviceFeeID, "| isServiceFeeOther: false");
        setIsServiceFeeOther(false);
        setServiceFeeID(serviceFeeID);
    }

    ////
    //// API.
    ////

    function onServiceFeeSelectOptionsSuccess(response){
        // console.log("onServiceFeeSelectOptionsSuccess: Starting...");
        let b = [
            {"value": "", "label": "Please select"},
            ...response
        ]
        setServiceFeeOptions(b);

        // Set `isServiceFeeOther` if the user selected the `other` label.
        for (let index in response) {
            let serviceFeeOption = response[index];
            if (serviceFeeOption.label === "Other" && serviceFeeOption.value === serviceFeeID) {
                setIsServiceFeeOther(true);
                // console.log("FormSelectFieldForServiceFee | picked other | serviceFeeID:", serviceFeeID);
                return;
            }
        }
    }

    function onServiceFeeSelectOptionsError(apiErr) {
        // console.log("onServiceFeeSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onServiceFeeSelectOptionsDone() {
        // console.log("onServiceFeeSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getServiceFeeSelectOptionListAPI(
                onServiceFeeSelectOptionsSuccess,
                onServiceFeeSelectOptionsError,
                onServiceFeeSelectOptionsDone
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
            <div className={`field pb-4 ${isHidden && "is-hidden"}`} key={serviceFeeID}>
                <label className="label">Service Fee</label>
                <div className="control">
                    <span className="select">
                        {serviceFeeOptions.length > 0 &&
                            <select className={`input ${errorText && 'is-danger'} ${validationText && 'is-success'} has-text-black`}
                                     name={`serviceFeeID`}
                              placeholder={`Pick serviceFee location`}
                                 onChange={(e,c)=>setServiceFeeIDOverride(e.target.value)}
                                 disabled={disabled}>
                                {serviceFeeOptions && serviceFeeOptions.length > 0 && serviceFeeOptions.map(function(option, i){
                                    return <option selected={serviceFeeID === option.value} value={option.value} name={option.label}>{option.label}</option>;
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

export default FormSelectFieldForServiceFee;
