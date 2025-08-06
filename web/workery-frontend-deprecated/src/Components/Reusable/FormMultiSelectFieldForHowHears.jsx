import React, { useState, useEffect } from "react";
import { startCase } from 'lodash';
import Select from 'react-select'

import { getHowHearAboutUsItemSelectOptionListAPI } from "../../API/HowHearAboutUsItem";
import { getSelectedOptions } from "../../Helpers/selectHelper";


function FormMultiSelectFieldForHowHearAboutUsItems({
    label="HowHearAboutUsItems (Optional)",
    name="howHearAboutUsItems",
    placeholder="Please select howHearAboutUsItems",
    tenantID,
    howHearAboutUsItems,
    setHowHearAboutUsItems,
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
    const [skillSetSelectOptions, setHowHearAboutUsItemSelectOptions] = useState([]);

    ////
    //// API.
    ////

    function onHowHearAboutUsItemSelectOptionsSuccess(response){
        // console.log("onHowHearAboutUsItemSelectOptionsSuccess: Starting...");
        let b = [
            {"value": "", "label": "Please select"},
            ...response
        ]
        setHowHearAboutUsItemSelectOptions(b);
    }

    function onHowHearAboutUsItemSelectOptionsError(apiErr) {
        // console.log("onHowHearAboutUsItemSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onHowHearAboutUsItemSelectOptionsDone() {
        // console.log("onHowHearAboutUsItemSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Event handling.
    ////

    const onHowHearAboutUsItemsChange = (e) => {
        // console.log("onHowHearAboutUsItemsChange, e:",e); // For debugging purposes only.
        let values = [];
        for (let option of e) {
            // console.log("option:",option); // For debugging purposes only.
            values.push(option.value);
        }
        // console.log("onHowHearAboutUsItemsChange, values:",values); // For debugging purposes only.
        setHowHearAboutUsItems(values);
    }


    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getHowHearAboutUsItemSelectOptionListAPI(
                onHowHearAboutUsItemSelectOptionsSuccess,
                onHowHearAboutUsItemSelectOptionsError,
                onHowHearAboutUsItemSelectOptionsDone
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
                           name="howHearAboutUsItems"
                        options={skillSetSelectOptions}
                          value={getSelectedOptions(skillSetSelectOptions, howHearAboutUsItems)}
                    isClearable={false}
                       onChange={onHowHearAboutUsItemsChange}
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

export default FormMultiSelectFieldForHowHearAboutUsItems;
