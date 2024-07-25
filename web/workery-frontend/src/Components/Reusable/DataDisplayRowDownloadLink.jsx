import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

function DataDisplayRowDownloadLink(props) {
    const { label, filename="Download File", objectURL, helpText } = props;
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>
                    <a href={objectURL} target="_blank" rel="noreferrer" className="is-fullwidth-mobile"><FontAwesomeIcon className="fas" icon={faDownload} />&nbsp;{filename}</a>
                </p>
                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowDownloadLink;
