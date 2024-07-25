import React from "react";

function FormTextListRow(props) {
    const { label, value, helpText } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                {value && value.map(function(line, i){
                    return <>
                        <p>{line}</p>
                    </>
                })}
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default FormTextListRow;
