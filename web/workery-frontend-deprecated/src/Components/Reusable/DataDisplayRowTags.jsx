import React, { useState, useEffect } from "react";

function DataDisplayRowTags(props) {

    ////
    //// Props.
    ////

    const {
        label="Tags (Optional)",
        tags=[],
        helpText=""
    } = props;


    useEffect(() => {
        let mounted = true;

        if (mounted) {
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
                    {tags && tags.map(function(datum, i){
                        return <span className="tag is-medium is-success mr-2 mb-2">{datum.text}</span>;
                    })}
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowTags;
