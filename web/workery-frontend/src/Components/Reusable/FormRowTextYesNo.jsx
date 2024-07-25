import React from "react";

function FormTextYesNoRow(props) {
    const { label, checked, helpText } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>{checked ? "Yes" : "No"}</p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default FormTextYesNoRow;
