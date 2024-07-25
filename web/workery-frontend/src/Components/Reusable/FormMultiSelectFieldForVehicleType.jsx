import React, { useState, useEffect } from "react";
import { startCase } from 'lodash';
import Select from 'react-select'

import { getVehicleTypeSelectOptionListAPI } from "../../API/VehicleType";
import { getSelectedOptions } from "../../Helpers/selectHelper";


function FormMultiSelectFieldForVehicleTypes({
    label="VehicleTypes (Optional)",
    name="vehicleType",
    placeholder="Please select insurance requirements",
    tenantID,
    vehicleTypes,
    setVehicleTypes,
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
    const [vehicleTypeSelectOptions, setVehicleTypeSelectOptions] = useState([]);

    ////
    //// API.
    ////

    function onVehicleTypeSelectOptionsSuccess(response){
        // console.log("onVehicleTypeSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]
        setVehicleTypeSelectOptions(b);
    }

    function onVehicleTypeSelectOptionsError(apiErr) {
        // console.log("onVehicleTypeSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onVehicleTypeSelectOptionsDone() {
        // console.log("onVehicleTypeSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Event handling.
    ////

    const onVehicleTypesChange = (e) => {
        // console.log("onVehicleTypesChange, e:",e); // For debugging purposes only.
        let values = [];
        for (let option of e) {
            // console.log("option:",option); // For debugging purposes only.
            values.push(option.value);
        }

        // console.log("onVehicleTypesChange, values:",values); // For debugging purposes only.
        setVehicleTypes(values);
    }


    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getVehicleTypeSelectOptionListAPI(
                onVehicleTypeSelectOptionsSuccess,
                onVehicleTypeSelectOptionsError,
                onVehicleTypeSelectOptionsDone
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
                           name="vehicleTypes"
                        options={vehicleTypeSelectOptions}
                          value={getSelectedOptions(vehicleTypeSelectOptions, vehicleTypes)}
                    isClearable={false}
                       onChange={onVehicleTypesChange}
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

export default FormMultiSelectFieldForVehicleTypes;
