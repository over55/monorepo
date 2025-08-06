import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimesCircle, faCheckCircle, } from '@fortawesome/free-solid-svg-icons'

function DataDisplayRowCheckbox(props) {
    const { label, checked, helpText } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>
                {checked
                    ?
                    <>
                       <FontAwesomeIcon className="fas" icon={faCheckCircle} />&nbsp;Yes
                    </>
                    :
                    <>
                        <FontAwesomeIcon className="fas" icon={faTimesCircle} />&nbsp;No
                    </>
                }
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowCheckbox;
