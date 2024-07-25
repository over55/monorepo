import React from "react";
import { startCase } from 'lodash';

function FormInputFieldWithButton({ label, name, placeholder, value, type="text", errorText, validationText, helpText, onChange, maxWidth, disabled=false, onButtonClick, buttonLabel }) {
    let classNameText = "input";
    if (errorText) {
        classNameText = "input is-danger";
    }
    return (
        <>
            <label className="label">{label}:</label>
            <div className="field has-addons pb-4">

                <div className="control is-expanded" style={{maxWidth:maxWidth}}>
                    <input className={classNameText}
                            name={name}
                            type={type}
                     placeholder={placeholder}
                           value={value}
                        onChange={onChange}
                        disabled={disabled}
                    autoComplete="off" />
                </div>
                <div className="control">
                    <button className="button is-info"
                          onClick={onButtonClick}
                         disabled={disabled}>{buttonLabel}</button>
                </div>
                {errorText &&
                    <p className="help is-danger">{errorText}</p>
                }
                {helpText &&
                    <p className="help">{helpText}</p>
                }
            </div>
        </>
    );
}

export default FormInputFieldWithButton;
