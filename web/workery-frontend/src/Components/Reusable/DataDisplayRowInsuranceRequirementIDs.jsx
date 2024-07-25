import React, { useState, useEffect } from "react";
import { getInsuranceRequirementSelectOptionListAPI } from "../../API/InsuranceRequirement";
import { getSelectedOptions } from "../../Helpers/selectHelper";

function DataDisplayRowInsuranceRequirementIDs(props) {

    ////
    //// Props.
    ////

    const {
        label="Insurance Requirements",
        insuranceRequirements=[],
        helpText=""
    } = props;

    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [insuranceRequirementOptions, setInsuranceRequirementOptions] = useState([]);
    const [selectedInsuranceRequirementOptions, setSelectedInsuranceRequirementOptions] = useState([]);

    ////
    //// API.
    ////

    function onSuccess(response){
        // STEP 1: Convert the API responses to be saved.

        // console.log("onInsuranceRequirementSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]

        // STEP 2: Save insuranceRequirement options.
        setInsuranceRequirementOptions(b);

        // STEP 3: Get all the selected options.
        const so = getSelectedOptions(b, insuranceRequirements);

        // For debugging purposes only.
        console.log("insuranceRequirementOptions:", b);
        console.log("insuranceRequirements:", insuranceRequirements);
        console.log("so:", so);

        // STEP 4: Save the selected insuranceRequirement options.
        setSelectedInsuranceRequirementOptions(so);
    }

    function onError(apiErr) {
        // console.log("onInsuranceRequirementSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onDone() {
        // console.log("onInsuranceRequirementSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getInsuranceRequirementSelectOptionListAPI(
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
                    {selectedInsuranceRequirementOptions && selectedInsuranceRequirementOptions.map(function(datum, i){
                        return <span className="tag is-medium is-success mr-2 mb-2">{datum.label}</span>;
                    })}
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowInsuranceRequirementIDs;
