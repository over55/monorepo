import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDownload } from '@fortawesome/free-solid-svg-icons'

function DataDisplayRowImage(props) {
    const { label, filename="Download File", objectURL, helpText, maxWidth } = props;
    console.log("DataDisplayRowImage | objectURL:", objectURL); // For debugging purposes only.
    return (
        <div className="field pb-4">
            <label className="label">{label}</label>
            <div className="control">
                <p>
                    <figure className="image">
                        <a href={objectURL} target="_blank" rel="noreferrer" className="is-fullwidth-mobile">
                            <img src={objectURL}  style={{maxWidth:maxWidth}} />
                        </a>
                    </figure>
                </p>

                {helpText !== undefined && helpText !== null && helpText !== "" && <p className="help">{helpText}</p>}
            </div>
        </div>
    );
}

export default DataDisplayRowImage;
