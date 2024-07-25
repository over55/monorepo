import React from "react";

function DataDisplayRowSelect(props) {
    const { label, selectedValue, options, helpText } = props;

    const option = options.find(
        (option) => option.value === selectedValue
    );

    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>{option && option.label}</p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowSelect;
