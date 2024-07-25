import React from "react";
import { CountryDropdown, RegionDropdown, CountryRegionData } from 'react-country-region-selector';


function FormRegionField({ label, name, placeholder, selectedCountry, selectedRegion, errorText, validationText, helpText, onChange, disabled, maxWidth }) {
    // DEVELOPERS NOTE:
    // https://github.com/country-regions/react-country-region-selector
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control" style={{maxWidth:maxWidth}}>
                <span className="select">
                <RegionDropdown
                    name={name}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`input ${errorText && 'is-danger'} ${validationText && 'is-success'} has-text-black`}
                    country={selectedCountry}
                    value={selectedRegion}
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

export default FormRegionField;
