import React, { useState, useEffect } from "react";
import { startCase } from 'lodash';
import Select from 'react-select'

import { getInsuranceRequirementSelectOptionListAPI } from "../../API/InsuranceRequirement";
import { getSelectedOptions } from "../../Helpers/selectHelper";


function FormMultiSelectFieldForInsuranceRequirements({
    label="InsuranceRequirements (Optional)",
    name="insuranceRequirement",
    placeholder="Please select insurance requirements",
    tenantID,
    insuranceRequirements,
    setInsuranceRequirements,
    errorText,
    validationText,
    helpText,
    maxWidth,
    disabled=false })
{

    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [insuranceRequirementSelectOptions, setInsuranceRequirementSelectOptions] = useState([]);

    ////
    //// API.
    ////

    function onInsuranceRequirementSelectOptionsSuccess(response){
        // console.log("onInsuranceRequirementSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]
        setInsuranceRequirementSelectOptions(b);
    }

    function onInsuranceRequirementSelectOptionsError(apiErr) {
        // console.log("onInsuranceRequirementSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onInsuranceRequirementSelectOptionsDone() {
        // console.log("onInsuranceRequirementSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Event handling.
    ////

    const onInsuranceRequirementsChange = (e) => {
        // console.log("onInsuranceRequirementsChange, e:",e); // For debugging purposes only.
        let values = [];
        for (let option of e) {
            // console.log("option:",option); // For debugging purposes only.
            values.push(option.value);
        }

        // console.log("onInsuranceRequirementsChange, values:",values); // For debugging purposes only.
        setInsuranceRequirements(values);
    }


    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getInsuranceRequirementSelectOptionListAPI(
                onInsuranceRequirementSelectOptionsSuccess,
                onInsuranceRequirementSelectOptionsError,
                onInsuranceRequirementSelectOptionsDone
            );
        }

        return () => { mounted = false; }
    }, []);

    ////
    //// Component rendering.
    ////

    let style = {maxWidth:maxWidth};
    if (errorText) {
        style = {maxWidth:maxWidth, borderColor:"red", borderStyle: "solid", borderWidth: "1px"};
    }
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control" style={style}>
                <Select isMulti
                    placeholder={placeholder}
                           name="insuranceRequirements"
                        options={insuranceRequirementSelectOptions}
                          value={getSelectedOptions(insuranceRequirementSelectOptions, insuranceRequirements)}
                    isClearable={false}
                       onChange={onInsuranceRequirementsChange}
                     isDisabled={disabled}
                     isLoading={isFetching}
                />
            </div>
            {errorText &&
                <p className="help is-danger">{errorText}</p>
            }
            {helpText &&
                <p className="help">{helpText}</p>
            }
        </div>


    );
}

export default FormMultiSelectFieldForInsuranceRequirements;
