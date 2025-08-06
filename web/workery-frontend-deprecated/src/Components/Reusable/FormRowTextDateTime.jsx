import React from "react";
import DateTimeTextFormatter from "./EveryPage/DateTimeTextFormatter";


function FormTextDateTimeRow(props) {
    const { label, value, helpText } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
            <p>{value ? <DateTimeTextFormatter value={value} /> : "-"}</p>
            {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default FormTextDateTimeRow;
