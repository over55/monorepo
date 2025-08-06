import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function FormDateField({
    label,
    name,
    placeholder,
    value,
    type="text",
    errorText,
    validationText,
    helpText,
    onChange,
    maxWidth,
    disabled=false,
    withPortal=true,
    filterDate=null,
    minDate=null,
    maxDate=null,
    monthsShown=1
}) {
    let dt = null;
    if (value === undefined || value === null || value === "") {
        // Do nothing...
    } else {
        const valueMilliseconds = Date.parse(value);
        dt = new Date(valueMilliseconds);
    }

    let classNameText = "input";
    if (errorText) {
        classNameText = "input is-danger";
    }

    // SPECIAL THANKS:
    // https://reactdatepicker.com/

    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control" style={{maxWidth:maxWidth}}>
                <DatePicker className={classNameText}
                         selected={dt}
                             name={name}
                      placeholder={placeholder}
                         disabled={disabled}
                     autoComplete="off"
                       withPortal={withPortal}
                      isClearable={true}
                showMonthDropdown={true}
                 showYearDropdown={true}
                         portalId={name}
                       filterDate={filterDate}
                          minDate={minDate}
                          maxDate={maxDate}
                      monthsShown={monthsShown}
                     onChange={(date) => onChange(date)}
                       dateFormat="MM/d/yyyy">
                         <div style={{ color: "red" }}>{errorText}</div>
                </DatePicker>
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

export default FormDateField;
