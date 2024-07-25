import React, { useState, useEffect } from "react";
import { getAssociateSelectOptionListAPI } from "../../API/Associate";

/**
EXAMPLE USAGE:

    <FormSelectFieldForAssociate
      associateID={associateID}
      setAssociateID={setAssociateID}
      errorText={errors && errors.associateID}
      helpText="Please select the primary gym location this member will be using"
      maxWidth="310px"
      isHidden={true}
    />
*/
function FormSelectFieldForAssociate({
    associateID,
    setAssociateID,
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
    const [serviceFeeOptions, setAssociateOptions] = useState([]);

    ////
    //// Event handling.
    ////

    const setAssociateIDOverride = (associateID) => {
        setAssociateID(associateID);
    }

    ////
    //// API.
    ////

    function onAssociateSelectOptionsSuccess(response){
        // console.log("onAssociateSelectOptionsSuccess: Starting...");
        let b = [
            {"value": "", "label": "Please select"},
            ...response
        ]
        setAssociateOptions(b);
    }

    function onAssociateSelectOptionsError(apiErr) {
        // console.log("onAssociateSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onAssociateSelectOptionsDone() {
        // console.log("onAssociateSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            let filtersMap=new Map();
            filtersMap.set("status", 1);
            getAssociateSelectOptionListAPI(
                filtersMap,
                onAssociateSelectOptionsSuccess,
                onAssociateSelectOptionsError,
                onAssociateSelectOptionsDone
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
            <div className={`field pb-4 ${isHidden && "is-hidden"}`} key={associateID}>
                <label className="label">Associate</label>
                <div className="control">
                    <span className="select">
                        {serviceFeeOptions.length > 0 &&
                            <select className={`input ${errorText && 'is-danger'} ${validationText && 'is-success'} has-text-black`}
                                     name={`associateID`}
                              placeholder={`Pick associate`}
                                 onChange={(e,c)=>setAssociateIDOverride(e.target.value)}
                                 disabled={disabled}>
                                {serviceFeeOptions && serviceFeeOptions.length > 0 && serviceFeeOptions.map(function(option, i){
                                    return <option selected={associateID === option.value} value={option.value} name={option.label}>{option.label}</option>;
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

export default FormSelectFieldForAssociate;
