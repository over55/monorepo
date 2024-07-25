import React from "react";
import { startCase } from 'lodash';


function FormSelectField({ label, name, placeholder, selectedValue, errorText, validationText, helpText, onChange, options, disabled, isLoading, maxWidth, disabledValues=[] }) {
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control" style={{maxWidth:maxWidth}}>
                <span className="select">
                    <select className={`input ${errorText && 'is-danger'} ${validationText && 'is-success'} has-text-black`}
                             name={name}
                      placeholder={placeholder}
                         onChange={onChange}
                         disabled={disabled}
                        isLoading={isLoading}>
                        {options && options.map(function(option, i){
                            return <option key={`${name}-${option.value}`} disabled={disabledValues.includes(option.value)} selected={selectedValue === option.value} value={option.value}>{option.label}</option>;
                        })}
                    </select>
                </span>
            </div>
            {helpText &&
                <p className="help">{helpText}</p>
            }
            {errorText &&
                <p className="help is-danger">{errorText}</p>
            }
        </div>
    );
}

export default FormSelectField;
