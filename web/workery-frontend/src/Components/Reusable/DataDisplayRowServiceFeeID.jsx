import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { getServiceFeeSelectOptionListAPI } from "../../API/ServiceFee";
import { getSelectedOptions } from "../../Helpers/selectHelper";


function DataDisplayRowServiceFeeID(props) {

    ////
    //// Props.
    ////

    const {
        label="Service Fee",
        serviceFeeID,
        helpText,
    } = props;

    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [sfOptions, setHhOptions] = useState([]);
    const [sfOption, setSFOption] = useState(null);

    ////
    //// API.
    ////

    function onSuccess(response){
        // STEP 1: Convert the API responses to be saved.

        // console.log("onTagSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]

        // STEP 2: Save tag options.
        setHhOptions(b);

        // STEP 3: Get all the selected options.
        const sfs = getSelectedOptions(b, [serviceFeeID]);

        // // For debugging purposes only.
        // console.log("response:", response);
        // console.log("options:", b);
        // console.log("sfID:", [serviceFeeID]);
        // console.log("sfs:", sfs);

        // STEP 4: Save the selected tag options.
        if (sfs && sfs.length > 0) {
            setSFOption(sfs[0]);
        }
    }

    function onError(apiErr) {
        // console.log("onTagSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onDone() {
        // console.log("onTagSelectOptionsDone: Starting...");
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
                onSuccess,
                onError,
                onDone
            );
        }

        return () => { mounted = false; }
    }, []);

    ////
    //// Component rendering.
    ////

    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>
                    {sfOption !== undefined && sfOption !== null && sfOption !== "" && <>{sfOption.label}</>}
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowServiceFeeID;
