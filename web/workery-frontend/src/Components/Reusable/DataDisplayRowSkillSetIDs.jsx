import React, { useState, useEffect } from "react";
import { getSkillSetSelectOptionListAPI } from "../../API/SkillSet";
import { getSelectedOptions } from "../../Helpers/selectHelper";

function DataDisplayRowSkillSetIDs(props) {

    ////
    //// Props.
    ////

    const {
        label="Skill Sets",
        skillSets=[],
        helpText=""
    } = props;

    ////
    //// Component states.
    ////

    const [errors, setErrors] = useState({});
    const [isFetching, setFetching] = useState(false);
    const [skillSetOptions, setSkillSetOptions] = useState([]);
    const [selectedSkillSetOptions, setSelectedSkillSetOptions] = useState([]);

    ////
    //// API.
    ////

    function onSuccess(response){
        // STEP 1: Convert the API responses to be saved.

        // console.log("onSkillSetSelectOptionsSuccess: Starting...");
        let b = [
            // {"value": "", "label": "Please select"},
            ...response
        ]

        // STEP 2: Save skillSet options.
        setSkillSetOptions(b);

        // STEP 3: Get all the selected options.
        const so = getSelectedOptions(b, skillSets);

        // // For debugging purposes only.
        // console.log("skillSetOptions:", b);
        // console.log("skillSets:", skillSets);
        // console.log("so:", so);

        // STEP 4: Save the selected skillSet options.
        setSelectedSkillSetOptions(so);
    }

    function onError(apiErr) {
        // console.log("onSkillSetSelectOptionsError: Starting...");
        setErrors(apiErr);
    }

    function onDone() {
        // console.log("onSkillSetSelectOptionsDone: Starting...");
        setFetching(false);
    }

    ////
    //// Misc.
    ////

    useEffect(() => {
        let mounted = true;

        if (mounted) {
            setFetching(true);
            getSkillSetSelectOptionListAPI(
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
                    {selectedSkillSetOptions && selectedSkillSetOptions.map(function(datum, i){
                        return <span className="tag is-medium is-success mr-2 mb-2">{datum.label}</span>;
                    })}
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowSkillSetIDs;
