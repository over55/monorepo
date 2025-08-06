import React from "react";
import { startCase } from 'lodash';

function FormInputField({ label, name, placeholder, value, type="text", errorText, validationText, helpText, onChange, maxWidth, disabled=false, readonly=false}) {
    let classNameText = "input";
    if (errorText) {
        classNameText = "input is-danger";
    }
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <input className={classNameText}
                        name={name}
                        type={type}
                 placeholder={placeholder}
                       value={value}
                    onChange={onChange}
                       style={{maxWidth:maxWidth}}
                    disabled={disabled}
                    readonly={readonly === true ? "readonly" : false}
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
