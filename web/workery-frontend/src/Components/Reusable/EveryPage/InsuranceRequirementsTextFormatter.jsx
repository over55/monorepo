import React from "react";

function InsuranceRequirementsTextFormatter(props) {

    ////
    //// Props.
    ////

    const {
        insuranceRequirements=[],
    } = props;


    ////
    //// Component rendering.
    ////

    return (
        <>
            {insuranceRequirements && insuranceRequirements.map(function(datum, i){
                return <span className="tag is-medium is-success mr-2 mb-2">{datum.name}</span>;
            })}
        </>
    );
}

export default InsuranceRequirementsTextFormatter;
