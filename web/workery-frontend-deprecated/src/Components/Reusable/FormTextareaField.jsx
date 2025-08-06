import React from "react";
function FormInputField({ label, name, placeholder, value, errorText, helpText, onChange, isRequired, maxWidth, rows=2, disabled=false }) {
    let classNameText = "textarea";
    if (errorText) {
        classNameText = "textarea is-danger";
    }
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <textarea className={classNameText}
                               name={name}
                        placeholder={placeholder}
                              value={value}
                           onChange={onChange}
                              style={{maxWidth:maxWidth}}
                               rows={rows}
                           disabled={disabled}
                       autoComplete="off" />
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

export default FormInputField;
