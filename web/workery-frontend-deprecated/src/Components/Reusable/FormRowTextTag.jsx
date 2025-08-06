import React from "react";

function FormTextTagRow(props) {
    const {
        label, value, helpText,
        opt1Value,
        opt1Label,
        opt1Code="is-primary",
        opt2Value,
        opt2Label,
        opt2Code="is-primary",
        opt3Value,
        opt3Label,
        opt3Code="is-primary",
        opt4Value,
        opt4Label,
        opt4Code="is-primary"
    } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                {value === opt1Value && <span className={`tag ${opt1Code}`}>{opt1Label}</span>}
                {value === opt2Value && <span className={`tag ${opt2Code}`}>{opt2Label}</span>}
                {value === opt3Value && <span className={`tag ${opt3Code}`}>{opt3Label}</span>}
                {value === opt4Value && <span className={`tag ${opt4Code}`}>{opt4Label}</span>}
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default FormTextTagRow;
