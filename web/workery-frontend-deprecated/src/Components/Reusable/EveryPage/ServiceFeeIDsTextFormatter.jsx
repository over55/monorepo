import React, { useState, useEffect } from "react";
import { getServiceFeeSelectOptionListAPI } from "../../../API/ServiceFee";
import { getSelectedOptions } from "../../../Helpers/selectHelper";


function ServiceFeeIDsTextFormatter(props) {

    ////
    //// Props.
    ////

    const {
        serviceFees=[],
    } = props;

    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [serviceFeeOptions, setServiceFeeOptions] = useState([]);
    const [selectedServiceFeeOptions, setSelectedServiceFeeOptions] = useState([]);

    ////
    //// API.
    ////

    function onSuccess(response){
        // STEP 1: Convert the API responses to be saved.

        // console.log("onServiceFeeSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]

        // STEP 2: Save serviceFee options.
        setServiceFeeOptions(b);

        // STEP 3: Get all the selected options.
        const so = getSelectedOptions(b, serviceFees);

        // For debugging purposes only.
        console.log("serviceFeeOptions:", b);
        console.log("serviceFees:", serviceFees);
        console.log("so:", so);

        // STEP 4: Save the selected serviceFee options.
        setSelectedServiceFeeOptions(so);
    }

    function onError(apiErr) {
        // console.log("onServiceFeeSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onDone() {
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
        <>
            {selectedServiceFeeOptions && selectedServiceFeeOptions.map(function(datum, i){
                return <span className="serviceFee is-success mr-2 mb-2">{datum.label}</span>;
            })}
        </>
    );
}

export default ServiceFeeIDsTextFormatter;
