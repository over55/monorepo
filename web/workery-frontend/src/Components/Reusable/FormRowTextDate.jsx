import React from "react";
import DateTextFormatter from "./EveryPage/DateTextFormatter";


function FormTextDateRow(props) {
    const { label, value, helpText } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
            <p>{value ? <DateTextFormatter value={value} /> : "-"}</p>
            {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default FormTextDateRow;
