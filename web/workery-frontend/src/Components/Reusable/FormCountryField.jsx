import React from "react";
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';


function FormCountrySelectField({ label, name, placeholder, selectedCountry, errorText, validationText, helpText, onChange, disabled, maxWidth, priorityOptions }) {
    // DEVELOPERS NOTE:
    // https://github.com/country-regions/react-country-region-selector
    try {
        return (
            <div className="field pb-4">
                <label className="label">{label}</label>
                <div className="control" style={{maxWidth:maxWidth}}>
                    <span className="select">
                    <CountryDropdown
                        priorityOptions={priorityOptions}
                        name={name}
                        placeholder={placeholder}
                        disabled={disabled}
                        className={`input ${errorText && 'is-danger'} ${validationText && 'is-success'} has-text-black`}
                        value={selectedCountry}
                        onChange={onChange}
                    />
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
    catch (error) {
        return null;
    }    
}

export default FormCountrySelectField;
