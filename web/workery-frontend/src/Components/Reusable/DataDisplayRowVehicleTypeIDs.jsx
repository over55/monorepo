import React, { useState, useEffect } from "react";
import { getVehicleTypeSelectOptionListAPI } from "../../API/VehicleType";
import { getSelectedOptions } from "../../Helpers/selectHelper";

function DataDisplayRowVehicleTypeIDs(props) {

    ////
    //// Props.
    ////

    const {
        label="Skill Sets",
        vehicleTypes=[],
        helpText=""
    } = props;

    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [vehicleTypeOptions, setVehicleTypeOptions] = useState([]);
    const [selectedVehicleTypeOptions, setSelectedVehicleTypeOptions] = useState([]);

    ////
    //// API.
    ////

    function onSuccess(response){
        // STEP 1: Convert the API responses to be saved.

        // console.log("onVehicleTypeSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]

        // STEP 2: Save vehicleType options.
        setVehicleTypeOptions(b);

        // STEP 3: Get all the selected options.
        const so = getSelectedOptions(b, vehicleTypes);

        // For debugging purposes only.
        console.log("vehicleTypeOptions:", b);
        console.log("vehicleTypes:", vehicleTypes);
        console.log("so:", so);

        // STEP 4: Save the selected vehicleType options.
        setSelectedVehicleTypeOptions(so);
    }

    function onError(apiErr) {
        // console.log("onVehicleTypeSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onDone() {
        // console.log("onVehicleTypeSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getVehicleTypeSelectOptionListAPI(
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
                    {selectedVehicleTypeOptions && selectedVehicleTypeOptions.map(function(datum, i){
                        return <span className="tag is-medium is-success mr-2 mb-2">{datum.label}</span>;
                    })}
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowVehicleTypeIDs;
