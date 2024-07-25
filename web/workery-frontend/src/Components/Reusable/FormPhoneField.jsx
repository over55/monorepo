import React from "react";
import Input, { getCountries } from "react-phone-number-input/input";
const { getCode } = require("country-list");

function FormPhoneField({
  label,
  name,
  placeholder,
  selectedCountry,
  selectePhoneNumber,
  errorText,
  validationText,
  helpText,
  onChange,
  disabled,
  maxWidth,
}) {
    try {
        const selectedCountryOrDefaultCountry = selectedCountry ? selectedCountry : "Canada";
        const selectedCountryCode = getCode(selectedCountryOrDefaultCountry);

        //  // For debugging purposes only.
        // console.log("selectedCountryCode:", selectedCountryCode);
        // console.log("selectedCountry:", selectedCountry);

        // DEVELOPERS NOTE:
        // https://github.com/country-regions/react-country-region-selector
        return (
          <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control" style={{ maxWidth: maxWidth }}>
              <Input
                defaultCountry="CA"
                country={selectedCountryCode}
                name={name}
                placeholder={placeholder}
                disabled={disabled}
                className={`input ${errorText && "is-danger"} ${validationText && "is-success"} has-text-black`}
                value={selectePhoneNumber}
                onChange={onChange}
              />
            </div>
            {helpText && <p className="help">{helpText}</p>}
            {errorText && <p className="help is-danger">{errorText}</p>}
          </div>
        );
    } catch(error) {
        console.log("FormPhoneField | selectedCountry:", selectedCountry);
        console.log(error);
        return (
          <div className="field pb-4">
          <b>--- Error with phone ---</b>
          </div>
        );
    }
}

export default FormPhoneField;
